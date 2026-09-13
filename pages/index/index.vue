<template>
  <AppPage :scroll-top="scrollTop" @scroll="trackScroll">
    <template #mainContent>
      <view id="home-content" class="page-stack">
        <AuthStatusNotice />
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
import AuthStatusNotice from "@/components/layout/AuthStatusNotice.vue";

const { isBound, refresh } = useStudio();

onShow(() => {
  void refresh();
});

const scrollTop = ref(0);
let actualScrollTop = 0;
const trackScroll = (event: unknown) => {
  actualScrollTop = (event as { detail: { scrollTop: number } }).detail.scrollTop;
};
const start = () => (isBound.value ? openMainTab("mine") : openBind());
const showCapabilities = () => {
  // 小程序 scroll-into-view 无法可靠定位跨组件插槽中的节点。
  uni
    .createSelectorQuery()
    .select("#home-content")
    .boundingClientRect()
    .select("#capabilities")
    .boundingClientRect()
    .exec(async (nodes) => {
      const [content, target] = nodes as UniApp.NodeInfo[];
      if (typeof content?.top !== "number" || typeof target?.top !== "number") return;
      scrollTop.value = actualScrollTop;
      await nextTick();
      scrollTop.value = Math.max(0, target.top - content.top);
    });
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
