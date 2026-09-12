import { ref } from "vue";
import { useStudio } from "@/composables/useStudio";
import { studioService } from "@/services/studioService";
import { openBind } from "@/utils/navigation";
import { errorMessage } from "@/utils/format";
import type { Product } from "@/types/studio";

export const useCheckout = () => {
  const { isBound, refresh } = useStudio();
  const selected = ref<Product | null>(null);
  const busy = ref(false);
  const error = ref("");
  let orderId = "";
  const select = async (product: Product) => {
    await refresh();
    if (!isBound.value) {
      openBind(product.id);
      return;
    }
    selected.value = product;
    error.value = "";
    orderId = "";
  };
  const close = () => {
    if (!busy.value) selected.value = null;
  };
  const confirm = async (pay = true) => {
    if (!selected.value || busy.value) return;
    busy.value = true;
    error.value = "";
    try {
      if (!orderId) orderId = (await studioService.createOrder(selected.value.id)).id;
      if (pay) await studioService.payOrder(orderId);
      await refresh();
      selected.value = null;
      uni.showToast({ title: pay ? "模拟开通成功" : "订单已保存到我的", icon: "none" });
    } catch (reason) {
      error.value = errorMessage(reason);
    } finally {
      busy.value = false;
    }
  };
  return { selected, busy, error, select, close, confirm };
};
