# Experimental execution effects

28 October 2026. Alpha.4 extends operation metadata with submit and controlRun. Canonical enums
remain in [index.ts](../packages/contracts/src/index.ts), with generated schema and synthetic tests.
There is no stable run/job schema, guest submission API or complete workflow SDK in this revision.

submit means durable admission of work. A successful short command reply acknowledges admission;
it is not completion of that work. controlRun means changing existing run execution state, such as
cancellation. These effects are distinct from read, configuration edits, managed artifact creation
and external provider delivery. A host must independently enforce current capability, workspace,
version/input pins, policy and state/lease boundaries. Metadata or a manifest grants nothing.

The completed result/error envelope is unchanged. A host may return an admitted run reference as
result data and expose status/result through its own tested operations. No top-level accepted/job
variant is introduced here. Do not infer job success from a result describing queued work. Specific
run states, projection fields, broker claims, retries and durable waits require matching host proof
before becoming public author contracts. Old clients must refuse unknown effects, never relabel
submission as configure or assume it is safe to retry with a different request identity.

Thirteen public tests/type/build/format/generated-schema checks pass locally. The two added cases
cover explicit effects and the distinction between admission result data and an unsupported
accepted-job envelope. [CI](https://github.com/datatoi/prodinfo-extensions/actions/runs/40665029899)
passed at 18c1b14 on Windows/macOS/Linux. Reference host 6f16218 passes 77 tests and three built
smokes on all three OS plus 41 isolated PG18 cases. It proves durable one-step admission/current
pins, claims/capacity, broker/result fencing, cancellation/takeover and process-kill recovery.
Host run schemas/claim tokens stay private; alpha.4 specifies no dispatcher or complete workflow.
No npm/marketplace publication,
installed service, scheduler or live provider support is added. Source is original MIT code with
synthetic fixtures and no private checkout dependency.

A later reference-host proof (11ce201) adds opt-in bounded automatic execution over those same private
claims/checkpoints. Source CI passes 85 tests and three built smokes on Windows/macOS/Linux plus
48 isolated PG18 cases. Shared capacity, lease heartbeat, current-security cancellation, graceful drain, exact-claim
forced stop and uncertain checkpoint quarantine remain host duties. This does not change alpha.4
or provide a public run SDK, scheduler, browser capture or durable human-wait API.

Reference host 32bb001 now adds private transactional run facts and a restart-safe owner inbox
consumer over the same run engine. A notice describes a committed transition, not delivery, approval
or a grant to control work. Historical input notices recheck source resolution; live attention supplies
current form/control refs. Source CI passes 124 tests/three smokes on Windows/macOS/Linux plus all
82 isolated PG18 cases.
No event/inbox schema, channel adapter or guest subscription capability is added to alpha.4.

Reference host 867fb86 adds revision-checked owner read/unread presentation flags. These updates use
configure, not controlRun: task resolution, source facts and current answer authority remain separate.
Source CI passes 131 tests/three smokes on Windows/macOS/Linux plus all 89 isolated PG18 cases.
Existing page replies stay compatible, and alpha.4 gains no inbox, notification or guest subscription API.

Reference host 57e2164 uses submit for synthetic notification reservation admission under an explicit
active owner route. It atomically reserves a separate channel unit and retains source/route/target
pins; its completed reply reports reservation, not sending. Source CI passes 141 tests/three smokes
on Windows/macOS/Linux plus all 100 isolated PG18 cases. Send attempts, uncertain external outcomes and provider
acceptance still need a worker/transport proof. Alpha.4 gains no notification schema or guest sender.

Reference host a8d6f12 uses controlRun for owner cancellation, expired-lease recovery and reviewed
synthetic uncertainty reconciliation. Actual delivery-attempt status is distinct from an immutable
admission reply. Known rejection may retry; missing/ambiguous acceptance never implies permission
to resend or refund. Source CI passes 157 tests/three smokes on Windows/macOS/Linux plus all 114
isolated PG18 cases.
The public artifact and guest grants remain unchanged; there is no released notification SDK,
provider transport or exactly-once external delivery guarantee.

Reference host 60217ef adds private owner configuration and request control/recheck over durable
future-event routing. Deferred admission has no reserved unit; admitted request metadata points to
separate delivery-attempt truth. Changing automation cannot redirect retained pins or take control
of a manually deduplicated delivery. Source CI passes 170 tests/three smokes on Windows/macOS/Linux
plus all 126 isolated PG18 cases. Alpha.4 gains no notification API or additional guest capabilities.

Reference host a617f36 adds safe private operator inspection of scoped synthetic transport and
retained attempt evidence. Current roles/binding/expiry fence private access; copied or cross-claim
receipts cannot checkpoint and late acceptance cannot overwrite uncertainty. Quota/outcome/evidence
commit together. Source CI passes 180 tests/three built checks on Windows/macOS/Linux plus all 135
isolated PG18 cases. No production secret vault, public sender/secret API, uploaded-adapter privilege
or real external acceptance is released. The public artifact and guest grants stay unchanged.
