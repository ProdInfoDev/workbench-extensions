# Workbench Extensions — Context (`ProdInfoDev/workbench-extensions`)

Last updated: 2026-11-06.

## Current State

- **Repository**: `ProdInfoDev/workbench-extensions` (**Public / MIT**), replacing the archived `prodinfo-extensions` repository.
- **Published Contract Package**: `@prodinfo/extension-contracts` (`0.1.0-alpha.5`), pinned by `ProdInfoDev/workbench-core` (`vendor/contract-pin.json`) and consumed across `workbench-core`, `workbench-data`, `workbench-crm`, and `workbench-accounting`.
- **Module Plugin Contract Specification ([`docs/module-contract.md`](module-contract.md))**:
  - Defines the public module contract matching `workbench-core` [ADR 0014](../../workbench-core/docs/adr/0014-module-public-contract-and-console-access.md):
    - 4 host system roles (`owner`, `admin`, `member`, `viewer`) + optional module roles (`access.roles`).
    - Explicit `visibility: "public" | "private"` on commands, views, and events, with closed-by-default table write access (`access.tables.*.write`) and AI policy (`auto | confirm | never`).
    - Explicit routine capability grants (`routines[].needs`) approved on activation.
    - Declarative UI metadata (`ui.screens`, `ui.navLinks`, `ui.slots.{homeCards,settingsCards,reviewCards}`) so modules extend the common host UI shell without coupling Core to any domain.
- **Implemented Surface (`packages/contracts/src/`)**:
  - `json.ts` & `index.ts`: Strict JSON tree validation, canonical JSON serialization, operation metadata, invocation & reply envelopes, and execution effect declarations (`submit`, `controlRun`).
  - `resources.ts`: Managed text resource references, roots, read/create payloads, and artifact effect boundaries.
  - `configuration.ts`: Declarative configuration contracts, field bounds, secret references, and non-coercing validation results.
  - `files.ts`: Managed routine text file pages, calls, and acknowledgements preserving Unicode/BOM/CRLF.
  - `module-contract.ts`: executable module contract (`ModuleContractSchema`, `checkModuleContract`, `writableTables`, `effectiveAiLevel`, `canForkModule`) with fixtures (`module-contract-valid.json`, `module-contract-fork.json`) and the generated `module-contract.schema.json`. Not yet released as a new package version; hosts adopt it by re-pinning.
- **Verification**:
  - `npm run check` runs Biome format check, TypeScript typecheck, 14 contract tests (`packages/contracts/test/*.test.ts`), build, and JSON Schema drift verification (`packages/contracts/schemas/*.schema.json`).
