// Mesmo tratamento que o banco aplica nas colunas *_busca (função public.sem_acento): sem acento e minúsculo.
// O termo digitado passa por aqui antes de ser comparado ("Mecânico", "mecanico" e "MECÂNICO" viram "mecanico").
export function semAcento(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
