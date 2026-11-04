# Workbench Extensions — Module Roadmap (`ProdInfoDev/workbench-extensions`)

Last updated: 2026-11-04.
Central ecosystem roadmap: `../workbench-core/docs/roadmap.md`.
Legacy migration roadmap: `../workbench-core/docs/migration-roadmap.md`.

## Completed Milestones (`DONE`)

- **C1a–C1g (`0.1.0-alpha.1` – `0.1.0-alpha.3`)**: Strict JSON boundary, operation/invocation/reply schemas, managed text resource schemas, and configuration declaration/validation contracts.
- **C2a (`0.1.0-alpha.4`)**: Execution effect declarations (`submit`, `controlRun`) and admission result types.
- **M-Files (`0.1.0-alpha.5`)**: Managed routine text file streaming page/call/ack schemas (`packages/contracts/src/files.ts`).

## Upcoming Milestones

- **EXT-1 — Public Connector & Routine Authoring SDK (`0.2.0`)**:
  - Typed TypeScript helper builders for declaring connection types, reference caches, record schemas, output templates, and idempotent delivery receipts using only public MIT types.
- **EXT-2 — Marketplace Connector Conformance Fixtures (`M-EXT-1`)**:
  - Publish synthetic request/response conformance fixtures and MIT TypeScript connector templates for the 7 remaining marketplace targets from legacy `productinfo-destinations` (`shopify`, `ebay`, `amazon`, `allegro`, `mercadolibre`, `mozello`, `prestashop`).
