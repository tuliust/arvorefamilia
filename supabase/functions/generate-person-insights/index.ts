import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type InsightType = 'astrology' | 'historical_events';

type PessoaRow = {
  id: string;
  nome_completo: string;
  data_nascimento: string | number | null;
  local_nascimento?: string | null;
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

function normalizeBirthDate(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  if (!text) return null;

  const br = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const [, day, month, year] = br;
    return {
      original: text,
      day: Number(day),
      month: Number(month),
      year: Number(year),
      iso: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
    };
  }

  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const [, year, month, day] = iso;
    return {
      original: text,
      day: Number(day),
      month: Number(month),
      year: Number(year),
      iso: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
    };
  }

  return null;
}

async function callOpenAI(prompt: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Você escreve textos curtos, informativos e elegantes para uma árvore genealógica familiar. Responda sempre em JSON válido, sem markdown.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Erro ao chamar OpenAI.');
  }

  const content = payload?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI não retornou conteúdo.');
  }

  return JSON.parse(content);
}

function buildAstrologyPrompt(pessoa: PessoaRow, birth: ReturnType<typeof normalizeBirthDate>) {
  return `
Gere o conteúdo do bloco "O que diz a astrologia" para uma página de perfil familiar.

Pessoa:
- Nome: ${pessoa.nome_completo}
- Data de nascimento: ${birth?.original}
- Local de nascimento: ${pessoa.local_nascimento || 'não informado'}

Modelo visual/textual esperado:
- Mesmo estilo do fallback atual.
- Um único parágrafo.
- Tom informativo, leve e respeitoso.
- Não fazer previsões absolutas.
- Não usar linguagem mística exagerada.
- Mencionar signo solar provável com base na data.
- Mencionar traços gerais do signo.
- Mencionar possíveis afinidades e desafios de convivência de forma genérica.
- Tamanho: 90 a 130 palavras.

Responda apenas em JSON neste formato:

{
  "title": "O que diz a astrologia",
  "body": "texto em um parágrafo"
}
`;
}

function buildHistoricalPrompt(pessoa: PessoaRow, birth: ReturnType<typeof normalizeBirthDate>) {
  return `
Gere o conteúdo do bloco "Acontecimentos históricos no dia do nascimento" para uma página de perfil familiar.

Pessoa:
- Nome: ${pessoa.nome_completo}
- Data de nascimento: ${birth?.original}
- Local de nascimento: ${pessoa.local_nascimento || 'não informado'}

Modelo visual/textual esperado:
- Mesmo estilo do fallback atual.
- Informativo, objetivo e contextual.
- Citar um principal acontecimento do dia, preferencialmente fato histórico verificável.
- Depois explicar brevemente o que acontecia no Brasil e no mundo naquele período.
- Evitar exageros e afirmações incertas.
- Não inventar dados específicos se não houver segurança; nesse caso, usar contextualização histórica do ano/período.
- Texto em português do Brasil.

Responda apenas em JSON neste formato:

{
  "title": "DD/MM/AAAA — principal acontecimento do dia",
  "main_event": "parágrafo sobre o principal acontecimento",
  "period_title": "O que estava acontecendo na época",
  "brazil": {
    "title": "Brasil",
    "body": ["parágrafo 1", "parágrafo 2 opcional"]
  },
  "world": {
    "title": "Mundo",
    "body": ["parágrafo 1", "parágrafo 2 opcional"]
  }
}
`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Método não permitido.' }, 405);
  }

  try {
    const { pessoaId, force = false } = await req.json();

    if (!pessoaId) {
      return jsonResponse({ ok: false, error: 'pessoaId é obrigatório.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: pessoa, error: pessoaError } = await supabase
      .from('pessoas')
      .select('id, nome_completo, data_nascimento, local_nascimento')
      .eq('id', pessoaId)
      .maybeSingle();

    if (pessoaError) {
      throw new Error(pessoaError.message);
    }

    if (!pessoa) {
      return jsonResponse({ ok: false, error: 'Pessoa não encontrada.' }, 404);
    }

    const birth = normalizeBirthDate(pessoa.data_nascimento);

    if (!birth) {
      return jsonResponse({
        ok: false,
        error: 'Pessoa sem data de nascimento completa. Use DD/MM/AAAA ou YYYY-MM-DD.',
      }, 400);
    }

    const types: InsightType[] = ['astrology', 'historical_events'];
    const results: Partial<Record<InsightType, unknown>> = {};

    for (const tipo of types) {
      if (!force) {
        const { data: existing, error: existingError } = await supabase
          .from('person_generated_insights')
          .select('*')
          .eq('pessoa_id', pessoaId)
          .eq('tipo', tipo)
          .maybeSingle();

        if (existingError) {
          throw new Error(existingError.message);
        }

        if (existing) {
          results[tipo] = existing;
          continue;
        }
      }

      const prompt =
        tipo === 'astrology'
          ? buildAstrologyPrompt(pessoa, birth)
          : buildHistoricalPrompt(pessoa, birth);

      const generatedContent = await callOpenAI(prompt);

      const { data: saved, error: saveError } = await supabase
        .from('person_generated_insights')
        .upsert(
          {
            pessoa_id: pessoaId,
            tipo,
            data_nascimento: String(pessoa.data_nascimento),
            conteudo: generatedContent,
            modelo: 'gpt-4o-mini',
            prompt_version: 'v1',
            status: 'completed',
            error_message: null,
          },
          {
            onConflict: 'pessoa_id,tipo',
          }
        )
        .select('*')
        .single();

      if (saveError) {
        throw new Error(saveError.message);
      }

      results[tipo] = saved;
    }

    return jsonResponse({
      ok: true,
      pessoa_id: pessoaId,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    console.error('[generate-person-insights]', message);

    return jsonResponse({
      ok: false,
      error: message,
    }, 500);
  }
});
