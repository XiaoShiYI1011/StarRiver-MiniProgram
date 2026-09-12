<template>
  <view v-if="open" class="dialog-mask" @tap="emit('close')" @touchmove.stop.prevent>
    <view class="dialog-panel" role="dialog" :aria-label="title" @tap.stop>
      <view class="dialog-heading">
        <text class="dialog-title">{{ title }}</text>
        <button class="dialog-close" aria-label="关闭弹窗" :disabled="busy" @tap="emit('close')">
          <AppIcon name="close" tone="muted" />
        </button>
      </view>
      <scroll-view scroll-y class="dialog-body"><slot /></scroll-view>
      <view v-if="$slots.actions" class="dialog-actions"><slot name="actions" /></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "./AppIcon.vue";
defineProps<{ open: boolean; title: string; busy?: boolean }>();
const emit = defineEmits<{ close: [] }>();
</script>

<style lang="scss" scoped>
.dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background: rgb(0 0 0 / 45%);

  .dialog-panel {
    box-sizing: border-box;
    width: 100%;
    max-width: 420px;
    padding: 36rpx;
    color: var(--ink);
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 40rpx;
    box-shadow: var(--shadow-float);
  }

  .dialog-heading {
    display: flex;
    gap: 20rpx;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
  }

  .dialog-title {
    font-size: 34rpx;
    font-weight: 700;
  }

  .dialog-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    padding: 0;
    margin: 0;
    background: var(--paper-inset);
    border-radius: 50%;
  }

  .dialog-close::after {
    border: 0;
  }

  .dialog-body {
    max-height: 50vh;
  }

  .dialog-actions {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 30rpx;
  }
}
</style>
