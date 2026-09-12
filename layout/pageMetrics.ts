export interface PageMetrics {
  statusBarHeight: number;
  navigationHeight: number;
  navigationRight: number;
}

/** 微信胶囊 API 在开发工具或尚未就绪时可能返回全零矩形。 */
export const getPageMetrics = (): PageMetrics => {
  const metrics: PageMetrics = { statusBarHeight: 0, navigationHeight: 52, navigationRight: 16 };
  // #ifdef MP-WEIXIN
  metrics.statusBarHeight = 20;
  metrics.navigationHeight = 44;
  metrics.navigationRight = 104;
  // #endif

  try {
    const info = uni.getWindowInfo();
    metrics.statusBarHeight = info.statusBarHeight || 0;

    // #ifdef MP-WEIXIN
    const capsule = uni.getMenuButtonBoundingClientRect();
    if (capsule.width > 0 && capsule.height > 0 && capsule.top >= metrics.statusBarHeight && capsule.left > 0) {
      metrics.navigationHeight = Math.max(44, capsule.height + (capsule.top - metrics.statusBarHeight) * 2);
      metrics.navigationRight = Math.max(16, info.windowWidth - capsule.left + 8);
    }
    // #endif
  } catch {
    // 保留已获取的状态栏高度，胶囊 API 失败时仅使用预设避让距离。
  }

  return metrics;
};
