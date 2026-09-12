export type MainTab = "home" | "plans" | "mine";
export const mainRoutes: Record<MainTab, string> = {
  home: "/pages/index/index",
  plans: "/packages/shop/pages/plans/index",
  mine: "/packages/account/pages/mine/index",
};
let switching = false;
export const openMainTab = (tab: MainTab) => {
  const route = mainRoutes[tab];
  const pages = getCurrentPages();
  if (switching || `/${pages[pages.length - 1]?.route}` === route) return;
  switching = true;
  // 普通页面配合自定义浮动导航，redirectTo 避免来回切换堆积页面栈。
  uni.redirectTo({
    url: route,
    complete: () => {
      switching = false;
    },
  });
};
export const openBind = (productId = "") =>
  uni.navigateTo({
    url: `/packages/account/pages/bind/index${productId ? `?product=${encodeURIComponent(productId)}` : ""}`,
  });
export const goHome = () => uni.reLaunch({ url: mainRoutes.home });
export const openDocument = (kind: "terms" | "privacy") =>
  uni.navigateTo({ url: `/packages/account/pages/document/index?kind=${kind}` });
