<template>
  <AppDialog :open="!!order" title="订单详情" :busy="busy" @close="close">
    <view v-if="order" class="order-detail">
      <text class="detail-name">{{ order.name }}</text>
      <text class="detail-price">¥{{ order.price }}</text>
      <text class="muted-text">订单号：{{ order.id }}</text>
      <text class="muted-text">创建时间：{{ order.createdAt }}</text>
      <text class="muted-text">状态：{{ labels[order.status] }}</text>
      <text class="subtle-text">本地演示订单，不会产生真实扣款。</text>
      <text v-if="error" class="error-text">{{ error }}</text>
    </view>
    <template #actions>
      <view class="dialog-button-stack">
        <template v-if="order?.status === 'pending'">
          <button class="primary-button" :disabled="busy" :loading="busy" @tap="updateOrder('pay')">模拟支付</button>
          <button class="secondary-button" :disabled="busy" @tap="updateOrder('cancel')">取消订单</button>
        </template>
        <button v-else class="secondary-button" @tap="close">知道了</button>
      </view>
    </template>
  </AppDialog>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import AppDialog from "@/components/ui/AppDialog.vue";
import { studioService } from "@/services/studioService";
import { refreshDashboard } from "@/composables/useStudio";
import { errorMessage } from "@/utils/format";
import type { Order, OrderStatus } from "@/types/studio";

const props = defineProps<{ order: Order | null }>();
const emit = defineEmits<{ close: [] }>();
const busy = ref(false);
const error = ref("");
const labels: Record<OrderStatus, string> = { completed: "已完成", pending: "待支付", closed: "已关闭" };
watch(
  () => props.order?.id,
  () => {
    error.value = "";
  }
);
const close = () => {
  if (!busy.value) emit("close");
};
const updateOrder = async (action: "pay" | "cancel") => {
  if (!props.order || busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    if (action === "pay") await studioService.payOrder(props.order.id);
    else await studioService.cancelOrder(props.order.id);
    await refreshDashboard();
    emit("close");
    uni.showToast({ title: action === "pay" ? "模拟支付成功" : "订单已取消", icon: "none" });
  } catch (reason) {
    error.value = errorMessage(reason);
  } finally {
    busy.value = false;
  }
};
</script>

<style lang="scss" scoped>
.order-detail {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .detail-name {
    font-size: 32rpx;
    font-weight: 650;
  }

  .detail-price {
    font-size: 56rpx;
    font-weight: 700;
  }
}
</style>
