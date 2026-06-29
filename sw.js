const CACHE_NAME = 'thana-v2-2026';
const ASSETS = [
  '/thana--restaurant/',
  '/thana--restaurant/index.html',
  '/thana--restaurant/dashboard.html',
  '/thana--restaurant/style.css',
  '/thana--restaurant/theme.css',
  '/thana--restaurant/app.js',
  '/thana--restaurant/waiter.html',
  '/thana--restaurant/kitchen.html',
  '/thana--restaurant/tables.html',
  '/thana--restaurant/staff.html',
  '/thana--restaurant/menu.html',
  '/thana--restaurant/inventory.html',
  '/thana--restaurant/reports.html',
  '/thana--restaurant/settings.html',
  '/thana--restaurant/close.html',
  '/thana--restaurant/waste_report.html',
  '/thana--restaurant/admin.html',
  '/thana--restaurant/customers.html',
  '/thana--restaurant/velocity.html',
  '/thana--restaurant/procurement.html',
  '/thana--restaurant/invoice.html',
  '/thana--restaurant/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'Thana', body: 'طلب جديد!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/thana--restaurant/icons/icon-192.png',
      badge: '/thana--restaurant/icons/icon-96.png',
      vibrate: [200, 100, 200],
      dir: 'rtl',
      lang: 'ar-SA'
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/thana--restaurant/'));
});
