import { z } from "zod";
import { assertBoundedJson } from "./json.ts";

/**
 * Executable module contract (see docs/module-contract.md). A module is a plugin: it declares its
 * public API, roles, access, routines, UI metadata and provenance as plain JSON. A host checks the
 * declaration before loading the module; this file is the single source of those checks.
 */

/** Host-defined roles. `owner` always may; `admin` holds no business permission by itself. */
export const SYSTEM_ROLES = ["owner", "admin", "member", "viewer"] as const;
/** The only system roles a module can name in a who-list (owner is implicit, admin has none). */
export const LISTABLE_SYSTEM_ROLES = ["member", "viewer"] as const;
export const VISIBILITIES = ["public", "private"] as const;
export const AI_LEVELS = ["auto", "confirm", "never"] as const;
/** The operation effects of the command boundary (`OperationSchema`). */
export const COMMAND_EFFECTS = [
  "read",
  "configure",
  "createArtifact",
  "submit",
  "controlRun",
] as const;
/**
 * Effects the AI may handle without asking: they stay inside the workspace and can be reviewed or
 * undone. `submit` (sends or files something outside) and `controlRun` always ask.
 */
export const AI_AUTO_EFFECTS: readonly (typeof COMMAND_EFFECTS)[number][] = [
  "read",
  "configure",
  "createArtifact",
];
/** Routes owned by the host shell; a module screen cannot take them. */
export const RESERVED_ROUTE_PREFIXES = [
  "/admin",
  "/api",
  "/extensions",
  "/login",
  "/review",
  "/settings",
  "/v1",
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];
export type Visibility = (typeof VISIBILITIES)[number];
export type AiLevel = (typeof AI_LEVELS)[number];

const moduleId = z.string().regex(/^[a-z][a-z0-9_]{0,39}$/);
const roleLocalId = z.string().regex(/^[a-z][a-z0-9_]{0,31}$/);
const text = (max: number) => z.string().trim().min(1).max(max);
const version = z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
const capability = z.string().regex(/^[a-z][a-z0-9_]*:[a-z0-9_.:-]{1,80}$/);
const permissionId = z.string().regex(/^[a-z][a-z0-9_]*:[a-z0-9_.:-]{1,80}$/);
const packageName = z
  .string()
  .regex(/^(?:@[a-z0-9][a-z0-9._-]{0,38}\/)?[a-z0-9][a-z0-9._-]{0,99}$/);
/** Command, table, view, event and routine ids: dotted lowercase words. */
const dotted = z.string().regex(/^[a-z][a-z0-9_]*(?:\.[a-z0-9_-]+)+$/);
const columnName = z.string().regex(/^[a-z][a-z0-9_]{0,62}$/);
const digest = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const semanticVersion = z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);

/** Coarse data category used for privacy review; classification is independent of storage type. */
export const COLUMN_CLASSIFICATIONS = ["personal", "confidential", "secret"] as const;
export type ColumnClassification = (typeof COLUMN_CLASSIFICATIONS)[number];
const columnSpec = z.strictObject({
  kind: z.enum(["text", "other"]),
  classification: z.enum(COLUMN_CLASSIFICATIONS).optional(),
});

const visibility = z.enum(VISIBILITIES).default("private");
const effect = z.enum(COMMAND_EFFECTS);
const ai = z.enum(AI_LEVELS);
/** `member`, `viewer`, or a module role as `<module>.<role>`; validated against the module. */
const who = z.array(z.string().min(1).max(80)).max(20);

/** A code-only package pinned into a module bundle; it grants no host access. */
export const LibraryReferenceSchema = z.strictObject({
  name: packageName,
  version,
  digest,
  license: text(64),
  source: z.enum(["available", "closed"]),
});
export type LibraryReference = z.infer<typeof LibraryReferenceSchema>;

const presetId = z.string().regex(/^[a-z][a-z0-9_-]{0,39}$/);
const systemRolePreset = z.strictObject({
  title: text(90),
  description: text(600).optional(),
  permissions: z.array(permissionId).max(100),
});
/** First named preset for each role is the module default. */
export const SystemRolePresetsSchema = z.strictObject({
  member: z.record(presetId, systemRolePreset).default({}),
  viewer: z.record(presetId, systemRolePreset).default({}),
});
export type SystemRolePresets = z.infer<typeof SystemRolePresetsSchema>;

const commandSpec = z.strictObject({
  visibility,
  effect,
  call: who,
  ai: ai.optional(),
});
const viewSpec = z.strictObject({ visibility, read: who });
const tableSpec = z.strictObject({
  read: who.default([]),
  /** Present = writable outside the module's own code; `[]` = owner only. Absent = not writable. */
  write: who.optional(),
  ai: ai.optional(),
  /** Declared columns for privacy review and later sandbox masking. */
  columns: z.record(columnName, columnSpec).optional(),
});
const notificationSpec = z.strictObject({
  title: text(90),
  description: text(600).optional(),
  severity: z.enum(["info", "warning", "critical"]),
  payloadSchema: z.record(z.string(), z.unknown()).optional(),
});
const eventSpec = z.strictObject({
  visibility,
  subscribe: who,
  /** Optional user-facing notification metadata for this typed module event. */
  notification: notificationSpec.optional(),
});

const routineSpec = z.strictObject({
  id: dotted,
  title: text(90).optional(),
  run: who,
  needs: z.array(z.string().min(1).max(120)).max(50),
});

const roleSpec = z.strictObject({ title: text(90), description: text(600) });

const accessSpec = z.strictObject({
  permissions: z
    .array(z.strictObject({ id: permissionId, title: text(90), description: text(600) }))
    .max(100)
    .default([]),
  roles: z.record(roleLocalId, roleSpec).default({}),
  commands: z.record(dotted, commandSpec).default({}),
  views: z.record(dotted, viewSpec).default({}),
  tables: z.record(dotted, tableSpec).default({}),
  events: z.record(dotted, eventSpec).default({}),
});

const cardSpec = z.strictObject({
  id: dotted,
  title: text(90),
  description: text(600).optional(),
  requiredCapabilities: z.array(capability).max(10).default([]),
});
const screenSpec = z.strictObject({
  id: dotted,
  route: z
    .string()
    .min(1)
    .max(240)
    .regex(/^\/[a-zA-Z0-9:_/-]*$/),
  title: text(90),
  description: text(600).optional(),
  navGroup: text(60).optional(),
  hidden: z.boolean().optional(),
  requiredCapabilities: z.array(capability).max(10).default([]),
});
const navLinkSpec = z.strictObject({
  id: dotted,
  route: z.string().regex(/^\/[a-z0-9/_-]*$/),
  title: text(90),
  navGroup: text(60).optional(),
  requiredCapabilities: z.array(capability).max(10).default([]),
});

/** Declarative UI contribution to the host shell. Components live in the module's UI bundle. */
export const ModuleUiMetadataSchema = z.strictObject({
  displayName: text(90).optional(),
  screens: z.array(screenSpec).max(50).default([]),
  navLinks: z.array(navLinkSpec).max(50).default([]),
  slots: z
    .strictObject({
      homeCards: z.array(cardSpec).max(20).default([]),
      settingsCards: z.array(cardSpec).max(20).default([]),
      reviewCards: z.array(cardSpec).max(20).default([]),
    })
    .default({ homeCards: [], settingsCards: [], reviewCards: [] }),
});

/** Where a fork came from. The original is never edited in place. */
export const ProvenanceSchema = z.strictObject({
  origin: z.strictObject({
    moduleId,
    version,
    digest,
    license: text(64),
    source: z.literal("available"),
  }),
  forkedAt: z.iso.datetime().optional(),
});

const versionRange = z.string().trim().min(1).max(120);
const registryDependency = z.strictObject({ moduleId, versionRange });
const registryPackageReference = z.strictObject({ packageId: moduleId, versionRange });
const registryState = z.enum(["listed", "unlisted", "yanked"]);
const moduleLayer = z.enum(["service", "business", "bridge"]);
const migrationStep = z.string().regex(/^\d{4}_[a-z][a-z0-9_-]*\.sql$/);

const registryDescriptorFields = {
  moduleId,
  version,
  packageDigest: digest,
  channel: z.enum(["stable", "beta"]),
  state: registryState,
  reason: text(600).optional(),
  replacementVersion: semanticVersion.optional(),
  contractVersion: semanticVersion,
  requiredCoreRange: versionRange,
};

/** Signed registry metadata for one immutable module, pack or library package version. */
export const RegistryDescriptorSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    ...registryDescriptorFields,
    kind: z.literal("module"),
    /** Core itself is implicit and is not an install-time dependency. */
    layer: moduleLayer,
    /** A business module may extend one base module, independently of service dependencies. */
    extends: registryDependency.optional(),
    dependencies: z.array(registryDependency).max(100),
    migrationSteps: z.array(migrationStep).max(500),
  }),
  z.strictObject({
    ...registryDescriptorFields,
    kind: z.literal("pack"),
    dependencies: z.array(registryDependency).max(0),
    migrationSteps: z.array(migrationStep).max(0),
    /** Pack-only target metadata. A base pack must target the same module. */
    targetModule: moduleId,
    targetVersionRange: versionRange,
    basePack: registryPackageReference.optional(),
  }),
  z.strictObject({
    ...registryDescriptorFields,
    kind: z.literal("library"),
    dependencies: z.array(registryDependency).max(0),
    migrationSteps: z.array(migrationStep).max(0),
  }),
]);
export type RegistryDescriptor = z.infer<typeof RegistryDescriptorSchema>;
export type RegistryPackageKind = RegistryDescriptor["kind"];
export type ModuleLayer = z.infer<typeof moduleLayer>;

/** The registry signs canonical JSON for `descriptor`; this key is separate from licence keys. */
export const SignedRegistryDescriptorSchema = z.strictObject({
  descriptor: RegistryDescriptorSchema,
  signature: z.strictObject({
    algorithm: z.literal("Ed25519"),
    keyId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/),
    value: z.string().regex(/^[A-Za-z0-9+/]{86}==$/),
  }),
});
export type SignedRegistryDescriptor = z.infer<typeof SignedRegistryDescriptorSchema>;

export const ModuleContractSchema = z.strictObject({
  id: moduleId,
  version,
  license: text(64),
  source: z.enum(["available", "closed"]),
  provenance: ProvenanceSchema.optional(),
  /** Service, business or integration bridge. Ordinary modules are business modules. */
  layer: moduleLayer.default("business"),
  /** Required base modules, optionally with a semantic version range (`module@^1.0.0`). */
  depends: z.array(z.string().trim().min(1).max(120)).max(100).default([]),
  /** One base business module and an explicit compatible version range, e.g. `core@^1.0.0`. */
  extends: z.string().trim().min(1).max(120).optional(),
  /** Code-only package dependencies, pinned by version and content digest. */
  libraries: z.array(LibraryReferenceSchema).max(50).default([]),
  /** Named permission presets; the first entry for each role is its module default. */
  systemRolePresets: SystemRolePresetsSchema.optional(),
  access: accessSpec.default({
    permissions: [],
    roles: {},
    commands: {},
    views: {},
    tables: {},
    events: {},
  }),
  routines: z.array(routineSpec).max(50).default([]),
  ui: ModuleUiMetadataSchema.optional(),
  docs: z.strictObject({ context: text(200) }).optional(),
});

export type ModuleContract = z.output<typeof ModuleContractSchema>;
export type ModuleUiMetadata = z.output<typeof ModuleUiMetadataSchema>;
export type ModuleNotificationMetadata = z.output<typeof notificationSpec>;

export interface ModuleContractIssue {
  /** Dotted path into the declaration. */
  readonly path: string;
  readonly code:
    | "schema"
    | "prefix"
    | "unknown_role"
    | "foreign_role"
    | "system_role"
    | "viewer_write"
    | "ai_level"
    | "private_ai"
    | "need"
    | "route"
    | "capability"
    | "duplicate"
    | "provenance"
    | "docs_path"
    | "dependency"
    | "layer"
    | "system_role_preset"
    | "unclassified_text_column";
  readonly message: string;
}

export interface RegistryDescriptorIssue {
  readonly path: string;
  readonly message: string;
}

export interface DependencyLayerResult {
  readonly valid: boolean;
  readonly issues: readonly RegistryDescriptorIssue[];
}

function isValidVersionRange(range: string): boolean {
  if (range === "*" || range === "latest") return true;
  const parts = range.split(/\s+/).filter(Boolean);
  return (
    parts.length > 0 &&
    parts.every((part) => /^(?:\^|~|>=|<=|>|<|=)?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(part))
  );
}

function parseModuleReference(raw: string): {
  moduleId: string;
  versionRange: string;
  hasRange: boolean;
  valid: boolean;
} {
  const at = raw.indexOf("@");
  const hasRange = at > 0;
  const id = hasRange ? raw.slice(0, at) : raw;
  const versionRange = hasRange ? raw.slice(at + 1) : "*";
  return {
    moduleId: id,
    versionRange,
    hasRange,
    valid: moduleId.safeParse(id).success && isValidVersionRange(versionRange),
  };
}

/** Checks the registry-owned release descriptor, including state and rollback invariants. */
export function checkRegistryDescriptor(raw: unknown): {
  valid: boolean;
  issues: readonly RegistryDescriptorIssue[];
  descriptor?: RegistryDescriptor;
} {
  assertBoundedJson(raw);
  const parsed = RegistryDescriptorSchema.safeParse(raw);
  if (!parsed.success)
    return {
      valid: false,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };

  const descriptor = parsed.data;
  const issues: RegistryDescriptorIssue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });
  if (!isValidVersionRange(descriptor.requiredCoreRange))
    add("requiredCoreRange", "Invalid semantic version range");
  if (descriptor.kind === "module") {
    if (descriptor.extends !== undefined) {
      if (descriptor.layer !== "business")
        add("extends", "Only a business module may extend a base module");
      if (descriptor.extends.moduleId === descriptor.moduleId)
        add("extends.moduleId", "A module cannot extend itself");
      if (!isValidVersionRange(descriptor.extends.versionRange))
        add("extends.versionRange", "Invalid semantic version range");
      if (
        descriptor.dependencies.some(
          (dependency) => dependency.moduleId === descriptor.extends?.moduleId,
        )
      )
        add("extends.moduleId", "The base module must not also appear in dependencies");
    }
  } else if (descriptor.kind === "pack") {
    if (!isValidVersionRange(descriptor.targetVersionRange))
      add("targetVersionRange", "Invalid semantic version range");
    if (descriptor.basePack?.packageId === descriptor.moduleId)
      add("basePack.packageId", "A pack cannot extend itself");
    if (descriptor.basePack && !isValidVersionRange(descriptor.basePack.versionRange))
      add("basePack.versionRange", "Invalid semantic version range");
  }
  const seenDependencies = new Set<string>();
  descriptor.dependencies.forEach((dependency, index) => {
    if (dependency.moduleId === descriptor.moduleId)
      add(`dependencies.${index}.moduleId`, "A module cannot depend on itself");
    if (seenDependencies.has(dependency.moduleId))
      add(`dependencies.${index}.moduleId`, "A module dependency is listed twice");
    seenDependencies.add(dependency.moduleId);
    if (!isValidVersionRange(dependency.versionRange))
      add(`dependencies.${index}.versionRange`, "Invalid semantic version range");
  });
  const seenMigrations = new Set<string>();
  descriptor.migrationSteps.forEach((step, index) => {
    if (seenMigrations.has(step))
      add(`migrationSteps.${index}`, "A migration step is listed twice");
    seenMigrations.add(step);
  });
  if (descriptor.state === "listed") {
    if (descriptor.reason !== undefined) add("reason", "A listed version has no state reason");
    if (descriptor.replacementVersion !== undefined)
      add("replacementVersion", "A listed version has no replacement version");
  } else {
    if (!descriptor.reason) add("reason", `${descriptor.state} versions require a reason`);
    if (descriptor.state === "unlisted" && descriptor.replacementVersion !== undefined)
      add("replacementVersion", "Only a yanked version may name a replacement");
    if (descriptor.state === "yanked" && descriptor.replacementVersion === undefined)
      add("replacementVersion", "A yanked version must name its replacement version");
    if (descriptor.replacementVersion === descriptor.version)
      add("replacementVersion", "A version cannot replace itself");
  }
  return issues.length ? { valid: false, issues } : { valid: true, issues: [], descriptor };
}

/**
 * Checks layer, target and cycle rules over one descriptor and the complete selected dependency
 * descriptor set. Supply at most one selected version for each module or pack id.
 */
export function checkDependencyLayers(
  descriptor: RegistryDescriptor,
  dependencyDescriptors: readonly RegistryDescriptor[],
): DependencyLayerResult {
  const issues: RegistryDescriptorIssue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });
  const descriptors = [descriptor, ...dependencyDescriptors];
  type ModuleDescriptor = Extract<RegistryDescriptor, { kind: "module" }>;
  type PackDescriptor = Extract<RegistryDescriptor, { kind: "pack" }>;
  const modules = new Map<string, ModuleDescriptor>();
  const packs = new Map<string, PackDescriptor>();

  for (const [index, candidate] of descriptors.entries()) {
    const checked = checkRegistryDescriptor(candidate);
    if (!checked.valid) {
      for (const issue of checked.issues)
        add(
          index === 0 ? issue.path : `dependencyDescriptors.${index - 1}.${issue.path}`,
          issue.message,
        );
    }
    if (candidate.kind === "module") {
      if (modules.has(candidate.moduleId))
        add(
          index === 0 ? "moduleId" : `dependencyDescriptors.${index - 1}.moduleId`,
          `More than one selected version of module ${candidate.moduleId} was supplied`,
        );
      else modules.set(candidate.moduleId, candidate);
    } else if (candidate.kind === "pack") {
      if (packs.has(candidate.moduleId))
        add(
          index === 0 ? "moduleId" : `dependencyDescriptors.${index - 1}.moduleId`,
          `More than one selected version of pack ${candidate.moduleId} was supplied`,
        );
      else packs.set(candidate.moduleId, candidate);
    }
  }

  const moduleEdges = new Map<string, string[]>();
  const layerRank: Record<ModuleLayer, number> = { service: 2, business: 3, bridge: 4 };
  for (const module of modules.values()) {
    const modulePath =
      module.moduleId === descriptor.moduleId
        ? ""
        : `dependencyDescriptors.${dependencyDescriptors.findIndex((item) => item.moduleId === module.moduleId)}.`;
    const layer = module.layer;
    if (layer === undefined) continue;
    const edges: string[] = [];
    if (layer === "service" && (module.dependencies.length > 0 || module.extends !== undefined))
      add(`${modulePath}layer`, "A service may not depend on or extend another package");
    if (layer === "bridge" && module.extends !== undefined)
      add(`${modulePath}extends`, "A bridge may not extend a base module");

    for (const [index, dependency] of module.dependencies.entries()) {
      const target = modules.get(dependency.moduleId);
      if (!target) {
        add(
          `${modulePath}dependencies.${index}`,
          `Module dependency ${dependency.moduleId} is missing from the selected descriptor set`,
        );
        continue;
      }
      edges.push(target.moduleId);
      if (layer === "business" && target.layer !== "service")
        add(`${modulePath}dependencies.${index}`, "A business module may depend only on services");
      if (layer === "bridge" && target.layer !== "service" && target.layer !== "business")
        add(
          `${modulePath}dependencies.${index}`,
          "A bridge may depend only on services or business modules",
        );
      if (layer === "service")
        add(`${modulePath}dependencies.${index}`, "A service may not depend on another package");
    }

    if (module.extends) {
      const target = modules.get(module.extends.moduleId);
      if (!target) {
        add(
          `${modulePath}extends`,
          `Base module ${module.extends.moduleId} is missing from the selected descriptor set`,
        );
      } else {
        edges.push(target.moduleId);
        if (layer !== "business" || target.layer !== "business")
          add(`${modulePath}extends`, "A business module may extend only one business module");
      }
    }
    moduleEdges.set(module.moduleId, edges);
  }

  const packEdges = new Map<string, string[]>();
  for (const pack of packs.values()) {
    const packPath =
      pack.moduleId === descriptor.moduleId
        ? ""
        : `dependencyDescriptors.${dependencyDescriptors.findIndex((item) => item.moduleId === pack.moduleId)}.`;
    if (pack.targetModule) {
      const target = modules.get(pack.targetModule);
      if (!target)
        add(
          `${packPath}targetModule`,
          `Target module ${pack.targetModule} is missing from the selected descriptor set`,
        );
    }
    if (pack.basePack) {
      const base = packs.get(pack.basePack.packageId);
      if (!base) {
        add(
          `${packPath}basePack`,
          `Base pack ${pack.basePack.packageId} is missing from the selected descriptor set`,
        );
      } else {
        if (base.targetModule !== pack.targetModule)
          add(`${packPath}basePack`, "A base pack must target the same module");
        packEdges.set(pack.moduleId, [base.moduleId]);
      }
    } else {
      packEdges.set(pack.moduleId, []);
    }
  }

  const detectCycle = (graph: Map<string, string[]>, name: string) => {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    let found = false;
    const visit = (id: string) => {
      if (visiting.has(id)) {
        found = true;
        return;
      }
      if (visited.has(id)) return;
      visiting.add(id);
      for (const next of graph.get(id) ?? []) visit(next);
      visiting.delete(id);
      visited.add(id);
    };
    for (const id of graph.keys()) visit(id);
    if (found) add("dependencyGraph", `${name} contain a dependency cycle`);
  };
  detectCycle(moduleEdges, "Module dependencies or extends links");
  detectCycle(packEdges, "Pack base links");

  return issues.length ? { valid: false, issues } : { valid: true, issues: [] };
}

/** True when reverting the package cannot remove any migration step already present now. */
export function isPackageOnlyRollback(
  current: Pick<RegistryDescriptor, "migrationSteps">,
  target: Pick<RegistryDescriptor, "migrationSteps">,
): boolean {
  const targetSteps = new Set(target.migrationSteps);
  return current.migrationSteps.every((step) => targetSteps.has(step));
}

const NO_FORK = new Set(["unlicensed", "proprietary", "none", "all-rights-reserved"]);
/** A module may be forked when its source is available and its license is not closed. */
export function canForkModule(origin: {
  license: string;
  source: "available" | "closed";
}): boolean {
  return origin.source === "available" && !NO_FORK.has(origin.license.trim().toLowerCase());
}

/** Level the host applies when `ai` is not declared: ask for public items, never for private. */
export function effectiveAiLevel(spec: {
  visibility: Visibility;
  ai?: AiLevel | undefined;
}): AiLevel {
  return spec.ai ?? (spec.visibility === "private" ? "never" : "confirm");
}

/** Tables other code may write: only those that list `write`, with who may write. */
export function writableTables(
  contract: ModuleContract,
): Readonly<Record<string, readonly string[]>> {
  const out: Record<string, readonly string[]> = {};
  for (const [name, spec] of Object.entries(contract.access.tables))
    if (spec.write !== undefined) out[name] = spec.write;
  return out;
}

const NEED = {
  call: /^[a-z][a-z0-9_]*(?:\.[a-z0-9_-]+)+:call$/,
  read: /^[a-z][a-z0-9_]*(?:\.[a-z0-9_-]+)+:read$/,
  write: /^([a-z][a-z0-9_]*(?:\.[a-z0-9_-]+)+):write$/,
  connection: /^connection:[a-z0-9][a-z0-9._-]{0,79}:use$/,
  net: /^net:[a-z0-9]([a-z0-9.-]{0,251}[a-z0-9])?$/,
  provider: /^provider:[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/,
};

/**
 * Checks a module declaration. Returns every problem found, never throws on a bad declaration
 * (only on input that is not bounded JSON). A host refuses to load a module with any issue.
 */
export function checkModuleContract(raw: unknown): {
  valid: boolean;
  issues: readonly ModuleContractIssue[];
  warnings: readonly ModuleContractIssue[];
  contract?: ModuleContract;
} {
  assertBoundedJson(raw);
  const parsed = ModuleContractSchema.safeParse(raw);
  if (!parsed.success)
    return {
      valid: false,
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        code: "schema" as const,
        message: i.message,
      })),
      warnings: [],
    };
  const c = parsed.data;
  const issues: ModuleContractIssue[] = [];
  const warnings: ModuleContractIssue[] = [];
  const add = (path: string, code: ModuleContractIssue["code"], message: string) =>
    issues.push({ path, code, message });

  /** Ids belong to the module: `<module>.` or, for views, the module's schema `<module>_vN.`. */
  const owns = (name: string, allowSchemaVersion = false) =>
    name.startsWith(`${c.id}.`) ||
    (allowSchemaVersion && new RegExp(`^${c.id}_v\\d+\\.`).test(name));
  const roles = new Set(Object.keys(c.access.roles));
  const permissionIds = new Set<string>();
  c.access.permissions.forEach((permission, index) => {
    if (!permission.id.startsWith(`${c.id}:`))
      add(`access.permissions.${index}.id`, "prefix", `Permission ids must start with ${c.id}:`);
    if (permissionIds.has(permission.id))
      add(`access.permissions.${index}.id`, "duplicate", "Duplicate permission id");
    permissionIds.add(permission.id);
  });
  const libraryNames = new Set<string>();
  c.libraries.forEach((library, index) => {
    if (libraryNames.has(library.name))
      add(`libraries.${index}.name`, "duplicate", `Library ${library.name} is listed twice`);
    libraryNames.add(library.name);
  });
  const dependencies = new Set<string>();
  c.depends.forEach((raw, index) => {
    const reference = parseModuleReference(raw);
    if (!reference.valid || reference.moduleId === c.id)
      add(`depends.${index}`, "dependency", `${raw} is not a valid base module dependency`);
    if (dependencies.has(reference.moduleId))
      add(`depends.${index}`, "duplicate", `Base module ${reference.moduleId} is listed twice`);
    dependencies.add(reference.moduleId);
  });
  if (c.layer === "service" && (c.depends.length > 0 || c.extends !== undefined))
    add("layer", "layer", "A service has no module dependencies and cannot extend a module");
  if (c.layer === "bridge" && c.extends !== undefined)
    add("extends", "layer", "A bridge cannot extend a base module");
  if (c.extends !== undefined) {
    const base = parseModuleReference(c.extends);
    if (
      !base.valid ||
      !base.hasRange ||
      base.versionRange === "*" ||
      base.versionRange === "latest"
    )
      add(
        "extends",
        "dependency",
        "extends must name one base module with an explicit version range",
      );
    if (base.moduleId === c.id) add("extends", "dependency", "A module cannot extend itself");
    if (dependencies.has(base.moduleId))
      add("extends", "duplicate", "The base module in extends must not also appear in depends");
  }
  if (c.systemRolePresets) {
    for (const role of ["member", "viewer"] as const) {
      for (const [name, preset] of Object.entries(c.systemRolePresets[role])) {
        const path = `systemRolePresets.${role}.${name}.permissions`;
        if (new Set(preset.permissions).size !== preset.permissions.length)
          add(path, "duplicate", "A permission is listed twice in this preset");
        for (const permission of preset.permissions)
          if (!permissionIds.has(permission))
            add(path, "system_role_preset", `${permission} is not a declared module permission`);
      }
    }
  }
  const roleList = (path: string, list: readonly string[]) => {
    for (const entry of list) {
      if (entry === "owner" || entry === "admin") {
        add(
          path,
          "system_role",
          entry === "owner"
            ? "owner always may; do not list it"
            : "admin holds no business permission; list member or a module role instead",
        );
      } else if ((LISTABLE_SYSTEM_ROLES as readonly string[]).includes(entry)) {
        continue;
      } else if (entry.startsWith(`${c.id}.`)) {
        if (!roles.has(entry.slice(c.id.length + 1)))
          add(path, "unknown_role", `Role ${entry} is not declared in access.roles`);
      } else if (entry.includes(".")) {
        add(path, "foreign_role", `A module can only name its own roles, not ${entry}`);
      } else {
        add(path, "unknown_role", `Unknown role ${entry}`);
      }
    }
    if (new Set(list).size !== list.length) add(path, "duplicate", "Role listed twice");
  };
  const noViewer = (path: string, list: readonly string[], what: string) => {
    if (list.includes("viewer")) add(path, "viewer_write", `A viewer can never ${what}`);
  };

  for (const [name, spec] of Object.entries(c.access.commands)) {
    const path = `access.commands.${name}`;
    if (!owns(name)) add(path, "prefix", `Command ids must start with ${c.id}.`);
    roleList(`${path}.call`, spec.call);
    if (spec.effect !== "read")
      noViewer(`${path}.call`, spec.call, "call a command that changes state");
    checkAi(path, spec, spec.effect);
  }
  for (const [name, spec] of Object.entries(c.access.views)) {
    const path = `access.views.${name}`;
    if (!owns(name, true))
      add(path, "prefix", `View ids must start with ${c.id}. or ${c.id}_v<N>.`);
    roleList(`${path}.read`, spec.read);
  }
  for (const [name, spec] of Object.entries(c.access.tables)) {
    const path = `access.tables.${name}`;
    if (!owns(name)) add(path, "prefix", `Table ids must start with ${c.id}.`);
    roleList(`${path}.read`, spec.read);
    if (spec.write) {
      roleList(`${path}.write`, spec.write);
      noViewer(`${path}.write`, spec.write, "write a table");
    }
    for (const [column, definition] of Object.entries(spec.columns ?? {}))
      if (definition.kind === "text" && definition.classification === undefined)
        warnings.push({
          path: `${path}.columns.${column}.classification`,
          code: "unclassified_text_column",
          message: `Text column ${column} has no privacy classification`,
        });
  }
  for (const [name, spec] of Object.entries(c.access.events)) {
    const path = `access.events.${name}`;
    if (!owns(name)) add(path, "prefix", `Event ids must start with ${c.id}.`);
    roleList(`${path}.subscribe`, spec.subscribe);
  }
  function checkAi(
    path: string,
    spec: { visibility: Visibility; ai?: AiLevel | undefined },
    cmdEffect: (typeof COMMAND_EFFECTS)[number],
  ) {
    if (spec.visibility === "private" && spec.ai !== undefined && spec.ai !== "never")
      add(`${path}.ai`, "private_ai", "A private item cannot be used by the AI; use ai: never");
    if (spec.ai === "auto" && !AI_AUTO_EFFECTS.includes(cmdEffect))
      add(
        `${path}.ai`,
        "ai_level",
        `ai: auto is not allowed for effect ${cmdEffect}; sends, filings and run control always ask`,
      );
  }

  const routineIds = new Set<string>();
  c.routines.forEach((routine, index) => {
    const path = `routines.${index}`;
    if (!owns(routine.id)) add(`${path}.id`, "prefix", `Routine ids must start with ${c.id}.`);
    if (routineIds.has(routine.id)) add(`${path}.id`, "duplicate", "Duplicate routine id");
    routineIds.add(routine.id);
    roleList(`${path}.run`, routine.run);
    noViewer(`${path}.run`, routine.run, "run a routine");
    if (new Set(routine.needs).size !== routine.needs.length)
      add(`${path}.needs`, "duplicate", "A need is listed twice");
    for (const need of routine.needs) {
      const write = NEED.write.exec(need);
      if (write) {
        if (!owns(write[1]!))
          add(`${path}.needs`, "need", `${need}: a routine may write only its own module's tables`);
        continue;
      }
      if (!Object.values(NEED).some((pattern) => pattern.test(need)))
        add(
          `${path}.needs`,
          "need",
          `${need}: use <id>:call, <id>:read, <table>:write, connection:<id>:use, net:<host> or provider:<slot>`,
        );
    }
  });

  if (c.ui) {
    const seen = new Set<string>();
    const unique = (path: string, id: string) => {
      if (seen.has(id)) add(path, "duplicate", `UI id ${id} is used twice`);
      seen.add(id);
    };
    const caps = (path: string, list: readonly string[]) => {
      for (const cap of list)
        if (!cap.startsWith(`${c.id}:`))
          add(
            path,
            "capability",
            `${cap}: a module screen or card may require only ${c.id}: capabilities`,
          );
    };
    const route = (path: string, value: string) => {
      const segments = value === "/" ? [] : value.slice(1).split("/");
      const parameterNames = new Set<string>();
      const validLocalPattern =
        value.startsWith("/") &&
        !value.startsWith("//") &&
        !/[?#\\%\s\u0000-\u001f]/.test(value) &&
        (value === "/" ||
          segments.every((segment) => {
            if (!segment || segment === "." || segment === "..") return false;
            if (!segment.startsWith(":")) return !segment.includes(":");
            const name = segment.slice(1);
            if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) || parameterNames.has(name)) return false;
            parameterNames.add(name);
            return true;
          }));
      if (!validLocalPattern) {
        add(path, "route", `${value} is not a valid local screen path pattern`);
        return;
      }
      if (
        value !== "/" &&
        RESERVED_ROUTE_PREFIXES.some((p) => value === p || value.startsWith(`${p}/`))
      )
        add(path, "route", `${value} is a host route; a module cannot take it`);
    };
    const screenRoutes = new Set<string>();
    c.ui.screens.forEach((screen, i) => {
      const path = `ui.screens.${i}`;
      if (!owns(screen.id)) add(`${path}.id`, "prefix", `Screen ids must start with ${c.id}.`);
      unique(`${path}.id`, screen.id);
      route(`${path}.route`, screen.route);
      const signature = screen.route.replace(/:[A-Za-z_][A-Za-z0-9_]*/g, ":");
      if (screenRoutes.has(signature))
        add(`${path}.route`, "duplicate", `Screen route pattern ${screen.route} is duplicated.`);
      screenRoutes.add(signature);
      caps(`${path}.requiredCapabilities`, screen.requiredCapabilities);
    });
    c.ui.navLinks.forEach((link, i) => {
      const path = `ui.navLinks.${i}`;
      if (!owns(link.id)) add(`${path}.id`, "prefix", `Link ids must start with ${c.id}.`);
      unique(`${path}.id`, link.id);
      caps(`${path}.requiredCapabilities`, link.requiredCapabilities);
    });
    for (const slot of ["homeCards", "settingsCards", "reviewCards"] as const)
      c.ui.slots[slot].forEach((card, i) => {
        const path = `ui.slots.${slot}.${i}`;
        if (!owns(card.id)) add(`${path}.id`, "prefix", `Card ids must start with ${c.id}.`);
        unique(`${path}.id`, card.id);
        caps(`${path}.requiredCapabilities`, card.requiredCapabilities);
      });
  }

  if (c.docs && (c.docs.context.startsWith("/") || c.docs.context.split("/").includes("..")))
    add("docs.context", "docs_path", "docs.context must be a relative path inside the module");

  if (c.provenance) {
    const origin = c.provenance.origin;
    if (!c.id.startsWith("x_")) add("id", "provenance", "A fork gets its own id starting with x_");
    if (origin.moduleId === c.id)
      add("provenance.origin.moduleId", "provenance", "A fork cannot reuse the original's id");
    if (!canForkModule({ license: origin.license, source: origin.source }))
      add("provenance.origin.license", "provenance", `${origin.license} does not allow forking`);
  }

  return issues.length
    ? { valid: false, issues, warnings }
    : { valid: true, issues: [], warnings, contract: c };
}

/** Throws on the first listed problem; for tools that want an exception. */
export function parseModuleContract(raw: unknown): ModuleContract {
  const result = checkModuleContract(raw);
  if (!result.valid || !result.contract)
    throw new Error(
      `Invalid module contract: ${result.issues.map((i) => `${i.path} ${i.message}`).join("; ")}`,
    );
  return result.contract;
}
