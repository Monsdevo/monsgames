import {
  MUSTAFI_WEEKDAY_NAMES,
  MUSTAFI_MONTH_NAMES,
  absoluteDayToGregorian,
  absoluteDayToMustafi,
  formatEraYear,
  getCurrentMustafiDate,
  getSystemTimeZone,
  mustafiToAbsoluteDay,
} from "./lib/calendar-math.js";
import { createEventStore, filterEvents, searchEvents } from "./lib/event-store.js";
import { expandEventOccurrences, updateOccurrence, updateSeries } from "./lib/recurrence.js";
import {
  downloadCalendarICS,
  downloadCalendarJSON,
  importCalendarJSON,
} from "./lib/export.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const COLOR_MAP = Object.freeze({
  red: "#ff3b30", orange: "#ff9500", yellow: "#e7b400", green: "#34c759",
  blue: "#007aff", indigo: "#5856d6", purple: "#af52de", gray: "#8e8e93",
});
const SHORT_WEEKDAYS = Object.freeze(["P.ev", "Paz", "Pzt", "S.ev", "Sal", "S.er", "Ç.ev", "Çar", "Ç.er", "P.ev", "Per", "P.er", "C.ev", "Cum", "Cmt"]);
const NARROW_WEEKDAYS = Object.freeze(["Pe", "P", "Pt", "Se", "S", "Sr", "Çe", "Ç", "Çr", "Pv", "Pr", "Prt", "Ce", "C", "Ct"]);
const COLOR_NAMES = Object.freeze({ red: "Kırmızı", orange: "Turuncu", yellow: "Sarı", green: "Yeşil", blue: "Mavi", indigo: "Çivit mavisi", purple: "Mor", gray: "Gri" });
const VIEW_IDS = Object.freeze({ month: "month-view", week: "week-view", day: "day-view", year: "year-view", agenda: "agenda-view" });
const state = {
  store: null,
  events: [],
  categories: [],
  settings: null,
  today: null,
  cursorDay: 0n,
  selectedDay: 0n,
  view: "month",
  query: "",
  color: "all",
  editing: null,
  pendingDelete: null,
  pendingImport: null,
  undoEvent: null,
  tickTimer: null,
  dragged: null,
  suppressDayClick: null,
};

function esc(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function sameDay(a, b) { return BigInt(a) === BigInt(b); }
function minutesToText(minute) { return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`; }
function timeToMinutes(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) throw new RangeError("Geçerli bir saat girin.");
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  if (minutes < 0 || minutes > 1439) throw new RangeError("Saat 00:00–23:59 arasında olmalı.");
  return minutes;
}
function eventColor(event) { return COLOR_MAP[event.color] ?? event.color ?? "#ff3b30"; }
function categoryFor(event) { return state.categories.find((category) => category.id === event.categoryId); }
function categoryName(event) { return categoryFor(event)?.name ?? "Takvim"; }
function formatMustafiLong(day) {
  const value = absoluteDayToMustafi(day);
  return `${value.weekdayName}, ${value.day}. gün, ${MUSTAFI_MONTH_NAMES[value.month - 1]} ${formatEraYear(value.year)}`;
}
function formatMustafiCompact(day) {
  const value = absoluteDayToMustafi(day);
  return `${value.day}. gün · ${MUSTAFI_MONTH_NAMES[value.month - 1]} · ${formatEraYear(value.year)}`;
}
function formatGregorian(day) {
  const value = absoluteDayToGregorian(day);
  return `${String(value.day).padStart(2, "0")}.${String(value.month).padStart(2, "0")}.${formatEraYear(value.year)}`;
}
function parseVisibleYear(value) {
  const raw = String(value ?? "").trim().toLocaleUpperCase("tr-TR");
  const bce = /^(\d+)\s*MMÖ$/.exec(raw);
  if (bce) return 1n - BigInt(bce[1]);
  if (!/^-?\d+$/.test(raw)) throw new RangeError("Yıl tam sayı veya ‘1 MMÖ’ biçiminde olmalı.");
  const year = BigInt(raw);
  if (year === 0n) throw new RangeError("Yıl sıfır gösterilmez; 1 MMÖ kullanın.");
  return year;
}
function setFieldError(element, message = "") {
  element.textContent = message;
  element.hidden = !message;
}
function announce(message) { $("#live-announcer").textContent = message; }
function showToast(message, undo = false) {
  $("#toast-message").textContent = message;
  $("#toast-undo").hidden = !undo;
  $("#toast").hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { $("#toast").hidden = true; }, 6000);
}

function currentTimeZone() { return state.settings?.timeZone || getSystemTimeZone(); }
function refreshToday() {
  const previous = state.today?.absoluteDay;
  state.today = getCurrentMustafiDate(currentTimeZone());
  $("#today-summary").textContent = `Bugün: ${formatMustafiLong(state.today.absoluteDay)}`;
  $("#gregorian-summary").textContent = state.settings?.showGregorianDate === false ? "" : `Miladi ${formatGregorian(state.today.absoluteDay)}`;
  $("#timezone-label").textContent = state.today.timeZone;
  $("#today-month-token").textContent = `${state.today.month}. AY`;
  $("#today-day-token").textContent = state.today.day;
  $("#sidebar-weekday").textContent = state.today.weekdayName;
  if (previous != null && previous !== state.today.absoluteDay) render();
}
function scheduleTodayRefresh() {
  clearInterval(state.tickTimer);
  state.tickTimer = setInterval(refreshToday, 30_000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshToday(); });
  window.addEventListener("focus", refreshToday);
}

async function reloadData() {
  [state.events, state.categories, state.settings] = await Promise.all([
    state.store.listEvents(), state.store.listCategories(), state.store.getSettings(),
  ]);
  if (!state.categories.length) {
    await state.store.saveCategory({ id: "default", name: "Kişisel", color: "#007aff" });
    state.categories = await state.store.listCategories();
  }
}

function visibleEvents(rangeStart, rangeEnd) {
  const decorated = state.events.map((event) => ({ ...event, categoryName: categoryName(event) }));
  return filterEvents(decorated, {
    rangeStart,
    rangeEnd,
    query: state.query,
    colors: state.color === "all" ? [] : [state.color],
    hiddenCategoryIds: state.settings.hiddenCategoryIds ?? [],
    expansionOptions: { limit: 25_000 },
  });
}

function setPeriodTitle(text, subtitle = "Mustafi Takvimi") {
  $("#period-title").textContent = text;
  $("#period-subtitle").textContent = subtitle;
}

function motionBehavior() { return matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; }

function revealSelectedDay(day, { focus = false, showAgenda = false } = {}) {
  requestAnimationFrame(() => {
    const target = $(`[data-select-day="${CSS.escape(String(day))}"]`);
    if (!target) return;
    target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: motionBehavior() });
    if (focus) target.focus({ preventScroll: true });
    if (showAgenda && matchMedia("(max-width: 600px)").matches) {
      const agenda = $("#mobile-agenda");
      const navHeight = $(".mobile-view-nav")?.getBoundingClientRect().height ?? 0;
      if (agenda.getBoundingClientRect().top > innerHeight - navHeight - 24) agenda.scrollIntoView({ block: "nearest", behavior: motionBehavior() });
    }
  });
}

function selectMonthDay(day, options = {}) {
  state.selectedDay = BigInt(day);
  state.cursorDay = state.selectedDay;
  renderMonth();
  wireDynamicInteractions();
  announce(`${formatMustafiLong(state.selectedDay)} seçildi.`);
  revealSelectedDay(state.selectedDay, options);
}

function eventChip(event, compact = false) {
  const time = event.allDay ? "Tüm gün" : minutesToText(event.startMinute);
  return `<button class="event-chip${compact ? " event-chip--compact" : ""}" type="button" draggable="true" data-event-id="${esc(event.sourceEventId ?? event.id)}" data-occurrence-day="${event.startDay}" style="--event-color:${esc(eventColor(event))}" title="${esc(event.title)}"><span class="event-chip__time">${esc(time)}</span><span class="event-chip__title">${esc(event.title)}</span></button>`;
}

function renderMonth() {
  const cursor = absoluteDayToMustafi(state.cursorDay);
  const start = mustafiToAbsoluteDay(cursor.year, cursor.month, 1);
  const end = start + 29n;
  const events = visibleEvents(start, end);
  setPeriodTitle(`${MUSTAFI_MONTH_NAMES[cursor.month - 1]} ${formatEraYear(cursor.year)}`, "30 gün · 2 Mustafi haftası");
  $("#month-weekday-header").innerHTML = MUSTAFI_WEEKDAY_NAMES.map((name, index) => `<div class="weekday-cell" role="columnheader" aria-label="${esc(name)}"><span class="weekday-full">${esc(name)}</span><span class="weekday-short" aria-hidden="true">${esc(SHORT_WEEKDAYS[index])}</span><span class="weekday-narrow" aria-hidden="true">${esc(NARROW_WEEKDAYS[index])}</span></div>`).join("");
  $("#month-grid").innerHTML = Array.from({ length: 30 }, (_, index) => {
    const day = start + BigInt(index);
    const dayEvents = events.filter((event) => event.startDay <= day && event.endDay >= day);
    const isToday = sameDay(day, state.today.absoluteDay);
    const isSelected = sameDay(day, state.selectedDay);
    const labels = dayEvents.slice(0, 3).map((event) => eventChip(event, true)).join("");
    const dots = dayEvents.slice(0, 6).map((event) => `<i style="--event-color:${esc(eventColor(event))}"></i>`).join("");
    return `<div class="month-day${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}" role="gridcell" data-day="${day}" aria-selected="${isSelected}" aria-rowindex="${Math.floor(index / 15) + 1}" aria-colindex="${index % 15 + 1}" aria-label="${esc(formatMustafiLong(day))}, ${dayEvents.length} etkinlik" draggable="false"><button class="month-day__hit" type="button" data-select-day="${day}" tabindex="${isSelected ? "0" : "-1"}" ${isToday ? 'aria-current="date"' : ""} aria-label="${esc(formatMustafiLong(day))}"><span class="month-day__number">${index + 1}</span></button><span class="month-day__events">${labels}</span><span class="month-day__dots" aria-hidden="true">${dots}</span></div>`;
  }).join("");
  renderSelectedDay();
}

function weekStart(day) {
  const value = absoluteDayToMustafi(day);
  return day - BigInt(value.weekdayIndex);
}

function renderWeek() {
  const start = weekStart(state.cursorDay);
  const end = start + 14n;
  const events = visibleEvents(start, end);
  setPeriodTitle(`${formatMustafiCompact(start)} – ${formatMustafiCompact(end)}`, "Tam 15 günlük Mustafi haftası");
  $("#week-header").innerHTML = MUSTAFI_WEEKDAY_NAMES.map((name, index) => { const day = start + BigInt(index); const m = absoluteDayToMustafi(day); return `<button class="week-day-heading${sameDay(day, state.today.absoluteDay) ? " is-today" : ""}" type="button" data-open-day="${day}" aria-label="${esc(formatMustafiLong(day))}"><span>${esc(SHORT_WEEKDAYS[index])}</span><strong>${m.day}</strong></button>`; }).join("");
  $("#week-all-day").innerHTML = Array.from({ length: 15 }, (_, index) => { const day = start + BigInt(index); return `<div class="week-all-day-cell" data-drop-day="${day}">${events.filter((event) => event.allDay && event.startDay <= day && event.endDay >= day).map((event) => eventChip(event, true)).join("")}</div>`; }).join("");
  const timed = events.filter((event) => !event.allDay);
  $("#week-grid").innerHTML = Array.from({ length: 15 }, (_, index) => { const day = start + BigInt(index); const items = timed.filter((event) => sameDay(event.startDay, day)).map((event) => `<button class="timeline-event timeline-event--week" type="button" draggable="true" data-event-id="${esc(event.sourceEventId ?? event.id)}" data-occurrence-day="${event.startDay}" style="--event-color:${esc(eventColor(event))};--start:${event.startMinute};--duration:${Math.max(30, event.endMinute - event.startMinute)}"><strong>${esc(event.title)}</strong><span>${minutesToText(event.startMinute)}</span></button>`).join(""); return `<div class="week-column" data-drop-day="${day}">${items}</div>`; }).join("");
}

function overlapLayout(events) {
  const sorted = [...events].sort((a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute);
  const columns = [];
  const placed = sorted.map((event) => {
    let column = columns.findIndex((end) => end <= event.startMinute);
    if (column < 0) { column = columns.length; columns.push(event.endMinute); } else columns[column] = event.endMinute;
    return { ...event, column };
  });
  return placed.map((event) => ({ ...event, columnCount: Math.max(1, columns.length) }));
}

function renderDay() {
  const day = state.cursorDay;
  const value = absoluteDayToMustafi(day);
  const events = visibleEvents(day, day);
  setPeriodTitle(`${value.weekdayName}, ${value.day}. gün`, `${MUSTAFI_MONTH_NAMES[value.month - 1]} ${formatEraYear(value.year)}`);
  $("#day-number").textContent = value.day;
  $("#day-weekday").textContent = value.weekdayName;
  $("#day-date-title").textContent = `${MUSTAFI_MONTH_NAMES[value.month - 1]} ${formatEraYear(value.year)}`;
  $("#day-gregorian-date").textContent = state.settings.showGregorianDate === false ? "" : `Miladi ${formatGregorian(day)}`;
  $("#day-all-day-events").innerHTML = events.filter((event) => event.allDay).map((event) => eventChip(event)).join("") || `<span class="muted-text">Tüm gün etkinliği yok.</span>`;
  const laidOut = overlapLayout(events.filter((event) => !event.allDay));
  $("#day-timeline").innerHTML = `<div class="timeline-hours">${Array.from({ length: 24 }, (_, hour) => `<div class="timeline-hour" data-drop-minute="${hour * 60}"><time>${String(hour).padStart(2, "0")}:00</time><span></span></div>`).join("")}</div><div class="timeline-events">${laidOut.map((event) => `<button class="timeline-event timeline-event--day" type="button" draggable="true" data-event-id="${esc(event.sourceEventId ?? event.id)}" data-occurrence-day="${event.startDay}" style="--event-color:${esc(eventColor(event))};--start:${event.startMinute};--duration:${Math.max(30, event.endMinute - event.startMinute)};--column:${event.column};--columns:${event.columnCount}"><strong>${esc(event.title)}</strong><span>${minutesToText(event.startMinute)}–${minutesToText(event.endMinute)} · ${esc(categoryName(event))}</span></button>`).join("")}</div>`;
}

function renderYear() {
  const value = absoluteDayToMustafi(state.cursorDay);
  setPeriodTitle(`Mustafi ${formatEraYear(value.year)}`, "12 ay · 360 gün · 24 hafta");
  $("#year-grid").innerHTML = MUSTAFI_MONTH_NAMES.map((name, monthIndex) => {
    const start = mustafiToAbsoluteDay(value.year, monthIndex + 1, 1);
    const events = visibleEvents(start, start + 29n);
    const occupied = new Map();
    for (const event of events) for (let day = event.startDay < start ? start : event.startDay; day <= event.endDay && day <= start + 29n; day += 1n) occupied.set(day.toString(), eventColor(event));
    return `<button class="year-month" type="button" data-open-month="${monthIndex + 1}" aria-label="${esc(name)}"><span class="year-month__title">${esc(name)}</span><span class="year-month__weekdays">${SHORT_WEEKDAYS.map((weekday) => `<i>${esc(weekday.charAt(0))}</i>`).join("")}</span><span class="year-month__days">${Array.from({ length: 30 }, (_, index) => { const day = start + BigInt(index); const color = occupied.get(day.toString()); return `<i class="year-month__day${sameDay(day, state.today.absoluteDay) ? " is-today" : ""}${color ? " has-events" : ""}"${color ? ` style="--event-color:${esc(color)}"` : ""}>${index + 1}</i>`; }).join("")}</span></button>`;
  }).join("");
}

function renderAgenda() {
  const range = $("#agenda-range-select").value;
  let end;
  if (range === "all") {
    const sourceDays = state.events.map((event) => event.endDay);
    end = sourceDays.length ? sourceDays.reduce((a, b) => a > b ? a : b, state.cursorDay) + 360n : state.cursorDay + 360n;
  } else end = state.cursorDay + BigInt(Number(range) - 1);
  const events = visibleEvents(state.cursorDay, end);
  setPeriodTitle("Ajanda", `${formatMustafiCompact(state.cursorDay)} tarihinden itibaren`);
  $("#agenda-list").innerHTML = events.map((event) => `<article class="agenda-item"><time class="agenda-item__date">${esc(formatMustafiCompact(event.startDay))}<small>${esc(absoluteDayToMustafi(event.startDay).weekdayName)}</small></time><span class="agenda-item__color" style="--event-color:${esc(eventColor(event))}"></span><button class="agenda-item__content" type="button" data-event-id="${esc(event.sourceEventId ?? event.id)}" data-occurrence-day="${event.startDay}" aria-label="${esc(event.title)}, ${esc(formatMustafiCompact(event.startDay))}"><strong class="agenda-item__title">${esc(event.title)}</strong><span class="agenda-item__meta">${event.allDay ? "Tüm gün" : `${minutesToText(event.startMinute)}–${minutesToText(event.endMinute)}`} · ${esc(categoryName(event))}${event.location ? ` · ${esc(event.location)}` : ""}</span></button></article>`).join("");
  $("#agenda-empty").hidden = events.length > 0;
}

function renderSelectedDay() {
  const day = state.selectedDay;
  const events = visibleEvents(day, day);
  const value = absoluteDayToMustafi(day);
  $("#selected-day-title").textContent = `${value.weekdayName}, ${value.day}. gün`;
  $("#selected-day-period").textContent = `${MUSTAFI_MONTH_NAMES[value.month - 1]} ${formatEraYear(value.year)}`;
  $("#selected-day-events").innerHTML = events.length ? events.map((event) => `<div class="selected-event"><span style="--event-color:${esc(eventColor(event))}"></span><button type="button" data-event-id="${esc(event.sourceEventId ?? event.id)}" data-occurrence-day="${event.startDay}"><strong>${esc(event.title)}</strong><small>${event.allDay ? "Tüm gün" : minutesToText(event.startMinute)} · ${esc(categoryName(event))}</small></button></div>`).join("") : `<p class="empty-message">Bu günde etkinlik yok.</p>`;
}

function renderSidebar() {
  const hidden = new Set(state.settings.hiddenCategoryIds ?? []);
  $("#category-filters").innerHTML = state.categories.map((category) => `<div class="category-item"><label><input type="checkbox" data-category-toggle="${esc(category.id)}" ${hidden.has(category.id) ? "" : "checked"}><span class="category-color" style="--category-color:${esc(category.color)}"></span><span class="category-name">${esc(category.name)}</span></label><button type="button" data-edit-category="${esc(category.id)}" aria-label="${esc(category.name)} kategorisini düzenle">•••</button></div>`).join("");
  $("#category-empty").hidden = state.categories.length > 0;
  const colors = [...new Set(state.events.map((event) => event.color))];
  $("#color-filter").innerHTML = `<option value="all">Tüm renkler</option>${colors.map((color) => `<option value="${esc(color)}" ${state.color === color ? "selected" : ""}>${esc(color)}</option>`).join("")}`;
  $("#event-category").innerHTML = state.categories.map((category) => `<option value="${esc(category.id)}">${esc(category.name)}</option>`).join("");
}

function render() {
  if (!state.today || !state.settings) return;
  for (const [view, id] of Object.entries(VIEW_IDS)) $("#" + id).hidden = view !== state.view;
  $("#view-select").value = state.view;
  $$('[data-set-view]').forEach((button) => {
    if (button.dataset.setView === state.view) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.body.dataset.view = state.view;
  if (state.view === "month") renderMonth();
  if (state.view === "week") renderWeek();
  if (state.view === "day") renderDay();
  if (state.view === "year") renderYear();
  if (state.view === "agenda") renderAgenda();
  renderSidebar();
  wireDynamicInteractions();
}

function setView(view) {
  if (!VIEW_IDS[view]) return;
  state.view = view;
  state.settings.defaultView = view;
  state.store.saveSettings({ defaultView: view });
  render();
  $("#calendar-view").focus({ preventScroll: true });
}

function navigate(direction) {
  const current = absoluteDayToMustafi(state.cursorDay);
  if (state.view === "month") state.cursorDay = mustafiToAbsoluteDay(current.year, current.month, 1) + BigInt(direction * 30);
  else if (state.view === "week") state.cursorDay += BigInt(direction * 15);
  else if (state.view === "day") state.cursorDay += BigInt(direction);
  else if (state.view === "year") state.cursorDay = mustafiToAbsoluteDay(current.year + BigInt(direction), current.month, current.day);
  else state.cursorDay += BigInt(direction * 30);
  state.selectedDay = state.cursorDay;
  render();
}

const dialogReturnFocus = new WeakMap();
function openDialog(dialog, preferredFocus = null) {
  if (dialog.open) return;
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialogReturnFocus.set(dialog, active);
  dialog.addEventListener("close", () => {
    const target = dialogReturnFocus.get(dialog);
    dialogReturnFocus.delete(dialog);
    if (!target?.isConnected) return;
    const parentDialog = target.closest("dialog");
    if (!parentDialog || parentDialog.open) target.focus({ preventScroll: true });
  }, { once: true });
  dialog.showModal();
  requestAnimationFrame(() => (preferredFocus ?? $("[autofocus], input:not([type=hidden]), select, textarea, button", dialog))?.focus({ preventScroll: true }));
}
function closeDialog(dialog) { if (dialog.open) dialog.close(); }
function populateDate(prefix, day) {
  const value = absoluteDayToMustafi(day);
  $("#" + prefix + "-year").value = formatEraYear(value.year);
  $("#" + prefix + "-month").value = value.month;
  $("#" + prefix + "-day").value = value.day;
}
function readDate(prefix) {
  return mustafiToAbsoluteDay(parseVisibleYear($("#" + prefix + "-year").value), Number($("#" + prefix + "-month").value), Number($("#" + prefix + "-day").value));
}

function openEventEditor(day = state.selectedDay, event = null, occurrenceDay = null) {
  state.editing = event ? { event, occurrenceDay: occurrenceDay ?? event.startDay } : null;
  $("#event-form").reset();
  $("#event-dialog-title").textContent = event ? "Etkinliği düzenle" : "Yeni etkinlik";
  $("#event-dialog-kicker").textContent = event?.recurrence ? "Tekrarlayan etkinlik" : "Etkinlik";
  $("#event-id").value = event?.id ?? "";
  $("#event-series-id").value = event?.seriesId ?? "";
  $("#event-title").value = event?.title ?? "";
  const start = occurrenceDay ?? event?.startDay ?? day;
  const duration = event ? event.endDay - event.startDay : 0n;
  populateDate("start", start);
  populateDate("end", start + duration);
  $("#start-time").value = minutesToText(event?.startMinute ?? 9 * 60);
  $("#end-time").value = minutesToText(event?.endMinute ?? 10 * 60);
  $("#all-day").checked = event?.allDay ?? false;
  $("#event-location").value = event?.location ?? "";
  $("#event-notes").value = event?.notes ?? "";
  $("#event-reminder").value = event?.reminder == null ? "none" : String(event.reminder);
  $("#event-category").value = event?.categoryId ?? state.categories[0]?.id ?? "";
  const color = Object.entries(COLOR_MAP).find(([, hex]) => hex === event?.color)?.[0] ?? event?.color ?? "red";
  const radio = $(`#event-color input[value="${CSS.escape(color)}"]`);
  if (radio) radio.checked = true;
  const recurrence = event?.recurrence;
  const frequency = recurrence ? ({ day: "daily", week: "weekly", month: "monthly", year: "yearly" }[recurrence.unit] ?? "custom") : "none";
  $("#event-repeat").value = recurrence?.interval === 1 ? frequency : recurrence ? "custom" : "none";
  $("#event-repeat-interval").value = recurrence?.interval ?? 1;
  $("#event-repeat-unit").value = recurrence?.unit ?? "week";
  $("#recurrence-options").hidden = !recurrence && $("#event-repeat").value !== "custom";
  if (recurrence?.untilDay != null) {
    $(`input[name="recurrenceEnd"][value="date"]`).checked = true;
    const until = absoluteDayToMustafi(recurrence.untilDay);
    $("#event-repeat-until-year").value = formatEraYear(until.year);
    $("#event-repeat-until-month").value = until.month;
    $("#event-repeat-until-day").value = until.day;
  } else if (recurrence?.count != null) {
    $(`input[name="recurrenceEnd"][value="count"]`).checked = true;
    $("#event-repeat-count").value = recurrence.count;
  }
  $("#event-delete").hidden = !event;
  setFieldError($("#event-form-error")); setFieldError($("#event-date-error"));
  toggleAllDay();
  openDialog($("#event-dialog"), $("#event-title"));
}

function recurrenceFromForm() {
  const selected = $("#event-repeat").value;
  if (selected === "none") return null;
  const preset = { daily: "day", weekly: "week", monthly: "month", yearly: "year" };
  const recurrence = {
    unit: selected === "custom" ? $("#event-repeat-unit").value : preset[selected],
    interval: selected === "custom" ? Number($("#event-repeat-interval").value) : 1,
  };
  const ending = $('input[name="recurrenceEnd"]:checked')?.value ?? "never";
  if (ending === "date") recurrence.untilDay = mustafiToAbsoluteDay(parseVisibleYear($("#event-repeat-until-year").value), Number($("#event-repeat-until-month").value), Number($("#event-repeat-until-day").value));
  if (ending === "count") recurrence.count = Number($("#event-repeat-count").value);
  return recurrence;
}

async function saveEventFromForm(event) {
  event.preventDefault();
  try {
    const allDay = $("#all-day").checked;
    const payload = {
      id: $("#event-id").value || undefined,
      seriesId: $("#event-series-id").value || null,
      title: $("#event-title").value,
      startDay: readDate("start"), endDay: readDate("end"),
      startMinute: allDay ? 0 : timeToMinutes($("#start-time").value),
      endMinute: allDay ? 0 : timeToMinutes($("#end-time").value), allDay,
      color: COLOR_MAP[$('#event-color input[name="color"]:checked')?.value] ?? $('#event-color input[name="color"]:checked')?.value,
      categoryId: $("#event-category").value, location: $("#event-location").value,
      notes: $("#event-notes").value,
      reminder: $("#event-reminder").value === "none" ? null : Number($("#event-reminder").value),
      recurrence: recurrenceFromForm(),
    };
    if (payload.endDay < payload.startDay || (!allDay && payload.endDay === payload.startDay && payload.endMinute <= payload.startMinute)) throw new RangeError("Bitiş, başlangıçtan sonra olmalı.");
    if (state.editing?.event?.recurrence && state.editing.occurrenceDay != null) {
      const scope = await chooseSeriesScope();
      if (!scope) return;
      if (scope === "occurrence") {
        const detachedId = `event-${crypto.randomUUID?.() ?? Date.now()}`;
        const { series, occurrence } = updateOccurrence(state.editing.event, state.editing.occurrenceDay, { ...payload, id: detachedId, recurrence: null });
        await state.store.saveEvent(series); await state.store.saveEvent(occurrence);
      } else {
        const dayDelta = payload.startDay - state.editing.occurrenceDay;
        await state.store.saveEvent(updateSeries(state.editing.event, {
          ...payload,
          startDay: state.editing.event.startDay + dayDelta,
          endDay: state.editing.event.endDay + dayDelta,
        }));
      }
    } else await state.store.saveEvent(payload);
    await reloadData(); closeDialog($("#event-dialog")); render(); showToast("Etkinlik kaydedildi.");
  } catch (error) {
    setFieldError($("#event-form-error"), error.message);
    const invalid = $("#event-form :invalid");
    if (invalid) {
      invalid.setAttribute("aria-invalid", "true");
      invalid.focus({ preventScroll: false });
    } else {
      $("#event-form-error").tabIndex = -1;
      $("#event-form-error").focus({ preventScroll: false });
    }
  }
}

function chooseSeriesScope() {
  return new Promise((resolve) => {
    const dialog = $("#series-scope-dialog");
    const handler = (event) => { const button = event.target.closest("[data-series-scope]"); if (!button) return; cleanup(); closeDialog(dialog); resolve(button.dataset.seriesScope); };
    const cancel = () => { cleanup(); resolve(null); };
    const cleanup = () => { dialog.removeEventListener("click", handler); dialog.removeEventListener("close", cancel); };
    dialog.addEventListener("click", handler); dialog.addEventListener("close", cancel, { once: true }); openDialog(dialog);
  });
}

function findSourceEvent(id) { return state.events.find((event) => event.id === id); }
function openEventDetails(id, occurrenceDay) {
  const event = findSourceEvent(id); if (!event) return;
  const day = occurrenceDay == null ? event.startDay : BigInt(occurrenceDay);
  state.editing = { event, occurrenceDay: day };
  $("#event-details-title").textContent = event.title;
  $("#event-details-date").textContent = formatMustafiLong(day);
  $("#event-details-content").innerHTML = `<dl><div><dt>Zaman</dt><dd>${event.allDay ? "Tüm gün" : `${minutesToText(event.startMinute)}–${minutesToText(event.endMinute)}`}</dd></div><div><dt>Takvim</dt><dd><i style="--event-color:${esc(eventColor(event))}"></i>${esc(categoryName(event))}</dd></div>${event.location ? `<div><dt>Konum</dt><dd>${esc(event.location)}</dd></div>` : ""}${event.notes ? `<div><dt>Not</dt><dd>${esc(event.notes)}</dd></div>` : ""}${event.recurrence ? `<div><dt>Tekrar</dt><dd>Her ${event.recurrence.interval} Mustafi ${event.recurrence.unit === "day" ? "günü" : event.recurrence.unit === "week" ? "haftası" : event.recurrence.unit === "month" ? "ayı" : "yılı"}</dd></div>` : ""}</dl>`;
  openDialog($("#event-details-dialog"));
}

async function deleteEditingEvent() {
  if (!state.editing) return;
  const { event, occurrenceDay } = state.editing;
  let scope = "series";
  if (event.recurrence) { scope = await chooseSeriesScope(); if (!scope) return; }
  state.pendingDelete = { event, occurrenceDay, scope };
  $("#delete-message").textContent = scope === "occurrence" ? "Yalnızca seçilen oluşum kaldırılacak." : "Etkinlik veya bütün seri takviminizden kaldırılacak.";
  openDialog($("#delete-dialog"));
}
async function confirmDelete() {
  const pending = state.pendingDelete; if (!pending) return;
  state.undoEvent = pending.event;
  if (pending.scope === "occurrence") {
    const updated = { ...pending.event, recurrence: { ...pending.event.recurrence, excludedDays: [...(pending.event.recurrence.excludedDays ?? []), pending.occurrenceDay] } };
    await state.store.saveEvent(updated);
  } else await state.store.deleteEvent(pending.event.id);
  state.pendingDelete = null; closeDialog($("#delete-dialog")); closeDialog($("#event-dialog")); closeDialog($("#event-details-dialog"));
  await reloadData(); render(); showToast("Etkinlik silindi.", true);
}

function toggleAllDay() {
  $$(".time-field").forEach((field) => { field.hidden = $("#all-day").checked; });
  $("#start-time").required = $("#end-time").required = !$("#all-day").checked;
}

function openCategoryEditor(category = null) {
  $("#category-form").reset(); $("#category-id").value = category?.id ?? ""; $("#category-name").value = category?.name ?? "";
  $("#category-dialog-title").textContent = category ? "Kategoriyi düzenle" : "Yeni kategori";
  $("#category-delete-button").hidden = !category;
  $("#category-color-options").innerHTML = Object.entries(COLOR_MAP).map(([name, color], index) => `<label class="color-option color-option--${name}"><input type="radio" name="categoryColor" value="${color}" aria-label="${esc(COLOR_NAMES[name])}" ${(category?.color === color || (!category && index === 0)) ? "checked" : ""}><span aria-hidden="true"></span></label>`).join("");
  openDialog($("#category-dialog"));
}

async function saveCategory(event) {
  event.preventDefault();
  try { await state.store.saveCategory({ id: $("#category-id").value || undefined, name: $("#category-name").value, color: $('input[name="categoryColor"]:checked').value }); await reloadData(); closeDialog($("#category-dialog")); render(); }
  catch (error) { setFieldError($("#category-form-error"), error.message); }
}

function wireDynamicInteractions() {
  $$('[data-select-day]').forEach((button) => {
    button.addEventListener("click", () => {
      if (state.suppressDayClick === button.dataset.selectDay) { state.suppressDayClick = null; return; }
      selectMonthDay(button.dataset.selectDay, { showAgenda: true });
    });
    button.addEventListener("keydown", (event) => {
      const current = BigInt(button.dataset.selectDay);
      const month = absoluteDayToMustafi(current);
      const start = mustafiToAbsoluteDay(month.year, month.month, 1);
      const index = Number(current - start);
      let nextIndex = null;
      if (event.key === "ArrowLeft") nextIndex = index - 1;
      if (event.key === "ArrowRight") nextIndex = index + 1;
      if (event.key === "ArrowUp") nextIndex = index - 15;
      if (event.key === "ArrowDown") nextIndex = index + 15;
      if (event.key === "Home") nextIndex = Math.floor(index / 15) * 15;
      if (event.key === "End") nextIndex = Math.floor(index / 15) * 15 + 14;
      if (nextIndex == null) return;
      event.preventDefault();
      nextIndex = Math.max(0, Math.min(29, nextIndex));
      selectMonthDay(start + BigInt(nextIndex), { focus: true });
    });
  });
  $$('[data-open-day]').forEach((button) => button.addEventListener("click", () => { state.cursorDay = BigInt(button.dataset.openDay); state.selectedDay = state.cursorDay; setView("day"); }));
  $$('[data-open-month]').forEach((button) => button.addEventListener("click", () => { const year = absoluteDayToMustafi(state.cursorDay).year; state.cursorDay = mustafiToAbsoluteDay(year, Number(button.dataset.openMonth), 1); state.selectedDay = state.cursorDay; setView("month"); }));
  $$('[data-event-id]').forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); openEventDetails(button.dataset.eventId, button.dataset.occurrenceDay); }));
  $$('[data-category-toggle]').forEach((checkbox) => checkbox.addEventListener("change", async () => { const hidden = new Set(state.settings.hiddenCategoryIds ?? []); checkbox.checked ? hidden.delete(checkbox.dataset.categoryToggle) : hidden.add(checkbox.dataset.categoryToggle); state.settings = await state.store.saveSettings({ hiddenCategoryIds: [...hidden] }); render(); }));
  $$('[data-edit-category]').forEach((button) => button.addEventListener("click", () => openCategoryEditor(state.categories.find((category) => category.id === button.dataset.editCategory))));
  $$('[data-day]').forEach((cell) => {
    let longPressTimer;
    let originX = 0;
    let originY = 0;
    const cancel = () => { clearTimeout(longPressTimer); longPressTimer = null; };
    cell.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      if (event.target.closest("[data-event-id]")) return;
      originX = event.clientX;
      originY = event.clientY;
      longPressTimer = setTimeout(() => {
        state.selectedDay = BigInt(cell.dataset.day);
        state.cursorDay = state.selectedDay;
        state.suppressDayClick = cell.dataset.day;
        setTimeout(() => { if (state.suppressDayClick === cell.dataset.day) state.suppressDayClick = null; }, 900);
        openEventEditor(state.selectedDay);
        navigator.vibrate?.(20);
      }, 560);
    });
    cell.addEventListener("pointerup", cancel);
    cell.addEventListener("pointercancel", cancel);
    cell.addEventListener("pointermove", (event) => {
      if (Math.hypot(event.clientX - originX, event.clientY - originY) > 10) cancel();
    }, { passive: true });
  });
  const finePointer = matchMedia("(pointer: fine)").matches;
  $$('[draggable="true"]').forEach((element) => {
    element.draggable = finePointer;
    if (finePointer) element.addEventListener("dragstart", () => { state.dragged = { id: element.dataset.eventId, occurrenceDay: BigInt(element.dataset.occurrenceDay) }; });
  });
  $$('[data-day], [data-drop-day]').forEach((target) => { target.addEventListener("dragover", (event) => event.preventDefault()); target.addEventListener("drop", async (event) => { event.preventDefault(); if (!state.dragged) return; await moveDraggedToDay(BigInt(target.dataset.day ?? target.dataset.dropDay)); }); });
  $$('[data-drop-minute]').forEach((target) => { target.addEventListener("dragover", (event) => event.preventDefault()); target.addEventListener("drop", async (event) => { event.preventDefault(); if (!state.dragged) return; await moveDraggedToTime(Number(target.dataset.dropMinute)); }); });
}

async function moveDraggedToDay(day) {
  const event = findSourceEvent(state.dragged.id); if (!event) return;
  const duration = event.endDay - event.startDay;
  if (event.recurrence) {
    const { series, occurrence } = updateOccurrence(event, state.dragged.occurrenceDay, { id: `event-${crypto.randomUUID?.() ?? Date.now()}`, startDay: day, endDay: day + duration });
    await state.store.saveEvent(series); await state.store.saveEvent(occurrence);
  } else await state.store.saveEvent({ ...event, startDay: day, endDay: day + duration });
  state.dragged = null; await reloadData(); render(); showToast("Etkinlik tarihi değiştirildi.");
}
async function moveDraggedToTime(minute) {
  const event = findSourceEvent(state.dragged.id); if (!event) return;
  const duration = event.endMinute - event.startMinute;
  const patch = { startDay: state.cursorDay, endDay: state.cursorDay, startMinute: minute, endMinute: Math.min(1439, minute + duration) };
  if (event.recurrence) {
    const changed = updateOccurrence(event, state.dragged.occurrenceDay, { ...patch, id: `event-${crypto.randomUUID?.() ?? Date.now()}` });
    await state.store.saveEvent(changed.series); await state.store.saveEvent(changed.occurrence);
  } else await state.store.saveEvent({ ...event, ...patch });
  state.dragged = null; await reloadData(); render(); showToast("Etkinlik saati değiştirildi.");
}

function openSettings() {
  $(`#theme-select input[value="${CSS.escape(state.settings.theme ?? "system")}"]`).checked = true;
  $("#show-gregorian").checked = state.settings.showGregorianDate !== false;
  $("#timezone-select").value = currentTimeZone();
  openDialog($("#settings-dialog"));
}
function applyTheme() { document.documentElement.dataset.theme = state.settings.theme ?? "system"; }
async function saveSettings(event) {
  event.preventDefault();
  try {
    const zone = $("#timezone-select").value.trim();
    new Intl.DateTimeFormat("tr-TR", { timeZone: zone }).format();
    state.settings = await state.store.saveSettings({ theme: $('#theme-select input[name="theme"]:checked').value, showGregorianDate: $("#show-gregorian").checked, timeZone: zone });
    applyTheme(); refreshToday(); closeDialog($("#settings-dialog")); render();
  } catch { setFieldError($("#timezone-error"), "Geçerli bir IANA zaman dilimi girin."); }
}

async function performImport() {
  if (!state.pendingImport) return;
  try { await importCalendarJSON(state.store, state.pendingImport, { merge: true }); state.pendingImport = null; await reloadData(); applyTheme(); refreshToday(); render(); closeDialog($("#import-confirm-dialog")); closeDialog($("#settings-dialog")); showToast("Takvim verileri içe aktarıldı."); }
  catch (error) { closeDialog($("#import-confirm-dialog")); setFieldError($("#data-action-error"), error.message); }
}

function setSidebarOpen(open, { restoreFocus = true } = {}) {
  document.body.classList.toggle("sidebar-open", open);
  $("#sidebar-toggle").setAttribute("aria-expanded", String(open));
  $("#sidebar-toggle").setAttribute("aria-label", open ? "Kenar çubuğunu kapat" : "Kenar çubuğunu aç");
  $("#sidebar-scrim").hidden = !open;
  for (const selector of ["#calendar-view", ".mobile-view-nav", ".today-strip"]) {
    const element = $(selector);
    if (element) element.inert = open;
  }
  if (open) requestAnimationFrame(() => $("button, input, select, textarea, a[href]", $("#sidebar"))?.focus());
  else if (restoreFocus) $("#sidebar-toggle").focus({ preventScroll: true });
}

function closeSearch({ restoreFocus = true } = {}) {
  $("#search-panel").hidden = true;
  $("#search-toggle").setAttribute("aria-expanded", "false");
  if (restoreFocus) $("#search-toggle").focus({ preventScroll: true });
}

function updateSearchResults() {
  const query = $("#search-input").value.trim();
  const results = searchEvents(state.events, query).slice(0, 10);
  $("#search-results").hidden = !query;
  $("#search-results").innerHTML = results.length
    ? results.map((item) => `<div role="listitem"><button type="button" data-search-event="${esc(item.id)}" aria-label="${esc(item.title)}, ${esc(formatMustafiCompact(item.startDay))}"><strong>${esc(item.title)}</strong><span>${esc(formatMustafiCompact(item.startDay))}</span></button></div>`).join("")
    : `<p>Sonuç bulunamadı.</p>`;
  $$('[data-search-event]').forEach((button) => button.addEventListener("click", () => {
    const item = findSourceEvent(button.dataset.searchEvent);
    if (!item) return;
    state.cursorDay = item.startDay;
    state.selectedDay = item.startDay;
    closeSearch();
    render();
    openEventDetails(item.id, item.startDay);
  }));
}

function bindStaticInteractions() {
  $("#prev-btn").addEventListener("click", () => navigate(-1)); $("#next-btn").addEventListener("click", () => navigate(1));
  $("#today-btn").addEventListener("click", () => { refreshToday(); state.cursorDay = state.today.absoluteDay; state.selectedDay = state.cursorDay; render(); });
  $("#view-select").addEventListener("change", (event) => setView(event.target.value));
  $$('[data-set-view]').forEach((button) => button.addEventListener("click", () => setView(button.dataset.setView)));
  $("#new-event-btn").addEventListener("click", () => openEventEditor(state.selectedDay));
  $("#selected-day-new-event").addEventListener("click", () => openEventEditor(state.selectedDay));
  $$('[data-open-event-editor]').forEach((button) => button.addEventListener("click", () => openEventEditor(state.selectedDay)));
  $("#event-form").addEventListener("submit", saveEventFromForm); $("#all-day").addEventListener("change", toggleAllDay);
  $("#event-repeat").addEventListener("change", () => { $("#recurrence-options").hidden = $("#event-repeat").value === "none"; const preset = { daily: "day", weekly: "week", monthly: "month", yearly: "year" }; if (preset[$("#event-repeat").value]) { $("#event-repeat-unit").value = preset[$("#event-repeat").value]; $("#event-repeat-interval").value = 1; } });
  $("#event-delete").addEventListener("click", deleteEditingEvent); $("#details-delete-button").addEventListener("click", deleteEditingEvent);
  $("#details-edit-button").addEventListener("click", () => { const editing = state.editing; closeDialog($("#event-details-dialog")); openEventEditor(editing.occurrenceDay, editing.event, editing.occurrenceDay); });
  $("#delete-confirm").addEventListener("click", (event) => { event.preventDefault(); confirmDelete(); });
  $("#toast-undo").addEventListener("click", async () => { if (!state.undoEvent) return; await state.store.saveEvent(state.undoEvent); state.undoEvent = null; await reloadData(); render(); $("#toast").hidden = true; });
  $("#toast-close").addEventListener("click", () => { $("#toast").hidden = true; });
  $("#settings-btn").addEventListener("click", openSettings); $("#settings-form").addEventListener("submit", saveSettings);
  $("#add-category-button").addEventListener("click", () => openCategoryEditor()); $("#category-form").addEventListener("submit", saveCategory);
  $("#category-delete-button").addEventListener("click", async () => { const id = $("#category-id").value; if (!id) return; if (state.events.some((event) => event.categoryId === id)) { setFieldError($("#category-form-error"), "Bu kategori etkinlikler tarafından kullanılıyor."); return; } await state.store.deleteCategory(id); await reloadData(); closeDialog($("#category-dialog")); render(); });
  $("#goto-form").addEventListener("submit", (event) => { event.preventDefault(); try { state.cursorDay = mustafiToAbsoluteDay(parseVisibleYear($("#goto-year").value), Number($("#goto-month").value), Number($("#goto-day").value)); state.selectedDay = state.cursorDay; setFieldError($("#jump-error")); render(); } catch (error) { setFieldError($("#jump-error"), error.message); } });
  $("#color-filter").addEventListener("change", (event) => { state.color = event.target.value; render(); });
  $("#clear-filters").addEventListener("click", () => { state.color = "all"; state.query = ""; $("#search-input").value = ""; render(); });
  $("#search-toggle").addEventListener("click", () => { $("#search-panel").hidden = false; $("#search-toggle").setAttribute("aria-expanded", "true"); updateSearchResults(); $("#search-input").focus(); });
  $("#search-close").addEventListener("click", () => closeSearch());
  $("#search-input").addEventListener("input", updateSearchResults);
  $("#agenda-range-select").addEventListener("change", render);
  $("#sidebar-toggle").addEventListener("click", () => setSidebarOpen(!document.body.classList.contains("sidebar-open")));
  $("#sidebar-scrim").addEventListener("click", () => setSidebarOpen(false));
  $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => closeDialog($("#" + button.dataset.closeDialog))));
  $("#export-json").addEventListener("click", () => downloadCalendarJSON({ events: state.events, categories: state.categories, settings: state.settings }));
  $("#export-ics").addEventListener("click", () => { try { downloadCalendarICS(state.events.map((event) => ({ ...event, categoryName: categoryName(event) })), { rangeStart: state.today.absoluteDay - 360n, rangeEnd: state.today.absoluteDay + 3600n }); } catch (error) { setFieldError($("#data-action-error"), error.message); } });
  $("#import-json").addEventListener("click", () => $("#import-json-file").click());
  $("#import-json-file").addEventListener("change", async (event) => { const file = event.target.files[0]; if (!file) return; state.pendingImport = await file.text(); openDialog($("#import-confirm-dialog")); event.target.value = ""; });
  $("#confirm-import-button").addEventListener("click", (event) => { event.preventDefault(); performImport(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#search-panel").hidden) { event.preventDefault(); closeSearch(); return; }
    if (event.key === "Escape" && document.body.classList.contains("sidebar-open") && !$("dialog[open]")) { event.preventDefault(); setSidebarOpen(false); return; }
    if (document.body.classList.contains("sidebar-open") && event.key === "Tab") {
      const focusable = $$("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]", $("#sidebar")).filter((element) => !element.hidden);
      if (focusable.length) {
        const first = focusable[0]; const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    if (event.target.matches("input,textarea,select,button") || event.target.closest("[role=grid],dialog") || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "ArrowLeft") navigate(-1);
    if (event.key === "ArrowRight") navigate(1);
    if (event.key.toLowerCase() === "t") $("#today-btn").click();
    if (event.key.toLowerCase() === "n") openEventEditor(state.selectedDay);
  });
  matchMedia("(min-width: 901px)").addEventListener("change", (event) => { if (event.matches && document.body.classList.contains("sidebar-open")) setSidebarOpen(false, { restoreFocus: false }); });
}

async function initialize() {
  try {
    state.store = await createEventStore({ onFallback: () => { $("#storage-status").textContent = "Yerel depolama yedeği kullanılıyor."; } });
    await reloadData();
    state.view = VIEW_IDS[state.settings.defaultView] ? state.settings.defaultView : "month";
    applyTheme(); refreshToday(); state.cursorDay = state.today.absoluteDay; state.selectedDay = state.cursorDay;
    const todayMustafi = absoluteDayToMustafi(state.today.absoluteDay);
    $("#goto-year").value = formatEraYear(todayMustafi.year); $("#goto-month").value = todayMustafi.month; $("#goto-day").value = todayMustafi.day;
    $("#storage-status").textContent = state.store.kind === "indexeddb" ? "Etkinlikler bu cihazda IndexedDB ile saklanıyor." : "Etkinlikler bu cihazda yerel depolamayla saklanıyor.";
    bindStaticInteractions(); render(); scheduleTodayRefresh();
    $("#loading-state").hidden = true; document.body.dataset.appState = "ready";
  } catch (error) {
    $("#loading-state").hidden = true; $("#app-error").hidden = false; $("#app-error-message").textContent = error.message; document.body.dataset.appState = "error";
  }
}

$("#retry-button").addEventListener("click", () => location.reload());
initialize();
