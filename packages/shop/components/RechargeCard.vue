<template>
  <view class="surface-card recharge-card">
    <view class="recharge-head">
      <text class="recharge-title">创作积分充值</text>
      <text class="recharge-rate">1 元 = {{ formatNumber(creditsPerYuan) }} 积分</text>
    </view>
    <view class="recharge-row">
      <text class="recharge-unit">¥</text>
      <input v-model="amountText" class="recharge-input" type="digit" placeholder="输入金额" />
      <text class="recharge-credits">≈ {{ formatNumber(credits) }} 积分</text>
    </view>
    <text class="recharge-note">
      最低 {{ formatYuan(minimumRechargeFen) }} 元；充值积分独立于套餐额度扣减，用于章节生成等 AI 消耗。
    </text>
    <button class="primary-button" :disabled="!valid" @tap="emit('select', amountFen, credits)">立即充值</button>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { formatNumber, formatYuan } from "@/utils/format";

const props = defineProps<{ creditsPerYuan: number; minimumRechargeFen: number }>();
const emit = defineEmits<{ select: [amountFen: number, credits: number] }>();

const amountText = ref(String(props.minimumRechargeFen / 100));
watch(
  () => props.minimumRechargeFen,
  (fen) => {
    amountText.value = String(fen / 100);
  }
);
const amountFen = computed(() => Math.round((Number.parseFloat(amountText.value) || 0) * 100));
const credits = computed(() => Math.floor((amountFen.value / 100) * props.creditsPerYuan));
const valid = computed(() => amountFen.value >= props.minimumRechargeFen);
</script>

<style lang="scss" scoped>
.recharge-card {
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  .recharge-head {
    display: flex;
    gap: 16rpx;
    align-items: baseline;
    justify-content: space-between;
  }

  .recharge-title {
    font-size: 30rpx;
    font-weight: 700;
  }

  .recharge-rate {
    font-size: 24rpx;
    color: var(--ink-soft);
  }

  .recharge-row {
    display: flex;
    gap: 16rpx;
    align-items: center;
    padding: 22rpx 26rpx;
    background: var(--paper-inset);
    border-radius: 26rpx;
  }

  .recharge-unit {
    font-size: 32rpx;
    font-weight: 700;
  }

  .recharge-input {
    flex: 1;
    min-width: 0;
    font-size: 32rpx;
    font-weight: 650;
  }

  .recharge-credits {
    flex-shrink: 0;
    font-size: 24rpx;
    color: var(--accent);
  }

  .recharge-note {
    font-size: 23rpx;
    line-height: 1.6;
    color: var(--ink-soft);
  }
}
</style>
