
// ==========================================
// 🚀 PWA SERVICE WORKER - LEVEL 16 UPGRADE
// ==========================================

const CACHE_NAME = "collectorate-pwa-v16";

// Core app shell (offline-first)
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

// External CDN assets (cached with fallback)
const CDN_ASSETS = [
  "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
];

// Combine all
const ASSETS = [...CORE_ASSETS, ...CDN_ASSETS];

// ==========================================
// 📦 INSTALL EVENT (CACHE FIRST LOAD)
// ==========================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );

  // Force immediate activation
  self.skipWaiting();
});

// ==========================================
// 🔄 ACTIVATE EVENT (CLEAN OLD CACHE)
// ==========================================
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

// ==========================================
// 🌐 FETCH STRATEGY (SMART HYBRID)
// ==========================================
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // 🚫 Always bypass cache for spreadsheet / live API data
  if (request.url.includes("spreadsheets") || request.url.includes("api")) {
    event.respondWith(fetch(request));
    return;
  }

  // 🧠 Network first, cache fallback for HTML & JS
  if (request.destination === "document" || request.destination === "script") {
    event.respondWith(networkFirst(request));
    return;
  }

  // 🧱 Cache first for static assets
  event.respondWith(cacheFirst(request));
});

// ==========================================
// ⚡ NETWORK FIRST STRATEGY
// ==========================================
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || offlineFallback();
  }
}

// ==========================================
// 🧱 CACHE FIRST STRATEGY
// ==========================================
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return offlineFallback();
  }
}

// ==========================================
// 📴 OFFLINE FALLBACK
// ==========================================
function offlineFallback() {
  return new Response(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline</title>
      <style>
        body { font-family: Arial; text-align:center; padding:50px; }
      </style>
    </head>
    <body>
      <h2>📴 You are Offline</h2>
      <p>Please check your internet connection.</p>
    </body>
    </html>
    `,
    {
      headers: { "Content-Type": "text/html" }
    }
  );
}

// ==========================================
// 🔔 OPTIONAL: AUTO UPDATE NOTIFICATION HOOK
// ==========================================
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
