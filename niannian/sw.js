const CACHE = 'niannian-v1.1.2';
const ASSETS = ['./', './index.html', './src/app.js', './src/core.js', './src/data.js', './src/styles.css', './src/glass.css', './src/materials.js', './assets/original-welcome.png', './assets/original-home.png', './assets/original-guide.png', './assets/original-hand.png', './assets/original-lesson.png', './assets/puppy.svg', './assets/icon.svg', './assets/icon-192.png', './assets/icon-512.png', './manifest.webmanifest'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith('niannian-') && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    if (cached) return cached;
    try { return await fetch(e.request); }
    catch {
      if (e.request.mode === 'navigate') return (await caches.match(new URL('./index.html', self.registration.scope))) || Response.error();
      return Response.error();
    }
  })());
});




