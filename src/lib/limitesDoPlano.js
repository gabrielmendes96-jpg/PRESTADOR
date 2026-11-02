// O que cada plano de prestador permite — o mesmo que a página de Planos promete.
// Plano sem pagamento ativo vale como Básico.
const LIMITES = {
  basico: { fotos: 10, categorias: 5 },
  profissional: { fotos: Infinity, categorias: Infinity },
  premium: { fotos: Infinity, categorias: Infinity },
}

export function planoEfetivo(planoId, planoStatus) {
  return planoId && planoId !== 'basico' && planoStatus === 'ativo' ? planoId : 'basico'
}

export function limitesDoPlano(planoId, planoStatus) {
  return LIMITES[planoEfetivo(planoId, planoStatus)] || LIMITES.basico
}

export const nomeDoPlano = (planoId) => ({ basico: 'Básico', profissional: 'Profissional', premium: 'Premium' }[planoId] || 'Básico')
