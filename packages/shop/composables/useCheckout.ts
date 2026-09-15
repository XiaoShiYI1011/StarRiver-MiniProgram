import { ref } from "vue";
import { useStudio } from "@/composables/useStudio";
import { billingApi, newIdempotencyKey } from "@/api/billing";
import { openBind } from "@/utils/navigation";
import { errorMessage } from "@/utils/format";
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
      if (pay) await billingApi.completeSimulatedPayment({ orderId, idempotencyKey: newIdempotencyKey() });
      await refresh();
      selected.value = null;
      uni.showToast({ title: pay ? "支付成功" : "订单已创建，可在订单记录中查看", icon: "none" });
    } catch (reason) {
      error.value = errorMessage(reason);
    } finally {
      busy.value = false;
    }
  };
  return { selected, busy, error, select, selectRecharge, close, confirm };
};
