<template>
  <view class="page-stack binding-form-page">
    <view class="surface-card">
      <form @submit="submit">
        <view class="binding-form">
          <view class="form-field">
            <text class="field-label">星河创作账号邮箱</text>
            <input
              v-model="email"
              class="field-input"
              type="text"
              :maxlength="320"
              placeholder="you@example.com"
              aria-label="星河创作账号邮箱"
              :disabled="busy"
            />
          </view>
          <view class="form-field">
            <text class="field-label">{{ mode === "code" ? "邮箱验证码" : "账号密码" }}</text>
            <view class="field-row">
              <input
                v-model="credential"
                class="field-input"
                :type="mode === 'code' ? 'number' : 'text'"
                :password="mode === 'password'"
                :maxlength="mode === 'code' ? 6 : 128"
                :placeholder="mode === 'code' ? '6 位验证码' : '请输入密码'"
                :aria-label="mode === 'code' ? '邮箱验证码' : '账号密码'"
                :disabled="busy"
              />
              <button
                v-if="mode === 'code'"
                class="code-button"
                :class="{ 'code-button--disabled': !canSend || busy }"
                :disabled="!canSend || busy"
                @tap="requestCode"
              >
                {{ sending ? "获取中" : remaining ? `${remaining}s 后重试` : "获取验证码" }}
              </button>
            </view>
          </view>
          <text v-if="codeSent && mode === 'code'" class="code-hint">
            若邮箱对应已激活账号，验证码将发送至该邮箱，5 分钟内有效。
          </text>
          <checkbox-group @change="agreed = $event.detail.value.includes('agree')">
            <label class="agreement">
              <checkbox
                class="agreement-check"
                value="agree"
                :checked="agreed"
                :disabled="busy"
                color="#1b4bff"
                aria-label="同意用户协议和隐私政策"
              />
              <view>
                我已阅读并同意
                <text class="agreement-link" @tap.stop="openDocument('terms')">《用户协议》</text>
                与
                <text class="agreement-link" @tap.stop="openDocument('privacy')">《隐私政策》</text>
                ，确认对所创作内容拥有合法权利。
                <text class="agreement-note">绑定会验证微信身份及邮箱凭证，权益与订单以后端数据为准。</text>
              </view>
            </label>
          </checkbox-group>
          <text v-if="error" class="error-text" role="alert">{{ error }}</text>
          <button class="primary-button" form-type="submit" :disabled="busy" :loading="busy">绑定并登录</button>
        </view>
      </form>
      <view class="binding-divider">
        <view class="binding-divider__line" />
        <text>或</text>
        <view class="binding-divider__line" />
      </view>
      <button class="text-button binding-switch" :disabled="busy" @tap="toggleMode">
        {{ mode === "code" ? "使用邮箱密码登录并绑定" : "使用邮箱验证码登录并绑定" }}
      </button>
      <text class="binding-note">请使用已激活的星河创作账号。没有账号请先在电脑端注册，或联系管理员。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useBinding } from "../composables/useBinding";
import { openDocument } from "@/utils/navigation";

const emit = defineEmits<{ success: [] }>();
const {
  email,
  credential,
  mode,
  agreed,
  error,
  busy,
  sending,
  remaining,
  codeSent,
  canSend,
  requestCode,
  toggleMode,
  submit,
} = useBinding(() => emit("success"));
</script>

<style lang="scss" scoped>
.binding-form-page {
  .binding-form {
    display: flex;
    flex-direction: column;
    gap: 28rpx;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    > .field-input {
      flex: none;
    }
  }

  .field-label {
    font-size: 24rpx;
    font-weight: 650;
    color: var(--ink-muted);
  }

  .field-input {
    box-sizing: border-box;
    flex: 1;
    width: 100%;
    min-width: 0;
    height: 96rpx;
    padding: 0 28rpx;
    font-size: 30rpx;
    color: var(--ink);
    background: var(--paper-inset);
    border: 1px solid var(--line);
    border-radius: 26rpx;
  }

  .field-row {
    display: flex;
    gap: 16rpx;
  }

  .code-button {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    min-height: 96rpx;
    padding: 0 20rpx;
    margin: 0;
    font-size: 25rpx;
    font-weight: 650;
    line-height: 1.4;
    color: var(--accent);
    background: var(--accent-wash);
    border-radius: 26rpx;
  }

  .code-button::after {
    border: 0;
  }

  .code-button--disabled {
    color: var(--ink-faint);
  }

  .code-hint {
    font-size: 24rpx;
    color: var(--accent);
  }

  .binding-divider {
    display: flex;
    gap: 24rpx;
    align-items: center;
    margin: 32rpx 0 24rpx;
    font-size: 24rpx;
    color: var(--ink-faint);
  }

  .binding-divider__line {
    flex: 1;
    height: 1px;
    background: var(--line);
  }

  .binding-switch {
    display: flex;
    width: 100%;
    font-size: 25rpx;
  }

  .binding-note {
    display: block;
    margin-top: 16rpx;
    font-size: 24rpx;
    color: var(--ink-faint);
    text-align: center;
  }

  .agreement {
    display: flex;
    gap: 12rpx;
    align-items: flex-start;
    padding: 0 12rpx;
    font-size: 24rpx;
    line-height: 1.6;
    color: var(--ink-soft);
  }

  .agreement-check {
    display: block;
    flex-shrink: 0;
  }

  .agreement-link {
    color: var(--accent);
  }

  .agreement-note {
    display: block;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: var(--ink-faint);
  }
}
</style>
