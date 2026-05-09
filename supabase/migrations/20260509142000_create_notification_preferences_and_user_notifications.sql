create table if not exists public.preferencias_notificacao (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  receber_aniversarios boolean not null default true,
  receber_datas_memoria boolean not null default true,
  receber_eventos boolean not null default true,
  receber_avisos_gerais boolean not null default true,

  receber_email boolean not null default true,
  receber_push boolean not null default false,
  receber_whatsapp boolean not null default false,

  receber_email_novo_usuario boolean not null default true,
  receber_email_datas_especiais boolean not null default true,
  receber_email_novas_mensagens_forum boolean not null default true,
  receber_email_novos_registros_historicos boolean not null default true,
  receber_email_evento_historico_familia boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.preferencias_notificacao
add column if not exists receber_email_novo_usuario boolean not null default true;

alter table public.preferencias_notificacao
add column if not exists receber_email_datas_especiais boolean not null default true;

alter table public.preferencias_notificacao
add column if not exists receber_email_novas_mensagens_forum boolean not null default true;

alter table public.preferencias_notificacao
add column if not exists receber_email_novos_registros_historicos boolean not null default true;

alter table public.preferencias_notificacao
add column if not exists receber_email_evento_historico_familia boolean not null default true;

alter table public.preferencias_notificacao
add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_preferencias_notificacao_user_id
on public.preferencias_notificacao(user_id);

alter table public.preferencias_notificacao enable row level security;

drop policy if exists "Users can read own notification preferences"
on public.preferencias_notificacao;

create policy "Users can read own notification preferences"
on public.preferencias_notificacao
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own notification preferences"
on public.preferencias_notificacao;

create policy "Users can insert own notification preferences"
on public.preferencias_notificacao
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notification preferences"
on public.preferencias_notificacao;

create policy "Users can update own notification preferences"
on public.preferencias_notificacao
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.notificacoes_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  titulo text not null,
  mensagem text not null,
  tipo text not null default 'notificacao',
  canal text not null default 'interna',
  lida boolean not null default false,
  link text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notificacoes_usuario_user_id
on public.notificacoes_usuario(user_id);

create index if not exists idx_notificacoes_usuario_created_at
on public.notificacoes_usuario(created_at desc);

create index if not exists idx_notificacoes_usuario_lida
on public.notificacoes_usuario(lida);

alter table public.notificacoes_usuario enable row level security;

drop policy if exists "Users can read own notifications"
on public.notificacoes_usuario;

create policy "Users can read own notifications"
on public.notificacoes_usuario
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own notifications"
on public.notificacoes_usuario;

create policy "Users can insert own notifications"
on public.notificacoes_usuario
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notifications"
on public.notificacoes_usuario;

create policy "Users can update own notifications"
on public.notificacoes_usuario
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications"
on public.notificacoes_usuario;

create policy "Users can delete own notifications"
on public.notificacoes_usuario
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_preferencias_notificacao_updated_at
on public.preferencias_notificacao;

create trigger trg_preferencias_notificacao_updated_at
before update on public.preferencias_notificacao
for each row
execute function public.set_updated_at();

drop trigger if exists trg_notificacoes_usuario_updated_at
on public.notificacoes_usuario;

create trigger trg_notificacoes_usuario_updated_at
before update on public.notificacoes_usuario
for each row
execute function public.set_updated_at();
