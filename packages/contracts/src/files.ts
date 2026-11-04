import { z } from "zod";
import { ResourceRefSchema, ResourceNameSchema } from "./resources.ts";
import { assertBoundedJson } from "./json.ts";
/** Experimental single-input/single-output text file facade. Hosts grant it per run. */
export const FILE_LIMITS = Object.freeze({ bytes: 1024 * 1024, chunkChars: 6000, calls: 512 });
export const FileMediaSchema = z.enum(["text/plain", "text/csv", "application/json"]);
export const FileChunkSchema = z
  .string()
  .max(FILE_LIMITS.chunkChars)
  .refine(
    (value) =>
      new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
        new TextEncoder().encode(value),
      ) === value,
    "File chunks must round-trip as UTF-8; do not split a surrogate pair",
  );
export const ManagedFileSchema = ResourceRefSchema.extend({
  name: ResourceNameSchema,
  mediaType: FileMediaSchema,
  byteLength: z.number().int().min(0).max(FILE_LIMITS.bytes),
});
export const FileReadSchema = z.strictObject({
  after: z.number().int().min(0).max(FILE_LIMITS.bytes),
});
export const FilePageSchema = z.strictObject({
  text: FileChunkSchema,
  next: z.number().int().positive().max(FILE_LIMITS.bytes).nullable(),
});
export const FileWriteSchema = z.strictObject({
  name: ResourceNameSchema,
  mediaType: FileMediaSchema,
  index: z
    .number()
    .int()
    .min(0)
    .max(FILE_LIMITS.calls - 1),
  text: FileChunkSchema,
  final: z.boolean(),
});
export const FileAckSchema = z.strictObject({
  nextIndex: z.number().int().min(1).max(FILE_LIMITS.calls),
  bytes: z.number().int().min(0).max(FILE_LIMITS.bytes),
  complete: z.boolean(),
});
export const FileCallSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("read"), input: FileReadSchema }),
  z.strictObject({ kind: z.literal("write"), input: FileWriteSchema }),
]);
export type ManagedFile = z.infer<typeof ManagedFileSchema>;
export type FileCall = z.infer<typeof FileCallSchema>;
export interface RoutineFiles {
  read(input: z.infer<typeof FileReadSchema>): Promise<z.infer<typeof FilePageSchema>>;
  write(input: z.infer<typeof FileWriteSchema>): Promise<z.infer<typeof FileAckSchema>>;
}
export function parseFileCall(value: unknown): FileCall {
  assertBoundedJson(value);
  return FileCallSchema.parse(value);
}
/** UTF-16 cursor; preserve BOM/CRLF and never cut an astral Unicode character in half. */
export function fileTextPage(text: string, after: number) {
  FileReadSchema.parse({ after });
  if (
    after > text.length ||
    (after > 0 &&
      after < text.length &&
      text.charCodeAt(after) >= 0xdc00 &&
      text.charCodeAt(after) <= 0xdfff)
  )
    throw Error("Invalid file cursor");
  let end = Math.min(text.length, after + FILE_LIMITS.chunkChars);
  if (end < text.length && text.charCodeAt(end - 1) >= 0xd800 && text.charCodeAt(end - 1) <= 0xdbff)
    end--;
  return FilePageSchema.parse({
    text: text.slice(after, end),
    next: end < text.length ? end : null,
  });
}
