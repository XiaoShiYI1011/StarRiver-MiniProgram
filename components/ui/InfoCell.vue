<template>
  <button class="info-cell" :disabled="disabled" @tap="emit('tap')">
    <view class="info-cell__icon"><AppIcon :name="icon" :size="18" /></view>
    <view class="info-cell__text">
      <text class="info-cell__title">{{ title }}</text>
      <text v-if="description" class="info-cell__description">{{ description }}</text>
    </view>
    <text v-if="value" class="info-cell__value">{{ value }}</text>
    <AppIcon v-else name="chevron" tone="muted" :size="16" />
  </button>
</template>

<script setup lang="ts">
import AppIcon from "./AppIcon.vue";
defineProps<{ icon: string; title: string; description?: string; value?: string; disabled?: boolean }>();
const emit = defineEmits<{ tap: [] }>();
</script>

<style lang="scss" scoped>
.info-cell {
  display: flex;
  gap: 24rpx;
  align-items: center;
  width: 100%;
  min-height: 112rpx;
  padding: 20rpx 30rpx;
  margin: 0;
  color: var(--ink);
  text-align: left;
  background: transparent;
  border-radius: 0;

  &::after {
    border: 0;
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    background: var(--accent-wash);
    border-radius: 20rpx;
  }

  &__text {
    flex: 1;
    min-width: 0;
  }

  &__title {
    display: block;
    font-size: 27rpx;
    font-weight: 550;
    line-height: 1.5;
  }

  &__description {
    display: block;
    margin-top: 4rpx;
    font-size: 22rpx;
    line-height: 1.5;
    color: var(--ink-soft);
  }

  &__value {
    font-size: 24rpx;
    color: var(--ink-faint);
  }
}
</style>
