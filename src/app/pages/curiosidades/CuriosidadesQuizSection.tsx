import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, CheckCircle2, XCircle } from 'lucide-react';
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
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                {questionIndex + 1}/{questions.length}
              </p>
              <div className="flex shrink-0 items-center gap-1" aria-label={`Pergunta ${questionIndex + 1} de ${questions.length}`}>
                {questions.map((question, index) => (
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

          <div className="curiosidades-quiz-options-grid mt-4 grid gap-2 sm:grid-cols-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrect = hasAnswered && option.id === currentQuestion.answerId;
              const isWrong = hasAnswered && isSelected && option.id !== currentQuestion.answerId;
              const optionLabel = getUniqueOptionLabel(option, currentQuestion.options);

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
                      {getInitials(optionLabel)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold" title={option.label}>{optionLabel}</span>
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
