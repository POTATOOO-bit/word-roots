const V='wr-v1',CDN='wr-cdn-v1';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','apple-touch-icon.png','data/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==CDN).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin){ // CDN libs: cache first
    e.respondWith(caches.open(CDN).then(async c=>{const m=await c.match(r);if(m)return m;const res=await fetch(r);if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}));return;
  }
  // own files: show cached instantly, refresh in background (new data appears next open)
  e.respondWith(caches.open(V).then(async c=>{
    const m=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>m);
    return m||net;
  }));
});
