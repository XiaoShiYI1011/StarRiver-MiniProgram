const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const load = (relative) => {
  const source = fs.readFileSync(path.join(__dirname, "..", relative), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  new Function("module", "exports", "require", code)(module, module.exports, require);
  return module.exports;
};
const { parsePurchaseScene, purchaseCheckoutQuery } = load("utils/purchaseScene.ts");
const { createMiniAuthClient } = load("services/auth/createMiniAuthClient.ts");
const session = (id) => ({
  user: { id, email: `${id}@example.com`, displayName: id, createdAt: "2026-01-01" },
  accessToken: `access-${id}`,
  refreshToken: `refresh-${id}`,
  sessionId: `sid-${id}`,
  sessionVersion: 1,
  sessionExpiresAtUtc: "2099-01-01",
});
const fixture = (overrides = {}) => {
  const storage = new Map();
  let autoCalls = 0;
  const client = createMiniAuthClient({
    autoLogin: async () => {
      autoCalls++;
      return session("old");
    },
    getCurrentUser: async () => session("old").user,
    sendEmailCode: async () => ({}),
    bind: async () => session("old"),
    logout: async () => {},
    wxCode: async () => "code",
    read: (key) => storage.get(key),
    write: (key, value) => storage.set(key, value),
    remove: (key) => storage.delete(key),
    ...overrides,
  });
  return { client, storage, autoCalls: () => autoCalls };
};

test("scene accepts only a 32-character opaque ticket", () => {
  const ticket = "abcdef0123456789abcdef0123456789";
  assert.equal(parsePurchaseScene(ticket), ticket);
  assert.equal(parsePurchaseScene("%61" + ticket.slice(1)), ticket);
  for (const value of [
    null,
    undefined,
    "",
    "%",
    "product=123",
    `${ticket}&user=1`,
    ticket.slice(1),
    ticket.toUpperCase(),
    "https://example.com",
  ])
    assert.equal(parsePurchaseScene(value), "");
});

test("purchase login replaces atomic pair and clears manual logout", async () => {
  const f = fixture();
  await f.client.restore();
  await f.client.logout();
  assert.equal(await f.client.restore(), null);
  const id = await f.client.loginForPurchase(async () => ({ session: session("buyer"), productId: "9001" }));
  assert.equal(id, "9001");
  assert.equal(f.client.getToken(), "access-buyer");
  assert.equal(f.storage.get("nwa-mini-manual-logout-v1"), undefined);
  assert.equal((await f.client.restore()).id, "buyer");
});

test("recharge scan adopts the web account and opens amount selection without creating a plan checkout", async () => {
  const f = fixture();
  await f.client.restore();
  const target = await f.client.loginForPurchase(async () => ({ session: session("buyer"), productId: "recharge" }));
  assert.equal((await f.client.restore()).id, "buyer");
  assert.equal(purchaseCheckoutQuery(target), "recharge=1");
  assert.equal(purchaseCheckoutQuery("9001"), "product=9001&checkout=1");
});

test("background restore waits for purchase exchange and cannot overwrite it", async () => {
  const f = fixture();
  let resolve;
  const login = f.client.loginForPurchase(
    () =>
      new Promise((r) => {
        resolve = r;
      })
  );
  const restore = f.client.restore();
  resolve({ session: session("buyer"), productId: "9001" });
  await login;
  assert.equal((await restore).id, "buyer");
  assert.equal(f.autoCalls(), 0);
  assert.equal(f.client.getToken(), "access-buyer");
});

test("restore during purchase does not return stale cached user", async () => {
  const f = fixture();
  await f.client.restore();
  let resolve;
  const login = f.client.loginForPurchase(
    () =>
      new Promise((r) => {
        resolve = r;
      })
  );
  const restore = f.client.restore();
  resolve({ session: session("buyer"), productId: "9001" });
  await login;
  assert.equal((await restore).id, "buyer");
});

test("failed or malformed purchase login does not discard an existing session", async () => {
  const f = fixture();
  await f.client.restore();
  await assert.rejects(
    f.client.loginForPurchase(async () => {
      throw new Error("expired");
    }),
    /expired/
  );
  assert.equal(f.client.getToken(), "access-old");
  await assert.rejects(
    f.client.loginForPurchase(async () => ({ session: { user: { id: "bad" } }, productId: "9001" })),
    /异常/
  );
  assert.equal(f.client.getToken(), "access-old");
});
