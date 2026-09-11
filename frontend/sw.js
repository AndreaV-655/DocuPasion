const CACHE = 'docupasion-v2';
const ASSETS = [
    './',
    'index.html',
    'css/styles.css',
    'js/api.js',
    'js/app.js',
    'vendor/lucide.min.js',
    'vendor/pdf.min.js',
    'vendor/pdf.worker.min.js',
    'vendor/mammoth.browser.min.js',
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const { request } = e;
    if (request.method !== 'GET') return;
    e.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((res) => {
                if (res && res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE).then((c) => c.put(request, copy));
                }
                return res;
            }).catch(() => Response.error());
        })
    );
});