/* Army Board Study Guide service worker. Cache-first app shell, no network use. */
var CACHE = "absg-ead9f0f7ef27-if90b71";
var SHELL = ["./", "./index.html", "./manifest.webmanifest?v=2",
             "./icon-192.png?v=2", "./icon-512.png?v=2", "./apple-touch-icon.png?v=2"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch:true}).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        var copy = res.clone();
        /* Only cache what actually came back OK. A 404 cached here is served cache-first */
        /* for the life of the generation, so a file that appears later stays missing. */
        if(res.ok) caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        return res;
      }).catch(function(){ return caches.match("./index.html"); });
    })
  );
});