# Module contract: public API, roles and access

Status: **executable**. `checkModuleContract` in `@prodinfo/extension-contracts` (`packages/contracts/src/module-contract.ts`)
enforces the rules below; `schemas/module-contract.schema.json` describes the shape, and
`fixtures/module-contract-valid.json` / `module-contract-fork.json` are the reference declarations.
Host conformance tests (a host refusing to load a module with any issue) live in the host repositories.

## Idea

A module is a plugin. When it is plugged into a host it brings its API, its documentation, its
database structure, and its roles and permissions. The host knows no business domain: it defines
the system roles, applies the same rules to every module, and provides the user and role
administration.

| System role | Meaning |
|---|---|
| `owner` | Everything. |
| `admin` | Users, roles, API keys, routine approvals; no business data by itself. |
| `member` | Ordinary user; each module declares what members may do. |
| `viewer` | Read only across all modules; by default reads public views; never writes. |

**Every module supports the system roles first**: it declares what `member` and `viewer` may do on
each of its resources and is complete without any roles of its own. Module roles are optional
refinements and may be added in later module versions.

## What a module declares

```jsonc
{
  "id": "x_shop",
  "version": "1.2.0",
  "license": "MIT",
  "source": "available",
  "depends": ["platform@^1.0.0"],
  "libraries": [
    {
      "name": "@prodinfo/ui",
      "version": "0.1.0",
      "digest": "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      "license": "MIT",
      "source": "available"
    }
  ],
  "systemRolePresets": {
    "member": {
      "standard": { "title": "Full access", "permissions": ["x_shop:read", "x_shop:write"] },
      "read-only": { "title": "Look only", "permissions": ["x_shop:read"] }
    },
    "viewer": {
      "summary": { "title": "Order summaries", "permissions": ["x_shop:read"] }
    }
  },
  "access": {
    "permissions": [
      { "id": "x_shop:read", "title": "Read orders", "description": "Read order data" },
      { "id": "x_shop:write", "title": "Write orders", "description": "Create and edit orders" }
    ],
    "roles": {
      "editor": { "title": "Orders editor", "description": "Create, edit and cancel orders" }
    },
    "commands": {
      "x_shop.order.create": { "visibility": "public",  "effect": "configure",    "call": ["member"],        "ai": "confirm" },
      "x_shop.order.cancel": { "visibility": "public",  "effect": "configure",    "call": ["x_shop.editor"], "ai": "confirm" },
      "x_shop.order.purge":  { "visibility": "private", "effect": "configure",    "call": [],                "ai": "never" }
    },
    "views":  { "x_shop_v1.orders": { "visibility": "public", "read": ["viewer", "member"] } },
    "tables": {
      "x_shop.orders": {
        "read": ["member"], "write": ["x_shop.editor"], "ai": "confirm",
        "columns": {
          "id": { "kind": "other" },
          "customer_name": { "kind": "text", "classification": "personal" },
          "delivery_notes": { "kind": "text", "classification": "confidential" }
        }
      },
      "x_shop.log":    { "read": [] }
    },
    "events": {
      "x_shop.order.created": {
        "visibility": "public",
        "subscribe": ["member"],
        "notification": {
          "title": "Order created",
          "severity": "info",
          "payloadSchema": { "type": "object", "properties": { "orderId": { "type": "string" } } }
        }
      }
    }
  },
  "routines": [
    {
      "id": "x_shop.sync_orders",
      "run": ["member"],
      "needs": ["x_shop.orders:write", "connection:shop-api:use", "net:api.shop.example"]
    }
  ],
  "ui": {
    "screens": [
      { "id": "x_shop.orders", "route": "/shop/orders", "title": "Orders", "navGroup": "Sales", "requiredCapabilities": ["x_shop:read"] }
    ],
    "navLinks": [
      { "id": "x_shop.customers-link", "route": "/parties", "title": "Customers", "navGroup": "Sales", "requiredCapabilities": ["x_shop:read"] }
    ],
    "slots": {
      "homeCards":     [{ "id": "x_shop.home.orders",     "title": "Orders summary",   "requiredCapabilities": ["x_shop:read"] }],
      "settingsCards": [{ "id": "x_shop.settings.policy", "title": "Shop preferences", "requiredCapabilities": ["x_shop:write"] }],
      "reviewCards":   [{ "id": "x_shop.review.pending",  "title": "Pending orders",   "requiredCapabilities": ["x_shop:write"] }]
    }
  },
  "docs": { "context": "docs/context.md" }
}
```

| Field | Meaning |
|---|---|
| `depends` | Required base modules, optionally pinned by a version range as `<module>@^1.0.0`; module-to-module dependency grants no access to the base module's data. |
| `libraries` | Code-only packages bundled into the module. Each entry pins its package name, version, `sha256:` digest, license and source availability; a library has no tables, commands, views, permissions or UI of its own. |
| `systemRolePresets` | Named permission sets for `member` and `viewer`. The first preset listed for a role is that role's module default; hosts may offer the remaining presets in Roles & permissions. |
| `access.permissions` | Permission identifiers and labels a module's resources use; preset permissions must refer to these declarations. |
| `access.roles` | Optional module roles; the host namespaces them (`x_shop.editor`). |
| `visibility` | `public` items are the module's versioned contract; `private` (default) are internal. |
| `call` / `read` / `write` / `subscribe` | Which system roles (`member`, `viewer`) and module roles may do it. `owner` always may; `[]` means owner only. |
| `tables.*.write` | Only tables listed with `write` are writable outside the module's own code. |
| `tables.*.columns` | Column names and coarse kind (`text` or `other`), with an optional privacy class: `personal`, `confidential` or `secret`. Column classes apply to any kind; text columns without a class produce a warning from `checkModuleContract`, not a load error. Declare actual table columns so hosts can use the metadata for masked sandboxes. |
| `effect` | The command boundary's effect: `read`, `configure`, `createArtifact`, `submit`, `controlRun`. |
| `ai` | How the AI console may do it for the person: `auto`, `confirm`, `never`. Undeclared: `confirm` for public items, `never` for private ones. |
| `routines[].needs` | Exactly what the routine may do; approved by an owner or admin on activation. |
| `access.events.*.notification` | User-facing event kind, severity and payload shape. The event's `subscribe` roles govern who may attach automation to it. |
| `ui.displayName` | Optional human-readable module name used by the host when it labels module-owned items. |
| `ui.screens` / `ui.navLinks` | Screens and cross-group navigation links contributed to the host's common shell menu groups (`navGroup`), filtered by `requiredCapabilities`. Screen routes may contain whole-segment `:name` parameters; parameterized screens are routable but hidden from navigation and command search. `hidden: true` hides a fixed screen from those lists too. |
| `ui.slots.{homeCards,settingsCards,reviewCards}` | Cards contributed to the host's Home dashboard, Settings page, and Review queue, filtered by `requiredCapabilities`. |

Anything not declared is readable by `owner` only and writable by nobody but the module's own code.
Public views are readable by `viewer` and `member` unless the module narrows them. A `viewer` can
never be given a write, a mutating command or a routine run.

API keys may hold a system role and module roles directly, always capped by the rights of the
person who created the key.

## Host obligations (conformance)

1. **Module to module only through public items**, with the caller's grants. Never another module's
   private commands or tables; dependencies authorize nothing.
2. **The AI console acts as the signed-in person** and never has more rights. The console mode caps
   it: Ask/Diagnose read only, Operate within grants and `ai`, Develop only in a sandbox.
3. **The console may read module databases** the person may read: read-only, logged, never secrets
   (password hashes, sessions, tokens, credentials).
4. `ai: auto` is accepted only for `read`, `configure` and `createArtifact`, which stay inside the
   workspace and can be reviewed or undone; `submit` (sends or files something outside) and
   `controlRun` always ask. A private item is never available to the AI (`ai: never`).
5. **A module grants only on its own resources** and cannot widen host rules.
6. **Routines run with exactly their approved `needs`**; a changed `needs` or a lost approver
   suspends the routine until approved again.
7. **Development changes only modules you own.** Another module may be forked when its license
   allows and its source is available; the fork gets its own id and records its origin.
8. **Production changes only through promotion** (sandbox tests, rehearsal on a production copy,
   release with a restore point and an owner's approval). Review shows public-contract and access
   changes; loosening access needs explicit approval.

## What `checkModuleContract` enforces

| Rule | Issue code |
|---|---|
| Shape: ids, versions, `visibility` (default `private`), no unknown fields, bounded JSON | `schema` |
| Commands, tables, events, routines, screens, links and cards carry the module's own id prefix; views use `<module>.` or `<module>_v<N>.` | `prefix` |
| Who-lists name only `member`, `viewer` and the module's own declared roles as `<module>.<role>`; never `owner` or `admin`, never another module's role | `system_role`, `unknown_role`, `foreign_role` |
| A `viewer` is never listed for a command that changes state, a table `write`, or a routine `run` | `viewer_write` |
| `ai: auto` only for `read`, `configure`, `createArtifact`; a private item may only say `ai: never` | `ai_level`, `private_ai` |
| Library package names are unique, and each package has a semantic version, content digest, license and source availability; base module ids and version ranges are valid and unique | `schema`, `duplicate`, `dependency` |
| Table column names and `kind` values are valid; a text column without `classification` is returned in `warnings` and does not fail the contract | schema error / `unclassified_text_column` warning |
| Preset names are valid, permissions are unique and every preset permission is declared by the module | `schema`, `duplicate`, `system_role_preset` |
| Routine `needs` use `<id>:call`, `<id>:read`, `<table>:write` (own tables only), `connection:<id>:use` or `net:<host>`, without repeats | `need`, `duplicate` |
| Screens do not take host routes (`/admin`, `/api`, `/extensions`, `/login`, `/review`, `/settings`, `/v1`); screens, links and cards require only the module's own `<module>:` capabilities; UI ids are unique | `route`, `capability`, `duplicate` |
| `docs.context` is a relative path inside the module | `docs_path` |
| A fork has its own `x_` id, records its origin (module, version, `sha256:` digest, license) and only comes from a module whose source is `available` and whose license is not closed | `provenance` |

`writableTables(contract)` returns the tables that list `write` and who may write; `effectiveAiLevel`
applies the default `ai` for an item; `canForkModule` is the fork test.

## Registry descriptors and package rollback

The module registry, rather than the module publisher, owns the release descriptor. The generated
`registry-descriptor.schema.json` and `signed-registry-descriptor.schema.json` describe these
records. A descriptor contains the module id and version, immutable package digest, `stable` or
`beta` channel, contract version, required Core version range, dependencies, and the migration steps
in that package. Its `state` is `listed`, `unlisted` or `yanked`. Unlisted and yanked versions carry
a reason; a yanked version also names its replacement version. A listed version cannot carry a
state reason or replacement.

The registry signs canonical JSON for the `descriptor` with Ed25519 and a registry signing key that
is separate from the licence key:

```json
{
  "descriptor": {
    "moduleId": "x_shop",
    "version": "1.2.1",
    "packageDigest": "sha256:1111111111111111111111111111111111111111111111111111111111111111",
    "channel": "stable",
    "state": "listed",
    "contractVersion": "0.1.0-alpha.10",
    "requiredCoreRange": "^0.1.0",
    "dependencies": [{ "moduleId": "platform", "versionRange": "^1.0.0" }],
    "migrationSteps": ["0001_create_orders.sql"]
  },
  "signature": { "algorithm": "Ed25519", "keyId": "registry-2026-01", "value": "<base64>" }
}
```

`checkRegistryDescriptor` validates structure, state fields, version ranges, dependencies and unique
migration steps. `isPackageOnlyRollback(current, target)` returns true only when every migration
step in the current version is already present in the target version; package-only rollback then
changes code without reversing database migrations.

Keep migrations additive: **expand now, contract in a later release**. Add new tables or nullable
columns first, deploy code that can work with both shapes, and remove an old column only in a later
release after no supported package needs it. Bug-fix releases that add no migrations stay
package-only reversible. A rollback that would remove data-bearing schema requires a previewed
pre-release restore.

A host that has not adopted the contract yet may treat undeclared visibility as `public` while
modules migrate (core does, and offers a stricter authoring check); the contract itself defaults to
`private`.

## Documentation is generated from the contract

The host generates JSON Schema / OpenAPI for public commands, catalogs for public views and events,
and a readable summary of roles and access, and serves an `llms.txt` (Markdown) per module plus an
index. The module adds `docs/context.md` and optionally `AGENTS.md`. IDE formats such as `.mdc` are
exports, not sources.

## Author checklist for a new module

1. Decide what `member` and `viewer` may do on each command, view, table and event; add module
   roles only where the system roles are not enough. Keep the public set small and stable.
2. Declare each command's effect and, where needed, a stricter `ai`.
3. For each table, describe its columns and classify text or sensitive fields as `personal`,
   `confidential` or `secret`; resolve all unclassified-text warnings before publishing.
4. List writable tables only where outside writes make sense.
5. Declare routines with the smallest `needs`.
6. Keep migrations additive so package-only rollback remains possible for later fixes.
7. Declare `license` and `source`; write `docs/context.md`.
