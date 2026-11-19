import assert from "node:assert/strict";
import test from "node:test";
import {
  BUSINESS_AREAS,
  BUSINESS_AREA_LABELS,
  CONTRACT_VERSION,
  checkDependencyLayers,
  checkModuleContract,
  checkPackManifest,
  checkRegistryDescriptor,
  checkTemplatePackageManifest,
  parseReply,
  type RegistryDescriptor,
} from "../src/index.ts";

const DIGEST = `sha256:${"a".repeat(64)}`;

const sampleTemplate = {
  id: "lv.monthly_vat",
  title: "Monthly VAT return",
  description: "Compute and generate Latvia monthly VAT declaration",
  businessArea: "tax_and_statutory" as const,
  triggers: ["manual", "schedule"] as const,
  hasExternalEffects: false,
  suggestedLimits: {
    maxSteps: 5,
    maxTotalAmount: { pointer: "/vatDue", max: "50000.00" },
    allowedTriggers: ["manual", "schedule"],
  },
  parameters: [
    { name: "period", label: "Period", type: "month" as const, required: true },
    {
      name: "entries",
      label: "Adjustments",
      type: "list" as const,
      required: false,
      items: [{ name: "account", label: "Account", type: "string" as const, required: true }],
    },
  ],
  steps: [
    {
      operationId: "gl.vat.compute",
      ruleRef: "lv.vat.standard",
      input: { period: { $param: "period" } },
    },
    {
      operationId: "gl.vat.adjust",
      forEach: "entries",
      input: { period: { $param: "period" }, account: { $item: "account" } },
    },
  ],
};

test("reply schema accepts retry error recovery alongside correctInput and stop", () => {
  const reply = parseReply({
    kind: "error",
    requestId: "11111111-1111-4111-8111-111111111111",
    code: "unavailable",
    message: "Database transaction rolled back; retry the same request ID",
    recovery: "retry",
  });
  assert.equal(reply.kind, "error");
  if (reply.kind === "error") assert.equal(reply.recovery, "retry");
});

test("business areas match fixed 10-entry catalog", () => {
  assert.equal(BUSINESS_AREAS.length, 10);
  for (const area of BUSINESS_AREAS) assert.ok(BUSINESS_AREA_LABELS[area].length > 0);
});

test("pack manifest validates planTemplates and rejects invalid placeholders", () => {
  const ok = checkPackManifest({
    id: "lv",
    version: "0.3.0",
    license: "MIT",
    kind: "pack",
    targetModule: "gl",
    targetVersionRange: "^0.1.0",
    country: "LV",
    planTemplates: [sampleTemplate],
  });
  assert.equal(ok.valid, true, ok.issues.map((i) => i.message).join("; "));

  const bad = checkPackManifest({
    id: "lv",
    version: "0.3.0",
    planTemplates: [
      {
        ...sampleTemplate,
        id: "other.bad",
        steps: [{ operationId: "gl.vat.compute", input: { period: { $item: "missing" } } }],
      },
    ],
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.issues.some((i) => i.message.includes("start with lv.")));
  assert.ok(bad.issues.some((i) => i.message.includes("outside a forEach")));
});

test("template package manifest & registry descriptor kind=template validate cross-module dependencies", () => {
  const pkg = checkTemplatePackageManifest({
    id: "shopify_payout_pack",
    version: "1.0.0",
    license: "MIT",
    businessArea: "e_commerce",
    requires: [
      { moduleId: "shop", versionRange: "^1.0.0" },
      { moduleId: "gl", versionRange: "^1.0.0" },
    ],
    targetPack: { packageId: "lv", versionRange: "^0.3.0" },
    planTemplates: [
      {
        id: "shopify_payout_pack.reconcile",
        title: "Shopify payout reconciliation",
        parameters: [{ name: "payoutId", label: "Payout", type: "string", required: true }],
        steps: [{ operationId: "gl.entries.post", input: { ref: { $param: "payoutId" } } }],
      },
    ],
  });
  assert.equal(pkg.valid, true, pkg.issues.map((i) => i.message).join("; "));

  const tplDescriptor: RegistryDescriptor = {
    kind: "template",
    moduleId: "shopify_payout_pack",
    version: "1.0.0",
    packageDigest: DIGEST,
    channel: "stable",
    state: "listed",
    contractVersion: CONTRACT_VERSION,
    requiredCoreRange: "^0.1.0",
    businessArea: "e_commerce",
    targetPack: { packageId: "lv", versionRange: "^0.3.0" },
    dependencies: [
      { moduleId: "shop", versionRange: "^1.0.0" },
      { moduleId: "gl", versionRange: "^1.0.0" },
    ],
    migrationSteps: [],
  };
  assert.equal(checkRegistryDescriptor(tplDescriptor).valid, true);

  const missingDeps = checkDependencyLayers(tplDescriptor, []);
  assert.equal(missingDeps.valid, false);
  assert.ok(missingDeps.issues.some((i) => i.path === "dependencies.0"));
  assert.ok(missingDeps.issues.some((i) => i.path === "targetPack"));

  const withDeps = checkDependencyLayers(tplDescriptor, [
    {
      kind: "module",
      moduleId: "shop",
      version: "1.0.0",
      packageDigest: DIGEST,
      channel: "stable",
      state: "listed",
      contractVersion: CONTRACT_VERSION,
      requiredCoreRange: "^0.1.0",
      layer: "bridge",
      dependencies: [{ moduleId: "gl", versionRange: "^1.0.0" }],
      migrationSteps: [],
    },
    {
      kind: "module",
      moduleId: "gl",
      version: "1.0.0",
      packageDigest: DIGEST,
      channel: "stable",
      state: "listed",
      contractVersion: CONTRACT_VERSION,
      requiredCoreRange: "^0.1.0",
      layer: "business",
      dependencies: [],
      migrationSteps: [],
    },
    {
      kind: "pack",
      moduleId: "lv",
      version: "0.3.0",
      packageDigest: DIGEST,
      channel: "stable",
      state: "listed",
      contractVersion: CONTRACT_VERSION,
      requiredCoreRange: "^0.1.0",
      dependencies: [],
      migrationSteps: [],
      targetModule: "gl",
      targetVersionRange: "^1.0.0",
    },
  ]);
  assert.equal(withDeps.valid, true, withDeps.issues.map((i) => i.message).join("; "));
});

test("module contract enforces planTemplates visibility and external-effect declaration", () => {
  const base = {
    id: "ar",
    version: "1.0.0",
    license: "MIT",
    source: "available" as const,
    access: {
      commands: {
        "ar.internal": {
          visibility: "private" as const,
          effect: "configure" as const,
          call: ["member"],
        },
        "ar.send": { visibility: "public" as const, effect: "submit" as const, call: ["member"] },
      },
    },
  };
  const badPrivate = checkModuleContract({
    ...base,
    planTemplates: [
      {
        id: "ar.proc",
        title: "Internal proc",
        steps: [{ operationId: "ar.internal", input: {} }],
      },
    ],
  });
  assert.equal(badPrivate.valid, false);
  assert.ok(badPrivate.issues.some((i) => i.code === "template" && i.message.includes("private")));

  const badExternal = checkModuleContract({
    ...base,
    planTemplates: [
      {
        id: "ar.send_all",
        title: "Send",
        hasExternalEffects: false,
        steps: [{ operationId: "ar.send", input: {} }],
      },
    ],
  });
  assert.equal(badExternal.valid, false);
  assert.ok(badExternal.issues.some((i) => i.path === "planTemplates.0.hasExternalEffects"));

  const ok = checkModuleContract({
    ...base,
    planTemplates: [
      {
        id: "ar.send_all",
        title: "Send",
        hasExternalEffects: true,
        steps: [{ operationId: "ar.send", input: {} }],
      },
    ],
  });
  assert.equal(ok.valid, true, ok.issues.map((i) => i.message).join("; "));
});
