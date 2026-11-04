import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import {
  parseCreateTextResource,
  parseReadTextResource,
  parseResourceRef,
  parseOperation,
  parseReply,
} from "../src/index.ts";
const rootId = "e75ade07-e404-4412-999b-95c9b1e417b9",
  resourceId = "e75ade07-e404-4412-999b-95c9b1e417ba";
test("resource boundaries preserve Unicode/BOM/CRLF, literal IDs, NUL and exact byte counts", () => {
  const text = "\ufeffid,name\r\n0000123,Rīga\r\n\u0000";
  const input = { rootId, name: "preces.csv", mediaType: "text/csv", text };
  assert.deepEqual(parseCreateTextResource(input), input);
  const resource = {
    rootId,
    resourceId,
    digest: createHash("sha256").update(text).digest("hex"),
    name: input.name,
    mediaType: input.mediaType,
    byteLength: Buffer.byteLength(text),
  };
  assert.deepEqual(parseReadTextResource({ resource, text }), { resource, text });
  assert.throws(() => parseReadTextResource({ resource: { ...resource, byteLength: 1 }, text }));
  assert.deepEqual(parseResourceRef({ rootId, resourceId, digest: resource.digest }), {
    rootId,
    resourceId,
    digest: resource.digest,
  });
});
test("untrusted resource payloads reject native paths, forged scope, malformed Unicode and excessive bytes", () => {
  const base = { rootId, name: "input.csv", mediaType: "text/csv", text: "id\r\n001\r\n" };
  for (const name of ["../escape", "..", ".", "a/b", "a\\b", "line\nname", "\ud800", "\udc00"])
    assert.throws(() => parseCreateTextResource({ ...base, name }));
  for (const text of ["x".repeat(8193), "é".repeat(4097), "\ud800", "\udc00"])
    assert.throws(() => parseCreateTextResource({ ...base, text }));
  for (const extra of ["workspaceId", "routineId", "path", "grant", "outputDirectory"])
    assert.throws(() => parseCreateTextResource({ ...base, [extra]: "forged" }));
  assert.throws(() => parseCreateTextResource({ ...base, mediaType: "application/octet-stream" }));
});
test("artifact effects/resource outcomes are explicit and never imply durable job or external delivery", () => {
  assert.equal(
    parseOperation({
      id: "resources.text.create",
      version: "1.0.0",
      title: "Create text",
      description: "Immutable managed text",
      effect: "createArtifact",
      requiredCapabilities: ["resources:write"],
      automation: { delegable: true },
      inputSchema: {},
      outputSchema: {},
    }).effect,
    "createArtifact",
  );
  for (const code of ["resource_limit", "unavailable"])
    assert.equal(
      parseReply({
        kind: "error",
        requestId: resourceId,
        code,
        message: "Unavailable",
        recovery: "stop",
      }).kind,
      "error",
    );
  assert.throws(() => parseReply({ kind: "accepted", requestId: resourceId, jobId: rootId }));
});
