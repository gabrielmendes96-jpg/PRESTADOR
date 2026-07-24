// api/geocodificar.js
// Converte cidade/estado em coordenadas usando Nominatim (gratuito)
// Roda via cron ou chamada manual do admin

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    // Buscar prestadores sem geocodificação
    const { data: prestadores } = await supabase
      .from('prestadores')
      .select('id, cidade, estado')
      .eq('geocodificado', false)
      .not('cidade', 'is', null)
      .limit(50)

    if (!prestadores?.length) {
      return res.status(200).json({ ok: true, mensagem: 'Nenhum prestador para geocodificar' })
    }

    let sucesso = 0
    let falha = 0

    for (const p of prestadores) {
      try {
        const query = `${p.cidade}, ${p.estado}, Brasil`
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`

        const resp = await fetch(url, {
          headers: { 'User-Agent': 'PrestadorApp/1.0 contato@prestador.app' }
        })
        const data = await resp.json()

        if (data?.[0]) {
          await supabase.from('prestadores').update({
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
            geocodificado: true,
          }).eq('id', p.id)
          sucesso++
        } else {
          await supabase.from('prestadores').update({ geocodificado: true }).eq('id', p.id)
          falha++
        }

        // Respeitar rate limit do Nominatim (1 req/segundo)
        await new Promise(r => setTimeout(r, 1100))
      } catch {
        falha++
      }
    }

    return res.status(200).json({ ok: true, sucesso, falha, total: prestadores.length })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
