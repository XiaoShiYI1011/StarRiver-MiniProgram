import { computed, ref } from "vue";
import { miniAuthClient } from "@/services/auth/miniAuthClient";
import { billingApi } from "@/api/billing";
import { novelApi } from "@/api/novel";
import type { AuthUser } from "@/types/auth";
import type { BillingOrder, CreditSummary } from "@/types/billing";
import type { NovelInfo } from "@/types/novel";
import { errorMessage } from "@/utils/format";

/** 权益视图模型：由 CreditSummary + 当前用户映射，供“我的”页展示。 */
export interface Account {
  email: string;
  registeredAt: string;
  planName: string;
  remainingDays: number;
  points: number;
  weeklyRemainingPercent: number;
  packCredits: number;
  dailyFreeCredits: number;
}

export interface Dashboard {
  account: Account | null;
  orders: BillingOrder[];
  novels: NovelInfo[];
}

const dayMs = 86_400_000;
const toAccount = (user: AuthUser, summary: CreditSummary): Account => {
  const constraint = summary.constraintQuota;
  return {
    email: user.email,
    registeredAt: user.createdAt.slice(0, 10),
    planName: summary.subscription?.productName ?? "免费额度",
    remainingDays: summary.subscription
      ? Math.max(0, Math.ceil((Date.parse(summary.subscription.endsAtUtc) - Date.now()) / dayMs))
      : 0,
    points: summary.totalAvailableCredits,
    weeklyRemainingPercent: constraint?.grantedCredits
      ? Math.round((constraint.availableCredits / constraint.grantedCredits) * 100)
      : 100,
    packCredits: summary.purchasedAvailableCredits,
    dailyFreeCredits: summary.dailyFreeCredits,
  };
};

const dashboard = ref<Dashboard>({ account: null, orders: [], novels: [] });
const initialized = ref(false);
const authError = ref("");
const loading = ref(false);
let pending: Promise<void> | null = null;
export const refreshDashboard = async () => {
  if (pending) return pending;
  loading.value = true;
  pending = (async () => {
    try {
      const user = await miniAuthClient.restore();
      if (!user) {
        dashboard.value = { account: null, orders: [], novels: [] };
      } else {
        const [summary, orders, novels] = await Promise.all([
          billingApi.queryCreditSummary(),
          billingApi.queryOrders({ pageIndex: 1, pageSize: 50 }),
          novelApi.queryList({ pageIndex: 1, pageSize: 100 }),
        ]);
        dashboard.value = { account: toAccount(user, summary), orders: orders.pageData, novels: novels.pageData };
      }
      authError.value = "";
      initialized.value = true;
    } catch (error) {
      authError.value = errorMessage(error);
      dashboard.value = { account: null, orders: [], novels: [] };
    } finally {
      loading.value = false;
      pending = null;
    }
  })();
  return pending;
};
export const useStudio = () => ({
  dashboard,
  initialized,
  authError,
  loading,
  account: computed(() => dashboard.value.account),
  isBound: computed(() => !!dashboard.value.account),
  refresh: refreshDashboard,
});
