import { API_BASE_URL } from "@/config/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

interface Envelope<T> {
  succeeded?: boolean;
  statusCode?: number;
  data?: T;
  message?: string;
  errors?: string | { message?: string };
}

export const miniRequest = <T>(action: string, data?: object, token?: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const env = uni.getAccountInfoSync().miniProgram.envVersion;
    if (env !== "develop" && !API_BASE_URL.startsWith("https://")) {
      reject(new ApiError("请先配置小程序正式 HTTPS 接口地址", 0));
      return;
    }
    uni.request({
      url: `${API_BASE_URL.replace(/\/$/, "")}/api/assistant/v1/MiniAuth/${action}`,
      method: action === "GetCurrentUser" ? "GET" : "POST",
      data: data ?? {},
      timeout: 15000,
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      success(response) {
        const body = response.data as Envelope<T> | null;
        const status = response.statusCode >= 400 ? response.statusCode : (body?.statusCode ?? response.statusCode);
        if (response.statusCode >= 400 || status >= 400 || body?.succeeded === false) {
          const message = body?.message || (typeof body?.errors === "string" ? body.errors : body?.errors?.message);
          reject(new ApiError(message || "请求失败，请稍后重试", status));
          return;
        }
        if (!body || body.succeeded !== true || !("data" in body)) {
          reject(new ApiError("服务器返回格式异常", 0));
          return;
        }
        resolve(body.data as T);
      },
      fail() {
        reject(new ApiError("连接失败，请检查网络和后端服务后重试", 0));
      },
    });
  });

export const getWeChatCode = (): Promise<string> =>
  new Promise((resolve, reject) => {
    uni.login({
      provider: "weixin",
      success(result) {
        if (result.code) resolve(result.code);
        else reject(new Error("未获取到微信登录凭证，请重试"));
      },
      fail() {
        reject(new Error("微信登录失败，请重试"));
      },
    });
  });
