// Vite 由 uni-app 编译器内置，项目未直接依赖 vite 包，因此手写 ImportMetaEnv 声明。
interface ImportMetaEnv {
  /** 后端接口基地址，在项目唯一的 .env 中维护。 */
  readonly VITE_API_BASE_URL: string;
  /** 线上调试面板开关：留空按模式默认（开发开启/发行关闭），"true" / "false" 强制覆盖。 */
  readonly VITE_DEBUG_PANEL: string;
  /** Vite 内置：开发模式（serve）为 true，构建发行为 false。 */
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
