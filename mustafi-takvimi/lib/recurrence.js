/**
 * Mustafi-native recurrence helpers.
 *
 * Recurrences deliberately resolve to fixed real-day intervals. Nothing in
 * this module uses Gregorian months, years, or seven-day weeks.
 */

export const RECURRENCE_UNIT_DAYS = Object.freeze({
  day: 1,
  week: 15,
  month: 30,
  year: 360,
});

const FREQUENCY_TO_UNIT = Object.freeze({
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
});

function integer(value, name) {
  if (typeof value === "bigint") return value;
  if (Number.isSafeInteger(value)) return value;
  throw new TypeError(`${name} bir BigInt veya güvenli tam sayı olmalıdır.`);
}

function asBigInt(value, name) {
  const normalized = integer(value, name);
  return typeof normalized === "bigint" ? normalized : BigInt(normalized);
}

function assertPositiveInteger(value, name) {
  const normalized = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (!Number.isSafeInteger(normalized)) {
    throw new TypeError(`${name} güvenli bir tam sayı olmalıdır.`);
  }
  if (normalized < 1) {
    throw new RangeError(`${name} en az 1 olmalıdır.`);
  }
  return normalized;
}

/**
 * Normalize a recurrence rule to this stable persistence shape:
 * `{ unit, interval, count?, untilDay?, excludedDays[] }`.
 * `count` includes the first/original occurrence.
 */
export function normalizeRecurrence(recurrence) {
  if (
    recurrence == null ||
    recurrence === false ||
    recurrence === "none" ||
    recurrence?.frequency === "none"
  ) {
    return null;
  }

  if (typeof recurrence !== "object") {
    throw new TypeError("Tekrarlama kuralı bir nesne olmalıdır.");
  }

  const unit =
    recurrence.unit ?? FREQUENCY_TO_UNIT[recurrence.frequency] ?? null;
  if (!Object.hasOwn(RECURRENCE_UNIT_DAYS, unit)) {
    throw new RangeError("Tekrarlama birimi day, week, month veya year olmalıdır.");
  }

  const normalized = {
    unit,
    interval: assertPositiveInteger(recurrence.interval ?? 1, "Tekrarlama aralığı"),
    excludedDays: [...new Set(
      (recurrence.excludedDays ?? recurrence.exceptions ?? [])
        .map((day) => asBigInt(day, "Hariç tutulan gün"))
        .map(String),
    )]
      .map(BigInt)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
  };

  const end = recurrence.end && typeof recurrence.end === "object" ? recurrence.end : null;
  const count = recurrence.count ?? (end?.type === "count" ? end.count : undefined);
  const untilDay =
    recurrence.untilDay ??
    (end?.type === "day" || end?.type === "date" ? end.absoluteDay ?? end.day : undefined);

  if (count != null) {
    normalized.count = assertPositiveInteger(count, "Tekrarlama sayısı");
  }
  if (untilDay != null) {
    normalized.untilDay = asBigInt(untilDay, "Tekrarlama bitiş günü");
  }

  return normalized;
}

export function recurrenceStepDays(recurrence) {
  const normalized = normalizeRecurrence(recurrence);
  if (!normalized) return null;
  const step = RECURRENCE_UNIT_DAYS[normalized.unit] * normalized.interval;
  if (!Number.isSafeInteger(step)) {
    throw new RangeError("Tekrarlama aralığı güvenli tam sayı sınırını aşıyor.");
  }
  return step;
}

function eventBounds(event) {
  const startDay = asBigInt(event.startDay, "Etkinlik başlangıç günü");
  const endDay = asBigInt(event.endDay ?? event.startDay, "Etkinlik bitiş günü");
  if (endDay < startDay) {
    throw new RangeError("Etkinlik bitiş günü başlangıç gününden önce olamaz.");
  }
  return { startDay, endDay, durationDays: endDay - startDay };
}

function overlaps(startDay, endDay, rangeStart, rangeEnd) {
  return startDay <= rangeEnd && endDay >= rangeStart;
}

function occurrenceFrom(event, occurrenceDay, durationDays, recurring) {
  const seriesId = event.seriesId ?? event.id;
  return {
    ...event,
    sourceEventId: event.id,
    seriesId,
    occurrenceDay,
    occurrenceId: `${seriesId}@${occurrenceDay}`,
    startDay: occurrenceDay,
    endDay: occurrenceDay + durationDays,
    isOccurrence: recurring,
  };
}

/** Expand one event into occurrences that overlap an inclusive day range. */
export function expandEvent(event, rangeStart, rangeEnd, options = {}) {
  rangeStart = asBigInt(rangeStart, "Aralık başlangıcı");
  rangeEnd = asBigInt(rangeEnd, "Aralık bitişi");
  if (rangeEnd < rangeStart) return [];

  const { startDay, endDay, durationDays } = eventBounds(event);
  const recurrence = normalizeRecurrence(event.recurrence);
  if (!recurrence) {
    return overlaps(startDay, endDay, rangeStart, rangeEnd)
      ? [occurrenceFrom(event, startDay, durationDays, false)]
      : [];
  }
  if (rangeEnd < startDay) return [];

  const step = BigInt(recurrenceStepDays(recurrence));
  const excluded = new Set(recurrence.excludedDays.map(String));
  const result = [];
  const firstPossibleDay = rangeStart - durationDays;
  let firstIndex = firstPossibleDay <= startDay
    ? 0n
    : (firstPossibleDay - startDay + step - 1n) / step;
  let lastIndex = (rangeEnd - startDay) / step;

  if (recurrence.count != null) {
    const countLimit = BigInt(recurrence.count - 1);
    if (lastIndex > countLimit) lastIndex = countLimit;
  }
  if (recurrence.untilDay != null) {
    const untilLimit = recurrence.untilDay < startDay
      ? -1n
      : (recurrence.untilDay - startDay) / step;
    if (lastIndex > untilLimit) lastIndex = untilLimit;
  }

  const limit = options.limit ?? 10_000;
  assertPositiveInteger(limit, "Oluşum sınırı");
  if (lastIndex < firstIndex) return result;

  for (let index = firstIndex; index <= lastIndex; index += 1n) {
    if (result.length >= limit) {
      throw new RangeError(
        `Tekrarlama aralığı ${limit} oluşum sınırını aştı; daha dar bir tarih aralığı seçin.`,
      );
    }
    const occurrenceDay = startDay + index * step;
    if (!excluded.has(String(occurrenceDay))) {
      result.push(occurrenceFrom(event, occurrenceDay, durationDays, true));
    }
  }
  return result;
}

/** Expand and chronologically sort many events over an inclusive range. */
export function expandEventOccurrences(events, rangeStart, rangeEnd, options) {
  return events
    .flatMap((event) => expandEvent(event, rangeStart, rangeEnd, options))
    .sort(
      (a, b) =>
        (a.startDay < b.startDay ? -1 : a.startDay > b.startDay ? 1 : 0) ||
        (a.allDay === b.allDay ? 0 : a.allDay ? -1 : 1) ||
        (a.startMinute ?? 0) - (b.startMinute ?? 0) ||
        String(a.title ?? "").localeCompare(String(b.title ?? ""), "tr"),
    );
}

export function excludeOccurrence(event, occurrenceStartDay) {
  occurrenceStartDay = asBigInt(occurrenceStartDay, "Oluşum günü");
  const recurrence = normalizeRecurrence(event.recurrence);
  if (!recurrence) {
    throw new Error("Tekrarlanmayan bir etkinlikte tek oluşum hariç tutulamaz.");
  }
  return {
    ...event,
    recurrence: normalizeRecurrence({
      ...recurrence,
      excludedDays: [...recurrence.excludedDays, occurrenceStartDay],
    }),
  };
}

/** Delete one occurrence without affecting the remainder of its series. */
export function deleteOccurrence(event, occurrenceStartDay) {
  return excludeOccurrence(event, occurrenceStartDay);
}

/**
 * Detach one occurrence for editing. Persist both returned records: update the
 * `series`, then create the standalone `occurrence`.
 */
export function updateOccurrence(event, occurrenceStartDay, patch = {}) {
  const recurrence = normalizeRecurrence(event.recurrence);
  if (!recurrence) {
    throw new Error("Tekrarlanmayan bir etkinlikte tek oluşum düzenlenemez.");
  }
  occurrenceStartDay = asBigInt(occurrenceStartDay, "Oluşum günü");
  const { startDay, durationDays } = eventBounds(event);
  const step = BigInt(recurrenceStepDays(recurrence));
  const offset = occurrenceStartDay - startDay;
  if (offset < 0n || offset % step !== 0n) {
    throw new RangeError("Seçilen gün bu serinin bir oluşumu değil.");
  }
  const index = offset / step;
  if (
    (recurrence.count != null && index >= BigInt(recurrence.count)) ||
    (recurrence.untilDay != null && occurrenceStartDay > recurrence.untilDay)
  ) {
    throw new RangeError("Seçilen gün bu serinin tekrar sınırlarının dışında.");
  }

  const series = excludeOccurrence(event, occurrenceStartDay);
  const occurrence = {
    ...event,
    ...patch,
    id: patch.id,
    seriesId: event.seriesId ?? event.id,
    detachedFromDay: occurrenceStartDay,
    startDay: patch.startDay ?? occurrenceStartDay,
    endDay: patch.endDay ?? occurrenceStartDay + durationDays,
    recurrence: null,
  };
  return { series, occurrence };
}

/** Apply a patch to an entire series while retaining its persistent identity. */
export function updateSeries(event, patch = {}) {
  return {
    ...event,
    ...patch,
    id: event.id,
    seriesId: event.seriesId ?? event.id,
    recurrence: Object.hasOwn(patch, "recurrence")
      ? normalizeRecurrence(patch.recurrence)
      : normalizeRecurrence(event.recurrence),
  };
}
