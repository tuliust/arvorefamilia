import { useMemo, useState } from 'react';
import { Bot, Lightbulb } from 'lucide-react';

import { AiQuestionPanel } from '../home/AiQuestionPanel';
import { buildAiTreeContext } from '../home/homeAiContext';
import { calculateCuriosities, type CuriosityTopic } from '../home/homeCuriositiesUtils';
import type { DirectRelativeGroup } from '../../components/FamilyTree/types';
import {
  isDeceased,
  isPet,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

const AI_ENDPOINT = '/api/ai';

const AI_QUESTION_EXAMPLES = [
  'Quem são meus bisavós paternos?',
  'Quantas pessoas da família nasceram em Recife?',
  'Quais parentes moram em Porto Alegre?',
  'Monte um resumo da linha genealógica de uma pessoa.',
  'Quais sobrenomes aparecem com mais frequência?',
  'Quais cidades concentram mais familiares?',
  'Quem são os familiares mais longevos?',
  'Quais casais já completaram bodas?',
];

const AI_QUESTION_PLACEHOLDER = 'Faça aqui sua pergunta…';

const EMPTY_DIRECT_RELATION_COUNTS: Record<DirectRelativeGroup, number> = {
  pais: 0,
  avos: 0,
  bisavos: 0,
  tataravos: 0,
  conjuge: 0,
  filhos: 0,
  netos: 0,
  irmaos: 0,
  sobrinhos: 0,
  tios: 0,
  primos: 0,
  pets: 0,
};

export function CuriosidadesAiSection({
  pessoas,
  relacionamentos,
  loading,
  error,
}: CuriosidadesDataProps) {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const selectedCuriosityPerson = pessoas.find((pessoa) => !isPet(pessoa)) ?? pessoas[0];
  const selectedCuriosityTopics = useMemo<CuriosityTopic[]>(() => [], []);
  const curiosities = useMemo(() => calculateCuriosities(pessoas, relacionamentos), [pessoas, relacionamentos]);

  const stats = useMemo(() => {
    const humans = pessoas.filter((pessoa) => !isPet(pessoa));
    const pets = pessoas.filter(isPet);

    return {
      totalPessoas: pessoas.length,
      pessoasHumanas: humans.length,
      pessoasVivas: humans.filter((pessoa) => !isDeceased(pessoa)).length,
      pessoasFalecidas: humans.filter(isDeceased).length,
      pets: pets.length,
      relacionamentos: relacionamentos.length,
    };
  }, [pessoas, relacionamentos]);

  const canAskAi = Boolean(!aiAnswer && aiQuestion.trim() && !loading && !error && pessoas.length > 0);

  const handleAskAi = async () => {
    const question = aiQuestion.trim();
    if (!question || aiLoading) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          context: buildAiTreeContext({
            pessoas,
            relacionamentos,
            stats,
            curiosities,
            centralPersonId: selectedCuriosityPerson?.id,
            centralPersonName: selectedCuriosityPerson?.nome_completo || 'Família',
            directRelationCounts: EMPTY_DIRECT_RELATION_COUNTS,
            selectedCuriosityPerson,
            selectedCuriosityTopics,
          }),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || 'Não foi possível gerar a resposta agora.');
      }

      const answer = payload?.answer || payload?.data?.answer || payload?.response;

      if (!answer || typeof answer !== 'string') {
        throw new Error('A IA não retornou uma resposta válida.');
      }

      setAiAnswer(answer);
    } catch (askError) {
      setAiError(askError instanceof Error ? askError.message : 'Não foi possível gerar a resposta agora.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleNewAiQuestion = () => {
    setAiQuestion('');
    setAiAnswer('');
    setAiError(null);
  };

  return (
    <section className="rounded-2xl border border-blue-300 bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-5 shadow-md shadow-blue-200/70 ring-1 ring-blue-100">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
          <Bot className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-bold text-blue-950">Pergunte à IA</h2>
      </div>

      <p className="mt-3 text-sm leading-6 text-blue-950/80">
        Faça perguntas em linguagem natural sobre pessoas, relações, cidades, datas e padrões da árvore familiar.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar o contexto familiar para a IA agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 h-64 animate-pulse rounded-xl bg-white/70" />
      )}

      {!error && !loading && pessoas.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-blue-200 bg-white/80 px-4 py-5 text-sm text-blue-900">
          Cadastre pessoas na árvore para habilitar perguntas à IA.
        </div>
      )}

      {!error && !loading && pessoas.length > 0 && (
        <div className="mt-5 min-w-0 space-y-4 overflow-hidden break-words">
          <div className="curiosidades-ai-suggestions-card rounded-xl border border-blue-200 bg-white p-4">
            <div className="curiosidades-ai-suggestions-heading flex items-center gap-3">
              <Lightbulb className="h-5 w-5 shrink-0 text-blue-700" />
              <p className="min-w-0 text-sm font-bold text-blue-900">Sugestões rápidas</p>
            </div>
            <div className="curiosidades-ai-suggestions-list mt-3 flex flex-wrap gap-2">
              {AI_QUESTION_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setAiQuestion(example);
                    setAiAnswer('');
                    setAiError(null);
                  }}
                  className="curiosidades-ai-suggestion-chip rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition hover:border-blue-300 hover:bg-blue-100"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="curiosidades-ai-question-panel">
            <AiQuestionPanel
            aiQuestion={aiQuestion}
            aiAnswer={aiAnswer}
            aiLoading={aiLoading}
            aiError={aiError}
            canAskAi={canAskAi}
            placeholder={AI_QUESTION_PLACEHOLDER}
            onQuestionChange={setAiQuestion}
            onClearError={() => setAiError(null)}
            onAskAi={handleAskAi}
            onNewAiQuestion={handleNewAiQuestion}
              hideTitle
            />
          </div>
        </div>
      )}
    </section>
  );
}
