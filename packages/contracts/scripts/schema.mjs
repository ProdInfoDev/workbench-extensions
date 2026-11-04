import { readFile, mkdir, writeFile } from "node:fs/promises";
import { z } from "zod";
import {
  ManagedFileSchema,
  FileCallSchema,
  FilePageSchema,
  FileAckSchema,
  OperationSchema,
  InvocationSchema,
  ReplySchema,
  ResourceRootSchema,
  ResourceRefSchema,
  TextResourceSchema,
  CreateTextResourceSchema,
  ReadTextResourceSchema,
  ConfigurationContractSchema,
  ConfigurationResultSchema,
} from "../dist/index.js";
const root = new URL("../schemas/", import.meta.url);
await mkdir(root, { recursive: true });
for (const [name, schema] of Object.entries({
  "managed-file": ManagedFileSchema,
  "file-call": FileCallSchema,
  "file-page": FilePageSchema,
  "file-ack": FileAckSchema,
  operation: OperationSchema,
  invocation: InvocationSchema,
  reply: ReplySchema,
  "resource-root": ResourceRootSchema,
  "resource-ref": ResourceRefSchema,
  "text-resource": TextResourceSchema,
  "create-text-resource": CreateTextResourceSchema,
  "read-text-resource": ReadTextResourceSchema,
  "configuration-contract": ConfigurationContractSchema,
  "configuration-result": ConfigurationResultSchema,
})) {
  const text = JSON.stringify(z.toJSONSchema(schema), null, 2) + "\n";
  const file = new URL(`${name}.schema.json`, root);
  if (process.argv.includes("--check")) {
    if ((await readFile(file, "utf8")) !== text) throw new Error(`Generated schema drift: ${name}`);
  } else await writeFile(file, text);
}
