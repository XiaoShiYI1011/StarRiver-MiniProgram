/** 支付与下单接口要求幂等键；小程序 JS 环境没有 crypto.randomUUID，使用时间戳加随机数。 */
export const newIdempotencyKey = () => `mini-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
