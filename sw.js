// The version of the cache.
const VERSION = "v1.1";

// The name of the cache
const CACHE_NAME = `period-tracker-${VERSION}`;

// The static resources that the app needs to function.
const APP_STATIC_RESOURCES = [
  "/",
  "/Cycle-Tracker-PWA/",
  "/Cycle-Tracker-PWA/index.html",
  "/Cycle-Tracker-PWA/app.js",
  "/Cycle-Tracker-PWA/style.css",
  "/Cycle-Tracker-PWA/icons/ct512.png",
];

// On install, cache the static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(APP_STATIC_RESOURCES);
    })(),
  );
});

// delete old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        }),
      );
      await clients.claim();
    })(),
  );
});

// On fetch, intercept server requests
// and respond with cached responses instead of going to network
self.addEventListener("fetch", (event) => {
  // As a single page app, direct app to always go to cached home page.
  /*if (event.request.mode === "navigate") {
    event.respondWith(caches.match("/Cycle-Tracker-PWA"));
    return;
  }*/

  // For all other requests, go to the cache first, and then the network.
  event.respondWith(
    (async () => {
      const r = await caches.match(event.request.url);
      console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
      if (r) return r;

      const response = await fetch(event.request.url);
      const cache = await caches.open(CACHE_NAME);
      console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
      cache.put(event.request, response.clone());
      return response;
    })(),
  );
});
