// "Người giữ kho" của dmath Slate: lưu sẵn app trong máy để mở được khi không có mạng.
// Trang chính: có mạng thì luôn lấy bản mới nhất, mất mạng mới dùng bản đã lưu. Các tệp phụ (phông chữ, thư viện PDF, biểu tượng): lấy trong kho trước cho nhanh.
const KHO = 'dmath-slate-v116';
const CAN_CO = ['./', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
const THEM = ['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(KHO).then(async c => { await c.addAll(CAN_CO); await Promise.all(THEM.map(u => c.add(u).catch(() => {}))); }).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('dmath-slate-') && k !== KHO).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || !r.url.startsWith('http')) return;
  const u = new URL(r.url), cuaMinh = u.origin === location.origin;
  const duocLuu = cuaMinh || /cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname);
  if (!duocLuu) return;                               // trang web khác (máy tính Vinacal...): để trình duyệt tự lo
  const cat = res => { if (res && (res.ok || res.type === 'opaque')) { const b = res.clone(); caches.open(KHO).then(c => c.put(r, b)); } return res; };
  if (r.mode === 'navigate' || (cuaMinh && u.pathname.endsWith('/'))) e.respondWith(fetch(r).then(cat).catch(() => caches.match(r, { ignoreSearch:true }).then(m => m || caches.match('./'))));
  else e.respondWith(caches.match(r).then(m => m || fetch(r).then(cat)));
});
