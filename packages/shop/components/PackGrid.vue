<template>
  <view class="pack-grid">
    <button v-for="pack in packs" :key="pack.id" class="pack-card" @tap="emit('select', pack)">
      <text class="pack-name">加油包 · {{ pack.words / 10000 }} 万字</text>
      <text class="pack-description">一次性额度 · {{ pack.days }} 天有效</text>
      <text class="pack-price">¥{{ pack.price }}</text>
      <text class="pack-action">选择加油包 →</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import type { Pack } from "@/types/studio";

defineProps<{ packs: Pack[] }>();
const emit = defineEmits<{ select: [pack: Pack] }>();
</script>

<style lang="scss" scoped>
.pack-grid {
  display: flex;
  gap: 20rpx;

  .pack-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6rpx;
    min-width: 0;
    padding: 28rpx;
    margin: 0;
    line-height: 1.6;
    color: var(--ink);
    text-align: left;
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 36rpx;

    &::after {
      border: 0;
    }
  }

  .pack-name {
    font-size: 27rpx;
    font-weight: 650;
  }

  .pack-description {
    font-size: 24rpx;
    color: var(--ink-soft);
  }

  .pack-action {
    margin-top: 12rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: var(--accent);
  }

  .pack-price {
    margin-top: 12rpx;
    font-size: 34rpx;
    font-weight: 700;
  }
}
</style>
