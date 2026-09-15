// Minimal service worker. It doesn't cache anything (the app always shows
// the live site), it just needs to exist for Chrome/Android to treat this
// as an installable app and show the native "Install app" prompt.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pass-through: no offline caching, content is always live.
});
