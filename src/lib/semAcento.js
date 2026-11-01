// Mesmo tratamento que o banco aplica nas colunas *_busca (função public.sem_acento): sem acento e minúsculo.
// O termo digitado passa por aqui antes de ser comparado ("Mecânico", "mecanico" e "MECÂNICO" viram "mecanico").
export function semAcento(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

// Compara tratando hífen como espaço ("faz tudo" casa com "Faz-tudo").
const paraComparar = (texto) => semAcento(texto).replace(/-/g, ' ').replace(/\s+/g, ' ').trim()

// Filtra opções de um seletor pesquisável pelo rótulo E por um texto extra opcional (`busca`: termos alternativos).
export function filtrarOpcoes(opcoes, digitado) {
  const alvo = paraComparar(digitado)
  if (!alvo) return opcoes
  return opcoes.filter(o => paraComparar(`${o.label} ${o.busca || ''}`).includes(alvo))
}
