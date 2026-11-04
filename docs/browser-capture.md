# Browser capture and workflow interactions — proposal

28 October 2026. Design-only author requirements, not methods in the alpha.4 SDK. No browser broker,
public capture schema, durable wait API or disclosure-policy implementation is released here.

A routine should be able to request an operator-approved page snapshot before starting or mid-run.
The core creates a durable task tied to the exact run/item/source/revision, releases execution
capacity while waiting, and validates the response before resuming. A routine receives an immutable
capture resource reference with provenance and allowed use, never a cookie or login state file.
Wrong-page/stale/cancelled responses must not resume work or discard already completed items.

An ongoing browser connection is a separate later grant: host-held session, explicit site/action/
operator/workspace scope and expiry, opaque routine reference. Authentication/MFA stays interactive.
A shared routine or captured document does not share an operator's browser session. Profiles and
credentials remain outside package sources, routine configuration, registry and setup backups.

Local-only capture stays on the capturing computer unless the operator permits a specified transfer.
This also governs cloud AI processing, remote runners, cloud logs/support and backups, beyond ordinary
sync/export. Local browser access to the supplier still works. Team/server transfer and model use
are separate grants; routine code/model output cannot relabel captured private content as public.
Derived outputs need explicit inherited-policy rules. Captured page content remains untrusted data
and can contain secrets in HTML, so preview/redaction is required even when cookies are excluded.

Browser UI needs a local capture adapter/companion or an explicitly authorized extension. A remote
server cannot automatically use a workstation's authenticated browser. Large DOM/screenshots/files
need their own bounded artifact support, not oversized inline run JSON or the current 8-KiB text API.
Exact capture/task/broker fields follow executable host conformance rather than a speculative SDK.
