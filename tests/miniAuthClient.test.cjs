const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const code = ts.transpileModule(
  fs.readFileSync(path.resolve(__dirname, "../services/auth/createMiniAuthClient.ts"), "utf8"),
  {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }
).outputText;
const exported = {};
vm.runInNewContext(code, { exports: exported });
const session = () => ({
  user: { id: "123", email: "real@example.com", displayName: "Writer", createdAt: "2026-09-01T00:00:00Z" },
  accessToken: "server-token",
  expiresAtUtc: new Date(Date.now() + 86400000).toISOString(),
});
const setup = (handler, storage = new Map()) => {
  const calls = [];
  let codes = 0;
  const client = exported.createMiniAuthClient({
    request: async (action, data, token) => {
      calls.push({ action, data, token });
      return handler(action, data, token);
    },
    wxCode: async () => `fresh-code-${++codes}`,
    read: (key) => storage.get(key),
    write: (key, value) => storage.set(key, structuredClone(value)),
    remove: (key) => storage.delete(key),
  });
  return { client, calls, storage };
};
const unauthorized = () => {
  throw Object.assign(new Error("未绑定"), { status: 401 });
};
const input = { email: "real@example.com", mode: "password", credential: "real-password-123", agreed: true };

const requestAdapter = (uniApi) => {
  const result = {};
  const source = ts.transpileModule(
    fs.readFileSync(path.resolve(__dirname, "../services/auth/miniRequest.ts"), "utf8"),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }
  ).outputText;
  vm.runInNewContext(source, {
    exports: result,
    require: () => ({ API_BASE_URL: "http://127.0.0.1:5008" }),
    uni: uniApi,
  });
  return result;
};

test("请求适配器保留 HTTP 401，写请求使用 JSON 和 Bearer", async () => {
  let sent;
  const { miniRequest } = requestAdapter({
    getAccountInfoSync: () => ({ miniProgram: { envVersion: "develop" } }),
    request: (options) => {
      sent = options;
      options.success({ statusCode: 401, data: { statusCode: 200, succeeded: false } });
    },
  });
  await assert.rejects(miniRequest("Logout", {}, "test-token"), (error) => error.status === 401);
  assert.equal(sent.header.Authorization, "Bearer test-token");
  assert.equal(sent.header["Content-Type"], "application/json");
  assert.equal(sent.method, "POST");
});

test("发行环境拒绝把凭证发送到 HTTP 地址", async () => {
  let requested = false;
  const { miniRequest } = requestAdapter({
    getAccountInfoSync: () => ({ miniProgram: { envVersion: "release" } }),
    request: () => {
      requested = true;
    },
  });
  await assert.rejects(miniRequest("Bind", input), /HTTPS/);
  assert.equal(requested, false);
});

test("首次启动只发起一次微信自动登录，未绑定不会出现演示账号", async () => {
  const { client, calls } = setup(unauthorized);
  assert.equal(await client.restore(), null);
  assert.equal(await client.restore(), null);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].data.wxCode, "fresh-code-1");
});

test("绑定必须同意协议且每次提交使用新的微信 code；本地不保存密码", async () => {
  const { client, calls, storage } = setup(() => session());
  await assert.rejects(client.bind({ ...input, agreed: false }), /协议/);
  assert.equal(calls.length, 0);
  await client.bind(input);
  await client.bind(input);
  assert.equal(calls[0].data.wxCode, "fresh-code-1");
  assert.equal(calls[1].data.wxCode, "fresh-code-2");
  assert.equal((await client.restore()).email, "real@example.com");
  assert.ok(!JSON.stringify([...storage]).includes(input.credential));
  assert.ok(!JSON.stringify([...storage]).includes("fresh-code"));
});

test("持久化令牌恢复时先由服务端校验，不会重复创建会话", async () => {
  const storage = new Map();
  const first = setup(() => session(), storage);
  await first.client.bind(input);
  const next = setup(() => session().user, storage);
  await Promise.all([next.client.restore(), next.client.restore()]);
  assert.equal(next.calls.length, 1);
  assert.equal(next.calls[0].action, "GetCurrentUser");
  assert.equal(next.calls[0].token, "server-token");
});

test("失效令牌清理后重新获取微信身份；网络错误保留令牌并允许重试", async () => {
  const storage = new Map([["nwa-mini-session-v1", session()]]);
  let offline = true;
  const { client, calls } = setup((action) => {
    if (offline) throw Object.assign(new Error("offline"), { status: 0 });
    if (action === "GetCurrentUser") return unauthorized();
    return session();
  }, storage);
  await assert.rejects(client.restore(), /offline/);
  assert.ok(storage.has("nwa-mini-session-v1"));
  offline = false;
  assert.equal((await client.restore()).id, "123");
  assert.deepEqual(
    calls.map((call) => call.action),
    ["GetCurrentUser", "GetCurrentUser", "AutoLogin"]
  );
});

test("主动退出撤销服务端令牌，再次启动保持退出；绑定后恢复", async () => {
  const { client, storage, calls } = setup(() => session());
  await client.bind(input);
  await client.logout();
  assert.equal(calls.at(-1).action, "Logout");
  assert.equal(calls.at(-1).token, "server-token");
  assert.equal(await client.restore(), null);
  const next = setup(() => session(), storage);
  assert.equal(await next.client.restore(), null);
  assert.equal(next.calls.length, 0);
  await next.client.bind(input);
  assert.equal((await next.client.restore()).id, "123");
});

test("退出网络失败不谎报撤销成功，允许重试", async () => {
  let failing = true;
  const { client, storage } = setup((action) => {
    if (action === "Logout" && failing) throw Object.assign(new Error("offline"), { status: 0 });
    return session();
  });
  await client.bind(input);
  await assert.rejects(client.logout(), /offline/);
  assert.ok(storage.has("nwa-mini-session-v1"));
  failing = false;
  await client.logout();
  assert.ok(!storage.has("nwa-mini-session-v1"));
});

test("启动与绑定同时发生时，先完成旧会话恢复再提交绑定", async () => {
  let release;
  const oldLogin = new Promise((resolve) => {
    release = resolve;
  });
  const { client, calls } = setup((action) => (action === "AutoLogin" ? oldLogin : session()));
  const restoring = client.restore();
  const binding = client.bind(input);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(
    calls.map((call) => call.action),
    ["AutoLogin"]
  );
  release(session());
  await restoring;
  await binding;
  assert.deepEqual(
    calls.map((call) => call.action),
    ["AutoLogin", "Bind"]
  );
});
