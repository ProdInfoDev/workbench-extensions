export const LIMITS = Object.freeze({ jsonBytes: 65_536, depth: 16, nodes: 4096 });
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** Run before recursive schema parsing, including for callers that do not use HTTP. */
export function assertBoundedJson(value: unknown): asserts value is Json {
  const pending: { value: unknown; depth: number }[] = [{ value, depth: 0 }];
  const seen = new Set<object>();
  let nodes = 0;
  while (pending.length) {
    const current = pending.pop()!;
    if (++nodes > LIMITS.nodes || current.depth > LIMITS.depth)
      throw new Error("JSON exceeds structural limits");
    const item = current.value;
    if (item === null || typeof item === "string" || typeof item === "boolean") continue;
    if (typeof item === "number" && Number.isFinite(item) && !Object.is(item, -0)) continue;
    if (typeof item !== "object" || seen.has(item)) throw new Error("Expected a JSON tree");
    seen.add(item);
    if (!Array.isArray(item) && ![Object.prototype, null].includes(Object.getPrototypeOf(item)))
      throw new Error("Expected a plain JSON object");
    const entries = Object.entries(Object.getOwnPropertyDescriptors(item));
    if (entries.length + nodes > LIMITS.nodes + 1) throw new Error("JSON exceeds node limit");
    if (Array.isArray(item) && entries.length !== item.length + 1)
      throw new Error("Sparse arrays are unsupported");
    for (const [key, descriptor] of entries) {
      if (Array.isArray(item) && key === "length") continue;
      if (
        !("value" in descriptor) ||
        !descriptor.enumerable ||
        ["__proto__", "constructor", "prototype"].includes(key)
      )
        throw new Error("Unsupported JSON member");
      if (Array.isArray(item) && !/^(0|[1-9]\d*)$/.test(key))
        throw new Error("Unsupported array member");
      pending.push({ value: descriptor.value, depth: current.depth + 1 });
    }
    if (Object.getOwnPropertySymbols(item).length) throw new Error("Unsupported JSON member");
  }
  if (new TextEncoder().encode(JSON.stringify(value)).byteLength > LIMITS.jsonBytes)
    throw new Error("JSON exceeds byte limit");
}

/** Deterministic JSON for digests; object key order is not a different request. */
export function canonicalJson(value: unknown): string {
  assertBoundedJson(value);
  function sort(item: Json): Json {
    if (Array.isArray(item)) return item.map(sort);
    if (item !== null && typeof item === "object")
      return Object.fromEntries(
        Object.keys(item)
          .sort()
          .map((key) => [key, sort(item[key]!)]),
      );
    return item;
  }
  return JSON.stringify(sort(value));
}
