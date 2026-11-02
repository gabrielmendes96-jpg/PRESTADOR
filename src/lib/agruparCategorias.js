// Organiza a lista de categorias por tópico (grupo) para os menus de escolha, em vez de uma fila única de ~250 itens.
// Uma categoria pode estar em mais de um tópico: aparece só no primeiro, para não repetir a opção.
// O que não está em nenhum tópico vai para "Outras".
export function agruparPorTopico(categorias, topicos) {
  const porId = new Map(categorias.map(c => [c.id, c]))
  const usadas = new Set()
  const grupos = []

  for (const t of topicos) {
    const itens = (t.categorias || [])
      .filter(id => porId.has(id) && !usadas.has(id))
      .map(id => { usadas.add(id); return porId.get(id) })
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    if (itens.length) grupos.push({ id: t.id, nome: t.nome, categorias: itens })
  }

  const sobras = categorias.filter(c => !usadas.has(c.id)).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  if (sobras.length) grupos.push({ id: '_outras', nome: 'Outras', categorias: sobras })
  return grupos
}
