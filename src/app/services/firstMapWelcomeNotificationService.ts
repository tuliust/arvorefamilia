import { supabase } from '../lib/supabaseClient';
import { dispatchNotification } from './notificationDispatchService';

function isDuplicateKeyError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === '23505' || String(error.message ?? '').toLowerCase().includes('duplicate key');
}

export async function ensureFirstMapWelcomeNotification(userId: string, pessoaId?: string | null) {
  if (!userId) return;

  const metadata = {
    source: 'first_map_access_welcome',
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

  const results = await dispatchNotification({
    userId,
    type: 'novo_usuario',
    titulo: 'Bem-vindo à Árvore Família',
    mensagem: 'Seu acesso foi confirmado. Comece explorando sua árvore familiar, memórias e vínculos.',
    link: '/mapa-familiar',
    metadata,
    channels: ['interna'],
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
