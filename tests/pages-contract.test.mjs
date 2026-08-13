import assert from "node:assert/strict";
import { lstatSync, readFileSync } from "node:fs";
import test from "node:test";

const readJson = (path) => JSON.parse(
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8"),
);
const readText = (path) => readFileSync(
  new URL(`../${path}`, import.meta.url),
  "utf8",
);

test("app profile binds one public GitHub Pages target", () => {
  const profile = readJson(".ai-work/app-profile.json");
  assert.equal(profile.schemaVersion, 3);
  assert.equal(profile.appId, "aw-report");
  assert.equal(profile.projectId, "asics");
  assert.deepEqual(profile.providers, ["claude", "codex"]);
  assert.deepEqual(profile.repository, {
    changeStrategy: "pull_request",
    defaultBranch: "main",
    remote: "inoue-pell/aw-report",
  });
  assert.equal(profile.releaseTargets.length, 1);
  assert.deepEqual(profile.releaseTargets[0], {
    adapter: "aw-report-github-pages-release-v1",
    automaticPolicy: null,
    ciWorkflow: ".github/workflows/ci.yml",
    environment: "production-pages",
    externalService: { visibility: "public" },
    healthChecks: ["pages-release-binding", "public-static-assets"],
    kind: "external_service",
    macLocal: null,
    publicationMode: "manual_confirmation",
    rollback: {
      adapter: "aw-report-github-pages-rollback-v1",
      requiredEvidence: ["commit", "deployment-id", "health-result"],
    },
    targetId: "public-pages",
  });
  assert.ok(profile.workspace.forbiddenPaths.includes(".github"));
  assert.ok(profile.workspace.forbiddenPaths.includes(".ai-work"));
});

test("verification registry runs only fixed dependency-free tests", () => {
  const registry = readJson(".ai-work/verification-adapters.json");
  assert.equal(registry.schemaVersion, 3);
  assert.deepEqual(Object.keys(registry.adapters).sort(), [
    "pages-contract-tests",
    "static-site-tests",
  ]);
  for (const adapter of Object.values(registry.adapters)) {
    assert.equal(adapter.kind, "node_test");
    assert.equal(adapter.importer, "node:fs");
    assert.equal(adapter.network, "none");
    assert.deepEqual(adapter.generatedPaths, []);
    assert.equal(adapter.files.length, 1);
  }
});

test("Pages manifest exposes only the two application assets", () => {
  const manifest = readJson("pages-manifest.json");
  assert.deepEqual(manifest, {
    schemaVersion: 1,
    paths: ["index.html", "aw_product_catalog.js"],
  });
  for (const relative of manifest.paths) {
    const stat = lstatSync(new URL(`../${relative}`, import.meta.url));
    assert.equal(stat.isFile(), true);
    assert.equal(stat.isSymbolicLink(), false);
  }
});

test("CI and Pages workflow use immutable official action commits", () => {
  const ci = readText(".github/workflows/ci.yml");
  const deployment = readText(".github/workflows/deploy-pages.yml");
  const pinnedActions = [
    "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
    "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
    "actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d",
    "actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9",
    "actions/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128",
  ];
  for (const action of pinnedActions) {
    assert.ok(`${ci}\n${deployment}`.includes(action), action);
  }
  assert.match(ci, /pull_request:/u);
  assert.doesNotMatch(ci, /^\s{2}push:/mu);
  assert.match(deployment, /workflow_dispatch:/u);
  assert.doesNotMatch(deployment, /^\s{2}push:/mu);
  assert.match(deployment, /persist-credentials:\s*false/gu);
  assert.doesNotMatch(deployment, /npm\s+(?:run|exec)|npx|pnpm|yarn/iu);
});

test("deployment workflow creates a commit marker in one static artifact", () => {
  const deployment = readText(".github/workflows/deploy-pages.yml");
  assert.match(deployment, /release\.json/u);
  assert.match(deployment, /schemaVersion:\s*1,\s*appId,\s*commit/u);
  assert.match(deployment, /Symlinks are not publishable/u);
  assert.match(deployment, /path:\s*_site/u);
  assert.match(deployment, /AI-Work Pages \$\{\{ inputs\.release_id \}\} \$\{\{ inputs\.release_commit \}\}/u);
});
