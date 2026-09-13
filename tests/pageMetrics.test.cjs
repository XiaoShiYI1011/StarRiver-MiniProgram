const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const path = require("node:path");
const source = fs
  .readFileSync(path.join(__dirname, "../layout/pageMetrics.ts"), "utf8")
  .replace(/\/\/ #ifndef MP-WEIXIN[\s\S]*?\/\/ #endif/g, "");
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const measure = (info, capsule, fallback = info) => {
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    wx: {
      getWindowInfo: () => info,
      getSystemInfoSync: () => fallback,
      getMenuButtonBoundingClientRect: () => capsule,
    },
    uni: {
      getWindowInfo: () => {
        throw Error("小程序必须使用原生同步尺寸");
      },
    },
  });
  return { ...exports.getPageMetrics() };
};
test("刘海屏导航与微信胶囊对齐且保留右侧按钮空间", () => {
  assert.deepEqual(measure({ statusBarHeight: 47, windowWidth: 390 }, { top: 51, left: 293, width: 87, height: 32 }), {
    statusBarHeight: 47,
    navigationHeight: 44,
    navigationRight: 105,
  });
});
test("窗口信息缺失不能产生 NaN 避让或 134px 高导航", () => {
  assert.deepEqual(measure({}, { top: 51, left: 293, width: 87, height: 32 }), {
    statusBarHeight: 45,
    navigationHeight: 44,
    navigationRight: 104,
  });
});
test("无效胶囊保留状态栏和默认避让", () => {
  assert.deepEqual(measure({ statusBarHeight: 24, windowWidth: 360 }, { top: 0, left: 0, width: 0, height: 0 }), {
    statusBarHeight: 24,
    navigationHeight: 44,
    navigationRight: 104,
  });
});

test("新窗口接口字段缺失时使用旧接口真实尺寸", () => {
  assert.deepEqual(
    measure({}, { top: 51, left: 293, width: 87, height: 32 }, { statusBarHeight: 47, windowWidth: 390 }),
    {
      statusBarHeight: 47,
      navigationHeight: 44,
      navigationRight: 105,
    }
  );
});

test("开发工具状态栏与胶囊不一致时以胶囊校正刘海避让", () => {
  assert.deepEqual(measure({ statusBarHeight: 20, windowWidth: 390 }, { top: 51, left: 293, width: 87, height: 32 }), {
    statusBarHeight: 45,
    navigationHeight: 44,
    navigationRight: 105,
  });
});
