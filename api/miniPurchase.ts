import { request } from "@/utils/request";
import type { MiniSession } from "@/types/auth";

export interface PurchasePreview {
  account: string;
  productId: string;
  productName: string;
  priceFen: number;
  durationDays: number;
  action?: "purchase" | "renew" | "upgrade" | "recharge";
  planEndsAtUtc?: string | null;
  requiresBinding: boolean;
}
export const miniPurchaseApi = {
  preview: (ticket: string, wxCode: string) =>
    request<PurchasePreview>({
      url: "/api/assistant/v1/MiniPurchase/Preview",
      method: "POST",
      data: { ticket, wxCode },
      skipAuthRedirect: true,
      anonymous: true,
    }),
  consume: (ticket: string, wxCode: string, agreed: boolean) =>
    request<{ session: MiniSession; productId: string }>({
      url: "/api/assistant/v1/MiniPurchase/Consume",
      method: "POST",
      data: { ticket, wxCode, agreed },
      skipAuthRedirect: true,
      anonymous: true,
    }),
};
