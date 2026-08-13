import { absoluteDayToGregorian } from "./calendar-math.js";
import { EVENT_SCHEMA_VERSION, normalizeCategory, normalizeEvent } from "./event-store.js";
import { expandEventOccurrences } from "./recurrence.js";

export const CALENDAR_EXPORT_FORMAT = "mons-games.mustafi-calendar";
export const CALENDAR_EXPORT_VERSION = 1;

function bigintReplacer(_key, value) {
  return typeof value === "bigint" ? { $bigint: value.toString() } : value;
}

function bigintReviver(_key, value) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 1 &&
    /^-?\d+$/.test(value.$bigint)
  ) {
    return BigInt(value.$bigint);
  }
  return value;
}

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/** Create a lossless, versioned backup. BigInt days remain exact. */
export function exportCalendarJSON({ events = [], categories = [], settings = {} } = {}, options = {}) {
  const payload = {
    format: CALENDAR_EXPORT_FORMAT,
    exportVersion: CALENDAR_EXPORT_VERSION,
    schemaVersion: EVENT_SCHEMA_VERSION,
    exportedAt: options.exportedAt ?? new Date().toISOString(),
    events,
    categories,
    settings,
  };
  return JSON.stringify(payload, bigintReplacer, options.pretty === false ? 0 : 2);
}

export function parseCalendarJSON(json) {
  let payload;
  try {
    payload = typeof json === "string" ? JSON.parse(json, bigintReviver) : json;
  } catch (error) {
    throw new SyntaxError(`Mustafi takvimi JSON dosyası okunamadı: ${error.message}`);
  }
  if (!isPlainObject(payload) || payload.format !== CALENDAR_EXPORT_FORMAT) {
    throw new TypeError("Bu dosya geçerli bir Mustafi Takvimi dışa aktarımı değil.");
  }
  if (payload.exportVersion !== CALENDAR_EXPORT_VERSION) {
    throw new RangeError(`Desteklenmeyen dışa aktarma sürümü: ${payload.exportVersion}`);
  }
  if (!Array.isArray(payload.events) || !Array.isArray(payload.categories) || !isPlainObject(payload.settings)) {
    throw new TypeError("Dışa aktarma dosyasının events, categories veya settings alanı geçersiz.");
  }
  return payload;
}

/**
 * Import into an EventStore. `merge: false` clears existing user data first;
 * merge mode updates matching IDs and adds new records.
 */
export async function importCalendarJSON(store, json, { merge = true } = {}) {
  const payload = parseCalendarJSON(json);
  if (!merge) await store.clearAll();

  let eventCount = 0;
  let categoryCount = 0;
  for (const category of payload.categories) {
    await store.saveCategory(normalizeCategory(category, { existing: category }));
    categoryCount += 1;
  }
  for (const event of payload.events) {
    await store.saveEvent(normalizeEvent(event, { existing: event }));
    eventCount += 1;
  }
  await store.saveSettings(payload.settings);
  return { eventCount, categoryCount, settings: await store.getSettings() };
}

function pad(value, length = 2) {
  return String(value).padStart(length, "0");
}

function gregorianDateParts(absoluteDay) {
  const { year, month, day } = absoluteDayToGregorian(absoluteDay);
  const numericYear = Number(year);
  if (!Number.isSafeInteger(numericYear) || numericYear < 1 || numericYear > 9999) {
    throw new RangeError("ICS yalnızca 0001–9999 Miladi yılları arasındaki tarihleri destekler.");
  }
  return { year: numericYear, month, day };
}

function basicDate(day) {
  const date = gregorianDateParts(day);
  return `${pad(date.year, 4)}${pad(date.month)}${pad(date.day)}`;
}

function basicLocalDateTime(day, minute = 0) {
  const hour = Math.floor(minute / 60);
  const minutePart = minute % 60;
  return `${basicDate(day)}T${pad(hour)}${pad(minutePart)}00`;
}

function utcStamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function icsEscape(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldIcsLine(line) {
  // RFC 5545 uses octets; TextEncoder lets us retain Unicode without cutting
  // through a multibyte character. Continuation lines begin with one space.
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const chunks = [];
  let chunk = "";
  let limit = 75;
  for (const character of line) {
    const candidate = chunk + character;
    if (encoder.encode(candidate).length > limit) {
      chunks.push(chunk);
      chunk = character;
      limit = 74;
    } else {
      chunk = candidate;
    }
  }
  if (chunk) chunks.push(chunk);
  return chunks.join("\r\n ");
}

function icsUid(occurrence, domain) {
  const raw = occurrence.occurrenceId ?? occurrence.id ?? `${occurrence.startDay}-${occurrence.title}`;
  return `${encodeURIComponent(String(raw))}@${domain}`;
}

function eventToIcsLines(event, { domain, prodId, stamp }) {
  const lines = ["BEGIN:VEVENT", `UID:${icsUid(event, domain)}`, `DTSTAMP:${stamp}`];
  if (event.allDay) {
    // DTEND for all-day events is exclusive. Internal endDay is inclusive.
    lines.push(`DTSTART;VALUE=DATE:${basicDate(event.startDay)}`);
    lines.push(`DTEND;VALUE=DATE:${basicDate(event.endDay + 1n)}`);
  } else {
    lines.push(`DTSTART:${basicLocalDateTime(event.startDay, event.startMinute)}`);
    lines.push(`DTEND:${basicLocalDateTime(event.endDay, event.endMinute)}`);
  }
  lines.push(`SUMMARY:${icsEscape(event.title)}`);
  if (event.location) lines.push(`LOCATION:${icsEscape(event.location)}`);
  if (event.notes) lines.push(`DESCRIPTION:${icsEscape(event.notes)}`);
  if (event.categoryName || event.categoryId) {
    lines.push(`CATEGORIES:${icsEscape(event.categoryName ?? event.categoryId)}`);
  }
  if (event.color) lines.push(`COLOR:${icsEscape(event.color)}`);
  if (event.reminder != null) {
    const minutes = Number(
      typeof event.reminder === "object" ? event.reminder.minutes ?? event.reminder.offsetMinutes : event.reminder,
    );
    if (Number.isSafeInteger(minutes) && minutes >= 0) {
      lines.push("BEGIN:VALARM", `TRIGGER:-PT${minutes}M`, "ACTION:DISPLAY", `DESCRIPTION:${icsEscape(event.title)}`, "END:VALARM");
    }
  }
  lines.push(`X-MUSTAFI-SOURCE:${icsEscape(prodId)}`, "END:VEVENT");
  return lines;
}

/**
 * Export real Gregorian instants as RFC 5545. Recurrences are expanded over
 * the requested inclusive absolute-day range because Gregorian RRULE months,
 * years, and weeks do not represent Mustafi units.
 */
export function exportCalendarICS(events, options = {}) {
  if (!Array.isArray(events)) throw new TypeError("Etkinlikler bir dizi olmalıdır.");
  const domain = options.domain ?? "mustafi.monsgames.local";
  const prodId = options.prodId ?? "-//Mons Games//Mustafi Takvimi//TR";
  const stamp = options.stamp ?? utcStamp();
  const hasRecurring = events.some((event) => event.recurrence);
  let exportEvents = events;

  if (hasRecurring) {
    if (options.rangeStart == null || options.rangeEnd == null) {
      throw new TypeError("Tekrarlayan etkinliklerin ICS dışa aktarımı için rangeStart ve rangeEnd gereklidir.");
    }
    exportEvents = expandEventOccurrences(events, options.rangeStart, options.rangeEnd, {
      limit: options.limit ?? 50_000,
    });
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `PRODID:${prodId}`,
    "X-WR-CALNAME:Mustafi Takvimi",
  ];
  for (const event of exportEvents) {
    lines.push(...eventToIcsLines(event, { domain, prodId, stamp }));
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

export function makeDownloadBlob(content, type) {
  return new Blob([content], { type });
}

export function downloadTextFile(content, filename, type = "text/plain;charset=utf-8") {
  const blob = makeDownloadBlob(content, type);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadCalendarJSON(data, filename = "mustafi-takvimi.json") {
  return downloadTextFile(exportCalendarJSON(data), filename, "application/json;charset=utf-8");
}

export function downloadCalendarICS(events, options = {}, filename = "mustafi-takvimi.ics") {
  return downloadTextFile(exportCalendarICS(events, options), filename, "text/calendar;charset=utf-8");
}
