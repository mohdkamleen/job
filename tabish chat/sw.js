var appVersion = 'v-1.0';
var files = [
    './index.html',
    './404.html',
    './chat.html',
    './manifest.json', 
    './sw.js'
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(appVersion)
        .then(cache => {
            return cache.addAll(files);
        })
    )
    console.info('Service Worker is Installed');
    self.skipWaiting();
})


self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
        .then(cachename => {
            return Promise.all(
                cachename.map(cache => {
                    if(cache !== appVersion){
                        console.info('delete old caches', cache)
                        return caches.delete(cache);
                    }
                })
            )
        })
        )
            return self.clients.claim();
        })


        self.addEventListener("fetch", event => {
            console.info('Service Worker fetch', event.request.url);
            event.respondWith(
                caches.match(event.request)
                .then(res => {
                    return res || fetch(event.request);
                })
            )
         })