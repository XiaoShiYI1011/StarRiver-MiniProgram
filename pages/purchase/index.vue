<template>
  <AppPage title="扫码购买" subtitle="权益与网页端同步" show-back @back-fallback="goHome">
    <template #mainContent>
      <view class="page-stack purchase-entry">
        <PageHeading
          :title="preview?.action === 'recharge' ? '创作积分充值' : '购买 WritingPlan'"
          description="确认购买账号与商品后继续。"
        />
        <view v-if="preview" class="surface-card purchase-entry__summary">
          <text class="purchase-entry__name">{{ preview.productName }}</text>
          <text v-if="preview.action === 'recharge'" class="purchase-entry__price">
            最低充值 ¥{{ formatYuan(preview.priceFen) }}，进入充值页后选择金额
          </text>
          <text v-else class="purchase-entry__price">
            {{ preview.action === "upgrade" ? "预计补差 ¥" : "¥" }}{{ formatYuan(preview.priceFen)
            }}{{ preview.action === "upgrade" ? "，以确认页为准" : ` / ${preview.durationDays} 天` }}
          </text>
          <text>购买账号：{{ preview.account }}</text>
          <text class="muted-text">请确认这是你在网页端登录的账号。</text>
          <template v-if="preview.requiresBinding">
            <checkbox-group @change="agreed = $event.detail.value.includes('agree')">
              <label class="purchase-entry__agreement">
                <checkbox value="agree" :checked="agreed" :disabled="busy" color="#1b4bff" />
                <view>
                  我确认绑定以上账号，并已阅读、同意
                  <text class="purchase-entry__link" @tap.stop="openDocument('terms')">《用户协议》</text>
                  与
                  <text class="purchase-entry__link" @tap.stop="openDocument('privacy')">《隐私政策》</text>
                  。
                </view>
              </label>
            </checkbox-group>
            <button class="primary-button" :disabled="busy || !agreed" :loading="busy" @tap="continuePurchase">
              确认绑定并继续
            </button>
          </template>
        </view>
        <text v-if="busy" class="muted-text">正在验证并打开商品…</text>
        <view v-if="error" class="notice-box">
          <text class="error-text">{{ error }}</text>
        </view>
        <button v-if="error && !finished" class="secondary-button" :disabled="busy" @tap="loadPreview">重试</button>
        <button v-if="finished && error" class="primary-button" @tap="openCheckout">继续前往商品</button>
        <text class="muted-text">二维码过期或已使用时，请在网页刷新后重新扫码。</text>
      </view>
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { onUnmounted, ref } from "vue";
import AppPage from "@/layout/components/pageContainer.vue";
import PageHeading from "@/components/ui/PageHeading.vue";
import { miniPurchaseApi, type PurchasePreview } from "@/api/miniPurchase";
import { miniAuthClient } from "@/services/auth/miniAuthClient";
import { getWeChatCode } from "@/services/auth/wechatLogin";
import { parsePurchaseScene, purchaseCheckoutQuery } from "@/utils/purchaseScene";
import { errorMessage, formatYuan } from "@/utils/format";
import { goHome, mainRoutes, openDocument } from "@/utils/navigation";

const preview = ref<PurchasePreview | null>(null);
const agreed = ref(false);
const busy = ref(false);
const error = ref("");
const finished = ref(false);
let ticket = "";
let productId = "";
let disposed = false;
const openCheckout = () => {
  if (disposed || !productId) return;
  uni.redirectTo({
    url: `${mainRoutes.plans}?${purchaseCheckoutQuery(productId)}`,
    fail: () => {
      error.value = "商品页打开失败，请点击继续前往商品";
    },
  });
};
const continuePurchase = async () => {
  if (busy.value || !preview.value || (preview.value.requiresBinding && !agreed.value)) return;
  busy.value = true;
  error.value = "";
  try {
    productId = await miniAuthClient.loginForPurchase(async () => {
      const result = await miniPurchaseApi.consume(ticket, await getWeChatCode(), agreed.value);
      return result;
    });
    finished.value = true;
    openCheckout();
  } catch (reason) {
    error.value = errorMessage(reason);
  } finally {
    busy.value = false;
  }
};
const loadPreview = async () => {
  if (busy.value || finished.value) return;
  if (!ticket) {
    error.value = "购买二维码无效，请从网页重新扫码";
    return;
  }
  busy.value = true;
  error.value = "";
  preview.value = null;
  agreed.value = false;
  try {
    const result = await miniPurchaseApi.preview(ticket, await getWeChatCode());
    if (disposed) return;
    preview.value = result;
  } catch (reason) {
    error.value = errorMessage(reason);
  } finally {
    busy.value = false;
  }
  if (!disposed && preview.value && !preview.value.requiresBinding) await continuePurchase();
};
onLoad((options) => {
  ticket = parsePurchaseScene(options?.scene);
  void loadPreview();
});
onUnmounted(() => {
  disposed = true;
});
</script>

<style lang="scss" scoped>
.purchase-entry {
  &__summary {
    display: flex;
    flex-direction: column;
    gap: 28rpx;
    padding: 36rpx;
  }

  &__name {
    font-size: 36rpx;
    font-weight: 650;
  }

  &__price {
    font-size: 32rpx;
    font-weight: 600;
  }

  &__agreement {
    display: flex;
    gap: 12rpx;
    align-items: flex-start;
    font-size: 24rpx;
    line-height: 1.8;
  }

  &__link {
    color: var(--accent);
  }
}
</style>
