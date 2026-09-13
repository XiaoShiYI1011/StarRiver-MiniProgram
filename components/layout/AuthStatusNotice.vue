<template>
  <view v-if="authError" class="auth-status" role="alert">
    <text>{{ authError }}</text>
    <button class="auth-status__retry" :disabled="loading" @tap="refresh">重新连接</button>
  </view>
</template>
<script setup lang="ts">
import { useStudio } from "@/composables/useStudio";
const { authError, loading, refresh } = useStudio();
</script>
<style lang="scss" scoped>
.auth-status {
  display: flex;
  gap: 20rpx;
  align-items: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: var(--ink-soft);
  background: var(--accent-wash);
  border-radius: 24rpx;

  &__retry {
    flex-shrink: 0;
    margin: 0;
    font-size: 24rpx;
    color: var(--accent);
    background: transparent;

    &::after {
      border: 0;
    }
  }
}
</style>
