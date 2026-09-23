/** 与后端 BillingManager 的 VO 保持同构；金额一律为分。 */

// 订单枚举由主包支付服务和账户分包共同使用，必须留在主包。
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

import type { ProductStatus } from "@/packages/shop/types/billing";
export type { ProductStatus };

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
  /** 微信虚拟支付道具 ID；未配置的套餐不可在小程序购买 */
  virtualProductId?: string | null;
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
  betaFreeMode?: boolean;
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

/** 后端生成的 wx.requestVirtualPayment 调起参数；signData 必须原样传给微信，不得改动。 */
export interface VirtualPaymentPayData {
  orderId: string;
  orderNo: string;
  status: BillingOrderStatus;
  signData: string;
  signature: string;
  mode: string;
  paySig: string;
}
