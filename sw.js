var CACHE='c25k-v4';
var ASSETS=[
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap'
];

self.addEventListener('install',function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS);
    }).then(function(){self.skipWaiting();})
  );
});

self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){return k!==CACHE;})
            .map(function(k){return caches.delete(k);})
      );
    }).then(function(){return self.clients.claim();})
  );
});

self.addEventListener('fetch',function(e){
  e.respondWith(
    caches.match(e.request).then(function(cached){
      // Cache-first for fonts (they don't change), network-first for app
      var isFont=e.request.url.indexOf('fonts.')!==-1;
      if(isFont&&cached)return cached;

      return fetch(e.request).then(function(resp){
        // Cache successful responses (fonts, the HTML page)
        if(resp&&resp.status===200){
          var clone=resp.clone();
          caches.open(CACHE).then(function(cache){
            cache.put(e.request,clone);
          });
        }
        return resp;
      }).catch(function(){
        // Offline fallback — serve cached version
        return cached||new Response('Offline — open the app on WiFi first.',{
          status:503,headers:{'Content-Type':'text/plain'}
        });
      });
    })
  );
});
