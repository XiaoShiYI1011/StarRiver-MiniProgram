<template>
  <AppPage :scroll-into-view="scrollTarget">
    <template #mainContent>
      <view class="page-stack">
        <HomeHero :bound="isBound" @start="start" @learn="showCapabilities" />
        <view id="capabilities">
          <SectionHeading eyebrow="围绕长篇创作设计" title="写正文，也管理故事为什么成立" />
        </view>
        <CapabilityList />
        <SectionHeading eyebrow="从想法到章节" title="创作流程保持安静，故事始终在前面" />
        <CreationSteps />
        <SectionHeading eyebrow="常见问题" title="开始创作前，你可能想知道" />
        <FaqList />
        <view class="closing">
          <text class="closing-eyebrow">你的下一章</text>
          <text class="closing-title">把精力留给故事本身</text>
          <button class="primary-button" @tap="start">{{ isBound ? "查看我的创作" : "绑定账号继续创作" }} →</button>
        </view>
        <LegalFooter />
      </view>
    </template>
    <template #tabBar><BottomNav current="home" /></template>
  </AppPage>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import AppPage from "@/layout/components/pageContainer.vue";
import BottomNav from "@/components/layout/BottomNav.vue";
import LegalFooter from "@/components/layout/LegalFooter.vue";
import SectionHeading from "@/components/ui/SectionHeading.vue";
import HomeHero from "./components/HomeHero.vue";
import CapabilityList from "./components/CapabilityList.vue";
import CreationSteps from "./components/CreationSteps.vue";
import FaqList from "./components/FaqList.vue";
import { useStudio } from "@/composables/useStudio";
import { openBind, openMainTab } from "@/utils/navigation";

const { isBound, refresh } = useStudio();

onShow(() => {
  void refresh();
});

const scrollTarget = ref("");
const start = () => (isBound.value ? openMainTab("mine") : openBind());
const showCapabilities = async () => {
  scrollTarget.value = "";
  await nextTick();
  scrollTarget.value = "capabilities";
};
</script>

<style lang="scss" scoped>
.closing {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  align-items: center;
  padding: 44rpx 20rpx 16rpx;
  text-align: center;

  .closing-eyebrow {
    font-size: 22rpx;
    color: var(--accent);
  }

  .closing-title {
    font-size: 42rpx;
    font-weight: 700;
  }

  & .primary-button {
    width: auto;
  }
}
</style>
