import { computed, ref } from "vue";

export type PageTheme = "light" | "dark";
export type PageThemePreference = PageTheme | "auto";

const storageKey = "nwa-page-theme";
const preference = ref<PageThemePreference>("auto");
const systemTheme = ref<PageTheme>("light");
let initialized = false;

const isTheme = (value: unknown): value is PageTheme => value === "light" || value === "dark";

export const resolvedPageTheme = computed(() => (preference.value === "auto" ? systemTheme.value : preference.value));

export const syncPageTheme = () => {
  if (!initialized) {
    try {
      const saved: unknown = uni.getStorageSync(storageKey);
      if (isTheme(saved) || saved === "auto") preference.value = saved;
    } catch {
      // 存储不可用时仍可在当前会话切换主题。
    }
    initialized = true;
  }

  try {
    const info = uni.getAppBaseInfo();
    if (isTheme(info.theme)) systemTheme.value = info.theme;
  } catch {
    // 不提供主题 API 的平台默认使用浅色主题。
  }

  // #ifdef H5
  systemTheme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  // #endif
};

export const setPageSystemTheme = (theme: PageTheme) => {
  systemTheme.value = theme;
};

export const setPageTheme = (theme: PageThemePreference) => {
  preference.value = theme;
  try {
    uni.setStorageSync(storageKey, theme);
  } catch {
    // 不影响已更新的响应式状态。
  }
};
