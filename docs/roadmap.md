# Workbench Extensions — Module Roadmap (`ProdInfoDev/workbench-extensions`)

Last updated: 2026-11-06.
Central ecosystem roadmap: `../workbench-core/docs/roadmap.md`.
Module contract ADR: `../workbench-core/docs/adr/0014-module-public-contract-and-console-access.md`.
Legacy migration roadmap: `../workbench-core/docs/migration-roadmap.md`.

## Completed Milestones (`DONE`)

- **C1a–C1g (`0.1.0-alpha.1` – `0.1.0-alpha.3`)**: Strict JSON boundary, operation/invocation/reply schemas, managed text resource schemas, and configuration declaration/validation contracts.
- **C2a (`0.1.0-alpha.4`)**: Execution effect declarations (`submit`, `controlRun`) and admission result types.
- **M-Files (`0.1.0-alpha.5`)**: Managed routine text file streaming page/call/ack schemas (`packages/contracts/src/files.ts`).
- **M-Contract-Draft ([`docs/module-contract.md`](module-contract.md))**: Public module contract specification for system roles (`owner`, `admin`, `member`, `viewer`), optional module roles, `visibility: public | private`, routine `needs`, and declarative UI slots (`screens`, `navLinks`, `homeCards`, `settingsCards`, `reviewCards`).
- **EXT-1a — Contract libraries, base modules & role presets (`0.1.0-alpha.8` source)**: `libraries` are code-only package pins with digests/licenses/source, base modules use checked `depends` ranges, and named member/viewer `systemRolePresets` are schema-checked against module permissions. The package is built and Core pins its local tarball; npm publication awaits registry credentials.

## Upcoming Milestones

- **EXT-1b — Public Module, Connector & Routine Authoring SDK**:
  - Typed TypeScript helper builders for declaring connection types, reference caches, record schemas, output templates, and idempotent delivery receipts using only public MIT types.
- **EXT-2 — Marketplace Connector Conformance Fixtures (`M-EXT-1`)**:
  - Publish synthetic request/response conformance fixtures and MIT TypeScript connector templates for the 7 remaining marketplace targets from legacy `productinfo-destinations` (`shopify`, `ebay`, `amazon`, `allegro`, `mercadolibre`, `mozello`, `prestashop`).
