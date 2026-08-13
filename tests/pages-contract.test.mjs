import assert from "node:assert/strict";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import test from "node:test";

const readJson = (path) => JSON.parse(
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8"),
);
const readText = (path) => readFileSync(
  new URL(`../${path}`, import.meta.url),
  "utf8",
);

test("legacy common release profile stays retired", () => {
  assert.equal(existsSync(new URL("../.ai-work/app-profile.json", import.meta.url)), false);
  assert.equal(existsSync(new URL("../.ai-work/verification-adapters.json", import.meta.url)), false);
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
  assert.match(deployment, /^\s{2}push:/mu);
  assert.match(deployment, /branches:\s*\n\s*- main/u);
  assert.match(deployment, /persist-credentials:\s*false/gu);
  assert.doesNotMatch(deployment, /npm\s+(?:run|exec)|npx|pnpm|yarn/iu);
});

test("deployment workflow creates a commit marker in one static artifact", () => {
  const deployment = readText(".github/workflows/deploy-pages.yml");
  assert.match(deployment, /release\.json/u);
  assert.match(deployment, /schemaVersion:\s*1,\s*appId,\s*commit/u);
  assert.match(deployment, /Symlinks are not publishable/u);
  assert.match(deployment, /path:\s*_site/u);
  assert.match(deployment, /Pages \$\{\{ github\.event_name == 'workflow_dispatch'/u);
  assert.doesNotMatch(deployment, /release_id/u);
});
