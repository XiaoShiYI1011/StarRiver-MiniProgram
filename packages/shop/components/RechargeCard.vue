<template>
  <view class="surface-card recharge-card">
    <view class="recharge-head">
      <text class="recharge-title">创作加油包</text>
      <text class="recharge-rate">1 元 = {{ formatNumber(creditsPerYuan) }} 积分</text>
    </view>
    <view class="recharge-row">
      <text class="recharge-unit">¥</text>
      <input v-model="amountText" class="recharge-input" type="digit" placeholder="输入金额" :disabled="disabled" />
      <text class="recharge-credits">{{ formatNumber(credits) }} 积分</text>
    </view>
    <text class="recharge-note">
      预计到账 {{ formatNumber(credits) }} 创作积分，最低
      {{ formatYuan(minimumRechargeFen) }} 元，需为整数元；充值积分独立于套餐额度扣减，用于创作消耗。
    </text>
    <text class="recharge-note">当前比例与网页端同步；支付前请核对确认页的到账积分。</text>
    <button class="primary-button" :disabled="disabled || !valid" @tap="emit('select', amountFen, credits)">
      {{ disabled ? "内测期间暂不开放" : "立即充值" }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { formatNumber, formatYuan } from "@/utils/format";

const props = defineProps<{ creditsPerYuan: number; minimumRechargeFen: number; disabled?: boolean }>();
const emit = defineEmits<{ select: [amountFen: number, credits: number] }>();

// 微信按整元计价，业务积分按服务端公共策略换算。
const amountText = ref(String(Math.max(1, Math.ceil(props.minimumRechargeFen / 100))));
watch(
  () => props.minimumRechargeFen,
  (fen) => {
    amountText.value = String(Math.max(1, Math.ceil(fen / 100)));
  }
);
const amountFen = computed(() => Math.round((Number.parseFloat(amountText.value) || 0) * 100));
const credits = computed(() => Math.floor((amountFen.value / 100) * props.creditsPerYuan));
const valid = computed(
  () =>
    Number.isSafeInteger(amountFen.value) &&
    amountFen.value >= props.minimumRechargeFen &&
    amountFen.value <= 100_000_000 &&
    amountFen.value % 100 === 0
);
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
