import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_SETTINGS,
  LocalStorageEventStore,
  filterEvents,
  normalizeEvent,
  searchEvents,
} from "../mustafi-takvimi/lib/event-store.js";
import {
  RECURRENCE_UNIT_DAYS,
  deleteOccurrence,
  expandEvent,
  expandEventOccurrences,
  normalizeRecurrence,
  recurrenceStepDays,
  updateOccurrence,
} from "../mustafi-takvimi/lib/recurrence.js";

class MemoryStorage {
  #records = new Map();
  getItem(key) { return this.#records.has(key) ? this.#records.get(key) : null; }
  setItem(key, value) { this.#records.set(String(key), String(value)); }
  removeItem(key) { this.#records.delete(String(key)); }
}

function event(overrides = {}) {
  return normalizeEvent({
    id: "series-1",
    title: "Mustafi toplantısı",
    startDay: 10n,
    endDay: 10n,
    startMinute: 540,
    endMinute: 600,
    color: "#ff3b30",
    categoryId: "work",
    ...overrides,
  });
}

test("Mustafi recurrence units have exact fixed day lengths", () => {
  assert.deepEqual(RECURRENCE_UNIT_DAYS, { day: 1, week: 15, month: 30, year: 360 });
  assert.equal(recurrenceStepDays({ unit: "week", interval: 2 }), 30);
  assert.equal(recurrenceStepDays({ frequency: "yearly", interval: 3 }), 1080);
});

test("normalizes recurrence end count and absolute end day", () => {
  assert.deepEqual(
    normalizeRecurrence({ frequency: "monthly", interval: 2, end: { type: "count", count: 4 } }),
    { unit: "month", interval: 2, count: 4, excludedDays: [] },
  );
  assert.deepEqual(
    normalizeRecurrence({ unit: "week", end: { type: "day", absoluteDay: 99n } }),
    { unit: "week", interval: 1, untilDay: 99n, excludedDays: [] },
  );
});

test("weekly recurrence repeats every 15 real days and respects count", () => {
  const source = event({ recurrence: { unit: "week", interval: 1, count: 4 } });
  assert.deepEqual(expandEvent(source, -100n, 5n), []);
  assert.deepEqual(expandEvent(source, 0n, 100n).map((item) => item.startDay), [10n, 25n, 40n, 55n]);
});

test("custom Mustafi intervals and end date are inclusive", () => {
  const source = event({ recurrence: { unit: "month", interval: 3, untilDay: 280n } });
  assert.deepEqual(expandEvent(source, 0n, 400n).map((item) => item.startDay), [10n, 100n, 190n, 280n]);
});

test("expansion includes multi-day occurrences overlapping range start", () => {
  const source = event({ endDay: 12n, recurrence: { unit: "week", interval: 1, count: 3 } });
  const occurrences = expandEvent(source, 27n, 27n);
  assert.equal(occurrences.length, 1);
  assert.equal(occurrences[0].startDay, 25n);
  assert.equal(occurrences[0].endDay, 27n);
});

test("individual occurrence deletion and editing preserve the series", () => {
  const source = event({ recurrence: { unit: "week", interval: 1, count: 4 } });
  const deleted = deleteOccurrence(source, 25n);
  assert.deepEqual(expandEvent(deleted, 0n, 100n).map((item) => item.startDay), [10n, 40n, 55n]);

  const { series, occurrence } = updateOccurrence(source, 40n, {
    id: "detached-40",
    title: "Taşınmış toplantı",
    startDay: 42n,
    endDay: 42n,
  });
  assert.equal(series.id, source.id);
  assert.ok(series.recurrence.excludedDays.includes(40n));
  assert.equal(occurrence.id, "detached-40");
  assert.equal(occurrence.seriesId, source.id);
  assert.equal(occurrence.detachedFromDay, 40n);
  assert.equal(occurrence.recurrence, null);
});

test("occurrences sort chronologically without narrowing BigInt days", () => {
  const far = 9_007_199_254_740_993n;
  const items = expandEventOccurrences(
    [event({ id: "b", title: "B", startDay: far + 2n, endDay: far + 2n }), event({ id: "a", title: "A", startDay: far, endDay: far })],
    far,
    far + 10n,
  );
  assert.deepEqual(items.map((item) => item.id), ["a", "b"]);
});

test("event validation rejects invalid time ranges", () => {
  assert.throws(() => event({ startMinute: 600, endMinute: 599 }), /başlangıçtan sonra/);
  assert.throws(() => event({ startMinute: -1 }), /0 ile 1439/);
  assert.throws(() => event({ title: " " }), /boş/);
});

test("editing can explicitly clear a stored reminder", () => {
  const existing = event({ reminder: 15 });
  const edited = normalizeEvent({ ...existing, reminder: null }, { existing });
  assert.equal(edited.reminder, null);
});

test("Turkish-aware search and category/color filters work", () => {
  const source = [
    event({ id: "1", title: "İstanbul planı", color: "red", categoryId: "work" }),
    event({ id: "2", title: "Akşam yemeği", color: "blue", categoryId: "home", startDay: 12n, endDay: 12n }),
  ];
  assert.deepEqual(searchEvents(source, "istanbul").map((item) => item.id), ["1"]);
  assert.deepEqual(filterEvents(source, { colors: ["blue"] }).map((item) => item.id), ["2"]);
  assert.deepEqual(filterEvents(source, { hiddenCategoryIds: ["work"] }).map((item) => item.id), ["2"]);
});

test("localStorage adapter persists BigInt event days, categories, and settings", async () => {
  const storage = new MemoryStorage();
  const store = await new LocalStorageEventStore({ storage, prefix: "test" }).init();
  const saved = await store.saveEvent(event({ startDay: -12_345_678_901_234_567_890n, endDay: -12_345_678_901_234_567_890n }));
  await store.saveCategory({ id: "work", name: "İş", color: "#ff0000" });
  await store.saveSettings({ theme: "dark", timeZone: "Europe/Istanbul" });

  const reloaded = await new LocalStorageEventStore({ storage, prefix: "test" }).init();
  assert.equal((await reloaded.getEvent(saved.id)).startDay, -12_345_678_901_234_567_890n);
  assert.equal((await reloaded.listCategories())[0].name, "İş");
  assert.deepEqual(await reloaded.getSettings(), {
    ...DEFAULT_SETTINGS,
    theme: "dark",
    timeZone: "Europe/Istanbul",
  });
  assert.equal(await reloaded.deleteEvent(saved.id), true);
  assert.equal(await reloaded.deleteEvent(saved.id), false);
});

// export.js tests are loaded after calendar-math.js arrives from its parallel
// module owner. Keeping the dynamic import here makes missing integration fail
// clearly rather than masking it with a mock conversion function.
test("JSON export round-trips lossless BigInt data", async () => {
  const { exportCalendarJSON, parseCalendarJSON } = await import("../mustafi-takvimi/lib/export.js");
  const source = event({ startDay: -999999999999999999n, endDay: -999999999999999998n });
  const json = exportCalendarJSON({ events: [source], categories: [], settings: { theme: "dark" } }, { exportedAt: "2026-08-14T00:00:00.000Z" });
  const parsed = parseCalendarJSON(json);
  assert.equal(parsed.events[0].startDay, -999999999999999999n);
  assert.equal(parsed.settings.theme, "dark");
});

test("ICS export converts absolute days and expands Mustafi recurrence", async () => {
  const { exportCalendarICS } = await import("../mustafi-takvimi/lib/export.js");
  const source = event({
    title: "İki haftada bir",
    startDay: 0n,
    endDay: 0n,
    startMinute: 60,
    endMinute: 120,
    recurrence: { unit: "week", interval: 2, count: 3 },
  });
  const ics = exportCalendarICS([source], { rangeStart: 0n, rangeEnd: 100n, stamp: "20260814T000000Z" });
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 3);
  assert.match(ics, /DTSTART:00010101T010000/);
  assert.match(ics, /DTSTART:00010131T010000/);
  assert.match(ics, /DTSTART:00010302T010000/);
  assert.ok(ics.endsWith("\r\n"));
});
