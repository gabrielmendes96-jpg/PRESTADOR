import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCategorias } from '../lib/hooks'
import { colors } from '../lib/design'

const NOME_MIN = 3
const NOME_MAX = 80

// Admin: gerencia o catálogo de serviços por categoria (adicionar, renomear, ocultar, excluir).
// Ocultar tira o serviço das listas, dos perfis e da busca, mas guarda a marcação dos prestadores
// (volta ao mostrar de novo); excluir remove de vez, inclusive a marcação.
export default function AdminCatalogo() {
  const { categorias } = useCategorias()
  const [categoriaId, setCategoriaId] = useState('')
  const [servicos, setServicos] = useState([])
  const [usos, setUsos] = useState({})
  const [carregando, setCarregando] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [nomeEditado, setNomeEditado] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!categoriaId) { setServicos([]); return }
    let cancelado = false
    setCarregando(true)
    setErro('')
    ;(async () => {
      const { data, error } = await supabase
        .from('servicos_catalogo').select('id, nome, ativo').eq('categoria_id', categoriaId).order('nome', { ascending: true })
      if (cancelado) return
      if (error) { setErro('Não foi possível carregar os serviços.'); setCarregando(false); return }
      const lista = data || []
      setServicos(lista)
      if (lista.length) {
        const { data: marcados } = await supabase.from('prestador_servicos').select('servico_id').in('servico_id', lista.map(s => s.id))
        if (cancelado) return
        const contagem = {}
        ;(marcados || []).forEach(m => { contagem[m.servico_id] = (contagem[m.servico_id] || 0) + 1 })
        setUsos(contagem)
      } else {
        setUsos({})
      }
      setCarregando(false)
    })()
    return () => { cancelado = true }
  }, [categoriaId])

  const validar = (nome, ignorarId) => {
    const limpo = nome.trim()
    if (limpo.length < NOME_MIN || limpo.length > NOME_MAX) return `O nome precisa ter entre ${NOME_MIN} e ${NOME_MAX} caracteres.`
    if (servicos.some(s => s.id !== ignorarId && s.nome.toLowerCase() === limpo.toLowerCase())) return 'Esse serviço já existe nesta categoria.'
    return ''
  }

  const adicionar = async (e) => {
    e.preventDefault()
    const problema = validar(novoNome)
    if (problema) { setErro(problema); return }
    const { data, error } = await supabase
      .from('servicos_catalogo').insert({ categoria_id: categoriaId, nome: novoNome.trim() }).select('id, nome, ativo').single()
    if (error) { setErro('Não foi possível adicionar o serviço.'); return }
    setServicos(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')))
    setNovoNome('')
    setErro('')
  }

  const salvarNome = async (servico) => {
    const problema = validar(nomeEditado, servico.id)
    if (problema) { setErro(problema); return }
    const { error } = await supabase.from('servicos_catalogo').update({ nome: nomeEditado.trim() }).eq('id', servico.id)
    if (error) { setErro('Não foi possível renomear.'); return }
    setServicos(prev => prev.map(s => s.id === servico.id ? { ...s, nome: nomeEditado.trim() } : s).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')))
    setEditandoId(null)
    setErro('')
  }

  const alternarAtivo = async (servico) => {
    const { error } = await supabase.from('servicos_catalogo').update({ ativo: !servico.ativo }).eq('id', servico.id)
    if (error) { setErro('Não foi possível alterar a visibilidade.'); return }
    setServicos(prev => prev.map(s => s.id === servico.id ? { ...s, ativo: !s.ativo } : s))
  }

  const excluir = async (servico) => {
    const emUso = usos[servico.id] || 0
    const aviso = emUso > 0
      ? `"${servico.nome}" está marcado por ${emUso} prestador(es). Excluir remove das listas deles. Excluir mesmo assim? (Para só esconder, use o olho.)`
      : `Excluir "${servico.nome}"?`
    if (!window.confirm(aviso)) return
    const { error } = await supabase.from('servicos_catalogo').delete().eq('id', servico.id)
    if (error) { setErro('Não foi possível excluir.'); return }
    setServicos(prev => prev.filter(s => s.id !== servico.id))
  }

  const botao = { background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', color: colors.textSub }

  return (
    <div>
      <select
        value={categoriaId}
        onChange={e => { setCategoriaId(e.target.value); setEditandoId(null); setNovoNome('') }}
        aria-label="Categoria"
        className="w-full p-3 text-sm rounded-xl mb-4 bg-white"
        style={{ border: '1px solid #E4E7E4' }}
      >
        <option value="">Escolha uma categoria para gerenciar os serviços…</option>
        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.id})</option>)}
      </select>

      {erro && <p className="text-sm mb-3" style={{ color: '#B91C1C' }} role="alert">{erro}</p>}

      {categoriaId && (
        <div className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #E4E7E4' }}>
          <form onSubmit={adicionar} className="flex gap-2 mb-4">
            <input
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              maxLength={NOME_MAX}
              placeholder="Novo serviço (ex: Troca de chuveiro elétrico)"
              aria-label="Nome do novo serviço"
              className="flex-1 p-3 text-sm rounded-xl"
              style={{ border: '1px solid #E4E7E4' }}
            />
            <button type="submit" disabled={novoNome.trim().length < NOME_MIN}
              className="px-4 text-white text-sm font-medium rounded-xl disabled:opacity-50"
              style={{ background: '#16A34A', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} /> Adicionar
            </button>
          </form>

          <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
            {carregando ? 'Carregando…' : `${servicos.length} serviço(s) · ${servicos.filter(s => s.ativo).length} visível(is)`}
          </p>
          <p className="text-xs mb-3" style={{ color: '#6B7280' }}>
            Ocultar tira o serviço das listas, dos perfis e da busca, mas guarda a marcação dos prestadores (volta ao mostrar de novo). Excluir apaga de vez.
          </p>

          <ul className="flex flex-col" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {servicos.map(s => (
              <li key={s.id} className="flex items-center gap-2 py-2" style={{ borderTop: '0.5px solid #EEF0EE', opacity: s.ativo ? 1 : 0.55 }}>
                {editandoId === s.id ? (
                  <>
                    <input
                      autoFocus
                      value={nomeEditado}
                      maxLength={NOME_MAX}
                      onChange={e => setNomeEditado(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') salvarNome(s); if (e.key === 'Escape') setEditandoId(null) }}
                      aria-label="Novo nome do serviço"
                      className="flex-1 p-2 text-sm rounded-lg"
                      style={{ border: '1px solid #E4E7E4' }}
                    />
                    <button type="button" onClick={() => salvarNome(s)} aria-label="Salvar nome" style={{ ...botao, color: colors.primary }}><Check size={16} /></button>
                    <button type="button" onClick={() => setEditandoId(null)} aria-label="Cancelar" style={botao}><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm" style={{ color: '#1F2937' }}>
                      {s.nome}
                      {!s.ativo && <span className="text-xs ml-2" style={{ color: '#6B7280' }}>(oculto)</span>}
                    </span>
                    {usos[s.id] > 0 && <span className="text-xs" style={{ color: '#6B7280' }}>{usos[s.id]} prestador(es)</span>}
                    <button type="button" onClick={() => { setEditandoId(s.id); setNomeEditado(s.nome); setErro('') }} aria-label={'Renomear ' + s.nome} style={botao}><Pencil size={15} /></button>
                    <button type="button" onClick={() => alternarAtivo(s)} aria-label={(s.ativo ? 'Ocultar ' : 'Mostrar ') + s.nome} style={botao}>
                      {s.ativo ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button type="button" onClick={() => excluir(s)} aria-label={'Excluir ' + s.nome} style={{ ...botao, color: '#B91C1C' }}><Trash2 size={15} /></button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
