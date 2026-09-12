<template>
  <view class="legal-footer">
    <text>© 2026 星河创作 ·</text>
    <text class="legal-footer__link" @tap="openDocument('terms')">用户协议</text>
    <text>·</text>
    <text class="legal-footer__link" @tap="openDocument('privacy')">隐私政策</text>
  </view>
</template>

<script setup lang="ts">
import { openDocument } from "@/utils/navigation";
</script>

<style lang="scss" scoped>
.legal-footer {
  padding: 24rpx 0 16rpx;
  font-size: 21rpx;
  color: var(--ink-faint);
  text-align: center;

  &__link {
    padding: 12rpx 0;
    color: var(--ink-soft);
  }
}
</style>
