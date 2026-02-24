var CACHE='c25k-v10';
var ASSETS=[
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: cache all core assets immediately
self.addEventListener('install',function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS);
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

// Activate: delete old caches, take control immediately
self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

// Fetch: serve from cache first, then network, cache new responses
self.addEventListener('fetch',function(e){
  // Only handle GET requests
  if(e.request.method!=='GET')return;

  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached)return cached;

      return fetch(e.request).then(function(resp){
        // Don't cache bad responses or opaque responses from CDNs we can't control
        if(!resp||resp.status!==200){
          return resp;
        }

        // Cache successful responses (fonts, the HTML page, icons, etc)
        var clone=resp.clone();
        caches.open(CACHE).then(function(cache){
          cache.put(e.request,clone);
        });
        return resp;
      }).catch(function(){
        // Completely offline and not cached - serve fallback
        if(e.request.destination==='document'){
          return caches.match('./index.html');
        }
        return new Response('Offline',{status:503,headers:{'Content-Type':'text/plain'}});
      });
    })
  );
});
