const CACHE = 'thana-v2.1-' + Date.now();
const FILES = [
    '/','/login.html','/index.html',
    '/kitchen.html','/waiter.html','/qr-menu.html',
    '/orders.html','/dashboard.html','/close.html',
    '/theme-v2.css','/nav-component.js','/bridge.js',
    '/beep.js','/channel.js','/manifest.json'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => 
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => {
        // إشعار بوجود تحديث
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({ type: 'UPDATE_AVAILABLE' });
            });
        });
        return self.clients.claim();
    }));
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request).then(response => {
            return caches.open(CACHE).then(cache => {
                cache.put(e.request, response.clone());
                return response;
            });
        }))
    );
});

// استقبال رسائل من الصفحات
self.addEventListener('message', e => {
    if (e.data && e.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
