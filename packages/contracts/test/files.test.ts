import assert from "node:assert/strict";
import { test } from "node:test";
import { fileTextPage, parseFileCall, FileAckSchema } from "../src/files.ts";
test("managed text file pages preserve Unicode/BOM/CRLF; facade rejects paths, extra grants and split surrogates", () => {
  const text = "\ufeff" + "a".repeat(5998) + "😀\r\n" + "z".repeat(9000);
  let after = 0,
    output = "";
  for (;;) {
    const page = fileTextPage(text, after);
    output += page.text;
    if (page.next === null) break;
    after = page.next;
  }
  assert.equal(output, text);
  assert.throws(() => fileTextPage(text, 6000));
  assert.deepEqual(parseFileCall({ kind: "read", input: { after: 0 } }), {
    kind: "read",
    input: { after: 0 },
  });
  for (const name of ["../file.csv", "C:\\file.csv", "."])
    assert.throws(() =>
      parseFileCall({
        kind: "write",
        input: { name, mediaType: "text/csv", index: 0, text: "a", final: true },
      }),
    );
  assert.throws(() => parseFileCall({ kind: "read", input: { after: 0, path: "/secret" } }));
  assert.throws(() =>
    parseFileCall({
      kind: "write",
      input: { name: "a.csv", mediaType: "text/csv", index: 0, text: "\ud800", final: true },
    }),
  );
  assert.deepEqual(FileAckSchema.parse({ nextIndex: 1, bytes: 0, complete: true }), {
    nextIndex: 1,
    bytes: 0,
    complete: true,
  });
});
