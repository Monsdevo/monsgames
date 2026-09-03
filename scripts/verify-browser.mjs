import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/bartu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage({ reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
for (const width of [320, 390, 700, 768, 1024, 1280, 1440, 1600]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const overflowing = await page.evaluate(() => [...document.querySelectorAll("body *")].filter(element => {
    const box = element.getBoundingClientRect();
    return box.width && (box.right > innerWidth + 1 || box.left < -1) && getComputedStyle(element).position !== "fixed" && !element.closest(".sr-only");
  }).map(element => `${element.tagName}.${element.className}`));
  const documentOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(documentOverflow, false, `Document overflows at ${width}px`);
  if (width >= 1280) {
    const actions = await page.locator(".follow").evaluateAll(links => links.map(link => ({
      fontSize: parseFloat(getComputedStyle(link).fontSize),
      unclipped: link.querySelector("span").getBoundingClientRect().right < link.querySelector(".arrow").getBoundingClientRect().left
    })));
    for (const action of actions) {
      assert.ok(action.fontSize >= 24, `Large action text at ${width}px`);
      assert.ok(action.unclipped, `Action text has room at ${width}px`);
    }
  }
  console.log(JSON.stringify({ width, documentOverflow, overflowing }));
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Menu", exact: true }).click();
assert.equal(await page.locator("#navigation").isVisible(), true);
await page.keyboard.press("Escape");
assert.equal(await page.locator("#navigation").isVisible(), false);
await page.getByRole("button", { name: "Menu", exact: true }).click();
await page.locator("#navigation").getByRole("link", { name: "Contact" }).click();
assert.equal(new URL(page.url()).hash, "#contact");
assert.equal(await page.locator("#navigation").isVisible(), false);
await page.locator("summary").click();
assert.equal(await page.locator("details").getAttribute("open"), "");
await page.getByRole("button", { name: "Mirrors", exact: true }).click();
assert.equal(await page.getByRole("button", { name: "Mirrors", exact: true }).getAttribute("aria-pressed"), "true");
assert.match(await page.locator("#counter-announcement").textContent(), /Sabotage mirrors/);
const links = await page.locator('a[href^="#"]').evaluateAll(anchors => anchors.map(anchor => anchor.getAttribute("href")).filter(href => !document.querySelector(href)));
assert.deepEqual(links, []);
assert.deepEqual(errors, []);
const noScript = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
await noScript.goto("http://127.0.0.1:4174/");
assert.equal(await noScript.locator("#navigation").isVisible(), true);
assert.equal(await noScript.locator("#contact a").isVisible(), true);
console.log("PASS: navigation, keyboard dismissal, contact anchor, disclosure, role pairing, asset loading and no-JavaScript navigation.");
await browser.close();
