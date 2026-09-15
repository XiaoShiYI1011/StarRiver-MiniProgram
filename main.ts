import App from "./App.vue";
import { createSSRApp } from "vue";
import { installDebugMonitor } from "@/utils/debugMonitor";

// 在应用创建前安装线上调试面板采集；VITE_DEBUG_PANEL 关闭时为空操作。
installDebugMonitor();

export const createApp = () => {
  const app = createSSRApp(App);
  return {
    app,
  };
};
