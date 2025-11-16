import { deleteItem, get, getAll, put } from "./db.js";
import { generateId, nowIso } from "./utils.js";

const CLIENTS_STORE = "clients";
const ADS_STORE = "ads";

export function normalizeName(name = "") {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

export async function addClient({ name, phone = "", email = "" }) {
  const normalizedName = normalizeName(name);
  if (!normalizedName) {
    throw new Error("Client name is required");
  }

  const client = {
    id: generateId(),
    name: normalizedName,
    phone: sanitizeOptional(phone),
    email: sanitizeOptional(email),
    createdAt: nowIso()
  };

  await put(CLIENTS_STORE, client);
  return client;
}

export async function updateClient(client) {
  if (!client || !client.id) {
    throw new Error("Cannot update client without id");
  }

  if (client.name) {
    client.name = normalizeName(client.name);
  }

  client.phone = sanitizeOptional(client.phone);
  client.email = sanitizeOptional(client.email);

  await put(CLIENTS_STORE, client);
  return client;
}

export function getClientById(id) {
  return get(CLIENTS_STORE, id);
}

export async function listClients() {
  const clients = await getAll(CLIENTS_STORE);
  return clients.sort((a, b) => a.name.localeCompare(b.name));
}

export async function searchClients(query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return listClients();
  }

  const clients = await getAll(CLIENTS_STORE);
  return clients.filter((client) => {
    return [client.name, client.phone, client.email]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

export async function touchClientActivity(clientId) {
  const client = await getClientById(clientId);
  if (!client) {
    throw new Error("Client not found");
  }

  client.lastActiveAt = nowIso();
  await put(CLIENTS_STORE, client);
  return client;
}

export async function mergeDuplicates() {
  const clients = await getAll(CLIENTS_STORE);
  if (!clients.length) {
    return 0;
  }

  const ads = await getAll(ADS_STORE);
  const adsByClient = ads.reduce((map, ad) => {
    if (!map.has(ad.clientId)) {
      map.set(ad.clientId, []);
    }
    map.get(ad.clientId).push(ad);
    return map;
  }, new Map());

  const groups = new Map();
  clients.forEach((client) => {
    const key = normalizeName(client.name);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(client);
  });

  let mergeCount = 0;

  for (const group of groups.values()) {
    if (group.length <= 1) {
      continue;
    }

    group.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const primary = group[0];
    const duplicates = group.slice(1);

    for (const duplicate of duplicates) {
      const duplicateAds = adsByClient.get(duplicate.id) ?? [];
      for (const ad of duplicateAds) {
        ad.clientId = primary.id;
        await put(ADS_STORE, ad);
      }

      await deleteItem(CLIENTS_STORE, duplicate.id);
      mergeCount += 1;
    }
  }

  return mergeCount;
}

function sanitizeOptional(value) {
  const trimmed = typeof value === "string" ? value.trim() : value;
  return trimmed ? trimmed : undefined;
}
