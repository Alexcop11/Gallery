self.addEventListener("install", e => {
  console.log("Service Worker instalado");
  e.waitUntil(
    caches.open("static").then(cache => {
      return cache.addAll(["./", "./index.html", "./styles.css", "./functions.js"]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
