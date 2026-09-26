<template>
  <AppPage>
    <template #mainContent>
      <view class="page-stack">
        <PageHeading
          :title="requestedRecharge ? '创作积分充值' : requestedProductId ? '确认订阅套餐' : '套餐与创作积分'"
          :description="
            betaFreeMode
              ? '内测期间无需购买，可直接体验核心创作功能。'
              : requestedRecharge || requestedProductId
                ? '请确认扫码选择的商品，权益与网页端通用。'
                : '选择套餐或按需补充创作积分，权益与网页端通用。'
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
          <view v-if="!requestedProductId" id="recharge-entry">
            <SectionHeading eyebrow="创作加油包" :title="betaFreeMode ? '内测期间暂不开放' : '按需补充创作积分'" />
            <RechargeCard
              v-if="summary"
              :credits-per-yuan="summary.creditsPerYuan"
              :minimum-recharge-fen="summary.minimumRechargeFen"
              :disabled="betaFreeMode"
              @select="selectRecharge"
            />
          </view>
          <view v-if="betaFreeMode" class="notice-box">
            <AppIcon name="info" tone="muted" :size="16" />
            <text>当前处于内测阶段，套餐购买和充值暂未开放，可使用内测免费额度体验创作。</text>
          </view>
          <SectionHeading
            v-if="!requestedRecharge"
            eyebrow="WritingPlan"
            :title="requestedProductId ? '所选套餐' : '订阅套餐'"
          />
          <PlanCard
            v-for="plan in visibleProducts"
            :key="plan.id"
            :plan="plan"
            :beta-free-mode="betaFreeMode"
            :active="activePlanId === plan.id"
            @select="selectPlan"
            @activate="activePlanId = $event"
          />
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
import { computed, ref, watch } from "vue";
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
const requestedRecharge = ref(false);
const requestedProductId = ref("");
const visibleProducts = computed(() =>
  requestedRecharge.value
    ? []
    : requestedProductId.value
      ? products.value.filter((product) => product.id === requestedProductId.value)
      : products.value
);
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
let resumeCheckout = false;

const loadAll = async () => {
  loadError.value = "";
  try {
    if (requestedProductId.value && requestedRecharge.value) throw new Error("商品参数无效，请从网页重新扫码");
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
    if (requestedProductId.value) {
      const product = products.value.find((item) => item.id === requestedProductId.value);
      if (!product) throw new Error("所选商品不存在或已停售，请返回网页重新选择");
      activePlanId.value = product.id;
      if (resumeCheckout && !betaFreeMode.value) {
        await select(product);
        if (selected.value) resumeCheckout = false;
      }
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
  requestedProductId.value = typeof options?.product === "string" ? options.product : "";
  requestedRecharge.value = options?.recharge === "1";
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
