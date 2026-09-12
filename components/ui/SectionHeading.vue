<template>
  <view class="section-heading">
    <view class="section-heading__text">
      <text v-if="eyebrow" class="section-heading__eyebrow">{{ eyebrow }}</text>
      <text class="section-heading__title">{{ title }}</text>
    </view>
    <button v-if="action" class="text-button section-heading__action" @tap="emit('action')">{{ action }}</button>
  </view>
</template>

<script setup lang="ts">
defineProps<{ title: string; eyebrow?: string; action?: string }>();
const emit = defineEmits<{ action: [] }>();
</script>

<style lang="scss" scoped>
.section-heading {
  display: flex;
  gap: 16rpx;
  align-items: flex-end;
  justify-content: space-between;
  padding: 20rpx 12rpx 0;

  &__text {
    flex: 1;
    min-width: 0;
  }

  &__eyebrow {
    display: block;
    font-size: 22rpx;
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 1.5rpx;
  }

  &__title {
    display: block;
    font-size: 34rpx;
    font-weight: 700;
    line-height: 1.4;
  }

  &__action {
    flex-shrink: 0;
    font-size: 24rpx;
    color: var(--ink-soft);
  }
}
</style>
