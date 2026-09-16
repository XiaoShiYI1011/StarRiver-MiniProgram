import { ref } from "vue";
import { useStudio } from "@/composables/useStudio";
import { billingApi, newIdempotencyKey } from "@/api/billing";
import { openBind } from "@/utils/navigation";
import { errorMessage } from "@/utils/format";
import { pollOrderPaid, requestVirtualPayment, VirtualPaymentCancelledError } from "@/services/virtualPayment";
import type { WritingPlanProduct } from "@/types/billing";

export type CheckoutSelection =
  { kind: "plan"; product: WritingPlanProduct } | { kind: "recharge"; amountFen: number; credits: number };

export const useCheckout = () => {
  const { isBound, refresh } = useStudio();
  const selected = ref<CheckoutSelection | null>(null);
  const busy = ref(false);
  const error = ref("");
  let orderId = "";
  const reset = () => {
    error.value = "";
    orderId = "";
  };
  const ensureBound = async (resumeProductId = "") => {
    await refresh();
    if (!isBound.value) {
      openBind(resumeProductId);
      return false;
    }
    return true;
  };
  const select = async (product: WritingPlanProduct) => {
    if (!(await ensureBound(product.id))) return;
    selected.value = { kind: "plan", product };
    reset();
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
            ? await billingApi.createPlanOrder({ productId: selection.product.id, idempotencyKey: newIdempotencyKey() })
            : await billingApi.createCreditOrder({
                amountFen: selection.amountFen,
                idempotencyKey: newIdempotencyKey(),
              });
        orderId = order.id;
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
    } finally {
      busy.value = false;
    }
  };
  return { selected, busy, error, select, selectRecharge, close, confirm };
};
