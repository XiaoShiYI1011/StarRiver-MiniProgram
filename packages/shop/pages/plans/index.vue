<template>
  <AppPage>
    <template #mainContent>
      <view class="page-stack">
        <PageHeading title="套餐" description="选择适合你的创作额度。当前为演示套餐，模拟开通不扣款。" />
        <view v-if="loadError" class="empty-state">
          <text>{{ loadError }}</text>
          <button class="text-button" @tap="loadProducts">重新加载</button>
        </view>
        <PlanCard v-for="plan in planList" :key="plan.id" :plan="plan" @select="select" />
        <SectionHeading eyebrow="按需补量" title="创作加油包" />
        <PackGrid :packs="packList" @select="select" />
        <view class="notice-box">
          <AppIcon name="info" tone="muted" :size="16" />
          <text>开通前需绑定星河创作账号，权益可在网页端与小程序通用。当前可体验模拟开通，不会产生真实扣款。</text>
        </view>
        <LegalFooter />
      </view>
    </template>
    <template #tabBar><BottomNav current="plans" /></template>
    <template #dialogContainer>
      <CheckoutDialog
        :product="selected"
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
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AppPage from "@/layout/components/pageContainer.vue";
import BottomNav from "@/components/layout/BottomNav.vue";
import LegalFooter from "@/components/layout/LegalFooter.vue";
import PageHeading from "@/components/ui/PageHeading.vue";
import SectionHeading from "@/components/ui/SectionHeading.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import PlanCard from "../../components/PlanCard.vue";
import PackGrid from "../../components/PackGrid.vue";
import CheckoutDialog from "../../components/CheckoutDialog.vue";
import { useCheckout } from "../../composables/useCheckout";
import { studioService } from "@/services/studioService";
import { errorMessage } from "@/utils/format";
import type { Pack, Plan, Product } from "@/types/studio";

const products = ref<Product[]>([]);
const loadError = ref("");
const planList = computed(() => products.value.filter((item): item is Plan => item.kind === "plan"));
const packList = computed(() => products.value.filter((item): item is Pack => item.kind === "pack"));

const { selected, busy, error, select, close, confirm } = useCheckout();

const loadProducts = async () => {
  try {
    products.value = await studioService.getProducts();
    loadError.value = "";
  } catch (reason) {
    loadError.value = errorMessage(reason);
  }
};

onLoad(async (options) => {
  await loadProducts();
  const product = products.value.find((item) => item.id === options?.product);
  if (product) await select(product);
});
</script>
