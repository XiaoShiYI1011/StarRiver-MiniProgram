<template>
  <view class="bottom-nav">
    <button
      v-for="item in tabs"
      :key="item.id"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': current === item.id }"
      :aria-label="item.label"
      @tap="openMainTab(item.id)"
    >
      <AppIcon :name="item.icon" :tone="current === item.id ? 'accent' : 'muted'" />
      <text>{{ item.label }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
import { openMainTab } from "@/utils/navigation";
import type { MainTab } from "@/utils/navigation";

defineProps<{ current: MainTab }>();
const tabs: { id: MainTab; icon: string; label: string }[] = [
  { id: "home", icon: "home", label: "首页" },
  { id: "plans", icon: "diamond", label: "套餐" },
  { id: "mine", icon: "user", label: "我的" },
];
</script>

<style lang="scss" scoped>
.bottom-nav {
  display: flex;
  gap: 8rpx;

  &__item {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6rpx;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 108rpx;
    padding: 12rpx 8rpx;
    margin: 0;
    font-size: 24rpx;
    font-weight: 650;
    line-height: 1.4;
    color: var(--ink-faint);
    background: transparent;
    border-radius: 28rpx;
  }

  &__item::after {
    border: 0;
  }

  &__item--active {
    color: var(--accent);
    background: var(--accent-wash);
  }
}
</style>
