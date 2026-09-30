// Digital Pragati offline service worker for the static site.
// Pages: network first, falling back to the cached copy, then to offline.html
// for pages that were never saved on this device.
// Icons and the manifest: cache first.
// Only same-origin GET requests inside the worker's scope are handled. The
// private admin page and the API (admin and api/ under the scope, e.g. /admin
// and /api/enquiry on Vercel) are never intercepted or cached.
const CACHE = "pragati-static-v4";
const PRECACHE = ["./", "./index.html", "./offline.html", "./manifest.webmanifest", "./icons/favicon.svg", "./icons/icon-192.png"];
const PRIVATE = /^(admin|api)(\/|\?|#|$)/;

// True when the worker should leave the request to the network untouched.
const bypass = (request) => {
  if (request.method !== "GET") return true;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return true;
  const scope = self.registration.scope;
  if (!url.href.startsWith(scope)) return true;
  return PRIVATE.test(url.href.slice(scope.length));
};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (bypass(request)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("./offline.html"))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        }),
    ),
  );
});
