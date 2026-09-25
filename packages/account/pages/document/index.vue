<template>
  <AppPage :title="title" subtitle="" show-back @back-fallback="goHome">
    <template #mainContent>
      <view class="document-copy">
        <text class="document-title">{{ doc.title }}</text>
        <text class="document-meta">
          版本：{{ doc.version }} · 更新日期：{{ doc.revisedAt }} · 生效日期：{{ doc.effectiveAt }}
        </text>
        <text v-for="paragraph in doc.intro" :key="paragraph" selectable>{{ paragraph }}</text>
        <template v-for="chapter in doc.chapters" :key="chapter.title">
          <text class="document-chapter">{{ chapter.title }}</text>
          <text v-for="clause in chapter.clauses" :key="clause" selectable>{{ clause }}</text>
        </template>
      </view>
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AppPage from "@/layout/components/pageContainer.vue";
import { goHome } from "@/utils/navigation";
import { userAgreement } from "@/packages/account/content/terms";
import { privacyPolicy } from "@/packages/account/content/privacy";

const kind = ref("terms");
const title = computed(() => (kind.value === "privacy" ? "隐私政策" : "用户协议"));
const doc = computed(() => (kind.value === "privacy" ? privacyPolicy : userAgreement));

onLoad((options) => {
  kind.value = options?.kind === "privacy" ? "privacy" : "terms";
});
</script>

<style lang="scss" scoped>
.document-copy {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: var(--ink);
}

.document-title {
  font-size: 34rpx;
  font-weight: 700;
  text-align: center;
}

.document-meta {
  font-size: 24rpx;
}

.document-chapter {
  margin-top: 12rpx;
  font-weight: 700;
}
</style>
