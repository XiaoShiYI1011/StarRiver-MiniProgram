export const formatNumber = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export const formatDateTime = (date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
export const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "操作未完成，请重试");
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
