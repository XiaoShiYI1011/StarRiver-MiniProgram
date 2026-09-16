import { request } from "@/utils/request";
import type { PageResult } from "@/types/api";
import type { BillingOrder, BillingOrderStatus, CreditSummary, VirtualPaymentPayData, WritingPlanProduct } from "@/types/billing";

const planPrefix = "/api/assistant/v1/Plan";
const creditPrefix = "/api/assistant/v1/Credit";
const orderPrefix = "/api/assistant/v1/Order";

/** 下单和支付共用的幂等键，随计费接口加载，避免生成仅分包使用的主包脚本。 */
export const newIdempotencyKey = () => `mini-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const billingApi = {
  queryProducts: () => request<WritingPlanProduct[]>({ url: `${planPrefix}/QueryProducts`, method: "GET" }),
  queryCreditSummary: () => request<CreditSummary>({ url: `${creditPrefix}/QueryCreditSummary`, method: "GET" }),
  queryOrders: (params: { pageIndex?: number; pageSize?: number; keyword?: string; status?: BillingOrderStatus }) =>
    request<PageResult<BillingOrder>>({ url: `${orderPrefix}/QueryOrderList`, method: "GET", params }),
  createPlanOrder: (input: { productId: string; idempotencyKey: string }) =>
    request<BillingOrder>({ url: `${orderPrefix}/CreatePlanOrder`, method: "POST", data: input }),
  createCreditOrder: (input: { amountFen: number; idempotencyKey: string }) =>
    request<BillingOrder>({ url: `${orderPrefix}/CreateCreditOrder`, method: "POST", data: input }),
  createVirtualPayment: (input: { orderId: string }) =>
    request<VirtualPaymentPayData>({ url: `${orderPrefix}/CreateVirtualPayment`, method: "POST", data: input }),
  queryOrder: (orderId: string) => request<BillingOrder>({ url: `${orderPrefix}/QueryOrder`, method: "GET", params: { orderId } }),
};
