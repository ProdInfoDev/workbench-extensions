import assert from "node:assert/strict";
import { test } from "node:test";
import { parseOperation, parseReply } from "../src/index.ts";
const operation = {
  id: "fixture.submit",
  version: "1.0.0",
  title: "Synthetic admission",
  description: "Persist a synthetic run independently of a caller",
  requiredCapabilities: ["fixture:submit"],
  automation: { delegable: true },
  inputSchema: { type: "object" },
  outputSchema: { type: "object" },
};
test("submission and run control have explicit metadata effects without implying read or configure authority", () => {
  for (const effect of ["submit", "controlRun"]) {
    const parsed = parseOperation({ ...operation, effect });
    assert.equal(parsed.effect, effect);
    assert.deepEqual(parsed.requiredCapabilities, ["fixture:submit"]);
  }
  assert.throws(() => parseOperation({ ...operation, effect: "arbitraryExecute" }));
});
test("admission can be result data while accepted-job variants remain unsupported", () => {
  const requestId = "ac394d68-d638-41b8-a925-133104c2ca56",
    receiptId = "26946e2d-719b-465f-a1d1-b8898658cb04",
    runId = "fdc610b8-cf92-41a3-92b7-d8c345f78f56";
  const reply = { kind: "result", requestId, receiptId, value: { runId, state: "queued" } };
  assert.deepEqual(parseReply(reply), reply);
  assert.throws(() => parseReply({ kind: "accepted", requestId, runId }));
});
