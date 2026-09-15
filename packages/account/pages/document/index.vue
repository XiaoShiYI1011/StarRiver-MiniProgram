<template>
  <AppPage :title="title" subtitle="协议与说明" show-back @back-fallback="goHome">
    <template #mainContent>
      <view class="page-stack">
        <PageHeading :title="title" description="账号绑定与当前功能的数据处理说明。" />
        <view class="surface-card document-copy">
          <text class="document-heading">账号绑定说明</text>
          <text>
            你同意将当前微信身份与本人拥有的星河创作账号绑定。绑定只支持已激活账号；微信和邮箱在本小程序内均只能绑定一个账号。
          </text>
          <text v-if="kind === 'privacy'">
            绑定时，微信临时登录凭证、邮箱以及你选择的验证码或密码会发送至本服务后端验证。服务端保存微信标识与账号的绑定关系、协议同意时间及登录会话；验证码以加盐哈希保存，5
            分钟过期，不保存输入的明文密码或微信会话密钥。
          </text>
          <text v-else>
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
