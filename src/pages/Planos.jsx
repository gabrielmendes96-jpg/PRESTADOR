import { useNavigate } from 'react-router-dom'
import { usePlanos } from '../lib/hooks'

export default function Planos() {
  const { planos, loading } = usePlanos()
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: '#1F2D24' }}>Planos para profissionais</h1>
        <p style={{ color: '#7C9485' }}>Apareça para milhares de clientes em todo o Brasil</p>
      </div>

      {loading ? (
        <p className="text-center text-sm mb-8" style={{ color: '#C9BFA8' }}>Carregando planos...</p>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {planos.map(p => (
          <div
            key={p.id}
            className="rounded-2xl p-6" style={p.destaque ? { border: '2px solid #1FA855' } : { border: '0.5px solid #EDE3CE' }}
          >
            {p.destaque && (
              <div className="text-center mb-3">
                <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#E3F6E9', color: '#0F6E3D' }}>
                  Mais popular
                </span>
              </div>
            )}
            <p className="text-base font-semibold mb-1" style={{ color: '#1F2D24' }}>{p.nome}</p>
            <p className="text-xs mb-3" style={{ color: '#C9BFA8' }}>{p.descricao}</p>
            <div className="mb-4">
              <span className="text-3xl font-semibold" style={{ color: '#1F2D24' }}>R${p.preco}</span>
              <span className="text-sm" style={{ color: '#C9BFA8' }}>/mês</span>
            </div>
            <hr className="mb-4" style={{ border: 0, borderTop: '0.5px solid #EDE3CE' }} />
            <ul className="space-y-2 mb-5">
              {p.recursos.map(r => (
                <li key={r} className="flex items-start gap-2 text-sm" style={{ color: '#5F6F65' }}>
                  <span className="mt-0.5" style={{ color: '#1FA855' }}>✓</span>
                  {r}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 text-sm font-medium rounded-xl transition-opacity hover:opacity-90"
            onClick={() => navigate(`/pagamento?tipo=mensalidade&item=${p.id}`)}
            style={p.destaque ? { background: '#1FA855', color: '#fff' } : { border: '0.5px solid #EDE3CE', color: '#1F2D24', background: '#fff' }}>
              Assinar plano {p.nome}
            </button>
          </div>
        ))}
      </div>
      )}

      <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: '#FAF6EE' }}>
        <i className="ti ti-shield-check" style={{ fontSize: '28px', color: '#1FA855' }} aria-hidden="true"></i>
        <div>
          <p className="font-medium" style={{ color: '#1F2D24' }}>Garantia de 30 dias</p>
          <p className="text-sm" style={{ color: '#7C9485' }}>Cancele quando quiser, sem multa. Aceitamos Pix, boleto e cartão de crédito.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        {[
          { num: '12.000+', txt: 'Profissionais cadastrados' },
          { num: '85.000+', txt: 'Clientes ativos' },
          { num: '4.8★', txt: 'Avaliação média na plataforma' },
        ].map(s => (
          <div key={s.txt} className="bg-white rounded-xl p-4" style={{ border: '0.5px solid #EDE3CE' }}>
            <p className="text-xl font-semibold" style={{ color: '#1F2D24' }}>{s.num}</p>
            <p className="text-xs mt-1" style={{ color: '#C9BFA8' }}>{s.txt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
