import assert from "node:assert/strict";
import { test } from "node:test";
import { assertBoundedJson, canonicalJson, parseInvocation, parseReply } from "../src/index.ts";
const request = {
  requestId: "e75ade07-e404-4412-999b-95c9b1e417b9",
  operationId: "fixture.echo",
  operationVersion: "1.0.0",
  input: { message: "00123" },
};
test("strict boundary preserves opaque values and rejects forged context and unsupported replies", () => {
  assert.deepEqual(parseInvocation(request), request);
  for (const extra of ["actor", "workspaceId", "grant", "configId"])
    assert.throws(() => parseInvocation({ ...request, [extra]: "forged" }));
  assert.throws(() =>
    parseReply({ kind: "accepted", requestId: request.requestId, jobId: request.requestId }),
  );
  assert.throws(() => parseInvocation({ ...request, operationVersion: "latest" }));
});
test("canonical object order preserves array order, null, zero, false and Unicode", () => {
  assert.equal(
    canonicalJson({ b: [0, false, null, "Rīga"], a: "001" }),
    canonicalJson({ a: "001", b: [0, false, null, "Rīga"] }),
  );
  assert.notEqual(canonicalJson([1, 2]), canonicalJson([2, 1]));
});
test("rejects cycles, deep/oversized input, accessors and non-JSON members before recursive parsing", () => {
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  let deep: unknown = null;
  for (let i = 0; i < 20; i++) deep = [deep];
  const getter = Object.defineProperty({}, "secret", {
    enumerable: true,
    get() {
      throw new Error("getter was executed");
    },
  });
  for (const value of [
    cycle,
    deep,
    { a: "x".repeat(65_536) },
    getter,
    [NaN],
    [undefined],
    new Date(),
    [1n],
    Array(2),
    JSON.parse('{"__proto__":{}}'),
  ])
    assert.throws(() => assertBoundedJson(value));
  assert.throws(() => assertBoundedJson(Array(5000).fill(0)));
});

test("synthetic fixtures are usable without a host, private checkout or identity override", async () => {
  const { readFile } = await import("node:fs/promises");
  const fixture = async (name: string) =>
    JSON.parse(await readFile(new URL(`../fixtures/${name}.json`, import.meta.url), "utf8"));
  assert.deepEqual(parseInvocation(await fixture("invocation-valid")), request);
  const forged = await fixture("invocation-forged-identity");
  assert.throws(() => parseInvocation(forged));
});
