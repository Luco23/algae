const CACHE_NAME = 'talofitas-tactico-v1';
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

// Fase de Instalación (Descarga de arsenal)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

// Fase de Activación (Purga de caché obsoleta)
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

// Fase de Intercepción (Operación Offline Segura)
self.addEventListener('fetch', (event) => {
    // Ignorar peticiones de extensiones de Chrome u otros protocolos
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Retorna caché inmediata, si no existe, busca en la red y lo guarda
            return cachedResponse || fetch(event.request).then(response => {
                return caches.open(CACHE_NAME).then(cache => {
                    // Guardar imágenes dinámicas de Wikipedia/iNaturalist en caché para cero latencia futura
                    if (event.request.destination === 'image') {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                });
            });
        }).catch(() => {
            console.error("Fallo de red detectado. Operando en modo Offline restringido.");
        })
    );
});