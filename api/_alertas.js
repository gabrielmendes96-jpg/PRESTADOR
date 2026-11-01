// Registra um alerta do sistema (aba "Alertas" do painel admin e resumo diário). Nunca derruba quem chamou:
// se o registro falhar, só vai para o log. Arquivo com "_" não conta como função serverless (limite de 12 da Vercel).
export async function registrarAlerta(supabase, tipo, mensagem, detalhe = null) {
  try {
    const { error } = await supabase.from('alertas_sistema').insert({
      tipo: String(tipo).slice(0, 40),
      mensagem: String(mensagem).slice(0, 480),
      detalhe: detalhe ? String(detalhe).slice(0, 1400) : null,
    })
    if (error) console.error('Não foi possível registrar o alerta:', error.message)
  } catch (e) {
    console.error('Não foi possível registrar o alerta:', e)
  }
}
