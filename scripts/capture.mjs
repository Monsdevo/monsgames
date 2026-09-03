import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/bartu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const [url, output, width="1672", height="941", full="false"] = process.argv.slice(2);
await mkdir(dirname(output), { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage({ viewport: {width: +width, height: +height}, deviceScaleFactor: 1, reducedMotion: "reduce" });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => {
  await Promise.all([...document.images].map(image => {
    image.loading = "eager";
    return image.decode().catch(() => {});
  }));
});
await page.screenshot({ path: output, fullPage: full === "true", animations: "disabled" });
console.log(JSON.stringify({url,width:+width,height:+height,output,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));
await browser.close();
