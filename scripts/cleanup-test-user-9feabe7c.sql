-- =====================================================
-- LIMPEZA MANUAL DE DADOS DE TESTE
-- Usuário alvo: 9feabe7c-7138-4bff-ade0-deb4b2a26da6
-- =====================================================
--
-- Uso manual apenas.
-- Execute somente no Supabase SQL Editor ou via psql apontando para o projeto correto.
-- Revise todos os SELECTs da seção DRY-RUN antes de descomentar qualquer DELETE/UPDATE.
-- Faça backup antes de executar limpeza em ambiente compartilhado ou produção.
-- Este arquivo não deve ser usado como migration versionada do app.
--
-- Objetos do Supabase Storage não são removidos por este SQL.
-- Para limpar arquivos binários, confirme os paths e use o dashboard, script próprio
-- com service role em ambiente seguro, ou ferramenta operacional autorizada.
-- Nunca exponha service role key em repositório, navegador ou logs.

begin;

-- =====================================================
-- DRY-RUN: contagens e registros relacionados ao usuário
-- =====================================================

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'auth.users' as tabela, count(*) as total
from auth.users u, target_user t
where u.id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.profiles' as tabela, count(*) as total
from public.profiles p, target_user t
where p.id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.user_person_links' as tabela, count(*) as total
from public.user_person_links upl, target_user t
where upl.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.notification_preferences' as tabela, count(*) as total
from public.notification_preferences np, target_user t
where np.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.notifications' as tabela, count(*) as total
from public.notifications n, target_user t
where n.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.user_favorites' as tabela, count(*) as total
from public.user_favorites uf, target_user t
where uf.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.preferencias_notificacao' as tabela, count(*) as total
from public.preferencias_notificacao pn, target_user t
where pn.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.notificacoes_usuario' as tabela, count(*) as total
from public.notificacoes_usuario nu, target_user t
where nu.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.notification_dispatch_logs' as tabela, count(*) as total
from public.notification_dispatch_logs ndl, target_user t
where ndl.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.notification_occurrences' as tabela, count(*) as total
from public.notification_occurrences no, target_user t
where no.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.google_calendar_connections' as tabela, count(*) as total
from public.google_calendar_connections gcc, target_user t
where gcc.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.google_calendar_oauth_states' as tabela, count(*) as total
from public.google_calendar_oauth_states gcos, target_user t
where gcos.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.google_calendar_synced_events' as tabela, count(*) as total
from public.google_calendar_synced_events gcse, target_user t
where gcse.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.event_attendees' as tabela, count(*) as total
from public.event_attendees ea, target_user t
where ea.user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.activity_logs' as tabela, count(*) as total
from public.activity_logs al, target_user t
where al.actor_user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.arquivos_historicos' as tabela, count(*) as total
from public.arquivos_historicos ah, target_user t
where ah.created_by = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.relationship_change_requests' as tabela, count(*) as total
from public.relationship_change_requests rcr, target_user t
where rcr.requester_user_id = t.id;

with target_user as (
  select '9feabe7c-7138-4bff-ade0-deb4b2a26da6'::uuid as id
)
select 'public.site_visual_settings.updated_by' as tabela, count(*) as total
from public.site_visual_settings svs, target_user t
where svs.updated_by = t.id;

-- Amostras úteis para revisão manual.
select id, email, created_at, last_sign_in_at
from auth.users
where id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';

select *
from public.profiles
where id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';

select *
from public.user_person_links
where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';

-- =====================================================
-- LIMPEZA DO USUÁRIO ALVO
-- Descomente apenas após validar o DRY-RUN.
-- =====================================================

-- delete from public.google_calendar_synced_events where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.google_calendar_oauth_states where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.google_calendar_connections where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.notification_occurrences where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.notification_dispatch_logs where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.notificacoes_usuario where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.preferencias_notificacao where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.notifications where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.notification_preferences where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.user_favorites where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.event_attendees where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.user_person_links where user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.relationship_change_requests where requester_user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- update public.activity_logs set actor_user_id = null where actor_user_id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- update public.arquivos_historicos set created_by = null where created_by = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- update public.site_visual_settings set updated_by = null where updated_by = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';
-- delete from public.profiles where id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';

-- Auth fica separado de propósito. Use apenas se o SQL Editor estiver com privilégios adequados
-- e depois de limpar/revisar dados dependentes.
-- delete from auth.users where id = '9feabe7c-7138-4bff-ade0-deb4b2a26da6';

-- =====================================================
-- LIMPEZA GLOBAL OPCIONAL
-- Mantida comentada por padrão. Revise impacto antes de usar.
-- =====================================================

-- Limpar imagens de perfil de pessoas. Não remove os objetos do Storage.
-- update public.pessoas set foto_principal_url = null where foto_principal_url is not null;

-- Limpar avatar_url de todos os perfis. Não remove os objetos do Storage.
-- update public.profiles set avatar_url = null where avatar_url is not null;

-- Limpar metadados de arquivos históricos. Não remove os objetos do Storage.
-- update public.arquivos_historicos
-- set arquivo_url = null,
--     storage_bucket = null,
--     storage_path = null,
--     mime_type = null,
--     file_size_bytes = null
-- where arquivo_url is not null
--    or storage_path is not null;

-- Limpar preferências de notificações de todos os usuários.
-- delete from public.notification_preferences;
-- delete from public.preferencias_notificacao;

-- Limpar favoritos de todos os usuários.
-- delete from public.user_favorites;

-- Limpar notificações globais de usuários. Use apenas se a perda do histórico for desejada.
-- delete from public.notifications;
-- delete from public.notificacoes_usuario;
-- delete from public.notification_occurrences;
-- delete from public.notification_dispatch_logs;

rollback;

-- Troque rollback; por commit; somente depois de revisar e descomentar os comandos desejados.
