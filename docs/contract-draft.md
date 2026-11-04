# Extension and core boundary — contract draft for review

Draft 0, 27 October 2026. Broader review proposal, not a published SDK or stable wire protocol.
The [executable subset](../packages/contracts/README.md), `0.1.0-alpha.4`, covers read/configure/
createArtifact/submit/controlRun operations, managed text resources, flat configuration checks,
invocations and completed results/errors. Its source owns those actual shapes/limits.
Package/action/job/state/event sketches below remain illustrative and unimplemented; in particular,
the accepted-job reply and broader effect/recovery variants below are not in the first subset.
HTTP paths, operation IDs, package names and release versions are intentionally not fixed here.

## Contract layers

| Layer | Purpose | Owner |
|---|---|---|
| Module/operation metadata | Describe supported schema/effect/scope/error behavior for discovery | Public definitions; trusted host registration/policy |
| Package manifest | Sources/resources, compatibility, config/actions and requested capabilities | Public contract, package publisher content |
| Invocation/result | Bounded validated call, idempotency key, accepted job/result or error | Public SDK contract, host-enforced admission |
| Run/job handle | Durable identity/status/cancel/result; no long-lived VM or UI request | Public projections backed by core execution |
| Config/state/event | Exact config revision, scoped state, committed event reference | Public subset backed by core domain rules |
| Internal administration | Installation/policy/credential details not granted to a package | Private host; not silently exposed through SDK |

Keep package code/config/run/activation, source IDs and request/event correlation IDs distinct.
Every caller uses the same domain operations, but an extension receives only its authorized public
projection; private UI administration is not automatically part of its catalog.

## Proposed declaration shapes

```ts
// Review sketch only. Exact fields/limits/schema dialect require executable conformance.
type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type Schema = { [key: string]: Json };
type Effect =
  | "read" | "draft" | "configure" | "submit"
  | "apply" | "externalWrite" | "activate" | "schedule";

interface OperationDescription {
  id: string;
  version: string;
  title: string;
  description: string;
  inputSchema: Schema;
  outputSchema: Schema;
  effect: Effect;
  requiredCapabilities: string[];
  // Host policy can narrow this declaration; it is not an execution grant.
  automation?: { delegable: boolean; protectedReason?: string };
  // Preconditions/availability/preview/recovery need structured definitions before release.
}

interface ActionDescription {
  id: string;
  title: string;
  exportName: string;
  inputSchema: Schema;
  outputSchema: Schema;
  effect: Effect;
  requiredCapabilities: string[];
}

interface PackageDescription {
  id: string;
  version: string;
  kind: "routine" | "connector";
  hostCompatibility: string;
  sdkCompatibility: string;
  sources: string[];
  requestedCapabilities: string[];
  configSchema: Schema;
  actions: ActionDescription[];
  // Resource, form-hint, state-migration and event declarations are separate schema work.
}

interface Invocation {
  requestId: string;
  operationId: string;
  operationVersion: string;
  input: Json;
}

type Reply =
  | { kind: "result"; requestId: string; receiptId: string; value: Json }
  | { kind: "accepted"; requestId: string; receiptId: string; jobId: string }
  | { kind: "error"; requestId: string; code: string; message: string;
      recovery: "correctInput" | "retrySameRequest" | "reconcile" | "stop" };
```

These declarations request behavior; they grant none. The host derives actor/workspace/package/
activation/config/run authority from authenticated execution, not fields asserted in guest input.
Caller-controlled input must not choose its own identity, state owner, credentials or host policy.
Action effect labels are checked against the operation actually invoked; a label cannot disguise a
write as read. An accepted reply proves durable admission, not external delivery or completed work.

## Semantics to make executable first

| Area | Required behavior |
|---|---|
| Validation/version | Unknown operations/versions, malformed or excessive input and unsupported schemas fail clearly |
| Replay | Same request ID and effective input/version returns the prior result/handle; changed content conflicts |
| Disclosure | Read is data access; catalogs and results are filtered by effective actor/package/workspace scope |
| Operational parity | Meaningful UI actions have typed core operations; console delegation can execute them under the same domain rules |
| Transparent entities | Describe tasks/routines/connections/config/results with capabilities, schemas, validation, availability reasons and recovery |
| Delegation | Grant a bounded workspace/project/task scope once; inside-scope actions need no manual click per save/run |
| Protected actions | Credential/authority interactions are explicit host-policy exceptions; caller metadata cannot self-authorize |
| Correct and relaunch | Unchanged retries/resume use receipts/steps; changed code/input/config creates a new pinned run with lineage |
| Configuration | Config instance/revision is host-owned; secrets are opaque refs; edits stale prior check results |
| GUI actions | Host renders declarations; explicit action invocation performs work; render/save does not call a provider |
| Long work | Submission returns a job; job/step/attempt pins survive client/VM lifetime and host restart |
| State | Derived installation/config namespace, bounded typed operations/CAS; no raw SQL/DDL or arbitrary absolute path choice |
| Resources | Named project/routine input/output/work bindings; host-resolved locations, input snapshots and run-scoped outputs |
| Source/registry | Checked immutable sources/build/resources; Git/working-tree changes and team publication do not replace active pins |
| Runners | Workspace owns authoritative job/step/receipt state; an execution attempt/cache cannot become a second authority |
| Events | Committed versioned facts with scoped refs; subscription pins config/routine/grants and duplicate identity |
| Diagnostics/traces | Host-stamped context, structured bounded routine messages/parts and permission-aware queries; logs do not impersonate core facts |
| Effects | Lost external acknowledgement requires receipt/reconciliation; a workflow replay is not an unconditional resend |
| Evidence | References pin immutable retained content/revisions; an arbitrary URL or quote is not validation |
| Cancellation | Stop admission/attempt where supported and fence late commits; do not claim remote effects were undone |

First fixture: one declared config + action, a synthetic bounded read/transform, a durable job handle
and replay/scope failures. Prove core behavior with a CLI/test client before building a configuration
GUI, AI console or real provider adapter. Keep schema breadth minimal; add capabilities only with
host implementation and public conformance rather than publish a speculative all-powerful SDK.

## Destination-specific contract expansion after the core

A connector checks/discovers/pulls against its selected connection and delivers only an assigned,
reviewed pinned payload. The host brokers targets/credentials, validates reference/schema constraints
and records per-item outcomes. Source intake retains opaque system/account/catalog/entity/item/
variant identity. Provisioning a target reference is distinct from selecting an existing value.
Broker acknowledgement, provider acceptance, final publication and remote identity need honest
separate semantics. The existing Standard Integration API is preserved, not redefined by this draft.

Specific actions, methods, pagination, receipt states and transport fields will get an executable
schema and detailed adapter roadmap after the first core passes. No real integration support or
compatibility version is implied by the sketch above.

## Projects, source sharing and file bindings

Packages may come from a public repository, an enterprise-local registry or a private managed draft.
A team can keep in-house TypeScript source, helpers/config/tests and immutable checked versions
without public/cloud publication. Git-compatible project history is separate from registry release,
workspace activation and job checkpoints. Runners execute pinned content, not a mutable Git branch.
Neither a shared folder nor package publication transfers execution grants or credentials.

Project/routine input/output/scratch roots are host configuration. Public declarations use logical
resource names, bounded relative-member operations and declared output artifacts; the host resolves
approved locations on the selected execution host. No arbitrary absolute path or process working-
directory access is implied. Inputs are pinned; outputs are isolated/finalized per run and retries
must not silently overwrite user files. Remote execution needs remote bindings or explicit transfer,
not interpretation of a workstation path. The first logical-root/immutable-text subset is executable
in [alpha.2 resources](resources.md); broader native/project/run bindings remain draft.

Persistence engine and registry administration are host details. Keep storage types/credentials out
of the author SDK; identical contracts should work against a local service or shared team workspace.
When state is shared, execution agents report to one workspace authority and must respect lease/
revision fencing on reconnect. No multi-master DB synchronization is promised by package sharing.

## Activity/trace instrumentation

[Telemetry draft](telemetry-draft.md) owns the proposed extension logger/part/correlation boundary.
Use host-bound context and standard trace/span conventions with package/config/run/attempt/step
identity. Retained activity and configuration queries are scoped; secrets remain opaque. A central
query surface does not equate diagnostics with transaction/audit receipts or event-trigger authority.

## Operator console versus guest authority

The application console acts for an authenticated user and should support almost all ordinary UI
business/configuration actions: create/configure, validate/test, launch, inspect results, correct,
resume/retry/relaunch, publish/install/activate and schedule or deliver when delegated. A downloaded
routine receives a narrower guest projection; near UI parity does not give every package operator
rights or expose private administration automatically. Both call the same validated domain service.

Metadata must make schemas/effects, effective scope/preconditions, availability/denial reason,
validation/preview and recovery discoverable. Protected exceptions have an explicit policy/reason.
Operation metadata proposes requirements; host policy/grants decide actual execution. Raw secrets
and the AI expanding its own authority are not ordinary delegated operations. The host may allow
broad task/workspace automation without confirmation for each already authorized edit/test/run;
separate activation/apply/delivery outcomes do not imply blanket human-only execution.

## Lifecycle and recovery acceptance from design review

[Routine execution/interaction](routine-execution.md) now elaborates the planned run/step/item/
attempt model, universal progress, durable input/approval tasks, batch policies and optional
declarative routine views. These are not supported by alpha.2's completed-command/resource contract.
Exact schemas/SDK methods follow C2 host conformance; no arbitrary guest UI code is implied.

Review-only refinements, not new stable fields or callable methods. Add each conformance group when
its capability becomes executable; the first minimal schema need not implement every group.

| Concern | Required author/host semantics |
|---|---|
| Replay visibility | Partition requests by authenticated workspace/principal/operation; repeat reads still require current authorization, not merely possession of a request ID |
| Authority changes | Historical run/config/grant pins preserve evidence; revocation/expiry stops future unauthorized broker effects and does not undo an in-flight provider write |
| Builds/dependencies | Start with declared restricted imports, exact dependency/resource digests and checked source/build identity; unsupported imports or install hooks fail explicitly |
| Version/state lifecycle | Deactivation blocks new admission; removal retains referenced versions/state/artifacts or explicitly cancels/quarantines dependent work; failed migration and rollback preserve recoverable state |
| Bounded execution | Query pages, host calls, parsers, outputs and model/child/retry budgets are bounded; one package cannot starve cancellation/lease renewal |
| Timers/events | Explicit interval slot/missed/overlap/retry policy; supported event versions, cursor/replay/deduplication and failed-event quarantine/recovery; calendar support is separately declared |
| Effect recovery | Test crashes around child admission and provider acceptance/receipt persistence; stable logical effect keys and broker attempt checks preserve honest uncertain outcomes |
| Data evolution | Pin schema/field/mapping versions; reject stale field targets. Consumer-defined exports preserve literal IDs/format and disclose any spreadsheet-specific transformations |
| Evidence/quality | Valid JSON/test completion is not factual accuracy; retained evidence, uncertainty, protected-value and baseline/candidate evaluation policies remain host/domain responsibilities |
| Network capability | Public-web acquisition and approved private/LAN destinations have distinct broker policies; unsupported search/browser/protocol/library features report unavailability |

Neither an SDK, signature nor successful fixtures grant capabilities. A package can supply a
workflow only when the host actually provides its declared primitives; use an explicit external
service boundary for unsupported integration requirements rather than privileged guest imports.


## Executable configuration subset

[Alpha.3](configuration.md) now owns a bounded flat declaration and pure checker. The broader
manifest, config-instance lifecycle and action/transport semantics above remain proposals. This
subset does not run validation scripts, infer authority from declarations or provide credentials.
