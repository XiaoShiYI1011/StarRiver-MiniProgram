<template>
  <view class="capabilities">
    <view v-for="item in capabilities" :key="item.title" class="capability">
      <view class="capability-icon"><AppIcon :name="item.icon" /></view>
      <view class="capability-content">
        <text class="capability-title">{{ item.title }}</text>
        <text class="capability-description">{{ item.description }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
import { capabilities } from "@/mocks/home";
</script>

<style lang="scss" scoped>
.capabilities {
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  .capability {
    display: flex;
    gap: 24rpx;
    padding: 30rpx;
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 36rpx;
  }

  .capability-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 80rpx;
    height: 80rpx;
    background: var(--accent-wash);
    border-radius: 24rpx;
  }

  .capability-content {
    flex: 1;
    min-width: 0;
  }

  .capability-title {
    display: block;
    font-size: 29rpx;
    font-weight: 700;
  }

  .capability-description {
    display: block;
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 1.65;
    color: var(--ink-soft);
  }
}
</style>
