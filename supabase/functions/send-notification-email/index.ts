import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type NotificationType =
  | 'novo_usuario'
  | 'datas_especiais'
  | 'novas_mensagens_forum'
  | 'novos_registros_historicos'
  | 'evento_historico_familia';

const preferenceByType: Record<NotificationType, string> = {
  novo_usuario: 'receber_email_novo_usuario',
  datas_especiais: 'receber_email_datas_especiais',
  novas_mensagens_forum: 'receber_email_novas_mensagens_forum',
  novos_registros_historicos: 'receber_email_novos_registros_historicos',
  evento_historico_familia: 'receber_email_evento_historico_familia',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Método não permitido.' }, 405);
  }

  try {
    const { userId, notificationType, titulo, mensagem, link } = await req.json();

    if (!userId || !notificationType || !titulo || !mensagem) {
      return jsonResponse({ ok: false, error: 'userId, notificationType, titulo e mensagem são obrigatórios.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: preferences, error: preferencesError } = await supabase
      .from('preferencias_notificacao')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (preferencesError) {
      throw new Error(preferencesError.message);
    }

    if (preferences?.receber_email === false) {
      return jsonResponse({ ok: true, status: 'email_skipped_global_disabled' });
    }

    const preferenceKey = preferenceByType[notificationType as NotificationType];
    if (preferenceKey && preferences?.[preferenceKey] === false) {
      return jsonResponse({ ok: true, status: 'email_skipped_category_disabled' });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Família Souza Barros <notificacoes@seudominio.com>';

    if (!resendApiKey) {
      console.warn('[send-notification-email] RESEND_API_KEY não configurada.');
      return jsonResponse({ ok: true, status: 'email_skipped_provider_not_configured' });
    }

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError) {
      throw new Error(userError.message);
    }

    const email = userData.user?.email;

    if (!email) {
      return jsonResponse({ ok: true, status: 'email_skipped_user_without_email' });
    }

    const safeTitle = escapeHtml(String(titulo));
    const safeMessage = escapeHtml(String(mensagem));
    const safeLink = link ? escapeHtml(String(link)) : '';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [email],
        subject: String(titulo),
        html: [
          `<h1 style="font-family:Arial,sans-serif;font-size:20px;color:#111827;">${safeTitle}</h1>`,
          `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#374151;">${safeMessage}</p>`,
          safeLink
            ? `<p style="font-family:Arial,sans-serif;"><a href="${safeLink}" style="color:#2563eb;">Ver no site</a></p>`
            : '',
        ].join(''),
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || 'Erro ao enviar email.');
    }

    return jsonResponse({ ok: true, status: 'email_sent', provider: 'resend', id: payload?.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    console.error('[send-notification-email]', message);
    return jsonResponse({ ok: false, error: message }, 500);
  }
});
