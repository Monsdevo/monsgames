import assert from "node:assert/strict";

const CDP_HTTP = process.env.CDP_HTTP ?? "http://127.0.0.1:9231";
const APP_URL = process.env.APP_URL ?? "http://127.0.0.1:4174/mustafi-takvimi/";

const target = await fetch(`${CDP_HTTP}/json/new?${encodeURIComponent(APP_URL)}`, { method: "PUT" }).then((response) => {
  if (!response.ok) throw new Error(`Chrome target açılamadı: ${response.status}`);
  return response.json();
});
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let id = 0;
const pending = new Map();
const events = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const handler = pending.get(message.id);
    if (!handler) return;
    pending.delete(message.id);
    message.error ? handler.reject(new Error(message.error.message)) : handler.resolve(message.result);
  } else events.push(message);
});
function send(method, params = {}) {
  const messageId = ++id;
  socket.send(JSON.stringify({ id: messageId, method, params }));
  return new Promise((resolve, reject) => pending.set(messageId, { resolve, reject }));
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
async function waitFor(expression, timeout = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Beklenen tarayıcı durumu oluşmadı: ${expression}`);
}
async function viewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 600 });
  await new Promise((resolve) => setTimeout(resolve, 100));
  return evaluate(`(() => ({
    width: innerWidth,
    globalOverflow: document.documentElement.scrollWidth > innerWidth,
    columns: getComputedStyle(document.querySelector('#month-grid')).gridTemplateColumns.split(' ').length,
    headers: document.querySelectorAll('#month-weekday-header .weekday-cell').length,
    mobileAgenda: getComputedStyle(document.querySelector('#mobile-agenda')).display,
    mobileNav: getComputedStyle(document.querySelector('.mobile-view-nav')).display
  }))()`);
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await waitFor(`document.body?.dataset.appState === 'ready'`, 8000);
await evaluate(`(async () => { const { createEventStore } = await import('./lib/event-store.js'); const store = await createEventStore(); await store.clearAll(); location.reload(); return true; })()`);
await waitFor(`document.body?.dataset.appState === 'ready'`, 8000);

assert.match(await evaluate(`document.querySelector('#today-summary').textContent`), /^Bugün:/);
assert.equal(await evaluate(`document.querySelectorAll('#month-grid .month-day').length`), 30);

for (const [width, height] of [[1440, 1000], [900, 1000], [390, 844]]) {
  const layout = await viewport(width, height);
  assert.equal(layout.width, width);
  assert.equal(layout.columns, 15);
  assert.equal(layout.headers, 15);
  assert.equal(layout.globalOverflow, false);
  if (width <= 900) {
    assert.notEqual(layout.mobileAgenda, "none");
    assert.notEqual(layout.mobileNav, "none");
  }
}

await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

const viewChecks = {
  week: `document.querySelectorAll('#week-header .week-day-heading').length === 15 && document.querySelectorAll('#week-grid .week-column').length === 15`,
  day: `document.querySelectorAll('#day-timeline .timeline-hour').length === 24`,
  year: `document.querySelectorAll('#year-grid .year-month').length === 12`,
  agenda: `!document.querySelector('#agenda-view').hidden`,
  month: `document.querySelectorAll('#month-grid .month-day').length === 30`,
};
for (const [view, check] of Object.entries(viewChecks)) {
  await evaluate(`(() => { const select = document.querySelector('#view-select'); select.value = '${view}'; select.dispatchEvent(new Event('change', {bubbles:true})); return true; })()`);
  await waitFor(check);
}

await evaluate(`document.querySelector('#new-event-btn').click()`);
await waitFor(`document.querySelector('#event-dialog').open`);
await evaluate(`(() => {
  document.querySelector('#event-title').value = 'Tarayıcı Test Etkinliği';
  document.querySelector('#event-repeat').value = 'weekly';
  document.querySelector('#event-repeat').dispatchEvent(new Event('change', {bubbles:true}));
  document.querySelector('input[name="recurrenceEnd"][value="count"]').checked = true;
  document.querySelector('#event-repeat-count').value = '3';
  document.querySelector('#event-form').dispatchEvent(new Event('submit', {bubbles:true,cancelable:true}));
})()`);
await waitFor(`!document.querySelector('#event-dialog').open`);

await evaluate(`(() => { document.querySelector('#agenda-range-select').value='90'; const select = document.querySelector('#view-select'); select.value='agenda'; select.dispatchEvent(new Event('change',{bubbles:true})); })()`);
await waitFor(`document.querySelectorAll('#agenda-list .agenda-item').length === 3`);

// Edit only one occurrence, then delete and undo it.
await evaluate(`document.querySelector('#agenda-list .agenda-item__content').click()`);
await waitFor(`document.querySelector('#event-details-dialog').open`);
await evaluate(`document.querySelector('#details-edit-button').click()`);
await waitFor(`document.querySelector('#event-dialog').open`);
await evaluate(`(() => { document.querySelector('#event-title').value='Düzenlenmiş Oluşum'; document.querySelector('#event-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); })()`);
await waitFor(`document.querySelector('#series-scope-dialog').open`);
await evaluate(`document.querySelector('[data-series-scope="occurrence"]').click()`);
await waitFor(`!document.querySelector('#event-dialog').open && [...document.querySelectorAll('#agenda-list strong')].some(node => node.textContent === 'Düzenlenmiş Oluşum')`);
await evaluate(`[...document.querySelectorAll('#agenda-list .agenda-item')].find(item => item.querySelector('strong')?.textContent === 'Düzenlenmiş Oluşum').querySelector('button').click()`);
await waitFor(`document.querySelector('#event-details-dialog').open`);
await evaluate(`document.querySelector('#details-delete-button').click()`);
await waitFor(`document.querySelector('#delete-dialog').open`);
await evaluate(`document.querySelector('#delete-confirm').click()`);
await waitFor(`document.querySelectorAll('#agenda-list .agenda-item').length === 2`);
await evaluate(`document.querySelector('#toast-undo').click()`);
await waitFor(`document.querySelectorAll('#agenda-list .agenda-item').length === 3`);

// Category visibility is a real filter, and restoring it restores events.
await evaluate(`document.querySelector('[data-category-toggle]').click()`);
await waitFor(`document.querySelectorAll('#agenda-list .agenda-item').length === 0`);
await evaluate(`document.querySelector('[data-category-toggle]').click()`);
await waitFor(`document.querySelectorAll('#agenda-list .agenda-item').length === 3`);
assert.equal(await evaluate(`[...document.querySelectorAll('#agenda-list .agenda-item strong')].filter(node => node.textContent === 'Tarayıcı Test Etkinliği').length`), 2);
assert.equal(await evaluate(`[...document.querySelectorAll('#agenda-list .agenda-item strong')].filter(node => node.textContent === 'Düzenlenmiş Oluşum').length`), 1);

// Desktop drag-and-drop moves the detached occurrence by one Mustafi day.
await evaluate(`(() => { const select=document.querySelector('#view-select'); select.value='month'; select.dispatchEvent(new Event('change',{bubbles:true})); })()`);
await waitFor(`[...document.querySelectorAll('#month-grid .event-chip__title')].some(node => node.textContent === 'Düzenlenmiş Oluşum')`);
await evaluate(`(() => {
  const chip=[...document.querySelectorAll('#month-grid .event-chip')].find(node => node.querySelector('.event-chip__title')?.textContent === 'Düzenlenmiş Oluşum');
  const cell=chip.closest('.month-day');
  const cells=[...document.querySelectorAll('#month-grid .month-day')];
  const next=cells[cells.indexOf(cell)+1];
  chip.dispatchEvent(new DragEvent('dragstart',{bubbles:true}));
  next.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true}));
  window.__dragTargetDay=next.dataset.day;
})()`);
await waitFor(`[...document.querySelectorAll('#month-grid .month-day')].find(cell => cell.dataset.day === window.__dragTargetDay)?.textContent.includes('Düzenlenmiş Oluşum')`);
await evaluate(`(() => { document.querySelector('#agenda-range-select').value='90'; const select=document.querySelector('#view-select'); select.value='agenda'; select.dispatchEvent(new Event('change',{bubbles:true})); })()`);
await waitFor(`document.querySelectorAll('#agenda-list .agenda-item').length === 3`);

await send("Page.reload", { ignoreCache: true });
await waitFor(`document.body?.dataset.appState === 'ready'`, 8000);
await evaluate(`(() => { document.querySelector('#agenda-range-select').value='90'; const select = document.querySelector('#view-select'); select.value='agenda'; select.dispatchEvent(new Event('change',{bubbles:true})); })()`);
await waitFor(`document.querySelectorAll('#agenda-list .agenda-item').length === 3`);

await evaluate(`document.querySelector('#settings-btn').click()`);
await waitFor(`document.querySelector('#settings-dialog').open`);
await evaluate(`(() => {
  document.querySelector('#timezone-select').value = 'UTC';
  document.querySelector('#theme-select input[value="light"]').checked = true;
  document.querySelector('#settings-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
})()`);
await waitFor(`!document.querySelector('#settings-dialog').open && document.documentElement.dataset.theme === 'light'`);
assert.equal(await evaluate(`document.querySelector('#timezone-label').textContent`), "UTC");
const lightBackground = await evaluate(`getComputedStyle(document.body).backgroundColor`);

await evaluate(`document.querySelector('#settings-btn').click()`);
await waitFor(`document.querySelector('#settings-dialog').open`);
await evaluate(`(() => {
  document.querySelector('#theme-select input[value="dark"]').checked = true;
  document.querySelector('#settings-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
})()`);
await waitFor(`document.documentElement.dataset.theme === 'dark'`);
const darkBackground = await evaluate(`getComputedStyle(document.body).backgroundColor`);
assert.notEqual(lightBackground, darkBackground);

const severeLogs = events.filter((event) => event.method === "Log.entryAdded" && ["error", "warning"].includes(event.params?.entry?.level));
assert.deepEqual(severeLogs, []);

console.log("Browser smoke: desktop/tablet/mobile, 5 views, recurrence, persistence, timezone and themes passed.");
socket.close();
