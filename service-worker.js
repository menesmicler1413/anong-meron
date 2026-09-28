const CACHE_NAME = "anong-meron-v4";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./admin.html",
    "./menu.html",

    "./style.css",

    "./script.js",
    "./admin.js",
    "./menu.js",

    "./manifest.json",

    "./images/PancitCanton.webp",
    "./images/sopas.png",
    "./images/chickenadobo.png",
    "./images/chiligarlic.png",

    "./Icon/AnongMeron.png"
];


// ==========================================
// INSTALL
// ==========================================

self.addEventListener("install", function(event) {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(function(cache) {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    self.skipWaiting();

});


// ==========================================
// ACTIVATE
// ==========================================

self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches.keys()

            .then(function(cacheNames) {

                return Promise.all(

                    cacheNames.map(function(cacheName) {

                        if (
                            cacheName !== CACHE_NAME
                        ) {

                            return caches.delete(
                                cacheName
                            );

                        }

                    })

                );

            })

    );

    self.clients.claim();

});


// ==========================================
// FETCH
// ==========================================

self.addEventListener("fetch", function(event) {

    // ======================================
    // IMPORTANT:
    // ONLY CACHE GET REQUESTS
    // ======================================

    if (event.request.method !== "GET") {

        return;

    }


    event.respondWith(

        fetch(event.request)

            .then(function(response) {

                // Only cache successful responses

                if (
                    response &&
                    response.status === 200 &&
                    response.type !== "opaque"
                ) {

                    const responseClone =
                        response.clone();


                    caches.open(CACHE_NAME)

                        .then(function(cache) {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                }


                return response;

            })

            .catch(function() {

                return caches.match(
                    event.request
                );

            })

    );

});