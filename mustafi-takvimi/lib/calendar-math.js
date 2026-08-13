/**
 * Mustafi calendar mathematics.
 *
 * All calendar conversion code is pure and integer based. Gregorian years use
 * astronomical numbering internally (1 = 1 CE, 0 = 1 BCE, -1 = 2 BCE).
 * Absolute days and years are BigInt so distant dates remain exact.
 */

export const MUSTAFI_WEEKDAY_NAMES = Object.freeze([
  "Pazarevvel",
  "Pazar",
  "Pazartesi",
  "Salıevvel",
  "Salı",
  "Salertesi",
  "Çarşambevvel",
  "Çarşamba",
  "Çarşambertesi",
  "Perşembevvel",
  "Perşembe",
  "Perşembertesi",
  "Cumevvel",
  "Cuma",
  "Cumartesi",
]);

// Keep month labels centralized so real names can be introduced later.
export const MUSTAFI_MONTH_NAMES = Object.freeze(
  Array.from({ length: 12 }, (_, index) => `${index + 1}. Ay`),
);

export const DAYS_PER_MUSTAFI_WEEK = 15;
export const DAYS_PER_MUSTAFI_MONTH = 30;
export const MONTHS_PER_MUSTAFI_YEAR = 12;
export const DAYS_PER_MUSTAFI_YEAR = 360;
export const WEEKS_PER_MUSTAFI_MONTH = 2;
export const WEEKS_PER_MUSTAFI_YEAR = 24;

// Concise aliases are useful to consumers without weakening their meaning.
export const WEEKDAY_NAMES = MUSTAFI_WEEKDAY_NAMES;
export const MONTH_NAMES = MUSTAFI_MONTH_NAMES;
export const DAYS_PER_WEEK = DAYS_PER_MUSTAFI_WEEK;
export const DAYS_PER_MONTH = DAYS_PER_MUSTAFI_MONTH;
export const MONTHS_PER_YEAR = MONTHS_PER_MUSTAFI_YEAR;
export const DAYS_PER_YEAR = DAYS_PER_MUSTAFI_YEAR;
export const WEEKS_PER_YEAR = WEEKS_PER_MUSTAFI_YEAR;

const BIG_DAYS_PER_WEEK = 15n;
const BIG_DAYS_PER_MONTH = 30n;
const BIG_DAYS_PER_YEAR = 360n;
const DAYS_PER_GREGORIAN_ERA = 146097n;
const GREGORIAN_EPOCH_OFFSET = 306n;

const GREGORIAN_MONTH_LENGTHS = Object.freeze([
  31,
  28,
  31,
  30,
  31,
  30,
  31,
  31,
  30,
  31,
  30,
  31,
]);

function toBigInt(value, name = "value") {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isSafeInteger(value)) {
    return BigInt(value);
  }
  if (typeof value === "string" && /^[+-]?\d+$/.test(value.trim())) {
    return BigInt(value.trim());
  }
  throw new TypeError(`${name} must be a BigInt, safe integer, or integer string.`);
}

function toSmallInteger(value, name) {
  const integer = toBigInt(value, name);
  const number = Number(integer);
  if (!Number.isSafeInteger(number)) {
    throw new RangeError(`${name} is outside the supported UI integer range.`);
  }
  return number;
}

/** Mathematical floor division, unlike BigInt's truncation toward zero. */
export function floorDiv(dividend, divisor) {
  if (typeof dividend === "number" && typeof divisor === "number") {
    if (!Number.isSafeInteger(dividend) || !Number.isSafeInteger(divisor)) {
      throw new TypeError("floorDiv operands must be safe integers.");
    }
    if (divisor === 0) throw new RangeError("Cannot divide by zero.");
    return Math.floor(dividend / divisor);
  }

  const a = toBigInt(dividend, "dividend");
  const b = toBigInt(divisor, "divisor");
  if (b === 0n) throw new RangeError("Cannot divide by zero.");

  let quotient = a / b;
  const remainder = a % b;
  if (remainder !== 0n && (remainder < 0n) !== (b < 0n)) quotient -= 1n;
  return quotient;
}

/** Mathematical modulo paired with floorDiv; the result follows the divisor. */
export function floorMod(dividend, divisor) {
  if (typeof dividend === "number" && typeof divisor === "number") {
    const quotient = floorDiv(dividend, divisor);
    return dividend - quotient * divisor;
  }

  const a = toBigInt(dividend, "dividend");
  const b = toBigInt(divisor, "divisor");
  return a - floorDiv(a, b) * b;
}

export function isGregorianLeapYear(year) {
  const y = toBigInt(year, "year");
  return floorMod(y, 4n) === 0n &&
    (floorMod(y, 100n) !== 0n || floorMod(y, 400n) === 0n);
}

export function daysInGregorianMonth(year, month) {
  const m = toSmallInteger(month, "month");
  if (m < 1 || m > 12) throw new RangeError("Gregorian month must be 1–12.");
  return m === 2 && isGregorianLeapYear(year)
    ? 29
    : GREGORIAN_MONTH_LENGTHS[m - 1];
}

export function isValidGregorianDate(year, month, day) {
  try {
    toBigInt(year, "year");
    const m = toSmallInteger(month, "month");
    const d = toSmallInteger(day, "day");
    return m >= 1 && m <= 12 && d >= 1 && d <= daysInGregorianMonth(year, m);
  } catch {
    return false;
  }
}

export function assertValidGregorianDate(year, month, day) {
  if (!isValidGregorianDate(year, month, day)) {
    throw new RangeError("Invalid proleptic Gregorian date.");
  }
}

/**
 * Convert a proleptic Gregorian date to signed days since 0001-01-01.
 * Uses a 400-year civil-calendar era decomposition and never constructs Date.
 */
export function gregorianToAbsoluteDay(year, month, day) {
  const yInput = toBigInt(year, "year");
  const m = toSmallInteger(month, "month");
  const d = toSmallInteger(day, "day");
  assertValidGregorianDate(yInput, m, d);

  const y = yInput - (m <= 2 ? 1n : 0n);
  const era = floorDiv(y, 400n);
  const yearOfEra = y - era * 400n;
  const shiftedMonth = BigInt(m + (m > 2 ? -3 : 9));
  const dayOfYear = floorDiv(153n * shiftedMonth + 2n, 5n) + BigInt(d - 1);
  const dayOfEra = yearOfEra * 365n + floorDiv(yearOfEra, 4n) -
    floorDiv(yearOfEra, 100n) + dayOfYear;

  return era * DAYS_PER_GREGORIAN_ERA + dayOfEra - GREGORIAN_EPOCH_OFFSET;
}

/** Convert a signed absolute day to an exact proleptic Gregorian date. */
export function absoluteDayToGregorian(absoluteDay) {
  const z = toBigInt(absoluteDay, "absoluteDay") + GREGORIAN_EPOCH_OFFSET;
  const era = floorDiv(z, DAYS_PER_GREGORIAN_ERA);
  const dayOfEra = z - era * DAYS_PER_GREGORIAN_ERA;
  const yearOfEra = floorDiv(
    dayOfEra - floorDiv(dayOfEra, 1460n) + floorDiv(dayOfEra, 36524n) -
      floorDiv(dayOfEra, 146096n),
    365n,
  );
  let year = yearOfEra + era * 400n;
  const dayOfYear = dayOfEra -
    (365n * yearOfEra + floorDiv(yearOfEra, 4n) - floorDiv(yearOfEra, 100n));
  const shiftedMonth = floorDiv(5n * dayOfYear + 2n, 153n);
  const day = dayOfYear - floorDiv(153n * shiftedMonth + 2n, 5n) + 1n;
  const month = shiftedMonth + (shiftedMonth < 10n ? 3n : -9n);
  year += month <= 2n ? 1n : 0n;

  return { year, month: Number(month), day: Number(day) };
}

export function isValidMustafiDate(year, month, day) {
  try {
    toBigInt(year, "year");
    const m = toSmallInteger(month, "month");
    const d = toSmallInteger(day, "day");
    return m >= 1 && m <= 12 && d >= 1 && d <= 30;
  } catch {
    return false;
  }
}

export function assertValidMustafiDate(year, month, day) {
  if (!isValidMustafiDate(year, month, day)) {
    throw new RangeError("Mustafi ayı 1–12, günü 1–30 aralığında olmalıdır.");
  }
}

export function mustafiToAbsoluteDay(year, month, day) {
  const y = toBigInt(year, "year");
  const m = toSmallInteger(month, "month");
  const d = toSmallInteger(day, "day");
  assertValidMustafiDate(y, m, d);
  return (y - 1n) * BIG_DAYS_PER_YEAR + BigInt(m - 1) * BIG_DAYS_PER_MONTH +
    BigInt(d - 1);
}

export function absoluteDayToMustafi(absoluteDay) {
  const absolute = toBigInt(absoluteDay, "absoluteDay");
  const year = floorDiv(absolute, BIG_DAYS_PER_YEAR) + 1n;
  const dayOfYear = floorMod(absolute, BIG_DAYS_PER_YEAR);
  const month = floorDiv(dayOfYear, BIG_DAYS_PER_MONTH) + 1n;
  const day = floorMod(dayOfYear, BIG_DAYS_PER_MONTH) + 1n;
  const weekdayIndex = floorMod(absolute, BIG_DAYS_PER_WEEK);

  return {
    year,
    month: Number(month),
    day: Number(day),
    dayOfYear: Number(dayOfYear) + 1,
    weekdayIndex: Number(weekdayIndex),
    weekdayName: MUSTAFI_WEEKDAY_NAMES[Number(weekdayIndex)],
  };
}

export function gregorianToMustafi(year, month, day) {
  return absoluteDayToMustafi(gregorianToAbsoluteDay(year, month, day));
}

export function mustafiToGregorian(year, month, day) {
  return absoluteDayToGregorian(mustafiToAbsoluteDay(year, month, day));
}

/** Format astronomical year numbering without ever displaying a year zero. */
export function formatEraYear(year, minimumDigits = 1) {
  const y = toBigInt(year, "year");
  const digits = Math.max(1, toSmallInteger(minimumDigits, "minimumDigits"));
  if (y > 0n) return y.toString().padStart(digits, "0");
  return `${(1n - y).toString()} MMÖ`;
}

export function formatMustafiDate(date, { includeWeekday = false } = {}) {
  if (!date || typeof date !== "object") throw new TypeError("A Mustafi date is required.");
  assertValidMustafiDate(date.year, date.month, date.day);
  const main = `${formatEraYear(date.year, 4)}/${String(date.month).padStart(2, "0")}/${String(date.day).padStart(2, "0")}`;
  if (!includeWeekday) return main;
  const weekday = date.weekdayName ??
    absoluteDayToMustafi(mustafiToAbsoluteDay(date.year, date.month, date.day)).weekdayName;
  return `${main}, ${weekday}`;
}

/** Browser/system IANA zone, with a standards-safe fallback. */
export function getSystemTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

/**
 * Extract Gregorian Y/M/D for an instant in an IANA time zone.
 * Date is intentionally limited to representing an instant here; all calendar
 * arithmetic still goes through the exact integer conversion functions above.
 */
export function getZonedGregorianDate(timeZone = getSystemTimeZone(), instant = Date.now()) {
  const date = instant instanceof Date ? new Date(instant.getTime()) : new Date(instant);
  if (Number.isNaN(date.getTime())) throw new RangeError("Invalid instant.");

  const formatter = new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
    timeZone,
    calendar: "gregory",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const values = Object.create(null);
  for (const part of formatter.formatToParts(date)) {
    if (part.type === "year" || part.type === "month" || part.type === "day") {
      values[part.type] = Number(part.value);
    }
  }
  if (![values.year, values.month, values.day].every(Number.isSafeInteger)) {
    throw new RangeError("The selected time zone did not produce a Gregorian date.");
  }
  return { year: values.year, month: values.month, day: values.day, timeZone };
}

export function getCurrentMustafiDate(timeZone = getSystemTimeZone(), instant = Date.now()) {
  const gregorian = getZonedGregorianDate(timeZone, instant);
  const absoluteDay = gregorianToAbsoluteDay(gregorian.year, gregorian.month, gregorian.day);
  return {
    ...absoluteDayToMustafi(absoluteDay),
    absoluteDay,
    gregorian: { year: gregorian.year, month: gregorian.month, day: gregorian.day },
    timeZone: gregorian.timeZone,
  };
}

