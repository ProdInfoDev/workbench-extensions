import { z } from "zod";
import { assertBoundedJson } from "./json.ts";

/** Small text proof; binary/chunked/streaming resources need another contract revision. */
export const RESOURCE_LIMITS = Object.freeze({ textBytes: 8192 });
export const RESOURCE_OPERATIONS = Object.freeze({
  readText: "resources.text.read",
  createText: "resources.text.create",
});
export const ResourceNameSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[^/\\\u0000-\u001f\u007f]+$/u)
  .refine((value) => value !== "." && value !== "..", "A display name cannot be a path component")
  .refine(
    (value) =>
      new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
        new TextEncoder().encode(value),
      ) === value,
    "Display names must round-trip as UTF-8",
  );
export const ResourceRootSchema = z.strictObject({
  rootId: z.uuid(),
  name: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z][a-z0-9_.-]*$/),
  purpose: z.enum(["input", "output"]),
});
export const ResourceRefSchema = z.strictObject({
  rootId: z.uuid(),
  resourceId: z.uuid(),
  digest: z.string().regex(/^[a-f0-9]{64}$/),
});
const mediaType = z.enum(["text/plain", "text/csv", "application/json"]);
const text = z
  .string()
  .max(RESOURCE_LIMITS.textBytes)
  .refine((value) => {
    const bytes = new TextEncoder().encode(value);
    // Keep BOM/CRLF exactly; unpaired UTF-16 surrogates must not silently become replacement bytes.
    return (
      bytes.length <= RESOURCE_LIMITS.textBytes &&
      new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes) === value
    );
  }, "Text must round-trip as UTF-8 within 8192 bytes")
  .describe(
    "Exact UTF-8 text up to 8192 bytes; no normalization. Display names are not filesystem paths.",
  );
export const TextResourceSchema = ResourceRefSchema.extend({
  name: ResourceNameSchema,
  mediaType,
  byteLength: z.number().int().min(0).max(RESOURCE_LIMITS.textBytes),
});
export const CreateTextResourceSchema = z.strictObject({
  rootId: z.uuid(),
  name: ResourceNameSchema,
  mediaType,
  text,
});
export const ReadTextResourceSchema = z.strictObject({ resource: TextResourceSchema, text });
export type ResourceRoot = z.infer<typeof ResourceRootSchema>;
export type ResourceRef = z.infer<typeof ResourceRefSchema>;
export type TextResource = z.infer<typeof TextResourceSchema>;
export type CreateTextResource = z.infer<typeof CreateTextResourceSchema>;
export type ReadTextResource = z.infer<typeof ReadTextResourceSchema>;
export function parseResourceRef(value: unknown): ResourceRef {
  assertBoundedJson(value);
  return ResourceRefSchema.parse(value);
}
export function parseCreateTextResource(value: unknown): CreateTextResource {
  assertBoundedJson(value);
  return CreateTextResourceSchema.parse(value);
}
export function parseReadTextResource(value: unknown): ReadTextResource {
  assertBoundedJson(value);
  const parsed = ReadTextResourceSchema.parse(value);
  if (new TextEncoder().encode(parsed.text).length !== parsed.resource.byteLength)
    throw new Error("Resource byte count does not match text");
  return parsed;
}
