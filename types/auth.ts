export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  sessionId: string;
  sessionVersion: number;
  accessExpiresAtUtc: string;
  refreshExpiresAtUtc: string;
  sessionExpiresAtUtc: string;
}
export interface MiniSession extends StoredSession {
  user: AuthUser;
}

/** MiniAuth 绑定入参；mode 为 code 时 credential 是邮箱验证码，password 时是账号密码。 */
export interface BindInput {
  email: string;
  mode: "code" | "password";
  credential: string;
  agreed: boolean;
}
