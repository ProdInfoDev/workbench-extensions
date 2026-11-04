# Experimental command contracts

Version 0.1.0-alpha.4 is a source-level contract proof, not a published SDK or stable integration API.
Runtime schemas are in src/index.ts; build derives declarations and `pnpm generate` updates
schemas/*.schema.json. `pnpm check` detects drift without overwriting generated schemas.
Use parseInvocation/parseReply/parseOperation at untrusted boundaries: structural/byte limits run
before recursive Zod parsing. Raw schemas alone do not enforce those semantic limits.

The executable subset covers read/configure/createArtifact descriptions, invocations and completed
results/errors. It has no guest runner, manifests, durable jobs, events or provider transport yet.
Identity/authority are host-derived, absent from invocation input. Operation-specific schemas and
current authorization still apply in the host. A result receipt is not a provider-delivery receipt.

JSON trees are limited to 64 KiB, depth 16 and 4096 nodes. Finite numbers only; negative zero,
accessors, sparse arrays, non-plain objects, repeated object references and reserved prototype keys
are rejected. JSON Schema artifacts describe shapes; host/parser semantic limits remain mandatory.
This alpha deliberately restricts inputs; do not silently coerce unsupported data.

Alpha.2 adds logical resource roots, exact digest-bound text references, create/read schemas and
parsers, createArtifact effect, and resource_limit/unavailable error categories. Text is capped at
8,192 UTF-8 bytes with no BOM/CRLF normalization; the normal JSON envelope limits also apply.
Root/resource IDs identify host-managed immutable content, never native filesystem paths. Labels
are display names. Host code must independently verify content hashes and current tenant/actor/
routine grants; parseReadTextResource validates shape/UTF-8/byte count, not cryptographic integrity.

resources.text.read and resources.text.create are version 1.0.0 operation identifiers. Create is a
host/client operation; guest write authority is not delivered by these types. A host may expose
reads only for exact approved references and keep root administration private. No binary/streaming
API, directory grant, durable job, billing wait or published npm SDK is included. See
[resource contract](../../docs/resources.md).


Alpha.3 adds a bounded flat ConfigurationContractSchema and pure checkConfiguration helper for
non-secret string/number/boolean/enum/resourceRef fields. Empty/zero/false are preserved; undeclared
fields, coercion and executable/unsupported rules are refused. Issues never include values.
Declarations/checks grant no permission and perform no I/O/activation. Host binding and current
scope remain mandatory. See [configuration scope](../../docs/configuration.md).


Alpha.4 adds submit/controlRun operation effects. A command result describing queued admission is
not a completed run. The reply envelope is unchanged; top-level accepted/job variants remain
unsupported. See [execution effects](../../docs/execution-effects.md). Host authority and durable
claim/result fencing are mandatory; these metadata labels grant no guest execution privilege.

Alpha.5 adds the experimental [bounded routine file facade](../../docs/files.md); grants and atomic output publication remain host responsibilities. Existing 8 KiB text-resource schemas are unchanged.
