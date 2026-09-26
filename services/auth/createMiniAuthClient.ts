import type { AuthUser, BindInput, MiniSession, StoredSession } from "@/types/auth";

interface Dependencies {
  autoLogin(wxCode: string): Promise<MiniSession>;
  getCurrentUser(token: string): Promise<AuthUser>;
  sendEmailCode(input: { email: string }): Promise<{ retryAfter: number }>;
  bind(input: BindInput & { wxCode: string }): Promise<MiniSession>;
  logout(token: string): Promise<void>;
  wxCode(): Promise<string>;
  read(key: string): unknown;
  write(key: string, value: unknown): void;
  remove(key: string): void;
}

const validPair = (pair: StoredSession) =>
  Boolean(
    pair.accessToken &&
    pair.refreshToken &&
    pair.sessionId &&
    Number.isSafeInteger(pair.sessionVersion) &&
    Number.isFinite(Date.parse(pair.sessionExpiresAtUtc))
  );
const sessionKey = "nwa-mini-jwt-pair";
const logoutKey = "nwa-mini-manual-logout-v1";
const statusOf = (error: unknown) => (error as { statusCode?: number })?.statusCode;

/** 身份状态仅来自后端接口。 */
export const createMiniAuthClient = (dependencies: Dependencies) => {
  let session: StoredSession | null = null;
  let user: AuthUser | null = null;
  let checkedAt = 0;
  let attempted = false;
  let generation = 0;
  let pending: Promise<AuthUser | null> | null = null;
  const stored = dependencies.read(sessionKey) as StoredSession | undefined;
  if (stored && validPair(stored)) {
    session = stored;
  }
  let manuallyLoggedOut = dependencies.read(logoutKey) === true;

  const accept = (result: MiniSession, version: number) => {
    if (version !== generation) return user;
    if (!result.user?.id || !validPair(result)) {
      throw new Error("登录结果异常，请重试");
    }
    const { user: _user, ...pair } = result;
    session = pair;
    user = result.user;
    checkedAt = Date.now();
    manuallyLoggedOut = false;
    attempted = true;
    dependencies.write(sessionKey, session);
    dependencies.remove(logoutKey);
    return user;
  };

  const invalidate = (
    code: string,
    requestGeneration: number,
    sid: string | undefined,
    version: number | undefined
  ) => {
    if (
      requestGeneration !== generation ||
      !session ||
      sid !== session.sessionId ||
      version !== session.sessionVersion ||
      !code.startsWith("AUTH_") ||
      code === "AUTH_FORBIDDEN" ||
      code === "AUTH_DEPENDENCY_UNAVAILABLE"
    )
      return;
    const naturalExpiry = code === "AUTH_REFRESH_EXPIRED" || code === "AUTH_SESSION_EXPIRED";
    generation++;
    session = null;
    user = null;
    checkedAt = 0;
    manuallyLoggedOut = !naturalExpiry;
    attempted = !naturalExpiry;
    dependencies.remove(sessionKey);
    if (manuallyLoggedOut) dependencies.write(logoutKey, true);
  };

  const restore = async (): Promise<AuthUser | null> => {
    if (pending) return pending;
    if (manuallyLoggedOut) return null;
    if (user && session && Date.parse(session.sessionExpiresAtUtc) > Date.now() && Date.now() - checkedAt < 60000)
      return user;
    const version = generation;
    pending = (async () => {
      if (session && Date.parse(session.sessionExpiresAtUtc) > Date.now()) {
        try {
          const current = await dependencies.getCurrentUser(session.accessToken);
          if (version !== generation) return user;
          user = current;
          checkedAt = Date.now();
          return user;
        } catch (error) {
          if (version !== generation) return user;
          if (statusOf(error) !== 401 && statusOf(error) !== 403) throw error;
          const code = (error as { code?: string }).code;
          if (code && session) {
            invalidate(code, version, session.sessionId, session.sessionVersion);
            if (manuallyLoggedOut) return null;
          }
          session = null;
          user = null;
          dependencies.remove(sessionKey);
          if (statusOf(error) === 403) throw error;
          attempted = false;
        }
      }
      if (session && Date.parse(session.sessionExpiresAtUtc) <= Date.now()) {
        session = null;
        user = null;
        attempted = false;
        dependencies.remove(sessionKey);
      }
      if (attempted) return user;
      try {
        const wxCode = await dependencies.wxCode();
        const result = await dependencies.autoLogin(wxCode);
        return accept(result, version);
      } catch (error) {
        if (version !== generation) return user;
        if (statusOf(error) === 401) {
          attempted = true;
          return null;
        }
        throw error;
      }
    })().finally(() => {
      pending = null;
    });
    return pending;
  };

  return {
    restore,
    invalidate,
    /** 当前会话令牌；未登录时为 undefined。请求封装通过 setAuthTokenProvider 读取。 */
    getToken: () => session?.accessToken,
    getPair: () => session,
    getGeneration: () => generation,
    syncPair(headers: Record<string, unknown>, requestGeneration: number) {
      if (requestGeneration !== generation || !session) return;
      const values = Object.fromEntries(
        Object.entries(headers).map(([key, value]) => [key.toLowerCase(), String(value)])
      );
      const accessToken = values["access-token"],
        refreshToken = values["x-access-token"];
      if (!accessToken && !refreshToken) return;
      if (!accessToken || !refreshToken) throw new Error("换发凭据不完整");
      const sessionVersion = Number(values["x-auth-session-version"]);
      if (
        values["x-auth-session-id"] !== session.sessionId ||
        !Number.isSafeInteger(sessionVersion) ||
        sessionVersion <= session.sessionVersion
      )
        return;
      // 小程序无需解析 JWT；有效性和刷新由服务端控制，绝对期限由响应头同步。
      const pair = {
        ...session,
        accessToken,
        refreshToken,
        sessionVersion,
        accessExpiresAtUtc: values["x-auth-access-expires-at"],
        refreshExpiresAtUtc: values["x-auth-refresh-expires-at"],
        sessionExpiresAtUtc: values["x-auth-session-expires-at"],
      };
      if (!validPair(pair)) throw new Error("换发会话格式无效");
      dependencies.write(sessionKey, pair);
      session = pair;
    },
    async requestCode(email: string) {
      return dependencies.sendEmailCode({ email: email.trim() });
    },
    async loginForPurchase(exchange: () => Promise<{ session: MiniSession; productId: string }>) {
      // 避免启动中的旧自动登录覆盖扫码获得的新会话。
      if (pending) await pending.catch(() => null);
      const version = ++generation;
      let productId = "";
      const login = (async () => {
        const result = await exchange();
        if (version !== generation) throw new Error("登录状态已变化，请重新扫码");
        productId = result.productId;
        return accept(result.session, version);
      })();
      pending = login;
      try {
        await login;
        return productId;
      } finally {
        if (pending === login) pending = null;
      }
    },
    async bind(input: BindInput) {
      if (!input.agreed) throw new Error("请先勾选用户协议与隐私政策");
      if (!input.credential) throw new Error("请填写验证码或密码");
      // 等待启动校验完成，避免旧自动登录在新绑定之后撤销新会话。
      if (pending) await pending.catch(() => null);
      const version = ++generation;
      const wxCode = await dependencies.wxCode();
      const result = await dependencies.bind({ ...input, email: input.email.trim(), wxCode });
      accept(result, version);
    },
    async logout() {
      if (pending) await pending.catch(() => null);
      if (session) {
        try {
          await dependencies.logout(session.accessToken);
        } catch (error) {
          if (statusOf(error) !== 401) throw error;
        }
      }
      ++generation;
      manuallyLoggedOut = true;
      session = null;
      user = null;
      attempted = true;
      dependencies.remove(sessionKey);
      dependencies.write(logoutKey, true);
    },
  };
};
