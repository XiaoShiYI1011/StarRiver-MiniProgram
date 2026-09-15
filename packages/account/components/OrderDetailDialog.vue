<template>
  <AppDialog :open="!!order" title="订单详情" :busy="busy" @close="close">
    <view v-if="order" class="order-detail">
      <text class="detail-name">{{ order.productName }}</text>
      <text class="detail-price">¥{{ formatYuan(order.amountFen) }}</text>
      <text class="muted-text">订单号：{{ order.orderNo }}</text>
      <text v-if="order.grantedCredits" class="muted-text">到账积分：{{ formatNumber(order.grantedCredits) }}</text>
      <text class="muted-text">创建时间：{{ formatDate(order.createdAt) }}</text>
      <text v-if="order.paidAtUtc" class="muted-text">支付时间：{{ formatDate(order.paidAtUtc) }}</text>
      <text class="muted-text">状态：{{ labels[order.status] }}</text>
      <text v-if="error" class="error-text">{{ error }}</text>
    </view>
    <template #actions>
      <view class="dialog-button-stack">
        <button
          v-if="order?.status === BillingOrderStatus.Pending"
          class="primary-button"
          :disabled="busy"
          :loading="busy"
          @tap="pay"
        >
          去支付
        </button>
        <button v-else class="secondary-button" @tap="close">知道了</button>
      </view>
    </template>
  </AppDialog>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import AppDialog from "@/components/ui/AppDialog.vue";
import { refreshDashboard } from "@/composables/useStudio";
import { billingApi, newIdempotencyKey } from "@/api/billing";
import { errorMessage, formatDate, formatNumber, formatYuan } from "@/utils/format";
import { BillingOrderStatus } from "@/packages/account/types/billing";
import type { BillingOrder } from "@/types/billing";

const props = defineProps<{ order: BillingOrder | null }>();
const emit = defineEmits<{ close: [] }>();
const busy = ref(false);
const error = ref("");
const labels: Record<BillingOrderStatus, string> = {
  [BillingOrderStatus.Pending]: "待支付",
  [BillingOrderStatus.Paid]: "已完成",
  [BillingOrderStatus.Cancelled]: "已关闭",
  [BillingOrderStatus.Refunded]: "已退款",
};
watch(
  () => props.order?.id,
  () => {
    error.value = "";
  }
);
const close = () => {
  if (!busy.value) emit("close");
};
const pay = async () => {
  if (!props.order || busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    await billingApi.completeSimulatedPayment({ orderId: props.order.id, idempotencyKey: newIdempotencyKey() });
    await refreshDashboard();
    emit("close");
    uni.showToast({ title: "支付成功", icon: "none" });
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
