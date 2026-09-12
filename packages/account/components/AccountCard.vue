<template>
  <view class="surface-card account-card">
    <view class="account-profile">
      <text class="account-avatar">写</text>
      <view class="account-who">
        <text class="account-email">{{ account ? account.email : "还未绑定账号" }}</text>
        <text class="account-description">
          {{ account ? `微信已绑定 · 注册于 ${account.registeredAt}` : "绑定后查看作品、权益与订单" }}
        </text>
      </view>
      <text v-if="account" class="status-tag">已绑定</text>
    </view>
    <button v-if="!account" class="primary-button account-bind" @tap="emit('bind')">绑定星河创作账号</button>
  </view>
</template>

<script setup lang="ts">
import type { Account } from "@/types/studio";
defineProps<{ account: Account | null }>();
const emit = defineEmits<{ bind: [] }>();
</script>

<style lang="scss" scoped>
.account-card {
  .account-profile {
    display: flex;
    gap: 24rpx;
    align-items: center;
  }

  .account-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 108rpx;
    height: 108rpx;
    font-size: 40rpx;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(140deg, var(--accent), var(--brand-cyan));
    border-radius: 50%;
  }

  .account-who {
    flex: 1;
    min-width: 0;
  }

  .account-email {
    display: block;
    font-size: 30rpx;
    font-weight: 650;
    overflow-wrap: anywhere;
  }

  .account-description {
    display: block;
    margin-top: 4rpx;
    font-size: 22rpx;
    color: var(--ink-soft);
  }

  .account-bind {
    margin-top: 28rpx;
  }

  @media (width <= 350px) {
    .account-profile {
      flex-wrap: wrap;
    }
  }
}
</style>
