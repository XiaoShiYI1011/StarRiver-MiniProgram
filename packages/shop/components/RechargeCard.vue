<template>
  <view class="surface-card recharge-card">
    <view class="recharge-head">
      <text class="recharge-title">创作加油包</text>
      <text class="recharge-rate">1 元 = {{ formatNumber(creditsPerYuan) }} 积分</text>
    </view>
    <view class="recharge-row">
      <text class="recharge-unit">¥</text>
      <input v-model="amountText" class="recharge-input" type="digit" placeholder="输入金额" />
      <text class="recharge-credits">≈ {{ formatNumber(credits) }} 积分</text>
    </view>
    <text class="recharge-note">
      购买后到账 {{ formatNumber(credits) }} 创作积分，最低 {{ formatYuan(minimumRechargeFen) }} 元，需为整数元；充值积分独立于套餐额度扣减，用于创作消耗。
    </text>
    <button class="primary-button" :disabled="!valid" @tap="emit('select', amountFen, credits)">立即充值</button>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { formatNumber, formatYuan } from "@/utils/format";

const props = defineProps<{ creditsPerYuan: number; minimumRechargeFen: number }>();
const emit = defineEmits<{ select: [amountFen: number, credits: number] }>();

// 虚拟支付按 1 元 = 100 代币整元下单，金额必须为 100 分的整数倍。
const amountText = ref(String(Math.max(1, Math.ceil(props.minimumRechargeFen / 100))));
watch(
  () => props.minimumRechargeFen,
  (fen) => {
    amountText.value = String(Math.max(1, Math.ceil(fen / 100)));
  }
);
const amountFen = computed(() => Math.round((Number.parseFloat(amountText.value) || 0) * 100));
const credits = computed(() => Math.floor((amountFen.value / 100) * props.creditsPerYuan));
const valid = computed(() => amountFen.value >= props.minimumRechargeFen && amountFen.value % 100 === 0);
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
