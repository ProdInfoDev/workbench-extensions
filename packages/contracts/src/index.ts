import { z } from "zod";

export const CONTRACT_VERSION = "0.1.0-alpha.5";
import { assertBoundedJson } from "./json.ts";
export { LIMITS, assertBoundedJson, canonicalJson, type Json } from "./json.ts";

const id = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z][a-z0-9_.:-]*$/);
const version = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/)
  .max(40);
const json = z.json();
const schema = z.record(z.string(), json);
export const OperationSchema = z.strictObject({
  id,
  version,
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  effect: z.enum(["read", "configure", "createArtifact", "submit", "controlRun"]),
  requiredCapabilities: z.array(id).max(20),
  automation: z.strictObject({ delegable: z.boolean() }),
  inputSchema: schema,
  outputSchema: schema,
});
export const InvocationSchema = z.strictObject({
  requestId: z.uuid(),
  operationId: id,
  operationVersion: version,
  input: json,
});
export const ErrorCodeSchema = z.enum([
  "invalid_input",
  "not_found",
  "unsupported_version",
  "forbidden",
  "conflict",
  "internal_error",
  "resource_limit",
  "unavailable",
]);
export const ReplySchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("result"),
    requestId: z.uuid(),
    receiptId: z.uuid(),
    value: json,
  }),
  z.strictObject({
    kind: z.literal("error"),
    requestId: z.uuid(),
    receiptId: z.uuid().optional(),
    code: ErrorCodeSchema,
    message: z.string().min(1).max(300),
    recovery: z.enum(["correctInput", "stop"]),
  }),
]);
export type Operation = z.infer<typeof OperationSchema>;
export type Invocation = z.infer<typeof InvocationSchema>;
export type Reply = z.infer<typeof ReplySchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export function parseInvocation(value: unknown): Invocation {
  assertBoundedJson(value);
  return InvocationSchema.parse(value);
}
export function parseReply(value: unknown): Reply {
  assertBoundedJson(value);
  return ReplySchema.parse(value);
}
export function parseOperation(value: unknown): Operation {
  assertBoundedJson(value);
  return OperationSchema.parse(value);
}

export {
  RESOURCE_LIMITS,
  RESOURCE_OPERATIONS,
  ResourceNameSchema,
  ResourceRootSchema,
  ResourceRefSchema,
  TextResourceSchema,
  CreateTextResourceSchema,
  ReadTextResourceSchema,
  parseResourceRef,
  parseCreateTextResource,
  parseReadTextResource,
  type ResourceRoot,
  type ResourceRef,
  type TextResource,
  type CreateTextResource,
  type ReadTextResource,
} from "./resources.ts";

export {
  CONFIGURATION_LIMITS,
  CONFIGURATION_VALIDATOR_VERSION,
  ConfigurationKeySchema,
  ConfigurationFieldSchema,
  ConfigurationContractSchema,
  ConfigurationIssueSchema,
  ConfigurationResultSchema,
  parseConfigurationContract,
  checkConfiguration,
  type ConfigurationContract,
  type ConfigurationResult,
} from "./configuration.ts";

export {
  FILE_LIMITS,
  FileMediaSchema,
  FileChunkSchema,
  ManagedFileSchema,
  FileReadSchema,
  FilePageSchema,
  FileWriteSchema,
  FileAckSchema,
  FileCallSchema,
  parseFileCall,
  fileTextPage,
  type ManagedFile,
  type FileCall,
  type RoutineFiles,
} from "./files.ts";
