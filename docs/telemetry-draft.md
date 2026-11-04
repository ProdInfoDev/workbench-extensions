# Routine activity and trace context — contract draft for review

Draft 0, 27 October 2026. No executable schema, logger/span SDK or protocol is released. This is the
canonical proposed public telemetry boundary; host storage/admin details remain private. Align with
OpenTelemetry/W3C conventions rather than define a competing tracing system.

## Host context and author messages

The host automatically binds package/action/config/workspace/run/attempt/step identity to routine
SDK calls and diagnostic messages. It propagates appropriate trace/span context across core/worker/
child-job boundaries. Identity/authority is derived from authenticated execution, never a package-
provided tag. A trace ID correlates evidence; it grants no access to another run or workspace.

| Proposed information | Meaning / owner |
|---|---|
| Format/schema version | Version the diagnostic contract independently of code/package versions |
| Source and observation timestamps | Producer time versus collection time; not assumed synchronized |
| Level/name/message/attributes | Bounded structured diagnostic content, with provenance and type constraints |
| Trace/span and parent/link refs | Standard trace correlation, separate from durable step/request identity |
| Workspace/project/package/action | Host-stamped origin, package version/digest and effective action |
| Run/attempt/step/part | Actual attempt plus durable step key and stable author part label |
| Config/source/evidence refs | Pinned revision and declared bundle/source-map locations, not arbitrary file paths |
| Correlation/causation and item refs | Links to commands/jobs/events/domain objects within granted scope |
| Coverage/suppression metadata | Collection loss, truncation/redaction or retention gaps must be visible |

These are semantic categories, not finalized field spellings/types. Where a field is unavailable or
not applicable, preserve that fact instead of fabricating a parent/run/config. Module/core-generated
records and untrusted package/process messages have distinguishable origin. A routine message saying
“approved” or “delivered” is not a core approval or provider receipt.

## Routine parts and structured logging

A routine can name semantic parts such as parse-input, match-candidates, request-model and build-
report. A durable step key identifies resumable/idempotent work; a part label identifies code scope
inside an attempt. Relative source/export/function/line mappings refer to the exact checked bundle.
A later source edit must not change the meaning of previously retained records.

Illustrative authoring style only; these method names are not a shipped SDK:

```ts
await context.part("match-candidates", async (part) => {
  part.log("info", "Matching started", { candidateCount: 3 });
  // Perform already-authorized work through the SDK.
  part.log("info", "Matching finished", { matchedCount: 2 });
});
```

The SDK carries host context, validates bounded names/attributes, namespaces author tags and captures
thrown errors/cancellation appropriately. Authors cannot override reserved core identity, claim a
foreign trace/actor or publish core facts by choosing an event name. Guest console/stdout/stderr may
be captured as bounded diagnostics; it is not privileged domain-event emission. No OpenTelemetry
export credentials, arbitrary exporter endpoint or ambient network binding is given to the guest.

Long waits/retries/resume use fresh bounded spans and causal links with persistent business IDs;
they do not hold one live VM/span for the entire workflow. Host instrumentation and child-job
records preserve context even when an author forgets a diagnostic message.

## Discovery/query boundary

Core exposes actor-filtered catalogs for configuration and event types plus search/timeline/
aggregate projections for retained activity. A user/console may inspect all permitted configuration
and system/routine evidence in its workspace; a guest receives only its granted projection. Secrets
are opaque bindings and private evidence has its own disclosure policy. Concrete query schemas and
operation IDs must be executable before publishing a stable API; no raw DB or file-log access.

Results identify data windows/coverage, sampling/drop/retention gaps, redaction and source trust.
Queries are paged/bounded by time and scope. Tags/IDs useful for searching logs are not automatically
unbounded metric labels. Incoming/outgoing trace context and baggage must be sanitized; do not put
secrets/customer bodies in them or forward internal tags to untrusted destinations by default.

## Events versus diagnostics

A public package may declare namespaced event types with schemas and request emission under a
specific capability. The host validates/stamps those events. Core committed-domain events have
reserved producers and transaction semantics; an info/error log cannot impersonate one or create a
workflow subscription effect by itself. Audit/receipt writes are not sampled away with debug logs.
Diagnostic exporter failure or a log quota is not evidence that a business operation failed/succeeded.

## First conformance cases

Verify command/queue/worker/part correlation, code/config/retry pins, host-stamped scope, forged-tag
refusal, bounded flooding/suppression visibility, secrets/redaction, log-query isolation and no log
message that mutates core state. Compare routine-origin claims with actual command/receipt outcomes.
No schema/host compatibility or full retention guarantee follows from this draft alone.

References: [OpenTelemetry log model](https://opentelemetry.io/docs/specs/otel/logs/data-model/),
[context propagation](https://opentelemetry.io/docs/concepts/context-propagation/),
[trace API](https://opentelemetry.io/docs/specs/otel/trace/api/).
