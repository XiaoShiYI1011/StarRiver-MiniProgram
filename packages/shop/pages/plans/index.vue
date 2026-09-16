<template>
  <AppPage>
    <template #mainContent>
      <view class="page-stack">
        <PageHeading title="套餐" description="选择适合你的创作额度，权益与网页端通用。" />
        <view v-if="loadError" class="empty-state">
          <text>{{ loadError }}</text>
          <view class="error-actions">
            <button class="secondary-button" @tap="loadAll">重新加载</button>
            <button v-if="!isBound" class="primary-button" @tap="openBind()">绑定账号</button>
          </view>
        </view>
        <template v-else>
          <PlanCard v-for="plan in products" :key="plan.id" :plan="plan" @select="select" />
          <SectionHeading eyebrow="按需补量" title="创作积分充值" />
          <RechargeCard
            v-if="recharge"
            :credits-per-yuan="recharge.creditsPerYuan"
            :minimum-recharge-fen="recharge.minimumRechargeFen"
            @select="selectRecharge"
          />
          <view class="notice-box">
            <AppIcon name="info" tone="muted" :size="16" />
            <text>开通前需绑定星河创作账号，支付通过微信小程序虚拟支付完成，权益到账后可在“我的 - 订单记录”查看。</text>
          </view>
        </template>
        <LegalFooter />
      </view>
    </template>
    <template #tabBar><BottomNav current="plans" /></template>
    <template #dialogContainer>
      <CheckoutDialog
        :selection="selected"
        :busy="busy"
        :error="error"
        @close="close"
        @confirm="confirm(true)"
        @later="confirm(false)"
      />
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";
import AppPage from "@/layout/components/pageContainer.vue";
import BottomNav from "@/components/layout/BottomNav.vue";
import LegalFooter from "@/components/layout/LegalFooter.vue";
import PageHeading from "@/components/ui/PageHeading.vue";
import SectionHeading from "@/components/ui/SectionHeading.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import PlanCard from "../../components/PlanCard.vue";
import RechargeCard from "../../components/RechargeCard.vue";
import CheckoutDialog from "../../components/CheckoutDialog.vue";
import { useCheckout } from "../../composables/useCheckout";
import { billingApi } from "@/api/billing";
import { miniAuthClient } from "@/services/auth/miniAuthClient";
import { useStudio } from "@/composables/useStudio";
import { openBind } from "@/utils/navigation";
import { errorMessage } from "@/utils/format";
import { ProductStatus } from "@/packages/shop/types/billing";
import type { CreditSummary, WritingPlanProduct } from "@/types/billing";

const products = ref<WritingPlanProduct[]>([]);
const recharge = ref<Pick<CreditSummary, "creditsPerYuan" | "minimumRechargeFen"> | null>(null);
const loadError = ref("");
const { isBound } = useStudio();

const { selected, busy, error, select, selectRecharge, close, confirm } = useCheckout();

const loadAll = async () => {
  loadError.value = "";
  try {
    // 套餐与充值规则均需登录；未绑定时先给出绑定引导。
    const user = await miniAuthClient.restore();
    if (!user) throw new Error("请先绑定星河创作账号");
    const [list, summary] = await Promise.all([billingApi.queryProducts(), billingApi.queryCreditSummary()]);
    products.value = list
      .filter((product) => product.status === ProductStatus.Enabled)
      .sort((left, right) => left.displayOrder - right.displayOrder);
    recharge.value = { creditsPerYuan: summary.creditsPerYuan, minimumRechargeFen: summary.minimumRechargeFen };
  } catch (reason) {
    loadError.value = errorMessage(reason);
    products.value = [];
    recharge.value = null;
  }
};

onLoad(async (options) => {
  await loadAll();
  const productId = typeof options?.product === "string" ? options.product : "";
  const product = products.value.find((item) => item.id === productId);
  if (product) await select(product);
});
</script>

<style lang="scss" scoped>
.error-actions {
  display: flex;
  gap: 16rpx;
  justify-content: center;

  button {
    min-width: 200rpx;
    margin: 0;
  }
}
</style>
