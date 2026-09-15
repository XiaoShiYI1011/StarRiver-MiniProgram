// Vite 由 uni-app 编译器内置，项目未直接依赖 vite 包，因此手写 ImportMetaEnv 声明。
interface ImportMetaEnv {
  /** 后端接口基地址，在 .env / .env.development / .env.production 中维护。 */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
