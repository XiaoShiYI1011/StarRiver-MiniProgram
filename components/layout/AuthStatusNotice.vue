<template>
  <view v-if="authError" class="auth-status" role="alert">
    <text>{{ authError }}</text>
    <button class="auth-status__retry" :disabled="loading" @tap="refresh">重新连接</button>
  </view>
</template>
<script setup lang="ts">
import { useStudio } from "@/composables/useStudio";
const { authError, loading, refresh } = useStudio();

// 无错误时组件整体不渲染宿主节点：作为 page-stack 弹性列的子项，
// 空的宿主节点会占据一个 gap 槽位，在导航下方留出多余空白。
defineOptions({
  options: { virtualHost: true },
});
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
