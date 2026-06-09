-- Reforça a criação da função usada pelo botão "resetar perfil" em /admin/pessoas.
-- Esta migration é idempotente e também força recarregamento do schema cache do PostgREST.

alter table public.pessoas
  alter column permitir_exibir_instagram set default true,
  alter column permitir_mensagens_whatsapp set default true,
  alter column permitir_exibir_data_nascimento set default true,
  alter column permitir_exibir_endereco set default true,
  alter column permitir_exibir_telefone set default true;

create or replace function public.admin_reset_person_profile(target_pessoa_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_people integer := 0;
  deleted_insights integer := 0;
  deleted_favorites integer := 0;
  notification_preferences_reset integer := 0;
begin
  if not public.is_admin_user(auth.uid()) then
    raise exception 'Apenas administradores podem resetar perfil de pessoa.';
  end if;

  update public.pessoas
  set
    foto_principal_url = null,
    permitir_exibir_instagram = true,
    permitir_mensagens_whatsapp = true,
    permitir_exibir_data_nascimento = true,
    permitir_exibir_endereco = true,
    permitir_exibir_rede_social = true,
    permitir_exibir_telefone = true,
    updated_at = now()
  where id = target_pessoa_id;

  get diagnostics updated_people = row_count;

  if updated_people = 0 then
    raise exception 'Pessoa não encontrada.';
  end if;

  delete from public.person_generated_insights
  where pessoa_id = target_pessoa_id
    and tipo in ('astrology', 'historical_events');

  get diagnostics deleted_insights = row_count;

  delete from public.user_favorites
  where entity_type = 'person'
    and entity_id = target_pessoa_id::text;

  get diagnostics deleted_favorites = row_count;

  insert into public.preferencias_notificacao (
    user_id,
    receber_aniversarios,
    receber_datas_memoria,
    receber_eventos,
    receber_avisos_gerais,
    receber_email,
    receber_push,
    receber_whatsapp,
    receber_email_novo_usuario,
    receber_email_datas_especiais,
    receber_email_novas_mensagens_forum,
    receber_email_novos_registros_historicos,
    receber_email_evento_historico_familia
  )
  select distinct
    upl.user_id,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true
  from public.user_person_links upl
  where upl.pessoa_id = target_pessoa_id
  on conflict (user_id) do update
  set
    receber_aniversarios = true,
    receber_datas_memoria = true,
    receber_eventos = true,
    receber_avisos_gerais = true,
    receber_email = true,
    receber_push = true,
    receber_whatsapp = true,
    receber_email_novo_usuario = true,
    receber_email_datas_especiais = true,
    receber_email_novas_mensagens_forum = true,
    receber_email_novos_registros_historicos = true,
    receber_email_evento_historico_familia = true,
    updated_at = now();

  get diagnostics notification_preferences_reset = row_count;

  return jsonb_build_object(
    'updated_people', updated_people,
    'deleted_insights', deleted_insights,
    'deleted_favorites', deleted_favorites,
    'notification_preferences_reset', notification_preferences_reset
  );
end;
$$;

grant execute on function public.admin_reset_person_profile(uuid) to authenticated;

notify pgrst, 'reload schema';
