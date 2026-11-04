# Public extension architecture

Design target with a first experimental [command subset](../packages/contracts/README.md);
no stable SDK or package-registry release. See [contract scope](contract-scope.md)
and [compatibility](compatibility.md) before implementing or naming public API fields.

## Package roles

A connector describes and implements integration-specific discovery/read/intake/delivery behavior.
A routine orchestrates supported operations and can use connectors. Both use checked TypeScript,
a versioned manifest, configuration/action schemas, declared capabilities and tests. New official destination
implementations, profiles and workflows are open-source here. A third party can publish
its own compatible package from another repository.

The private host owns canonical records, source identities, schema/plan/evidence validation,
configuration instances, credentials, queues/leases, event delivery, durable receipts and review.
SDK calls are checked against effective actor/package/config/workspace grants. Guest code cannot
self-activate, choose another package's state namespace or bypass review with raw DB writes.

## Configuration and GUI actions

Declare config schemas, form hints and typed sandbox action exports. The host renders settings
and buttons, validates inputs and invokes an action under policy. Values such as selected catalog
options come from authorized action results. Rendering/saving settings does not perform I/O, and
arbitrary package React/JS is not inserted into the trusted UI.

Connection checks/discovery are scoped external reads; pulls may separately submit typed intake.
Preview uses fixtures or an explicitly bounded read-only test; Run may have separately authorized
write effects. Long actions return durable job handles/results rather than rely on a settings
page staying mounted. Package version, config revision and observed outcome must stay linked.

## Runtime and workflow lifetime

Guest code has a constrained SDK, no ambient Node filesystem/process/environment/network/DB APIs
and no raw credentials. The host brokers allowed transport/model/state/domain operations. Types
and a package signature are not enforcement; runtime input/output, scope and budget checks remain.
No unrestricted npm support or direct database ownership is promised by a TypeScript author API.

A bounded sandbox attempt is separate from a durable workflow. Use stable job/step keys and saved
results to survive restart and avoid repeating effects. A provider timeout may mean an uncertain
outcome, requiring a receipt/reconciliation rather than an unconditional retry. Exact protocols and
limits will be defined with executable host conformance.

[Execution/interaction draft](routine-execution.md) specifies one shared run/step/item/attempt and
task model for progress, mid-run input/approval, batches and recovery. Long waits persist state and
release VM/worker/transaction capacity. Default host views work for every routine; optional
declarative routine home cards/forms/actions extend them without executing arbitrary package UI.

## Events, state and AI authoring

Subscribe to declared, versioned committed-domain events through the host; receiving an event does
not grant wider data access. Use revision-bound references, idempotency and origin/recursion limits.
Scoped activity/diagnostic evidence helps the console explain failures and improve workflows but
is not a substitute trigger bus or unfiltered customer telemetry.

Package state persists per installation/config through typed host operations. It is separate from
immutable run history and canonical records. Declared logical tables/indexes/migrations may be
added later, with quotas and compatibility checks; no raw SQL/DDL capability is implied.

Predefined workflows are starting points. The console can fork a version into a managed draft,
patch code/config/tests, validate types/schemas and test fixtures/approved samples. Changed authority,
activation, deployment, scheduling and external effects require explicit host policy, not simply
successful compilation. Share reusable sources/synthetic fixtures without customer data or secrets.

## Team registry and project resources

An enterprise may host its own registry for in-house source/build/test versions. Git-compatible
history manages project development; immutable registry versions manage distribution. Publishing
or editing shared sources does not alter existing activations/runs. A public marketplace is optional,
and private team code is not automatically public. The host owns registry administration/access.

Routines can use project defaults or their own named input/output/work roots. Host bindings resolve
those names to approved local/server resources, with immutable input snapshots and per-run outputs.
Artifacts and source files differ from durable queue/step state. See [contract draft](contract-draft.md)
for proposed semantics; no root-binding schema or filesystem API is released yet.

## Unified activity with routine-part context

Use host-stamped OpenTelemetry-compatible context and bounded structured diagnostic messages,
with stable routine part labels and exact code/config/run/attempt refs. The host can correlate
command/queue/worker/model/connector activity through one permission-aware query surface, while
keeping domain events, audit receipts and diagnostic/trace retention distinct. See the canonical
[telemetry proposal](telemetry-draft.md); no logging SDK or query API is released yet.

## UI-equivalent operator automation

The core operation model supports both UI and a delegated operator console. Meaningful UI actions
must not hide business mutations outside typed core operations. Routine/task/connection state,
validation/preview, availability/reason and recovery metadata are machine-readable. A user may
delegate configure/launch/inspect/correct/relaunch across a workspace/project/task, while credential
entry/authority changes remain protected. Guest packages receive only their effective narrower
capabilities. See [contract draft](contract-draft.md); the experimental operation schema currently
implements only a delegability flag, not the complete automation/availability/recovery contract.

## Local/hosted workspaces and paid availability

One public author contract should work against a local, customer-server or hosted workspace. The
host derives workspace/actor/package/config/run identity; callers cannot select another tenant's
DB/files/context or interpret arbitrary absolute paths. Hosted shared AI does not share prompts,
context or credentials across tenants. Model calls request bounded resources through the host and
its metered gateway; no guest-supplied token count can create a charge or enlarge a budget.

Free/open-source, paid and certified packages use the same capability and sandbox rules. Commercial
availability, download/update rights and runtime activation/grants are separate; purchase never
auto-activates a version. Expired/insufficient budget outcomes need explicit availability/recovery
semantics when the corresponding public schema becomes executable. Ordinary credit/accounting
shortage should checkpoint/wait/resume without discarding results or crashing the process; admitted
bounded calls may finish under finite tolerance. Strict spending/security caps remain explicit.
No plan/payment/backup API is
part of alpha.1. Subscription provisioning and accounting implementation stay with the platform,
not in uploaded packages or a required private build dependency.
