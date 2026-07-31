-- ============================================================
-- PRESTADOR — Fotos/vídeos anexados a um pedido de serviço
-- ============================================================
-- Permite o cliente anexar fotos/vídeos do que precisa (ex: a peça
-- quebrada, o cômodo a reformar) ao publicar um pedido. Mesmo
-- padrão de midias_avaliacao. Copie este arquivo inteiro no SQL
-- Editor do Supabase e rode.
-- ============================================================

create table midias_pedido (
  id uuid primary key default uuid_generate_v4(),
  pedido_id uuid references pedidos_servico(id) on delete cascade,
  url text not null,
  tipo text not null, -- 'foto' | 'video'
  criado_em timestamptz default now()
);

create index idx_midias_pedido_pedido on midias_pedido(pedido_id);

alter table midias_pedido enable row level security;

-- Visível para quem já pode ver o pedido (o app já filtra pedidos
-- fechados/privados na consulta de pedidos_servico; aqui a mídia
-- acompanha a mesma lógica pública de pedidos abertos).
create policy "Midias de pedido visiveis a todos" on midias_pedido
  for select using (true);

-- Só o dono do pedido pode anexar mídia a ele.
create policy "Dono do pedido anexa midia" on midias_pedido
  for insert with check (
    auth.uid() = (select cliente_user_id from pedidos_servico where id = pedido_id)
  );
