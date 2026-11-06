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

## Upcoming Milestones

- **EXT-1 — Public Module, Connector & Routine Authoring SDK (`0.2.0`)**:
  - Executable Zod/JSON schemas and conformance fixtures for [`docs/module-contract.md`](module-contract.md) (`access`, `visibility`, `routines[].needs`, declarative `ui` slots).
  - Typed TypeScript helper builders for declaring connection types, reference caches, record schemas, output templates, and idempotent delivery receipts using only public MIT types.
- **EXT-2 — Marketplace Connector Conformance Fixtures (`M-EXT-1`)**:
  - Publish synthetic request/response conformance fixtures and MIT TypeScript connector templates for the 7 remaining marketplace targets from legacy `productinfo-destinations` (`shopify`, `ebay`, `amazon`, `allegro`, `mercadolibre`, `mozello`, `prestashop`).
