# Extensions current context

Updated: 2026-10-29. Single starting handoff; [roadmap](roadmap.md) is the sole task checklist.

## Current file-facade section

Alpha.5 adds [bounded routine text-file schemas/facade types](files.md): exact input metadata,
Unicode-preserving pages and one staged output stream. Public framing tests are synthetic; the
host owns all grants, quota, cancellation and atomic publication. Existing text/config/command
shapes remain unchanged. Source/packed artifacts are not npm publication or installed-host
acceptance. No private host source, customer fixture or native-path capability was added.

## Implemented first slice

Public datatoi/prodinfo-extensions now contains the experimental source package
`@prodinfo/extension-contracts` version `0.1.0-alpha.5` in [packages/contracts](../packages/contracts/README.md).
It provides strict operation/invocation/result/error schemas, inferred TypeScript declarations,
generated JSON Schema, bounded JSON validation/canonicalization and synthetic fixtures/tests.
Read/configure/createArtifact operations and completed results/errors are executable. Alpha.2
adds [managed text resource schemas](resources.md), exact refs and resource_limit/unavailable
outcomes. Root administration/host authority and namespace checks remain host responsibilities.
No package-registry publication, stable SDK/manifest, guest runner, jobs/events/telemetry API,
connector or live-provider compatibility is delivered. Broader [contract draft](contract-draft.md)
remains a proposal; executable source is canonical for the implemented subset.

The package is original public MIT code; no Accounting/Desktop implementation, private paths,
credentials or customer data were imported. Public build/test needs no private repository/token.
The private host consumes a packed, hash-pinned public artifact and exercises matching requests.
Packing/source commits do not publish to npm, certify a marketplace package or activate a routine.

## Development and validation

Node 24.x (local verification 24.1.0), pnpm 11.0.8, TypeScript 7.0.2, Zod 4.6.7 and Biome 2.6.2
are pinned. `pnpm install --frozen-lockfile --ignore-scripts`; `pnpm check` runs formatting,
typechecks, thirteen contract tests, declaration/JS build and generated-schema drift checks.
`pnpm generate` deliberately updates JSON Schema from source. GitHub checks are configured for
Linux/macOS/Windows with public dependencies only. Source
[CI](https://github.com/datatoi/prodinfo-extensions/actions/runs/40581754727) passed at 746775a
after enforcing LF text checkout; no contract runtime change was needed. Local checks passed on
macOS; Node emits its type-stripping experimental warning. No Windows/Linux
installer, real provider, complete SDK or normal PostgreSQL compatibility has been accepted.

## Alpha.2 resource contract section

Logical roots, digest-bound refs, exact UTF-8 create/read payloads and generated schemas now have
public tests. Text caps at 8 KiB; path/identity spoofing, excessive UTF-8, unpaired surrogates and
byte-count mismatch fail. JSON helpers were split into a dependency module so resource parsers
share them without a module cycle. Local seven-test/type/build/format/schema drift checks pass.
[Alpha.2 CI](https://github.com/datatoi/prodinfo-extensions/actions/runs/40653044117) passed at
46d54fc: seven tests/type/build/schema checks on Windows/macOS/Linux. Matching host namespace/quota
proof passed: reference host 2ecd1d4 has 49 tests and two built smoke paths on Windows/macOS/Linux,
plus 21 isolated PostgreSQL 18 cases. Exact live read refs are checked before dispatch and after await
before disclosure, including cached reads; missing grants deny. A synthetic CSV fixture preserves IDs/
CRLF through retained pins and host-published separate output. No npm
publish, guest write privilege, native directory binding or job lifecycle is implied.

## Alpha.3 configuration contract section

[Configuration declarations](configuration.md) add a bounded flat field grammar (string/number/
boolean/enum/resourceRef) and a pure non-coercing checker. Required/optional and empty/zero/false are
explicit. No arbitrary JSON Schema, regex, hooks, defaults, secret input or I/O. Issues contain only
declared field/code and a generic undeclared-field signal. Hosts must pin declarations/checks to
exact retained source/config content and independently enforce grants. Eleven local public tests,
format/type/build/generated-schema drift pass. [CI](https://github.com/datatoi/prodinfo-extensions/actions/runs/40658646831)
passed at 15e2e88 on Windows/macOS/Linux. Reference host 220709f passes 59 tests and two built smoke
paths on all three OS plus 30 isolated PG18 cases. It binds immutable declarations/checks to exact
source/config hashes, records independent activation CAS/history and verifies explicit owned input
refs. Edits/checks do not silently activate. Activation records do not provide execution admission.
There is no published SDK or activation/execution API in the public package.

## Alpha.4 execution-effect metadata

[Execution effects](execution-effects.md) distinguish durable submit and controlRun from read,
configure and createArtifact. The completed reply envelope is unchanged: queued-run admission may
be result data, not final run completion; no top-level accepted/job variant or public run projection
is added. Thirteen local public tests/type/build/schema drift pass.
[CI](https://github.com/datatoi/prodinfo-extensions/actions/runs/40665029899) passed at 18c1b14 on
Windows/macOS/Linux. Reference host 6f16218 passes 77 tests and three built smokes on all three OS
plus 41 isolated PG18 cases: durable one-step admission, current activation/input pins, exclusive
leases/capacity, takeover, broker/cache/post-flush fencing, cancel/checkpoint races and process-kill
recovery. A worker handoff race found in initial CI has deterministic regression coverage.
Run state/claims stay private; this contract slice adds no public run SDK or general workflow.
All actual authority/lease/cancellation checks remain host responsibilities.

## Reference host dispatcher proof

Reference host 11ce201 adds a bounded automatic dispatcher over the existing durable one-step queue.
Source CI passes 85 tests and three built smokes on Windows/macOS/Linux plus
48 isolated PostgreSQL 18 cases. Shared SQL capacity, heartbeat/cancellation, graceful drain, exact-claim
forced interruption, blocked-page rotation and uncertain-checkpoint quarantine are exercised.
Developer execution is opt-in, independent of HTTP/browser lifetime; no installed OS service,
scheduler or durable waits were delivered by that slice. Public alpha.4, its source artifact and guest authority
are unchanged. No public run projection/SDK or manifest permission is inferred from private proof.

## Reference host input-checkpoint proof

Reference host 6d0212d adds one owner-only durable text-input checkpoint to its existing run engine.
The declaration/source pins, checkpoint and answer survive host loss; a new VM resumes from retained
state with no worker/SQL held while waiting. Revisions/current authority fence answers; deadlines,
cancellation, bounded per-phase recovery and uncertain acknowledgements retain explicit outcomes.
Source CI passes 96 tests and three built smokes on Windows/macOS/Linux plus all 56 isolated PG18 cases.
That slice preceded the bounded item-batch proof below. The complete public workflow gate remains
open. This is a private
experimental host protocol, not a new public alpha.4 schema/SDK, capture task or generic form API.

## Reference host independent item-batch proof

Reference host 11766b9 composes up to eight independent item runs under an immutable atomic manifest.
Each item uses the existing claims/input tasks/checkpoints; parent progress is derived with real
counts and state-digest cancellation preserves terminal outcomes. A killed host resumes only the
waiting item, leaving the completed item's result and attempt count unchanged. Local verification
passes 107 source tests and three built smokes. Source CI passes on Windows/macOS/Linux plus all
65 isolated PostgreSQL 18 cases.
Its growing private operator catalog now pages within the existing JSON limits. Public alpha.4,
artifact and guest authority remain unchanged. This is bounded host proof, not a released public
batch schema/SDK, general workflow graph or inbox/event/notification implementation.

## Reference host owner attention proof

Reference host dfa46a7 adds a bounded owner/workspace/config input-task query over existing run/batch
facts. Live deadline cursors carry exact task/run revisions and item refs; current advisory answer
status is separate from commercial execution availability. Discovery does not answer/dismiss work
or disclose input/checkpoint/answer/result bodies. Local checks pass 114 tests and three built
smokes. Source CI passes on Windows/macOS/Linux plus all 72 isolated PG18 cases. The index-only
schema migration preserves
source facts/receipts. The private paged catalog has 34 operations; alpha.4/artifact and guest grants
are unchanged. Read state, outbox, external notifications and UI were absent in this earlier slice;
the transactional inbox proof below supersedes its outbox status.

## Reference host transactional inbox proof

Reference host 32bb001 records hash-bound run-transition facts atomically with source changes and
consumes committed workspace order into owner input-needed/terminal-update notices. A durable bounded
checkpoint survives restart and concurrent consumers; historical attention notices recheck current
task resolution without answering it. Source CI passes 124 tests/three built smokes on
Windows/macOS/Linux plus all 82 isolated PG18 cases. A killed host retains notices and resumes only its waiting batch item.
Schema migration preserves prior work/receipts without fabricating old notification events; live
attention still discovers old waiting work. Read flags follow in the proof below; aggregate batch
notices, team audiences, external delivery, UI and broader tracing remain open. Alpha.4/artifact and guest grants are unchanged.
No public event/inbox SDK, package publication or provider send is added.

## Reference host owner read-state proof

Reference host 867fb86 adds explicit owner read/unread flags with revision-checked updates, current
authority and bounded flag queries for visible notice IDs. Read marks do not resolve tasks, move the
event cursor or repeat run facts. Consumer replay/new outcomes, process loss and migration preserve
the distinction between presentation state and work. Existing inbox page contracts/receipts remain
compatible. Source CI passes 131 tests/three built smokes on Windows/macOS/Linux plus all 89
isolated PG18 cases.
Unread paging/counts, bulk changes, snooze/archive, team audiences and projection rebuild remain open.
The next proof adds synthetic delivery admission; actual transport remains open. Alpha.4/artifact and guest grants are unchanged; no public inbox API or provider is added.

## Reference host synthetic notification-admission proof

Reference host 57e2164 adds immutable owner route drafts, passive checks, independent activation
and durable reservations against separate cached channel allowances. One synthetic target reserves
one unit; SQL accounting and logical source/owner/route identity prevent double reservation.
Placement, target/meter, current authority and open-input checks gate new admission. Existing
reservations retain old pins across edits and remain metadata, not a dispatch grant. Local checks
pass 141 tests/three built smokes; source CI passes on Windows/macOS/Linux plus all 100 isolated
PG18 cases.
That admission slice delivered no actual transport, automatic router, worker attempts or backend
plan/allocation adapter. The next proof adds synthetic attempts only. Numeric fixture values are not commercial plans.
Public alpha.4/artifact and guest scope are unchanged; adapters and stable notification APIs stay open.

## Reference host synthetic delivery-worker proof

Reference host a8d6f12 adds DB-clock attempt leases, a durable dispatch marker, current dispatch
checks, bounded known-rejection retries and conservative uncertain outcomes. Held/spent/released
accounting follows the attempt/evidence transaction. Owner status/control/recovery and reviewed
synthetic reconciliation remain separate from workflow input and admission snapshots.
Source CI passes 157 tests/three built smokes on Windows/macOS/Linux plus all 114 isolated PG18 cases.
Killed-host proofs
cover undispatched, potentially accepted and checkpointed acceptance windows with a local fixture
ledger; worker tokens stay private. The opt-in developer executor uses simulated transport only.
That worker slice did not add automatic routing; the follow-up below does. Real secret/recipient/
disclosure brokers, provider evidence, cross-install limits and live adapters remain open.
Public alpha.4/artifact/guest grants are unchanged; no notification SDK or real external delivery is released.

## Reference host automatic notification-routing proof

Reference host 60217ef adds explicit future-event owner opt-in and durable metadata-only requests.
Route/target pins and commit-ordered cursors prevent historical rebroadcast or silent redirection.
Channel policy/quota waits preserve requests without reserving units or blocking inbox/task handling.
Automatic-origin checks stop unsent work after disable/rebind while preserving manual ownership
when logical deduplication finds an existing manual delivery. Admission status remains distinct from
actual attempt/provider acceptance. Source CI passes 170 tests/three built smokes on
Windows/macOS/Linux plus all 126 isolated PG18 cases.
Three killed-process boundaries, additive migration and real host/built JS exercise recovery.
The PG suite now has 126 cases, including capture/admission, disable and source-commit pool races.
Public alpha.4/artifact/guest grants are unchanged. No notification schema, sender SDK, real channel,
secret/recipient/disclosure broker, retention service or external delivery is released.

## Reference host scoped synthetic transport proof

Reference host a617f36 adds exact target-bound trusted adapter/private recipient/credential access,
an explicit reference-metadata disclosure profile and one-shot transport scopes. Current roles,
bindings, expiry and abort fence private access. Raw credentials/recipients/errors/receipts stay
outside operator/routine output; opaque attempt evidence and quota settle atomically. Old accepted
work does not acquire invented evidence, and restart retains new evidence without restoring secrets.
Source CI passes 180 tests/three built checks on Windows/macOS/Linux plus all 135 isolated PG18 cases.
Migration, killed-process recovery, actual host/built JS and a new pool race cover the boundary.
This is dummy in-memory trusted setup, not a production vault, verified uploaded-adapter loader,
real provider, public notification/secret schema or SDK release. Alpha.4/artifact/guest grants remain unchanged.

## Notification and attention direction — proposal

[Notification design](notifications.md) adds configurable Discord and future platform EmailService
adapters over durable core inbox/task/outbox facts. Keep read/dismiss separate from resolving work,
scoped UI intents separate from command grants, and provider acceptance separate from actual receipt.
Plan-backed outgoing allowance must preserve unresolved attention. Confirmed: inbox/manual task
responses are on every plan; admins configure separate channel-type/placement policies and
allowances, including optional Free/local Discord. This supersedes blanket paid-only messaging.
Email/SMS/future channels have their own meters; numeric values remain undecided.
Mobile push/control stays later. No alpha.4 artifact, provider code or runtime schema changes.
This docs-only section passes format/link/checklist/disclosure checks; source tests were not rerun.

## Accepted capture direction — design only

[Capture proposal](browser-capture.md) records start/mid-run durable operator capture tasks and
separate continued-browser grants. Session credentials remain host-held. Local-only applies to
cloud AI, remote runners, logs/support and backups as well as sync/export; explicit scoped transfer
may permit selected data without sharing the browser session. No alpha.4 runtime/SDK change or
capture/disclosure enforcement is added. The text-checkpoint foundation now exists; capture-specific
task refs/disclosure checks and larger artifacts still need proof.

## Ownership and unchanged requirements

This repository owns public schemas/SDK/helpers, mocks/conformance, synthetic examples and all new
integration-specific routines/destination adapters. Private host internals/admin schemas remain
private. No separate contracts repository or shared Accounting DB. New official connectors remain
public; customer/team routines can remain in an enterprise-local registry. Public cloning/building
must never require a private checkout or customer samples. Keep existing Standard Integration API
wire ownership separate; this package is not a replacement protocol for existing shop plugins.

Definitions/config forms/actions are declarations. Host policy enforces every capability, current
identity/authority and effect, regardless of a modified SDK or publisher signature. Guests will use
bounded host operations without ambient Node/SQL/files/network. Code/config/draft/activation/run
pins stay distinct. Team registry publication, Git history, configuration-file backup and activation
are different operations. No cloud configuration-backup dependency is introduced.

Task-level operator console delegation can cover ordinary UI operations without per-save approval;
public guest projection remains narrower. Credentials/self-authority changes stay protected. Current
experimental metadata covers descriptions/schemas/effect/capabilities/delegability, not a complete
availability/precondition/recovery schema. Telemetry/state/resources/event/lifecycle refinements in
the design docs remain unimplemented acceptance requirements, added alongside tested capabilities.

## Planned shared progress and interactive tasks

User requests generic routine stages/progress, retry/restart, approvals/mid-run item input and batch
processing, with optional home views. [Execution draft](routine-execution.md) defines proposed
author semantics: host-owned run/step/item/attempt state, honest unknown-total progress, durable
schema/audience/revision-bound tasks, safe subset recovery and explicit follow-up runs. Waiting
releases execution capacity; one item's question need not block unrelated items under batch policy.

Every routine gets standard progress/attention/recovery views. Optional declarative cards/tables/
forms/actions extend a routine home page; uploaded React/JS is excluded from trusted UI. Fully custom
executable views are separate future scope. Console and manual paths share the same policy/actions.
That execution-design update added no runtime schemas, published artifact or SDK methods.
Docs checks/content scan pass; existing source tests/CI are historical and were not rerun for prose.

## Local/hosted plans, metered AI and paid packages — design only

The host direction now includes BE-provisioned subscriptions/installations/domains, isolated hosted
workspace DB/files/context/executors, shared hosted AI and optional setup/context backup images.
Local rights refresh at activation/restart and plan expiry and are checked from cache on task
admission; no external entitlement check per task. Hosted AI calls use an account/gateway for credit
reservations and trusted token-based settlement, including console, enrichment and child routines.
Token usage and credit charges differ; rates/grants and financial precision belong to the platform.

Credit admission is now proposed as soft estimates plus finite approved tolerance, with strict
maximum authorization for explicit hard spending caps. Ordinary credit/accounting shortage should
checkpoint/wait and resume, preserving completed items/results and pending settlement. An admitted
bounded call is not killed solely for crossing its estimate; retries must not duplicate AI calls or
charges. This does not relax tenant/credential authority or executor/resource caps.

These are host/platform responsibilities. A package purchase/free status/certification grants no
filesystem/network/admin capability. Package limits, budget/availability and expired-rights outcomes
need executable public conformance before new SDK shapes. Same author contract should work locally
and hosted within the assigned workspace and brokered web scope. The public SDK/official open-source
integrations remain public; independently licensed paid offerings have separate distribution terms.
The billing design update adds no runtime schema, provider or publication.
Public docs/content checks pass; existing source CI was not rerun for prose.

## Next

Keep E1 open overall. Expand conformance with the real core: server-PG/PGlite recovery/transaction
parity, state/resource scope, cancellation and bounded isolated guest execution. Introduce durable
job/config/package/event contracts only with matching host proof. UI/config/console interfaces and
provider-specific plans follow the core. Source sharing/marketplace publication/OS acceptance retain
their own gates; no provider or future operation exists merely because it appears in the draft.
