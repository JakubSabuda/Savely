const staticSavelyApp = "Savely-App-Website";
const assets = [
  "/",
  "/index.html",
  "/css/login.css",
  "/css/rejestracja.css",
  "/LoginAndRegisterAuth.js",
  "/manifest.json",
  "/Rejestracja.html",
  "/favicon.ico",
  "/main/main.html",
  "/main/main.js",
  "/main/manifest.json",
  "/main/style.css",
  "/main/icon/edit.png",
  "/main/icon/plus.png",
  "/main/icon/trash.png",
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(staticSavelyApp).then(function (cache) {
      return cache.addAll(assets);
    })
  );
  self.skipWaiting();
});

/* Serve cached content when offline */
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});