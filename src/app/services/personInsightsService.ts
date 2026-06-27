import { supabase } from '../lib/supabaseClient';

export type GeneratedInsightType = 'astrology' | 'historical_events';

export interface PersonGeneratedInsightContent {
  body?: string;
  sign?: string;
  title?: string;
  main_event?: string;
  period_title?: string;
  brazil?: {
    title?: string;
    body?: string[];
  };
  world?: {
    title?: string;
    body?: string[];
  };
  [key: string]: unknown;
}

export interface PersonGeneratedInsight {
  id: string;
  pessoa_id: string;
  tipo: GeneratedInsightType;
  data_nascimento: string;
  conteudo: PersonGeneratedInsightContent;
  modelo?: string | null;
  prompt_version?: string | null;
  status: 'pending' | 'completed' | 'error';
  error_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

type FunctionErrorWithContext = {
  message?: string;
  context?: Response;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function getFunctionErrorMessage(error: unknown) {
  const fallback = error instanceof Error
    ? error.message
    : 'Erro ao gerar conteúdos automáticos.';

  const context = (error as FunctionErrorWithContext | null | undefined)?.context;

  if (!context) return fallback;

  try {
    const payload = await context.clone().json();
    if (isRecord(payload) && typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    try {
      const text = await context.clone().text();
      if (text.trim()) return text;
    } catch {
      // Mantem a mensagem original retornada pelo cliente de Functions.
    }
  }

  return fallback;
}

export async function obterInsightsGeradosPessoa(pessoaId: string) {
  const { data, error } = await supabase
    .from('person_generated_insights')
    .select('*')
    .eq('pessoa_id', pessoaId)
    .in('tipo', ['astrology', 'historical_events']);

  if (error) {
    console.error('[Supabase] Erro ao obter insights gerados:', error);
    return [];
  }

  return (data || []) as PersonGeneratedInsight[];
}

export async function gerarInsightsPessoa(pessoaId: string, force = false) {
  const { data, error } = await supabase.functions.invoke('generate-person-insights', {
    body: {
      pessoaId,
      force,
    },
  });

  if (error) {
    const message = await getFunctionErrorMessage(error);
    console.error('[Supabase Function] Erro ao gerar insights:', error, message);
    throw new Error(message);
  }

  if (!data?.ok) {
    throw new Error(data?.error || 'Erro ao gerar conteúdos automáticos.');
  }

  return data;
}

export function getInsightByType(
  insights: PersonGeneratedInsight[],
  tipo: GeneratedInsightType
) {
  return insights.find((insight) => insight.tipo === tipo && insight.status === 'completed');
}

export async function upsertPersonGeneratedInsight(params: {
  pessoaId: string;
  tipo: GeneratedInsightType;
  dataNascimento: string;
  conteudo: PersonGeneratedInsightContent;
  status?: PersonGeneratedInsight['status'];
  errorMessage?: string | null;
}) {
  const { data, error } = await supabase
    .from('person_generated_insights')
    .upsert({
      pessoa_id: params.pessoaId,
      tipo: params.tipo,
      data_nascimento: params.dataNascimento,
      conteudo: params.conteudo,
      status: params.status ?? 'completed',
      error_message: params.errorMessage ?? null,
      prompt_version: 'admin-manual-v1',
      modelo: 'manual',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }, { onConflict: 'pessoa_id,tipo' })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message || 'Erro ao salvar conteudo automatico.');
  }

  return data as PersonGeneratedInsight;
}

export async function deletePersonGeneratedInsight(pessoaId: string, tipo: GeneratedInsightType) {
  const { error } = await supabase
    .from('person_generated_insights')
    .delete()
    .eq('pessoa_id', pessoaId)
    .eq('tipo', tipo);

  if (error) {
    throw new Error(error.message || 'Erro ao limpar conteudo automatico.');
  }
}
