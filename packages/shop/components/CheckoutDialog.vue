<template>
  <AppDialog :open="!!product" title="确认模拟开通" :busy="busy" @close="emit('close')">
    <view v-if="product" class="checkout-summary">
      <text class="checkout-name">{{ product.name }}</text>
      <text class="checkout-price">¥{{ product.price }}</text>
      <text class="muted-text">
        {{ product.kind === "plan" ? `${product.days} 天创作权益` : `${product.days} 天有效 · 一次性创作额度` }}
      </text>
      <view class="notice-box">本次为模拟开通，不会发起真实支付或扣款。确认后可在“我的”查看权益与订单。</view>
      <text v-if="error" class="error-text">{{ error }}</text>
    </view>
    <template #actions>
      <view class="dialog-button-stack">
        <button class="primary-button" :loading="busy" :disabled="busy" @tap="emit('confirm')">模拟开通</button>
        <button class="secondary-button" :disabled="busy" @tap="emit('later')">仅生成演示订单</button>
      </view>
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import AppDialog from "@/components/ui/AppDialog.vue";
import type { Product } from "@/types/studio";

defineProps<{ product: Product | null; busy: boolean; error: string }>();
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
