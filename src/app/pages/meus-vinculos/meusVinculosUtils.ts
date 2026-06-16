import { Pessoa } from '../../types';
import {
  ProfileControlRequestReason,
  RelationshipGroupKey,
  RelationshipReviewStatus,
} from './types';
import { isPersonDeceased } from '../../utils/personFields';

const PROFILE_CONTROL_REASON_LABELS: Record<ProfileControlRequestReason, string> = {
  deceased: 'É uma pessoa falecida da família',
  minor_or_dependent: 'É uma criança ou dependente sob minha responsabilidade',
  close_family: 'Sou familiar próximo e quero ajudar a manter os dados atualizados',
  other: 'Outro motivo',
};

export const PROFILE_CONTROL_REASON_OPTIONS: Array<{
  value: ProfileControlRequestReason;
  label: string;
}> = [
  { value: 'deceased', label: PROFILE_CONTROL_REASON_LABELS.deceased },
  { value: 'minor_or_dependent', label: PROFILE_CONTROL_REASON_LABELS.minor_or_dependent },
  { value: 'close_family', label: PROFILE_CONTROL_REASON_LABELS.close_family },
  { value: 'other', label: PROFILE_CONTROL_REASON_LABELS.other },
];

export function formatCount(count: number, singular: string, plural: string) {
  if (count === 0) return `Nenhum ${singular}`;
  if (count === 1) return `1 ${singular}`;
  return `${count} ${plural}`;
}

export function formatOptionalValue(value?: string | number | null) {
  const formatted = String(value ?? '').trim();
  return formatted || null;
}

export function getProfileControlRequestSummaryLabel(count: number) {
  if (count === 0) return 'Nenhuma solicitação de controle.';
  if (count === 1) return '1 perfil solicitado';
  return `${count} perfis solicitados`;
}

export function canRequestProfileControl(
  person: Pessoa,
  ownPersonId?: string,
  hasRequest = false,
  status: RelationshipReviewStatus = 'confirmed'
) {
  if (!person.id || !ownPersonId) return false;
  if (person.id === ownPersonId) return false;
  if (hasRequest) return false;
  if (status === 'removed_pending' || status === 'control_pending') return false;
  if (person.id.startsWith('local-')) return false;
  return true;
}

export function getPersonSecondaryDetails(person: Pessoa) {
  return [
    formatOptionalValue(person.data_nascimento) ? `Nascimento: ${formatOptionalValue(person.data_nascimento)}` : null,
    formatOptionalValue(person.local_nascimento || person.local_atual),
    isPersonDeceased(person) ? 'Falecido(a)' : null,
  ].filter(Boolean) as string[];
}

export function relationshipStatusHasPending(status: RelationshipReviewStatus) {
  return status === 'added_pending' || status === 'edited_pending' || status === 'removed_pending';
}

export function getRelationshipCardClassName(status: RelationshipReviewStatus) {
  if (status === 'control_pending') return 'border-blue-200 bg-blue-50';
  if (status === 'removed_pending') return 'border-red-200 bg-red-50';
  if (status === 'added_pending' || status === 'edited_pending') return 'border-amber-200 bg-amber-50';
  return 'border-gray-200 bg-white';
}

export function getRelationshipStatusBadgeConfig(status: RelationshipReviewStatus) {
  const config: Record<RelationshipReviewStatus, { label: string; className: string }> = {
    confirmed: {
      label: 'Cadastrado',
      className: 'border-gray-200 bg-gray-100 text-gray-700',
    },
    added_pending: {
      label: 'Em análise',
      className: 'border-amber-200 bg-amber-100 text-amber-800',
    },
    edited_pending: {
      label: 'Em análise',
      className: 'border-amber-200 bg-amber-100 text-amber-800',
    },
    removed_pending: {
      label: 'Remoção em análise',
      className: 'border-red-200 bg-red-100 text-red-800',
    },
    control_pending: {
      label: 'Controle em análise',
      className: 'border-blue-200 bg-blue-100 text-blue-800',
    },
  };

  return config[status];
}

export function getRelationshipCardLabel(group: RelationshipGroupKey, isMother = false) {
  if (group === 'pais') return isMother ? 'Mãe' : 'Pai';
  if (group === 'filhos') return 'Filho(a)';
  if (group === 'conjuges') return 'Cônjuge';
  return 'Irmão(ã)';
}

export function getRelationshipOverviewGroupLabel(group: RelationshipGroupKey) {
  if (group === 'pais') return 'Pais';
  if (group === 'filhos') return 'Filhos';
  if (group === 'conjuges') return 'Cônjuges';
  return 'Irmãos';
}

export function getRelationshipControlNoticeText() {
  return 'Solicitações de controle são avaliadas para proteger a privacidade e a integridade da árvore familiar.';
}

export function getRelationshipReviewNoticeText() {
  return 'Alterações em vínculos familiares passam por revisão antes de aparecerem definitivamente na árvore.';
}

export function getRelationshipChangeNoticeText(hasChanges: boolean) {
  return hasChanges
    ? 'Suas alterações serão enviadas para análise dos administradores da árvore.'
    : 'Suas solicitações serão enviadas para análise dos administradores da árvore.';
}

export function getRelationshipFinalButtonLabel(hasChanges: boolean, hasControlRequests: boolean) {
  if (!hasChanges && !hasControlRequests) return 'Confirmar vínculos e continuar';
  if (!hasChanges && hasControlRequests) return 'Enviar solicitações e continuar';
  return 'Enviar alterações e continuar';
}
