-- Backfill visual de notificacoes administrativas para incluir nome curto do autor
-- e nome curto da pessoa afetada quando esses ids estao disponiveis nos metadados.

with link_notifications as (
  select
    n.id,
    coalesce(
      nullif(split_part(trim(p_actor.nome_exibicao), ' ', 1), ''),
      'Usuário'
    ) as actor_short_name,
    coalesce(
      nullif(split_part(trim(p_affected.nome_completo), ' ', 1), ''),
      'pessoa'
    ) as affected_short_name
  from public.notificacoes_usuario n
  left join public.profiles p_actor
    on (n.metadata ->> 'linked_user_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   and p_actor.id = (n.metadata ->> 'linked_user_id')::uuid
  left join public.pessoas p_affected
    on (n.metadata ->> 'pessoa_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   and p_affected.id = (n.metadata ->> 'pessoa_id')::uuid
  where n.tipo = 'novo_usuario'
    and (
      n.titulo = 'Novo vínculo confirmado'
      or n.mensagem = 'Um usuário confirmou vínculo com uma pessoa da árvore.'
    )
)
update public.notificacoes_usuario n
set
  titulo = link_notifications.actor_short_name || ' confirmou vínculo com ' || link_notifications.affected_short_name,
  mensagem = link_notifications.actor_short_name || ' confirmou vínculo com ' || link_notifications.affected_short_name || ' na árvore.',
  metadata = coalesce(n.metadata, '{}'::jsonb) || jsonb_build_object(
    'actor_short_name', link_notifications.actor_short_name,
    'affected_short_name', link_notifications.affected_short_name
  )
from link_notifications
where n.id = link_notifications.id;

with historical_notifications as (
  select
    n.id,
    coalesce(
      nullif(split_part(trim(p_actor.nome_exibicao), ' ', 1), ''),
      'Usuário'
    ) as actor_short_name,
    coalesce(
      nullif(split_part(trim(p_affected.nome_completo), ' ', 1), ''),
      'pessoa'
    ) as affected_short_name,
    coalesce(nullif(trim(n.metadata ->> 'title'), ''), 'registro histórico') as record_title
  from public.notificacoes_usuario n
  left join public.profiles p_actor
    on (n.metadata ->> 'actor_user_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   and p_actor.id = (n.metadata ->> 'actor_user_id')::uuid
  left join public.pessoas p_affected
    on (n.metadata ->> 'pessoa_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   and p_affected.id = (n.metadata ->> 'pessoa_id')::uuid
  where n.tipo = 'novos_registros_historicos'
    and n.metadata ? 'actor_user_id'
    and n.metadata ? 'pessoa_id'
    and (
      n.titulo = 'Novo registro histórico'
      or n.mensagem like 'Um novo registro histórico foi adicionado:%'
    )
)
update public.notificacoes_usuario n
set
  titulo = historical_notifications.actor_short_name || ' adicionou registro para ' || historical_notifications.affected_short_name,
  mensagem = historical_notifications.actor_short_name || ' adicionou ' || historical_notifications.record_title || ' ao perfil de ' || historical_notifications.affected_short_name || '.',
  metadata = coalesce(n.metadata, '{}'::jsonb) || jsonb_build_object(
    'actor_short_name', historical_notifications.actor_short_name,
    'affected_short_name', historical_notifications.affected_short_name
  )
from historical_notifications
where n.id = historical_notifications.id;
