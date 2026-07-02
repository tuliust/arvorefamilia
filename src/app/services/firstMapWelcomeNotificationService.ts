import { supabase } from '../lib/supabaseClient';
import {
  getRuntimeNotificationTemplateForTrigger,
  renderRuntimeNotificationText,
} from './adminNotificationRuntimeService';
import { dispatchNotification } from './notificationDispatchService';

function isDuplicateKeyError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === '23505' || String(error.message ?? '').toLowerCase().includes('duplicate key');
}

export async function ensureFirstMapWelcomeNotification(userId: string, pessoaId?: string | null) {
  if (!userId) return;

  const metadata = {
    source: 'first_map_access_welcome',
    trigger_event: 'first_map_access',
    pessoa_id: pessoaId ?? undefined,
  };

  const { error: insertError } = await supabase
    .from('user_first_map_accesses')
    .insert({
      user_id: userId,
      pessoa_id: pessoaId ?? null,
      metadata,
    });

  if (insertError) {
    if (!isDuplicateKeyError(insertError)) {
      console.warn('[Supabase] Não foi possível registrar primeiro acesso ao mapa familiar:', insertError.message);
    }
    return;
  }

  const template = await getRuntimeNotificationTemplateForTrigger('first_map_access', 'first_access_welcome');

  if (!template) {
    console.warn('[Notificações] Nenhuma notificação ativa de boas-vindas foi encontrada no Supabase para o gatilho de primeiro acesso.');
    window.dispatchEvent(new Event('arvorefamilia:notifications-updated'));
    return;
  }

  const variables = {
    nome: 'familiar',
    nome_curto: 'familiar',
    nome_completo: 'familiar',
    data: new Intl.DateTimeFormat('pt-BR').format(new Date()),
    link: template.link,
  };

  const results = await dispatchNotification({
    userId,
    type: 'novo_usuario',
    titulo: renderRuntimeNotificationText(template.title, variables),
    mensagem: renderRuntimeNotificationText(template.message, variables),
    link: renderRuntimeNotificationText(template.link, variables),
    metadata: {
      ...metadata,
      admin_notification_type_id: template.typeId,
      admin_notification_template_id: template.templateId,
    },
    channels: template.channels,
    respectPreferences: false,
  });

  const internalNotification = results.find((result) => result.channel === 'interna' && result.status === 'sent');

  if (internalNotification?.notificationId) {
    await supabase
      .from('user_first_map_accesses')
      .update({ welcome_notification_id: internalNotification.notificationId })
      .eq('user_id', userId);
  }

  window.dispatchEvent(new Event('arvorefamilia:notifications-updated'));
}
