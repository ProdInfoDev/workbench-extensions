# Workbench Extensions — Module Roadmap (`ProdInfoDev/workbench-extensions`)

Last updated: 2026-11-08.
Central ecosystem roadmap: `../workbench-core/docs/roadmap.md`.
Module contract ADR: `../workbench-core/docs/adr/0014-module-public-contract-and-console-access.md`.
Legacy migration roadmap: `../workbench-core/docs/migration-roadmap.md`.

## Completed Milestones (`DONE`)

- **C1a–C1g (`0.1.0-alpha.1` – `0.1.0-alpha.3`)**: Strict JSON boundary, operation/invocation/reply schemas, managed text resource schemas, and configuration declaration/validation contracts.
- **C2a (`0.1.0-alpha.4`)**: Execution effect declarations (`submit`, `controlRun`) and admission result types.
- **M-Files (`0.1.0-alpha.5`)**: Managed routine text file streaming page/call/ack schemas (`packages/contracts/src/files.ts`).
- **M-Contract-Draft ([`docs/module-contract.md`](module-contract.md))**: Public module contract specification for system roles (`owner`, `admin`, `member`, `viewer`), optional module roles, `visibility: public | private`, routine `needs`, and declarative UI slots (`screens`, `navLinks`, `homeCards`, `settingsCards`, `reviewCards`).
- **EXT-1a — Contract libraries, base modules & role presets (`0.1.0-alpha.8` source)**: `libraries` are code-only package pins with digests/licenses/source, base modules use checked `depends` ranges, and named member/viewer `systemRolePresets` are schema-checked against module permissions. The package is built and Core pins its local tarball; npm publication awaits registry credentials.
- **EXT-1b — Common-shell screen metadata (`0.1.0-alpha.9` source)**: module UI metadata may name the module, declare hidden screens, and use validated whole-segment route parameters. Parameterized routes are automatically excluded from menus/search by Core. The alpha.9 source is tested and Core adopts its locally packed artifact; npm publication remains skipped.
- **EXT-1d — Column classification, registry descriptor & package rollback (`0.1.0-alpha.10` source)**: modules may classify table columns as personal, confidential or secret, with non-failing warnings for unclassified text columns. Registry descriptors and Ed25519 signed envelopes have generated schemas, fixtures and conformance checks; `isPackageOnlyRollback` checks migration-step compatibility. Author docs recommend additive expand-then-contract migrations. The alpha.10 package passes `pnpm run check` and is packed locally for Core to pin; npm publication remains skipped.
- **EXT-1e — Package layers and dependency graphs (`0.1.0-alpha.11` source)**: contracts declare `service`, `business` or `bridge`, with business-only ranged `extends`; routine needs include Core provider slots. Registry descriptors cover modules, packs and libraries, with pack target/base-pack metadata. `checkDependencyLayers` and shared valid/invalid JSON graphs cover layer direction and cycles for Java and Core conformance. `pnpm run check` passes; the package is built locally and npm publication remains skipped.
- **Commercial Phase 1 / ADR 0004 contract support (`0.1.0-alpha.12` source)**: exports `isAllowedOpenSourceSpdxLicense` and the allowed SPDX identifier list. It validates the approved license identifiers, legacy `-only` aliases, and AND/OR combinations, and rejects custom licences and `WITH` exceptions. Core consumes this local package pin; npm publication remains skipped.

## Upcoming Milestones

- **EXT-1c — Public Module, Connector & Routine Authoring SDK**:
  - Typed TypeScript helper builders for declaring connection types, reference caches, record schemas, output templates, and idempotent delivery receipts using only public MIT types.
- **EXT-2 — Marketplace Connector Conformance Fixtures (`M-EXT-1`)**:
  - Publish synthetic request/response conformance fixtures and MIT TypeScript connector templates for the 7 remaining marketplace targets from legacy `productinfo-destinations` (`shopify`, `ebay`, `amazon`, `allegro`, `mercadolibre`, `mozello`, `prestashop`).
