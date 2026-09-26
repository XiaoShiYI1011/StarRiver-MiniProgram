import { ref } from "vue";
import type { Ref } from "vue";
import { API_BASE_URL } from "@/config/api";

/**
 * 线上调试面板采集核心：在真机/发行包中替代开发者工具的 Console / Network / 报错面板。
 * 通过运行时包装 console、uni.request 与全局错误监听采集数据，业务代码与 utils/request.ts 零改动；
 * VITE_DEBUG_PANEL 未开启时 installDebugMonitor 直接返回，打包产物几乎不产生任何开销。
 * 面板 UI 见 components/debug/DebugPanel.vue，由 main.ts 与 layout/components/pageContainer.vue 各接入一行。
 */

/**
 * 构建期开关：在项目唯一的 .env 中维护，运行时不可更改。
 * 留空时开发模式（import.meta.env.DEV）默认开启、发行包默认关闭；
 * 显式设置 true / false 可在任何模式强制覆盖默认。
 */
export const DEBUG_PANEL_ENABLED =
  import.meta.env.VITE_DEBUG_PANEL === "true" || (import.meta.env.VITE_DEBUG_PANEL !== "false" && import.meta.env.DEV);

export type DebugLogLevel = "log" | "info" | "warn" | "error";
export type DebugErrorKind = "js" | "promise";

export interface DebugLogEntry {
  id: number;
  level: DebugLogLevel;
  time: number;
  /** 单行摘要，列表直接展示。 */
  preview: string;
  /** 展开后的多行详情（对象格式化 JSON、Error 含堆栈）。 */
  detail: string;
}

export interface DebugRequestEntry {
  id: number;
  method: string;
  /** 完整 URL，展开详情时展示。 */
  url: string;
  /** 去掉后端基地址后的路径，列表直接展示。 */
  path: string;
  status: "pending" | "done";
  httpStatusCode: number;
  /** HTTP 2xx 且信封 succeeded（或非信封响应的 2xx）。 */
  ok: boolean;
  durationMs: number;
  time: number;
  requestHeaders: string;
  requestBody: string;
  responseHeaders: string;
  responseBody: string;
  errorMessage: string;
}

export interface DebugErrorEntry {
  id: number;
  kind: DebugErrorKind;
  message: string;
  stack: string;
  time: number;
}

export interface DebugEnvironmentRow {
  label: string;
  value: string;
}

const maxLogs = 300;
const maxRequests = 100;
const maxErrors = 50;
const maxPreviewLength = 260;
const maxDetailLength = 4000;
/** 诊断报告里日志/请求的导出条数，控制剪贴板体积。 */
const maxReportEntries = 30;
const sensitiveHeaderPattern = /authorization|cookie|token|session/i;

export const debugLogs = ref<DebugLogEntry[]>([]);
export const debugRequests = ref<DebugRequestEntry[]>([]);
export const debugErrors = ref<DebugErrorEntry[]>([]);

let sequence = 0;
let installed = false;
/** 防止 Vue/框架内部告警走 console 又被采集，造成递归。 */
let recording = false;

const takeId = () => {
  sequence += 1;
  return sequence;
};

const pushCapped = <T>(entries: Ref<T[]>, item: T, cap: number) => {
  entries.value.push(item);
  if (entries.value.length > cap) entries.value.splice(0, entries.value.length - cap);
};

const truncate = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}…（已截断）` : text;

/** 循环引用安全的 JSON 序列化；函数/BigInt 等不可序列化值转为可读占位。 */
const safeStringify = (value: unknown, pretty = false): string => {
  const seen = new WeakSet<object>();
  try {
    return (
      JSON.stringify(
        value,
        (key, item) => {
          if (/^(ticket|wxCode|accessToken|refreshToken|sessionKey|credential|password)$/i.test(key)) return "[已隐藏]";
          if (typeof item === "bigint") return `${item}n`;
          if (typeof item === "function") return `[Function ${item.name || "anonymous"}]`;
          if (typeof item === "object" && item !== null) {
            if (seen.has(item)) return "[Circular]";
            seen.add(item);
          }
          return item;
        },
        pretty ? 2 : undefined
      ) ?? String(value)
    );
  } catch {
    return String(value);
  }
};

const formatValue = (value: unknown, pretty: boolean): string => {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.stack || `${value.name}: ${value.message}`;
  if (typeof value === "undefined") return "undefined";
  return safeStringify(value, pretty);
};

const describeError = (source: unknown) => {
  if (source instanceof Error)
    return { message: `${source.name}: ${source.message}`, stack: truncate(source.stack || "", maxDetailLength) };
  const text = typeof source === "string" ? source : safeStringify(source) || String(source);
  return { message: truncate(text, 500), stack: "" };
};

const recordLog = (level: DebugLogLevel, args: unknown[]) => {
  if (recording) return;
  recording = true;
  try {
    const parts = args.map((arg) => formatValue(arg, false));
    const detailParts = args.map((arg) => formatValue(arg, true));
    pushCapped(
      debugLogs,
      {
        id: takeId(),
        level,
        time: Date.now(),
        preview: truncate(parts.join(" "), maxPreviewLength),
        detail: truncate(detailParts.join("\n"), maxDetailLength),
      },
      maxLogs
    );
  } finally {
    recording = false;
  }
};

const recordError = (kind: DebugErrorKind, source: unknown) => {
  if (recording) return;
  recording = true;
  try {
    const described = describeError(source);
    pushCapped(debugErrors, { id: takeId(), kind, time: Date.now(), ...described }, maxErrors);
  } finally {
    recording = false;
  }
};

const patchConsole = () => {
  if (typeof console === "undefined") return;
  (["log", "info", "warn", "error"] as const).forEach((level) => {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      recordLog(level, args);
      // 原样透传，保持开发者工具与日志平台的原有行为不变。
      original(...args);
    };
  });
};

const toDisplayPath = (url: unknown) => {
  const text = String(url ?? "");
  if (API_BASE_URL && text.startsWith(API_BASE_URL)) return text.slice(API_BASE_URL.length) || "/";
  return text;
};

/** 令牌类请求头只保留前 12 位，避免复制诊断信息时泄露凭证。 */
const formatHeaders = (headers: unknown) => {
  if (!headers || typeof headers !== "object") return "";
  const lines = Object.entries(headers as Record<string, unknown>).map(([key, value]) => {
    const text = typeof value === "string" ? value : safeStringify(value);
    const safe = sensitiveHeaderPattern.test(key) && text.length > 12 ? `${text.slice(0, 12)}…` : text;
    return `${key}: ${safe}`;
  });
  return truncate(lines.join("\n"), maxDetailLength);
};

const formatBody = (body: unknown) => {
  if (typeof body === "string") return body;
  if (body instanceof ArrayBuffer) return "[ArrayBuffer 响应，未展示]";
  return safeStringify(body, true);
};

const createRequestEntry = (options: UniNamespace.RequestOptions): DebugRequestEntry => {
  const entry: DebugRequestEntry = {
    id: takeId(),
    method: options.method ?? "GET",
    url: String(options.url ?? ""),
    path: toDisplayPath(options.url),
    status: "pending",
    httpStatusCode: 0,
    ok: false,
    durationMs: 0,
    time: Date.now(),
    requestHeaders: formatHeaders(options.header),
    requestBody: truncate(formatBody(options.data), maxDetailLength),
    responseHeaders: "",
    responseBody: "",
    errorMessage: "",
  };
  pushCapped(debugRequests, entry, maxRequests);
  return entry;
};

const completeRequestEntry = (
  entry: DebugRequestEntry,
  httpStatusCode: number,
  data: unknown,
  header: unknown,
  startedAt: number,
  errorMessage: string
) => {
  entry.status = "done";
  entry.httpStatusCode = httpStatusCode;
  entry.durationMs = Date.now() - startedAt;
  entry.errorMessage = errorMessage;
  if (header) entry.responseHeaders = formatHeaders(header);
  if (data !== undefined) entry.responseBody = truncate(formatBody(data), maxDetailLength);
  const envelope = data as { succeeded?: unknown } | undefined;
  const envelopeOk = typeof envelope?.succeeded !== "boolean" || envelope.succeeded === true;
  entry.ok = httpStatusCode >= 200 && httpStatusCode < 300 && !errorMessage && envelopeOk;
};

const patchUniRequest = () => {
  const runtime = uni as unknown as { request?: (options: UniNamespace.RequestOptions) => unknown };
  const nativeRequest = runtime.request;
  if (typeof nativeRequest !== "function") return;
  runtime.request = (options: UniNamespace.RequestOptions) => {
    const entry = createRequestEntry(options);
    const startedAt = Date.now();
    const originalSuccess = options.success;
    const originalFail = options.fail;
    const originalComplete = options.complete;
    const next: UniNamespace.RequestOptions = {
      ...options,
      success: (result) => {
        completeRequestEntry(entry, result.statusCode, result.data, result.header, startedAt, "");
        originalSuccess?.(result);
      },
      fail: (error) => {
        completeRequestEntry(entry, 0, undefined, undefined, startedAt, error?.errMsg || "网络请求失败");
        originalFail?.(error);
      },
      complete: (result) => originalComplete?.(result),
    };
    if (originalSuccess || originalFail || originalComplete) return nativeRequest(next);
    // Promise 风格调用：注入回调后原生不再返回 Promise，这里手动重建，保持调用方语义不变。
    return new Promise((resolve, reject) => {
      nativeRequest({ ...next, success: (result) => resolve(result), fail: (error) => reject(error) });
    });
  };
};

/** uni 对 wx.onError / onUnhandledRejection 的同名映射在 H5 端不存在，H5 走 window 事件，两端互斥不会重复采集。 */
interface GlobalErrorMonitor {
  onError?: (callback: (error: unknown) => void) => void;
  onUnhandledRejection?: (callback: (result: { reason: unknown }) => void) => void;
  onMemoryWarning?: (callback: (result: { level?: number | string }) => void) => void;
}

const captureGlobalErrors = () => {
  const monitor = uni as unknown as GlobalErrorMonitor;
  try {
    monitor.onError?.((error) => recordError("js", error));
  } catch {
    // 平台未提供该监听时忽略。
  }
  try {
    monitor.onUnhandledRejection?.((result) => recordError("promise", result?.reason));
  } catch {
    // 平台未提供该监听时忽略。
  }
  try {
    monitor.onMemoryWarning?.((result) =>
      recordLog("warn", [`设备内存告警（level: ${result?.level ?? "未知"}），小程序可能被系统回收`])
    );
  } catch {
    // 平台未提供该监听时忽略。
  }
  if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("error", (event) => {
      // 只采集脚本错误，静态资源加载失败没有 error 对象，不进入报错面板。
      if (event instanceof ErrorEvent) recordError("js", event.error ?? event.message);
    });
    window.addEventListener("unhandledrejection", (event) => {
      recordError("promise", (event as PromiseRejectionEvent).reason);
    });
  }
};

/** 在应用创建前调用（main.ts），越早安装越能捕获启动期日志。 */
export const installDebugMonitor = () => {
  if (installed || !DEBUG_PANEL_ENABLED) return;
  installed = true;
  patchConsole();
  patchUniRequest();
  captureGlobalErrors();
  recordLog("info", ["调试面板已启用，正在采集 console / 网络请求 / 全局错误"]);
};

export const clearDebugData = () => {
  debugLogs.value = [];
  debugRequests.value = [];
  debugErrors.value = [];
};

export const formatDebugTime = (time: number) => {
  const date = new Date(time);
  const pad = (value: number, length = 2) => String(value).padStart(length, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
};

/** 环境/设备信息逐项读取，单项失败只影响自身展示为 “-”。 */
export const collectEnvironmentInfo = (): DebugEnvironmentRow[] => {
  const rows: DebugEnvironmentRow[] = [{ label: "采集时间", value: new Date().toLocaleString() }];
  const push = (label: string, read: () => string) => {
    try {
      rows.push({ label, value: read() || "-" });
    } catch {
      rows.push({ label, value: "-" });
    }
  };
  push("后端地址", () => API_BASE_URL);
  push("运行模式", () => (import.meta.env.DEV ? "development" : "production"));
  push("调试开关", () => import.meta.env.VITE_DEBUG_PANEL || "未设置（按模式默认）");
  push("系统", () => {
    const info = uni.getSystemInfoSync();
    return `${info.system}（${info.platform} / ${info.uniPlatform ?? "-"}）`;
  });
  push("设备", () => {
    const info = uni.getSystemInfoSync();
    return `${info.brand} ${info.model}`;
  });
  push("基础库/内核版本", () => {
    const info = uni.getSystemInfoSync();
    return `${info.SDKVersion ?? "-"}（App ${info.version ?? "-"}）`;
  });
  push("屏幕", () => {
    const info = uni.getSystemInfoSync();
    return `${info.screenWidth}x${info.screenHeight} @${info.pixelRatio}x，窗口 ${info.windowWidth}x${info.windowHeight}`;
  });
  push("小程序环境", () => uni.getAccountInfoSync().miniProgram.envVersion);
  push("小程序版本", () => {
    const account = uni.getAccountInfoSync().miniProgram;
    return `${account.version ?? "-"}（${account.appId}）`;
  });
  push("页面栈", () =>
    getCurrentPages()
      .map((page) => page.route)
      .join(" > ")
  );
  push("本地存储键", () => truncate(uni.getStorageInfoSync().keys.join(", "), 300));
  return rows;
};

/** 导出可粘贴给开发者的纯文本诊断报告：环境 + 错误 + 最近请求与日志。 */
export const buildDiagnosticsReport = () => {
  const sections: string[] = [];
  sections.push(
    `【环境】\n${collectEnvironmentInfo()
      .map((row) => `${row.label}: ${row.value}`)
      .join("\n")}`
  );
  if (debugErrors.value.length) {
    const lines = debugErrors.value.map(
      (entry) =>
        `[${formatDebugTime(entry.time)}] ${entry.kind === "promise" ? "未处理Promise" : "JS错误"} ${entry.message}`
    );
    sections.push(`【错误 ${debugErrors.value.length} 条】\n${lines.join("\n")}`);
  }
  if (debugRequests.value.length) {
    const recent = debugRequests.value.slice(-maxReportEntries);
    const lines = recent.map((entry) => {
      const outcome =
        entry.status === "pending"
          ? "进行中"
          : entry.ok
            ? `${entry.httpStatusCode}`
            : `${entry.httpStatusCode || "失败"} ${entry.errorMessage || "业务错误"}`;
      return `[${formatDebugTime(entry.time)}] ${entry.method} ${entry.path} → ${outcome}（${entry.durationMs}ms）`;
    });
    sections.push(`【网络 最近 ${recent.length} 条】\n${lines.join("\n")}`);
  }
  if (debugLogs.value.length) {
    const recent = debugLogs.value.slice(-maxReportEntries);
    const lines = recent.map((entry) => `[${formatDebugTime(entry.time)}] [${entry.level}] ${entry.preview}`);
    sections.push(`【日志 最近 ${recent.length} 条】\n${lines.join("\n")}`);
  }
  return sections.join("\n\n");
};
