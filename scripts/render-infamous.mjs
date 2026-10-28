import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { captures, updates } from './infamous2-content.mjs';

const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

export async function renderInfamousPage() {
  let html = await readFile(new URL('./templates/infamous2-ios.html', import.meta.url), 'utf8');
  const sections = ['STATUS', 'RUNTIME', 'METAL', 'PERFORMANCE'];
  for (const capture of captures) {
    if (!sections.includes(capture.section)) throw new Error(`Unknown screenshot section: ${capture.section}`);
    if (!/^[a-z0-9-]+$/.test(capture.file)) throw new Error(`Invalid screenshot filename: ${capture.file}`);
  }
  for (const section of sections) {
    const images = captures.filter(capture => capture.section === section).map(capture => {
      const file = escape(capture.file);
      return `<figure class="capture"><a class="capture-link" href="/assets/infamous2-ios/${file}.png" data-capture data-title="${escape(capture.title)}" aria-label="Open full-resolution screenshot: ${escape(capture.title)}"><img src="/assets/infamous2-ios/${file}-small.webp" srcset="/assets/infamous2-ios/${file}-small.webp 800w, /assets/infamous2-ios/${file}.webp 1600w" sizes="(max-width: 720px) calc(100vw - 64px), 340px" width="1600" height="900" loading="lazy" decoding="async" alt="${escape(capture.alt)}"></a></figure>`;
    }).join('\n');
    html = html.replace(`<!-- ${section}_CAPTURE -->`, images);
  }
  const log = updates.map(update => `<article class="log-entry"><div class="log-entry-title"><h3>${escape(update.title)}</h3><p class="log-state">${update.date ? `<time datetime="${escape(update.date)}">${escape(update.date)}</time> · ` : ''}${escape(update.state)}</p></div><p>${escape(update.body)}</p></article>`).join('\n');
  html = html.replace('<!-- DEVELOPMENT LOG -->', log);
  await mkdir(new URL('../infamous2-ios/', import.meta.url), { recursive: true });
  await writeFile(new URL('../infamous2-ios/index.html', import.meta.url), html);
}
