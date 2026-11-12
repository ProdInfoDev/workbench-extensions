import { z } from "zod";

export const MARKETPLACE_CONNECTOR_IDS = [
  "shopify",
  "prestashop",
  "mozello",
  "allegro",
  "ebay",
  "amazon",
  "mercadolibre",
] as const;

export type MarketplaceConnectorId = (typeof MARKETPLACE_CONNECTOR_IDS)[number];

export const MarketplaceProductFixtureSchema = z.strictObject({
  sku: z.string().min(1).max(80),
  name: z.string().max(255),
  description: z.string().max(20_000).optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().min(3).max(3).optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  brand: z.string().max(120).optional(),
  gtin: z.string().max(32).optional(),
  mpn: z.string().max(80).optional(),
  images: z.array(z.string().url()).max(12).optional(),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export type MarketplaceProductFixture = z.infer<typeof MarketplaceProductFixtureSchema>;

export const SYNTHETIC_MARKETPLACE_FIXTURES: readonly MarketplaceProductFixture[] = [
  {
    sku: "MKT-001",
    name: "Industrial Pressure Gauge 10 Bar",
    description: "Stainless steel glycerin-filled pressure gauge with 1/4 BSP bottom mount.",
    price: 34.5,
    currency: "EUR",
    stockQuantity: 42,
    category: ["Measurement", "Pressure Gauges"],
    brand: "WikaTest",
    gtin: "4001234567890",
    mpn: "PG-10B-SS",
    images: ["https://cdn.example.test/products/mkt-001.jpg"],
    attributes: { Material: "Stainless Steel", Range: "0-10 Bar" },
  },
  {
    sku: "MKT-002",
    name: "Brass Ball Valve 1/2 Inch",
    description: "Full bore brass ball valve with lever handle.",
    price: 12.9,
    currency: "EUR",
    stockQuantity: 100,
    category: "Valves",
    brand: "ValveCo",
    gtin: "4001234567891",
    mpn: "BV-050",
    images: ["https://cdn.example.test/products/mkt-002.jpg"],
  },
  {
    sku: "MKT-BAD",
    name: "",
    price: 5,
  },
];

export const MarketplaceConformanceSpecSchema = z.strictObject({
  connectorId: z.enum(MARKETPLACE_CONNECTOR_IDS),
  routineId: z.string().min(1),
  syncRoutineId: z.string().min(1).optional(),
  supportsPublishStep: z.boolean(),
  expectedOutcomeForValid: z.literal("post_success"),
  expectedOutcomeForMissingName: z.literal("post_error"),
});

export const MARKETPLACE_CONFORMANCE_SPECS = [
  {
    connectorId: "shopify",
    routineId: "shopify-push-products",
    syncRoutineId: "shopify-sync-collections",
    supportsPublishStep: true,
    expectedOutcomeForValid: "post_success",
    expectedOutcomeForMissingName: "post_error",
  },
  {
    connectorId: "prestashop",
    routineId: "prestashop-push-products",
    syncRoutineId: "prestashop-sync-categories",
    supportsPublishStep: true,
    expectedOutcomeForValid: "post_success",
    expectedOutcomeForMissingName: "post_error",
  },
  {
    connectorId: "mozello",
    routineId: "mozello-push-products",
    syncRoutineId: "mozello-sync-categories",
    supportsPublishStep: true,
    expectedOutcomeForValid: "post_success",
    expectedOutcomeForMissingName: "post_error",
  },
  {
    connectorId: "allegro",
    routineId: "allegro-push-products",
    syncRoutineId: "allegro-sync-categories",
    supportsPublishStep: true,
    expectedOutcomeForValid: "post_success",
    expectedOutcomeForMissingName: "post_error",
  },
  {
    connectorId: "ebay",
    routineId: "ebay-push-products",
    supportsPublishStep: true,
    expectedOutcomeForValid: "post_success",
    expectedOutcomeForMissingName: "post_error",
  },
  {
    connectorId: "amazon",
    routineId: "amazon-push-products",
    supportsPublishStep: false,
    expectedOutcomeForValid: "post_success",
    expectedOutcomeForMissingName: "post_error",
  },
  {
    connectorId: "mercadolibre",
    routineId: "mercadolibre-push-products",
    syncRoutineId: "mercadolibre-sync-categories",
    supportsPublishStep: true,
    expectedOutcomeForValid: "post_success",
    expectedOutcomeForMissingName: "post_error",
  },
] as const;
