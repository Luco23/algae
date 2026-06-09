// El nombre ya no necesita cambiar. Será estático.
const CACHE_NAME = 'talofitas-tactico-auto'; 

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './data/data.json',
    './data/teoria.json',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap'
];

self.addEventListener('install', (event) => {
    // Fuerzo la instalación inmediata
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Toma el control de la página instantáneamente sin esperar a que se reinicie
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

    // DOCTRINA TÁCTICA: "Network-First" (Primero Red)
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Si hay internet y la carga es exitosa, actualiza la copia de seguridad silenciosamente
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si no hay internet (falla el fetch), extrae el archivo de la memoria caché
                console.warn("Falla de conexión: Activando respaldo Offline para " + event.request.url);
                return caches.match(event.request);
            })
    );
});
