/** 开发者工具默认连接本机后端；真机/发行前改为已配置 request 合法域名的 HTTPS 地址。 */
export const API_BASE_URL = "http://127.0.0.1:5008";

let nativeAuth = false;
// #ifdef MP-WEIXIN
nativeAuth = true;
// #endif
export const isWeChatAuth = nativeAuth;
