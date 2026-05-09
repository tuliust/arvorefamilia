import { supabase } from '../lib/supabaseClient';

export type GeneratedInsightType = 'astrology' | 'historical_events';

export interface PersonGeneratedInsight {
  id: string;
  pessoa_id: string;
  tipo: GeneratedInsightType;
  data_nascimento: string;
  conteudo: any;
  modelo?: string | null;
  prompt_version?: string | null;
  status: 'pending' | 'completed' | 'error';
  error_message?: string | null;
  created_at?: string;
  updated_at?: string;
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
    console.error('[Supabase Function] Erro ao gerar insights:', error);
    throw new Error(error.message || 'Erro ao gerar conteúdos automáticos.');
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
