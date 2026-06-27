import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import {
  buildCuriosityQuizQuestions,
  curiositySectionCardClassName,
  getInitials,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';
import type { Pessoa } from '../../types';

type CuriosidadesQuizSectionProps = CuriosidadesDataProps & {
  className?: string;
};

type QuizQuestion = ReturnType<typeof buildCuriosityQuizQuestions>[number];
type QuizOption = QuizQuestion['options'][number];

const QUIZ_QUESTION_LIMIT = 5;

function normalizeQuizText(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

function isQuizPet(pessoa: Pessoa) {
  return normalizeQuizText(pessoa.humano_ou_pet) === 'pet';
}

function sortQuizPeopleByName(people: Pessoa[]) {
  return [...people].sort((a, b) =>
    String(a.nome_completo ?? '').localeCompare(String(b.nome_completo ?? ''), 'pt-BR', { sensitivity: 'base' })
  );
}

function rotateQuizPeople(people: Pessoa[], offset: number) {
  if (people.length === 0) return people;

  const safeOffset = ((offset % people.length) + people.length) % people.length;
  return [...people.slice(safeOffset), ...people.slice(0, safeOffset)];
}

function toQuizOption(pessoa: Pessoa): QuizOption {
  return {
    id: pessoa.id,
    label: String(pessoa.nome_completo || 'Pessoa sem nome').trim(),
    imageUrl: pessoa.foto_principal_url,
  };
}

function rebuildVariedOptions(
  question: QuizQuestion,
  pessoas: Pessoa[],
  previousOptionIds: Set<string>,
  offset: number,
) {
  const answer = pessoas.find((pessoa) => pessoa.id === question.answerId);
  if (!answer) return question;

  const eligibleDistractors = sortQuizPeopleByName(pessoas)
    .filter((pessoa) => !isQuizPet(pessoa))
    .filter((pessoa) => Boolean(pessoa.id && pessoa.nome_completo))
    .filter((pessoa) => pessoa.id !== answer.id);
  const rotatedDistractors = rotateQuizPeople(eligibleDistractors, offset);
  const preferredDistractors = rotatedDistractors.filter((pessoa) => !previousOptionIds.has(pessoa.id));
  const fallbackDistractors = rotatedDistractors.filter((pessoa) => previousOptionIds.has(pessoa.id));
  const selected = [answer, ...preferredDistractors, ...fallbackDistractors]
    .filter((pessoa, index, list) => list.findIndex((current) => current.id === pessoa.id) === index)
    .slice(0, 6);

  if (selected.length < 6) return question;

  return {
    ...question,
    options: sortQuizPeopleByName(selected).map(toQuizOption),
  };
}

function adjustQuizQuestions(questions: QuizQuestion[], pessoas: Pessoa[]) {
  let previousOptionIds = new Set<string>();

  return questions.map((question, index) => {
    let adjustedQuestion = {
      ...question,
      prompt: question.id === 'oldest-living-person'
        ? 'Quem é a pessoa com mais tempo de vida?'
        : question.prompt,
    };

    if (question.id === 'profession-journalist') {
      adjustedQuestion = rebuildVariedOptions(
        adjustedQuestion,
        pessoas,
        previousOptionIds,
        Math.max(1, Math.floor(pessoas.length / 3) + index),
      );
    }

    if (question.id === 'more-children') {
      adjustedQuestion = rebuildVariedOptions(
        adjustedQuestion,
        pessoas,
        previousOptionIds,
        Math.max(2, Math.floor((pessoas.length * 2) / 3) + index),
      );
    }

    previousOptionIds = new Set(adjustedQuestion.options.map((option) => option.id));
    return adjustedQuestion;
  });
}

function getFirstTwoNames(value: unknown) {
  const parts = String(value ?? '').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).join(' ') || String(value ?? '').trim();
}

function getFirstAndLastName(value: unknown) {
  const parts = String(value ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return parts.join(' ');
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function getUniqueOptionLabel(option: QuizOption, options: QuizOption[]) {
  const shortLabel = getFirstTwoNames(option.label);
  const shortCollisions = options.filter((current) => getFirstTwoNames(current.label) === shortLabel);

  if (shortCollisions.length <= 1) return shortLabel;

  const firstLastLabel = getFirstAndLastName(option.label);
  const firstLastCollisions = options.filter((current) => getFirstAndLastName(current.label) === firstLastLabel);

  if (firstLastCollisions.length <= 1) return firstLastLabel;

  return option.label;
}

function getFinalQuizMessage(correctAnswers: number, totalQuestions: number) {
  if (correctAnswers === totalQuestions) {
    return 'Parabéns! Você acertou todas as perguntas.';
  }

  if (correctAnswers === 0) {
    return 'Que pena! Você não acertou nenhuma pergunta.';
  }

  if (correctAnswers >= Math.ceil(totalQuestions * 0.6)) {
    return `Quase lá... Você acertou ${correctAnswers}/${totalQuestions} perguntas.`;
  }

  return `Ah... Você acertou somente ${correctAnswers}/${totalQuestions} das perguntas.`;
}

export function CuriosidadesQuizSection({
  pessoas,
  relacionamentos,
  loading,
  error,
  className = '',
}: CuriosidadesQuizSectionProps) {
  const questions = useMemo(
    () => adjustQuizQuestions(buildCuriosityQuizQuestions(pessoas, relacionamentos), pessoas),
    [pessoas, relacionamentos]
  );
  const quizQuestions = useMemo(() => questions.slice(0, QUIZ_QUESTION_LIMIT), [questions]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = completed ? null : quizQuestions[questionIndex] ?? null;
  const answeredCorrectly = Boolean(currentQuestion && selectedOptionId === currentQuestion.answerId);
  const hasAnswered = Boolean(selectedOptionId);
  const totalQuestions = quizQuestions.length;

  useEffect(() => {
    setQuestionIndex(0);
    setSelectedOptionId(null);
    setCorrectAnswerCount(0);
    setCompleted(false);
  }, [quizQuestions]);

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion || hasAnswered) return;

    setSelectedOptionId(optionId);
    if (optionId === currentQuestion.answerId) {
      setCorrectAnswerCount((current) => current + 1);
    }
  };

  const goNext = () => {
    if (questionIndex >= totalQuestions - 1) {
      setCompleted(true);
      return;
    }

    setSelectedOptionId(null);
    setQuestionIndex((current) => current + 1);
  };

  const resetQuiz = () => {
    setQuestionIndex(0);
    setSelectedOptionId(null);
    setCorrectAnswerCount(0);
    setCompleted(false);
  };

  return (
    <section className={`${curiositySectionCardClassName} ${className}`}>
      <style>{`
        @keyframes curiosidadesQuizResultIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.98); }
          70% { opacity: 1; transform: translateY(-2px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

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

      {!error && !loading && !completed && !currentQuestion && (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Ainda não há dados suficientes para montar perguntas. Cadastre pelo menos quatro familiares com datas, cidades ou profissões.
        </div>
      )}

      {!error && !loading && completed && totalQuestions > 0 && (
        <div className="mt-5">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                Resultado
              </p>
              <div className="flex shrink-0 items-center gap-1" aria-label={`${totalQuestions} perguntas concluídas`}>
                {quizQuestions.map((question) => (
                  <span key={question.id} className="h-2 w-6 rounded-full bg-blue-600" />
                ))}
              </div>
            </div>

            <h3 className="mt-3 text-lg font-bold leading-7 text-gray-950">
              Fim do teste
            </h3>
          </div>

          <div className="mt-4 flex min-h-[340px] animate-[curiosidadesQuizResultIn_320ms_ease-out] flex-col items-center justify-center rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm sm:min-h-[360px]">
            <CheckCircle2 className="h-12 w-12 text-blue-700" />
            <p className="mt-4 max-w-md text-xl font-black leading-8 text-gray-950">
              {getFinalQuizMessage(correctAnswerCount, totalQuestions)}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Placar final: {correctAnswerCount}/{totalQuestions}
            </p>
            <button
              type="button"
              onClick={resetQuiz}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              <RotateCcw className="h-4 w-4" />
              Refazer teste
            </button>
          </div>
        </div>
      )}

      {!error && !loading && currentQuestion && (
        <div className="mt-5">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                {questionIndex + 1}/{totalQuestions}
              </p>
              <div className="flex shrink-0 items-center gap-1" aria-label={`Pergunta ${questionIndex + 1} de ${totalQuestions}`}>
                {quizQuestions.map((question, index) => (
                  <span
                    key={question.id}
                    className={[
                      'h-2 rounded-full transition-all',
                      index === questionIndex ? 'w-6 bg-blue-600' : 'w-2 bg-blue-200',
                    ].join(' ')}
                  />
                ))}
              </div>
            </div>

            <h3 className="mt-3 text-lg font-bold leading-7 text-gray-950">
              {currentQuestion.prompt}
            </h3>
          </div>

          {!hasAnswered ? (
            <div className="curiosidades-quiz-options-grid mt-4 grid min-h-[340px] auto-rows-fr gap-3 sm:min-h-[360px] sm:grid-cols-2">
              {currentQuestion.options.map((option) => {
                const optionLabel = getUniqueOptionLabel(option, currentQuestion.options);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className="group flex min-h-24 w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50 sm:min-h-28 sm:px-5 sm:py-5"
                  >
                    {option.imageUrl ? (
                      <img src={option.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14" />
                    ) : (
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-700 transition group-hover:bg-white sm:h-14 sm:w-14">
                        {getInitials(optionLabel)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 whitespace-normal break-words text-base font-bold leading-snug text-gray-900" title={option.label}>
                      {optionLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              key={`${currentQuestion.id}-${selectedOptionId}`}
              className={[
                'mt-4 flex min-h-[340px] animate-[curiosidadesQuizResultIn_320ms_ease-out] flex-col justify-center rounded-2xl border p-5 shadow-sm sm:min-h-[360px] sm:p-6',
                answeredCorrectly ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50',
              ].join(' ')}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <span className={[
                  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm',
                  answeredCorrectly ? 'text-green-700' : 'text-red-700',
                ].join(' ')}>
                  {answeredCorrectly ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-black leading-7 text-gray-950">
                    {answeredCorrectly ? 'Resposta correta.' : 'Não foi desta vez.'}
                  </p>
                  {!answeredCorrectly && (
                    <p className="mt-1 text-sm font-bold leading-6 text-gray-900">
                      Resposta correta: {currentQuestion.answerLabel}.
                    </p>
                  )}
                  <p className="mt-3 text-sm leading-6 text-gray-700">{currentQuestion.explanation}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={goNext}
                className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto sm:self-start"
              >
                {questionIndex >= totalQuestions - 1 ? 'Ver resultado' : 'Próxima pergunta'}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
