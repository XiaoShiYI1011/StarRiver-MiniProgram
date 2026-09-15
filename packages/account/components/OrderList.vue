<template>
  <view class="cell-group order-list">
    <text v-if="!orders.length" class="empty-state order-empty">暂无订单记录</text>
    <button v-for="order in orders" :key="order.id" class="order-row" @tap="emit('select', order)">
      <view class="order-icon">
        <AppIcon
          :name="
            order.status === BillingOrderStatus.Pending
              ? 'clock'
              : order.orderType === BillingOrderType.WritingPlan
                ? 'diamond'
                : 'bag'
          "
          :size="18"
        />
      </view>
      <view class="order-content">
        <text class="order-name">{{ order.productName }}</text>
        <text class="order-date">{{ formatDate(order.createdAt) }} · 订单号 {{ order.orderNo }}</text>
      </view>
      <view class="order-end">
        <text class="status-tag" :class="statusClass[order.status]">{{ statusLabels[order.status] }}</text>
        <text class="order-amount">¥{{ formatYuan(order.amountFen) }}</text>
      </view>
    </button>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
import { formatDate, formatYuan } from "@/utils/format";
import { BillingOrderStatus, BillingOrderType } from "@/packages/account/types/billing";
import type { BillingOrder } from "@/types/billing";

defineProps<{ orders: BillingOrder[] }>();
const emit = defineEmits<{ select: [order: BillingOrder] }>();
const statusLabels: Record<BillingOrderStatus, string> = {
  [BillingOrderStatus.Pending]: "待支付",
  [BillingOrderStatus.Paid]: "已完成",
  [BillingOrderStatus.Cancelled]: "已关闭",
  [BillingOrderStatus.Refunded]: "已退款",
};
const statusClass: Record<BillingOrderStatus, string> = {
  [BillingOrderStatus.Pending]: "status-tag--pending",
  [BillingOrderStatus.Paid]: "",
  [BillingOrderStatus.Cancelled]: "status-tag--closed",
  [BillingOrderStatus.Refunded]: "status-tag--closed",
};
</script>

<style lang="scss" scoped>
.order-list {
  .order-row {
    display: flex;
    gap: 20rpx;
    align-items: center;
    width: 100%;
    min-height: 128rpx;
    padding: 20rpx 28rpx;
    margin: 0;
    line-height: 1.5;
    color: var(--ink);
    text-align: left;
    background: transparent;
    border-bottom: 1px solid var(--line);
    border-radius: 0;

    &::after {
      border: 0;
    }

    &:last-child {
      border-bottom: 0;
    }
  }

  .order-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    background: var(--accent-wash);
    border-radius: 20rpx;
  }

  .order-content {
    flex: 1;
    min-width: 0;
  }

  .order-name {
    display: block;
    font-size: 26rpx;
    font-weight: 650;
  }

  .order-date {
    display: block;
    margin-top: 4rpx;
    overflow: hidden;
    font-size: 22rpx;
    color: var(--ink-faint);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .order-end {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    gap: 8rpx;
    align-items: flex-end;
  }

  .order-amount {
    font-size: 28rpx;
    font-weight: 700;
  }

  .order-empty {
    display: block;
  }
}
</style>
