// ══ Lifeline Service Worker – v7 ══
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// تهيئة Firebase في الـ Service Worker
firebase.initializeApp({
  apiKey:"AIzaSyAEDrqfd_nclOwCq2EJBwyeydLvseM-Y10",
  authDomain:"lifeline-1ec6c.firebaseapp.com",
  projectId:"lifeline-1ec6c",
  storageBucket:"lifeline-1ec6c.firebasestorage.app",
  messagingSenderId:"892085234006",
  appId:"1:892085234006:web:d52fb4960c1442d9b18ef7"
});

const messaging = firebase.messaging();

// استقبال الإشعارات عندما يكون التطبيق في الخلفية أو مغلق
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'Lifeline 🩸';
  const body  = payload.notification?.body  || payload.data?.msg || 'إشعار جديد';
  self.registration.showNotification(title, {
    body,
    icon: './icon-192.png',
    badge:'./icon-192.png',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: { url: self.location.origin }
  });
});

// فتح التطبيق عند النقر على الإشعار
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = e.notification.data?.url || self.location.origin;
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
      for(const c of list){ if(c.url===target && 'focus' in c) return c.focus(); }
      if(clients.openWindow) return clients.openWindow(target);
    })
  );
});

// ══ Cache ══
const CACHE = 'lifeline-v7';
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
  if(e.request.url.includes('firestore')||e.request.url.includes('googleapis')||e.request.url.includes('gstatic')){
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
