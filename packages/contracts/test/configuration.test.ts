import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkConfiguration,
  parseConfigurationContract,
  ConfigurationResultSchema,
} from "../src/index.ts";

const contract = {
  formatVersion: 1,
  fields: [
    { key: "label", title: "Label", required: true, kind: "string", minLength: 0, maxLength: 10 },
    {
      key: "count",
      title: "Count",
      required: true,
      kind: "number",
      integer: true,
      min: 0,
      max: 20,
    },
    { key: "enabled", title: "Enabled", required: true, kind: "boolean" },
    { key: "mode", title: "Mode", required: true, kind: "enum", values: ["review", "test"] },
    { key: "notes", title: "Notes", required: false, kind: "string", minLength: 0, maxLength: 10 },
    { key: "input", title: "Input", required: false, kind: "resourceRef" },
  ],
};
test("configuration checks preserve explicit empty/zero/false, optional absence and opaque refs", () => {
  const value = {
    label: "",
    count: 0,
    enabled: false,
    mode: "review",
    input: {
      rootId: "590a59cd-1e3b-4b86-a078-72d8bcb235e9",
      resourceId: "09ab5911-c282-42fa-a321-3fd82be3cf9c",
      digest: "a".repeat(64),
    },
  };
  const original = structuredClone(value);
  assert.deepEqual(checkConfiguration(contract, value), { valid: true, issues: [] });
  assert.deepEqual(value, original);
  assert.equal(
    checkConfiguration(contract, { label: "0000123", count: 20, enabled: true, mode: "test" })
      .valid,
    true,
  );
  assert.equal(checkConfiguration({ formatVersion: 1, fields: [] }, {}).valid, true);
});
test("invalid values report bounded field/code issues without coercion or echoing unknown keys/values", () => {
  assert.deepEqual(
    checkConfiguration(contract, {
      label: "private-too-long",
      count: "0",
      enabled: null,
      mode: "invalid",
      unknownSecret: "secret",
    }),
    {
      valid: false,
      issues: [
        { field: null, code: "unknown_field" },
        { field: "label", code: "range" },
        { field: "count", code: "type" },
        { field: "enabled", code: "type" },
        { field: "mode", code: "choice" },
      ],
    },
  );
  for (const value of [null, [], false, 0, "text"])
    assert.deepEqual(checkConfiguration(contract, value), {
      valid: false,
      issues: [{ field: null, code: "object_required" }],
    });
  assert.equal(checkConfiguration(contract, {}).issues.length, 4);
  for (const bad of [0.5, 21, -1])
    assert.equal(
      checkConfiguration(contract, { label: "ok", count: bad, enabled: false, mode: "review" })
        .valid,
      false,
    );
  for (const input of [{ rootId: "../escape" }, null])
    assert.equal(
      checkConfiguration(contract, { label: "ok", count: 0, enabled: false, mode: "review", input })
        .valid,
      false,
    );
  for (const label of ["\ud800", "x\u0000"])
    assert.equal(
      checkConfiguration(contract, { label, count: 0, enabled: false, mode: "review" }).valid,
      false,
    );
  assert.throws(() =>
    ConfigurationResultSchema.parse({ valid: true, issues: [{ field: null, code: "type" }] }),
  );
});
test("declarations reject executable/unknown members, unsupported shapes, duplicates and inconsistent bounds", () => {
  const field = contract.fields[0]!;
  for (const bad of [
    { ...contract, callback: "run" },
    { ...contract, formatVersion: 2 },
    { formatVersion: 1, fields: [field, field] },
    { formatVersion: 1, fields: [{ ...field, key: "constructor" }] },
    { formatVersion: 1, fields: [{ ...field, key: "__proto__" }] },
    { formatVersion: 1, fields: [{ ...field, minLength: 2, maxLength: 1 }] },
    { formatVersion: 1, fields: [{ ...field, pattern: ".*" }] },
    {
      formatVersion: 1,
      fields: [
        { key: "n", title: "N", required: true, kind: "number", integer: true, min: 5, max: 1 },
      ],
    },
    {
      formatVersion: 1,
      fields: [{ key: "n", title: "N", required: true, kind: "enum", values: ["x", "x"] }],
    },
    { formatVersion: 1, fields: [{ ...field, title: "\ud800" }] },
    {
      formatVersion: 1,
      fields: Array.from({ length: 33 }, (_, i) => ({ ...field, key: `f${i}` })),
    },
    {
      formatVersion: 1,
      fields: Array.from({ length: 32 }, (_, i) => ({
        key: `f${i}`,
        title: "F",
        required: true,
        kind: "enum",
        values: Array.from({ length: 16 }, (_, j) => String(j).padEnd(100, "x")),
      })),
    },
  ])
    assert.throws(() => parseConfigurationContract(bad));
});
test("hostile non-JSON values fail before a getter, cycle or deep tree reaches configuration parsing", () => {
  const getter = Object.defineProperty({}, "label", {
    enumerable: true,
    get() {
      throw new Error("getter executed");
    },
  });
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  let deep: unknown = null;
  for (let i = 0; i < 20; i++) deep = [deep];
  for (const value of [
    getter,
    cycle,
    deep,
    new Date(),
    { label: "x".repeat(65536) },
    JSON.parse('{"__proto__":{}}'),
  ])
    assert.throws(() => checkConfiguration(contract, value));
});
