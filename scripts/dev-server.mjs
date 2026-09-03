import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import worker from "./worker.mjs";
const publicRoot = resolve("dist/client");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".txt": "text/plain" };
const env = { ASSETS: { async fetch(request) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url).pathname); } catch { return new Response("Bad request", { status: 400 }); }
  const file = resolve(publicRoot, "." + pathname);
  if (!file.startsWith(publicRoot + sep)) return new Response("Not found", { status: 404 });
  try {
    const content = await readFile(file);
    return new Response(request.method === "HEAD" ? null : content, { headers: { "Content-Type": types[extname(file)] || "application/octet-stream" } });
  } catch { return new Response("Not found", { status: 404 }); }
} } };
http.createServer(async (req, res) => {
  try {
    const request = new Request(new URL(req.url, "http://127.0.0.1:4174"), { method: req.method });
    const response = await worker.fetch(request, env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500); res.end("Unable to load page"); }
}).listen(4174, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4174/"));
