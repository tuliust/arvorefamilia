import { supabase } from '../lib/supabaseClient';
import type {
  NormalizedProfileQuestionnairePayload,
  PersonProfileQuestionnaireAnswers,
  ProfileQuestionnaireAnswer,
  ProfileQuestionnaireGenerationPayload,
  ProfileQuestionnairePersistedPayload,
  ProfileQuestionnaireSelectableOption,
  ProfileQuestionnaireTone,
} from '../types/profileQuestionnaire';

const PROFILE_QUESTIONNAIRE_TABLE = 'person_profile_questionnaire_answers';

type ProfileQuestionnaireRow = {
  id: string;
  pessoa_id: string;
  user_id: string;
  tone?: string | null;
  selected_badges?: unknown;
  custom_traits?: string | null;
  generated_questions?: unknown;
  answers?: unknown;
  memorial_mode?: boolean | null;
  last_generated_hash?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ServiceResult<T> = {
  error?: string;
  data: T;
};

const VALID_TONES = new Set<ProfileQuestionnaireTone>([
  'afetivo',
  'simples',
  'divertido',
  'elegante',
  'nostalgico',
  'inspirador',
  'familiar',
  'emocional',
  'leve',
  'formal',
]);

function isProfileQuestionnaireTone(value: unknown): value is ProfileQuestionnaireTone {
  return typeof value === 'string' && VALID_TONES.has(value as ProfileQuestionnaireTone);
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBadge(value: unknown): ProfileQuestionnaireSelectableOption | null {
  if (typeof value === 'string') {
    const label = value.trim();
    return label ? { id: label, label, category: 'marcas' } : null;
  }

  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const id = normalizeString(record.id);
  const label = normalizeString(record.label);
  const category = record.category;

  if (!id || !label || typeof category !== 'string') return null;
  if (!['personalidade', 'familia', 'trabalho', 'lugares', 'momentos', 'hobbies', 'marcas'].includes(category)) return null;

  return {
    id,
    label,
    category: category as ProfileQuestionnaireSelectableOption['category'],
  };
}

function normalizeBadges(value: unknown): ProfileQuestionnaireSelectableOption[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  return value.reduce<ProfileQuestionnaireSelectableOption[]>((badges, item) => {
    const badge = normalizeBadge(item);
    if (!badge || seen.has(badge.id)) return badges;

    seen.add(badge.id);
    badges.push(badge);
    return badges;
  }, []);
}

function normalizeQuestion(value: unknown): ProfileQuestionnaireAnswer | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const id = normalizeString(record.id);
  const question = normalizeString(record.question);
  const answer = normalizeString(record.answer);

  if (!id || !question) return null;
  return { id, question, answer };
}

function normalizeGeneratedQuestions(value: unknown): ProfileQuestionnaireAnswer[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  return value.reduce<ProfileQuestionnaireAnswer[]>((questions, item) => {
    const question = normalizeQuestion(item);
    if (!question || seen.has(question.id)) return questions;

    seen.add(question.id);
    questions.push(question);
    return questions;
  }, []);
}

function normalizeAnswers(value: unknown): Record<string, string> {
  if (Array.isArray(value)) {
    return value.reduce<Record<string, string>>((answers, item) => {
      const question = normalizeQuestion(item);
      if (question && question.answer) {
        answers[question.id] = question.answer;
      }
      return answers;
    }, {});
  }

  if (!value || typeof value !== 'object') return {};

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>((answers, [key, answer]) => {
    const id = normalizeString(key);
    const normalizedAnswer = normalizeString(answer);

    if (id && normalizedAnswer) {
      answers[id] = normalizedAnswer;
    }

    return answers;
  }, {});
}

export function normalizeProfileQuestionnairePayload(
  payload: ProfileQuestionnairePersistedPayload,
): NormalizedProfileQuestionnairePayload {
  const tone = isProfileQuestionnaireTone(payload.tone) ? payload.tone : null;
  const generatedQuestions = normalizeGeneratedQuestions(payload.generatedQuestions);
  const answers = normalizeAnswers(payload.answers);

  return {
    tone,
    selectedBadges: normalizeBadges(payload.selectedBadges),
    customTraits: normalizeString(payload.customTraits),
    generatedQuestions: generatedQuestions.map((question) => ({
      ...question,
      answer: answers[question.id] ?? question.answer,
    })),
    answers,
    memorialMode: payload.memorialMode === true || tone === 'nostalgico',
    lastGeneratedHash: normalizeString(payload.lastGeneratedHash) || null,
  };
}

export function buildProfileQuestionnaireGenerationPayload(
  payload: ProfileQuestionnairePersistedPayload,
): ProfileQuestionnaireGenerationPayload {
  const normalized = normalizeProfileQuestionnairePayload(payload);

  return {
    tone: normalized.tone,
    selectedBadges: normalized.selectedBadges.map((badge) => badge.label),
    customTraits: normalized.customTraits,
    answers: normalized.generatedQuestions.filter((question) => question.answer.trim()),
    memorialMode: normalized.memorialMode,
  };
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

export function buildProfileQuestionnaireHash(payload: ProfileQuestionnairePersistedPayload) {
  const normalized = normalizeProfileQuestionnairePayload(payload);
  const source = stableStringify({
    tone: normalized.tone,
    selectedBadges: normalized.selectedBadges.map((badge) => ({
      id: badge.id,
      label: badge.label,
      category: badge.category,
    })),
    customTraits: normalized.customTraits,
    generatedQuestions: normalized.generatedQuestions.map((question) => ({
      id: question.id,
      question: question.question,
    })),
    answers: normalized.answers,
    memorialMode: normalized.memorialMode,
  });

  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function toServiceRecord(row: ProfileQuestionnaireRow): PersonProfileQuestionnaireAnswers {
  const normalized = normalizeProfileQuestionnairePayload({
    tone: row.tone,
    selectedBadges: row.selected_badges,
    customTraits: row.custom_traits,
    generatedQuestions: row.generated_questions,
    answers: row.answers,
    memorialMode: row.memorial_mode,
    lastGeneratedHash: row.last_generated_hash,
  });

  return {
    ...normalized,
    id: row.id,
    pessoaId: row.pessoa_id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getAuthenticatedUserId() {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user?.id) {
    return { error: authError?.message || 'Usuário autenticado não encontrado.', userId: null as string | null };
  }

  return { error: undefined, userId: authData.user.id };
}

export async function getProfileQuestionnaireAnswers(
  pessoaId: string,
): Promise<ServiceResult<PersonProfileQuestionnaireAnswers | null>> {
  const auth = await getAuthenticatedUserId();

  if (auth.error || !auth.userId) {
    return { error: auth.error, data: null };
  }

  const { data, error } = await supabase
    .from(PROFILE_QUESTIONNAIRE_TABLE)
    .select('*')
    .eq('pessoa_id', pessoaId)
    .eq('user_id', auth.userId)
    .maybeSingle();

  if (error) {
    return { error: error.message, data: null };
  }

  return {
    error: undefined,
    data: data ? toServiceRecord(data as ProfileQuestionnaireRow) : null,
  };
}

export async function upsertProfileQuestionnaireAnswers(
  pessoaId: string,
  payload: ProfileQuestionnairePersistedPayload,
): Promise<ServiceResult<PersonProfileQuestionnaireAnswers | null>> {
  const auth = await getAuthenticatedUserId();

  if (auth.error || !auth.userId) {
    return { error: auth.error, data: null };
  }

  const normalized = normalizeProfileQuestionnairePayload(payload);
  // `lastGeneratedHash` is set only after a successful IA generation. Normal questionnaire
  // saves must not mark the current answers as already generated.
  const lastGeneratedHash = normalized.lastGeneratedHash;

  const { data, error } = await supabase
    .from(PROFILE_QUESTIONNAIRE_TABLE)
    .upsert({
      pessoa_id: pessoaId,
      user_id: auth.userId,
      tone: normalized.tone,
      selected_badges: normalized.selectedBadges.map((badge) => ({
        id: badge.id,
        label: badge.label,
        category: badge.category,
      })),
      custom_traits: normalized.customTraits || null,
      generated_questions: normalized.generatedQuestions,
      answers: normalized.answers,
      memorial_mode: normalized.memorialMode,
      last_generated_hash: lastGeneratedHash,
    }, {
      onConflict: 'pessoa_id,user_id',
    })
    .select('*')
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return {
    error: undefined,
    data: data ? toServiceRecord(data as ProfileQuestionnaireRow) : null,
  };
}
