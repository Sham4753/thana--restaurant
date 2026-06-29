// Thana Restaurant - Service Worker v2.1
// استراتيجية: ثابت = Cache First | ديناميكي = Network First

const CACHE_STATIC = 'thana-static-v2';
const CACHE_DYNAMIC = 'thana-dynamic-v2';

const STATIC_FILES = [
    '/thana--restaurant/',
    '/thana--restaurant/index.html',
    '/thana--restaurant/login.html',
    '/thana--restaurant/404.html',
    '/thana--restaurant/onboarding.html',
    '/thana--restaurant/theme-v2.css',
    '/thana--restaurant/style.css',
    '/thana--restaurant/manifest.json',
    '/thana--restaurant/nav-component.js',
    '/thana--restaurant/pwa-register.js',
    '/thana--restaurant/sw.js',
];

// التثبيت - تخزين الملفات الثابتة
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_STATIC).then(cache => {
            return cache.addAll(STATIC_FILES);
        }).then(() => self.skipWaiting())
    );
});

// التفعيل - تنظيف الكاش القديم
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_STATIC && key !== CACHE_DYNAMIC)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// استراتيجية مزدوجة
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // API calls + بيانات = Network First
    if (url.pathname.includes('/api/') || url.searchParams.has('live')) {
        event.respondWith(networkFirst(event.request));
    }
    // ملفات ثابتة = Cache First
    else if (STATIC_FILES.some(f => url.pathname.endsWith(f.replace('/thana--restaurant/', '')))) {
        event.respondWith(cacheFirst(event.request));
    }
    // الباقي = Network First مع fallback للكاش
    else {
        event.respondWith(networkFirst(event.request));
    }
});

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_STATIC);
            cache.put(request, response.clone());
        }
        return response;
    } catch(e) {
        return new Response('Offline', { status: 503 });
    }
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_DYNAMIC);
            cache.put(request, response.clone());
        }
        return response;
    } catch(e) {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('Offline - يرجى الاتصال بالإنترنت', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}

// Push notifications
self.addEventListener('push', event => {
    const data = event.data?.json() || { title: 'Thana', body: 'طلب جديد!' };
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/thana--restaurant/icons/icon-192.png',
            badge: '/thana--restaurant/icons/icon-96.png',
            vibrate: [200, 100, 200],
            dir: 'rtl',
            lang: 'ar-SA',
            requireInteraction: true
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/thana--restaurant/kitchen.html')
    );
});
