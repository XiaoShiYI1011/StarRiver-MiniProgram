import { demoAccount, demoNovels, demoOrders } from "@/mocks/account";
import { packs, plans } from "@/mocks/catalog";
import { formatDateTime, isEmail } from "@/utils/format";
import type { Account, Dashboard, Order, StudioService } from "@/types/studio";

const storageKey = "nwa-studio-demo-v1";
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
interface MockState {
  loggedIn: boolean;
  account: Account;
  orders: Order[];
}
let state: MockState = { loggedIn: true, account: clone(demoAccount), orders: clone(demoOrders) };
try {
  const saved = uni.getStorageSync(storageKey) as MockState | undefined;
  if (
    saved &&
    typeof saved.loggedIn === "boolean" &&
    typeof saved.account?.email === "string" &&
    Array.isArray(saved.orders)
  ) {
    state = clone(saved);
  }
} catch {
  /* 存储不可用时继续使用当前会话数据。 */
}

const persist = () => {
  try {
    uni.setStorageSync(storageKey, clone(state));
  } catch {
    /* 不影响当前会话。 */
  }
};
const snapshot = (): Dashboard =>
  clone({
    account: state.loggedIn ? state.account : null,
    orders: state.loggedIn ? state.orders : [],
    novels: state.loggedIn ? demoNovels : [],
  });
const assertLogin = () => {
  if (!state.loggedIn) throw new Error("请先绑定账号");
};
const getOrder = (id: string) => {
  assertLogin();
  const order = state.orders.find((item) => item.id === id);
  if (!order) throw new Error("订单不存在");
  return order;
};
let codeEmail = "";
let codeExpiresAt = 0;
let nextCodeAt = 0;
let orderSequence = 0;

/** 本地演示适配器：不调用网络、微信登录、短信或真实支付 API。 */
export const mockStudioService: StudioService = {
  async getDashboard() {
    return snapshot();
  },
  async getProducts() {
    return clone([...plans, ...packs]);
  },
  async requestCode(email) {
    if (!isEmail(email.trim())) throw new Error("请输入有效的邮箱地址");
    if (Date.now() < nextCodeAt) throw new Error("请稍后再获取验证码");
    codeEmail = email.trim().toLowerCase();
    codeExpiresAt = Date.now() + 5 * 60 * 1000;
    nextCodeAt = Date.now() + 60 * 1000;
    return { retryAfter: 60 };
  },
  async bind(input) {
    const email = input.email.trim().toLowerCase();
    if (!isEmail(email)) throw new Error("请输入有效的邮箱地址");
    if (!input.agreed) throw new Error("请先勾选用户协议与隐私政策");
    if (input.mode === "code") {
      if (email !== codeEmail || Date.now() > codeExpiresAt) throw new Error("请先获取此邮箱的演示验证码");
      if (input.credential !== "123456") throw new Error("验证码不正确，演示验证码为 123456");
    } else if (input.credential !== "demo123456") {
      throw new Error("演示密码为 demo123456");
    }
    // 演示账号之间隔离购买记录，重新绑定同一邮箱时保留本地修改。
    if (email !== state.account.email) {
      state.account = { ...clone(demoAccount), email };
      state.orders = clone(demoOrders);
    }
    state.loggedIn = true;
    codeEmail = "";
    codeExpiresAt = 0;
    persist();
    return snapshot();
  },
  async logout() {
    state.loggedIn = false;
    persist();
    return snapshot();
  },
  async createOrder(productId) {
    assertLogin();
    const product = [...plans, ...packs].find((item) => item.id === productId);
    if (!product) throw new Error("套餐不存在");
    const order: Order = {
      id: `${Date.now()}${++orderSequence}`,
      productId,
      kind: product.kind,
      name: product.kind === "plan" ? `${product.name} · ${product.days} 天` : product.name,
      price: product.price,
      createdAt: formatDateTime(),
      status: "pending",
    };
    state.orders.unshift(order);
    persist();
    return clone(order);
  },
  async payOrder(id) {
    const order = getOrder(id);
    if (order.status === "completed") return snapshot(); // 重复确认不重复发放权益。
    if (order.status === "closed") throw new Error("订单已关闭，请重新选择套餐");
    const product = [...plans, ...packs].find((item) => item.id === order.productId);
    if (!product) throw new Error("套餐不存在");
    if (product.kind === "plan") {
      state.account.planName = product.name;
      state.account.remainingDays = product.days;
      state.account.points = product.weeklyQuota;
      state.account.weeklyRemainingPercent = 100;
    } else {
      state.account.packWords += product.words;
    }
    order.status = "completed";
    persist();
    return snapshot();
  },
  async cancelOrder(id) {
    const order = getOrder(id);
    if (order.status !== "pending") throw new Error("当前订单无法取消");
    order.status = "closed";
    persist();
    return snapshot();
  },
};
