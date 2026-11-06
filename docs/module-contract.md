# Module contract: public API, roles and access — draft

Status: **draft for review**, not an executable contract yet. Like the other drafts in this folder,
the names below are proposals until they have a schema, fixtures and host conformance tests.

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
  "access": {
    "roles": {
      "editor": { "title": "Orders editor", "description": "Create, edit and cancel orders" }
    },
    "commands": {
      "x_shop.order.create": { "visibility": "public",  "effect": "correctable",  "call": ["member"],        "ai": "confirm" },
      "x_shop.order.cancel": { "visibility": "public",  "effect": "correctable",  "call": ["x_shop.editor"], "ai": "confirm" },
      "x_shop.order.purge":  { "visibility": "private", "effect": "irreversible", "call": [],                "ai": "never" }
    },
    "views":  { "x_shop_v1.orders": { "visibility": "public", "read": ["viewer", "member"] } },
    "tables": {
      "x_shop.orders": { "read": ["member"], "write": ["x_shop.editor"], "ai": "confirm" },
      "x_shop.log":    { "read": [] }
    },
    "events": { "x_shop.order.created": { "visibility": "public", "subscribe": ["member"] } }
  },
  "routines": [
    {
      "id": "x_shop.sync_orders",
      "run": ["member"],
      "needs": ["x_shop.orders:write", "connection:shop-api:use", "net:api.shop.example"]
    }
  ],
  "docs": { "context": "docs/context.md" }
}
```

| Field | Meaning |
|---|---|
| `access.roles` | Optional module roles; the host namespaces them (`x_shop.editor`). |
| `visibility` | `public` items are the module's versioned contract; `private` (default) are internal. |
| `call` / `read` / `write` / `subscribe` | Which system roles (`member`, `viewer`) and module roles may do it. `owner` always may; `[]` means owner only. |
| `tables.*.write` | Only tables listed with `write` are writable outside the module's own code. |
| `ai` | How the AI console may do it for the person: `auto`, `confirm`, `never`. |
| `routines[].needs` | Exactly what the routine may do; approved by an owner or admin on activation. |

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
4. `ai: auto` is accepted only for correctable effects; irreversible and external effects always ask.
5. **A module grants only on its own resources** and cannot widen host rules.
6. **Routines run with exactly their approved `needs`**; a changed `needs` or a lost approver
   suspends the routine until approved again.
7. **Development changes only modules you own.** Another module may be forked when its license
   allows and its source is available; the fork gets its own id and records its origin.
8. **Production changes only through promotion** (sandbox tests, rehearsal on a production copy,
   release with a restore point and an owner's approval). Review shows public-contract and access
   changes; loosening access needs explicit approval.

## Documentation is generated from the contract

The host generates JSON Schema / OpenAPI for public commands, catalogs for public views and events,
and a readable summary of roles and access, and serves an `llms.txt` (Markdown) per module plus an
index. The module adds `docs/context.md` and optionally `AGENTS.md`. IDE formats such as `.mdc` are
exports, not sources.

## Author checklist for a new module

1. Decide what `member` and `viewer` may do on each command, view, table and event; add module
   roles only where the system roles are not enough. Keep the public set small and stable.
2. Declare each command's effect and, where needed, a stricter `ai`.
3. List writable tables only where outside writes make sense.
4. Declare routines with the smallest `needs`.
5. Declare `license` and `source`; write `docs/context.md`.
