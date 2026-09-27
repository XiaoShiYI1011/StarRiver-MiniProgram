import { ref } from "vue";
import { useStudio } from "@/composables/useStudio";
import { billingApi, newIdempotencyKey } from "@/api/billing";
import { openBind } from "@/utils/navigation";
import { errorMessage } from "@/utils/format";
import {
  pollOrderPaid,
  requestVirtualPayment,
  VirtualPaymentCancelledError,
} from "@/packages/shop/services/virtualPayment";
import { BillingOrderStatus } from "@/packages/shop/types/billing";
import type { WritingPlanProduct, PlanPurchaseQuote } from "@/types/billing";
import { miniAuthClient } from "@/services/auth/miniAuthClient";
import { getWeChatCode } from "@/services/auth/wechatLogin";

export type CheckoutSelection =
  | { kind: "plan"; product: WritingPlanProduct; quote: PlanPurchaseQuote }
  | { kind: "recharge"; amountFen: number; credits: number };

export const useCheckout = () => {
  const { refresh } = useStudio();
  const selected = ref<CheckoutSelection | null>(null);
  const busy = ref(false);
  const error = ref("");
  let orderId = "";
  let createKey = newIdempotencyKey();
  const reset = () => {
    error.value = "";
    orderId = "";
    createKey = newIdempotencyKey();
  };
  const ensureBound = async (resumeProductId = "") => {
    try {
      if (await miniAuthClient.restore()) return true;
      openBind(resumeProductId);
      return false;
    } catch (reason) {
      uni.showToast({ title: errorMessage(reason), icon: "none" });
      return false;
    }
  };
  const select = async (product: WritingPlanProduct) => {
    if (!(await ensureBound(product.id))) return;
    if (busy.value) return;
    busy.value = true;
    try {
      const quote = await billingApi.quotePlan(product.id);
      selected.value = { kind: "plan", product, quote };
      reset();
    } catch (reason) {
      uni.showToast({ title: errorMessage(reason), icon: "none" });
    } finally {
      busy.value = false;
    }
  };
  const selectRecharge = async (amountFen: number, credits: number) => {
    // 充值不携带恢复参数：绑定流程结束后回到“我的”，重新进入套餐页再操作。
    if (!(await ensureBound())) return;
    if (busy.value) return;
    busy.value = true;
    try {
      const summary = await billingApi.queryCreditSummary();
      if (summary.betaFreeMode) throw new Error("内测期间暂不开放充值");
      if (amountFen < summary.minimumRechargeFen) throw new Error("最低充值金额已更新，请刷新后重新选择");
      const latestCredits = (amountFen / 100) * summary.creditsPerYuan;
      selected.value = { kind: "recharge", amountFen, credits: latestCredits };
      reset();
      if (latestCredits !== credits) error.value = "充值比例已更新，请核对当前到账积分。";
    } catch (reason) {
      uni.showToast({ title: errorMessage(reason), icon: "none" });
    } finally {
      busy.value = false;
    }
  };
  const close = () => {
    if (!busy.value) selected.value = null;
  };
  const confirm = async (pay = true) => {
    const selection = selected.value;
    if (!selection || busy.value) return;
    busy.value = true;
    error.value = "";
    try {
      if (!orderId) {
        const order =
          selection.kind === "plan"
            ? await billingApi.createPlanOrder({
                productId: selection.product.id,
                quoteId: selection.quote.id,
                idempotencyKey: createKey,
                expectedPriceFen: selection.product.priceFen,
                expectedProductVersion: selection.product.editVersion,
              })
            : await billingApi.createCreditOrder({
                amountFen: selection.amountFen,
                expectedGrantedCredits: selection.credits,
                idempotencyKey: createKey,
              });
        orderId = order.id;
        if (order.status === BillingOrderStatus.Paid) {
          await refresh();
          selected.value = null;
          uni.showToast({ title: "套餐升级已生效", icon: "success" });
          return;
        }
      }
      if (!pay) {
        await refresh();
        selected.value = null;
        uni.showToast({ title: "订单已创建，可在订单记录中查看", icon: "none" });
        return;
      }
      // 每次支付前刷新微信登录态，微信拒绝复用单号时提示重新下单。
      const payData = await billingApi.createVirtualPayment({ orderId, wxCode: await getWeChatCode() });
      let cancelled = false;
      try {
        await requestVirtualPayment(payData);
      } catch (reason) {
        if (reason instanceof VirtualPaymentCancelledError) cancelled = true;
        else throw reason;
      }
      // 微信 success 回调不作为到账依据，权益以服务端发货（推送 + 兜底查单）为准。
      const paid = cancelled ? false : await pollOrderPaid(orderId);
      await refresh();
      selected.value = null;
      if (cancelled) uni.showToast({ title: "已取消支付", icon: "none" });
      else uni.showToast({ title: paid ? "支付成功" : "支付结果确认中，到账后可在订单记录查看", icon: "none" });
    } catch (reason) {
      error.value = errorMessage(reason);
      if (selection.kind === "recharge" && (reason as { statusCode?: number }).statusCode === 409) {
        try {
          const summary = await billingApi.queryCreditSummary();
          selected.value = { ...selection, credits: (selection.amountFen / 100) * summary.creditsPerYuan };
          orderId = "";
          createKey = newIdempotencyKey();
          error.value = "充值比例已更新，请核对到账积分后再次确认。";
          await refresh();
        } catch {
          /* 保留原始错误，重新加载成功前不自动支付。 */
        }
      }
      if (selection.kind === "plan" && (reason as { statusCode?: number }).statusCode === 409) {
        try {
          const latest = (await billingApi.queryProducts()).find((item) => item.id === selection.product.id);
          if (latest && latest.purchaseAction !== "unavailable") {
            const quote = await billingApi.quotePlan(latest.id);
            selected.value = { kind: "plan", product: latest, quote };
            orderId = "";
            createKey = newIdempotencyKey();
            error.value = "报价或订阅状态已变化，请核对金额后再次确认；已有待支付订单请在订单记录中处理。";
          }
        } catch {
          /* Keep the original error when a fresh quote is unavailable. */
        }
      }
    } finally {
      busy.value = false;
    }
  };
  return { selected, busy, error, select, selectRecharge, close, confirm };
};
