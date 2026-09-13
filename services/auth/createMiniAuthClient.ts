import type { AuthUser, MiniSession, StoredSession } from "@/types/auth";
import type { BindInput } from "@/types/studio";

interface Dependencies {
  request<T>(action: string, data?: object, token?: string): Promise<T>;
  wxCode(): Promise<string>;
  read(key: string): unknown;
  write(key: string, value: unknown): void;
  remove(key: string): void;
}

const sessionKey = "nwa-mini-session-v1";
const logoutKey = "nwa-mini-manual-logout-v1";
const statusOf = (error: unknown) => (error as { status?: number })?.status;

/** 身份状态仅来自后端；不读取演示账号、演示验证码或演示权益。 */
export const createMiniAuthClient = (dependencies: Dependencies) => {
  let session: StoredSession | null = null;
  let user: AuthUser | null = null;
  let checkedAt = 0;
  let attempted = false;
  let generation = 0;
  let pending: Promise<AuthUser | null> | null = null;
  const stored = dependencies.read(sessionKey) as StoredSession | undefined;
  if (stored && typeof stored.accessToken === "string" && Number.isFinite(Date.parse(stored.expiresAtUtc))) {
    session = stored;
  }
  let manuallyLoggedOut = dependencies.read(logoutKey) === true;

  const accept = (result: MiniSession, version: number) => {
    if (version !== generation) return user;
    if (!result.user?.id || !result.accessToken || !Number.isFinite(Date.parse(result.expiresAtUtc))) {
      throw new Error("登录结果异常，请重试");
    }
    session = { accessToken: result.accessToken, expiresAtUtc: result.expiresAtUtc };
    user = result.user;
    checkedAt = Date.now();
    manuallyLoggedOut = false;
    attempted = true;
    dependencies.write(sessionKey, session);
    dependencies.remove(logoutKey);
    return user;
  };

  const restore = async (): Promise<AuthUser | null> => {
    if (manuallyLoggedOut) return null;
    if (user && session && Date.parse(session.expiresAtUtc) > Date.now() && Date.now() - checkedAt < 60000) return user;
    if (pending) return pending;
    const version = generation;
    pending = (async () => {
      if (session && Date.parse(session.expiresAtUtc) > Date.now()) {
        try {
          const current = await dependencies.request<AuthUser>("GetCurrentUser", undefined, session.accessToken);
          if (version !== generation) return user;
          user = current;
          checkedAt = Date.now();
          return user;
        } catch (error) {
          if (version !== generation) return user;
          if (statusOf(error) !== 401 && statusOf(error) !== 403) throw error;
          session = null;
          user = null;
          dependencies.remove(sessionKey);
          if (statusOf(error) === 403) throw error;
          attempted = false;
        }
      }
      if (session && Date.parse(session.expiresAtUtc) <= Date.now()) {
        session = null;
        user = null;
        attempted = false;
        dependencies.remove(sessionKey);
      }
      if (attempted) return user;
      try {
        const wxCode = await dependencies.wxCode();
        const result = await dependencies.request<MiniSession>("AutoLogin", { wxCode });
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
    async requestCode(email: string) {
      return dependencies.request<{ retryAfter: number }>("SendEmailCode", { email: email.trim() });
    },
    async bind(input: BindInput) {
      if (!input.agreed) throw new Error("请先勾选用户协议与隐私政策");
      if (!input.credential) throw new Error("请填写验证码或密码");
      // 等待启动校验完成，避免旧自动登录在新绑定之后撤销新会话。
      if (pending) await pending.catch(() => null);
      const version = ++generation;
      const wxCode = await dependencies.wxCode();
      const result = await dependencies.request<MiniSession>("Bind", { ...input, email: input.email.trim(), wxCode });
      accept(result, version);
    },
    async logout() {
      if (pending) await pending.catch(() => null);
      if (session) {
        try {
          await dependencies.request("Logout", {}, session.accessToken);
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
