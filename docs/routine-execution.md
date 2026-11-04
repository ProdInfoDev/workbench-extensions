# Routine execution, progress and interaction — design draft

27 October 2026. Proposed author/host semantics, not executable schemas or released SDK methods.
The implemented contracts remain 0.1.0-alpha.1 read/configure invocations and completed replies;
they do not yet submit jobs, report durable progress or request user input. Add these capabilities
only with real-host conformance and versioned schemas. The roadmap owns implementation tasks.

## One execution model, optional richer views

Every routine can use the host's standard run overview, stage/item progress, attention inbox,
results/artifacts and recovery actions. It does not need its own UI to be usable. Simple scripts
may appear as one bounded step; resumable/interactive routines declare checkpointed steps and use
host workflow primitives. Unstructured logs cannot supply a reliable stage graph or safe resume.

A package may add declarative summaries, tables, filters, forms and typed actions to its routine
home page. These extend the standard model and use the same scoped core operations. The first
renderer does not import arbitrary package React/JS into trusted UI. Fully custom executable views
would need a separately designed isolated bridge/security boundary; they are not needed initially.

## Stable execution concepts

| Concept | Meaning |
|---|---|
| Routine version | Checked immutable source/build/config schema and declared workflow capabilities |
| Run | One admitted input/config/code snapshot and effective task authority; survives browser/VM lifetime |
| Step | Stable semantic key in that run, saved inputs/results and declared dependencies |
| Item | Stable member of a frozen batch/input set, optionally linked to a domain Record/source binding |
| Attempt | One leased/fenced execution of incomplete work; separate from logical run/step/item identity |
| Interaction task | Durable input/decision request tied to exact run/step/item and revisions |
| Outcome/evidence | Committed result/error/skip/cancellation, immutable artifact/proposal/effect receipt refs |

The host owns lifecycle transitions and current authority. A package's progress text or successful
logger call does not commit a step, approve a value or prove remote delivery. Package part labels
remain distinct from durable step keys; link them through the telemetry context.

Lifecycle concepts include queued, running, waiting, paused and terminal completed/failed/cancelled.
Exact wire labels are deferred to executable contracts. Waiting exposes a reason, such as input,
approval, child work, timer/retry, resource or reconciliation; the UI need not guess from a log.
Requested pause/cancel and confirmed quiescence/termination are distinct. Completion reports
partial business outcomes explicitly rather than silently treating all item errors as success.

## Progress protocol requirements

Declare stable stage keys/titles and ordering/dependencies as known, allowing bounded dynamic item
work. Host wrappers around steps/child jobs/SDK effects automatically expose their actual lifecycle;
the routine may supply bounded descriptive progress and work-unit counts. Report source/freshness
and whether a count is host-derived or a routine observation. Do not manufacture completed stages.

Use known-total counts when the set/units are frozen; otherwise expose elapsed time, current stage,
processed/discovered counts and an unknown total. Overall item completion is not a time estimate.
Discovered totals may grow; label that rather than imply a fixed denominator or monotonic ETA.
Committed item counters distinguish success, failure, skip, waiting, active and pending. Progress
can be throttled/coalesced; committed checkpoints and effect outcomes cannot be dropped with logs.

Snapshots and ordered/cursor updates are scoped by workspace/run/revision. After reconnect or a
retention gap, refresh an authoritative snapshot. Late attempts and old tab responses cannot alter
newer state. Core reports available actions and denial/recovery reasons under current policy.

## Input and approvals in the middle

A routine requests a durable interaction containing its stable key, purpose, bounded context,
supported input schema/form hints, target/evidence refs, audience/authority and optional deadline.
It may concern one item or an aggregate decision. The core persists the wait and releases execution
capacity; it does not leave a guest VM, HTTP request, database transaction or browser tab waiting.
Resume uses recorded steps/continuations or durable replay, not serialization of an arbitrary JS stack.

The standard UI renders supported fields, choices, files-as-admitted-artifact-refs or an appropriate
host-provided domain review view. A package does not inject script/HTML or ask for plaintext secrets
through a generic form; credential binding uses the protected host flow. Inputs/tasks are runtime
workspace data, not shared source, Git fixtures or configuration backups.

Answering is an authenticated, expected-revision, idempotent core action. Bind approval to the exact
proposal/payload/target/config/code revisions it approves; changes make a prior answer stale. One
answer wins across tabs/operators/console. Reject expired/cancelled/stale responses; persist who
answered and the admitted result before scheduling continuation. An answer is not automatically
an applied Record or external delivery receipt; those remain validated domain/effect operations.

User input, operator approval and AI suggestions are distinct. The console can inspect and answer
within delegated policy; this does not make every approval human-only or let a routine grant itself
approval. Deadlines have a pinned fail/skip/pause policy, never a guessed user answer. Run cancellation
or superseded work closes dependent tasks and fences late responses.

## Batches and recovery

Freeze input membership/identity or declare a bounded discovery policy. Item keys are not inferred
from SKU alone; preserve source/account/item/variant identity and relevant Record revisions. Bound
fan-out and persistence/query sizes. Unrelated items may continue while one waits for input, unless
the routine declares a whole-batch barrier/fail-fast policy. Expose partial outcomes, paged item
details and a reproducible failed/waiting subset rather than rerunning every successful item.

| Action | Semantics |
|---|---|
| Resume | Continue a durable wait/pause after valid input or resolved prerequisites, with current grants |
| Retry | New attempt of safe incomplete/failed work under unchanged pins and retained logical effect keys |
| Retry selected items | Freeze the eligible subset; preserve successful results, responses and effect receipts |
| Restart/follow-up | Explicit new run with version/input/config pins and lineage; changed instructions are not an old attempt |
| Pause | Stop new eligible dispatch and reach a safe checkpoint; show in-flight work until acknowledged |
| Cancel | Fence further work and close pending tasks; retain any uncertain in-flight external outcomes |

Restart never implies permission to repeat committed imports/sends. Reuse/reconcile prior effects
according to the operation contract; a deliberate resend needs its own granted intent. Reusing pure
computed results across different versions also requires explicit compatibility/evidence, not just
a matching display label. The run registry, SDK, UI and operator console share these semantics.

## Conformance before release

Prove process loss during a durable wait and item step, duplicate/stale answers, audience/grant
changes, late attempts, unknown totals, dynamic discovery, partially failed batches and safe subset
retry. Verify cancelled tasks cannot resume work, changed-code follow-ups do not rewrite history,
and a lost provider acknowledgement does not become an unconditional resend. Test a plain one-step
routine and an interactive batch through the same host, without a package-specific UI or Records
dependency. A fixture engine or view alone does not establish durable behavior.


[Browser capture proposal](browser-capture.md) is a concrete input-task use case at workflow start
or mid-run. Share an approved resource reference; keep session access as a separate host-held grant.
Local-only must reach model/runner/log/backup boundaries. This does not add executable alpha.4 fields.

Reference host 6d0212d now proves one private owner-only text checkpoint, exact-revision answers,
release of VM/worker/SQL while waiting, and fresh-VM continuation after a real host kill. Local
96-test/three-built-smoke checks pass; source CI also passes on Windows/macOS/Linux plus all 56 PG18
cases. That foundation does not define stable public task fields or full workflow conformance.
One text answer is not browser-session sharing, a credential grant or captured-page disclosure.

## Reference host bounded item-batch proof

Host 11766b9 now composes up to eight pinned item runs atomically, reusing the same worker/input
checkpoint engine. A real killed-host/restart/answer test resumes only the waiting item and preserves
the completed item's exact result/attempt count. Counts distinguish completed, failed, waiting and
other actual item states; stale group cancellation conflicts and terminal outcomes are retained.
Local checks pass 107 tests/three built smokes. Source CI passes on Windows/macOS/Linux plus all
65 isolated PG18 cases, including a two-pool/two-dispatcher batch fixture. The private operator catalog now pages within unchanged
JSON bounds. Public alpha.4 and its artifact are unchanged; host-profile limits and private commands
are not a released author schema. Dynamic graphs/totals, failed-item subset retry, team/capture forms,
core attention/outbox, external notifications and UI remain separate acceptance work.

## Reference host owner attention query

Host dfa46a7 adds owner/workspace/config-scoped discovery of open input tasks across standalone and
batch runs. Live deadline cursors and exact task/run/item refs feed existing answer operations;
advisory availability is not a grant. New request IDs refresh state; repeated read IDs replay their
historical page. Querying does not resolve/dismiss/expire tasks or bypass current action checks.
Local 114-test/three-smoke proof passes, including HTTP discovery after killed-host recovery and
schema-8 reopen/receipt/cursor preservation. Source CI passes on Windows/macOS/Linux plus all 72
isolated PG18 cases. This adds no public
alpha.4 types or guest permissions. Team forms, completion notices, read state, outbox, delivery and
UI remain separate acceptance work.
