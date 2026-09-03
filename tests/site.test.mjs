import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import worker from "../scripts/worker.mjs";
test("retired calendar cannot be retrieved by URL or asset path", async () => {
  const paths = ["/mustafi-takvimi", "/mustafi-takvimi/", "/mustafi-takvimi/index.html", "/mustafi-takvimi/app.js", "/mustafi-takvimi/lib/event-store.js", "/MUSTAFI-TAKVIMI/", "//mustafi-takvimi//index.html", "/%6dustafi-takvimi", "/mustafi-takvimi%2Findex.html", "/mustafi-takvimi%252Findex.html", "/mustafi-takvimi.html", "/mustafi-takvimi/?x=1"];
  for (const path of paths) {
    let assetCalled = false;
    const response = await worker.fetch(new Request("https://monsgames.net" + path), { ASSETS: { fetch() { assetCalled = true; return new Response("stale content"); } } });
    assert.equal(response.status, 410, path); assert.equal(assetCalled, false, path);
    assert.match(response.headers.get("X-Robots-Tag"), /noindex/);
  }
});
test("root maps to index, unknown routes remain 404", async () => {
  const seen = [];
  const env = { ASSETS: { fetch(request) { seen.push(new URL(request.url).pathname); return new Response("", { status: seen.at(-1) === "/index.html" ? 200 : 404 }); } } };
  assert.equal((await worker.fetch(new Request("https://monsgames.net/"), env)).status, 200);
  assert.equal((await worker.fetch(new Request("https://monsgames.net/unknown"), env)).status, 404);
  assert.deepEqual(seen, ["/index.html", "/unknown"]);
});
test("build excludes retired content and private project files", async () => {
  const files = await readdir(new URL("../dist/client/", import.meta.url), { recursive: true });
  assert.equal(files.some(file => /mustafi|\.impeccable|\.git|PRODUCT|\.mjs|\.json/i.test(file)), false);
});
test("homepage preserves contact, brands and social destinations", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const text of ["assets/bad-haunts-logo.png", "assets/mons-games-mark.png", "mailto:monsgemas@gmail.com", "https://www.instagram.com/badhaunts/", "https://www.youtube.com/@badhaunts"]) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /mustafi|expected after|Approved screenshots.*will live here/i);
});
test("GitHub Pages excludes development files and has no retired calendar source", async () => {
  const config = await readFile(new URL("../_config.yml", import.meta.url), "utf8");
  const excluded = config.split(/\r?\n/).map(line => line.match(/^  - (.+)$/)?.[1]).filter(Boolean);
  for (const path of ["DESIGN.md", "PRODUCT.md", "scripts", "tests", ".impeccable", ".openai", "mustafi-takvimi", "assets/plates/human-page.webp.json", "assets/plates/haunt-page.webp.json"]) assert.ok(excluded.includes(path), path);
  for (const path of [".nojekyll", "mustafi-takvimi/index.html", "mustafi-takvimi/app.js"]) {
    await assert.rejects(access(new URL("../" + path, import.meta.url)), { code: "ENOENT" });
  }
  assert.equal((await readFile(new URL("../CNAME", import.meta.url), "utf8")).trim(), "monsgames.net");
});
