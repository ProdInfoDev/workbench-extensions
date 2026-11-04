# Workbench Extensions

Public home for the ProdInfo Workbench extension contracts, TypeScript SDK, official routines and destination
connectors (`ProdInfoDev/workbench-extensions`). Build configurable integrations, modules (`workbench-data`,
`workbench-crm`, `workbench-accounting`, custom `x_<id>`) and workflows against the documented host capability API
(`workbench-core`).
The Workbench Core host application is private; extension development does not require its source.

**Status:** first experimental command contract implemented, 28 October 2026.
[@prodinfo/extension-contracts](packages/contracts/README.md) `0.1.0-alpha.4` has strict schemas,
generated types/JSON Schema and synthetic tests. No stable SDK, connector or npm release yet.

For development: Node 24.x, `pnpm install --frozen-lockfile --ignore-scripts`, then `pnpm check`.
`pnpm generate` updates schema artifacts deliberately. Public checks require no private checkout.

## Start here

The current plan is **contracts → headless core → integration/UI interfaces**. The architecture is
under review; detailed screen/provider plans follow core validation.

- [Current context](docs/context.md) — single handoff for this repository.
- [Roadmap](docs/roadmap.md) — the only implementation checklist.
- [Extension architecture](docs/architecture.md) — packages, actions, config and sandbox boundary.
- [Contract draft for review](docs/contract-draft.md) — proposed shapes and core acceptance.
- [Telemetry draft](docs/telemetry-draft.md) — routine parts, logs, trace context and query semantics.
- [Execution/interaction draft](docs/routine-execution.md) — shared progress, batches, input/approval tasks and optional views.
- [Public contract scope](docs/contract-scope.md) — what is public and who owns the definitions.
- [Compatibility](docs/compatibility.md) — versions, checks and release expectations.
- [Contributing](CONTRIBUTING.md) — source, tests and publication expectations.

## Planned layout

```text
packages/contracts/       canonical manifest/config/action/capability/result/event/state schemas
packages/sdk/             generated TypeScript API and pure author helpers
packages/testing/         mock host, synthetic fixtures and conformance tooling
extensions/               independently versioned official connectors and workflow packages
examples/                 minimal synthetic authoring examples
```

All new official destination-specific adapter logic, profiles and fixtures should live here.
Customer-authored in-house packages may stay private in an enterprise-local registry. The trusted host
owns execution policy, credentials, authorized transport, canonical records, queues and receipts.
Adapters can pull through an approved connection or deliver an assigned payload; they cannot read
arbitrary host data or bypass review. Configuration GUI actions and AI-authored routines use the
same supported operations as manual UI workflows.

Individual publishers may use their own repositories and compatible versioned artifacts. This repo
is not a requirement to host every marketplace package. Publication, certification and activation
are separate processes; no commercial distribution service is implemented by this bootstrap.

New original repository content is [MIT licensed](LICENSE). Reused third-party material retains its
own license/NOTICE obligations and must be reviewed before import. No customer data or private host
source is included.

[Alpha.2 managed text resources](docs/resources.md) add logical roots and exact text refs; no raw
filesystem/guest-write or durable-job capability is implied.


[Alpha.3 configuration declarations](docs/configuration.md) add a small pure schema/check subset;
retained source/config binding, authority and activation remain host responsibilities.
