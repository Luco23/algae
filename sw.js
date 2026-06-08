const CACHE_NAME = 'talofitas-tactico-v5'; // Versión actualizada para purga obligatoria
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './data/data.json',
    './data/teoria.json',
    'https://i.imgur.com/S7Mbuoe.png',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).then(response => {
                return caches.open(CACHE_NAME).then(cache => {
                    // BLINDAJE: Solo guarda imágenes si la descarga fue 100% exitosa (código 200)
                    if (event.request.destination === 'image' && response.ok) {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                });
            });
        }).catch(() => {
            console.error("Fallo de red. Operando en modo Offline.");
        })
    );
});
