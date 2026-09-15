import { createMiniAuthClient } from "./createMiniAuthClient";
import { getWeChatCode } from "./wechatLogin";
import { miniAuthApi } from "@/api/miniAuth";

export const miniAuthClient = createMiniAuthClient({
  autoLogin: miniAuthApi.autoLogin,
  getCurrentUser: miniAuthApi.getCurrentUser,
  sendEmailCode: miniAuthApi.sendEmailCode,
  bind: miniAuthApi.bind,
  logout: miniAuthApi.logout,
  wxCode: getWeChatCode,
  read: (key) => {
    try {
      return uni.getStorageSync(key);
    } catch {
      return undefined;
    }
  },
  write: (key, value) => uni.setStorageSync(key, value),
  remove: (key) => uni.removeStorageSync(key),
});
