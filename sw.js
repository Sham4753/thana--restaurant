const CACHE='thana-v2.1';
const FILES=[
'/thana--restaurant/','/thana--restaurant/login.html','/thana--restaurant/index.html',
'/thana--restaurant/kitchen.html','/thana--restaurant/waiter.html','/thana--restaurant/qr-menu.html',
'/thana--restaurant/orders.html','/thana--restaurant/dashboard.html','/thana--restaurant/close.html',
'/thana--restaurant/inventory.html','/thana--restaurant/menu.html','/thana--restaurant/tables.html',
'/thana--restaurant/reports.html','/thana--restaurant/staff.html','/thana--restaurant/customers.html',
'/thana--restaurant/theme-v2.css','/thana--restaurant/nav-component.js','/thana--restaurant/bridge.js',
'/thana--restaurant/beep.js','/thana--restaurant/manifest.json'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
