import { deleteItem, get, getAll, put } from "./db.js";
import { addDays, generateId, nowIso } from "./utils.js";

const STORE = "ads";

export async function createAd({ clientId, adName, link = "", createdAt }) {
  if (!clientId || !adName) {
    throw new Error("clientId and adName are required to create an ad");
  }

  const created = createdAt ?? nowIso();
  const ad = {
    id: generateId(),
    clientId,
    adName,
    link,
    createdAt: created,
    endAt: addDays(created, 3),
    renewedCount: 0
  };

  await put(STORE, ad);
  return ad;
}

export async function renewAd(adId, extraDays = 3) {
  const ad = await getAdById(adId);
  if (!ad) {
    throw new Error("Ad not found");
  }

  ad.endAt = addDays(ad.endAt ?? ad.createdAt, extraDays);
  ad.renewedCount = (ad.renewedCount ?? 0) + 1;
  await put(STORE, ad);
  return ad;
}

export async function updateAd(ad) {
  if (!ad || !ad.id) {
    throw new Error("Cannot update ad without id");
  }

  await put(STORE, ad);
  return ad;
}

export async function deleteAd(adId) {
  await deleteItem(STORE, adId);
}

export function getAdById(adId) {
  return get(STORE, adId);
}

export async function listAllAds() {
  const ads = await getAll(STORE);
  return ads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getActiveAds(now = nowIso()) {
  const ads = await getAll(STORE);
  const nowTime = new Date(now).getTime();
  return ads
    .filter((ad) => new Date(ad.endAt).getTime() >= nowTime)
    .sort((a, b) => new Date(a.endAt) - new Date(b.endAt));
}

export async function getExpiredAds(now = nowIso()) {
  const ads = await getAll(STORE);
  const nowTime = new Date(now).getTime();
  return ads.filter((ad) => new Date(ad.endAt).getTime() < nowTime);
}

export async function getExpiringSoon(thresholdHours = 24, now = nowIso()) {
  const activeAds = await getActiveAds(now);
  const nowMs = new Date(now).getTime();
  const limit = nowMs + thresholdHours * 60 * 60 * 1000;
  return activeAds.filter((ad) => {
    const endMs = new Date(ad.endAt).getTime();
    return endMs >= nowMs && endMs <= limit;
  });
}

export async function getExpiringAds(thresholdHours = 24, now = nowIso()) {
  return getExpiringSoon(thresholdHours, now);
}

export function getAdStatus(ad, now = nowIso()) {
  const nowMs = new Date(now).getTime();
  const endMs = new Date(ad.endAt).getTime();
  const createdMs = new Date(ad.createdAt).getTime();

  if (endMs < nowMs) {
    return "expired";
  }

  if (nowMs - createdMs < 24 * 60 * 60 * 1000) {
    return "new";
  }

  const hoursLeft = (endMs - nowMs) / (1000 * 60 * 60);
  if (hoursLeft < 24) {
    return "expiring";
  }

  return "active";
}

export async function deleteAdByClient(clientId) {
  const ads = await getAll(STORE);
  const toDelete = ads.filter((ad) => ad.clientId === clientId);
  await Promise.all(toDelete.map((ad) => deleteItem(STORE, ad.id)));
  return toDelete.length;
}
