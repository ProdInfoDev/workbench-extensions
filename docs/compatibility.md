# Compatibility and releases

Design policy. Experimental command contracts 0.1.0-alpha.4 are source/packed artifacts only;
no stable SDK, manifest or npm version is published. The read/configure/createArtifact, managed-text and flat configuration-check subset does not
support jobs, guest packages, events or provider delivery. See [package scope](../packages/contracts/README.md).

Independently version the contract package, SDK/testing packages and individual connectors/routines.
Semantic changes require compatibility review; a provider mapping fix should not bump unrelated
contracts. A package declares required host/SDK/capability versions; the host refuses unsupported
operations rather than guessing. Define exact fields/rules with the first executable schemas.

Pin source/resource/config/input revisions and immutable content digests on checked versions/runs.
A draft change does not replace an activated version or schedule. Changed capability requirements
need fresh review; successful fixtures do not authorize production reads/writes. Installation
identity and mutable state schema compatibility must survive code upgrades explicitly.

Public CI must build/test from this repository and approved public dependencies without a private
checkout or token. Real-host integration tests should consume the same versioned artifacts/fixtures
and identify host version/capabilities. Record provider/live/installed-OS acceptance separately.

New original content uses the root MIT license. Preserve upstream licenses/NOTICE and provenance
when importing code or fixtures. Do not publish customer files/accounts, credentials or private
source by treating an old implementation snapshot as a ready public release.

Source commits do not create package-registry entries, marketplace certification or execution grants.
Define immutable release artifacts, provenance/signing, withdrawal/advisory and compatible rollback
before automated distribution. No certification can prove universal behavior on every input/site.

## Proposed commercial and deployment interoperability

Host policy may combine installed features, cached plan rights, paid-package availability and
workspace/attempt/model budgets. Those rights grant no new capability and do not change an active
code/config pin automatically. A package must tolerate denied/unavailable resources and keep
uncertain effects explicit. Credit accounting uses trusted provider usage and idempotent host
reservations/settlement, not diagnostic messages or a guest-edited balance. Exact schema/error
variants require public/host conformance. Soft estimated credit holds may have finite approved
tolerance; explicit hard caps use strict authorization. Budget/accounting waits must preserve
completed results, let admitted bounded calls finish and resume without repeated provider calls
or charges. This billing proposal adds no runtime schema change.

The SDK and official open-source integration source remain public. Paid offerings can have separate
distribution/licensing; do not mix separately licensed source into the repository's MIT material.
A commercial grant, publisher trust or certification never exempts a package from the same hosted
tenant, filesystem, network or execution limits. Marketplace rights and local/hosted deployment
provisioning remain platform concerns rather than source-level privileges.
