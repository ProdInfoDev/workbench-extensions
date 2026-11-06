import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  canForkModule,
  checkModuleContract,
  effectiveAiLevel,
  parseModuleContract,
  writableTables,
} from "../src/index.ts";

const load = (name: string) =>
  JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8"));
const valid = () => load("module-contract-valid.json");
/** Apply a change to the valid declaration and return the problems found. */
function problems(change: (m: any) => void) {
  const m = valid();
  change(m);
  return checkModuleContract(m).issues;
}
const codes = (issues: readonly { code: string }[]) => issues.map((i) => i.code);

test("the reference declaration is valid and keeps its public/private split", () => {
  const result = checkModuleContract(valid());
  assert.deepEqual(result.issues, []);
  assert.equal(result.valid, true);
  const contract = parseModuleContract(valid());
  assert.equal(contract.access.commands["x_shop.order.purge"]?.visibility, "private");
  assert.equal(contract.ui?.slots.homeCards[0]?.id, "x_shop.home.orders");
  assert.deepEqual(contract.depends, ["platform@^1.0.0"]);
  assert.equal(contract.libraries[0]?.name, "@prodinfo/ui");
  assert.deepEqual(Object.keys(contract.systemRolePresets?.member ?? {}), [
    "standard",
    "read-only",
  ]);
  assert.deepEqual(contract.systemRolePresets?.member.standard?.permissions, [
    "x_shop:read",
    "x_shop:write",
  ]);
});

test("a declaration with only identity is valid and closed by default", () => {
  const c = parseModuleContract({
    id: "x_min",
    version: "1.0.0",
    license: "MIT",
    source: "closed",
  });
  assert.deepEqual(c.access.commands, {});
  assert.deepEqual(writableTables(c), {});
  assert.equal(c.routines.length, 0);
});

test("only tables that list write are writable outside the module; [] means owner only", () => {
  const c = parseModuleContract(valid());
  assert.deepEqual(writableTables(c), { "x_shop.orders": ["x_shop.editor"] });
  const m = valid();
  m.access.tables["x_shop.log"].write = [];
  assert.deepEqual(writableTables(parseModuleContract(m))["x_shop.log"], []);
});

test("a viewer can never be given a write, a mutating command or a routine run", () => {
  assert.ok(
    codes(problems((m) => (m.access.commands["x_shop.order.create"].call = ["viewer"]))).includes(
      "viewer_write",
    ),
  );
  assert.ok(
    codes(problems((m) => (m.access.tables["x_shop.orders"].write = ["viewer"]))).includes(
      "viewer_write",
    ),
  );
  assert.ok(codes(problems((m) => (m.routines[0].run = ["viewer"]))).includes("viewer_write"));
  // Reading is fine for a viewer.
  assert.deepEqual(
    problems((m) => (m.access.tables["x_shop.orders"].read = ["viewer"])),
    [],
  );
});

test("who-lists accept member, viewer and the module's own declared roles only", () => {
  const bad = (list: string[]) =>
    codes(problems((m) => (m.access.commands["x_shop.order.create"].call = list)));
  assert.ok(bad(["owner"]).includes("system_role"));
  assert.ok(bad(["admin"]).includes("system_role"));
  assert.ok(bad(["x_shop.ghost"]).includes("unknown_role"));
  assert.ok(bad(["x_other.editor"]).includes("foreign_role"));
  assert.ok(bad(["editor"]).includes("unknown_role"), "bare module role names are not accepted");
  assert.ok(bad(["member", "member"]).includes("duplicate"));
  assert.deepEqual(bad(["member", "x_shop.editor"]), []);
});

test("names belong to the module", () => {
  assert.ok(
    codes(
      problems(
        (m) =>
          (m.access.commands["ar.invoice.create"] = {
            visibility: "public",
            effect: "configure",
            call: [],
          }),
      ),
    ).includes("prefix"),
  );
  assert.ok(codes(problems((m) => (m.access.tables["other.t"] = { read: [] }))).includes("prefix"));
  assert.ok(
    codes(
      problems((m) => (m.access.views["other_v1.orders"] = { visibility: "public", read: [] })),
    ).includes("prefix"),
  );
  assert.ok(codes(problems((m) => (m.routines[0].id = "other.sync"))).includes("prefix"));
});

test("AI handling: auto only for effects that stay in the workspace; private items are never AI", () => {
  const publish = problems((m) => (m.access.commands["x_shop.order.publish"].ai = "auto"));
  assert.ok(codes(publish).includes("ai_level"));
  const purge = problems((m) => (m.access.commands["x_shop.order.purge"].ai = "confirm"));
  assert.ok(codes(purge).includes("private_ai"));
  assert.equal(effectiveAiLevel({ visibility: "private" }), "never");
  assert.equal(effectiveAiLevel({ visibility: "public" }), "confirm");
  assert.equal(effectiveAiLevel({ visibility: "public", ai: "auto" }), "auto");
});

test("routine needs: known forms only, own tables for writes, no duplicates", () => {
  const needs = (list: string[]) => problems((m) => (m.routines[0].needs = list));
  assert.deepEqual(needs([]), []);
  assert.ok(codes(needs(["ar.invoice.table:write"])).includes("need"), "foreign table write");
  assert.ok(codes(needs(["do-anything"])).includes("need"));
  assert.ok(codes(needs(["net:Bad Host"])).includes("need"));
  assert.ok(codes(needs(["net:a.example", "net:a.example"])).includes("duplicate"));
  assert.deepEqual(needs(["x_shop.orders:read", "ar.invoice.create:call"]), []);
});

test("libraries are content-pinned and base module dependencies are well formed", () => {
  assert.ok(codes(problems((m) => (m.libraries[0].digest = "sha256:bad"))).includes("schema"));
  assert.ok(codes(problems((m) => m.libraries.push({ ...m.libraries[0] }))).includes("duplicate"));
  assert.ok(codes(problems((m) => (m.depends = ["x_shop@^1.0.0"]))).includes("dependency"));
  assert.ok(codes(problems((m) => (m.depends = ["core@not-semver"]))).includes("dependency"));
  assert.ok(
    codes(problems((m) => (m.depends = ["platform@^1.0.0", "platform@~1.0.0"]))).includes(
      "duplicate",
    ),
  );
});

test("named system role presets use declared permissions and preserve their names", () => {
  assert.ok(
    codes(
      problems((m) => (m.systemRolePresets.member.standard.permissions = ["x_shop:missing"])),
    ).includes("system_role_preset"),
  );
  assert.ok(
    codes(
      problems(
        (m) => (m.systemRolePresets.member.standard.permissions = ["x_shop:read", "x_shop:read"]),
      ),
    ).includes("duplicate"),
  );
  const result = checkModuleContract(valid());
  assert.equal(result.valid, true);
});

test("UI metadata: ids, routes and capabilities stay inside the module and off host routes", () => {
  const ui = (change: (m: any) => void) => codes(problems(change));
  assert.ok(ui((m) => (m.ui.screens[0].route = "/admin/users")).includes("route"));
  assert.ok(ui((m) => (m.ui.screens[0].route = "/v1/x")).includes("route"));
  assert.ok(ui((m) => (m.ui.screens[0].requiredCapabilities = ["ar:read"])).includes("capability"));
  assert.ok(ui((m) => (m.ui.slots.homeCards[0].id = "other.card")).includes("prefix"));
  assert.ok(ui((m) => (m.ui.navLinks[0].id = "x_shop.orders")).includes("duplicate"));
  // A nav link may point at another module's screen; only host routes are off limits.
  assert.deepEqual(
    ui((m) => (m.ui.navLinks[0].route = "/parties")),
    [],
  );
  assert.ok(ui((m) => (m.ui.screens[0].route = "no-slash")).includes("schema"));
});

test("docs path stays inside the module", () => {
  assert.ok(codes(problems((m) => (m.docs.context = "../secret.md"))).includes("docs_path"));
  assert.ok(codes(problems((m) => (m.docs.context = "/etc/passwd"))).includes("docs_path"));
});

test("forks: own x_ id, recorded origin, only from open source with an open license", () => {
  assert.deepEqual(checkModuleContract(load("module-contract-fork.json")).issues, []);
  const fork = (change: (m: any) => void) => {
    const m = load("module-contract-fork.json");
    change(m);
    return checkModuleContract(m);
  };
  assert.ok(codes(fork((m) => (m.id = "myshop")).issues).includes("provenance"));
  assert.ok(codes(fork((m) => (m.id = "x_shop")).issues).includes("provenance"));
  assert.ok(
    codes(fork((m) => (m.provenance.origin.license = "UNLICENSED")).issues).includes("provenance"),
  );
  assert.equal(
    fork((m) => (m.provenance.origin.source = "closed")).valid,
    false,
    "closed source cannot be forked",
  );
  assert.equal(fork((m) => (m.provenance.origin.digest = "abc")).valid, false);
  assert.equal(canForkModule({ license: "MIT", source: "available" }), true);
  assert.equal(canForkModule({ license: "Proprietary", source: "available" }), false);
  assert.equal(canForkModule({ license: "MIT", source: "closed" }), false);
});

test("unknown fields and unbounded input are refused", () => {
  assert.equal(checkModuleContract({ ...valid(), secret: 1 }).valid, false);
  assert.throws(() => parseModuleContract({ ...valid(), id: "Bad Id" }), /Invalid module contract/);
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  assert.throws(() => checkModuleContract(cycle));
});
