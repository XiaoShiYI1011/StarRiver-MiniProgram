/** 商城分包使用的商品枚举；数值与后端契约保持一致。 */
export enum ProductStatus {
  Disabled = 1,
  Enabled = 2,
}

export enum BillingOrderStatus {
  Pending = 1,
  Paid = 2,
  Cancelled = 3,
  Refunded = 4,
  AdministratorAdjusted = 5,
  PaidNeedsReview = 6,
}
