import { z } from "zod";
import { assertBoundedJson } from "./json.ts";

/** Fixed catalog business areas for shared procedures ("Plan templates", ADR 0028 §11.5). */
export const BUSINESS_AREAS = [
  "close_and_reporting",
  "banking_and_payments",
  "sales_and_receivables",
  "purchasing_and_payables",
  "inventory_and_production",
  "tax_and_statutory",
  "subscriptions",
  "crm",
  "data_and_integrations",
  "e_commerce",
] as const;

export type BusinessArea = (typeof BUSINESS_AREAS)[number];

export const BUSINESS_AREA_LABELS: Readonly<Record<BusinessArea, string>> = {
  close_and_reporting: "Close & reporting",
  banking_and_payments: "Banking & payments",
  sales_and_receivables: "Sales & receivables",
  purchasing_and_payables: "Purchasing & payables",
  inventory_and_production: "Inventory & production",
  tax_and_statutory: "Tax & statutory",
  subscriptions: "Subscriptions",
  crm: "CRM",
  data_and_integrations: "Data & integrations",
  e_commerce: "E-commerce",
};

export const BusinessAreaSchema = z.enum(BUSINESS_AREAS);

export const PLAN_TEMPLATE_SCALAR_TYPES = [
  "string",
  "integer",
  "number",
  "decimal",
  "boolean",
  "date",
  "month",
  "document",
] as const;

export const PLAN_TEMPLATE_TRIGGER_KINDS = ["manual", "schedule", "event"] as const;
export const PlanTemplateTriggerKindSchema = z.enum(PLAN_TEMPLATE_TRIGGER_KINDS);

const moduleId = z.string().regex(/^[a-z][a-z0-9_]{0,39}$/);
const version = z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
const versionRange = z.string().trim().min(1).max(120);
const dottedId = z.string().regex(/^[a-z][a-z0-9_]*(?:\.[a-z0-9_-]+)+$/);
const paramName = z.string().regex(/^[a-z][a-zA-Z0-9_]{0,39}$/);
const text = (max: number) => z.string().trim().min(1).max(max);

export const PlanTemplateFieldSchema = z.strictObject({
  name: paramName,
  label: text(80).optional(),
  type: z.enum(PLAN_TEMPLATE_SCALAR_TYPES),
  required: z.boolean().default(true),
  default: z.json().optional(),
});

export const PlanTemplateParameterSchema = z.union([
  PlanTemplateFieldSchema,
  z.strictObject({
    name: paramName,
    label: text(80),
    type: z.literal("list"),
    required: z.boolean().default(true),
    items: z.array(PlanTemplateFieldSchema).min(1).max(20),
  }),
]);

export const PlanTemplateStepSchema = z.strictObject({
  operationId: dottedId.max(160),
  input: z.json(),
  /** Repeat this step once per element of a declared `list` parameter. */
  forEach: paramName.optional(),
  /** Optional pack rule reference when the procedure relies on pack-defined rules. */
  ruleRef: text(160).optional(),
});

export const PlanTemplateAmountRuleSchema = z.strictObject({
  pointer: z.string().startsWith("/").max(120),
  max: z.union([z.string().regex(/^-?\d+(?:\.\d{1,6})?$/), z.number().finite()]),
  operationId: dottedId.max(160).optional(),
});

export const PlanTemplateAllowedValueRuleSchema = z
  .strictObject({
    pointer: z.string().startsWith("/").max(120),
    values: z.array(text(120)).min(1).max(200).optional(),
    prefix: text(60).optional(),
    operationId: dottedId.max(160).optional(),
  })
  .refine(
    (rule) => (rule.values !== undefined && rule.values.length > 0) || rule.prefix !== undefined,
    { message: "Each allowedValues rule must specify values or a prefix" },
  );

export const PlanTemplateSuggestedLimitsSchema = z.strictObject({
  maxSteps: z.number().int().min(1).max(200).optional(),
  maxStepAmount: PlanTemplateAmountRuleSchema.optional(),
  maxTotalAmount: PlanTemplateAmountRuleSchema.optional(),
  allowedValues: z.array(PlanTemplateAllowedValueRuleSchema).max(20).optional(),
  allowedTriggers: z.array(text(160)).min(1).max(50).optional(),
});

export const PlanTemplateAppliesToSchema = z.strictObject({
  documentTypes: z.array(dottedId.max(120)).min(1).max(50).optional(),
});

export type PlanTemplateAppliesTo = z.output<typeof PlanTemplateAppliesToSchema>;

/** Declarative procedure contract declared inside a module, pack, or template package. */
export const PlanTemplateContractSchema = z.strictObject({
  id: dottedId.max(120),
  title: text(120),
  description: z.string().trim().max(1000).default(""),
  businessArea: BusinessAreaSchema.optional(),
  appliesTo: PlanTemplateAppliesToSchema.optional(),
  triggers: z.array(PlanTemplateTriggerKindSchema).min(1).max(3).default(["manual"]),
  schedule: text(120).optional(),
  hasExternalEffects: z.boolean().default(false),
  suggestedLimits: PlanTemplateSuggestedLimitsSchema.optional(),
  parameters: z.array(PlanTemplateParameterSchema).max(20).default([]),
  steps: z.array(PlanTemplateStepSchema).min(1).max(50),
});

export type PlanTemplateContract = z.output<typeof PlanTemplateContractSchema>;
export type PlanTemplateSuggestedLimits = z.output<typeof PlanTemplateSuggestedLimitsSchema>;

const packageReference = z.strictObject({ packageId: moduleId, versionRange });
const moduleReference = z.strictObject({ moduleId, versionRange });

/** Manifest schema for `pack.json` inside country/localization packs. */
export const PackManifestSchema = z.strictObject({
  id: moduleId,
  version,
  license: text(64).optional(),
  kind: z.enum(["pack", "country-pack"]).optional(),
  targetModule: moduleId.optional(),
  targetVersionRange: versionRange.optional(),
  basePack: packageReference.optional(),
  country: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .optional(),
  description: text(1000).optional(),
  maintainer: text(120).optional(),
  verified: z.boolean().optional(),
  coreApi: versionRange.optional(),
  main: text(200).optional(),
  planTemplates: z.array(PlanTemplateContractSchema).max(100).default([]),
});

export type PackManifest = z.output<typeof PackManifestSchema>;

/** Manifest schema for `template-package.json` inside standalone `kind: "template"` packages. */
export const TemplatePackageManifestSchema = z.strictObject({
  id: moduleId,
  version,
  license: text(64),
  description: text(1000).optional(),
  maintainer: text(120).optional(),
  businessArea: BusinessAreaSchema,
  requires: z.array(moduleReference).min(1).max(100),
  targetPack: packageReference.optional(),
  planTemplates: z.array(PlanTemplateContractSchema).min(1).max(100),
});

export type TemplatePackageManifest = z.output<typeof TemplatePackageManifestSchema>;

export interface PlanTemplateIssue {
  readonly path: string;
  readonly message: string;
}

const isPlaceholder = (node: unknown, key: "$param" | "$item"): node is Record<string, string> =>
  !!node &&
  typeof node === "object" &&
  !Array.isArray(node) &&
  Object.keys(node).length === 1 &&
  typeof (node as Record<string, unknown>)[key] === "string";

function collectPlaceholders(
  node: unknown,
  key: "$param" | "$item",
  found: string[] = [],
): string[] {
  if (isPlaceholder(node, key)) found.push(node[key]!);
  else if (Array.isArray(node)) for (const child of node) collectPlaceholders(child, key, found);
  else if (node && typeof node === "object")
    for (const child of Object.values(node)) collectPlaceholders(child, key, found);
  return found;
}

/** Validates parameter uniqueness and placeholder integrity inside one plan template contract. */
export function checkPlanTemplatePlaceholders(
  template: PlanTemplateContract,
  basePath = "",
): PlanTemplateIssue[] {
  const issues: PlanTemplateIssue[] = [];
  const prefix = basePath ? `${basePath}.` : "";
  if (template.appliesTo?.documentTypes) {
    const seenTypes = new Set<string>();
    for (const [docIdx, docType] of template.appliesTo.documentTypes.entries()) {
      if (seenTypes.has(docType)) {
        issues.push({
          path: `${prefix}appliesTo.documentTypes.${docIdx}`,
          message: `Duplicate document type ${docType}`,
        });
      }
      seenTypes.add(docType);
    }
  }
  const byName = new Map<string, (typeof template.parameters)[number]>();
  for (const [index, param] of template.parameters.entries()) {
    if (byName.has(param.name)) {
      issues.push({
        path: `${prefix}parameters.${index}.name`,
        message: `Duplicate parameter name ${param.name}`,
      });
    } else {
      byName.set(param.name, param);
    }
    if (param.type === "list") {
      const itemNames = new Set<string>();
      for (const [itemIndex, item] of param.items.entries()) {
        if (itemNames.has(item.name)) {
          issues.push({
            path: `${prefix}parameters.${index}.items.${itemIndex}.name`,
            message: `Duplicate list item field name ${item.name}`,
          });
        }
        itemNames.add(item.name);
      }
    }
  }

  for (const [stepIndex, step] of template.steps.entries()) {
    const stepPath = `${prefix}steps.${stepIndex}`;
    for (const paramRef of collectPlaceholders(step.input, "$param")) {
      if (!byName.has(paramRef)) {
        issues.push({
          path: `${stepPath}.input`,
          message: `References unknown parameter ${paramRef}`,
        });
      }
    }
    const itemRefs = collectPlaceholders(step.input, "$item");
    if (step.forEach) {
      const list = byName.get(step.forEach);
      if (!list || list.type !== "list") {
        issues.push({
          path: `${stepPath}.forEach`,
          message: `Repeats over ${step.forEach}, which is not a list parameter`,
        });
        continue;
      }
      const allowedFields = new Set(list.items.map((item) => item.name));
      for (const itemRef of itemRefs) {
        if (!allowedFields.has(itemRef)) {
          issues.push({
            path: `${stepPath}.input`,
            message: `References unknown field ${itemRef} on list ${step.forEach}`,
          });
        }
      }
    } else if (itemRefs.length > 0) {
      issues.push({
        path: `${stepPath}.input`,
        message: "Uses $item outside a forEach step",
      });
    }
  }
  return issues;
}

/** Parses and cross-checks a `pack.json` manifest including its declarative `planTemplates`. */
export function checkPackManifest(raw: unknown): {
  valid: boolean;
  issues: readonly PlanTemplateIssue[];
  manifest?: PackManifest;
} {
  assertBoundedJson(raw);
  const parsed = PackManifestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      valid: false,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }
  const manifest = parsed.data;
  const issues: PlanTemplateIssue[] = [];
  const seenIds = new Set<string>();
  for (const [index, tpl] of manifest.planTemplates.entries()) {
    const path = `planTemplates.${index}`;
    if (!tpl.id.startsWith(`${manifest.id}.`)) {
      issues.push({
        path: `${path}.id`,
        message: `Pack template ids must start with ${manifest.id}.`,
      });
    }
    if (seenIds.has(tpl.id)) {
      issues.push({ path: `${path}.id`, message: `Duplicate template id ${tpl.id}` });
    }
    seenIds.add(tpl.id);
    issues.push(...checkPlanTemplatePlaceholders(tpl, path));
  }
  return issues.length ? { valid: false, issues } : { valid: true, issues: [], manifest };
}

/** Parses and cross-checks a `template-package.json` manifest (`kind: "template"`). */
export function checkTemplatePackageManifest(raw: unknown): {
  valid: boolean;
  issues: readonly PlanTemplateIssue[];
  manifest?: TemplatePackageManifest;
} {
  assertBoundedJson(raw);
  const parsed = TemplatePackageManifestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      valid: false,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }
  const manifest = parsed.data;
  const issues: PlanTemplateIssue[] = [];
  const seenRequires = new Set<string>();
  for (const [index, req] of manifest.requires.entries()) {
    if (seenRequires.has(req.moduleId)) {
      issues.push({
        path: `requires.${index}.moduleId`,
        message: `Duplicate required module ${req.moduleId}`,
      });
    }
    seenRequires.add(req.moduleId);
  }
  const seenIds = new Set<string>();
  for (const [index, tpl] of manifest.planTemplates.entries()) {
    const path = `planTemplates.${index}`;
    if (!tpl.id.startsWith(`${manifest.id}.`)) {
      issues.push({
        path: `${path}.id`,
        message: `Template ids must start with ${manifest.id}.`,
      });
    }
    if (seenIds.has(tpl.id)) {
      issues.push({ path: `${path}.id`, message: `Duplicate template id ${tpl.id}` });
    }
    seenIds.add(tpl.id);
    issues.push(...checkPlanTemplatePlaceholders(tpl, path));
  }
  return issues.length ? { valid: false, issues } : { valid: true, issues: [], manifest };
}
