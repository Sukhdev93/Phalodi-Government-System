
const CACHE_NAME = "collectorate-pwa-v16";

// Core app files (must be cached)
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

// External CDN assets (cached but safely handled)
const CDN_ASSETS = [
  "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
];

// ===============================
// 📦 INSTALL EVENT (FAST CACHE)
// ===============================
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...CORE_ASSETS, ...CDN_ASSETS]);
    })
  );
});

// ===============================
// 🔄 ACTIVATE EVENT (CACHE CLEANUP FIXED)
// ===============================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// ===============================
// 🌐 FETCH STRATEGY (SMART OFFLINE)
// ===============================
self.addEventListener("fetch", (event) => {
  const requestUrl = event.request.url;

  // 🔥 Always bypass cache for live spreadsheet data
  if (requestUrl.includes("spreadsheets")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: "Offline - No live data available" }),
          { headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // ⚡ NETWORK FIRST for HTML (fresh updates)
  if (event.request.destination === "document") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // 📦 CACHE FIRST for assets
  event.respondWith(cacheFirst(event.request));
});

// ===============================
// ⚡ NETWORK FIRST STRATEGY
// ===============================
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    const cache = await caches.open(CACHE_NAME);
    cache
