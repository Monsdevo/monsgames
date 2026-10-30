// Retired routes must never fall through to a homepage or stale asset.
export function isRetiredPath(pathname) {
  let decoded = pathname;
  for (let i = 0; i < 5; i += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch { break; }
  }
  const normalized = decoded.replaceAll("\\", "/").replace(/\/{2,}/g, "/").toLowerCase();
  return /^\/mustafi-takvimi(?:[/.;]|$)/.test(normalized);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (isRetiredPath(url.pathname)) return new Response("This page has been permanently removed.", {
      status: 410, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" }
    });
    if (!["GET", "HEAD"].includes(request.method)) return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    if (url.pathname === "/") url.pathname = "/index.html";
    if (["/privacy", "/privacy-policy"].includes(url.pathname)) url.pathname += ".html";
    const response = await env.ASSETS.fetch(new Request(url, request));
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    if (url.pathname.endsWith(".html")) headers.set("Cache-Control", "no-cache");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
