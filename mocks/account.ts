import type { Account, Novel, Order } from "@/types/studio";

export const demoAccount: Account = {
  email: "writer@example.com",
  registeredAt: "2026-06-12",
  planName: "标准版",
  remainingDays: 23,
  points: 12800,
  weeklyRemainingPercent: 64,
  packWords: 0,
};
export const demoOrders: Order[] = [
  {
    id: "260828144921",
    productId: "standard",
    name: "标准版 · 30 天",
    kind: "plan",
    price: 69,
    createdAt: "2026-08-28 14:32",
    status: "completed",
  },
  {
    id: "260810081174",
    productId: "pack-100k",
    name: "创作加油包 · 10 万字",
    kind: "pack",
    price: 18,
    createdAt: "2026-08-10 09:05",
    status: "completed",
  },
  {
    id: "260908219843",
    productId: "professional",
    name: "专业版 · 30 天",
    kind: "plan",
    price: 169,
    createdAt: "2026-09-08 21:47",
    status: "pending",
  },
];
export const demoNovels: Novel[] = [
  {
    id: "frost",
    title: "霜港第七码",
    genre: "悬疑 · 都市",
    chapters: 24,
    words: "6.8 万",
    updatedAt: "今天 10:32",
    cover: "/static/brand/cover-frost-harbor.jpg",
  },
  {
    id: "star",
    title: "星海邮差",
    genre: "科幻 · 冒险",
    chapters: 12,
    words: "3.2 万",
    updatedAt: "昨天 21:10",
    cover: "/static/brand/cover-star-courier.jpg",
  },
  { id: "rain", title: "雨落长街", genre: "现实 · 成长", chapters: 8, words: "1.9 万", updatedAt: "09-08 18:26" },
];
