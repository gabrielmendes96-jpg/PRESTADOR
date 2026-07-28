// Utilitário de GPS e cálculo de distância

// Pegar localização do usuário
export function pegarLocalizacao() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GPS não disponível'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { timeout: 10000, maximumAge: 300000 }
    )
  })
}

// Fórmula de Haversine — distância entre dois pontos em km
export function calcularDistancia(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c * 10) / 10
}

// Formatar distância para exibição
export function formatarDistancia(km) {
  if (km === null || km === undefined) return null
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km} km`
}

// Salvar localização no localStorage
export function salvarLocalizacao(lat, lng) {
  localStorage.setItem('user_lat', lat)
  localStorage.setItem('user_lng', lng)
  localStorage.setItem('user_loc_time', Date.now())
}

// Recuperar localização salva (válida por 5 minutos)
export function recuperarLocalizacao() {
  const lat = localStorage.getItem('user_lat')
  const lng = localStorage.getItem('user_lng')
  const time = localStorage.getItem('user_loc_time')
  if (!lat || !lng || !time) return null
  if (Date.now() - parseInt(time) > 5 * 60 * 1000) return null
  return { lat: parseFloat(lat), lng: parseFloat(lng) }
}
