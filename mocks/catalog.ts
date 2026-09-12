import type { Pack, Plan } from "@/types/studio";

export const plans: Plan[] = [
  {
    id: "light",
    kind: "plan",
    name: "轻量版",
    price: 29,
    days: 30,
    description: "适合起步连载，随开随写。",
    eightHourQuota: 1500,
    weeklyQuota: 9000,
    features: ["章节记忆与导出全功能"],
  },
  {
    id: "standard",
    kind: "plan",
    name: "标准版",
    price: 69,
    days: 30,
    recommended: true,
    description: "长篇连载的主力度，额度充裕。",
    eightHourQuota: 4000,
    weeklyQuota: 26000,
    features: ["带反馈重新生成 · 派生内容加速", "章节转漫剧剧本（上线后开放）"],
  },
  {
    id: "professional",
    kind: "plan",
    name: "专业版",
    price: 169,
    days: 30,
    description: "高产能与多作品工作流。",
    eightHourQuota: 10000,
    weeklyQuota: 66000,
    features: ["高级创作能力全部随赠", "优先客服与问题响应"],
  },
];

export const packs: Pack[] = [
  { id: "pack-100k", kind: "pack", name: "创作加油包 · 10 万字", price: 18, days: 30, words: 100000 },
  { id: "pack-300k", kind: "pack", name: "创作加油包 · 30 万字", price: 45, days: 30, words: 300000 },
];
