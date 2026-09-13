export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface MiniSession {
  user: AuthUser;
  accessToken: string;
  expiresAtUtc: string;
}

export interface StoredSession {
  accessToken: string;
  expiresAtUtc: string;
}
