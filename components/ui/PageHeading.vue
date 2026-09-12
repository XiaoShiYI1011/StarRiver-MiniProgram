<template>
  <view class="page-heading">
    <text class="page-heading__title">{{ title }}</text>
    <text class="page-heading__description">{{ description }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{ title: string; description: string }>();
</script>

<style lang="scss" scoped>
.page-heading {
  padding: 16rpx 8rpx 0;

  &__title {
    display: block;
    font-size: 52rpx;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -1.5rpx;
  }

  &__description {
    display: block;
    margin-top: 8rpx;
    font-size: 26rpx;
    color: var(--ink-soft);
  }
}
</style>
