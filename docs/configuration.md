# Experimental configuration declarations

28 October 2026. Alpha.3 adds a small executable declaration/check subset, not a full manifest,
activation API, GUI, credential form or workflow SDK. Canonical schemas/helpers are in
[configuration.ts](../packages/contracts/src/configuration.ts); generated JSON Schema is checked.

A formatVersion=1 contract declares at most 32 unique flat fields and is at most 8 KiB of JSON.
Each field has an ASCII key, display title, required flag and kind. Keys reject reserved prototype
names. Titles and string choices must be non-NUL UTF-8; titles are untrusted display text.

| Kind | Declared constraints |
|---|---|
| string | Explicit minLength/maxLength from 0 to 4096, measured in JavaScript UTF-16 units |
| number | Explicit finite min/max within ±1e15; integer flag requires a safe integer |
| boolean | Exactly true or false |
| enum | 1–32 unique string choices, each at most 128 UTF-16 units |
| resourceRef | Exact logical root/resource/digest shape; grants/content existence remain host checks |

There are no nested schemas, arbitrary JSON Schema, regular expressions, external refs, callbacks,
defaults, coercion, secret values or executable validation hooks. Extend through a reviewed future
version rather than interpreting unsupported declarations. Optional means absent is allowed; null
is not treated as missing. Explicit empty string, zero and false retain their values. Strings must
be non-NUL UTF-8. Values remain non-secret configuration, never a credential channel.

`parseConfigurationContract` first checks bounded JSON, then structure/semantic bounds.
`checkConfiguration(contract, value)` is pure: it checks a flat object, rejects undeclared fields,
and returns valid plus bounded field/code issues without echoing values or unknown keys. It never
changes the input, reads resources, contacts a provider, grants access, activates or runs code.
Invalid declarations/non-JSON/bound violations throw; ordinary configuration mismatches return
issues. `CONFIGURATION_VALIDATOR_VERSION` is flat-v1. Generated JSON Schema cannot express every
semantic constraint; callers must use the helpers and hosts must validate independently.

A host must bind the declaration and validator result to exact retained source/configuration hashes.
Changing code/config/declaration cannot reuse a mismatched check. A structurally valid resource ref
is not a read grant; host checks must verify current actor/workspace/routine ownership, exact bytes
and explicit approved refs. Validation, activation and execution admission are different actions.
Save/render/check cannot silently activate or contact a destination. Network connection tests need
a separately authorized action once a transport broker exists. Failed checks retain diagnostics.

Eleven public tests plus format/type/build/schema drift pass locally, including four new cases for
preserved values, non-coercion/redacted issues, bad declarations/bounds and hostile JSON. Public
[three-platform CI](https://github.com/datatoi/prodinfo-extensions/actions/runs/40658646831) passed
at 15e2e88 on Windows/macOS/Linux. Reference host 220709f passes 59 tests and two built smoke paths
on all three OS plus 30 PG18 cases. It proves exact immutable bindings/checks, independent activation
CAS/history, explicit input ownership/digests, expiry, actor/tenant denial, rollback, corruption and
reopen. Activation records still require future current-authority execution admission; no run route
is supplied by these declarations. No npm package or marketplace release is published by this source
change; public build/test requires only public dependencies/fixtures.
