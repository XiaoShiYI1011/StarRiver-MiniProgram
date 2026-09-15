<template>
  <AppPage title="订单记录" subtitle="查看开通记录与订单状态" show-back @back-fallback="goHome">
    <template #tabContainer>
      <view class="order-tabs">
        <button
          v-for="item in filters"
          :key="item.id"
          class="order-tab"
          :class="{ 'order-tab--active': filter === item.id }"
          @tap="filter = item.id"
        >
          {{ item.label }}
        </button>
      </view>
    </template>
    <template #mainContent>
      <view class="page-stack">
        <PageHeading title="订单记录" description="查询你创建的订单与支付状态。" />
        <OrderList :orders="filteredOrders" @select="selected = $event" />
        <LegalFooter />
      </view>
    </template>
    <template #dialogContainer><OrderDetailDialog :order="selected" @close="selected = null" /></template>
  </AppPage>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import AppPage from "@/layout/components/pageContainer.vue";
import PageHeading from "@/components/ui/PageHeading.vue";
import LegalFooter from "@/components/layout/LegalFooter.vue";
import OrderList from "../../components/OrderList.vue";
import OrderDetailDialog from "../../components/OrderDetailDialog.vue";
import { useStudio } from "@/composables/useStudio";
import { goHome } from "@/utils/navigation";
import { BillingOrderStatus } from "@/types/billing";
import type { BillingOrder } from "@/types/billing";

const { dashboard, refresh } = useStudio();

onShow(() => {
  void refresh();
});

type FilterId = BillingOrderStatus | "all";
const filter = ref<FilterId>("all");
const selected = ref<BillingOrder | null>(null);
const filters: { id: FilterId; label: string }[] = [
  { id: "all", label: "全部" },
  { id: BillingOrderStatus.Pending, label: "待支付" },
  { id: BillingOrderStatus.Paid, label: "已完成" },
  { id: BillingOrderStatus.Cancelled, label: "已关闭" },
];

const filteredOrders = computed(() =>
  dashboard.value.orders.filter((item) => filter.value === "all" || item.status === filter.value)
);
</script>

<style lang="scss" scoped>
.order-tabs {
  display: flex;
  gap: 8rpx;
  padding: 20rpx 28rpx 0;

  .order-tab {
    flex: 1;
    min-height: 88rpx;
    padding: 16rpx 4rpx;
    margin: 0;
    font-size: 24rpx;
    line-height: 1.4;
    color: var(--ink-soft);
    background: transparent;
    border-radius: 20rpx;

    &::after {
      border: 0;
    }

    &--active {
      color: var(--accent);
      background: var(--accent-wash);
    }
  }
}
</style>
