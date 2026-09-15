<template>
  <view class="surface-card entitlement-card">
    <view class="stats">
      <view class="stat">
        <text class="stat-label">当前套餐</text>
        <text class="stat-value">{{ account.planName }}</text>
        <text class="stat-note">剩余 {{ account.remainingDays }} 天</text>
      </view>
      <view class="stat">
        <text class="stat-label">剩余积分</text>
        <text class="stat-value">{{ formatNumber(account.points) }}</text>
        <text class="stat-note">7 天额度还可用 {{ account.weeklyRemainingPercent }}%</text>
      </view>
    </view>
    <view class="quota-meter" :aria-label="`七天额度剩余 ${account.weeklyRemainingPercent}%`">
      <view class="quota-meter__fill" :style="{ width: `${account.weeklyRemainingPercent}%` }" />
    </view>
    <text class="quota-note">套餐额度每 8 小时 / 7 天滚动恢复，充值积分独立扣减。</text>
    <text v-if="account.packCredits" class="pack-balance">充值积分剩余 {{ formatNumber(account.packCredits) }}</text>
  </view>
</template>
<script setup lang="ts">
import { formatNumber } from "@/utils/format";
import type { Account } from "@/composables/useStudio";

defineProps<{ account: Account }>();
</script>

<style lang="scss" scoped>
.entitlement-card {
  .stats {
    display: flex;
    gap: 20rpx;
  }

  .stat {
    flex: 1;
    min-width: 0;
    padding: 26rpx 24rpx;
    background: var(--paper-inset);
    border-radius: 28rpx;
  }

  .stat-label {
    display: block;
    font-size: 24rpx;
    color: var(--ink-soft);
  }

  .stat-value {
    display: block;
    margin-top: 4rpx;
    font-size: 38rpx;
    font-weight: 700;
    letter-spacing: -1rpx;
  }

  .stat-note {
    display: block;
    margin-top: 6rpx;
    font-size: 24rpx;
    color: var(--ink-faint);
  }

  .quota-meter {
    height: 12rpx;
    margin-top: 18rpx;
    overflow: hidden;
    background: var(--line);
    border-radius: 999rpx;
  }

  .quota-meter__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--brand-cyan));
    border-radius: 999rpx;
  }

  .quota-note {
    display: block;
    margin-top: 18rpx;
    font-size: 24rpx;
    color: var(--ink-soft);
  }

  .pack-balance {
    display: block;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: var(--accent);
  }
}
</style>
