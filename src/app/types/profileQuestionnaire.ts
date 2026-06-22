import type { ComponentType } from 'react';

export type ProfileQuestionnaireTone =
  | 'afetivo'
  | 'simples'
  | 'divertido'
  | 'elegante'
  | 'nostalgico'
  | 'inspirador'
  | 'familiar'
  | 'emocional'
  | 'leve'
  | 'formal';

export type ProfileQuestionnaireBadgeCategory =
  | 'personalidade'
  | 'familia'
  | 'trabalho'
  | 'lugares'
  | 'momentos'
  | 'hobbies'
  | 'marcas';

export type ProfileQuestionnaireToneOption = {
  id: ProfileQuestionnaireTone;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export type ProfileQuestionnaireSelectableOption = {
  id: string;
  label: string;
  category: ProfileQuestionnaireBadgeCategory;
  icon?: ComponentType<{ className?: string }>;
};

export type ProfileQuestionnaireBadgeGroup = {
  id: ProfileQuestionnaireBadgeCategory;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  badges: ProfileQuestionnaireSelectableOption[];
};

export type ProfileQuestionnaireQuestion = {
  id: string;
  question: string;
};

export type ProfileQuestionnaireAnswer = ProfileQuestionnaireQuestion & {
  answer: string;
};

export type ProfileQuestionnairePersistedPayload = {
  tone?: ProfileQuestionnaireTone | null;
  selectedBadges?: ProfileQuestionnaireSelectableOption[] | string[] | null;
  customTraits?: string | null;
  generatedQuestions?: ProfileQuestionnaireAnswer[] | null;
  answers?: Record<string, string> | ProfileQuestionnaireAnswer[] | null;
  memorialMode?: boolean | null;
  lastGeneratedHash?: string | null;
};

export type NormalizedProfileQuestionnairePayload = {
  tone: ProfileQuestionnaireTone | null;
  selectedBadges: ProfileQuestionnaireSelectableOption[];
  customTraits: string;
  generatedQuestions: ProfileQuestionnaireAnswer[];
  answers: Record<string, string>;
  memorialMode: boolean;
  lastGeneratedHash: string | null;
};

export type ProfileQuestionnaireGenerationPayload = {
  tone: ProfileQuestionnaireTone | null;
  selectedBadges: string[];
  customTraits: string;
  answers: ProfileQuestionnaireAnswer[];
  memorialMode: boolean;
};

export type PersonProfileQuestionnaireAnswers = NormalizedProfileQuestionnairePayload & {
  id: string;
  pessoaId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
};
