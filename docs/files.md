# Bounded routine text files (alpha.5)

The experimental `RoutineFiles` facade adds one host-selected input and at most one staged output.
A routine receives it as the second entrypoint argument's `files` property when the host enables
that execution profile. Types/manifests do not grant access. No native file paths, arbitrary
workspace reads, network access or directory binding is implied.

`files.read({after:0})` returns `{text,next}` for the selected input only. `after`/`next` are UTF-16
string offsets; use the returned cursor, not UTF-8 byte arithmetic. Pages preserve BOM/CRLF and
never split a Unicode surrogate pair. Continue until `next === null`. `ManagedFile` metadata pins
logical root/resource IDs, SHA-256 of UTF-8 bytes, display name, media type and byte length.

`files.write({name,mediaType,index:0,text,final:false})` stages the first output chunk. Continue with
consecutive indexes and identical name/media type, finishing with `final:true` (including an empty
last chunk if needed). The acknowledgement reports next index, cumulative UTF-8 bytes and whether
the stream is sealed. Sealed does not mean published: the host must publish the complete output
atomically with a successful run checkpoint. Failure, cancellation, stale authority or an unsealed
stream must not create a successful or partial artifact. Retry starts a fresh attempt-local stream.
An uncertain checkpoint acknowledgement must be inspected; it is not permission to publish twice.

Limits: one input, one optional output, 1 MiB UTF-8 per file, 6,000 UTF-16 code units per chunk and
at most 512 total facade/host calls in the file execution profile. Hosts may tighten limits and
must bound CPU/memory/wall time, in-flight calls and persisted storage. Names are display names,
not path grants. Supported text media are CSV, plain text and JSON; no binary/ZIP/Excel support.
The existing 8 KiB text-resource schemas and command/reply envelopes are unchanged.

Input upload, root selection, per-run grant persistence, quotas, run admission and output downloads
are host responsibilities. A public schema check cannot prove a host implements those fences.
This source package is not registry-published or a complete workflow/package SDK. Public tests
exercise framing/Unicode/bounds; host execution and installed-platform acceptance remain separate.
