import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Building2, PartyPopper, Factory, Map, MapPin, Clock, Calendar, Check, HandMetal, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors } from '../lib/design'
import Card from '../components/ui/Card'
import Chip from '../components/ui/Chip'
import Button from '../components/ui/Button'

const tipoConfig = {
  condominio: { icon: Building2, label: 'Condomínio', cor: '#16A34A', bg: '#DCFCE7' },
  evento: { icon: PartyPopper, label: 'Evento', cor: '#92610A', bg: '#FEF3C7' },
  obra_comercial: { icon: Factory, label: 'Obra Comercial', cor: '#B91C1C', bg: '#FEF2F2' },
  loteamento: { icon: Map, label: 'Loteamento', cor: '#2563EB', bg: '#EFF6FF' },
}

export default function ZonasQuentes() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [zonas, setZonas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [showSugerir, setShowSugerir] = useState(false)
  const [interesses, setInteresses] = useState({})
  const [meuPrestador, setMeuPrestador] = useState(null)
  const [form, setForm] = useState({
    nome: '', descricao: '', tipo: 'condominio',
    cidade: '', estado: '', endereco: '',
    data_inicio: '', data_fim: '',
    categorias_demanda: [],
  })
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const categorias = ['eletricista','pedreiro','pintor','encanador','marceneiro','serralheiro','vidraceiro','jardineiro','mecanico','diarista']

  useEffect(() => {
    carregarZonas()
    if (usuario) buscarPrestador()
  }, [filtroTipo, usuario])

  const carregarZonas = async () => {
    setCarregando(true)
    let query = supabase
      .from('zonas_quentes')
      .select('*')
      .eq('status', 'ativo')
      .order('criado_em', { ascending: false })

    if (filtroTipo) query = query.eq('tipo', filtroTipo)

    const { data } = await query
    setZonas(data || [])
    setCarregando(false)

    if (data && usuario) {
      const { data: ints } = await supabase
        .from('zona_interesses')
        .select('zona_id')
        .eq('prestador_id', meuPrestador?.id)

      const map = {}
      ;(ints || []).forEach(i => { map[i.zona_id] = true })
      setInteresses(map)
    }
  }

  const buscarPrestador = async () => {
    const { data } = await supabase
      .from('prestadores')
      .select('id')
      .eq('user_id', usuario.id)
      .single()
    setMeuPrestador(data || null)
  }

  const toggleInteresse = async (zonaId) => {
    if (!usuario) { navigate('/login'); return }
    if (!meuPrestador) return

    if (interesses[zonaId]) {
      await supabase.from('zona_interesses').delete()
        .eq('zona_id', zonaId).eq('prestador_id', meuPrestador.id)
      setInteresses({ ...interesses, [zonaId]: false })
    } else {
      await supabase.from('zona_interesses').insert({
        zona_id: zonaId, prestador_id: meuPrestador.id
      })
      setInteresses({ ...interesses, [zonaId]: true })
    }
  }

  const toggleCategoria = (cat) => {
    const cats = form.categorias_demanda.includes(cat)
      ? form.categorias_demanda.filter(c => c !== cat)
      : [...form.categorias_demanda, cat]
    setForm({ ...form, categorias_demanda: cats })
  }

  const sugerirZona = async (e) => {
    e.preventDefault()
    if (!usuario) { navigate('/login'); return }
    setEnviando(true)

    await supabase.from('zonas_quentes').insert({
      ...form,
      sugerido_por: usuario.id,
      status: 'pendente',
      raio_km: 10,
    })

    setEnviando(false)
    setSucesso(true)
    setShowSugerir(false)
    setTimeout(() => setSucesso(false), 4000)
  }

  const diasRestantes = (dataFim) => {
    if (!dataFim) return null
    const diff = new Date(dataFim) - new Date()
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (dias < 0) return 'Encerrado'
    if (dias === 0) return 'Último dia!'
    if (dias <= 7) return `${dias} dia${dias !== 1 ? 's' : ''} restante${dias !== 1 ? 's' : ''}`
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, color: colors.text }}>
            <Flame size={19} color="#D97706" /> Zonas Quentes
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>Áreas com alta demanda de serviços</p>
        </div>
        {usuario && (
          <button onClick={() => setShowSugerir(!showSugerir)}
            className="px-4 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
            style={{ background: '#16A34A' }}>
            + Sugerir zona
          </button>
        )}
      </div>

      {sucesso && (
        <div className="mb-4 p-4 rounded-xl text-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#DCFCE7' }}>
          <Check size={16} strokeWidth={3} color="#14853D" />
          <p className="text-sm font-medium" style={{ color: '#14853D', margin: 0 }}>
            Sugestão enviada! Nossa equipe vai analisar e publicar em breve.
          </p>
        </div>
      )}

      {/* Formulário sugerir zona */}
      {showSugerir && (
        <div className="bg-white rounded-2xl p-5 mb-5" style={{ border: '2px solid #16A34A' }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: '#1F2937' }}>Sugerir nova zona quente</h2>
          <form onSubmit={sugerirZona} className="space-y-3">
            <div>
              <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Nome da zona *</label>
              <input type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                placeholder="Ex: Condomínio Primavera — 180 unidades"
                required className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Tipo *</label>
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none">
                <option value="condominio">Condomínio</option>
                <option value="evento">Evento</option>
                <option value="obra_comercial">Obra Comercial</option>
                <option value="loteamento">Loteamento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Descrição</label>
              <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})}
                placeholder="Descreva a oportunidade de serviço..."
                rows={2} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Cidade *</label>
                <input type="text" value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})}
                  placeholder="Sua cidade" required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
              </div>
              <div className="w-20">
                <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Estado</label>
                <input type="text" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}
                  placeholder="SP" maxLength={2}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Endereço / Referência</label>
              <input type="text" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})}
                placeholder="Ex: Rua das Flores, próximo ao mercado..."
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Início</label>
                <input type="date" value={form.data_inicio} onChange={e => setForm({...form, data_inicio: e.target.value})}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1" style={{ color: '#6B7280' }}>Previsão de fim</label>
                <input type="date" value={form.data_fim} onChange={e => setForm({...form, data_fim: e.target.value})}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: '#6B7280' }}>Categorias com mais demanda</label>
              <div className="flex flex-wrap gap-2">
                {categorias.map(cat => (
                  <button key={cat} type="button" onClick={() => toggleCategoria(cat)}
                    className="text-xs px-3 py-1.5 rounded-full capitalize transition-colors"
                    style={form.categorias_demanda.includes(cat)
                      ? { background: '#16A34A', color: '#fff' }
                      : { background: '#F3F6F2', color: '#6B7280', border: '0.5px solid #E4E7E4' }
                    }>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowSugerir(false)}
                className="flex-1 py-2.5 text-sm rounded-xl"
                style={{ border: '0.5px solid #E4E7E4', color: '#6B7280' }}>
                Cancelar
              </button>
              <button type="submit" disabled={enviando || !form.nome || !form.cidade}
                className="flex-1 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
                style={{ background: '#16A34A' }}>
                {enviando ? 'Enviando...' : 'Enviar sugestão'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <Chip active={filtroTipo === ''} onClick={() => setFiltroTipo('')}>Todas</Chip>
        {Object.entries(tipoConfig).map(([id, v]) => (
          <Chip key={id} active={filtroTipo === id} onClick={() => setFiltroTipo(id)} icon={<v.icon size={13} />}>
            {v.label}
          </Chip>
        ))}
      </div>

      {/* Lista de zonas */}
      {carregando ? (
        <p className="text-center py-12 text-sm" style={{ color: '#9CA3AF' }}>Carregando zonas...</p>
      ) : zonas.length === 0 ? (
        <Card padding={48} style={{ textAlign: 'center' }}>
          <Flame size={44} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
          <p className="text-sm font-medium" style={{ color: '#1F2937' }}>Nenhuma zona quente ativa</p>
          <p className="text-xs mt-1 mb-4" style={{ color: '#6B7280' }}>Seja o primeiro a sugerir uma oportunidade!</p>
          {usuario && (
            <button onClick={() => setShowSugerir(true)}
              className="px-5 py-2.5 text-white text-sm font-medium rounded-xl hover:opacity-90"
              style={{ background: '#16A34A' }}>
              + Sugerir zona
            </button>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {zonas.map(z => {
            const conf = tipoConfig[z.tipo] || tipoConfig.condominio
            const dias = diasRestantes(z.data_fim)
            const temInteresse = interesses[z.id]

            return (
              <div key={z.id} className="bg-white rounded-2xl p-5" style={{ border: '0.5px solid #E4E7E4' }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: conf.bg }}>
                    <conf.icon size={22} color={conf.cor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-semibold" style={{ color: '#1F2937' }}>{z.nome}</h2>
                      {dias && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, padding: '2px 8px', borderRadius: 999, flexShrink: 0, background: '#FEF3C7', color: '#92610A' }}>
                          <Clock size={11} /> {dias}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: conf.bg, color: conf.cor }}>
                        {conf.label}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}>
                        <MapPin size={12} />
                        {z.cidade}, {z.estado}
                      </span>
                    </div>
                  </div>
                </div>

                {z.descricao && (
                  <p className="text-sm mb-3" style={{ color: '#6B7280' }}>{z.descricao}</p>
                )}

                {z.endereco && (
                  <p className="text-xs mb-3 flex items-center gap-1" style={{ color: '#6B7280' }}>
                    <Map size={12} />
                    {z.endereco}
                  </p>
                )}

                {z.categorias_demanda && z.categorias_demanda.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {z.categorias_demanda.filter(Boolean).map(cat => (
                      <span key={cat} className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background: '#DCFCE7', color: '#14853D' }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {z.data_inicio && z.data_fim && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, marginBottom: 16, color: '#9CA3AF' }}>
                    <Calendar size={12} /> {new Date(z.data_inicio).toLocaleDateString('pt-BR')} até {new Date(z.data_fim).toLocaleDateString('pt-BR')}
                  </p>
                )}

                {meuPrestador && (
                  <Button
                    fullWidth
                    variant={temInteresse ? 'outline' : 'primary'}
                    icon={temInteresse ? <Check size={15} strokeWidth={3} /> : <HandMetal size={15} />}
                    onClick={() => toggleInteresse(z.id)}
                  >
                    {temInteresse ? 'Tenho interesse (cancelar)' : 'Tenho interesse nesta zona'}
                  </Button>
                )}

                {!usuario && (
                  <Button fullWidth onClick={() => navigate('/login')}>
                    Entrar para demonstrar interesse
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
