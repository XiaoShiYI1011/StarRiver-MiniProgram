<template>
  <view
    v-if="DEBUG_PANEL_ENABLED && !opened"
    class="debug-panel__ball"
    :style="ballStyle"
    aria-label="打开调试面板"
    @touchstart="handleBallTouchStart"
    @touchmove.stop.prevent="handleBallTouchMove"
    @touchend="handleBallTouchEnd"
    @touchcancel="handleBallTouchEnd"
  >
    <text class="debug-panel__ball-text">调试</text>
    <view v-if="debugErrors.length" class="debug-panel__ball-badge">
      {{ debugErrors.length > 99 ? "99+" : debugErrors.length }}
    </view>
  </view>
  <view v-if="DEBUG_PANEL_ENABLED && opened" class="debug-panel__mask" @touchmove.stop.prevent @tap="opened = false">
    <view class="debug-panel__sheet" @tap.stop>
      <view class="debug-panel__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="debug-panel__tab"
          :class="{ 'debug-panel__tab--active': activeTab === tab.id }"
          @tap="activeTab = tab.id"
        >
          {{ tab.label }}
          <text v-if="tab.count" class="debug-panel__tab-count">{{ tab.count > 99 ? "99+" : tab.count }}</text>
        </button>
      </view>
      <view class="debug-panel__actions">
        <button class="debug-panel__action" @tap="handleClear">清空</button>
        <button class="debug-panel__action" @tap="handleCopy">复制诊断</button>
        <button class="debug-panel__action" @tap="opened = false">收起</button>
      </view>
      <scroll-view class="debug-panel__list" scroll-y>
        <template v-if="activeTab === 'console'">
          <view
            v-for="entry in debugLogs"
            :key="`log-${entry.id}`"
            class="debug-panel__entry"
            :class="`debug-panel__entry--${entry.level}`"
            @tap="toggleExpanded(logExpanded, entry.id)"
          >
            <view class="debug-panel__entry-head">
              <text class="debug-panel__entry-time">{{ formatDebugTime(entry.time) }}</text>
              <text class="debug-panel__entry-summary">{{ entry.preview }}</text>
            </view>
            <text v-if="logExpanded.has(entry.id)" selectable class="debug-panel__detail-block">
              {{ entry.detail }}
            </text>
          </view>
          <view v-if="!debugLogs.length" class="debug-panel__empty">暂无日志</view>
        </template>
        <template v-else-if="activeTab === 'network'">
          <view
            v-for="entry in debugRequests"
            :key="`request-${entry.id}`"
            class="debug-panel__entry"
            @tap="toggleExpanded(requestExpanded, entry.id)"
          >
            <view class="debug-panel__entry-head">
              <text class="debug-panel__method" :class="`debug-panel__method--${entry.method.toLowerCase()}`">
                {{ entry.method }}
              </text>
              <text class="debug-panel__entry-summary">{{ entry.path }}</text>
              <text class="debug-panel__duration">
                {{ entry.status === "pending" ? "…" : `${entry.durationMs}ms` }}
              </text>
              <text
                class="debug-panel__status"
                :class="{ 'debug-panel__status--bad': entry.status === 'done' && !entry.ok }"
              >
                {{ renderRequestStatus(entry) }}
              </text>
            </view>
            <view v-if="requestExpanded.has(entry.id)" class="debug-panel__detail">
              <text selectable class="debug-panel__detail-block">{{ entry.url }}</text>
              <template v-if="entry.errorMessage">
                <text class="debug-panel__detail-title">失败原因</text>
                <text selectable class="debug-panel__detail-block debug-panel__detail-block--bad">
                  {{ entry.errorMessage }}
                </text>
              </template>
              <template v-if="entry.requestHeaders">
                <text class="debug-panel__detail-title">请求头（令牌已脱敏）</text>
                <text selectable class="debug-panel__detail-block">{{ entry.requestHeaders }}</text>
              </template>
              <template v-if="entry.requestBody">
                <text class="debug-panel__detail-title">请求体</text>
                <text selectable class="debug-panel__detail-block">{{ entry.requestBody }}</text>
              </template>
              <template v-if="entry.responseHeaders">
                <text class="debug-panel__detail-title">响应头</text>
                <text selectable class="debug-panel__detail-block">{{ entry.responseHeaders }}</text>
              </template>
              <template v-if="entry.responseBody">
                <text class="debug-panel__detail-title">响应体</text>
                <text selectable class="debug-panel__detail-block">{{ entry.responseBody }}</text>
              </template>
            </view>
          </view>
          <view v-if="!debugRequests.length" class="debug-panel__empty">暂无网络请求</view>
        </template>
        <template v-else-if="activeTab === 'errors'">
          <view
            v-for="entry in debugErrors"
            :key="`error-${entry.id}`"
            class="debug-panel__entry debug-panel__entry--error"
            @tap="toggleExpanded(errorExpanded, entry.id)"
          >
            <view class="debug-panel__entry-head">
              <text class="debug-panel__error-kind">{{ entry.kind === "promise" ? "Promise" : "JS" }}</text>
              <text class="debug-panel__entry-summary">{{ entry.message }}</text>
              <text class="debug-panel__entry-time">{{ formatDebugTime(entry.time) }}</text>
            </view>
            <text v-if="errorExpanded.has(entry.id)" selectable class="debug-panel__detail-block">
              {{ entry.stack || "（无堆栈信息）" }}
            </text>
          </view>
          <view v-if="!debugErrors.length" class="debug-panel__empty">暂无报错</view>
        </template>
        <template v-else>
          <view class="debug-panel__env-tip">
            诊断信息包含环境、错误与最近的请求日志，令牌已脱敏，可放心粘贴给开发排查。
          </view>
          <view v-for="row in environmentRows" :key="row.label" class="debug-panel__env-row">
            <text class="debug-panel__env-label">{{ row.label }}</text>
            <text selectable class="debug-panel__env-value">{{ row.value }}</text>
          </view>
        </template>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  DEBUG_PANEL_ENABLED,
  buildDiagnosticsReport,
  clearDebugData,
  collectEnvironmentInfo,
  debugErrors,
  debugLogs,
  debugRequests,
  formatDebugTime,
} from "@/utils/debugMonitor";
import type { DebugRequestEntry } from "@/utils/debugMonitor";

type DebugTabId = "console" | "network" | "errors" | "environment";

const ballSize = 52;
const ballMargin = 8;

const toPositiveFinite = (value: number, fallback: number) => (Number.isFinite(value) && value > 0 ? value : fallback);

const readBallBounds = () => {
  try {
    const info = uni.getWindowInfo();
    return {
      width: toPositiveFinite(info.windowWidth, 375),
      height: toPositiveFinite(info.windowHeight, 667),
    };
  } catch {
    // 窗口信息不可用时按常见竖屏尺寸兜底。
    return { width: 375, height: 667 };
  }
};

const clampBall = (x: number, y: number, bounds: { width: number; height: number }) => ({
  x: Math.min(Math.max(x, ballMargin), Math.max(ballMargin, bounds.width - ballSize - ballMargin)),
  y: Math.min(Math.max(y, ballMargin), Math.max(ballMargin, bounds.height - ballSize - ballMargin)),
});

const initialBounds = readBallBounds();
const ball = ref(
  clampBall(initialBounds.width - ballSize - ballMargin, Math.round(initialBounds.height * 0.58), initialBounds)
);

// 绑定整串样式而非对象字面量：对象形式会被编译为 WXML 内联拼接表达式，部分基础库上不生效。
const ballStyle = computed(() => `left: ${ball.value.x}px; top: ${ball.value.y}px;`);

const opened = ref(false);
const activeTab = ref<DebugTabId>("console");
const logExpanded = ref(new Set<number>());
const requestExpanded = ref(new Set<number>());
const errorExpanded = ref(new Set<number>());
const environmentRows = ref<ReturnType<typeof collectEnvironmentInfo>>([]);

const tabs = computed(() => [
  { id: "console" as DebugTabId, label: "日志", count: debugLogs.value.length },
  { id: "network" as DebugTabId, label: "网络", count: debugRequests.value.length },
  { id: "errors" as DebugTabId, label: "报错", count: debugErrors.value.length },
  { id: "environment" as DebugTabId, label: "环境", count: 0 },
]);

const refreshEnvironment = () => {
  environmentRows.value = collectEnvironmentInfo();
};

watch(opened, (value) => {
  if (value) refreshEnvironment();
});

const renderRequestStatus = (entry: DebugRequestEntry) => {
  if (entry.status === "pending") return "…";
  if (entry.ok) return String(entry.httpStatusCode);
  return entry.httpStatusCode ? String(entry.httpStatusCode) : "失败";
};

let touchActive = false;
let touchMoved = false;
let touchStartX = 0;
let touchStartY = 0;
let ballStartX = 0;
let ballStartY = 0;

const handleBallTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0];
  if (!touch) return;
  touchActive = true;
  touchMoved = false;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  ballStartX = ball.value.x;
  ballStartY = ball.value.y;
};

const handleBallTouchMove = (event: TouchEvent) => {
  const touch = event.touches[0];
  if (!touchActive || !touch) return;
  const offsetX = touch.clientX - touchStartX;
  const offsetY = touch.clientY - touchStartY;
  if (!touchMoved && Math.abs(offsetX) < 6 && Math.abs(offsetY) < 6) return;
  touchMoved = true;
  ball.value = clampBall(ballStartX + offsetX, ballStartY + offsetY, readBallBounds());
};

// 位移小于阈值视为点击，直接展开面板；否则只调整悬浮球位置。
const handleBallTouchEnd = () => {
  if (!touchActive) return;
  touchActive = false;
  if (!touchMoved) opened.value = true;
};

// 模板中的 ref 已解包为响应式 Set，直接变更即可触发视图更新。
const toggleExpanded = (set: Set<number>, id: number) => {
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
};

const handleClear = () => {
  uni.showModal({
    title: "清空调试数据",
    content: "将清空已采集的日志、网络请求与报错记录。",
    success: (result) => {
      if (!result.confirm) return;
      clearDebugData();
      logExpanded.value = new Set();
      requestExpanded.value = new Set();
      errorExpanded.value = new Set();
    },
  });
};

const handleCopy = () => {
  uni.setClipboardData({
    data: buildDiagnosticsReport(),
    success: () => uni.showToast({ title: "诊断信息已复制", icon: "none" }),
    fail: () => uni.showToast({ title: "复制失败，请重试", icon: "none" }),
  });
};
</script>

<style lang="scss" scoped>
.debug-panel {
  $badge-offset: -4px;

  &__ball {
    position: fixed;
    z-index: 998;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    color: #fff;
    background: rgb(17 24 39 / 82%);
    border-radius: 50%;
    box-shadow: 0 6px 18px rgb(0 0 0 / 28%);
  }

  &__ball-text {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
  }

  &__ball-badge {
    position: absolute;
    top: $badge-offset;
    right: $badge-offset;
    box-sizing: border-box;
    min-width: 18px;
    padding: 0 5px;
    font-size: 11px;
    line-height: 18px;
    color: #fff;
    text-align: center;
    background: #e5484d;
    border: 1px solid #fff;
    border-radius: 9px;
  }

  &__mask {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgb(8 10 16 / 45%);
  }

  &__sheet {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    height: 78%;
    padding-bottom: env(safe-area-inset-bottom, 0);
    background: var(--paper-raised);
    border-radius: 20rpx 20rpx 0 0;
    box-shadow: var(--shadow-float);
  }

  &__tabs {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    padding: 10px 12px 0;
  }

  &__tab {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    padding: 6px 0;
    margin: 0;
    font-size: 13px;
    color: var(--ink-soft);
    background: var(--paper-inset);
    border-radius: 10px;
  }

  &__tab::after {
    border: 0;
  }

  &__tab--active {
    font-weight: 600;
    color: var(--accent);
    background: var(--accent-wash);
  }

  &__tab-count {
    margin-left: 3px;
    font-size: 11px;
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    justify-content: flex-end;
    padding: 8px 12px;
    border-bottom: 1px solid var(--line);
  }

  &__action {
    padding: 4px 12px;
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--ink-soft);
    background: var(--paper-inset);
    border-radius: 999px;
  }

  &__action::after {
    border: 0;
  }

  &__list {
    flex: 1;
    height: 0;
  }

  &__entry {
    padding: 8px 12px;
    border-bottom: 1px solid var(--line);
  }

  &__entry--warn {
    background: var(--warning-wash);
  }

  &__entry--error {
    background: var(--danger-wash);
  }

  &__entry-head {
    display: flex;
    gap: 8px;
    align-items: baseline;
  }

  &__entry-time {
    flex-shrink: 0;
    font-size: 10px;
    color: var(--ink-faint);
  }

  &__entry-summary {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.5;
    color: var(--ink);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__entry--error &__entry-summary {
    color: var(--danger);
  }

  &__method {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 700;
    color: var(--ink-soft);
  }

  &__method--get {
    color: var(--success);
  }

  &__method--post {
    color: var(--accent);
  }

  &__method--put {
    color: var(--warning);
  }

  &__method--delete {
    color: var(--danger);
  }

  &__duration {
    flex-shrink: 0;
    font-size: 10px;
    color: var(--ink-faint);
  }

  &__status {
    flex-shrink: 0;
    min-width: 24px;
    font-size: 11px;
    font-weight: 600;
    color: var(--success);
    text-align: right;
  }

  &__status--bad {
    color: var(--danger);
  }

  &__error-kind {
    flex-shrink: 0;
    padding: 0 4px;
    font-size: 10px;
    font-weight: 700;
    line-height: 16px;
    color: #fff;
    background: var(--danger);
    border-radius: 4px;
  }

  &__detail {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-top: 6px;
  }

  &__detail-title {
    font-size: 10px;
    font-weight: 600;
    color: var(--ink-faint);
  }

  &__detail-block {
    font-size: 11px;
    line-height: 1.5;
    color: var(--ink-muted);
    word-break: break-all;
    white-space: pre-wrap;
  }

  &__detail-block--bad {
    color: var(--danger);
  }

  &__empty {
    padding: 48px 0;
    font-size: 12px;
    color: var(--ink-faint);
    text-align: center;
  }

  &__env-tip {
    padding: 10px 12px;
    font-size: 11px;
    line-height: 1.6;
    color: var(--ink-faint);
    background: var(--paper-inset);
  }

  &__env-row {
    display: flex;
    gap: 12px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--line);
  }

  &__env-label {
    flex-shrink: 0;
    width: 104px;
    font-size: 12px;
    color: var(--ink-soft);
  }

  &__env-value {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--ink);
    word-break: break-all;
  }
}
</style>
