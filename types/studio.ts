export interface Plan {
  id: string;
  kind: "plan";
  name: string;
  price: number;
  days: number;
  description: string;
  eightHourQuota: number;
  weeklyQuota: number;
  features: string[];
  recommended?: boolean;
}

export interface Pack {
  id: string;
  kind: "pack";
  name: string;
  price: number;
  days: number;
  words: number;
}

export type Product = Plan | Pack;
export type OrderStatus = "completed" | "pending" | "closed";

export interface Order {
  id: string;
  productId: string;
  name: string;
  kind: Product["kind"];
  price: number;
  createdAt: string;
  status: OrderStatus;
}

export interface Account {
  email: string;
  registeredAt: string;
  planName: string;
  remainingDays: number;
  points: number;
  weeklyRemainingPercent: number;
  packWords: number;
}

export interface Novel {
  id: string;
  title: string;
  genre: string;
  chapters: number;
  words: string;
  updatedAt: string;
  cover?: string;
}

export interface Dashboard {
  account: Account | null;
  orders: Order[];
  novels: Novel[];
}

export interface BindInput {
  email: string;
  mode: "code" | "password";
  credential: string;
  agreed: boolean;
}

/** 页面只依赖此契约，接入后端时替换 service 的实现。 */
export interface StudioService {
  getDashboard(): Promise<Dashboard>;
  getProducts(): Promise<Product[]>;
  requestCode(email: string): Promise<{ retryAfter: number }>;
  bind(input: BindInput): Promise<Dashboard>;
  logout(): Promise<Dashboard>;
  createOrder(productId: string): Promise<Order>;
  payOrder(orderId: string): Promise<Dashboard>;
  cancelOrder(orderId: string): Promise<Dashboard>;
}
