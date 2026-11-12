import assert from "node:assert/strict";
import test from "node:test";
import {
  MARKETPLACE_CONNECTOR_IDS,
  MARKETPLACE_CONFORMANCE_SPECS,
  MarketplaceConformanceSpecSchema,
  MarketplaceProductFixtureSchema,
  SYNTHETIC_MARKETPLACE_FIXTURES,
} from "../src/index.ts";

test("marketplace conformance specs cover all 7 DATA-2 connectors and valid synthetic fixtures", () => {
  assert.deepEqual(
    MARKETPLACE_CONFORMANCE_SPECS.map((s) => s.connectorId),
    [...MARKETPLACE_CONNECTOR_IDS],
  );
  for (const spec of MARKETPLACE_CONFORMANCE_SPECS) {
    assert.doesNotThrow(() => MarketplaceConformanceSpecSchema.parse(spec));
  }
  for (const fixture of SYNTHETIC_MARKETPLACE_FIXTURES) {
    assert.doesNotThrow(() => MarketplaceProductFixtureSchema.parse(fixture));
  }
});
