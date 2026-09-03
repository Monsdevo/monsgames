import { cp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
if (relative(root, dist) !== "dist") throw new Error("Refusing to build outside the project dist directory.");
await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "client", "assets"), { recursive: true });
await mkdir(resolve(dist, "server"), { recursive: true });
for (const file of ["index.html", "portfolio.css", "portfolio.js", "CNAME", "app-ads.txt", "privacy.html", "privacy-policy.html"]) await cp(resolve(root, file), resolve(dist, "client", file));
for (const file of ["bad-haunts-logo.png", "mons-games-mark.png", "mons-games-social.png"]) await cp(resolve(root, "assets", file), resolve(dist, "client", "assets", file));
// Public allow-list keeps experiments, source, archives and design briefs private.
for (const directory of ["plates", "fonts"]) {
  const source = resolve(root, "assets", directory);
  await mkdir(resolve(dist, "client", "assets", directory), { recursive: true });
  for (const file of await readdir(source)) if (/\.(?:webp|png|woff2|txt)$/i.test(file)) await cp(resolve(source, file), resolve(dist, "client", "assets", directory, file));
}
await cp(resolve(root, "scripts", "worker.mjs"), resolve(dist, "server", "index.js"));
const html = await readFile(resolve(dist, "client", "index.html"), "utf8");
for (const asset of ["portfolio.css", "portfolio.js", "assets/bad-haunts-logo.png", "assets/mons-games-mark.png", "assets/mons-games-social.png"]) if (!html.includes(asset)) throw new Error("Built HTML is missing " + asset);
console.log("Mons Games production build is ready.");
