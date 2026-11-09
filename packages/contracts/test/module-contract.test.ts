import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  RegistryDescriptorSchema,
  SignedRegistryDescriptorSchema,
  canForkModule,
  checkModuleContract,
  checkDependencyLayers,
  checkRegistryDescriptor,
  effectiveAiLevel,
  isPackageOnlyRollback,
  isAllowedOpenSourceSpdxLicense,
  ALLOWED_OPEN_SOURCE_SPDX_LICENSES,
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

test("direct-install SPDX validator accepts allowed licences, aliases, and combinations", () => {
  assert.equal(ALLOWED_OPEN_SOURCE_SPDX_LICENSES.length, 17);
  for (const license of ALLOWED_OPEN_SOURCE_SPDX_LICENSES)
    assert.equal(isAllowedOpenSourceSpdxLicense(license), true, license);
  for (const alias of ["LGPL-2.1", "LGPL-3.0", "GPL-2.0", "GPL-3.0", "AGPL-3.0"])
    assert.equal(isAllowedOpenSourceSpdxLicense(alias), true, alias);
  assert.equal(isAllowedOpenSourceSpdxLicense("MIT OR Apache-2.0"), true);
  assert.equal(isAllowedOpenSourceSpdxLicense("(MIT AND BSD-3-Clause) OR ISC"), true);
});

test("direct-install SPDX validator rejects unknown, custom, malformed and WITH licences", () => {
  for (const license of [
    "",
    "UNLICENSED",
    "BSL-1.1",
    "MIT WITH LLVM-exception",
    "MIT OR Proprietary",
    "MIT AND",
    "MIT OR OR ISC",
    "(MIT OR ISC",
    "MIT ISC",
  ])
    assert.equal(isAllowedOpenSourceSpdxLicense(license), false, license);
});

test("the reference declaration is valid and keeps its public/private split", () => {
  const result = checkModuleContract(valid());
  assert.deepEqual(result.issues, []);
  assert.equal(result.valid, true);
  const contract = parseModuleContract(valid());
  assert.equal(contract.access.commands["x_shop.order.purge"]?.visibility, "private");
  assert.equal(contract.ui?.slots.homeCards[0]?.id, "x_shop.home.orders");
  assert.equal(contract.ui?.displayName, "Shop");
  assert.deepEqual(contract.ui?.screens[1], {
    id: "x_shop.order-detail",
    route: "/shop/orders/:id",
    title: "Order detail",
    hidden: true,
    requiredCapabilities: ["x_shop:read"],
  });
  assert.equal(contract.layer, "business");
  assert.deepEqual(contract.depends, []);
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
  assert.equal(c.layer, "business", "business is the default layer");
});

test("only tables that list write are writable outside the module; [] means owner only", () => {
  const c = parseModuleContract(valid());
  assert.deepEqual(writableTables(c), { "x_shop.orders": ["x_shop.editor"] });
  const m = valid();
  m.access.tables["x_shop.log"].write = [];
  assert.deepEqual(writableTables(parseModuleContract(m))["x_shop.log"], []);
});

test("column privacy metadata is validated and unclassified text produces warnings", () => {
  const contract = checkModuleContract(valid());
  assert.equal(contract.valid, true);
  assert.deepEqual(contract.warnings, []);

  const unclassified = checkModuleContract(load("module-contract-unclassified-text.json"));
  assert.equal(
    unclassified.valid,
    true,
    "classification omissions are warnings, not load failures",
  );
  assert.deepEqual(
    unclassified.warnings.map(({ path, code }) => ({ path, code })),
    [
      {
        path: "access.tables.x_text.contacts.columns.email.classification",
        code: "unclassified_text_column",
      },
    ],
  );

  assert.ok(
    codes(
      problems(
        (m) =>
          (m.access.tables["x_shop.orders"].columns.email = {
            kind: "text",
            classification: "medical",
          }),
      ),
    ).includes("schema"),
  );
  assert.ok(
    codes(
      problems(
        (m) =>
          (m.access.tables["x_shop.orders"].columns.Email = {
            kind: "text",
            classification: "personal",
          }),
      ),
    ).includes("schema"),
  );
  assert.ok(
    codes(
      problems(
        (m) =>
          (m.access.tables["x_shop.orders"].columns.email = {
            kind: "text",
            classification: "personal",
            source: "foreign_table",
          }),
      ),
    ).includes("schema"),
  );
});

test("registry descriptors validate listed, unlisted and yanked signed fixtures", () => {
  for (const name of [
    "registry-descriptor-listed.json",
    "registry-descriptor-unlisted.json",
    "registry-descriptor-yanked.json",
    "registry-descriptor-pack.json",
    "registry-descriptor-library.json",
  ]) {
    const fixture = load(name);
    assert.equal(SignedRegistryDescriptorSchema.safeParse(fixture).success, true, name);
    assert.equal(checkRegistryDescriptor(fixture.descriptor).valid, true, name);
  }

  const listed = load("registry-descriptor-listed.json");
  assert.equal(RegistryDescriptorSchema.safeParse(listed.descriptor).success, true);
  assert.equal(
    SignedRegistryDescriptorSchema.safeParse({
      ...listed,
      signature: { ...listed.signature, value: "bad" },
    }).success,
    false,
  );
});

test("registry descriptor state, dependency and migration invariants are checked", () => {
  const descriptor = load("registry-descriptor-listed.json").descriptor;
  const check = (change: (value: any) => void) => {
    const value = structuredClone(descriptor);
    change(value);
    return checkRegistryDescriptor(value);
  };
  assert.equal(check((value) => (value.reason = "unexpected on listed version")).valid, false);
  assert.equal(
    check((value) => (value.state = "unlisted")).valid,
    false,
    "unlisted needs a reason",
  );
  assert.equal(
    check((value) => {
      value.state = "yanked";
      value.reason = "unsafe release";
    }).valid,
    false,
    "yanked needs a replacement",
  );
  assert.equal(check((value) => (value.requiredCoreRange = "after lunch")).valid, false);
  assert.equal(
    check((value) => value.dependencies.push({ ...value.dependencies[0] })).valid,
    false,
  );
  assert.equal(check((value) => value.migrationSteps.push(value.migrationSteps[0])).valid, false);
});

test("package-only rollback requires every current migration to exist in the target", () => {
  assert.equal(
    isPackageOnlyRollback(
      { migrationSteps: ["0001_create_orders.sql", "0002_add_notes.sql"] },
      { migrationSteps: ["0001_create_orders.sql", "0002_add_notes.sql", "0003_add_index.sql"] },
    ),
    true,
  );
  assert.equal(
    isPackageOnlyRollback(
      { migrationSteps: ["0001_create_orders.sql", "0002_add_notes.sql"] },
      { migrationSteps: ["0001_create_orders.sql"] },
    ),
    false,
  );
  assert.equal(isPackageOnlyRollback({ migrationSteps: [] }, { migrationSteps: [] }), true);
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
  assert.deepEqual(needs(["provider:mail.send", "provider:message.send"]), []);
  assert.ok(codes(needs(["provider:Mail.send"])).includes("need"));
});

test("module layer declarations constrain local dependency and extension shapes", () => {
  const layerIssues = (change: (m: any) => void) =>
    problems(change).filter((issue) => issue.code === "layer");
  assert.equal(
    layerIssues((m) => {
      m.layer = "service";
      m.depends = ["mailer@^1.0.0"];
    }).length,
    1,
    "services cannot declare dependencies",
  );
  assert.equal(
    layerIssues((m) => {
      m.layer = "bridge";
      m.extends = "core@^1.0.0";
    }).length,
    1,
    "bridges cannot extend modules",
  );
  assert.ok(
    codes(
      problems((m) => {
        m.extends = "core@^1.0.0";
        m.depends = ["core@~1.0.0"];
      }),
    ).includes("duplicate"),
  );
  assert.ok(codes(problems((m) => (m.extends = "x_shop@^1.0.0"))).includes("dependency"));
  assert.ok(codes(problems((m) => (m.extends = "core"))).includes("dependency"));
  assert.deepEqual(
    problems((m) => (m.extends = "core@^1.0.0")),
    [],
  );
});

test("shared package-layer fixtures cover valid and invalid dependency graphs", () => {
  const fixture = load("dependency-layers.json");
  for (const item of fixture.cases) {
    const result = checkDependencyLayers(item.descriptor, item.dependencyDescriptors);
    assert.equal(
      result.valid,
      item.expectedValid,
      `${item.name}: ${JSON.stringify(result.issues)}`,
    );
  }
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
  assert.deepEqual(
    ui((m) => (m.ui.screens[0].route = "/shop/products/:id")),
    [],
  );
  assert.ok(ui((m) => (m.ui.screens[0].route = "/shop/orders/:id/:id")).includes("route"));
  assert.ok(ui((m) => (m.ui.screens[0].route = "/shop/orders/:")).includes("route"));
  assert.ok(
    ui((m) =>
      m.ui.screens.push({
        id: "x_shop.order-copy",
        route: "/shop/orders/:orderId",
        title: "Another order detail",
        requiredCapabilities: ["x_shop:read"],
      }),
    ).includes("duplicate"),
  );
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
