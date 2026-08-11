import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, ChevronLeft, ChevronRight, Save, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { colors } from '../lib/design'
import Button from '../components/ui/Button'

const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Disponibilidade() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [prestador, setPrestador] = useState(null)
  const [diasDisponiveis, setDiasDisponiveis] = useState({})
  const [horariosDisponiveis, setHorariosDisponiveis] = useState({ inicio: '08:00', fim: '18:00' })
  const [mesAtual, setMesAtual] = useState(new Date())
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    if (!usuario) { navigate('/login'); return }
    carregarDados()
  }, [usuario])

  const carregarDados = async () => {
    const { data: p } = await supabase.from('prestadores').select('*').eq('user_id', usuario.id).single()
    if (p) {
      setPrestador(p)
      setDiasDisponiveis(p.dias_disponiveis || {})
      setHorariosDisponiveis(p.horarios_disponiveis || { inicio: '08:00', fim: '18:00' })
    }
  }

  const toggleDia = (dataStr) => {
    setDiasDisponiveis(prev => ({ ...prev, [dataStr]: !prev[dataStr] }))
  }

  const salvar = async () => {
    if (!prestador) return
    setSalvando(true)
    setErro(false)
    const { error } = await supabase.from('prestadores').update({
      dias_disponiveis: diasDisponiveis,
      horarios_disponiveis: horariosDisponiveis,
      disponivel: Object.values(diasDisponiveis).some(v => v),
    }).eq('id', prestador.id)
    setSalvando(false)

    if (error) {
      setErro(true)
      setTimeout(() => setErro(false), 4000)
      return
    }

    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
  }

  const getDiasDoMes = () => {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const primeiroDia = new Date(ano, mes, 1).getDay()
    const totalDias = new Date(ano, mes + 1, 0).getDate()
    return { primeiroDia, totalDias, ano, mes }
  }

  const { primeiroDia, totalDias, ano, mes } = getDiasDoMes()
  const hoje = new Date()

  return (
    <div className="max-w-lg mx-auto">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
        <Calendar size={19} color={colors.primary} /> Calendário de Disponibilidade
      </h1>
      <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Marque os dias que você está disponível para atender</p>

      {salvo && (
        <div className="mb-4 p-3 rounded-xl text-center" style={{ background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <CheckCircle2 size={16} strokeWidth={2.5} color={colors.primaryHover} />
          <p className="text-sm font-medium" style={{ color: '#14853D', margin: 0 }}>Disponibilidade salva!</p>
        </div>
      )}

      {erro && (
        <div className="mb-4 p-3 rounded-xl text-center" style={{ background: '#FEF2F2' }}>
          <p className="text-sm font-medium" style={{ color: '#B91C1C', margin: 0 }}>Não foi possível salvar. Tente novamente.</p>
        </div>
      )}

      {/* Horários */}
      <div className="bg-white rounded-2xl p-5 mb-4" style={{ border: '0.5px solid #E4E7E4' }}>
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 12 }}>
          <Clock size={15} color={colors.primary} /> Horário de atendimento
        </p>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>Das</label>
            <input type="time" value={horariosDisponiveis.inicio}
              onChange={e => setHorariosDisponiveis({ ...horariosDisponiveis, inicio: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none"
              style={{ borderColor: '#E4E7E4' }} />
          </div>
          <span className="text-sm mt-4" style={{ color: '#6B7280' }}>até</span>
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>Às</label>
            <input type="time" value={horariosDisponiveis.fim}
              onChange={e => setHorariosDisponiveis({ ...horariosDisponiveis, fim: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none"
              style={{ borderColor: '#E4E7E4' }} />
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white rounded-2xl p-5 mb-4" style={{ border: '0.5px solid #E4E7E4' }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70"
            style={{ border: '0.5px solid #E4E7E4' }}>
            <ChevronLeft size={16} />
          </button>
          <p className="text-sm font-medium" style={{ color: '#1F2937' }}>
            {meses[mes]} {ano}
          </p>
          <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70"
            style={{ border: '0.5px solid #E4E7E4' }}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dias.map(d => (
            <div key={d} className="text-center text-xs font-medium py-1" style={{ color: '#6B7280' }}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: primeiroDia }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: totalDias }).map((_, i) => {
            const dia = i + 1
            const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
            const passado = new Date(ano, mes, dia) < new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
            const disponivel = diasDisponiveis[dataStr]

            return (
              <button key={dia} onClick={() => !passado && toggleDia(dataStr)} disabled={passado}
                className="aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-colors"
                style={disponivel
                  ? { background: '#16A34A', color: '#fff' }
                  : passado
                  ? { background: '#F3F6F2', color: '#9CA3AF', cursor: 'not-allowed' }
                  : { background: '#F3F6F2', color: '#1F2937', border: '0.5px solid #E4E7E4' }
                }>
                {dia}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: '0.5px solid #E4E7E4' }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: '#16A34A' }}></div>
            <span className="text-xs" style={{ color: '#6B7280' }}>Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: '#F3F6F2', border: '0.5px solid #E4E7E4' }}></div>
            <span className="text-xs" style={{ color: '#6B7280' }}>Indisponível</span>
          </div>
        </div>
      </div>

      <Button fullWidth icon={<Save size={16} />} disabled={salvando} onClick={salvar}>
        {salvando ? 'Salvando...' : 'Salvar disponibilidade'}
      </Button>
    </div>
  )
}
