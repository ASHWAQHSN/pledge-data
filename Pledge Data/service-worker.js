const CACHE_VERSION = "pledge-data-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./service-worker.js",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./core/ads.js",
  "./core/clients.js",
  "./core/analytics.js",
  "./core/budget.js",
  "./core/db.js",
  "./core/utils.js",
  "./core/names.js",
  "./ui/dashboard-view.js",
  "./ui/ads-view.js",
  "./ui/clients-view.js",
  "./ui/analytics-view.js",
  "./ui/budget-view.js",
  "./ui/tools-view.js",
  "./ui/names-view.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => (key !== CACHE_VERSION ? caches.delete(key) : null)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
