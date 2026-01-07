// Service Worker for notifications
// 🚫 Production では Service Worker を一切動かさない

if (
  typeof self !== "undefined" &&
  self.location.hostname.includes("vercel.app")
) {
  self.addEventListener("install", () => {
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(self.registration.unregister());
  });

  // fetch / notification / cache など一切登録しない
  console.log("[SW] disabled on vercel production");
  return;
}

/* ===== 以下は将来 Local / Staging 用 ===== */
// まだ何も書かなくてOK
