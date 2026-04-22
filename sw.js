const CACHE = 'lifeline-v6';
const FILES = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  // الشبكة أولاً للـ Firebase والـ APIs
  if(e.request.url.includes('firestore') || e.request.url.includes('googleapis')){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(
    fetch(e.request).then(res=>{
      const clone=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,clone));
      return res;
    }).catch(()=>caches.match(e.request))
  );
});
