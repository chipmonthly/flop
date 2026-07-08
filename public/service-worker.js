/* eslint-disable */
const CACHE_NAME = "flop-cache-v1";

// Core assets that must be available offline for the SPA shell to load.
// Only list assets that are guaranteed to exist at these exact paths.
const PRECACHE_ASSETS = ["/index.html", "/manifest.json", "/favicon.ico"];

// Install: pre-cache the SPA shell. Individual failures won't abort the install.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(PRECACHE_ASSETS.map((url) => cache.add(url)));
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: remove stale caches, then take control of all clients immediately.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: passthrough on localhost; SPA fallback + network-first cache on production.
self.addEventListener("fetch", (event) => {
  // Ignore non-GET requests and non-http(s) schemes (e.g. chrome-extension://).
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  // On localhost: pass straight through so hot-reloading works normally.
  if (
    self.location.hostname === "localhost" ||
    self.location.hostname === "127.0.0.1"
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigation requests: network-first, fall back to cached index.html for SPA client-side routing.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put("/index.html", responseToCache));
          }
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // All other requests: network-first, fall back to cache.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const responseToCache = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
