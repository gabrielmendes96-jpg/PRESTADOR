import { useTopicos } from '../lib/hooks'
import { agruparPorTopico } from '../lib/agruparCategorias'

// <option>s de categoria agrupados por tema, para usar dentro de um <select>.
export default function OpcoesDeCategoria({ categorias, rotulo = (c) => c.nome }) {
  const { topicos } = useTopicos()
  if (!topicos.length) return categorias.map(c => <option key={c.id} value={c.id}>{rotulo(c)}</option>)
  return agruparPorTopico(categorias, topicos).map(g => (
    <optgroup key={g.id} label={g.nome}>
      {g.categorias.map(c => <option key={c.id} value={c.id}>{rotulo(c)}</option>)}
    </optgroup>
  ))
}
