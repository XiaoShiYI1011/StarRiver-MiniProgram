<template>
  <view class="plan-card" :class="{ 'plan-card--selected': active }" @tap="emit('activate', plan.id)">
    <text v-if="plan.isRecommended" class="plan-badge">热门推荐</text>
    <view class="plan-summary">
      <image
        v-if="productImage"
        class="plan-image"
        :src="productImage"
        mode="aspectFit"
      />
      <view class="plan-heading">
        <text class="plan-family">WritingPlan</text>
        <text class="plan-name">{{ plan.name.replace(/^WritingPlan[ -]*/, "") }}</text>
        <text v-if="betaFreeMode" class="plan-beta-title">内测中 · 暂不开放</text>
        <text v-if="betaFreeMode" class="plan-period">内测期间限时免费</text>
        <text v-else class="plan-beta-title">¥{{ formatYuan(plan.priceFen) }} / {{ plan.durationDays }}天</text>
      </view>
    </view>
    <text class="plan-description">{{ plan.description }}</text>
    <view class="plan-features">
      <view class="plan-feature">
        <AppIcon name="check" :size="15" />
        <text>8 小时创作额度 {{ formatNumber(plan.eightHourCredits) }} 积分</text>
      </view>
      <view class="plan-feature">
        <AppIcon name="check" :size="15" />
        <text>7 天创作额度 {{ formatNumber(plan.sevenDayCredits) }} 积分</text>
      </view>
    </view>
    <button v-if="betaFreeMode" class="secondary-button" disabled>内测期间暂不开放</button>
    <button v-else :class="active ? 'primary-button' : 'secondary-button'" @tap.stop="emit('select', plan)">
      选择{{ plan.name }}
    </button>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
import { formatNumber, formatYuan } from "@/utils/format";
import { API_BASE_URL } from "@/config/api";
import type { WritingPlanProduct } from "@/types/billing";
import { computed } from "vue";

const props = defineProps<{ plan: WritingPlanProduct; active: boolean; betaFreeMode: boolean }>();
const productImage = computed(() => props.plan.imageUrl ? `${API_BASE_URL}${props.plan.imageUrl}` : null);
const emit = defineEmits<{ activate: [id: string]; select: [plan: WritingPlanProduct] }>();
</script>

<style lang="scss" scoped>
.plan-card {
  position: relative;
  padding: 36rpx 32rpx 32rpx;
  background: var(--paper-raised);
  border: 1px solid var(--line);
  border-radius: 28rpx;

  &--selected {
    border-color: var(--accent);
    box-shadow: 0 18rpx 50rpx var(--accent-wash);
  }

  .plan-badge {
    position: absolute;
    top: -1px;
    right: auto;
    left: 50%;
    z-index: 2;
    display: block;
    box-sizing: border-box;
    width: 90%;
    height: 36rpx;
    padding: 0;
    color: #f3d793;
    font-size: 24rpx;
    font-weight: 700;
    line-height: 36rpx;
    letter-spacing: 2px;
    text-align: center;
    white-space: nowrap;
    background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%20600%2040%27%20preserveAspectRatio%3D%27none%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27g%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23756647%27%20stop-opacity%3D%270%27%2F%3E%3Cstop%20offset%3D%27.12%27%20stop-color%3D%27%2366583e%27%20stop-opacity%3D%27.25%27%2F%3E%3Cstop%20offset%3D%27.25%27%20stop-color%3D%27%234a3e2b%27%20stop-opacity%3D%27.72%27%2F%3E%3Cstop%20offset%3D%27.38%27%20stop-color%3D%27%232d271d%27%2F%3E%3Cstop%20offset%3D%27.5%27%20stop-color%3D%27%2317130e%27%2F%3E%3Cstop%20offset%3D%27.62%27%20stop-color%3D%27%232d271d%27%2F%3E%3Cstop%20offset%3D%27.75%27%20stop-color%3D%27%234a3e2b%27%20stop-opacity%3D%27.72%27%2F%3E%3Cstop%20offset%3D%27.88%27%20stop-color%3D%27%2366583e%27%20stop-opacity%3D%27.25%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23756647%27%20stop-opacity%3D%270%27%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%27M0%200H600C505%200%20475%200%20440%2021C414%2038%20403%2040%20375%2040H225C197%2040%20186%2038%20160%2021C125%200%2095%200%200%200Z%27%20fill%3D%27url%28%23g%29%27%2F%3E%3C%2Fsvg%3E")
      center top / 100% 100% no-repeat;
    border-radius: 0;
    box-shadow: none;
    text-shadow: 0 1px 2px rgb(225 181 88 / 28%);
    transform: translateX(-50%);
  }

  .plan-summary {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin-bottom: 24rpx;
  }
  .plan-family {
    font-size: 20rpx;
    letter-spacing: 2rpx;
    color: var(--ink-soft);
  }
  .plan-heading {
    display: flex;
    gap: 4rpx;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
  }

  .plan-image {
    order: 1;
    margin-left: auto;
    display: block;
    width: 136rpx;
    height: 136rpx;
    flex-shrink: 0;
    border-radius: 18rpx;
  }

  .plan-name {
    font-size: 32rpx;
    font-weight: 700;
  }

  .plan-beta-title {
    font-size: 26rpx;
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
