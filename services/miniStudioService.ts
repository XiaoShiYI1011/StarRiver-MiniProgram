import { miniAuthClient } from "./auth/miniAuthClient";
import { createMockStudioService } from "./mockStudioService";
import { demoAccount } from "@/mocks/account";
import { packs, plans } from "@/mocks/catalog";
import type { AuthUser } from "@/types/auth";
import type { Dashboard, StudioService } from "@/types/studio";

const empty = (): Dashboard => ({ account: null, orders: [], novels: [] });
let business: StudioService | null = null;
let businessUserId = "";
const getBusiness = (user: AuthUser) => {
  if (!business || businessUserId !== user.id) {
    businessUserId = user.id;
    business = createMockStudioService(`nwa-business-demo-v1:${user.id}`, {
      ...demoAccount,
      email: user.email,
      registeredAt: user.createdAt.slice(0, 10),
    });
  }
  return business;
};
const dashboard = async (): Promise<Dashboard> => {
  const user = await miniAuthClient.restore();
  if (!user) return empty();
  const result = await getBusiness(user).getDashboard();
  // 只用真实身份覆盖账号信息，权益/小说/订单始终来自隔离的演示存储。
  if (result.account)
    result.account = { ...result.account, email: user.email, registeredAt: user.createdAt.slice(0, 10) };
  return result;
};
const requireBusiness = async () => {
  const user = await miniAuthClient.restore();
  if (!user) throw new Error("请先绑定账号");
  return getBusiness(user);
};

export const miniStudioService: StudioService = {
  getDashboard: dashboard,
  async getProducts() {
    return JSON.parse(JSON.stringify([...plans, ...packs]));
  },
  requestCode: miniAuthClient.requestCode,
  async bind(input) {
    await miniAuthClient.bind(input);
    return dashboard();
  },
  async logout() {
    await miniAuthClient.logout();
    business = null;
    businessUserId = "";
    return empty();
  },
  async createOrder(productId) {
    return (await requireBusiness()).createOrder(productId);
  },
  async payOrder(orderId) {
    await (await requireBusiness()).payOrder(orderId);
    return dashboard();
  },
  async cancelOrder(orderId) {
    await (await requireBusiness()).cancelOrder(orderId);
    return dashboard();
  },
};
