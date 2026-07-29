// Regra pura de seleção para a ferramenta de comparação — extraída do
// ComparacaoContext para poder ser testada sem precisar montar um componente React.
export function toggleSelecionado(lista, id, max) {
  if (lista.includes(id)) return lista.filter(item => item !== id)
  if (lista.length >= max) return lista
  return [...lista, id]
}
