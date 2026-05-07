import { supabase } from '../lib/supabaseClient';

type FunctionResponse<T> = T & {
  success?: boolean;
  error?: string;
};

export type GoogleCalendarAuthResponse = {
  authUrl: string;
};

export type GoogleCalendarSyncResult = {
  totalCriados?: number;
  totalAtualizados?: number;
  totalIgnorados?: number;
  erros?: Array<{ evento_familiar_id: string; erro: string }>;
};

export type GoogleCalendarPreferencias = {
  incluirAniversarios: boolean;
  incluirMemorias: boolean;
};

export type GoogleCalendarStatus = {
  conectado: boolean;
  google_account_email?: string | null;
  last_sync_at?: string | null;
};

function logGoogleCalendarError(context: string, error: unknown) {
  console.error(`[Google Calendar] ${context}`, error);
}

function getFunctionError(payloadError?: string, invokeError?: { message?: string } | null) {
  return payloadError || invokeError?.message || 'Erro inesperado na integração com Google Calendar.';
}

export async function iniciarConexaoGoogleCalendar() {
  const { data, error } = await supabase.functions.invoke<FunctionResponse<GoogleCalendarAuthResponse>>(
    'google-calendar-auth',
  );

  if (error || !data?.success || !data.authUrl) {
    logGoogleCalendarError('Erro ao iniciar conexão OAuth', error || data?.error);
    return { error: getFunctionError(data?.error, error) };
  }

  window.location.assign(data.authUrl);
  return {};
}

export async function sincronizarGoogleCalendar(preferencias: GoogleCalendarPreferencias) {
  const { data, error } = await supabase.functions.invoke<FunctionResponse<GoogleCalendarSyncResult>>(
    'sync-google-calendar',
    { body: preferencias },
  );

  if (error || !data?.success) {
    logGoogleCalendarError('Erro ao sincronizar eventos', error || data?.error);
    return {
      error: getFunctionError(data?.error, error),
      data,
    };
  }

  return { data };
}

export async function desconectarGoogleCalendar() {
  const { data, error } = await supabase.functions.invoke<FunctionResponse<{ connected?: boolean }>>(
    'disconnect-google-calendar',
  );

  if (error || !data?.success) {
    logGoogleCalendarError('Erro ao desconectar calendário', error || data?.error);
    return { error: getFunctionError(data?.error, error) };
  }

  return {};
}

export async function obterStatusGoogleCalendar(userId: string): Promise<GoogleCalendarStatus> {
  const { data, error } = await supabase
    .from('google_calendar_connection_status')
    .select('google_account_email,last_sync_at,ativo')
    .eq('user_id', userId)
    .eq('ativo', true)
    .maybeSingle();

  if (error) {
    logGoogleCalendarError('Erro ao obter status da conexão', error);
    return { conectado: false };
  }

  return {
    conectado: Boolean(data?.ativo),
    google_account_email: data?.google_account_email ?? null,
    last_sync_at: data?.last_sync_at ?? null,
  };
}
