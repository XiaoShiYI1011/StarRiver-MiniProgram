<template>
  <view class="app-page" :class="[`app-page--${theme}`, { 'app-page--safe-bottom': safeAreaBottom }]">
    <view v-if="showNavigation" class="app-page__navigation" :style="navigationStyle">
      <view class="app-page__navigation-inner" :style="{ minHeight: `${metrics.navigationHeight}px` }">
        <slot name="navigationBar">
          <button v-if="showBack" class="app-page__icon-button" aria-label="返回上一页" @tap="handleBack">
            <view class="app-page__back-icon" />
          </button>
          <image v-else-if="logo" class="app-page__logo" :src="logo" mode="aspectFit" />
          <view class="app-page__brand">
            <text class="app-page__title">{{ title }}</text>
            <text v-if="subtitle" class="app-page__subtitle">{{ subtitle }}</text>
          </view>
          <view class="app-page__navigation-actions">
            <slot name="navigationActions" />
            <button
              v-if="showThemeToggle"
              class="app-page__icon-button"
              :aria-label="theme === 'dark' ? '切换浅色主题' : '切换深色主题'"
              @tap="toggleTheme"
            >
              <AppIcon :name="theme === 'dark' ? 'moon' : 'sun'" tone="muted" :size="18" />
            </button>
          </view>
        </slot>
      </view>
    </view>
    <view v-if="$slots.pageHeader" class="app-page__header">
      <slot name="pageHeader" />
    </view>
    <view v-if="$slots.tabContainer" class="app-page__tabs">
      <slot name="tabContainer" />
    </view>
    <view v-if="$slots.searchContainer || $slots.tableActionBar" class="app-page__toolbar">
      <view v-if="$slots.searchContainer" class="app-page__search">
        <slot name="searchContainer" />
      </view>
      <view v-if="$slots.tableActionBar" class="app-page__actions">
        <slot name="tableActionBar" />
      </view>
    </view>
    <scroll-view
      class="app-page__scroll"
      scroll-y
      :scroll-top="scrollTop"
      :scroll-into-view="scrollIntoView"
      :scroll-with-animation="scrollWithAnimation"
      :lower-threshold="lowerThreshold"
      :refresher-enabled="refresherEnabled"
      :refresher-triggered="refresherTriggered"
      :refresher-background="theme === 'dark' ? '#05070d' : '#f5f7fb'"
      :refresher-default-style="theme === 'dark' ? 'white' : 'black'"
      @scroll="emit('scroll', $event)"
      @scrolltolower="emit('reachBottom', $event)"
      @refresherrefresh="emit('refresh', $event)"
      @refresherrestore="emit('refresherRestore', $event)"
      @refresherabort="emit('refresherAbort', $event)"
    >
      <view class="app-page__content" :style="{ padding: contentPadding }">
        <slot name="mainContent">
          <slot />
        </slot>
        <view v-if="$slots.pagePagination" class="app-page__pagination">
          <slot name="pagePagination" />
        </view>
      </view>
    </scroll-view>
    <view v-if="$slots.pageFooter || $slots.tabBar" class="app-page__bottom">
      <view v-if="$slots.pageFooter" class="app-page__footer">
        <slot name="pageFooter" />
      </view>
      <view v-if="$slots.tabBar" class="app-page__dock">
        <slot name="tabBar" />
      </view>
    </view>
    <slot name="dialogContainer" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import { getPageMetrics } from "@/layout/pageMetrics";
import { resolvedPageTheme, setPageSystemTheme, setPageTheme, syncPageTheme } from "@/composables/usePageTheme";
import type { PageTheme } from "@/composables/usePageTheme";

// 使用 AppPage 别名导入，避免与微信原生 page-container 组件重名。
defineOptions({ name: "AppPage" });

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    logo?: string;
    showNavigation?: boolean;
    showBack?: boolean;
    autoBack?: boolean;
    showThemeToggle?: boolean;
    safeAreaBottom?: boolean;
    contentPadding?: string;
    scrollTop?: number;
    scrollIntoView?: string;
    scrollWithAnimation?: boolean;
    lowerThreshold?: number;
    refresherEnabled?: boolean;
    refresherTriggered?: boolean;
  }>(),
  {
    title: "星河创作",
    subtitle: "让长篇故事持续生长",
    logo: "/static/brand/studio-logo.png",
    showNavigation: true,
    showBack: false,
    autoBack: true,
    showThemeToggle: true,
    safeAreaBottom: true,
    contentPadding: "28rpx",
    scrollTop: 0,
    scrollIntoView: "",
    scrollWithAnimation: true,
    lowerThreshold: 80,
    refresherEnabled: false,
    refresherTriggered: false,
  }
);

const emit = defineEmits<{
  back: [];
  backFallback: [];
  themeChange: [theme: PageTheme];
  scroll: [event: unknown];
  reachBottom: [event: unknown];
  refresh: [event: unknown];
  refresherRestore: [event: unknown];
  refresherAbort: [event: unknown];
}>();

syncPageTheme();
const theme = resolvedPageTheme;
const metrics = ref(getPageMetrics());
const active = ref(true);
const navigationStyle = computed(() => ({
  paddingTop: `${metrics.value.statusBarHeight}px`,
  paddingRight: `${metrics.value.navigationRight}px`,
}));

const syncNavigationColor = () => {
  if (!active.value) return;
  uni.setNavigationBarColor({
    frontColor: theme.value === "dark" ? "#ffffff" : "#000000",
    backgroundColor: theme.value === "dark" ? "#05070d" : "#f5f7fb",
  });
};

const handleBack = () => {
  emit("back");
  if (!props.autoBack) return;
  if (getCurrentPages().length > 1) {
    uni.navigateBack({ delta: 1, fail: () => emit("backFallback") });
  } else {
    emit("backFallback");
  }
};

const toggleTheme = () => {
  const next = theme.value === "dark" ? "light" : "dark";
  setPageTheme(next);
  emit("themeChange", next);
};

const updateMetrics = () => {
  metrics.value = getPageMetrics();
};
const handleThemeChange = (event: { theme: PageTheme }) => setPageSystemTheme(event.theme);

onShow(() => {
  active.value = true;
  syncPageTheme();
  updateMetrics();
  syncNavigationColor();
});
onHide(() => {
  active.value = false;
});
watch(theme, syncNavigationColor);

onMounted(() => {
  syncNavigationColor();
  uni.onWindowResize(updateMetrics);
  // #ifdef MP-WEIXIN
  uni.onThemeChange(handleThemeChange);
  // #endif
});

// H5 使用浏览器系统主题，微信使用 uni.onThemeChange。
// #ifdef H5
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
const handleMediaChange = (event: MediaQueryListEvent) =>
  handleThemeChange({ theme: event.matches ? "dark" : "light" });
onMounted(() => mediaQuery.addEventListener("change", handleMediaChange));
onUnmounted(() => mediaQuery.removeEventListener("change", handleMediaChange));
// #endif

onUnmounted(() => {
  uni.offWindowResize(updateMetrics);
  // #ifdef MP-WEIXIN
  uni.offThemeChange(handleThemeChange);
  // #endif
});
</script>

<style lang="scss" scoped>
.app-page {
  --page: #f5f7fb;
  --paper-raised: #fff;
  --paper-bright: #fff;
  --ink-muted: #445066;
  --line-strong: rgb(17 24 39 / 17%);
  --pine: #2c7254;
  --pine-wash: rgb(44 114 84 / 10%);
  --success: #248a5b;
  --warning: #9a681f;
  --warning-wash: rgb(154 104 31 / 12%);
  --danger: #b33b32;
  --danger-wash: rgb(179 59 50 / 9%);
  --brand-cyan: #28cae2;
  --paper-inset: #eef3fa;
  --surface-strong: rgb(255 255 255 / 92%);
  --ink: #111827;
  --ink-soft: #667085;
  --ink-faint: #8791a5;
  --line: rgb(17 24 39 / 10%);
  --accent: #1b4bff;
  --accent-wash: rgb(27 75 255 / 9%);
  --shadow-float: 0 14px 40px rgb(20 20 25 / 10%);

  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - var(--window-top, 0px) - var(--window-bottom, 0px));
  overflow: hidden;
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--ink);
  background: var(--page);

  &--dark {
    --page: #05070d;
    --paper-raised: #121722;
    --paper-bright: #171c29;
    --ink-muted: #d5dbea;
    --line-strong: rgb(255 255 255 / 18%);
    --pine: #61d39a;
    --pine-wash: rgb(97 211 154 / 11%);
    --success: #42c984;
    --warning: #f0b35a;
    --warning-wash: rgb(240 179 90 / 12%);
    --danger: #ff766d;
    --danger-wash: rgb(255 118 109 / 12%);
    --paper-inset: #0b0f18;
    --surface-strong: rgb(18 23 34 / 92%);
    --ink: #f5f7ff;
    --ink-soft: #a7b0c3;
    --ink-faint: #78839a;
    --line: rgb(255 255 255 / 11%);
    --accent: #6e8bff;
    --accent-wash: rgb(110 139 255 / 13%);
    --shadow-float: 0 18px 54px rgb(0 0 0 / 44%);
  }

  &--safe-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  &__navigation,
  &__header,
  &__tabs,
  &__toolbar,
  &__bottom {
    flex-shrink: 0;
  }

  &__navigation {
    padding-left: 16px;
    border-bottom: 1px solid var(--line);
  }

  &__navigation-inner {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__logo {
    flex-shrink: 0;
    width: 26px;
    height: 32px;
  }

  &__brand {
    flex: 1;
    min-width: 0;
  }

  &__title,
  &__subtitle {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
  }

  &__subtitle {
    font-size: 10px;
    color: var(--ink-soft);
  }

  &__navigation-actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
  }

  &__icon-button {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    margin: 0;
    line-height: 1;
    color: var(--ink-soft);
    background: var(--surface-strong);
    border: 1px solid var(--line);
    border-radius: 50%;
  }

  &__icon-button::after {
    border: 0;
  }

  &__theme-icon {
    font-size: 23px;
  }

  &__back-icon {
    width: 8px;
    height: 8px;
    margin-left: 4px;
    border-bottom: 2px solid currentcolor;
    border-left: 2px solid currentcolor;
    transform: rotate(45deg);
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    align-items: center;
    padding: 20rpx 28rpx;
  }

  &__search {
    flex: 1;
    min-width: 0;
  }

  &__scroll {
    flex: 1;
    width: 100%;
    height: 0;
    min-height: 0;
  }

  &__content {
    box-sizing: border-box;
    min-height: 100%;
  }

  &__pagination {
    margin-top: 28rpx;
  }

  &__footer {
    padding: 20rpx 28rpx;
    background: var(--paper-raised);
    border-top: 1px solid var(--line);
  }

  &__dock {
    padding: 12rpx;
    margin: 16rpx 24rpx;
    background: var(--surface-strong);
    border: 1px solid var(--line);
    border-radius: 36rpx;
    box-shadow: var(--shadow-float);
  }
}
</style>
