<template>
  <AppPage title="我的作品" subtitle="每一个故事，都值得继续" show-back @back-fallback="goHome">
    <template #mainContent>
      <view class="page-stack">
        <PageHeading title="我的作品" :description="`共 ${dashboard.novels.length} 本作品，示例内容仅用于展示。`" />
        <view class="notice-box">小程序暂不支持写作，请在电脑端继续编辑章节。</view>
        <NovelCard v-for="novel in dashboard.novels" :key="novel.id" :novel="novel" />
        <text v-if="!dashboard.novels.length" class="empty-state">暂无作品，绑定账号后可查看</text>
      </view>
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import AppPage from "@/layout/components/pageContainer.vue";
import PageHeading from "@/components/ui/PageHeading.vue";
import NovelCard from "../../components/NovelCard.vue";
import { useStudio } from "@/composables/useStudio";
import { goHome } from "@/utils/navigation";

const { dashboard, refresh } = useStudio();

onShow(() => {
  void refresh();
});
</script>
