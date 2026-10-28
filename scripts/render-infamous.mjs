import { readFile, writeFile, mkdir } from "node:fs/promises";
import { captures, updates } from "./infamous2-content.mjs";

const escape = value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

export async function renderInfamousPage() {
  let html = await readFile(new URL("./templates/infamous2-ios.html", import.meta.url), "utf8");
  const gallery = captures.map((capture, index) => {
    const file = escape(capture.file);
    return `<figure class="capture${capture.featured ? " capture--wide" : ""}">
          <a class="capture-link" href="/assets/infamous2-ios/${file}.png" data-capture aria-label="Open full-size: ${escape(capture.title)}">
            <img src="/assets/infamous2-ios/${file}.webp" srcset="/assets/infamous2-ios/${file}-small.webp 800w, /assets/infamous2-ios/${file}.webp 1600w" sizes="(max-width: 700px) calc(100vw - 40px), ${capture.featured ? "(max-width: 1440px) calc(100vw - 112px), 1328px" : "(max-width: 1440px) calc(50vw - 68px), 652px"}" width="1600" height="900" loading="lazy" decoding="async" alt="${escape(capture.alt)}">
            <span class="capture-open" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg></span>
          </a>
          <figcaption><div><h3>${escape(capture.title)}</h3><span class="capture-label">${escape(capture.label)}</span></div><span class="capture-index" aria-hidden="true">${String(index + 1).padStart(2, "0")} / ${String(captures.length).padStart(2, "0")}</span></figcaption>
        </figure>`;
  }).join("\n");
  const log = updates.map(update => `<article class="log-entry"><p class="log-state">${update.date ? `<time datetime="${escape(update.date)}">${escape(update.date)}</time><br>` : ""}${escape(update.state)}</p><div><h3>${escape(update.title)}</h3><p>${escape(update.body)}</p></div></article>`).join("\n");
  html = html.replace("<!-- GALLERY -->", gallery).replace("<!-- DEVELOPMENT LOG -->", log);
  await mkdir(new URL("../infamous2-ios/", import.meta.url), { recursive: true });
  await writeFile(new URL("../infamous2-ios/index.html", import.meta.url), html);
}
