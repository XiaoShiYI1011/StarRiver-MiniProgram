<template>
  <view class="plan-card" :class="{ 'plan-card--recommended': plan.recommended }">
    <text v-if="plan.recommended" class="plan-badge">推荐</text>
    <view class="plan-heading">
      <text class="plan-name">{{ plan.name }}</text>
      <text class="plan-price">
        ¥{{ plan.price }}
        <text class="plan-period">/ {{ plan.days }}天</text>
      </text>
    </view>
    <text class="plan-description">{{ plan.description }}</text>
    <view class="plan-features">
      <view class="plan-feature">
        <AppIcon name="check" :size="15" />
        <text>8 小时创作额度 {{ formatNumber(plan.eightHourQuota) }} 积分</text>
      </view>
      <view class="plan-feature">
        <AppIcon name="check" :size="15" />
        <text>7 天创作额度 {{ formatNumber(plan.weeklyQuota) }} 积分</text>
      </view>
      <view v-for="feature in plan.features" :key="feature" class="plan-feature">
        <AppIcon name="check" :size="15" />
        <text>{{ feature }}</text>
      </view>
    </view>
    <button :class="plan.recommended ? 'primary-button' : 'secondary-button'" @tap="emit('select', plan)">
      开通{{ plan.name }}
    </button>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
import { formatNumber } from "@/utils/format";
import type { Plan } from "@/types/studio";

defineProps<{ plan: Plan }>();
const emit = defineEmits<{ select: [plan: Plan] }>();
</script>

<style lang="scss" scoped>
.plan-card {
  position: relative;
  padding: 36rpx 32rpx 32rpx;
  background: var(--paper-raised);
  border: 1px solid var(--line);
  border-radius: 44rpx;

  &--recommended {
    border-color: var(--accent);
    box-shadow: 0 18rpx 50rpx var(--accent-wash);
  }

  .plan-badge {
    position: absolute;
    top: -18rpx;
    right: 28rpx;
    padding: 6rpx 20rpx;
    font-size: 24rpx;
    font-weight: 700;
    color: #fff;
    background: var(--accent);
    border-radius: 999rpx;
  }

  .plan-heading {
    display: flex;
    gap: 16rpx;
    align-items: baseline;
    justify-content: space-between;
  }

  .plan-name {
    font-size: 32rpx;
    font-weight: 700;
  }

  .plan-price {
    font-size: 40rpx;
    font-weight: 700;
  }

  .plan-period {
    font-size: 24rpx;
    font-weight: 400;
    color: var(--ink-soft);
  }

  .plan-description {
    display: block;
    margin: 8rpx 0 20rpx;
    font-size: 24rpx;
    color: var(--ink-soft);
  }

  .plan-features {
    display: flex;
    flex-direction: column;
    gap: 14rpx;
    margin-bottom: 28rpx;
  }

  .plan-feature {
    display: flex;
    gap: 16rpx;
    align-items: flex-start;
    font-size: 25rpx;
    color: var(--ink-muted);
  }
}
</style>
