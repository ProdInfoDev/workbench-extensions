# Public extensions working instructions

Read docs/context.md first. It is the sole current handoff; docs/roadmap.md owns task checkboxes.
Keep public contract details in their canonical package once implemented and link from author docs.
Do not create competing schema/type copies or claim a planned SDK is published.

This repository is public. Add only reviewed public source, docs, schemas and synthetic fixtures.
Do not copy private host source, credentials, customer samples/history, local absolute paths,
private Git dependencies or sibling checkout patches. Keep public clone/build/test independent.

TypeScript is the application/extension authoring language. The host implementation is private and
not needed to author against this API. No Rust toolchain requirement or guest Node/SQL/shell access.
A host must enforce capabilities independently of SDK/types/manifest or publisher trust.

All new destination-specific implementations/profiles/tests belong here. Preserve existing wire
compatibility via approved public artifacts and synthetic conformance cases; do not invent a second
Standard Integration API. Record provenance/license before importing legacy code; MIT applies to
new original material and does not override other license obligations.

Version contracts/SDK and individual extensions independently. Tests against a mock or fixture do
not establish live-provider/host acceptance. Update context/roadmap and report actual checks with
completed commits. Package publish, release and marketplace registration require their own scope;
a source commit alone does not deploy/activate anything.
