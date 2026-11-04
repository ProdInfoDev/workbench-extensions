# Workflow notifications and attention — proposal

28 October 2026. Add notification adapters to the existing core task/event model, starting with
Discord webhook messages and a platform EmailService relay. Mobile push/control stays later.
Adapters remain design-only; alpha.4 exposes no notification, inbox, UI-intent or external-send SDK.

The host owns actual run/task state, authorized inbox queries, per-user read/snooze/archive,
transactional outbox and channel delivery receipts. Opening/dismissing a notice never answers an
input task or approves work. Required attention remains discoverable when external sending fails
or exceeds a plan allowance. Completion summaries distinguish partial outcomes from full success.
Current audience/source revisions govern every control; a message, manifest or webhook grants no
command authority. The reference host now proves private item batches, live owner attention and
transactional run facts with a bounded durable owner-notice consumer. Its historical notices recheck
current task resolution; existing waiting work stays discoverable without fabricated event backfill.
The reference host also proves explicit owner read/unread flags with revision/current-authority
checks and restart/replay preservation, independently of task resolution. Existing page contracts
stay compatible. Unread paging/counts, bulk marking, snooze/archive, aggregate batch notices, team
audiences, external delivery and all public event/inbox schemas remain open. Alpha.4 and guest
authority are unchanged.

The reference host now also proves saved owner route drafts, passive checks, explicit activation
and synthetic per-channel reservation admission. Cached enabled/placement/meter/period/route policy
and host-owned targets bound each request; atomic SQL accounting and logical identity deduplicate
reservations. Old pending pins do not silently follow route edits. A reserved response is not
provider acceptance, a credential grant or evidence of sending. The reference host now also proves
a bounded synthetic worker with DB-clock claims, a pre-transport marker, current source/route/target/
policy checks and durable accepted/rejected/uncertain evidence. Only known nonacceptance retries;
uncertainty holds its unit for reviewed synthetic reconciliation. Pre-dispatch cancellation is
distinct from recovering an expired lease; admission snapshots remain unchanged while a separate
status query reports actual progress. Process-kill windows and quota settlement are exercised.
Real transports, automatic deferred routing, remaining quota dimensions and backend allocation
enforcement stay open. Synthetic acceptance is not live-provider or human-delivery evidence.

Public channel packages own provider-specific declarations/formatting and synthetic adapter tests.
Use scoped host transport/secret brokers: webhook URLs and mail keys never enter routine arguments,
source, logs or portable setup. Core stamps event/workspace/run/item/task/rule identity and owns
quotas/disclosure. Routines cannot forge core completion facts, send unrestricted email or widen
recipients. AI console configures and diagnoses through the same authorized operations.

Use versioned channel/rule config, safe preview and passive checks, plus a separate authorized Send
test action. Save/check/render does not send or activate. Pin routing for an intent and recheck
current recipient access, channel enabled state and disclosure before dispatch. Templates are data,
not arbitrary code in the trusted UI. Do not send captured local-only content or private evidence
in Discord/email/push merely because a notification channel exists.

Discord should confirm accepted sends, retain message identifiers where available, suppress unwanted
mentions and honor rate-limit/retry responses. An incoming webhook does not provide verified
workflow-control callbacks: link to the authenticated application first. Provider timeouts can be
uncertain; internal deduplication cannot guarantee exactly-once external delivery. Bound retries
and expose uncertainty instead of treating a lost acknowledgement as proof nothing was sent.
See the official [webhook reference](https://docs.discord.com/developers/resources/webhook) and
[rate-limit guidance](https://github.com/discord/discord-api-docs/blob/main/developers/topics/rate-limits.mdx).

The email adapter should call an authenticated versioned platform relay once its contract exists;
no such workflow relay API is released now. Backend transport credentials remain backend-owned.
Durable relay admission, verified recipients, subscription allocation and result evidence are host/
platform responsibilities; queue acceptance, provider acceptance and actual inbox delivery differ.
No private Java implementation or platform administration contract belongs in this public package.

Confirmed: inbox/manual task responses are available on every plan. External messaging is governed
by an admin-configurable policy per channel type and deployment placement, superseding the earlier
blanket paid-only assumption. Free/local Discord can be allowed while email/SMS, hosted Discord or
future channels use different allowances. Numeric values and mobile packaging remain undecided.

The platform plan admin configures enabled state, placement/transport mode, compatible meter and
period allowance, destination/recipient/route caps, burst/concurrency and retry budgets. Workspace
admins select destinations within those rights. Channel types are distinct from destination
instances; registration must support future adapters without hardcoded plan-name checks. Unknown
channel policy grants no send. Provider/customer-owned transport and platform relay can have
different policies; a local webhook permission is not platform mail/SMS relay authorization.

Meter channels separately: one Discord destination plus three email recipients uses one Discord
message and three email deliveries, not a mandatory shared pool of four. Future channels use their
registered trusted meters/units, with explicit handling of chargeable retries. Durable reservations
and current cached plan policy must survive workers/restarts and respect subscription/install
allocations. Exhaustion or downgrade pauses only affected sends while inbox/manual recovery stays
available and other allowed channels can continue. No speculative executable plan fields, AI-credit
wallet or authority-minting grant/cache/restore is added.

Typed UI intents can open a permitted form, focus a record or refresh a view through trusted
renderers. Poll/cursor snapshots recover missed events; streams are optional hints. A UI hook does
not execute uploaded JavaScript, grant credentials or perform a business action merely by arriving.
Durable business automation belongs on the host, not a browser callback. Later authenticated mobile
clients reuse task/query/control operations, device revocation and paired host connectivity; push
carries a privacy-safe hint and controls fetch current state. Localhost is not remote phone access.

Bootstrap reconciles open tasks with the event cursor. Enabling a route/restoring setup does not
rebroadcast historical completion events; explicit backfill is scoped and deduplicated.

Core attention/outbox/restart/unknown-send/plan proofs precede channel adapters and screens. Public
notification/action/transport schemas follow executable host conformance; do not infer a stable API
or install a package from this design. Full task/interaction semantics remain in
[routine execution](routine-execution.md); disclosure also follows [browser capture](browser-capture.md).
