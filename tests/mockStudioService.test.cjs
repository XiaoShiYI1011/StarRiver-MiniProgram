const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

// 在独立的 UniApp 存储上下文中运行真实 TS service，每个测试互不污染。
const loadService = (storage = new Map()) => {
  const root = path.resolve(__dirname, "..");
  const modules = new Map();
  const load = (filename) => {
    if (modules.has(filename)) return modules.get(filename);
    const exports = {};
    modules.set(filename, exports);
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(source, {
      exports,
      uni: {
        getStorageSync: (key) => storage.get(key),
        setStorageSync: (key, value) => storage.set(key, structuredClone(value)),
      },
      require: (id) =>
        load(path.resolve(id.startsWith("@/") ? root : path.dirname(filename), `${id.replace(/^@\//, "")}.ts`)),
    });
    return exports;
  };
  return load(path.join(root, "services/mockStudioService.ts")).mockStudioService;
};

const bindDemo = (service) =>
  service.bind({ email: "writer@example.com", mode: "password", credential: "demo123456", agreed: true });

test("示例数据按原型初始化，返回副本不允许污染状态", async () => {
  const service = loadService();
  const first = await service.getDashboard();
  assert.equal(first.account.points, 12800);
  assert.equal(first.orders.length, 3);
  first.account.points = 0;
  first.orders.length = 0;
  assert.equal((await service.getDashboard()).account.points, 12800);
  assert.equal((await service.getDashboard()).orders.length, 3);
});

test("退出隐藏账号数据且阻止购买，重新绑定同一账号恢复权益", async () => {
  const service = loadService();
  const order = await service.createOrder("light");
  await service.payOrder(order.id);
  const loggedOut = await service.logout();
  assert.equal(loggedOut.account, null);
  assert.equal(loggedOut.orders.length, 0);
  await assert.rejects(service.createOrder("light"), /绑定账号/);
  assert.equal((await bindDemo(service)).account.planName, "轻量版");
});

test("验证码需要获取、匹配邮箱、匹配内容并勾选协议", async () => {
  const service = loadService();
  const input = { email: "reader@example.com", mode: "code", credential: "123456", agreed: true };
  await assert.rejects(service.bind(input), /先获取/);
  await assert.rejects(service.requestCode("invalid"), /有效的邮箱/);
  await service.requestCode(input.email);
  await assert.rejects(service.requestCode(input.email), /稍后/);
  await assert.rejects(service.bind({ ...input, email: "another@example.com" }), /先获取/);
  await assert.rejects(service.bind({ ...input, credential: "000000" }), /验证码不正确/);
  await assert.rejects(service.bind({ ...input, agreed: false }), /勾选/);
  assert.equal((await service.bind(input)).account.email, input.email);
  await assert.rejects(service.bind(input), /先获取/);
});

test("模拟支付幂等，加油包额度独立，关闭订单不可支付", async () => {
  const service = loadService();
  const plan = await service.createOrder("professional");
  assert.equal(plan.status, "pending");
  const paid = await service.payOrder(plan.id);
  assert.equal(paid.account.planName, "专业版");
  assert.equal(paid.account.points, 66000);
  const pack = await service.createOrder("pack-100k");
  await service.payOrder(pack.id);
  const repeated = await service.payOrder(pack.id);
  assert.equal(repeated.account.packWords, 100000);
  assert.equal(repeated.account.points, 66000);
  const canceled = await service.createOrder("standard");
  await service.cancelOrder(canceled.id);
  await assert.rejects(service.payOrder(canceled.id), /已关闭/);
  await assert.rejects(service.cancelOrder(plan.id), /无法取消/);
  await assert.rejects(service.createOrder("unknown"), /不存在/);
});

test("本地订单可恢复，密码和验证码不写入存储", async () => {
  const storage = new Map();
  const service = loadService(storage);
  await bindDemo(service);
  const order = await service.createOrder("pack-300k");
  await service.payOrder(order.id);
  const reloaded = await loadService(storage).getDashboard();
  assert.equal(reloaded.account.packWords, 300000);
  assert.ok(reloaded.orders.some((item) => item.id === order.id));
  const saved = JSON.stringify([...storage.values()]);
  assert.equal(saved.includes("demo123456"), false);
  assert.equal(saved.includes("credential"), false);
});
