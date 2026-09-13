// 微信原生同步 API，避免旧版 uni 适配层返回不完整的窗口尺寸。
declare const wx: Pick<typeof uni, "getWindowInfo" | "getSystemInfoSync" | "getMenuButtonBoundingClientRect">;

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
    let info: { statusBarHeight?: number; windowWidth: number };
    // #ifdef MP-WEIXIN
    try {
      info = wx.getWindowInfo();
    } catch {
      info = wx.getSystemInfoSync();
    }
    if (!Number.isFinite(info?.windowWidth) || !Number.isFinite(info?.statusBarHeight)) {
      info = wx.getSystemInfoSync();
    }
    // #endif
    // #ifndef MP-WEIXIN
    info = uni.getWindowInfo();
    // #endif
    if (
      typeof info.statusBarHeight === "number" &&
      Number.isFinite(info.statusBarHeight) &&
      info.statusBarHeight >= 0
    ) {
      metrics.statusBarHeight = info.statusBarHeight;
    }

    // #ifdef MP-WEIXIN
    const capsule = wx.getMenuButtonBoundingClientRect();
    if (capsule.width > 0 && capsule.height > 0 && capsule.left > 0 && capsule.top >= metrics.statusBarHeight) {
      // 某些开发工具机型返回 20px 状态栏，但胶囊仍位于刘海屏位置。
      // 以实际胶囊为准，避免导航按钮进入刘海区域。
      if (capsule.top - metrics.statusBarHeight > 20) {
        metrics.statusBarHeight = capsule.top - 6;
      }
      metrics.navigationHeight = Math.max(44, capsule.height + (capsule.top - metrics.statusBarHeight) * 2);
      if (Number.isFinite(info.windowWidth)) {
        metrics.navigationRight = Math.max(16, info.windowWidth - capsule.left + 8);
      }
    }
    // #endif
  } catch {
    // 保留已获取的状态栏高度，胶囊 API 失败时仅使用预设避让距离。
  }

  return metrics;
};
