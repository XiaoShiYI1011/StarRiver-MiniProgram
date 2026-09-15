export const formatNumber = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
/** 金额统一以分存储，展示时转元；整元不带小数。 */
export const formatYuan = (fen: number) => {
  const yuan = fen / 100;
  return Number.isInteger(yuan) ? String(yuan) : yuan.toFixed(2);
};
const pad = (value: number) => String(value).padStart(2, "0");
const toDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};
export const formatDateTime = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
export const formatDate = (iso: string) => {
  const date = toDate(iso);
  return date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : "";
};
export const formatWordCount = (words: number) =>
  words >= 10000 ? `${(words / 10000).toFixed(words % 10000 === 0 ? 0 : 1)} 万` : String(words);
export const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "操作未完成，请重试");
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
