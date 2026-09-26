<template>
  <AppPage :scroll-into-view="rechargeScrollTarget">
    <template #mainContent>
      <view class="page-stack">
        <PageHeading
          title="套餐权益预览"
          :description="
            betaFreeMode ? '内测期间无需购买，可直接体验核心创作功能。' : '选择适合你的创作额度，权益与网页端通用。'
          "
        />
        <view v-if="loadError" class="empty-state">
          <text>{{ loadError }}</text>
          <view class="error-actions">
            <button class="secondary-button" @tap="loadAll">重新加载</button>
            <button v-if="!isBound" class="primary-button" @tap="openBind()">绑定账号</button>
          </view>
        </view>
        <template v-else>
          <PlanCard
            v-for="plan in products"
            :key="plan.id"
            :plan="plan"
            :beta-free-mode="betaFreeMode"
            :active="activePlanId === plan.id"
            @select="selectPlan"
            @activate="activePlanId = $event"
          />
          <view id="recharge-entry">
            <SectionHeading eyebrow="创作加油包" :title="betaFreeMode ? '内测期间无需充值' : '按需补充创作积分'" />
          </view>
          <RechargeCard
            v-if="!betaFreeMode && summary"
            :credits-per-yuan="summary.creditsPerYuan"
            :minimum-recharge-fen="summary.minimumRechargeFen"
            @select="selectRecharge"
          />
          <view v-if="betaFreeMode" class="notice-box">
            <AppIcon name="info" tone="muted" :size="16" />
            <text>当前处于内测阶段，套餐购买和充值暂未开放，可使用内测免费额度体验创作。</text>
          </view>
        </template>
        <LegalFooter />
      </view>
    </template>
    <template #tabBar><BottomNav current="plans" /></template>
    <template #dialogContainer>
      <CheckoutDialog
        v-if="!betaFreeMode"
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
import { computed, nextTick, ref, watch } from "vue";
import AppPage from "@/layout/components/pageContainer.vue";
import BottomNav from "@/components/layout/BottomNav.vue";
import LegalFooter from "@/components/layout/LegalFooter.vue";
import PageHeading from "@/components/ui/PageHeading.vue";
import SectionHeading from "@/components/ui/SectionHeading.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import RechargeCard from "../../components/RechargeCard.vue";
import CheckoutDialog from "../../components/CheckoutDialog.vue";
import { useCheckout } from "../../composables/useCheckout";
import PlanCard from "../../components/PlanCard.vue";
import { billingApi } from "@/api/billing";
import { miniAuthClient } from "@/services/auth/miniAuthClient";
import { useStudio } from "@/composables/useStudio";
import { openBind } from "@/utils/navigation";
import { errorMessage } from "@/utils/format";
import { ProductStatus } from "@/packages/shop/types/billing";
import type { CreditSummary, WritingPlanProduct } from "@/types/billing";

const products = ref<WritingPlanProduct[]>([]);
const activePlanId = ref("");
const rechargeScrollTarget = ref("");
let requestedRecharge = false;
const summary = ref<CreditSummary | null>(null);
// 未登录/未加载时不假定内测模式，避免向未绑定用户展示内测文案；以内测接口返回为准。
const betaFreeMode = computed(() => summary.value?.betaFreeMode === true);
const { selected, busy, error, select, selectRecharge, close, confirm } = useCheckout();
const selectPlan = (plan: WritingPlanProduct) => {
  activePlanId.value = plan.id;
  if (!betaFreeMode.value) return select(plan);
};
const loadError = ref("");
const { isBound } = useStudio();
let requestedProductId = "";
let resumeCheckout = false;

const loadAll = async () => {
  loadError.value = "";
  try {
    // 套餐与充值规则均需登录；未绑定时先给出绑定引导。
    const user = await miniAuthClient.restore();
    if (!user) throw new Error("请先绑定星河创作账号");
    const [list, creditSummary] = await Promise.all([billingApi.queryProducts(), billingApi.queryCreditSummary()]);
    summary.value = creditSummary;
    products.value = list
      .filter((product) => product.status === ProductStatus.Enabled)
      .sort((left, right) => left.displayOrder - right.displayOrder);
    if (!products.value.some((plan) => plan.id === activePlanId.value)) {
      activePlanId.value = products.value.find((plan) => plan.isRecommended)?.id ?? products.value[0]?.id ?? "";
    }
    if (requestedProductId) {
      const product = products.value.find((item) => item.id === requestedProductId);
      if (!product) throw new Error("所选商品不存在或已停售，请返回网页重新选择");
      activePlanId.value = product.id;
      if (resumeCheckout && !betaFreeMode.value) {
        await select(product);
        if (selected.value) resumeCheckout = false;
      }
    }
    if (requestedRecharge) {
      await nextTick();
      rechargeScrollTarget.value = "recharge-entry";
      requestedRecharge = false;
    }
  } catch (reason) {
    loadError.value = errorMessage(reason);
    products.value = [];
  }
};

watch(selected, (value, previous) => {
  if (!value && previous) void loadAll();
});

onLoad(async (options) => {
  requestedProductId = typeof options?.product === "string" ? options.product : "";
  requestedRecharge = options?.recharge === "1";
  resumeCheckout = options?.checkout === "1";
  await loadAll();
});
</script>

<style lang="scss" scoped>
.error-actions {
  display: flex;
  gap: 16rpx;
  justify-content: center;
  margin-top: 60rpx;

  button {
    min-width: 200rpx;
    margin: 0;
  }
}
</style>
