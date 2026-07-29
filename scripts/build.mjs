import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
if (relative(root, dist) !== "dist") throw new Error("Refusing to build outside the project dist directory.");

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "client", "assets"), { recursive: true });
await mkdir(resolve(dist, "server"), { recursive: true });

for (const file of ["index.html", "portfolio.css", "portfolio.js", "CNAME", "app-ads.txt", "privacy.html", "privacy-policy.html"]) {
  await cp(resolve(root, file), resolve(dist, "client", file));
}
for (const file of ["bad-haunts-logo.png", "mons-games-mark.png", "mons-games-social.png"]) {
  await cp(resolve(root, "assets", file), resolve(dist, "client", "assets", file));
}

const worker = `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") url.pathname = "/index.html";
    let response = await env.ASSETS.fetch(new Request(url, request));
    if (response.status === 404 && !url.pathname.split("/").pop().includes(".")) {
      url.pathname = "/index.html";
      response = await env.ASSETS.fetch(new Request(url, request));
    }
    return response;
  }
};\n`;
await writeFile(resolve(dist, "server", "index.js"), worker, "utf8");

const html = await readFile(resolve(dist, "client", "index.html"), "utf8");
for (const asset of ["portfolio.css", "portfolio.js", "assets/bad-haunts-logo.png", "assets/mons-games-mark.png", "assets/mons-games-social.png"]) {
  if (!html.includes(asset)) throw new Error(`Built HTML is missing ${asset}`);
}
console.log("Mons Games production build is ready.");

