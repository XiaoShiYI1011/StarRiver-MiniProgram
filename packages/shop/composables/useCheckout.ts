import { ref } from "vue";
import { useStudio } from "@/composables/useStudio";
import { billingApi, newIdempotencyKey } from "@/api/billing";
import { openBind } from "@/utils/navigation";
import { errorMessage } from "@/utils/format";
import { pollOrderPaid, requestVirtualPayment, VirtualPaymentCancelledError } from "@/services/virtualPayment";
import { BillingOrderStatus } from "@/types/billing";
import type { WritingPlanProduct, PlanPurchaseQuote } from "@/types/billing";
import { miniAuthClient } from "@/services/auth/miniAuthClient";

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
    selected.value = { kind: "recharge", amountFen, credits };
    reset();
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
      // 同一订单重复发起支付返回同一商户单号，取消后可原单继续支付。
      const payData = await billingApi.createVirtualPayment({ orderId });
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
      if (cancelled) uni.showToast({ title: "已取消支付，可稍后继续支付", icon: "none" });
      else uni.showToast({ title: paid ? "支付成功" : "支付结果确认中，到账后可在订单记录查看", icon: "none" });
    } catch (reason) {
      error.value = errorMessage(reason);
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
