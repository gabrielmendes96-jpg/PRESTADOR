import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

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
    await supabase.from('prestadores').update({
      dias_disponiveis: diasDisponiveis,
      horarios_disponiveis: horariosDisponiveis,
      disponivel: Object.values(diasDisponiveis).some(v => v),
    }).eq('id', prestador.id)
    setSalvando(false)
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
      <h1 className="text-xl font-semibold mb-1" style={{ color: '#1F2D24' }}>📅 Calendário de Disponibilidade</h1>
      <p className="text-sm mb-5" style={{ color: '#7C9485' }}>Marque os dias que você está disponível para atender</p>

      {salvo && (
        <div className="mb-4 p-3 rounded-xl text-center" style={{ background: '#E3F6E9' }}>
          <p className="text-sm font-medium" style={{ color: '#0F6E3D' }}>✓ Disponibilidade salva!</p>
        </div>
      )}

      {/* Horários */}
      <div className="bg-white rounded-2xl p-5 mb-4" style={{ border: '0.5px solid #DDE3DD' }}>
        <p className="text-sm font-medium mb-3" style={{ color: '#1F2D24' }}>⏰ Horário de atendimento</p>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color: '#7C9485' }}>Das</label>
            <input type="time" value={horariosDisponiveis.inicio}
              onChange={e => setHorariosDisponiveis({ ...horariosDisponiveis, inicio: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none"
              style={{ borderColor: '#DDE3DD' }} />
          </div>
          <span className="text-sm mt-4" style={{ color: '#7C9485' }}>até</span>
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color: '#7C9485' }}>Às</label>
            <input type="time" value={horariosDisponiveis.fim}
              onChange={e => setHorariosDisponiveis({ ...horariosDisponiveis, fim: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none"
              style={{ borderColor: '#DDE3DD' }} />
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white rounded-2xl p-5 mb-4" style={{ border: '0.5px solid #DDE3DD' }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70"
            style={{ border: '0.5px solid #DDE3DD' }}>
            <i className="ti ti-chevron-left" style={{ fontSize: 16 }} aria-hidden="true"></i>
          </button>
          <p className="text-sm font-medium" style={{ color: '#1F2D24' }}>
            {meses[mes]} {ano}
          </p>
          <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70"
            style={{ border: '0.5px solid #DDE3DD' }}>
            <i className="ti ti-chevron-right" style={{ fontSize: 16 }} aria-hidden="true"></i>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dias.map(d => (
            <div key={d} className="text-center text-xs font-medium py-1" style={{ color: '#7C9485' }}>{d}</div>
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
                  ? { background: '#1FA855', color: '#fff' }
                  : passado
                  ? { background: '#F5F5F5', color: '#C9BFA8', cursor: 'not-allowed' }
                  : { background: '#F8F9F8', color: '#1F2D24', border: '0.5px solid #DDE3DD' }
                }>
                {dia}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: '0.5px solid #DDE3DD' }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: '#1FA855' }}></div>
            <span className="text-xs" style={{ color: '#7C9485' }}>Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: '#F5F5F5', border: '0.5px solid #DDE3DD' }}></div>
            <span className="text-xs" style={{ color: '#7C9485' }}>Indisponível</span>
          </div>
        </div>
      </div>

      <button onClick={salvar} disabled={salvando}
        className="w-full py-3 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60"
        style={{ background: '#1FA855' }}>
        {salvando ? 'Salvando...' : '💾 Salvar disponibilidade'}
      </button>
    </div>
  )
}
