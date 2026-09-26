const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const fixture = (overrides = {}) => {
  const calls = [];
  const quote = {
    id: "quote-1",
    action: "upgrade",
    amountFen: 1500,
    productId: "standard",
    expiresAtUtc: "2099-01-01",
  };
  const product = { id: "standard", priceFen: 5900, editVersion: 1, purchaseAction: "upgrade" };
  const api = {
    quotePlan: async (id) => {
      calls.push(["quote", id]);
      return quote;
    },
    createPlanOrder: async (input) => {
      calls.push(["order", input]);
      return { id: "order-1", status: 1 };
    },
    createVirtualPayment: async (input) => {
      calls.push(["payment", input]);
      return {};
    },
    queryProducts: async () => [product],
    ...overrides,
  };
  const dependencies = {
    vue: require("vue"),
    "@/composables/useStudio": { useStudio: () => ({ refresh: async () => calls.push(["refresh"]) }) },
    "@/api/billing": { billingApi: api, newIdempotencyKey: () => "key" },
    "@/utils/navigation": { openBind() {} },
    "@/utils/format": { errorMessage: (error) => error.message },
    "@/services/auth/miniAuthClient": { miniAuthClient: { restore: async () => true } },
    "@/types/billing": { BillingOrderStatus: { Paid: 2 } },
    "@/services/virtualPayment": {
      requestVirtualPayment: async () => calls.push(["wx"]),
      pollOrderPaid: async () => true,
      VirtualPaymentCancelledError: class extends Error {},
    },
  };
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "../packages/shop/composables/useCheckout.ts"), "utf8"),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }
  ).outputText;
  const module = { exports: {} };
  new Function("module", "exports", "require", "uni", code)(
    module,
    module.exports,
    (name) => {
      assert.ok(dependencies[name], name);
      return dependencies[name];
    },
    { showToast: (toast) => calls.push(["toast", toast.title]) }
  );
  return { checkout: module.exports.useCheckout(), calls, quote, product };
};

test("upgrade asks for a server quote before confirmation and submits its ID", async () => {
  const f = fixture();
  await f.checkout.select(f.product);
  assert.equal(f.checkout.selected.value.quote.amountFen, 1500);
  assert.deepEqual(f.calls, [["quote", "standard"]]);
  await f.checkout.confirm();
  const input = f.calls.find(([kind]) => kind === "order")[1];
  assert.equal(input.quoteId, "quote-1");
  assert.equal(input.productId, "standard");
  assert.equal(f.calls.filter(([kind]) => kind === "wx").length, 1);
});

test("stale quote refreshes amount and requires another explicit confirmation", async () => {
  let attempt = 0;
  let payments = 0;
  const f = fixture({
    quotePlan: async () => ({ id: `q${++attempt}`, amountFen: attempt === 1 ? 1500 : 1400, action: "upgrade" }),
    createPlanOrder: async () => {
      throw Object.assign(new Error("expired"), { statusCode: 409 });
    },
    createVirtualPayment: async () => {
      payments++;
    },
  });
  await f.checkout.select(f.product);
  await f.checkout.confirm();
  assert.equal(f.checkout.selected.value.quote.amountFen, 1400);
  assert.match(f.checkout.error.value, /再次确认/);
  assert.equal(payments, 0);
});

test("zero difference upgrade completes without invoking WeChat payment", async () => {
  const f = fixture({ createPlanOrder: async () => ({ id: "free-upgrade", status: 2 }) });
  await f.checkout.select(f.product);
  await f.checkout.confirm();
  assert.equal(f.checkout.selected.value, null);
  assert.ok(!f.calls.some(([kind]) => kind === "wx" || kind === "payment"));
  assert.ok(f.calls.some(([kind]) => kind === "refresh"));
});
