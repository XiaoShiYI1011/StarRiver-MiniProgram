const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

/** 后端地址只在 .env 系列文件的 VITE_API_BASE_URL 中维护，此处是唯一读取点。 */
export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || "");

let nativeAuth = false;
// #ifdef MP-WEIXIN
nativeAuth = true;
// #endif
export const isWeChatAuth = nativeAuth;
