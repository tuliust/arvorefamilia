import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import {
  buildCuriosityQuizQuestions,
  curiositySectionCardClassName,
  getInitials,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

type CuriosidadesQuizSectionProps = CuriosidadesDataProps & {
  className?: string;
};

export function CuriosidadesQuizSection({
  pessoas,
  relacionamentos,
  loading,
  error,
  className = '',
}: CuriosidadesQuizSectionProps) {
  const questions = useMemo(
    () => buildCuriosityQuizQuestions(pessoas, relacionamentos),
    [pessoas, relacionamentos]
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const currentQuestion = questions[questionIndex] ?? null;
  const answeredCorrectly = Boolean(currentQuestion && selectedOptionId === currentQuestion.answerId);
  const hasAnswered = Boolean(selectedOptionId);

  useEffect(() => {
    if (questionIndex >= questions.length && questions.length > 0) {
      setQuestionIndex(questions.length - 1);
      setSelectedOptionId(null);
    }

    if (questions.length === 0 && questionIndex !== 0) {
      setQuestionIndex(0);
      setSelectedOptionId(null);
    }
  }, [questionIndex, questions.length]);

  const goNext = () => {
    setSelectedOptionId(null);
    setQuestionIndex((current) => (questions.length === 0 ? 0 : (current + 1) % questions.length));
  };

  return (
    <section className={`${curiositySectionCardClassName} ${className}`}>
      <div className="flex items-center gap-3">
        <BrainCircuit className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Teste seus conhecimentos</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        Responda perguntas geradas automaticamente a partir dos dados cadastrados na árvore.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar o quiz familiar agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 h-64 animate-pulse rounded-xl bg-gray-100" />
      )}

      {!error && !loading && !currentQuestion && (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Ainda não há dados suficientes para montar perguntas. Cadastre pelo menos quatro familiares com datas, cidades ou profissões.
        </div>
      )}

      {!error && !loading && currentQuestion && (
        <div className="mt-5">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                  Pergunta {questionIndex + 1} de {questions.length}
                </p>
                <h3 className="mt-2 text-lg font-bold leading-7 text-gray-950">
                  {currentQuestion.prompt}
                </h3>
              </div>
            </div>
          </div>

          <div className="curiosidades-quiz-options-grid mt-4 grid gap-2 sm:grid-cols-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrect = hasAnswered && option.id === currentQuestion.answerId;
              const isWrong = hasAnswered && isSelected && option.id !== currentQuestion.answerId;

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => setSelectedOptionId(option.id)}
                  className={[
                    'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition',
                    isCorrect ? 'border-green-300 bg-green-50 text-green-950' :
                      isWrong ? 'border-red-300 bg-red-50 text-red-950' :
                        'border-gray-200 bg-white text-gray-800 hover:border-blue-200 hover:bg-blue-50',
                  ].join(' ')}
                >
                  {option.imageUrl ? (
                    <img src={option.imageUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                      {getInitials(option.label)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{option.label}</span>
                  {isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-green-700" />}
                  {isWrong && <XCircle className="h-5 w-5 shrink-0 text-red-700" />}
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-bold text-gray-950">
                {answeredCorrectly ? 'Resposta correta.' : `Resposta correta: ${currentQuestion.answerLabel}.`}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">{currentQuestion.explanation}</p>
              <button
                type="button"
                onClick={goNext}
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Próxima pergunta
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
