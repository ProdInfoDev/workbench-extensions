import { z } from "zod";
import { assertBoundedJson } from "./json.ts";
import { ResourceRefSchema } from "./resources.ts";

export const CONFIGURATION_LIMITS = Object.freeze({ contractBytes: 8192, fields: 32 });
export const CONFIGURATION_VALIDATOR_VERSION = "flat-v1";
const utf8 = (value: string) =>
  !value.includes("\u0000") &&
  new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
    new TextEncoder().encode(value),
  ) === value;
export const ConfigurationKeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z][a-zA-Z0-9_]*$/)
  .refine((key) => !["constructor", "prototype"].includes(key), "Reserved field key");
const base = {
  key: ConfigurationKeySchema,
  title: z.string().min(1).max(100).refine(utf8, "Title must be non-NUL UTF-8"),
  required: z.boolean(),
};
const stringField = z
  .strictObject({
    ...base,
    kind: z.literal("string"),
    minLength: z.number().int().min(0).max(4096),
    maxLength: z.number().int().min(0).max(4096),
  })
  .refine((field) => field.minLength <= field.maxLength, "Invalid string bounds");
const numericBound = z.number().min(-1e15).max(1e15);
const numberField = z
  .strictObject({
    ...base,
    kind: z.literal("number"),
    integer: z.boolean(),
    min: numericBound,
    max: numericBound,
  })
  .refine((field) => field.min <= field.max, "Invalid numeric bounds");
const enumField = z
  .strictObject({
    ...base,
    kind: z.literal("enum"),
    values: z
      .array(z.string().max(128).refine(utf8, "Choice must be non-NUL UTF-8"))
      .min(1)
      .max(32),
  })
  .refine((field) => new Set(field.values).size === field.values.length, "Duplicate choices");
export const ConfigurationFieldSchema = z.discriminatedUnion("kind", [
  stringField,
  numberField,
  enumField,
  z.strictObject({ ...base, kind: z.literal("boolean") }),
  z.strictObject({ ...base, kind: z.literal("resourceRef") }),
]);
/** Deliberately small, non-executable declaration. No regex, callbacks, refs, defaults or coercion. */
export const ConfigurationContractSchema = z
  .strictObject({
    formatVersion: z.literal(1),
    fields: z.array(ConfigurationFieldSchema).max(CONFIGURATION_LIMITS.fields),
  })
  .refine(
    (contract) =>
      new Set(contract.fields.map((field) => field.key)).size === contract.fields.length,
    "Duplicate field keys",
  )
  .refine(
    (contract) =>
      new TextEncoder().encode(JSON.stringify(contract)).byteLength <=
      CONFIGURATION_LIMITS.contractBytes,
    "Configuration contract exceeds 8192 bytes",
  );
export const ConfigurationIssueSchema = z.strictObject({
  field: ConfigurationKeySchema.nullable(),
  code: z.enum(["object_required", "unknown_field", "required", "type", "range", "choice"]),
});
export const ConfigurationResultSchema = z
  .strictObject({
    valid: z.boolean(),
    issues: z.array(ConfigurationIssueSchema).max(CONFIGURATION_LIMITS.fields + 1),
  })
  .refine(
    (result) => result.valid === (result.issues.length === 0),
    "Inconsistent validation result",
  );
export type ConfigurationContract = z.infer<typeof ConfigurationContractSchema>;
export type ConfigurationResult = z.infer<typeof ConfigurationResultSchema>;
export function parseConfigurationContract(raw: unknown): ConfigurationContract {
  assertBoundedJson(raw);
  return ConfigurationContractSchema.parse(raw);
}
/** Pure structure/type check only. No I/O, mutation, resource permission, activation or execution. */
export function checkConfiguration(rawContract: unknown, value: unknown): ConfigurationResult {
  const contract = parseConfigurationContract(rawContract);
  assertBoundedJson(value);
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return { valid: false, issues: [{ field: null, code: "object_required" }] };
  const issues: ConfigurationResult["issues"] = [];
  const known = new Set(contract.fields.map((field) => field.key));
  if (Object.keys(value).some((key) => !known.has(key)))
    issues.push({ field: null, code: "unknown_field" });
  for (const field of contract.fields) {
    if (!Object.hasOwn(value, field.key)) {
      if (field.required) issues.push({ field: field.key, code: "required" });
      continue;
    }
    const item = value[field.key];
    let code: ConfigurationResult["issues"][number]["code"] | undefined;
    switch (field.kind) {
      case "string":
        if (typeof item !== "string" || !utf8(item)) code = "type";
        else if (item.length < field.minLength || item.length > field.maxLength) code = "range";
        break;
      case "number":
        if (typeof item !== "number" || (field.integer && !Number.isSafeInteger(item)))
          code = "type";
        else if (item < field.min || item > field.max) code = "range";
        break;
      case "enum":
        if (typeof item !== "string") code = "type";
        else if (!field.values.includes(item)) code = "choice";
        break;
      case "boolean":
        if (typeof item !== "boolean") code = "type";
        break;
      case "resourceRef":
        if (!ResourceRefSchema.safeParse(item).success) code = "type";
        break;
    }
    if (code) issues.push({ field: field.key, code });
  }
  return ConfigurationResultSchema.parse({ valid: issues.length === 0, issues });
}
