const DB_NAME = "pledge-data-db";
const DB_VERSION = 1;

const STORE_DEFINITIONS = [
  {
    name: "ads",
    options: { keyPath: "id", autoIncrement: false },
    indexes: [
      { name: "clientId", keyPath: "clientId", options: { unique: false } },
      { name: "endAt", keyPath: "endAt", options: { unique: false } }
    ]
  },
  {
    name: "clients",
    options: { keyPath: "id", autoIncrement: false },
    indexes: [{ name: "name", keyPath: "name", options: { unique: false } }]
  },
  { name: "budget", options: { keyPath: "id", autoIncrement: false }, indexes: [] },
  { name: "notes", options: { keyPath: "clientId", autoIncrement: false }, indexes: [] },
  { name: "ratings", options: { keyPath: "clientId", autoIncrement: false }, indexes: [] }
];

let dbPromise;

export function openDB() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      setupObjectStores(db);
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });

  return dbPromise;
}

export async function put(storeName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.oncomplete = () => resolve(value);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(storeName).put(value);
  });
}

export async function get(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, "readonly").objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function getAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, "readonly").objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteItem(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(storeName).delete(key);
  });
}

export async function clearStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(storeName).clear();
  });
}

export async function getAllByIndex(storeName, indexName, queryValue) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    let request;

    if (typeof queryValue === "undefined" || queryValue === null) {
      request = index.getAll();
    } else {
      const range = IDBKeyRange.only(queryValue);
      request = index.getAll(range);
    }

    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
}

function setupObjectStores(db) {
  STORE_DEFINITIONS.forEach(({ name, options, indexes = [] }) => {
    if (db.objectStoreNames.contains(name)) {
      return;
    }

    const store = db.createObjectStore(name, options);
    indexes.forEach((index) => {
      store.createIndex(index.name, index.keyPath, index.options);
    });
  });
}
