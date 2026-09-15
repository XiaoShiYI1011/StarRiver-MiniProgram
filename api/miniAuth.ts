import { request } from "@/utils/request";
import type { AuthUser, BindInput, MiniSession } from "@/types/auth";

/**
 * MiniAuth 控制器地址在此唯一定义：改后端地址只动 .env，改接口路径只动本文件。
 * 新业务域（小说/权益/订单等）照此模板新建 api/<domain>.ts，不要把 URL 散落到页面或服务里。
 */
export const miniAuthPrefix = "/api/assistant/v1/MiniAuth";

export const miniAuthApi = {
  autoLogin: (wxCode: string) =>
    request<MiniSession>({
      url: `${miniAuthPrefix}/AutoLogin`,
      method: "POST",
      data: { wxCode },
      skipAuthRedirect: true,
    }),
  getCurrentUser: (token: string) =>
    request<AuthUser>({ url: `${miniAuthPrefix}/GetCurrentUser`, method: "GET", token, skipAuthRedirect: true }),
  sendEmailCode: (input: { email: string }) =>
    request<{ retryAfter: number }>({
      url: `${miniAuthPrefix}/SendEmailCode`,
      method: "POST",
      data: input,
      skipAuthRedirect: true,
    }),
  bind: (input: BindInput & { wxCode: string }) =>
    request<MiniSession>({ url: `${miniAuthPrefix}/Bind`, method: "POST", data: input, skipAuthRedirect: true }),
  logout: (token: string) =>
    request<void>({ url: `${miniAuthPrefix}/Logout`, method: "POST", data: {}, token, skipAuthRedirect: true }),
};
