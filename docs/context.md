# Workbench Extensions — Context (`ProdInfoDev/workbench-extensions`)

Last updated: 2026-11-04.

## Current State

- **Repository**: `ProdInfoDev/workbench-extensions` (**Public / MIT**), replacing the archived `prodinfo-extensions` repository.
- **Published Contract Package**: `@prodinfo/extension-contracts` (`0.1.0-alpha.5`), pinned by `ProdInfoDev/workbench-core` (`vendor/contract-pin.json`) and consumed across `workbench-core`, `workbench-data`, `workbench-crm`, and `workbench-accounting`.
- **Implemented Surface (`packages/contracts/src/`)**:
  - `json.ts` & `index.ts`: Strict JSON tree validation, canonical JSON serialization, operation metadata, invocation & reply envelopes, and execution effect declarations (`submit`, `controlRun`).
  - `resources.ts`: Managed text resource references, roots, read/create payloads, and artifact effect boundaries.
  - `configuration.ts`: Declarative configuration contracts, field bounds, secret references, and non-coercing validation results.
  - `files.ts`: Managed routine text file pages, calls, and acknowledgements preserving Unicode/BOM/CRLF.
- **Verification**:
  - `npm run check` runs Biome format check, TypeScript typecheck, 14 contract tests (`packages/contracts/test/*.test.ts`), build, and JSON Schema drift verification (`packages/contracts/schemas/*.schema.json`).
