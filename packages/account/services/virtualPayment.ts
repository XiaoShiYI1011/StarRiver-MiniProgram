import { billingApi } from "@/api/billing";
import { BillingOrderStatus } from "@/packages/account/types/billing";
import type { VirtualPaymentPayData } from "@/types/billing";

/** 个人主体虚拟支付要求 iOS 微信不低于该版本（Android 无此限制）。 */
const MIN_IOS_WECHAT_VERSION = "8.0.68";

/** 支付取消：用户主动关闭收银台，不算失败。 */
export class VirtualPaymentCancelledError extends Error {
  constructor() {
    super("已取消支付");
    this.name = "VirtualPaymentCancelledError";
  }
}

interface WxRequestVirtualPaymentResult {
  errMsg?: string;
  errCode?: number;
}

/** 比较点分版本号，left 小于 right 返回 -1。 */
export const compareVersion = (left: string, right: string) => {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index++) {
    const delta = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (delta !== 0) return delta < 0 ? -1 : 1;
  }
  return 0;
};

/** iOS 微信版本过低时提前给出可读提示，避免微信侧报出无法理解的错误。 */
const ensurePlatformSupported = () => {
  const info = uni.getSystemInfoSync();
  if (info.platform === "ios" && compareVersion(info.version ?? "", MIN_IOS_WECHAT_VERSION) < 0) {
    throw new Error(`iOS 微信需升级到 ${MIN_IOS_WECHAT_VERSION} 及以上才能使用虚拟支付`);
  }
};

/**
 * 调起微信小程序虚拟支付（道具直购）。
 * payData 由后端签名生成，signData / signature / paySig 必须原样透传。
 * 仅由账户分包调用，避免支付逻辑成为主包中的未使用文件。
 */
export const requestVirtualPayment = (payData: VirtualPaymentPayData) =>
  new Promise<void>((resolve, reject) => {
    // #ifdef MP-WEIXIN
    ensurePlatformSupported();
    const wxApi = (globalThis as { wx?: { requestVirtualPayment?: (options: Record<string, unknown>) => void } }).wx;
    if (typeof wxApi?.requestVirtualPayment !== "function") {
      reject(new Error("当前微信版本不支持虚拟支付，请升级微信后重试"));
      return;
    }
    wxApi.requestVirtualPayment({
      mode: payData.mode,
      signData: payData.signData,
      signature: payData.signature,
      paySig: payData.paySig,
      success: () => resolve(),
      fail: (result: WxRequestVirtualPaymentResult) => {
        if (typeof result?.errMsg === "string" && result.errMsg.includes("cancel"))
          reject(new VirtualPaymentCancelledError());
        else if (result?.errCode === -15002 || result?.errCode === -15012)
          reject(new Error("微信订单已使用或关闭，请返回充值/套餐页重新下单；如已扣款，请先查看订单到账状态"));
        else if (result?.errCode === -15007) reject(new Error("微信登录状态已过期，请重新点击支付以刷新登录状态"));
        else reject(new Error(result?.errMsg || "虚拟支付调起失败，请稍后重试"));
      },
    });
    // #endif
    // #ifndef MP-WEIXIN
    void payData;
    reject(new Error("当前平台暂不支持虚拟支付"));
    // #endif
  });

/** 发货推送和微信查单都存在秒级延迟，支付后轮询服务端确认订单状态。 */
export const pollOrderPaid = async (orderId: string) => {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const order = await billingApi.queryOrder(orderId);
      if (order.status === BillingOrderStatus.Paid) return true;
    } catch {
      // 轮询中的网络错误不中断确认，以下一轮为准。
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return false;
};
