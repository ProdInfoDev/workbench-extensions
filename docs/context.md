# Workbench Extensions — Context (`ProdInfoDev/workbench-extensions`)

Last updated: 2026-11-07.

## Current State

- **Repository**: `ProdInfoDev/workbench-extensions` (**Public / MIT**), replacing the archived `prodinfo-extensions` repository.
- **Contract Package Source (not registry-published)**: `@prodinfo/extension-contracts` (`0.1.0-alpha.10`) adds table-column privacy classification and a signed module registry descriptor with package-only rollback eligibility. Core adopts the locally packed artifact by re-pinning `vendor/contract-pin.json`; npm publication remains skipped.
- **Module Plugin Contract Specification ([`docs/module-contract.md`](module-contract.md))**:
  - Defines the public module contract matching `workbench-core` [ADR 0014](../../workbench-core/docs/adr/0014-module-public-contract-and-console-access.md) and ADR 0015:
    - 4 host system roles (`owner`, `admin`, `member`, `viewer`) + optional module roles (`access.roles`).
    - Explicit `visibility: "public" | "private"` on commands, views, and events, with closed-by-default table write access (`access.tables.*.write`) and AI policy (`auto | confirm | never`).
    - Explicit routine capability grants (`routines[].needs`) approved on activation.
    - Shared libraries are code-only package pins (`name`, `version`, SHA-256 digest, license and source); required base modules use versioned `depends` entries.
    - Named `systemRolePresets` declare member/viewer permission sets; the first named preset is that role's module default.
    - `access.tables.*.columns` declares column kind and optional `personal`, `confidential` or `secret` classification. Unclassified text columns return authoring warnings without invalidating an otherwise valid contract.
    - Declarative UI metadata (`ui.screens`, `ui.navLinks`, `ui.slots.{homeCards,settingsCards,reviewCards}`) so modules extend the common host UI shell without coupling Core to any domain.
- **Implemented Surface (`packages/contracts/src/`)**:
  - `json.ts` & `index.ts`: Strict JSON tree validation, canonical JSON serialization, operation metadata, invocation & reply envelopes, and execution effect declarations (`submit`, `controlRun`).
  - `resources.ts`: Managed text resource references, roots, read/create payloads, and artifact effect boundaries.
  - `configuration.ts`: Declarative configuration contracts, field bounds, secret references, and non-coercing validation results.
  - `files.ts`: Managed routine text file pages, calls, and acknowledgements preserving Unicode/BOM/CRLF.
  - `module-contract.ts`: executable module contract (`ModuleContractSchema`, `checkModuleContract`, `writableTables`, `effectiveAiLevel`, `canForkModule`) with library/base-module/preset and column-classification checks; registry descriptor schemas, signed envelopes, `checkRegistryDescriptor`, and `isPackageOnlyRollback`; fixtures and generated JSON Schemas.
- **Verification**:
  - `pnpm run check` passes for alpha.10: Biome format check, TypeScript typecheck, contract tests, package build, and generated JSON Schema drift verification. The local alpha.10 tarball is packed for Core to pin in Phase 2; npm publication remains skipped.
