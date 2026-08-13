import { expandEventOccurrences, normalizeRecurrence } from "./recurrence.js";

export const EVENT_SCHEMA_VERSION = 1;
export const DATABASE_VERSION = 1;
export const DATABASE_NAME = "mons-games-mustafi-calendar";

export const DEFAULT_SETTINGS = Object.freeze({
  theme: "system",
  timeZone: null,
  showGregorianDate: true,
  hiddenCategoryIds: [],
  eventColorFilter: [],
  categoryFilter: [],
  defaultView: "month",
});

const STORE_NAMES = Object.freeze({
  events: "events",
  categories: "categories",
  settings: "settings",
});

function clone(value) {
  return value == null ? value : structuredClone(value);
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix = "event") {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}-${uuid}`;
  const random = Math.random().toString(36).slice(2);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

function absoluteDay(value, name) {
  if (typeof value === "bigint") return value;
  if (Number.isSafeInteger(value)) return BigInt(value);
  if (/^-?\d+$/.test(String(value ?? "").trim())) return BigInt(value);
  throw new TypeError(`${name} bir BigInt veya tam sayı olmalıdır.`);
}

function safeInteger(value, name) {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (!Number.isSafeInteger(number)) {
    throw new TypeError(`${name} güvenli bir tam sayı olmalıdır.`);
  }
  return number;
}

function minute(value, name) {
  const normalized = safeInteger(value, name);
  if (normalized < 0 || normalized > 1439) {
    throw new RangeError(`${name} 0 ile 1439 arasında olmalıdır.`);
  }
  return normalized;
}

export function normalizeEvent(input, { existing = null } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Etkinlik verisi bir nesne olmalıdır.");
  }

  const title = String(input.title ?? existing?.title ?? "").trim();
  if (!title) throw new RangeError("Etkinlik başlığı boş bırakılamaz.");

  const startDay = absoluteDay(input.startDay ?? existing?.startDay, "Başlangıç günü");
  const endDay = absoluteDay(input.endDay ?? existing?.endDay ?? startDay, "Bitiş günü");
  const allDay = Boolean(input.allDay ?? existing?.allDay ?? false);
  const startMinute = allDay
    ? 0
    : minute(input.startMinute ?? existing?.startMinute ?? 9 * 60, "Başlangıç saati");
  const endMinute = allDay
    ? 0
    : minute(input.endMinute ?? existing?.endMinute ?? 10 * 60, "Bitiş saati");

  if (endDay < startDay || (!allDay && endDay === startDay && endMinute <= startMinute)) {
    throw new RangeError("Etkinlik bitişi başlangıçtan sonra olmalıdır.");
  }

  const timestamp = nowIso();
  const recurrenceInput = Object.hasOwn(input, "recurrence")
    ? input.recurrence
    : existing?.recurrence;
  const reminderInput = Object.hasOwn(input, "reminder")
    ? input.reminder
    : existing?.reminder ?? null;

  return {
    schemaVersion: EVENT_SCHEMA_VERSION,
    id: String(input.id ?? existing?.id ?? makeId("event")),
    seriesId: input.seriesId ?? existing?.seriesId ?? null,
    detachedFromDay: input.detachedFromDay == null
      ? existing?.detachedFromDay ?? null
      : absoluteDay(input.detachedFromDay, "Ayrılan oluşum günü"),
    title,
    startDay,
    endDay,
    startMinute,
    endMinute,
    allDay,
    color: String(input.color ?? existing?.color ?? "#ff3b30"),
    categoryId: input.categoryId ?? input.calendarId ?? existing?.categoryId ?? null,
    location: String(input.location ?? existing?.location ?? "").trim(),
    notes: String(input.notes ?? input.description ?? existing?.notes ?? "").trim(),
    reminder: reminderInput,
    recurrence: normalizeRecurrence(recurrenceInput),
    createdAt: existing?.createdAt ?? input.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

export function normalizeCategory(input, { existing = null } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Takvim kategorisi bir nesne olmalıdır.");
  }
  const name = String(input.name ?? existing?.name ?? "").trim();
  if (!name) throw new RangeError("Kategori adı boş bırakılamaz.");
  const timestamp = nowIso();
  return {
    schemaVersion: EVENT_SCHEMA_VERSION,
    id: String(input.id ?? existing?.id ?? makeId("category")),
    name,
    color: String(input.color ?? existing?.color ?? "#ff3b30"),
    visible: Boolean(input.visible ?? existing?.visible ?? true),
    createdAt: existing?.createdAt ?? input.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function normalizeForSearch(value) {
  return String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function searchEvents(events, query) {
  const needle = normalizeForSearch(query);
  if (!needle) return [...events];
  return events.filter((event) =>
    [event.title, event.location, event.notes, event.categoryName]
      .map(normalizeForSearch)
      .some((field) => field.includes(needle)),
  );
}

/**
 * Filter source events, or occurrence-expanded events when both range bounds
 * are supplied. Color and category arrays are treated as allow-lists.
 */
export function filterEvents(events, filters = {}) {
  const hasRange = filters.rangeStart != null || filters.rangeEnd != null;
  if (hasRange && (filters.rangeStart == null || filters.rangeEnd == null)) {
    throw new TypeError("Tarih filtresi için rangeStart ve rangeEnd birlikte verilmelidir.");
  }

  const source = hasRange
    ? expandEventOccurrences(events, filters.rangeStart, filters.rangeEnd, filters.expansionOptions)
    : [...events];
  const colors = filters.colors?.length ? new Set(filters.colors) : null;
  const categories = filters.categoryIds?.length ? new Set(filters.categoryIds) : null;
  const hiddenCategories = new Set(filters.hiddenCategoryIds ?? []);

  return searchEvents(source, filters.query).filter((event) => {
    if (colors && !colors.has(event.color)) return false;
    if (categories && !categories.has(event.categoryId)) return false;
    if (event.categoryId != null && hiddenCategories.has(event.categoryId)) return false;
    return true;
  });
}

function requestPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB isteği başarısız."));
  });
}

function transactionPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB işlemi iptal edildi."));
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB işlemi başarısız."));
  });
}

function createStores(database) {
  if (!database.objectStoreNames.contains(STORE_NAMES.events)) {
    const events = database.createObjectStore(STORE_NAMES.events, { keyPath: "id" });
    events.createIndex("startDay", "startDay", { unique: false });
    events.createIndex("categoryId", "categoryId", { unique: false });
    events.createIndex("updatedAt", "updatedAt", { unique: false });
  }
  if (!database.objectStoreNames.contains(STORE_NAMES.categories)) {
    database.createObjectStore(STORE_NAMES.categories, { keyPath: "id" });
  }
  if (!database.objectStoreNames.contains(STORE_NAMES.settings)) {
    database.createObjectStore(STORE_NAMES.settings, { keyPath: "key" });
  }
}

export class IndexedDbEventStore {
  constructor({ indexedDB = globalThis.indexedDB, databaseName = DATABASE_NAME } = {}) {
    if (!indexedDB) throw new Error("IndexedDB kullanılamıyor.");
    this.indexedDB = indexedDB;
    this.databaseName = databaseName;
    this.database = null;
    this.kind = "indexeddb";
  }

  async init() {
    if (this.database) return this;
    const request = this.indexedDB.open(this.databaseName, DATABASE_VERSION);
    request.onupgradeneeded = () => createStores(request.result);
    this.database = await requestPromise(request);
    this.database.onversionchange = () => this.close();
    return this;
  }

  close() {
    this.database?.close();
    this.database = null;
  }

  store(name, mode = "readonly") {
    if (!this.database) throw new Error("Veri deposu başlatılmadı.");
    const transaction = this.database.transaction(name, mode);
    return { transaction, store: transaction.objectStore(name) };
  }

  async listEvents() {
    const { transaction, store } = this.store(STORE_NAMES.events);
    const result = await requestPromise(store.getAll());
    await transactionPromise(transaction);
    return result.sort((a, b) =>
      a.startDay < b.startDay ? -1 : a.startDay > b.startDay ? 1 : a.startMinute - b.startMinute,
    );
  }

  async getEvent(id) {
    const { transaction, store } = this.store(STORE_NAMES.events);
    const result = await requestPromise(store.get(String(id)));
    await transactionPromise(transaction);
    return result ?? null;
  }

  async saveEvent(input) {
    const existing = input.id ? await this.getEvent(input.id) : null;
    const event = normalizeEvent(input, { existing });
    const { transaction, store } = this.store(STORE_NAMES.events, "readwrite");
    store.put(event);
    await transactionPromise(transaction);
    return clone(event);
  }

  async deleteEvent(id) {
    const existing = await this.getEvent(id);
    if (!existing) return false;
    const { transaction, store } = this.store(STORE_NAMES.events, "readwrite");
    store.delete(String(id));
    await transactionPromise(transaction);
    return true;
  }

  async listCategories() {
    const { transaction, store } = this.store(STORE_NAMES.categories);
    const result = await requestPromise(store.getAll());
    await transactionPromise(transaction);
    return result.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }

  async getCategory(id) {
    const { transaction, store } = this.store(STORE_NAMES.categories);
    const result = await requestPromise(store.get(String(id)));
    await transactionPromise(transaction);
    return result ?? null;
  }

  async saveCategory(input) {
    const existing = input.id ? await this.getCategory(input.id) : null;
    const category = normalizeCategory(input, { existing });
    const { transaction, store } = this.store(STORE_NAMES.categories, "readwrite");
    store.put(category);
    await transactionPromise(transaction);
    return clone(category);
  }

  async deleteCategory(id) {
    const existing = await this.getCategory(id);
    if (!existing) return false;
    const { transaction, store } = this.store(STORE_NAMES.categories, "readwrite");
    store.delete(String(id));
    await transactionPromise(transaction);
    return true;
  }

  async getSettings() {
    const { transaction, store } = this.store(STORE_NAMES.settings);
    const record = await requestPromise(store.get("preferences"));
    await transactionPromise(transaction);
    return { ...DEFAULT_SETTINGS, ...(record?.value ?? {}) };
  }

  async saveSettings(patch) {
    const value = { ...(await this.getSettings()), ...patch };
    const { transaction, store } = this.store(STORE_NAMES.settings, "readwrite");
    store.put({ key: "preferences", schemaVersion: EVENT_SCHEMA_VERSION, value });
    await transactionPromise(transaction);
    return clone(value);
  }

  async clearAll() {
    const names = Object.values(STORE_NAMES);
    const transaction = this.database.transaction(names, "readwrite");
    for (const name of names) transaction.objectStore(name).clear();
    await transactionPromise(transaction);
  }
}

function encodeStorage(value) {
  return JSON.stringify(value, (_key, item) =>
    typeof item === "bigint" ? { __mustafiBigInt: item.toString() } : item,
  );
}

function decodeStorage(raw, fallback) {
  if (!raw) return clone(fallback);
  try {
    const parsed = JSON.parse(raw, (_key, item) =>
      item && typeof item === "object" && Object.keys(item).length === 1 && "__mustafiBigInt" in item
        ? BigInt(item.__mustafiBigInt)
        : item,
    );
    return parsed?.schemaVersion === EVENT_SCHEMA_VERSION ? parsed : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

export class LocalStorageEventStore {
  constructor({ storage = globalThis.localStorage, prefix = "mustafi-calendar" } = {}) {
    if (!storage) throw new Error("localStorage kullanılamıyor.");
    this.storage = storage;
    this.prefix = prefix;
    this.kind = "localstorage";
  }

  key(name) {
    return `${this.prefix}:${name}:v${EVENT_SCHEMA_VERSION}`;
  }

  readCollection(name) {
    return decodeStorage(this.storage.getItem(this.key(name)), {
      schemaVersion: EVENT_SCHEMA_VERSION,
      records: {},
    });
  }

  writeCollection(name, payload) {
    this.storage.setItem(this.key(name), encodeStorage(payload));
  }

  async init() {
    const probe = this.key("probe");
    this.storage.setItem(probe, "1");
    this.storage.removeItem(probe);
    return this;
  }

  async listEvents() {
    return Object.values(this.readCollection("events").records).sort(
      (a, b) =>
        a.startDay < b.startDay ? -1 : a.startDay > b.startDay ? 1 : a.startMinute - b.startMinute,
    );
  }

  async getEvent(id) {
    return clone(this.readCollection("events").records[String(id)] ?? null);
  }

  async saveEvent(input) {
    const collection = this.readCollection("events");
    const existing = input.id ? collection.records[String(input.id)] : null;
    const event = normalizeEvent(input, { existing });
    collection.records[event.id] = event;
    this.writeCollection("events", collection);
    return clone(event);
  }

  async deleteEvent(id) {
    const collection = this.readCollection("events");
    if (!Object.hasOwn(collection.records, String(id))) return false;
    delete collection.records[String(id)];
    this.writeCollection("events", collection);
    return true;
  }

  async listCategories() {
    return Object.values(this.readCollection("categories").records).sort((a, b) =>
      a.name.localeCompare(b.name, "tr"),
    );
  }

  async getCategory(id) {
    return clone(this.readCollection("categories").records[String(id)] ?? null);
  }

  async saveCategory(input) {
    const collection = this.readCollection("categories");
    const existing = input.id ? collection.records[String(input.id)] : null;
    const category = normalizeCategory(input, { existing });
    collection.records[category.id] = category;
    this.writeCollection("categories", collection);
    return clone(category);
  }

  async deleteCategory(id) {
    const collection = this.readCollection("categories");
    if (!Object.hasOwn(collection.records, String(id))) return false;
    delete collection.records[String(id)];
    this.writeCollection("categories", collection);
    return true;
  }

  async getSettings() {
    const payload = decodeStorage(this.storage.getItem(this.key("settings")), {
      schemaVersion: EVENT_SCHEMA_VERSION,
      value: DEFAULT_SETTINGS,
    });
    return { ...DEFAULT_SETTINGS, ...(payload.value ?? {}) };
  }

  async saveSettings(patch) {
    const value = { ...(await this.getSettings()), ...patch };
    this.storage.setItem(
      this.key("settings"),
      encodeStorage({ schemaVersion: EVENT_SCHEMA_VERSION, value }),
    );
    return clone(value);
  }

  async clearAll() {
    for (const name of ["events", "categories", "settings"]) {
      this.storage.removeItem(this.key(name));
    }
  }
}

/**
 * Open the production persistence layer. IndexedDB is preferred; only an
 * unavailable or failed IndexedDB initialization activates localStorage.
 */
export async function createEventStore(options = {}) {
  const onFallback = options.onFallback ?? (() => {});
  if (options.indexedDB !== null && (options.indexedDB ?? globalThis.indexedDB)) {
    try {
      return await new IndexedDbEventStore(options).init();
    } catch (error) {
      onFallback(error);
    }
  }
  return new LocalStorageEventStore(options).init();
}

export const openEventStore = createEventStore;
