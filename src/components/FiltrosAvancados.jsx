import { useState } from 'react'

export default function FiltrosAvancados({ onAplicar, onFechar }) {
  const [filtros, setFiltros] = useState({
    notaMinima: 0,
    distanciaMax: 50,
    plano: '',
    disponivel: false,
    temFoto: false,
  })

  const aplicar = () => {
    onAplicar(filtros)
    onFechar()
  }

  const limpar = () => {
    const limpo = { notaMinima: 0, distanciaMax: 50, plano: '', disponivel: false, temFoto: false }
    setFiltros(limpo)
    onAplicar(limpo)
    onFechar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={e => e.target === e.currentTarget && onFechar()}>
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6"
        style={{ border: '0.5px solid #DDE3DD' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: '#1F2D24' }}>Filtros</h2>
          <button onClick={onFechar} style={{ color: '#7C9485' }}>
            <i className="ti ti-x" style={{ fontSize: 20 }} aria-hidden="true"></i>
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm" style={{ color: '#5F6F65' }}>Nota mínima</label>
              <span className="text-sm font-medium" style={{ color: '#1FA855' }}>
                {filtros.notaMinima === 0 ? 'Qualquer' : `${filtros.notaMinima}+ ⭐`}
              </span>
            </div>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5, 5].map(n => (
                <button key={n} onClick={() => setFiltros({ ...filtros, notaMinima: n })}
                  className="flex-1 py-2 text-xs font-medium rounded-lg transition-colors"
                  style={filtros.notaMinima === n
                    ? { background: '#1FA855', color: '#fff' }
                    : { background: '#F0F2F0', color: '#7C9485' }}>
                  {n === 0 ? 'Todos' : `${n}+`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm" style={{ color: '#5F6F65' }}>Distância máxima</label>
              <span className="text-sm font-medium" style={{ color: '#1FA855' }}>{filtros.distanciaMax} km</span>
            </div>
            <input type="range" min="5" max="100" step="5" value={filtros.distanciaMax}
              onChange={e => setFiltros({ ...filtros, distanciaMax: parseInt(e.target.value) })}
              className="w-full" style={{ accentColor: '#1FA855' }} />
            <div className="flex justify-between text-xs mt-1" style={{ color: '#C9BFA8' }}>
              <span>5 km</span><span>50 km</span><span>100 km</span>
            </div>
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: '#5F6F65' }}>Plano do prestador</label>
            <div className="flex gap-2">
              {[
                { val: '', label: 'Todos' },
                { val: 'basico', label: 'Básico' },
                { val: 'profissional', label: 'Profissional' },
                { val: 'premium', label: 'Premium ⭐' },
              ].map(p => (
                <button key={p.val} onClick={() => setFiltros({ ...filtros, plano: p.val })}
                  className="flex-1 py-2 text-xs font-medium rounded-lg transition-colors"
                  style={filtros.plano === p.val
                    ? { background: '#1FA855', color: '#fff' }
                    : { background: '#F0F2F0', color: '#7C9485' }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <label className="flex items-center gap-2 flex-1 p-3 rounded-xl cursor-pointer"
              style={{ border: `1px solid ${filtros.disponivel ? '#1FA855' : '#DDE3DD'}`, background: filtros.disponivel ? '#F0FAF4' : '#fff' }}>
              <input type="checkbox" checked={filtros.disponivel} onChange={e => setFiltros({ ...filtros, disponivel: e.target.checked })}
                style={{ accentColor: '#1FA855' }} />
              <span className="text-sm" style={{ color: '#1F2D24' }}>Disponível agora</span>
            </label>
            <label className="flex items-center gap-2 flex-1 p-3 rounded-xl cursor-pointer"
              style={{ border: `1px solid ${filtros.temFoto ? '#1FA855' : '#DDE3DD'}`, background: filtros.temFoto ? '#F0FAF4' : '#fff' }}>
              <input type="checkbox" checked={filtros.temFoto} onChange={e => setFiltros({ ...filtros, temFoto: e.target.checked })}
                style={{ accentColor: '#1FA855' }} />
              <span className="text-sm" style={{ color: '#1F2D24' }}>Com foto</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={limpar} className="flex-1 py-3 text-sm font-medium rounded-xl"
            style={{ border: '0.5px solid #DDE3DD', color: '#7C9485' }}>
            Limpar filtros
          </button>
          <button onClick={aplicar} className="flex-1 py-3 text-sm font-medium text-white rounded-xl"
            style={{ background: '#1FA855' }}>
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  )
}
