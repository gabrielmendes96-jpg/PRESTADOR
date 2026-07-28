// Service Worker do app Prestador
// Cache desativado para sempre carregar versão mais recente

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
))
self.addEventListener('fetch', e => e.respondWith(fetch(e.request)))

// Arquivos essenciais para funcionar offline
const ARQUIVOS_ESSENCIAIS = [
  '/',
  '/index.html',
  '/busca',
  '/planos',
  '/cadastro-pro',
]

// ----------------------------------------------------------------
// INSTALL — salva os arquivos essenciais no cache
// ----------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(ARQUIVOS_ESSENCIAIS)
    })
  )
  self.skipWaiting()
})

// ----------------------------------------------------------------
// ACTIVATE — limpa caches antigos
// ----------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_VERSION)
          .map((nome) => caches.delete(nome))
      )
    )
  )
  self.clients.claim()
})

// ----------------------------------------------------------------
// FETCH — estratégia "Network first, cache fallback"
// Tenta buscar da rede; se falhar (offline), usa o cache.
// ----------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET
  if (event.request.method !== 'GET') return

  // Ignora requisições ao Supabase (sempre precisam de rede)
  if (event.request.url.includes('supabase.co')) return

  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        // Se a resposta for válida, salva no cache e retorna
        if (resposta && resposta.status === 200) {
          const respostaClone = resposta.clone()
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, respostaClone)
          })
        }
        return resposta
      })
      .catch(() => {
        // Sem rede — tenta o cache
        return caches.match(event.request).then((respostaCache) => {
          if (respostaCache) return respostaCache
          // Se nem no cache tiver, retorna a página inicial offline
          return caches.match('/')
        })
      })
  )
})

// ----------------------------------------------------------------
// PUSH — notificações push (para quando implementar no backend)
// ----------------------------------------------------------------
self.addEventListener('push', (event) => {
  const dados = event.data?.json() ?? {}
  const titulo = dados.titulo || 'Prestador'
  const opcoes = {
    body: dados.mensagem || 'Você tem uma nova mensagem.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: { url: dados.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(titulo, opcoes))
})

// ----------------------------------------------------------------
// NOTIFICATION CLICK — abre o app na url correta ao clicar
// ----------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
