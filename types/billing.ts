/** 与后端 BillingManager 的 VO 保持同构；金额一律为分。 */

export enum BillingOrderType {
  WritingPlan = 1,
  CreditRecharge = 2,
}

export enum BillingOrderStatus {
  Pending = 1,
  Paid = 2,
  Cancelled = 3,
  Refunded = 4,
}

export enum ProductStatus {
  Disabled = 1,
  Enabled = 2,
}

export interface WritingPlanProduct {
  id: string;
  productCode: string;
  name: string;
  description: string;
  priceFen: number;
  durationDays: number;
  eightHourCredits: number;
  sevenDayCredits: number;
  status: ProductStatus;
  displayOrder: number;
  isRecommended: boolean;
  includesDraftPlan: boolean;
  includesRemediationStrategy: boolean;
  editVersion: number;
}

export interface UserSubscription {
  id: string;
  productId: string;
  productName: string;
  activationAnchorUtc: string;
  startsAtUtc: string;
  endsAtUtc: string;
  status: number;
}

export interface QuotaPeriod {
  id: string;
  windowType: number;
  windowStartUtc: string;
  windowEndUtc: string;
  grantedCredits: number;
  reservedCredits: number;
  consumedCredits: number;
  availableCredits: number;
}

export interface CreditSummary {
  subscription: UserSubscription | null;
  primaryQuota: QuotaPeriod | null;
  constraintQuota: QuotaPeriod | null;
  purchasedGrantedCredits: number;
  purchasedReservedCredits: number;
  purchasedConsumedCredits: number;
  purchasedAvailableCredits: number;
  totalAvailableCredits: number;
  dailyFreeCredits: number;
  creditsPerYuan: number;
  minimumRechargeFen: number;
}

export interface BillingOrder {
  id: string;
  orderNo: string;
  orderType: BillingOrderType;
  productName: string;
  amountFen: number;
  grantedCredits: number;
  status: BillingOrderStatus;
  paidAtUtc: string | null;
  createdAt: string;
}
