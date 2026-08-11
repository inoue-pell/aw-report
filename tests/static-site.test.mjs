import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const catalogSource = readFileSync(
  new URL("../aw_product_catalog.js", import.meta.url),
  "utf8",
);

test("static entrypoint keeps the expected report identity and catalog order", () => {
  assert.match(html, /<title>AW注文×キャンペーン利用レポート<\/title>/u);
  const catalogIndex = html.indexOf('<script src="aw_product_catalog.js"></script>');
  const applicationIndex = html.indexOf("<script>", catalogIndex + 1);
  assert.ok(catalogIndex > 0);
  assert.ok(applicationIndex > catalogIndex);
  assert.doesNotMatch(html, /<form\b[^>]*\baction\s*=/iu);
});

test("browser application scripts are syntactically valid", () => {
  const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/giu)]
    .map((match) => match[1])
    .filter((source) => source.trim() !== "");
  assert.ok(inlineScripts.length >= 1);
  for (const source of inlineScripts) {
    assert.doesNotThrow(() => new Function(source));
  }
});

test("catalog is valid JavaScript with usable public product metadata", () => {
  const sandbox = { window: {} };
  vm.runInNewContext(catalogSource, sandbox, { timeout: 1000 });
  const catalog = sandbox.window.AW_PRODUCT_CATALOG;
  assert.equal(typeof catalog, "object");
  assert.ok(Object.keys(catalog).length >= 100);
  for (const [sku, product] of Object.entries(catalog)) {
    assert.match(sku, /^[A-Za-z0-9-]+$/u);
    assert.equal(typeof product.name, "string");
    assert.match(product.price, /^¥[0-9,]+$/u);
    assert.match(product.imageUrl, /^https:\/\/walking\.asics\.com\//u);
  }
});

test("uploaded business data has no browser-to-server write path", () => {
  assert.doesNotMatch(html, /XMLHttpRequest|WebSocket|sendBeacon/iu);
  assert.doesNotMatch(
    html,
    /fetch\s*\([^)]*,\s*\{[\s\S]{0,400}?method\s*:\s*["'](?:POST|PUT|PATCH|DELETE)["']/iu,
  );
  assert.match(html, /fetch\(url,\s*\{\s*credentials:\s*"omit"\s*\}\)/u);
});
