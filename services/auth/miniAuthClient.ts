import { createMiniAuthClient } from "./createMiniAuthClient";
import { getWeChatCode, miniRequest } from "./miniRequest";

export const miniAuthClient = createMiniAuthClient({
  request: miniRequest,
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
