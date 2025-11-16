import { listAllAds } from "./ads.js";
import { listClients } from "./clients.js";

export async function getTotalRevenue(adPriceDh = 300, adsData) {
  const ads = adsData ?? (await listAllAds());
  return ads.length * adPriceDh;
}

export async function getMonthlyRevenue(adPriceDh = 300, adsData) {
  const ads = adsData ?? (await listAllAds());
  const groups = new Map();

  ads.forEach((ad) => {
    const monthKey = ad.createdAt.slice(0, 7);
    const current = groups.get(monthKey) ?? 0;
    groups.set(monthKey, current + adPriceDh);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, revenueDh]) => ({ month, revenueDh }));
}

export async function getTopClients(limit = 5, adPriceDh = 300, adsData, clientsData) {
  const [ads, clients] = await Promise.all([
    adsData ?? listAllAds(),
    clientsData ?? listClients()
  ]);
  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const revenueMap = new Map();

  ads.forEach((ad) => {
    const stats = revenueMap.get(ad.clientId) ?? { adsCount: 0, revenueDh: 0 };
    stats.adsCount += 1;
    stats.revenueDh += adPriceDh;
    revenueMap.set(ad.clientId, stats);
  });

  return Array.from(revenueMap.entries())
    .map(([clientId, stats]) => ({
      clientId,
      clientName: clientMap.get(clientId)?.name ?? "Unknown",
      adsCount: stats.adsCount,
      revenueDh: stats.revenueDh
    }))
    .sort((a, b) => b.revenueDh - a.revenueDh)
    .slice(0, limit);
}

export async function getWorstClients(limit = 5, adsData, clientsData) {
  const [ads, clients] = await Promise.all([
    adsData ?? listAllAds(),
    clientsData ?? listClients()
  ]);
  const adsByClient = ads.reduce((map, ad) => {
    const list = map.get(ad.clientId) ?? [];
    list.push(ad);
    map.set(ad.clientId, list);
    return map;
  }, new Map());

  const now = Date.now();

  const ranked = clients.map((client) => {
    const clientAds = adsByClient.get(client.id) ?? [];
    const lastActive = client.lastActiveAt ?? client.createdAt;
    const inactivityMs = now - new Date(lastActive).getTime();
    return {
      clientId: client.id,
      clientName: client.name,
      adsCount: clientAds.length,
      lastActiveAt: lastActive,
      isSingleAd: clientAds.length <= 1,
      inactivityMs
    };
  });

  return ranked
    .sort((a, b) => {
      if (a.isSingleAd !== b.isSingleAd) {
        return Number(b.isSingleAd) - Number(a.isSingleAd);
      }
      return b.inactivityMs - a.inactivityMs;
    })
    .slice(0, limit)
    .map(({ isSingleAd, inactivityMs, ...rest }) => rest);
}

export async function getRetentionStats(adsData, clientsData) {
  const [ads, clients] = await Promise.all([
    adsData ?? listAllAds(),
    clientsData ?? listClients()
  ]);
  const adsByClient = ads.reduce((map, ad) => {
    const total = map.get(ad.clientId) ?? 0;
    map.set(ad.clientId, total + 1);
    return map;
  }, new Map());

  const totalClients = clients.length;
  const totalAds = ads.length;

  let returningClients = 0;
  let oneTimeClients = 0;

  clients.forEach((client) => {
    const count = adsByClient.get(client.id) ?? 0;
    if (count > 1) {
      returningClients += 1;
    } else if (count === 1) {
      oneTimeClients += 1;
    }
  });

  const retentionRate = totalClients ? Number((returningClients / totalClients).toFixed(2)) : 0;
  const avgAdsPerClient = totalClients ? Number((totalAds / totalClients).toFixed(2)) : 0;

  return {
    totalClients,
    returningClients,
    oneTimeClients,
    retentionRate,
    avgAdsPerClient
  };
}

export async function getDailyRevenue(days = 14, adsData, adPriceDh = 300) {
  const ads = adsData ?? (await listAllAds());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const map = new Map();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    map.set(key, 0);
  }

  ads.forEach((ad) => {
    const createdDate = new Date(ad.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    const key = createdDate.toISOString().slice(0, 10);
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + adPriceDh);
    }
  });

  return Array.from(map.entries()).map(([date, revenueDh]) => ({ date, revenueDh }));
}
