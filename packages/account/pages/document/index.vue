<template>
  <AppPage :title="title" subtitle="协议与说明" show-back @back-fallback="goHome">
    <template #mainContent>
      <view class="page-stack">
        <PageHeading :title="title" description="账号绑定与当前功能的数据处理说明。" />
        <template v-if="kind === 'privacy'">
          <view class="surface-card document-copy">
            <text class="document-heading">星河创作小程序隐私政策</text>
            <text>修订日期：{{ privacyPolicy.revisedAt }}</text>
            <text>{{ privacyPolicy.notice }}</text>
          </view>
          <view v-for="section in privacyPolicy.sections" :key="section.id" class="surface-card document-copy">
            <text class="document-heading">{{ section.title }}</text>
            <text v-for="paragraph in section.paragraphs" :key="paragraph" selectable>{{ paragraph }}</text>
          </view>
        </template>
        <view v-else class="surface-card document-copy">
          <text class="document-heading">账号绑定说明</text>
          <text>
            你同意将当前微信身份与本人拥有的星河创作账号绑定。绑定只支持已激活账号；微信和邮箱在本小程序内均只能绑定一个账号。
          </text>
          <text>
            套餐、价格、创作积分与作品以后端数据为准；支付能力内测期间暂未开放，开通与充值以内测规则执行。
          </text>
          <text>
            设备保存登录令牌以恢复会话。主动退出会撤销当前会话并停止自动登录，绑定关系仍保留。如需解除绑定或删除账号，请联系管理员。本版本不会读取微信好友或朋友圈。
          </text>
        </view>
      </view>
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AppPage from "@/layout/components/pageContainer.vue";
import PageHeading from "@/components/ui/PageHeading.vue";
import { goHome } from "@/utils/navigation";
import { privacyPolicy } from "@/packages/account/content/privacy";

const kind = ref("terms");
const title = computed(() => (kind.value === "privacy" ? "隐私政策" : "用户协议"));

onLoad((options) => {
  kind.value = options?.kind === "privacy" ? "privacy" : "terms";
});
</script>

<style lang="scss" scoped>
.document-copy {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  font-size: 27rpx;
  line-height: 1.85;
  color: var(--ink-soft);

  .document-heading {
    font-size: 34rpx;
    font-weight: 700;
    color: var(--ink);
  }
}
</style>
