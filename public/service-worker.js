// Service Worker do app Prestador
// Cache desativado de propósito: sempre carrega a versão mais recente.
// (Havia uma segunda metade com cache offline que referenciava uma
// variável nunca definida — CACHE_VERSION — e disparava erro a cada
// instalação e a cada requisição; foi removida.)

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.map((nome) => caches.delete(nome))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})

// PUSH — api/enviar-push.js manda { titulo, corpo, url }; aceita também
// "mensagem" por compatibilidade com payloads antigos.
self.addEventListener('push', (event) => {
  const dados = event.data?.json() ?? {}
  const titulo = dados.titulo || 'Prestador'
  const opcoes = {
    body: dados.corpo || dados.mensagem || 'Você tem uma nova mensagem.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: { url: dados.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(titulo, opcoes))
})

// NOTIFICATION CLICK — foca a aba já aberta do app (ou abre uma nova) na
// url certa. A url vem relativa ("/chat/123"), então compara pelo caminho
// e não pela url absoluta.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const destino = new URL(event.notification.data?.url || '/', self.location.origin)

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      for (const janela of janelas) {
        if (new URL(janela.url).pathname === destino.pathname && 'focus' in janela) return janela.focus()
      }
      return clients.openWindow ? clients.openWindow(destino.href) : undefined
    })
  )
})
