<template>
  <AppDialog :open="!!order" title="订单详情" :busy="busy" @close="close">
    <view v-if="order" class="order-detail">
      <text class="detail-name">{{ order.productName }}</text>
      <text class="detail-price">¥{{ formatYuan(order.amountFen) }}</text>
      <text v-if="order.planAction === 'upgrade'" class="muted-text">补差升级 · 已用与冻结额度保留</text>
      <text v-if="order.planEndsAtUtc" class="muted-text">原到期时间：{{ formatDate(order.planEndsAtUtc) }}</text>
      <text v-if="order.paymentExpiresAtUtc && order.status === BillingOrderStatus.Pending" class="muted-text">
        支付报价有效至：{{ formatDate(order.paymentExpiresAtUtc) }}，过期后请重新选择套餐。
      </text>
      <text v-if="order.status === BillingOrderStatus.PaidNeedsReview" class="muted-text">
        付款已记录，订阅状态变化导致权益未自动发放，请联系客服处理。
      </text>
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
import { billingApi } from "@/api/billing";
import { errorMessage, formatDate, formatNumber, formatYuan } from "@/utils/format";
import {
  pollOrderPaid,
  requestVirtualPayment,
  VirtualPaymentCancelledError,
} from "@/packages/account/services/virtualPayment";
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
  [BillingOrderStatus.AdministratorAdjusted]: "管理员调整",
  [BillingOrderStatus.PaidNeedsReview]: "已付款，权益待处理",
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
    // 同一订单重复发起支付返回同一商户单号，取消后可原单继续支付。
    const payData = await billingApi.createVirtualPayment({ orderId: props.order.id });
    let cancelled = false;
    try {
      await requestVirtualPayment(payData);
    } catch (reason) {
      if (reason instanceof VirtualPaymentCancelledError) cancelled = true;
      else throw reason;
    }
    // 微信 success 回调不作为到账依据，权益以服务端发货（推送 + 兜底查单）为准。
    const paid = cancelled ? false : await pollOrderPaid(props.order.id);
    await refreshDashboard();
    emit("close");
    uni.showToast({
      title: cancelled ? "已取消支付，可稍后继续支付" : paid ? "支付成功" : "支付结果确认中，到账后可在订单记录查看",
      icon: "none",
    });
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
