<template>
  <AppPage :title="title" subtitle="协议与说明" show-back @back-fallback="goHome">
    <template #mainContent>
      <view class="page-stack">
        <PageHeading
          :title="title"
          :description="
            isWeChatAuth ? '账号绑定与当前功能的数据处理说明。' : '当前为界面演示说明，正式内容将在上线前补齐。'
          "
        />
        <view class="surface-card document-copy">
          <text class="document-heading">{{ isWeChatAuth ? "账号绑定说明" : "本地原型演示" }}</text>
          <text v-if="isWeChatAuth">
            你同意将当前微信身份与本人拥有的星河创作账号绑定。绑定只支持已激活账号；微信和邮箱在本小程序内均只能绑定一个账号。
          </text>
          <text v-else>本版本用于确认页面效果及操作流程，不代表正式服务条款或隐私政策。</text>
          <text v-if="kind === 'privacy' && isWeChatAuth">
            绑定时，微信临时登录凭证、邮箱以及你选择的验证码或密码会发送至本服务后端验证。服务端保存微信标识与账号的绑定关系、协议同意时间及登录会话；验证码以加盐哈希保存，5
            分钟过期，不保存输入的明文密码或微信会话密钥。
          </text>
          <text v-else-if="kind === 'privacy'">
            演示账号、订单和主题选择仅保存在当前设备。绑定表单不会发送邮件，也不会请求微信授权；请使用示例邮箱和演示密码，不要填写真实密码。
          </text>
          <text v-else>
            当前所有套餐、价格、创作积分与作品均为示例。模拟开通不会调用真实支付，也不会产生实际费用或开通正式权益。
          </text>
          <text v-if="isWeChatAuth">
            设备保存登录令牌以恢复会话。主动退出会撤销当前会话并停止自动登录，绑定关系仍保留。如需解除绑定或删除账号，请联系管理员。本版本不会读取微信好友或朋友圈。
          </text>
          <text v-else>正式上线前，将在此提供完整的服务条款、数据处理说明、用户权利与联系方式。</text>
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
import { isWeChatAuth } from "@/config/api";

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
