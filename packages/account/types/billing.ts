/** 账户分包使用的订单枚举；数值与后端契约保持一致。 */
export enum BillingOrderType {
  WritingPlan = 1,
  CreditRecharge = 2,
  AdministratorPlanAdjustment = 3,
  AdministratorCreditAdjustment = 4,
}

export enum BillingOrderStatus {
  Pending = 1,
  Paid = 2,
  Cancelled = 3,
  Refunded = 4,
  AdministratorAdjusted = 5,
  PaidNeedsReview = 6,
}
