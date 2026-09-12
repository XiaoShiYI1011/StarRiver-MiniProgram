<template>
  <AppPage title="绑定账号" subtitle="让创作在不同设备间延续" show-back @back-fallback="goHome">
    <template #mainContent>
      <view class="page-stack bind-page">
        <PageHeading title="绑定账号" description="绑定后，即可在小程序中查看账号的作品、章节与创作权益。" />
        <view class="surface-card">
          <view class="bind-identity">
            <text class="identity-avatar">微</text>
            <view>
              <text class="identity-title">微信用户</text>
              <text class="identity-note">演示登录态 · 无需真实微信授权</text>
            </view>
          </view>
        </view>
        <BindingForm @success="finish" />
        <text class="binding-footer">仅演示账号绑定流程，不会获取你的微信好友与朋友圈信息</text>
      </view>
    </template>
  </AppPage>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AppPage from "@/layout/components/pageContainer.vue";
import PageHeading from "@/components/ui/PageHeading.vue";
import BindingForm from "../../components/BindingForm.vue";
import { goHome, mainRoutes } from "@/utils/navigation";

const productId = ref("");

onLoad((options) => {
  productId.value = typeof options?.product === "string" ? options.product : "";
});

const finish = () => {
  const url = productId.value ? `${mainRoutes.plans}?product=${encodeURIComponent(productId.value)}` : mainRoutes.mine;
  uni.reLaunch({ url, success: () => uni.showToast({ title: "绑定成功", icon: "success" }) });
};
</script>

<style lang="scss" scoped>
.bind-page {
  .bind-identity {
    display: flex;
    gap: 24rpx;
    align-items: center;
    padding: 28rpx 30rpx;
    background: var(--paper-inset);
    border-radius: 32rpx;
  }

  .identity-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 88rpx;
    height: 88rpx;
    font-size: 32rpx;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(140deg, #2dc100, #2dfcd7);
    border-radius: 50%;
  }

  .identity-title {
    display: block;
    font-size: 27rpx;
    font-weight: 650;
  }

  .identity-note {
    display: block;
    margin-top: 4rpx;
    font-size: 22rpx;
    color: var(--ink-soft);
  }

  .binding-footer {
    padding: 12rpx;
    font-size: 22rpx;
    color: var(--ink-faint);
    text-align: center;
  }
}
</style>
