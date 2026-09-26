<template>
  <AppDialog
    :open="!!selection"
    :title="selection?.kind === 'plan' && selection.quote.action === 'upgrade' ? '确认升级' : '确认购买'"
    :busy="busy"
    @close="emit('close')"
  >
    <view v-if="selection" class="checkout-summary">
      <template v-if="selection.kind === 'plan'">
        <text class="checkout-name">{{ selection.product.name }}</text>
        <text class="checkout-price">¥{{ formatYuan(selection.quote.amountFen) }}</text>
        <template v-if="selection.quote.action === 'upgrade'">
          <text class="muted-text">{{ selection.quote.currentProductName }} → {{ selection.quote.productName }}</text>
        </template>
        <text v-else class="muted-text">
          {{ selection.product.durationDays }} 天创作权益 ·
          {{ selection.quote.action === "renew" ? "从原到期时间续期" : "支付后生效" }}
        </text>
        <text class="muted-text">报价有效至 {{ formatDate(selection.quote.expiresAtUtc) }}</text>
        <text class="muted-text">
          8 小时额度 {{ formatNumber(selection.quote.eightHourCredits) }} 积分 · 7 天额度
          {{ formatNumber(selection.quote.sevenDayCredits) }} 积分
        </text>
      </template>
      <template v-else>
        <text class="checkout-name">创作加油包</text>
        <text class="checkout-price">¥{{ formatYuan(selection.amountFen) }}</text>
        <text class="muted-text">预计到账 {{ formatNumber(selection.credits) }} 积分 · 独立于套餐额度扣减</text>
      </template>
      <text v-if="error" class="error-text">{{ error }}</text>
    </view>
    <template #actions>
      <view class="dialog-button-stack">
        <button class="primary-button" :loading="busy" :disabled="busy" @tap="emit('confirm')">确认支付</button>
        <button class="secondary-button" :disabled="busy" @tap="emit('later')">仅创建订单</button>
      </view>
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import AppDialog from "@/components/ui/AppDialog.vue";
import { formatNumber, formatYuan } from "@/utils/format";
import type { CheckoutSelection } from "../composables/useCheckout";

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : "—");

defineProps<{ selection: CheckoutSelection | null; busy: boolean; error: string }>();
const emit = defineEmits<{ close: []; confirm: []; later: [] }>();
</script>

<style lang="scss" scoped>
.checkout-summary {
  display: flex;
  flex-direction: column;
  gap: 18rpx;

  .checkout-name {
    font-size: 32rpx;
    font-weight: 650;
  }

  .checkout-price {
    font-size: 60rpx;
    font-weight: 750;
  }
}
</style>
