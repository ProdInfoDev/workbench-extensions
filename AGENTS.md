# Agent Instructions — `workbench-extensions` (`ProdInfoDev/workbench-extensions`)

## Role of This Repository

`workbench-extensions` is the **Public MIT Extension Contracts & SDK Repository** (`@prodinfo/extension-contracts`) for the 5-repository ProdInfo Workbench ecosystem.

### Strict Public / MIT Rules
1. **Public MIT Only**: Everything in this repository is public and MIT-licensed. Never copy proprietary source, internal host implementation details, customer data, or credentials into this repository.
2. **Self-Contained Build & Tests**: `npm run check` (`pnpm format:check && pnpm typecheck && pnpm test && pnpm build && node packages/contracts/scripts/schema.mjs --check`) must pass without any sibling checkout or private dependency.
3. **Downstream Pinning**: When `@prodinfo/extension-contracts` is updated and packed, update `vendor/contract-pin.json` in `ProdInfoDev/workbench-core`.

### Key Documentation
- [`docs/context.md`](docs/context.md) — Current state of `@prodinfo/extension-contracts`
- [`docs/module-contract.md`](docs/module-contract.md) — Public module contract specification (4 system roles `owner`, `admin`, `member`, `viewer`, `visibility: public | private`, `routines[].needs`, and declarative UI slots)
- [`docs/roadmap.md`](docs/roadmap.md) — Public extension contracts & connector SDK roadmap
- Central ecosystem roadmap & migration status: `../workbench-core/docs/roadmap.md`, `../workbench-core/docs/adr/0014-module-public-contract-and-console-access.md`, and `../workbench-core/docs/migration-roadmap.md`
