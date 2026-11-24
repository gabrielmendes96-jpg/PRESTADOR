-- 49 — Fecha o armazenamento de fotos, esconde pedidos de visitantes e cria o papel de administrador no banco.
--
-- 1) ARMAZENAMENTO (bucket "midias"). As regras antigas davam INSERT, DELETE e SELECT ao papel "public" sem olhar o dono:
--    qualquer pessoa, mesmo sem login, podia enviar arquivos, apagar fotos de outros e listar tudo.
--    Agora só quem é dono do caminho mexe no arquivo. As imagens continuam abrindo pelo link público
--    (o bucket é público), só a listagem e a escrita é que passam a exigir dono.
--      clientes/<id do usuário>/...      -> o próprio usuário
--      destaques/<id do usuário>/...     -> o próprio usuário
--      portfolio/<id do prestador>/...   -> o dono do perfil de prestador
--      perfil/<id do prestador>/...      -> o dono do perfil de prestador
--      pedidos/<id do pedido>/...        -> o cliente que criou o pedido
--      avaliacoes/<id da avaliação>/...  -> o autor da avaliação
--    Também limita o bucket a 50 MB por arquivo e a fotos e vídeos.
--
-- 2) PEDIDOS. A lista de pedidos abertos era legível por visitantes sem login (com nome do cliente e id do usuário).
--    Agora exige login. O dono continua vendo os próprios pedidos.
--
-- 3) ADMINISTRADOR. O acesso ao painel admin dependia de um e-mail escrito fixo no código. Agora existe a tabela
--    "admins": quem está nela é administrador. O e-mail antigo continua valendo como reserva até você conferir.

-- ---------- 1) armazenamento ----------
drop policy if exists "Permitir delete midias" on storage.objects;
drop policy if exists "Permitir upload midias" on storage.objects;
drop policy if exists "Permitir leitura midias" on storage.objects;

create or replace function public.dono_do_caminho_de_midia(p_nome text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select case (storage.foldername(p_nome))[1]
    when 'clientes'  then (storage.foldername(p_nome))[2] = auth.uid()::text
    when 'destaques' then (storage.foldername(p_nome))[2] = auth.uid()::text
    when 'portfolio' then exists (select 1 from public.prestadores p where p.id::text = (storage.foldername(p_nome))[2] and p.user_id = auth.uid())
    when 'perfil'    then exists (select 1 from public.prestadores p where p.id::text = (storage.foldername(p_nome))[2] and p.user_id = auth.uid())
    when 'pedidos'   then exists (select 1 from public.pedidos_servico ps where ps.id::text = (storage.foldername(p_nome))[2] and ps.cliente_user_id = auth.uid())
    when 'avaliacoes' then exists (select 1 from public.avaliacoes a where a.id::text = (storage.foldername(p_nome))[2] and a.autor_user_id = auth.uid())
    else false
  end;
$$;

grant execute on function public.dono_do_caminho_de_midia(text) to authenticated;

create policy "midias: dono envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'midias' and public.dono_do_caminho_de_midia(name));
create policy "midias: dono troca" on storage.objects for update to authenticated
  using (bucket_id = 'midias' and public.dono_do_caminho_de_midia(name))
  with check (bucket_id = 'midias' and public.dono_do_caminho_de_midia(name));
create policy "midias: dono apaga" on storage.objects for delete to authenticated
  using (bucket_id = 'midias' and public.dono_do_caminho_de_midia(name));
create policy "midias: dono lista" on storage.objects for select to authenticated
  using (bucket_id = 'midias' and public.dono_do_caminho_de_midia(name));

update storage.buckets
   set file_size_limit = 52428800,
       allowed_mime_types = array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm','video/3gpp','video/x-m4v','video/x-matroska']
 where id = 'midias';

-- ---------- 2) pedidos ----------
drop policy if exists "Pedidos visiveis" on public.pedidos_servico;
create policy "Pedidos visiveis" on public.pedidos_servico for select to authenticated
  using (auth.uid() = cliente_user_id or status = 'aberto');

drop policy if exists "Midias de pedido visiveis a todos" on public.midias_pedido;
create policy "Midias de pedido visiveis a logados" on public.midias_pedido for select to authenticated using (true);

-- ---------- 3) administradores ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  criado_em timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admin ve a propria linha" on public.admins;
create policy "admin ve a propria linha" on public.admins for select to authenticated using (user_id = auth.uid());

create or replace function public.sou_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.sou_admin() to authenticated;

insert into public.admins (user_id)
select id from auth.users where email = 'gabrielmendes96@gmail.com'
on conflict do nothing;
