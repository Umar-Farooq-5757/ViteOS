/**
 * Storage Lab — data layer
 * Reads, writes and deletes across localStorage, sessionStorage,
 * cookies, IndexedDB and Cache Storage.
 *
 * Everything here is same-origin only: the browser will never let a page
 * read another site's storage, so this always shows ViteOS's own data.
 */

export type StorageKind =
  | "local"
  | "session"
  | "cookies"
  | "indexeddb"
  | "cache";

export interface StorageEntry {
  /** Unique across the whole app, used for selection. */
  id: string;
  /** Display name — the storage key, cookie name, record key or request path. */
  key: string;
  /** Raw string value, used for the tree, the raw view and the editor. */
  raw: string;
  /** Approximate size in bytes. */
  size: number;
  /** Optional grouping header, e.g. "viteos-db → files" or a cache name. */
  group?: string;
  /** Extra detail chips shown in the inspector header. */
  meta?: Record<string, string>;
  /** Whether the value can be written back. */
  editable: boolean;
  /** Internal coordinates for writes/deletes. */
  ref?: {
    database?: string;
    store?: string;
    recordKey?: IDBValidKey;
    keyPath?: string | string[] | null;
    cacheName?: string;
    url?: string;
  };
}

export const STORAGE_TABS: {
  id: StorageKind;
  label: string;
  short: string;
}[] = [
  { id: "local", label: "Local Storage", short: "Local" },
  { id: "session", label: "Session Storage", short: "Session" },
  { id: "cookies", label: "Cookies", short: "Cookies" },
  { id: "indexeddb", label: "IndexedDB", short: "IndexedDB" },
  { id: "cache", label: "Cache Storage", short: "Cache" },
];

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

export const byteSize = (value: string): number => {
  try {
    return new TextEncoder().encode(value).length;
  } catch {
    return value.length;
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Parses a stored string. Strings that aren't JSON come back untouched
 * so the tree can still render them as a single value.
 */
export const safeParse = (
  raw: string,
): { parsed: unknown; isJson: boolean } => {
  const trimmed = raw.trim();
  if (!trimmed) return { parsed: raw, isJson: false };
  try {
    const parsed = JSON.parse(trimmed);
    return { parsed, isJson: typeof parsed === "object" && parsed !== null };
  } catch {
    return { parsed: raw, isJson: false };
  }
};

/** JSON.stringify that survives Blobs, buffers and circular refs. */
export const stringifySafe = (value: unknown): string => {
  const seen = new WeakSet<object>();
  try {
    return (
      JSON.stringify(
        value,
        (_key, val) => {
          if (typeof Blob !== "undefined" && val instanceof Blob)
            return `[Blob · ${val.size} bytes · ${val.type || "unknown type"}]`;
          if (val instanceof ArrayBuffer)
            return `[ArrayBuffer · ${val.byteLength} bytes]`;
          if (ArrayBuffer.isView(val))
            return `[${val.constructor.name} · ${val.byteLength} bytes]`;
          if (typeof val === "object" && val !== null) {
            if (seen.has(val)) return "[Circular]";
            seen.add(val);
          }
          return val;
        },
        2,
      ) ?? String(value)
    );
  } catch {
    return String(value);
  }
};

const shortenUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.pathname === "/" ? parsed.host : parsed.pathname;
  } catch {
    return url;
  }
};

/* ------------------------------------------------------------------ */
/* readers                                                             */
/* ------------------------------------------------------------------ */

const readWebStorage = (area: "local" | "session"): StorageEntry[] => {
  const store = area === "local" ? window.localStorage : window.sessionStorage;
  const entries: StorageEntry[] = [];

  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key === null) continue;
    const raw = store.getItem(key) ?? "";
    entries.push({
      id: `${area}:${key}`,
      key,
      raw,
      size: byteSize(key) + byteSize(raw),
      editable: true,
    });
  }

  return entries.sort((a, b) => a.key.localeCompare(b.key));
};

const readCookies = (): StorageEntry[] => {
  if (!document.cookie) return [];

  return document.cookie
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const splitAt = pair.indexOf("=");
      const key = splitAt === -1 ? pair : pair.slice(0, splitAt);
      const encoded = splitAt === -1 ? "" : pair.slice(splitAt + 1);

      let raw = encoded;
      try {
        raw = decodeURIComponent(encoded);
      } catch {
        /* value wasn't percent-encoded, keep it as-is */
      }

      return {
        id: `cookie:${key}`,
        key,
        raw,
        size: byteSize(key) + byteSize(encoded),
        editable: true,
        meta: { scope: "document.cookie", path: "/" },
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
};

const openDatabase = (name: string): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error(`"${name}" is blocked`));
  });

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const readIndexedDB = async (recordLimit = 200): Promise<StorageEntry[]> => {
  if (!("indexedDB" in window)) return [];
  if (typeof indexedDB.databases !== "function") {
    throw new Error(
      "This browser can't list IndexedDB databases. Try Chrome, Edge or a recent Firefox.",
    );
  }

  const databases = await indexedDB.databases();
  const entries: StorageEntry[] = [];

  for (const info of databases) {
    if (!info.name) continue;

    let db: IDBDatabase;
    try {
      db = await openDatabase(info.name);
    } catch {
      continue;
    }

    for (const storeName of Array.from(db.objectStoreNames)) {
      try {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const keyPath = store.keyPath;

        const [values, keys] = await Promise.all([
          requestToPromise(store.getAll(undefined, recordLimit)),
          requestToPromise(store.getAllKeys(undefined, recordLimit)),
        ]);

        values.forEach((value: unknown, index: number) => {
          const recordKey = keys[index];
          const raw = stringifySafe(value);
          entries.push({
            id: `idb:${info.name}:${storeName}:${String(recordKey)}`,
            key: String(recordKey),
            raw,
            size: byteSize(raw),
            group: `${info.name} → ${storeName}`,
            editable: true,
            meta: {
              database: info.name!,
              store: storeName,
              version: String(info.version ?? "?"),
              keyPath: keyPath ? String(keyPath) : "out-of-line",
            },
            ref: {
              database: info.name,
              store: storeName,
              recordKey,
              keyPath,
            },
          });
        });
      } catch {
        /* skip stores we can't open */
      }
    }

    db.close();
  }

  return entries;
};

const readCacheStorage = async (limit = 150): Promise<StorageEntry[]> => {
  if (!("caches" in window)) {
    throw new Error("Cache Storage isn't available in this browser context.");
  }

  const names = await caches.keys();
  const entries: StorageEntry[] = [];

  for (const name of names) {
    const cache = await caches.open(name);
    const requests = (await cache.keys()).slice(0, limit);

    for (const request of requests) {
      const detail: Record<string, unknown> = {
        url: request.url,
        method: request.method,
        destination: request.destination || "unknown",
      };

      try {
        const response = await cache.match(request);
        if (response) {
          detail.status = response.status;
          detail.statusText = response.statusText;
          detail.contentType = response.headers.get("content-type") ?? "—";
          detail.contentLength = response.headers.get("content-length") ?? "—";
          detail.date = response.headers.get("date") ?? "—";
        }
      } catch {
        /* response unavailable, keep the request info */
      }

      const raw = stringifySafe(detail);
      entries.push({
        id: `cache:${name}:${request.url}`,
        key: shortenUrl(request.url),
        raw,
        size: byteSize(raw),
        group: name,
        editable: false,
        meta: { cache: name },
        ref: { cacheName: name, url: request.url },
      });
    }
  }

  return entries;
};

export const readStorage = async (
  kind: StorageKind,
): Promise<StorageEntry[]> => {
  switch (kind) {
    case "local":
      return readWebStorage("local");
    case "session":
      return readWebStorage("session");
    case "cookies":
      return readCookies();
    case "indexeddb":
      return readIndexedDB();
    case "cache":
      return readCacheStorage();
    default:
      return [];
  }
};

/* ------------------------------------------------------------------ */
/* writers                                                             */
/* ------------------------------------------------------------------ */

export const writeEntry = async (
  kind: StorageKind,
  entry: StorageEntry,
  nextRaw: string,
): Promise<void> => {
  switch (kind) {
    case "local":
      window.localStorage.setItem(entry.key, nextRaw);
      return;
    case "session":
      window.sessionStorage.setItem(entry.key, nextRaw);
      return;
    case "cookies":
      document.cookie = `${entry.key}=${encodeURIComponent(
        nextRaw,
      )}; path=/; SameSite=Lax`;
      return;
    case "indexeddb": {
      const { database, store, recordKey, keyPath } = entry.ref ?? {};
      if (!database || !store) throw new Error("Missing database reference.");

      const value = JSON.parse(nextRaw);
      const db = await openDatabase(database);
      const transaction = db.transaction(store, "readwrite");
      const objectStore = transaction.objectStore(store);

      // In-line keys live inside the value; out-of-line keys are passed separately.
      await requestToPromise(
        keyPath ? objectStore.put(value) : objectStore.put(value, recordKey),
      );
      db.close();
      return;
    }
    case "cache":
      throw new Error("Cached responses are read-only.");
  }
};

export const deleteEntry = async (
  kind: StorageKind,
  entry: StorageEntry,
): Promise<void> => {
  switch (kind) {
    case "local":
      window.localStorage.removeItem(entry.key);
      return;
    case "session":
      window.sessionStorage.removeItem(entry.key);
      return;
    case "cookies":
      document.cookie = `${entry.key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      return;
    case "indexeddb": {
      const { database, store, recordKey } = entry.ref ?? {};
      if (!database || !store) throw new Error("Missing database reference.");
      const db = await openDatabase(database);
      const transaction = db.transaction(store, "readwrite");
      await requestToPromise(
        transaction.objectStore(store).delete(recordKey as IDBValidKey),
      );
      db.close();
      return;
    }
    case "cache": {
      const { cacheName, url } = entry.ref ?? {};
      if (!cacheName || !url) throw new Error("Missing cache reference.");
      const cache = await caches.open(cacheName);
      await cache.delete(url);
      return;
    }
  }
};

export const createEntry = async (
  kind: StorageKind,
  key: string,
  value: string,
): Promise<void> => {
  switch (kind) {
    case "local":
      window.localStorage.setItem(key, value);
      return;
    case "session":
      window.sessionStorage.setItem(key, value);
      return;
    case "cookies":
      document.cookie = `${key}=${encodeURIComponent(
        value,
      )}; path=/; SameSite=Lax`;
      return;
    default:
      throw new Error("New entries can only be added to storage or cookies.");
  }
};

export const clearStorage = async (
  kind: StorageKind,
  entries: StorageEntry[],
): Promise<void> => {
  switch (kind) {
    case "local":
      window.localStorage.clear();
      return;
    case "session":
      window.sessionStorage.clear();
      return;
    case "cookies":
      entries.forEach((entry) => {
        document.cookie = `${entry.key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
      return;
    case "indexeddb": {
      const names = new Set(
        entries.map((entry) => entry.ref?.database).filter(Boolean),
      );
      await Promise.all(
        Array.from(names).map(
          (name) =>
            new Promise<void>((resolve) => {
              const request = indexedDB.deleteDatabase(name as string);
              request.onsuccess = () => resolve();
              request.onerror = () => resolve();
              request.onblocked = () => resolve();
            }),
        ),
      );
      return;
    }
    case "cache": {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
      return;
    }
  }
};
