import App from "./App.vue";
import { createSSRApp } from "vue";

export const createApp = () => {
  const app = createSSRApp(App);
  return {
    app,
  };
};
