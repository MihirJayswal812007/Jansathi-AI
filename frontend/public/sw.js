// ===== JanSathi AI — Service Worker =====
// PWA offline support with cache-first strategy

const CACHE_NAME = "jansathi-v1";
const OFFLINE_URL = "/offline";

// Assets to precache (app shell)
const PRECACHE_ASSETS = [
    "/",
    "/offline",
    "/manifest.json",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
];

// Install: precache app shell
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[SW] Precaching app shell");
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => {
                        console.log("[SW] Removing old cache:", key);
                        return caches.delete(key);
                    })
            )
        )
    );
    self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== "GET") return;

    // API routes: network-first (don't cache)
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(
            fetch(request).catch(() =>
                new Response(
                    JSON.stringify({
                        error: "offline",
                        message: "You are offline. Please check your internet connection.",
                        messageHi: "आप ऑफलाइन हैं। कृपया अपना इंटरनेट कनेक्शन जांचें।",
                    }),
                    {
                        status: 503,
                        headers: { "Content-Type": "application/json" },
                    }
                )
            )
        );
        return;
    }

    // Static assets: cache-first, then network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Update cache in background
                fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse.ok) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, networkResponse);
                            });
                        }
                    })
                    .catch(() => { });
                return cachedResponse;
            }

            return fetch(request)
                .then((networkResponse) => {
                    // Cache successful responses
                    if (networkResponse.ok) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Offline fallback for navigation requests
                    if (request.mode === "navigate") {
                        return caches.match(OFFLINE_URL);
                    }
                    return new Response("Offline", { status: 503 });
                });
        })
    );
});

// Background sync for queued messages (future feature)
self.addEventListener("sync", (event) => {
    if (event.tag === "send-messages") {
        console.log("[SW] Background sync: sending queued messages");
    }
});

// Push notifications (future feature)
self.addEventListener("push", (event) => {
    const data = event.data?.json() || {};
    const title = data.title || "JanSathi AI";
    const body = data.body || "आपके लिए नई जानकारी उपलब्ध है!";

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
            vibrate: [200, 100, 200],
            tag: "jansathi-notification",
        })
    );
});
