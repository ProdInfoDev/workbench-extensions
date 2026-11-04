# Contributing

Start with [context](docs/context.md), [roadmap](docs/roadmap.md) and
[contract scope](docs/contract-scope.md). SDK/schema implementation has not started; do not assume
any proposed API spelling is stable or publish packages against nonexistent registry versions.

Propose the capability/config/action contract and synthetic input/output/error cases with a change.
Keep pure transforms separate from authorized host I/O. A connector requests host-owned transport
and receives assigned data; it does not obtain raw secrets, database access, shell or runtime APIs.
Provide config/action validation, identity/currency/variant assumptions and failure/uncertainty
behavior. Tests should prove real boundaries, idempotency and stable results rather than mirror code.

Use synthetic fixtures without customer identifiers, tokens, private URLs or account snapshots.
Do not scrape/copy provider content into this repository without appropriate redistribution rights.
Compatibility tests should run without a private Workbench checkout or private dependencies.
Document which live-account/installed-host acceptance is still unperformed.

Public source commits are not package publication, marketplace approval, deployment or activation.
Retain license/provenance notices for all imported material. New original content uses the root
MIT license unless a clearly documented package-specific license applies.
