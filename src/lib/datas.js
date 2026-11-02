// Rótulo do dia para separar mensagens: "Hoje", "Ontem" ou a data. Compara pelo dia do calendário local, não por 24 horas.
const inicioDoDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export function mesmoDia(a, b) {
  return inicioDoDia(new Date(a)).getTime() === inicioDoDia(new Date(b)).getTime()
}

export function rotuloDoDia(data, agora = new Date()) {
  const dia = inicioDoDia(new Date(data))
  const diferenca = Math.round((inicioDoDia(agora) - dia) / 86400000)
  if (diferenca === 0) return 'Hoje'
  if (diferenca === 1) return 'Ontem'
  const mesmoAno = dia.getFullYear() === agora.getFullYear()
  return dia.toLocaleDateString('pt-BR', mesmoAno ? { day: 'numeric', month: 'long' } : { day: '2-digit', month: '2-digit', year: 'numeric' })
}
