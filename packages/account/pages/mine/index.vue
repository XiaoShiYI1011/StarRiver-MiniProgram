<template>
  <AppPage refresher-enabled :refresher-triggered="refreshing" @refresh="reload">
    <template #mainContent>
      <view class="page-stack">
        <PageHeading title="我的" description="管理账号与创作权益。写作请在电脑端进行。" />
        <AuthStatusNotice />
        <AccountCard :account="account" @bind="openBind()" />
        <EntitlementCard v-if="account" :account="account" />
        <SectionHeading eyebrow="创作" title="我的作品" />
        <view class="cell-group">
          <InfoCell
            icon="book"
            :title="`我的作品（${dashboard.novels.length} 本）`"
            description="小程序暂不支持写作，去电脑端继续创作"
            @tap="openNovels"
          />
          <view class="cell-group__divider" />
          <InfoCell icon="clipboard" title="电脑端创作" description="正式网址待上线后提供" @tap="copyWebsite" />
        </view>
        <SectionHeading eyebrow="交易" title="订单记录" action="全部" @action="openOrders" />
        <OrderList :orders="dashboard.orders.slice(0, 3)" @select="selectedOrder = $event" />
        <SectionHeading eyebrow="通用" title="协议与关于" />
        <view class="cell-group">
          <InfoCell icon="document" title="用户协议" @tap="openDocument('terms')" />
          <view class="cell-group__divider" />
          <InfoCell icon="shield" title="隐私政策" @tap="openDocument('privacy')" />
          <view class="cell-group__divider" />
          <InfoCell icon="info" title="版本" value="v0.1.0" @tap="showVersion" />
        </view>
        <button v-if="account" class="danger-button" @tap="logoutOpen = true">退出登录</button>
        <LegalFooter />
      </view>
    </template>
    <template #tabBar><BottomNav current="mine" /></template>
    <template #dialogContainer>
      <OrderDetailDialog :order="selectedOrder" @close="selectedOrder = null" />
      <AppDialog :open="logoutOpen" title="退出登录" :busy="loggingOut" @close="logoutOpen = false">
        <text class="muted-text">退出将撤销当前登录会话，微信绑定关系仍保留；再次绑定原账号即可登录。</text>
        <template #actions>
          <view class="dialog-button-stack">
            <button class="danger-button" :disabled="loggingOut" @tap="logout">确认退出</button>
            <button class="secondary-button" @tap="logoutOpen = false">继续使用</button>
          </view>
        </template>
      </AppDialog>
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import AppPage from "@/layout/components/pageContainer.vue";
import BottomNav from "@/components/layout/BottomNav.vue";
import LegalFooter from "@/components/layout/LegalFooter.vue";
import PageHeading from "@/components/ui/PageHeading.vue";
import SectionHeading from "@/components/ui/SectionHeading.vue";
import InfoCell from "@/components/ui/InfoCell.vue";
import AppDialog from "@/components/ui/AppDialog.vue";
import AccountCard from "../../components/AccountCard.vue";
import EntitlementCard from "../../components/EntitlementCard.vue";
import OrderList from "../../components/OrderList.vue";
import OrderDetailDialog from "../../components/OrderDetailDialog.vue";
import { useStudio } from "@/composables/useStudio";
import { openBind, openDocument } from "@/utils/navigation";
import { miniAuthClient } from "@/services/auth/miniAuthClient";
import { errorMessage } from "@/utils/format";
import AuthStatusNotice from "@/components/layout/AuthStatusNotice.vue";
import type { BillingOrder } from "@/types/billing";

const { dashboard, account, refresh } = useStudio();
const refreshing = ref(false);
const selectedOrder = ref<BillingOrder | null>(null);
const logoutOpen = ref(false);
const loggingOut = ref(false);

const reload = async () => {
  refreshing.value = true;
  try {
    await refresh();
  } finally {
    refreshing.value = false;
  }
};

onShow(() => {
  void refresh();
});

const openNovels = () => (account.value ? uni.navigateTo({ url: "/packages/account/pages/novels/index" }) : openBind());
const openOrders = () => (account.value ? uni.navigateTo({ url: "/packages/account/pages/orders/index" }) : openBind());
const copyWebsite = () => uni.showToast({ title: "电脑端网址将在正式上线后提供", icon: "none" });
const showVersion = () => uni.showToast({ title: "星河创作 v0.1.0", icon: "none" });
const logout = async () => {
  if (loggingOut.value) return;
  loggingOut.value = true;
  try {
    await miniAuthClient.logout();
    await refresh();
    logoutOpen.value = false;
    uni.showToast({ title: "已退出登录", icon: "none" });
  } catch (reason) {
    uni.showToast({ title: errorMessage(reason), icon: "none" });
  } finally {
    loggingOut.value = false;
  }
};
</script>
