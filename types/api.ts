export interface ApiEnvelope<T> {
  statusCode: number;
  succeeded: boolean;
  data: T;
  errors?: unknown;
  extras?: unknown;
  timestamp?: number;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, statusCode = 500, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export interface PageResult<T> {
  totalCount: number;
  totalPages: number;
  pageData: T[];
}

export interface RequestOptions {
  /** 为 true 时不广播 401 事件，由调用方自行处理未登录（如认证接口）。 */
  skipAuthRedirect?: boolean;
}
