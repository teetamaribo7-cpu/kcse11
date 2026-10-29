/* KCSE Year 11 Revision — offline support. Change VERSION when you upload a new index.html. */
var VERSION = "kcse11-v4.9c";
var FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (/script\.google(usercontent)?\.com$/.test(url.hostname) || /googleusercontent\.com$/.test(url.hostname)) return; /* marks and rankings always go online */
  if (url.origin === self.location.origin) {
    if (req.mode === "navigate") { e.respondWith(caches.match("./index.html").then(function (r) { return r || fetch(req); })); return; }
    e.respondWith(caches.match(req).then(function (r) { return r || fetch(req); }));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(function (r) {
      return r || fetch(req).then(function (res) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); return res; });
    }));
  }
});
