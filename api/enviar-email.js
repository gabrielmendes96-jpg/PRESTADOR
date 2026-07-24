// api/enviar-email.js
// Envia emails transacionais via Resend (gratuito até 3000 emails/mês)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { tipo, destinatario, dados } = req.body
  const RESEND_KEY = process.env.RESEND_API_KEY

  if (!RESEND_KEY) {
    console.log('RESEND_API_KEY não configurado — email não enviado:', tipo)
    return res.status(200).json({ ok: true, aviso: 'Email não configurado' })
  }

  const templates = {
    pagamento_confirmado: {
      assunto: '✅ Pagamento confirmado — Prestador',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1FA855;">Pagamento confirmado! 🎉</h2>
          <p>Olá <strong>${dados.nome}</strong>,</p>
          <p>Seu pagamento de <strong>R$${dados.valor}</strong> foi confirmado com sucesso.</p>
          <p><strong>Plano:</strong> ${dados.plano}</p>
          <p>Seu perfil já está ativo na plataforma Prestador.</p>
          <a href="https://prestador-lyart.vercel.app/painel" 
            style="background: #1FA855; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
            Acessar meu painel
          </a>
        </div>
      `
    },
    nova_mensagem: {
      assunto: '💬 Você tem uma nova mensagem — Prestador',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1FA855;">Nova mensagem recebida!</h2>
          <p>Olá <strong>${dados.nome}</strong>,</p>
          <p><strong>${dados.remetente}</strong> enviou uma mensagem para você no Prestador.</p>
          <a href="https://prestador-lyart.vercel.app/mensagens"
            style="background: #1FA855; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
            Ver mensagem
          </a>
        </div>
      `
    },
    candidatura_aceita: {
      assunto: '🎉 Sua candidatura foi aceita — Prestador',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1FA855;">Candidatura aceita!</h2>
          <p>Olá <strong>${dados.nome}</strong>,</p>
          <p>O cliente aceitou sua candidatura para o serviço: <strong>${dados.servico}</strong>.</p>
          <p>Entre em contato pelo chat para combinar os detalhes.</p>
          <a href="https://prestador-lyart.vercel.app/mensagens"
            style="background: #1FA855; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
            Abrir chat
          </a>
        </div>
      `
    },
    nova_avaliacao: {
      assunto: '⭐ Você recebeu uma nova avaliação — Prestador',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1FA855;">Nova avaliação recebida!</h2>
          <p>Olá <strong>${dados.nome}</strong>,</p>
          <p>Um cliente avaliou seu serviço com <strong>${dados.nota} estrelas</strong>.</p>
          ${dados.comentario ? `<p><em>"${dados.comentario}"</em></p>` : ''}
          <a href="https://prestador-lyart.vercel.app/painel"
            style="background: #1FA855; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
            Ver avaliação
          </a>
        </div>
      `
    },
    novo_pedido_zona: {
      assunto: '🔥 Novo pedido de serviço perto de você — Prestador',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1FA855;">Novo pedido na sua área!</h2>
          <p>Olá <strong>${dados.nome}</strong>,</p>
          <p>Um cliente está buscando <strong>${dados.categoria}</strong> em <strong>${dados.cidade}</strong>.</p>
          <p><strong>Serviço:</strong> ${dados.titulo}</p>
          ${dados.orcamento ? `<p><strong>Orçamento:</strong> R$${dados.orcamento}</p>` : ''}
          <a href="https://prestador-lyart.vercel.app/pedidos"
            style="background: #1FA855; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
            Ver pedido e se candidatar
          </a>
        </div>
      `
    }
  }

  const template = templates[tipo]
  if (!template) return res.status(400).json({ error: 'Tipo de email inválido' })

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`
      },
      body: JSON.stringify({
        from: 'Prestador <noreply@prestador.app>',
        to: destinatario,
        subject: template.assunto,
        html: template.html
      })
    })

    const data = await response.json()
    
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    await supabase.from('emails_log').insert({
      destinatario,
      assunto: template.assunto,
      tipo,
      enviado: response.ok
    })

    return res.status(200).json({ ok: true, id: data.id })
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return res.status(500).json({ error: 'Erro ao enviar email' })
  }
}
