// O Supabase reemite a sessão (com um objeto `user` novo) ao renovar o token e sempre que a aba volta a ficar visível.
// Se o app trocar o `usuario` do contexto por esse objeto novo, toda tela que depende dele recarrega do zero
// e perde o que estava na tela. Só vale como "outro usuário" quando a pessoa mudou ou o perfil foi atualizado.
export function mesmoUsuario(a, b) {
  if (a === b) return true
  if (!a || !b) return false
  return a.id === b.id && a.updated_at === b.updated_at && a.email === b.email
}

// Para usar em setUsuario(prev => escolherUsuario(prev, novo)): mantém a referência antiga se for o mesmo usuário.
export function escolherUsuario(anterior, novo) {
  return mesmoUsuario(anterior, novo) ? anterior : novo
}
