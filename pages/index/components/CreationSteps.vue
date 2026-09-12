<template>
  <view class="surface-card steps">
    <view v-for="(item, index) in steps" :key="item.title" class="step">
      <text class="step-number">{{ index + 1 }}</text>
      <view>
        <text class="step-title">{{ item.title }}</text>
        <text class="step-description">{{ item.description }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { steps } from "@/mocks/home";
</script>

<style lang="scss" scoped>
.steps {
  padding: 20rpx 32rpx;

  .step {
    position: relative;
    display: flex;
    gap: 24rpx;
    padding: 22rpx 8rpx;
  }

  .step:not(:last-child)::before {
    position: absolute;
    top: 82rpx;
    bottom: -22rpx;
    left: 36rpx;
    width: 2px;
    content: "";
    background: var(--line);
  }

  .step-number {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 60rpx;
    height: 60rpx;
    font-size: 24rpx;
    font-weight: 700;
    color: var(--accent);
    background: var(--accent-wash);
    border-radius: 20rpx;
  }

  .step-title {
    display: block;
    font-size: 28rpx;
    font-weight: 650;
  }

  .step-description {
    display: block;
    font-size: 24rpx;
    color: var(--ink-soft);
  }
}
</style>
