/** 微信 scene 为编码后的短凭证；拒绝多参数、URL 和异常编码。 */
export const parsePurchaseScene = (scene: unknown): string => {
  if (typeof scene !== "string") return "";
  try {
    const value = decodeURIComponent(scene);
    return /^[a-f0-9]{32}$/.test(value) ? value : "";
  } catch {
    return "";
  }
};

/** Server-issued target from the consumed ticket; recharge amount is chosen on the destination page. */
export const purchaseCheckoutQuery = (target: string): string =>
  target === "recharge" ? "recharge=1" : `product=${encodeURIComponent(target)}&checkout=1`;
