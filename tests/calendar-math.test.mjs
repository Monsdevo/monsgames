import test from "node:test";
import assert from "node:assert/strict";

import {
  DAYS_PER_MUSTAFI_MONTH,
  DAYS_PER_MUSTAFI_WEEK,
  DAYS_PER_MUSTAFI_YEAR,
  MONTHS_PER_MUSTAFI_YEAR,
  MUSTAFI_MONTH_NAMES,
  MUSTAFI_WEEKDAY_NAMES,
  WEEKS_PER_MUSTAFI_YEAR,
  absoluteDayToGregorian,
  absoluteDayToMustafi,
  daysInGregorianMonth,
  floorDiv,
  floorMod,
  formatEraYear,
  getCurrentMustafiDate,
  getZonedGregorianDate,
  gregorianToAbsoluteDay,
  gregorianToMustafi,
  isGregorianLeapYear,
  mustafiToAbsoluteDay,
  mustafiToGregorian,
} from "../mustafi-takvimi/lib/calendar-math.js";

test("Mustafi constants retain the exact 15-day calendar structure", () => {
  assert.equal(DAYS_PER_MUSTAFI_WEEK, 15);
  assert.equal(DAYS_PER_MUSTAFI_MONTH, 30);
  assert.equal(MONTHS_PER_MUSTAFI_YEAR, 12);
  assert.equal(DAYS_PER_MUSTAFI_YEAR, 360);
  assert.equal(WEEKS_PER_MUSTAFI_YEAR, 24);
  assert.deepEqual(MUSTAFI_WEEKDAY_NAMES, [
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
  assert.deepEqual(MUSTAFI_MONTH_NAMES, [
    "1. Ay", "2. Ay", "3. Ay", "4. Ay", "5. Ay", "6. Ay",
    "7. Ay", "8. Ay", "9. Ay", "10. Ay", "11. Ay", "12. Ay",
  ]);
});

test("floorDiv and floorMod are mathematically correct for negative operands", () => {
  assert.equal(floorDiv(-1n, 360n), -1n);
  assert.equal(floorMod(-1n, 360n), 359n);
  assert.equal(floorDiv(-361n, 360n), -2n);
  assert.equal(floorMod(-361n, 360n), 359n);
  assert.equal(floorDiv(7n, -3n), -3n);
  assert.equal(floorMod(7n, -3n), -2n);
  assert.equal(floorDiv(-7, 3), -3);
  assert.equal(floorMod(-7, 3), 2);
});

const mandatoryCases = [
  [0n, 1n, 1, 1, "Pazarevvel"],
  [14n, 1n, 1, 15, "Cumartesi"],
  [15n, 1n, 1, 16, "Pazarevvel"],
  [29n, 1n, 1, 30, "Cumartesi"],
  [30n, 1n, 2, 1, "Pazarevvel"],
  [359n, 1n, 12, 30, "Cumartesi"],
  [360n, 2n, 1, 1, "Pazarevvel"],
];

test("mandatory Mustafi epoch, week, month, and year boundaries", () => {
  for (const [absoluteDay, year, month, day, weekdayName] of mandatoryCases) {
    const result = absoluteDayToMustafi(absoluteDay);
    assert.deepEqual(
      { year: result.year, month: result.month, day: result.day, weekdayName: result.weekdayName },
      { year, month, day, weekdayName },
    );
    assert.equal(mustafiToAbsoluteDay(year, month, day), absoluteDay);
  }
});

test("0001-01-01 Gregorian is the shared epoch", () => {
  assert.equal(gregorianToAbsoluteDay(1, 1, 1), 0n);
  assert.deepEqual(absoluteDayToGregorian(0n), { year: 1n, month: 1, day: 1 });
  const mustafi = gregorianToMustafi(1, 1, 1);
  assert.deepEqual(
    { year: mustafi.year, month: mustafi.month, day: mustafi.day, weekdayName: mustafi.weekdayName },
    { year: 1n, month: 1, day: 1, weekdayName: "Pazarevvel" },
  );
});

test("14 August 2026 converts to the required Mustafi date", () => {
  assert.equal(gregorianToAbsoluteDay(2026, 8, 14), 739841n);
  const result = gregorianToMustafi(2026, 8, 14);
  assert.deepEqual(
    { year: result.year, month: result.month, day: result.day, weekdayName: result.weekdayName },
    { year: 2056n, month: 2, day: 12, weekdayName: "Perşembertesi" },
  );
  assert.deepEqual(mustafiToGregorian(2056, 2, 12), { year: 2026n, month: 8, day: 14 });
});

test("Gregorian leap rules honor ordinary, century, and 400-year boundaries", () => {
  assert.equal(isGregorianLeapYear(4), true);
  assert.equal(isGregorianLeapYear(100), false);
  assert.equal(isGregorianLeapYear(400), true);
  assert.equal(isGregorianLeapYear(1900), false);
  assert.equal(isGregorianLeapYear(2000), true);
  assert.equal(isGregorianLeapYear(0), true);
  assert.equal(daysInGregorianMonth(1900, 2), 28);
  assert.equal(daysInGregorianMonth(2000, 2), 29);

  assert.equal(
    gregorianToAbsoluteDay(2000, 3, 1) - gregorianToAbsoluteDay(2000, 2, 28),
    2n,
  );
  assert.equal(
    gregorianToAbsoluteDay(1900, 3, 1) - gregorianToAbsoluteDay(1900, 2, 28),
    1n,
  );
});

test("Gregorian month/year transitions and leap days are exact", () => {
  const transitions = [
    [[1, 1, 31], [1, 2, 1]],
    [[4, 2, 28], [4, 2, 29]],
    [[4, 2, 29], [4, 3, 1]],
    [[100, 2, 28], [100, 3, 1]],
    [[400, 2, 28], [400, 2, 29]],
    [[2025, 12, 31], [2026, 1, 1]],
  ];
  for (const [before, after] of transitions) {
    assert.equal(
      gregorianToAbsoluteDay(...after) - gregorianToAbsoluteDay(...before),
      1n,
    );
  }
});

test("negative absolute days use astronomical years without losing continuity", () => {
  assert.deepEqual(absoluteDayToGregorian(-1n), { year: 0n, month: 12, day: 31 });
  assert.deepEqual(absoluteDayToGregorian(-366n), { year: 0n, month: 1, day: 1 });
  assert.equal(gregorianToAbsoluteDay(0, 12, 31), -1n);

  const beforeEpoch = absoluteDayToMustafi(-1n);
  assert.deepEqual(
    { year: beforeEpoch.year, month: beforeEpoch.month, day: beforeEpoch.day, weekdayName: beforeEpoch.weekdayName },
    { year: 0n, month: 12, day: 30, weekdayName: "Cumartesi" },
  );
  assert.equal(formatEraYear(0), "1 MMÖ");
  assert.equal(formatEraYear(-1), "2 MMÖ");
  assert.notEqual(formatEraYear(0), "0");
});

test("Gregorian to absoluteDay roundtrips over representative and distant dates", () => {
  const dates = [
    { year: -1000000000000000000000000n, month: 1, day: 1 },
    { year: -400n, month: 2, day: 29 },
    { year: -1n, month: 12, day: 31 },
    { year: 0n, month: 2, day: 29 },
    { year: 1n, month: 1, day: 1 },
    { year: 1582n, month: 10, day: 15 },
    { year: 2000n, month: 2, day: 29 },
    { year: 1000000000000000000000000n, month: 12, day: 31 },
  ];
  for (const date of dates) {
    assert.deepEqual(absoluteDayToGregorian(gregorianToAbsoluteDay(date.year, date.month, date.day)), date);
  }
});

test("absoluteDay to Gregorian roundtrips distant positive and negative values", () => {
  const days = [
    -999999999999999999999999999999n,
    -146098n,
    -146097n,
    -367n,
    -366n,
    -1n,
    0n,
    1n,
    365n,
    146096n,
    146097n,
    999999999999999999999999999999n,
  ];
  for (const day of days) {
    const gregorian = absoluteDayToGregorian(day);
    assert.equal(gregorianToAbsoluteDay(gregorian.year, gregorian.month, gregorian.day), day);
    const mustafi = absoluteDayToMustafi(day);
    assert.equal(mustafiToAbsoluteDay(mustafi.year, mustafi.month, mustafi.day), day);
  }
});

test("invalid dates are rejected instead of normalized", () => {
  assert.throws(() => gregorianToAbsoluteDay(1900, 2, 29), RangeError);
  assert.throws(() => gregorianToAbsoluteDay(2026, 13, 1), RangeError);
  assert.throws(() => mustafiToAbsoluteDay(1, 0, 1), RangeError);
  assert.throws(() => mustafiToAbsoluteDay(1, 1, 31), RangeError);
});

test("IANA timezone extraction follows the selected local civil date", () => {
  const instant = Date.UTC(2026, 7, 14, 22, 30, 0);
  assert.deepEqual(getZonedGregorianDate("Europe/Istanbul", instant), {
    year: 2026,
    month: 8,
    day: 15,
    timeZone: "Europe/Istanbul",
  });
  assert.deepEqual(getZonedGregorianDate("America/Los_Angeles", instant), {
    year: 2026,
    month: 8,
    day: 14,
    timeZone: "America/Los_Angeles",
  });

  const istanbul = getCurrentMustafiDate("Europe/Istanbul", instant);
  const losAngeles = getCurrentMustafiDate("America/Los_Angeles", instant);
  assert.equal(istanbul.absoluteDay - losAngeles.absoluteDay, 1n);
  assert.equal(istanbul.day, 13);
  assert.equal(losAngeles.day, 12);
  assert.deepEqual(losAngeles.gregorian, { year: 2026, month: 8, day: 14 });
});

test("invalid IANA timezones and instants fail explicitly", () => {
  assert.throws(() => getZonedGregorianDate("Not/A_Real_Zone", 0), RangeError);
  assert.throws(() => getZonedGregorianDate("UTC", Number.NaN), RangeError);
});
