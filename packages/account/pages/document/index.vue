<template>
  <AppPage :title="title" subtitle="协议与说明" show-back @back-fallback="goHome">
    <template #mainContent>
      <view class="page-stack">
        <PageHeading :title="title" description="当前为界面演示说明，正式内容将在上线前补齐。" />
        <view class="surface-card document-copy">
          <text class="document-heading">本地原型演示</text>
          <text>本版本用于确认页面效果及操作流程，不代表正式服务条款或隐私政策。</text>
          <text v-if="kind === 'privacy'">
            演示账号、订单和主题选择仅保存在当前设备。绑定表单不会发送邮件，也不会请求微信授权；请使用示例邮箱和演示密码，不要填写真实密码。
          </text>
          <text v-else>
            当前所有套餐、价格、创作积分与作品均为示例。模拟开通不会调用真实支付，也不会产生实际费用或开通正式权益。
          </text>
          <text>正式上线前，将在此提供完整的服务条款、数据处理说明、用户权利与联系方式。</text>
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
