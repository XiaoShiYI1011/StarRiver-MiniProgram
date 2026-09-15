import { request } from "@/utils/request";
import type { PageResult } from "@/types/api";
import type { BillingOrder, BillingOrderStatus, CreditSummary, WritingPlanProduct } from "@/types/billing";

const planPrefix = "/api/assistant/v1/Plan";
const creditPrefix = "/api/assistant/v1/Credit";
const orderPrefix = "/api/assistant/v1/Order";

export const billingApi = {
  queryProducts: () => request<WritingPlanProduct[]>({ url: `${planPrefix}/QueryProducts`, method: "GET" }),
  queryCreditSummary: () => request<CreditSummary>({ url: `${creditPrefix}/QueryCreditSummary`, method: "GET" }),
  queryOrders: (params: { pageIndex?: number; pageSize?: number; keyword?: string; status?: BillingOrderStatus }) =>
    request<PageResult<BillingOrder>>({ url: `${orderPrefix}/QueryOrderList`, method: "GET", params }),
  createPlanOrder: (input: { productId: string; idempotencyKey: string }) =>
    request<BillingOrder>({ url: `${orderPrefix}/CreatePlanOrder`, method: "POST", data: input }),
  createCreditOrder: (input: { amountFen: number; idempotencyKey: string }) =>
    request<BillingOrder>({ url: `${orderPrefix}/CreateCreditOrder`, method: "POST", data: input }),
  completeSimulatedPayment: (input: { orderId: string; idempotencyKey: string }) =>
    request<BillingOrder>({ url: `${orderPrefix}/CompleteSimulatedPayment`, method: "POST", data: input }),
};
