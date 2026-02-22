var CACHE='c25k-v9';
var ASSETS=[
  './',
  './index.html',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap'
];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS)}).then(function(){return self.skipWaiting()}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});

self.addEventListener('fetch',function(e){
  var url=new URL(e.request.url);
  // Fonts: cache-first (they don't change)
  if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.match(e.request).then(function(r){return r||fetch(e.request).then(function(res){var c=res.clone();caches.open(CACHE).then(function(cache){cache.put(e.request,c)});return res})}));
    return;
  }
  // App pages: network-first so updates propagate
  e.respondWith(fetch(e.request).then(function(res){
    if(res&&res.status===200){var c=res.clone();caches.open(CACHE).then(function(cache){cache.put(e.request,c)});}
    return res;
  }).catch(function(){return caches.match(e.request).then(function(r){return r||new Response('Offline — open this page on WiFi first to cache it.',{status:503,headers:{'Content-Type':'text/plain'}})})}));
});
