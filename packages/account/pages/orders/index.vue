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
        <PageHeading title="订单记录" description="这里保留本地模拟开通的记录，可继续支付或取消待支付订单。" />
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
import type { Order, OrderStatus } from "@/types/studio";

const { dashboard, refresh } = useStudio();

onShow(() => {
  void refresh();
});

const filter = ref<OrderStatus | "all">("all");
const selected = ref<Order | null>(null);
const filters: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "pending", label: "待支付" },
  { id: "completed", label: "已完成" },
  { id: "closed", label: "已关闭" },
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
