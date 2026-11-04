# Extensions roadmap — contract first, interfaces after the core

Draft 1 for review, 27 October 2026. Sole task checklist. Keep milestones coarse until a working
host proves the boundary; detailed connector/action GUI plans follow core acceptance.

## E0 — public foundation and review draft

- [x] Bootstrap public repo, MIT license for new material, contribution rules and doc ownership.
- [x] Record public contracts/SDK/testing/integration ownership and TypeScript/no-Rust requirement.
- [x] Draft module/package/action/invocation/result semantics in [contract draft](contract-draft.md).
- [x] Review lifecycle/failure gaps and record conformance requirements for authority changes,
  package dependencies/removal, timers/events, effect recovery and consumer-specific exports.
  This is design review only, not executable compatibility or a completed runtime milestone.
- [x] Start the authorized smallest command boundary as 0.1.0-alpha.1 source/packed artifacts;
  no stable protocol, SDK publication or complete package contract is implied.

## E1 — executable contract and core conformance

- [x] Alpha.5 bounded text-file facade source: exact selected input metadata, Unicode-safe pages,
  one staged output stream and schema/framing checks. [Scope](files.md). Host grants, quota,
  atomic checkpoint publication and runtime acceptance are separate; no registry publication.


- [x] E1a: original read/configure operation + invocation/completed-result/error schemas, bounded
  JSON, generated declarations/JSON Schema and synthetic valid/forged fixtures. Four local tests,
  typecheck/build/schema drift checks; public-only Windows/macOS/Linux source CI passed at 746775a.
  The private host consumes a packed pinned artifact and exercises this subset; E1 stays open below.

- [x] E1b platform/host acceptance: alpha.2 managed text root/ref/create/read schemas, createArtifact
  effect and resource-limit/unavailable outcomes. Seven local contract tests/type/build/format/schema
  drift pass; [CI](https://github.com/datatoi/prodinfo-extensions/actions/runs/40653044117) passed at
  46d54fc on Windows/macOS/Linux. Reference host 2ecd1d4 passes 49 tests and two built smoke paths
  on all three OS plus 21 PG18 cases: namespace/quota/transaction/replay, exact-ref reads and a
  synthetic pinned CSV/output proof. Guest/admin/write denial and revocation are tested.
  [Scope](resources.md). No large-file, native path, guest-write or durable-job support is implied.

- [x] E1c configuration acceptance: alpha.3 bounded flat declarative fields and pure no-I/O,
  non-coercing checks with redacted issues. Eleven local tests/type/build/format/schema drift pass;
  [CI](https://github.com/datatoi/prodinfo-extensions/actions/runs/40658646831) passed at 15e2e88 on
  Windows/macOS/Linux. Reference host 220709f passes 59 tests/two built smokes on all three OS plus
  30 PG18 cases: immutable declaration/check pins, activation CAS/history, explicit owned input refs,
  current policy/actor denial, corruption/rollback and migration/reopen. Execution admission is later.
  [Scope](configuration.md). No secret handling, executable hook, GUI or durable submission API.

- [x] E1d execution-effect acceptance: alpha.4 submit/controlRun metadata with unchanged completed
  reply envelope, thirteen local tests/type/build/format/schema drift.
  [CI](https://github.com/datatoi/prodinfo-extensions/actions/runs/40665029899) passed at 18c1b14 on
  Windows/macOS/Linux. Reference host 6f16218 passes 77 tests/three built smokes on all three OS plus
  41 PG18 cases: durable admission/leases/capacity, broker/checkpoint fencing, cancellation, takeover,
  exact outcomes and process-kill recovery. Reference host 11ce201 now adds an opt-in automatic
  dispatcher (85 tests/three smokes on Windows/macOS/Linux plus 48 PG18 cases); this does not expand the
  public artifact. Reference host 6d0212d adds one durable owner-only text checkpoint (96 tests/
  three smokes on Windows/macOS/Linux plus 56 PG18 cases). Reference host 11766b9 adds bounded
  independent item batches and a two-item killed-host/resume proof (107 local tests/three smokes;
  Windows/macOS/Linux and all 65 PG18 cases pass CI). Broader public author/workflow conformance remains open. Reference host dfa46a7 adds owner
  attention discovery with live scoped cursors and advisory controls (114 local tests/three smokes;
  Windows/macOS/Linux and all 72 PG18 cases pass CI). This is private operator proof, not a public
  attention SDK. Reference host 32bb001 now adds transactional run facts and a durable owner inbox
  consumer (124 tests/three smokes on Windows/macOS/Linux plus all 82 PG18 cases pass CI), with process-kill
  recovery and no invented historical-event backfill. Public event/inbox schemas and external
  delivery remain open; alpha.4 is unchanged. Reference host 867fb86 adds owner read/unread flags
  with revision/current-authority checks and compatible old page receipts (131 tests/three smokes
  on Windows/macOS/Linux plus all 89 PG18 cases pass CI). Read flags do not resolve work; unread paging,
  snooze/archive, team audiences and delivery remain open.
  [Scope](execution-effects.md). No public run state/SDK or general workflow.

Reference-host follow-up: 57e2164 proves saved owner notification routes and per-channel synthetic
reservation admission (141 tests/three smokes on Windows/macOS/Linux plus all 100 PG18 cases pass CI).
Atomic accounting, immutable source/route/target pins and deduplication are host responsibilities.
A reservation is not a send or new guest authority; public notification schemas/adapters stay open.

Reference host a8d6f12 adds synthetic attempt/dispatch/recovery and held/spent/released settlement
(157 tests/three smokes on Windows/macOS/Linux plus all 114 PG18 cases pass CI). Known rejection can retry;
uncertain acceptance requires reviewed reconciliation. The follow-up below adds automatic routing;
real transports/secret/recipient/disclosure brokers remain open and the public artifact is unchanged.

Reference host 60217ef adds explicit future-event notification routing, atomic cursor/request capture
and durable policy/quota deferral. Source CI passes 170 tests/three smokes on Windows/macOS/Linux
plus all 126 isolated PG18 cases. Automatic origin fences preserve manual deduplication ownership on disable/rebind.
No public contract change, notification SDK, provider transport or package release is included.

Reference host a617f36 adds scoped synthetic transport/private-value confinement and attempt-bound
redacted evidence with atomic settlement. Source CI passes 180 tests/three built checks on
Windows/macOS/Linux plus all 135 isolated PG18 cases. Production credential/recipient onboarding, verified adapter
execution and real transport/disclosure/evidence remain open; alpha.4 and guest scope are unchanged.

- [ ] Implement minimal strict schemas, generated author types and valid/invalid synthetic fixtures.
  Separate core metadata/public guest projection from private administration; do not publish a
  speculative complete SDK before the operations exist.
  Describe operation automation/effect/precondition/availability/validation/recovery so delegated
  console and manual calls can be tested for parity without broadening guest package authority.
  Specify authenticated replay visibility, current authority versus historical pins and restricted
  dependency/build identity with the first corresponding executable capabilities.
- [ ] Mock host and CLI/test example for config, action, durable job, request replay, denied scope,
  malformed schema and late cancellation cases; no private checkout or real provider required.
  As durable work is introduced, add [execution/interaction](routine-execution.md) schemas and
  two-item wait/host-restart/answer/resume conformance. Cover unknown totals, per-item outcomes,
  stale/duplicate/cancelled answers and current authority without holding a VM or DB transaction.
  Include [operator capture](browser-capture.md) task/source pins and local-only disclosure; no
  session cookies/credentials in guest data or inline oversized page capture.
- [ ] Validate against the first real headless core; keep package/config/activation/run identity and
  external uncertainty explicit. Establish public CI and versioned artifacts only when executable.
  Add lifecycle/recovery conformance as capabilities enter the schema: removal/migration failure,
  interval missed/overlap rules, event replay/quarantine and broker-side effect crash windows.
- [ ] Test project/routine resource bindings, input pins, output/scratch scope and immutable team-
  registry sources through the same contract; no engine-specific DB or private-source dependency.
- [ ] Local/hosted workspace and commercial-availability conformance: tenant-bound resources,
  cached policy/expiry and paid-package denial without authority expansion. Add bounded model-call
  reservation/usage/settlement refs and budget/uncertain-usage outcomes only with host proof; no
  guest-provided charges or plan/credit self-allocation. Cover soft tolerance versus explicit hard
  caps, checkpointed budget/accounting waits and resume without repeating calls/results or charges.
  Keep platform billing/provisioning private.
- [ ] Host-stamped operation/run/attempt/step/part trace context, structured diagnostic schemas and
  logger/query conformance: forged identity, overflow/suppression, secret masking and event separation.
  [Telemetry proposal](telemetry-draft.md) remains review-only until executable schemas exist.

- [ ] Notification channel/config/delivery conformance after host attention/outbox proof: Discord
  first, then versioned platform EmailService relay. Test denied audience/disclosure, logical-delivery
  versus retry quotas, independent email/SMS/Discord/future channel meters and placement policies
  (including allowed Free/local Discord), crash/uncertain sends, stale controls and failure without
  loss of core tasks.
  [Proposal](notifications.md). Keep host secrets/plan authority private; no speculative SDK fields.

## E2 — destination interface proof after core acceptance

- [ ] Write a detailed first adapter plan against the tested core. Start with generic Standard API
  compatibility for existing shop/service APIs, approved public wire artifacts and reference rules.
- [ ] Public config/check/discovery/read/intake/delivery package and fixtures; host-owned credentials/
  transport/state/receipts, per-item outcomes and idempotency/reconciliation.
- [ ] Pin compatibility and perform selected real-target acceptance separately from mock tests.
  No private vendor implementation or private build dependency behind a public wrapper.

## E3 — interface/console authoring support

- [ ] Formalize form hints/action metadata, typed evidence/state/event operations and fixtures only
  as implemented by core. Configuration GUI/AI views use the same contract, not guest UI scripts.
  Include default routine home/run/attention projections and optional declarative summaries,
  tables/forms/actions. Standard progress/recovery works without a custom package UI; executable
  custom views require a separate isolated bridge design and are deferred.
- [ ] SDK diagnostics/examples supporting predefined routine fork → patch → type/schema/fixture/
  sample test → compare → explicit activation, retaining version/grant/cost/side-effect boundaries.
  Exercise configure/launch/validate/correct/resume/relaunch within a bounded task grant, including
  protected actions and unchanged-retry versus new-version-run semantics; no manual save per step.
  Include bounded evaluation/cost and hostile source/log cases. Consumer-specific CSV round-trip
  behavior must preserve original identities rather than silently apply spreadsheet escaping.
- [ ] Provide reusable CSV enrichment/review/export and competitor discovery/approved-watchlist/
  monitoring examples; failed checks preserve last valid observations, no automatic repricing.

## E4 — additional integration parity and distribution

- [ ] Plan and port remaining destination behaviors individually, including the native legacy adapter
  family and file/webhook/broker integrations. Validate actual source capabilities and wire behavior;
  a package name/registration does not certify a live marketplace.
- [ ] Synthetic auth/reference/variant/payload/per-item/uncertainty tests and documented provider-
  account acceptance, permissions and supported versions for each published package.
- [ ] Independently versioned contracts/SDK/extensions, license/provenance notices, immutable artifacts,
  external publisher starter, enterprise-local registry interoperability and explicit marketplace publication. Certification/advisory/update
  controls and commercial/revenue-sharing terms remain separate platform designs.
