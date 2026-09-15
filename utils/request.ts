import { API_BASE_URL } from "@/config/api";
import { ApiError } from "@/types/api";
import type { ApiEnvelope, RequestOptions } from "@/types/api";

/**
 * 全项目唯一的请求封装，与 web 端 utils/request.ts 保持同一套约定：
 * 信封校验与解包、错误归一化为 ApiError、401 广播 assistant:unauthorized。
 * 平台差异：小程序用 Bearer 令牌替代 Cookie + CSRF；下载与 SSE 不在此层。
 */
interface RequestConfig extends RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE" | "CONNECT";
  data?: object;
  /** 追加到 URL 的查询参数；GET 也可直接用 data。 */
  params?: Record<string, unknown>;
  timeout?: number;
  token?: string;
}

const defaultTimeoutMs = 30_000;

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object";

const isApiEnvelope = (value: unknown): value is ApiEnvelope<unknown> =>
  isRecord(value) && typeof value.statusCode === "number" && typeof value.succeeded === "boolean" && "data" in value;

const extractMessage = (value: unknown, fallback: string): string => {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    const message = value
      .map((item) => extractMessage(item, ""))
      .filter(Boolean)
      .join("；");
    if (message) return message;
  }
  if (isRecord(value)) {
    const directMessage = extractMessage(value.message, "");
    if (directMessage) return directMessage;
    const nested = Object.values(value)
      .map((item) => extractMessage(item, ""))
      .filter(Boolean)
      .join("；");
    if (nested) return nested;
  }
  return fallback;
};

const appendQuery = (url: string, params?: Record<string, unknown>) => {
  if (!params) return url;
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
  return query ? `${url}${url.includes("?") ? "&" : "?"}${query}` : url;
};

const toApiError = (httpStatusCode: number, body: unknown, original?: unknown) => {
  const record = isRecord(body) ? body : undefined;
  const statusCode =
    httpStatusCode >= 400
      ? httpStatusCode
      : typeof record?.statusCode === "number"
        ? record.statusCode
        : httpStatusCode;
  const code = typeof record?.code === "string" ? record.code : undefined;
  const source = record && "errors" in record ? record.errors : (record?.message ?? body);
  const fallback =
    statusCode === 429
      ? "请求过于频繁，请稍后再试。"
      : statusCode >= 500
        ? "服务暂时不可用，请稍后重试。"
        : "请求未能完成。";
  return new ApiError(extractMessage(source ?? original, fallback), statusCode, code, source);
};

const toRequestError = (fail: { errMsg?: string }) => {
  const message = fail?.errMsg ?? "";
  if (message.includes("timeout"))
    return new ApiError("请求超时，请确认服务状态后重试。", 0, "CLIENT_TIMEOUT", message);
  if (message.includes("abort")) return new ApiError("请求已取消。", 0, "REQUEST_CANCELED", message);
  return new ApiError("网络连接失败，请检查网络后重试。", 0, "NETWORK_ERROR", message);
};

const notifyUnauthorized = (statusCode: number, skip?: boolean) => {
  if (statusCode === 401 && !skip) uni.$emit("assistant:unauthorized");
};

const assertUsableBaseUrl = () => {
  if (!API_BASE_URL) throw new ApiError("请先在 .env 中配置 VITE_API_BASE_URL。", 0, "MISSING_BASE_URL");
  // #ifdef MP-WEIXIN
  const envVersion = uni.getAccountInfoSync().miniProgram.envVersion;
  if (envVersion !== "develop" && !API_BASE_URL.startsWith("https://"))
    throw new ApiError("发行前请把 .env 中的 VITE_API_BASE_URL 改为已配置的 HTTPS 接口地址。", 0, "INSECURE_BASE_URL");
  // #endif
};

export const request = async <T>(config: RequestConfig): Promise<T> => {
  assertUsableBaseUrl();
  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: appendQuery(`${API_BASE_URL}${config.url}`, config.params),
      method: config.method ?? "GET",
      data: config.data,
      timeout: config.timeout ?? defaultTimeoutMs,
      header: {
        "Content-Type": "application/json;charset=utf-8",
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
      success(response) {
        const body: unknown = response.data;
        if (!isApiEnvelope(body)) {
          reject(new ApiError("服务响应格式不符合约定。", response.statusCode, "INVALID_RESPONSE_CONTRACT", body));
          return;
        }
        if (!body.succeeded || body.statusCode < 200 || body.statusCode >= 300) {
          const error = toApiError(response.statusCode, body);
          notifyUnauthorized(error.statusCode, config.skipAuthRedirect);
          reject(error);
          return;
        }
        resolve(body.data as T);
      },
      fail(error) {
        const normalized = toRequestError(error);
        notifyUnauthorized(normalized.statusCode, config.skipAuthRedirect);
        reject(normalized);
      },
    });
  });
};

export const getErrorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : "操作失败，请稍后重试。";
