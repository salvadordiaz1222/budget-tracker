const { response } = require("express");

var CACHE_NAME = "budget-tracker-version-1";
var DATA_NAME = "budget-data-cache-version-1";

var filesToCache = [
  "/index.js",
  "/styles.css",
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("/api")) {
    event.respondWith(
      caches
        .open(DATA_NAME)
        .then(function (cache) {
          return fetch(event.request)
            .then(function (response) {
              if (response.status == 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch((error) => {
              return cache.match(event.request);
            });
        })
        .catch((error) => console.log(error))
    );
    return;
  }
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        }
        if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});
