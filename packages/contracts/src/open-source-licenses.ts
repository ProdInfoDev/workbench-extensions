/** SPDX identifiers accepted for direct Workbench package installation. */
export const ALLOWED_OPEN_SOURCE_SPDX_LICENSES = [
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "MPL-2.0",
  "EPL-2.0",
  "LGPL-2.1-only",
  "LGPL-2.1-or-later",
  "LGPL-3.0-only",
  "LGPL-3.0-or-later",
  "GPL-2.0-only",
  "GPL-2.0-or-later",
  "GPL-3.0-only",
  "GPL-3.0-or-later",
  "AGPL-3.0-only",
  "AGPL-3.0-or-later",
] as const;

const allowed = new Set<string>(ALLOWED_OPEN_SOURCE_SPDX_LICENSES);
const aliases: Readonly<Record<string, string>> = {
  "LGPL-2.1": "LGPL-2.1-only",
  "LGPL-3.0": "LGPL-3.0-only",
  "GPL-2.0": "GPL-2.0-only",
  "GPL-3.0": "GPL-3.0-only",
  "AGPL-3.0": "AGPL-3.0-only",
};

/**
 * Returns true for a single allowed SPDX identifier or a valid AND/OR expression whose every
 * identifier is allowed. SPDX `WITH` exceptions and unknown/custom identifiers are rejected.
 */
export function isAllowedOpenSourceSpdxLicense(value: string): boolean {
  if (typeof value !== "string" || value.length === 0 || value.length > 256) return false;
  const tokens: string[] = [];
  let offset = 0;
  while (offset < value.length) {
    const whitespace = /^\s+/.exec(value.slice(offset));
    if (whitespace) {
      offset += whitespace[0].length;
      continue;
    }
    const token = /^(?:[A-Za-z0-9][A-Za-z0-9.-]*|[()])/.exec(value.slice(offset));
    if (!token) return false;
    tokens.push(token[0]);
    offset += token[0].length;
  }
  if (tokens.length === 0) return false;

  let cursor = 0;
  const identifier = (): boolean => {
    const token = tokens[cursor];
    if (token === "(") {
      cursor += 1;
      if (!orExpression() || tokens[cursor] !== ")") return false;
      cursor += 1;
      return true;
    }
    if (!token || token === ")" || token === "AND" || token === "OR" || token === "WITH")
      return false;
    const normalized = aliases[token] ?? token;
    if (!allowed.has(normalized)) return false;
    cursor += 1;
    return true;
  };
  const andExpression = (): boolean => {
    if (!identifier()) return false;
    while (tokens[cursor] === "AND") {
      cursor += 1;
      if (!identifier()) return false;
    }
    return true;
  };
  const orExpression = (): boolean => {
    if (!andExpression()) return false;
    while (tokens[cursor] === "OR") {
      cursor += 1;
      if (!andExpression()) return false;
    }
    return true;
  };

  return orExpression() && cursor === tokens.length;
}
