import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Baby,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Heart,
  MapPin,
  Plus,
  Save,
  Trash2,
  Undo2,
  UserRound,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  HEADER_ACTION_ICONS,
  MemberPageHeader,
} from '../components/layout/MemberPageHeader';
import { MemberOnboardingSteps } from '../components/member/MemberOnboardingSteps';
import {
  createEmptyMarriageDetails,
  MarriageDetailsForm,
  normalizeMarriageDetails,
} from '../components/relationships/MarriageDetailsEditor';
import { getInitials, isPersonDeceased } from '../utils/personFields';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { adicionarPessoa, obterRelacionamentosDaPessoa, obterTodosRelacionamentos } from '../services/dataService';
import {
  CreateRelationshipChangeRequestInput,
  createRelationshipChangeRequest,
  findPendingDuplicateRelationshipChangeRequest,
} from '../services/relationshipChangeRequestService';
import {
  getPrimaryLinkedPersonWithPessoa,
  resolveFirstAccessLinkForUser,
  UserPersonLinkRecord,
} from '../services/memberProfileService';
import { Pessoa, Relacionamento } from '../types';
import { normalizeLocationByMode, validateLocationByMode } from '../utils/personFields';
import { cn } from '../lib/utils';

type RelationshipGroups = {
  pais: Pessoa[];
  maes: Pessoa[];
  conjuges: Pessoa[];
  filhos: Pessoa[];
  irmaos: Pessoa[];
};

type RelationshipGroupKey = 'pais' | 'filhos' | 'conjuges' | 'irmaos';

type RelationshipReviewStatus =
  | 'confirmed'
  | 'added_pending'
  | 'edited_pending'
  | 'removed_pending';

type RemovedRelationshipIds = Record<RelationshipGroupKey, string[]>;

type ProfileControlRequestReason =
  | 'deceased'
  | 'minor_or_dependent'
  | 'close_family'
  | 'other';

type ProfileControlRequestDraft = {
  pessoaId: string;
  pessoaNome: string;
  reason: ProfileControlRequestReason;
  relationshipDescription: string;
  createdAt: string;
};

type AddRelativeForm = {
  nome_completo: string;
  data_nascimento: string;
  local_nascimento: string;
  local_nascimento_exterior: boolean;
  parentRole: 'pai' | 'mae';
};

type AddDialogState = {
  group: RelationshipGroupKey;
  title: string;
} | null;

type MarriageDetails = Record<string, MarriageDetailsForm>;

type MeusVinculosDraft = {
  relationships: RelationshipGroups;
  marriageDetails: MarriageDetails;
  localRelationshipRoles: Record<string, 'pai' | 'mae'>;
  childOtherParent: Record<string, string>;
  spouseExpanded: Record<string, boolean>;
  removedRelationshipIds: RemovedRelationshipIds;
  hasLocalRelationshipChanges: boolean;
  hasPendingRelationshipRequest: boolean;
};

const EMPTY_GROUPS: RelationshipGroups = {
  pais: [],
  maes: [],
  conjuges: [],
  filhos: [],
  irmaos: [],
};

const EMPTY_REMOVED_RELATIONSHIP_IDS: RemovedRelationshipIds = {
  pais: [],
  filhos: [],
  conjuges: [],
  irmaos: [],
};

const PROFILE_CONTROL_REASON_LABELS: Record<ProfileControlRequestReason, string> = {
  deceased: 'É uma pessoa falecida da família',
  minor_or_dependent: 'É uma criança ou dependente sob minha responsabilidade',
  close_family: 'Sou familiar próximo e quero ajudar a manter os dados atualizados',
  other: 'Outro motivo',
};

function uniquePeople(people: Pessoa[]) {
  return Array.from(new Map(people.map((person) => [person.id, person])).values());
}

function createLocalPerson(form: AddRelativeForm): Pessoa {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    nome_completo: form.nome_completo.trim(),
    data_nascimento: form.data_nascimento.trim() || undefined,
    local_nascimento: normalizeLocationByMode(form.local_nascimento, {
      international: form.local_nascimento_exterior,
    }) || undefined,
    local_nascimento_exterior: form.local_nascimento_exterior,
    humano_ou_pet: 'Humano',
  };
}

function matchesRelationshipPair(rel: Relacionamento, originId: string, destinationId: string) {
  return rel.pessoa_origem_id === originId && rel.pessoa_destino_id === destinationId;
}

function findRelationshipBetween(
  relacionamentos: Relacionamento[],
  baseId: string,
  relatedId: string,
  acceptedTypes: Relacionamento['tipo_relacionamento'][]
) {
  return relacionamentos.find((rel) => (
    acceptedTypes.includes(rel.tipo_relacionamento) &&
    (matchesRelationshipPair(rel, baseId, relatedId) || matchesRelationshipPair(rel, relatedId, baseId))
  ));
}

function getMeusDadosDraftKey(userId: string, pessoaId: string) {
  return `meus-dados-draft:${userId}:${pessoaId}`;
}

function readMeusDadosDraft(key: string): { pendingAvatarDataUrl?: string | null } | null {
  try {
    const rawDraft = window.sessionStorage.getItem(key);
    if (!rawDraft) return null;

    const draft = JSON.parse(rawDraft) as { pendingAvatarDataUrl?: string | null };
    return { pendingAvatarDataUrl: draft.pendingAvatarDataUrl ?? null };
  } catch {
    return null;
  }
}

function getMeusVinculosDraftKey(userId: string, pessoaId: string) {
  return `meus-vinculos-draft:${userId}:${pessoaId}`;
}

function readMeusVinculosDraft(key: string): MeusVinculosDraft | null {
  try {
    const rawDraft = window.sessionStorage.getItem(key);
    if (!rawDraft) return null;

    const draft = JSON.parse(rawDraft) as Partial<MeusVinculosDraft>;
    if (!draft.relationships) return null;

    return {
      relationships: {
        pais: Array.isArray(draft.relationships.pais) ? draft.relationships.pais : [],
        maes: Array.isArray(draft.relationships.maes) ? draft.relationships.maes : [],
        conjuges: Array.isArray(draft.relationships.conjuges) ? draft.relationships.conjuges : [],
        filhos: Array.isArray(draft.relationships.filhos) ? draft.relationships.filhos : [],
        irmaos: Array.isArray(draft.relationships.irmaos) ? draft.relationships.irmaos : [],
      },
      marriageDetails: Object.fromEntries(
        Object.entries(draft.marriageDetails ?? {}).map(([key, value]) => [key, normalizeMarriageDetails(value)])
      ),
      localRelationshipRoles: draft.localRelationshipRoles ?? {},
      childOtherParent: draft.childOtherParent ?? {},
      spouseExpanded: draft.spouseExpanded ?? {},
      removedRelationshipIds: {
        pais: Array.isArray(draft.removedRelationshipIds?.pais) ? draft.removedRelationshipIds.pais : [],
        filhos: Array.isArray(draft.removedRelationshipIds?.filhos) ? draft.removedRelationshipIds.filhos : [],
        conjuges: Array.isArray(draft.removedRelationshipIds?.conjuges) ? draft.removedRelationshipIds.conjuges : [],
        irmaos: Array.isArray(draft.removedRelationshipIds?.irmaos) ? draft.removedRelationshipIds.irmaos : [],
      },
      hasLocalRelationshipChanges: Boolean(draft.hasLocalRelationshipChanges),
      hasPendingRelationshipRequest: Boolean(draft.hasPendingRelationshipRequest),
    };
  } catch {
    return null;
  }
}

function writeMeusVinculosDraft(key: string, draft: MeusVinculosDraft) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Rascunho é auxiliar; falha de storage não deve bloquear edição.
  }
}

function formatCount(count: number, singular: string, plural: string) {
  if (count === 0) return `Nenhum ${singular}`;
  if (count === 1) return `1 ${singular}`;
  return `${count} ${plural}`;
}

function formatOptionalValue(value?: string | number | null) {
  const formatted = String(value ?? '').trim();
  return formatted || null;
}

function getProfileControlRequestSummaryLabel(count: number) {
  if (count === 0) return 'Nenhuma solicitação de controle.';
  if (count === 1) return '1 perfil solicitado';
  return `${count} perfis solicitados`;
}

function canRequestProfileControl(person: Pessoa, ownPersonId?: string, hasRequest = false, status: RelationshipReviewStatus = 'confirmed') {
  if (!person.id || !ownPersonId) return false;
  if (person.id === ownPersonId) return false;
  if (hasRequest) return false;
  if (status === 'removed_pending') return false;
  if (person.id.startsWith('local-')) return false;
  return true;
}

function getPersonSecondaryDetails(person: Pessoa) {
  return [
    formatOptionalValue(person.data_nascimento) ? `Nascimento: ${formatOptionalValue(person.data_nascimento)}` : null,
    formatOptionalValue(person.local_nascimento),
    isPersonDeceased(person) ? 'Falecido(a)' : null,
  ].filter(Boolean) as string[];
}

function relationshipStatusHasPending(status: RelationshipReviewStatus) {
  return status === 'added_pending' || status === 'edited_pending' || status === 'removed_pending';
}

function getRelationshipCardClassName(status: RelationshipReviewStatus) {
  if (status === 'removed_pending') return 'border-red-200 bg-red-50';
  if (status === 'added_pending' || status === 'edited_pending') return 'border-amber-200 bg-amber-50';
  return 'border-gray-200 bg-white';
}

function getRelationshipCardClassNameWithControl(status: RelationshipReviewStatus, hasControlRequest: boolean) {
  if (hasControlRequest) return 'border-blue-200 bg-blue-50';
  return getRelationshipCardClassName(status);
}

function RelationshipStatusBadge({ status }: { status: RelationshipReviewStatus }) {
  const config = {
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
  } satisfies Record<RelationshipReviewStatus, { label: string; className: string }>;

  return (
    <span className={cn('inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold', config[status].className)}>
      {config[status].label}
    </span>
  );
}

function PersonAvatar({ person, className = 'h-12 w-12', imageSrc }: { person: Pessoa; className?: string; imageSrc?: string | null }) {
  const photo = String(imageSrc || person.foto_principal_url || '').trim();

  return (
    <div className={cn('flex shrink-0 overflow-hidden rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100', className)}>
      {photo ? (
        <img src={photo} alt={person.nome_completo} className="h-full w-full object-cover" />
      ) : (
        <span className="inline-flex h-full w-full items-center justify-center text-sm font-semibold">
          {getInitials(person.nome_completo)}
        </span>
      )}
    </div>
  );
}

const RELATIONSHIP_GROUP_META: Record<RelationshipGroupKey, {
  title: string;
  summaryTitle: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  addLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  pais: {
    title: 'Pais',
    summaryTitle: 'Pais',
    description: 'Confirme pai e mãe cadastrados para sua árvore.',
    emptyTitle: 'Nenhum pai ou mãe cadastrado',
    emptyDescription: 'Adicione pai ou mãe para completar a geração anterior da árvore.',
    addLabel: 'Adicionar pai ou mãe',
    icon: UserRound,
  },
  filhos: {
    title: 'Filhos',
    summaryTitle: 'Filhos',
    description: 'Confirme seus filhos e, se souber, informe o outro pai/mãe.',
    emptyTitle: 'Nenhum filho cadastrado',
    emptyDescription: 'Adicione filhos para conectar a próxima geração.',
    addLabel: 'Adicionar filho',
    icon: Baby,
  },
  conjuges: {
    title: 'Cônjuges',
    summaryTitle: 'Cônjuges',
    description: 'Registre relacionamentos importantes e detalhes de casamento ou separação.',
    emptyTitle: 'Nenhum cônjuge cadastrado',
    emptyDescription: 'Adicione cônjuges para registrar relacionamentos importantes.',
    addLabel: 'Adicionar cônjuge',
    icon: Heart,
  },
  irmaos: {
    title: 'Irmãos',
    summaryTitle: 'Irmãos',
    description: 'Complete os vínculos laterais com irmãos e irmãs.',
    emptyTitle: 'Nenhum irmão cadastrado',
    emptyDescription: 'Adicione irmãos para completar os vínculos laterais da família.',
    addLabel: 'Adicionar irmão',
    icon: Users,
  },
};

function getRelationshipLabel(group: RelationshipGroupKey, person: Pessoa, isMother: boolean) {
  if (group === 'pais') return isMother ? 'Mãe' : 'Pai';
  if (group === 'filhos') return 'Filho(a)';
  if (group === 'conjuges') return 'Cônjuge';
  return 'Irmão(ã)';
}

function RelationshipRelativeCard({
  group,
  person,
  status,
  hasControlRequest = false,
  ownPersonId,
  isMother = false,
  onRemove,
  onUndoRemove,
  onRequestControl,
  children,
}: {
  group: RelationshipGroupKey;
  person: Pessoa;
  status: RelationshipReviewStatus;
  hasControlRequest?: boolean;
  ownPersonId?: string;
  isMother?: boolean;
  onRemove: (personId: string) => void;
  onUndoRemove: (personId: string) => void;
  onRequestControl: (person: Pessoa) => void;
  children?: React.ReactNode;
}) {
  const secondaryDetails = getPersonSecondaryDetails(person);
  const isPendingRemoval = status === 'removed_pending';
  const isLocalAddition = status === 'added_pending';

  return (
    <article className={cn('min-w-0 rounded-xl border p-4 shadow-sm', getRelationshipCardClassNameWithControl(status, hasControlRequest))}>
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
        <PersonAvatar person={person} />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h4 className="min-w-0 break-words text-base font-semibold leading-snug text-gray-950">
                {person.nome_completo}
              </h4>
              <p className="mt-1 text-sm font-medium text-gray-600">
                {getRelationshipLabel(group, person, isMother)}
              </p>
            </div>
            {hasControlRequest ? (
              <span className="inline-flex shrink-0 items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                Controle em análise
              </span>
            ) : (
              <RelationshipStatusBadge status={status} />
            )}
          </div>

          {secondaryDetails.length > 0 && (
            <div className="flex min-w-0 flex-wrap gap-2 text-sm text-gray-600">
              {secondaryDetails.map((detail) => (
                <span key={detail} className="inline-flex max-w-full items-center gap-1 rounded-md bg-white/70 px-2 py-1 ring-1 ring-gray-200">
                  {detail.startsWith('Nascimento') ? <CalendarDays className="h-3.5 w-3.5 shrink-0" /> : <MapPin className="h-3.5 w-3.5 shrink-0" />}
                  <span className="min-w-0 break-words">{detail}</span>
                </span>
              ))}
            </div>
          )}

          {children}

          {status === 'added_pending' || status === 'edited_pending' ? (
            <p className="rounded-lg border border-amber-200 bg-amber-100/60 px-3 py-2 text-sm text-amber-900">
              Esta alteração será revisada antes de aparecer definitivamente na árvore.
            </p>
          ) : null}

          {isPendingRemoval && (
            <p className="rounded-lg border border-red-200 bg-red-100/70 px-3 py-2 text-sm text-red-900">
              Você solicitou a remoção deste vínculo. A alteração será avaliada antes de sair da árvore.
            </p>
          )}

          {hasControlRequest && !isPendingRemoval && (
            <p className="rounded-lg border border-blue-200 bg-blue-100/70 px-3 py-2 text-sm text-blue-900">
              Você solicitou permissão para administrar este perfil. A solicitação será avaliada antes de liberar edição.
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {isPendingRemoval ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-red-200 text-red-700 hover:bg-red-50 sm:w-auto"
                onClick={() => onUndoRemove(person.id)}
              >
                <Undo2 className="h-4 w-4" />
                Desfazer solicitação
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-red-700 hover:bg-red-50 sm:w-auto"
                onClick={() => onRemove(person.id)}
              >
                <Trash2 className="h-4 w-4" />
                {isLocalAddition ? 'Cancelar adição' : 'Solicitar remoção'}
              </Button>
            )}
            {canRequestProfileControl(person, ownPersonId, hasControlRequest, status) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 sm:w-auto"
                onClick={() => onRequestControl(person)}
              >
                Solicitar controle do perfil
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function RelationshipGroupSection({
  group,
  people,
  pendingCount,
  onAdd,
  onRemove,
  onUndoRemove,
  onRequestControl,
  getStatus,
  hasControlRequest,
  ownPersonId,
  isMother,
  children,
}: {
  group: RelationshipGroupKey;
  people: Pessoa[];
  pendingCount: number;
  onAdd: () => void;
  onRemove: (personId: string) => void;
  onUndoRemove: (personId: string) => void;
  onRequestControl: (person: Pessoa) => void;
  getStatus: (person: Pessoa) => RelationshipReviewStatus;
  hasControlRequest: (person: Pessoa) => boolean;
  ownPersonId?: string;
  isMother?: (person: Pessoa) => boolean;
  children?: (person: Pessoa, status: RelationshipReviewStatus) => React.ReactNode;
}) {
  const meta = RELATIONSHIP_GROUP_META[group];

  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <meta.icon className="h-5 w-5 shrink-0 text-blue-700" />
            <h3 className="min-w-0 break-words text-lg font-semibold text-gray-950">{meta.title}</h3>
            {pendingCount > 0 && (
              <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Em análise
              </span>
            )}
          </div>
          <p className="mt-1 break-words text-sm text-gray-600">{meta.description}</p>
        </div>
        <Button type="button" variant="outline" className="w-full shrink-0 sm:w-auto" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          {meta.addLabel}
        </Button>
      </div>

      {people.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
          <p className="font-semibold text-gray-900">{meta.emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-xl break-words text-sm text-gray-600">{meta.emptyDescription}</p>
          <Button type="button" variant="outline" className="mt-4 w-full sm:w-auto" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            {meta.addLabel}
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {people.map((person) => {
            const status = getStatus(person);
            return (
              <RelationshipRelativeCard
                key={`${group}-${person.id}-${status}`}
                group={group}
                person={person}
                status={status}
                hasControlRequest={hasControlRequest(person)}
                ownPersonId={ownPersonId}
                isMother={isMother?.(person) ?? false}
                onRemove={onRemove}
                onUndoRemove={onUndoRemove}
                onRequestControl={onRequestControl}
              >
                {children?.(person, status)}
              </RelationshipRelativeCard>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function MeusVinculos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [link, setLink] = useState<(UserPersonLinkRecord & { pessoa: Pessoa | null }) | null>(null);
  const [relationships, setRelationships] = useState<RelationshipGroups>(EMPTY_GROUPS);
  const [initialRelationships, setInitialRelationships] = useState<RelationshipGroups>(EMPTY_GROUPS);
  const [allRelacionamentos, setAllRelacionamentos] = useState<Relacionamento[]>([]);
  const [marriageDetails, setMarriageDetails] = useState<MarriageDetails>({});
  const [initialMarriageDetails, setInitialMarriageDetails] = useState<MarriageDetails>({});
  const [addDialog, setAddDialog] = useState<AddDialogState>(null);
  const [addForm, setAddForm] = useState<AddRelativeForm>({
    nome_completo: '',
    data_nascimento: '',
    local_nascimento: '',
    local_nascimento_exterior: false,
    parentRole: 'pai',
  });
  const [localRelationshipRoles, setLocalRelationshipRoles] = useState<Record<string, 'pai' | 'mae'>>({});
  const [childOtherParent, setChildOtherParent] = useState<Record<string, string>>({});
  const [spouseExpanded, setSpouseExpanded] = useState<Record<string, boolean>>({});
  const [removedRelationshipIds, setRemovedRelationshipIds] = useState<RemovedRelationshipIds>(EMPTY_REMOVED_RELATIONSHIP_IDS);
  const [hasLocalRelationshipChanges, setHasLocalRelationshipChanges] = useState(false);
  const [hasPendingRelationshipRequest, setHasPendingRelationshipRequest] = useState(false);
  // TODO: Persistir solicitação de controle de perfil quando o fluxo administrativo estiver disponível.
  const [controlRequestDialogOpen, setControlRequestDialogOpen] = useState(false);
  const [selectedControlPerson, setSelectedControlPerson] = useState<Pessoa | null>(null);
  const [controlRequestReason, setControlRequestReason] = useState<ProfileControlRequestReason>('deceased');
  const [controlRequestDescription, setControlRequestDescription] = useState('');
  const [controlRequestError, setControlRequestError] = useState<string | null>(null);
  const [profileControlRequests, setProfileControlRequests] = useState<ProfileControlRequestDraft[]>([]);
  const [pendingAvatarDataUrl, setPendingAvatarDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const draftHydratedRef = useRef(false);
  const draftDirtyRef = useRef(false);

  const pessoa = link?.pessoa;

  async function reloadRelationships(pessoaId: string) {
    const [nextRelationships, nextAllRelationships] = await Promise.all([
      obterRelacionamentosDaPessoa(pessoaId),
      obterTodosRelacionamentos(),
    ]);
    const nextMarriageDetails: MarriageDetails = {};
    uniquePeople(nextRelationships.conjuges).forEach((person) => {
      const rel = findRelationshipBetween(nextAllRelationships, pessoaId, person.id, ['conjuge']);
      const defaultActive = !isPersonDeceased({ ...pessoa, falecido: pessoa?.falecido }) && !isPersonDeceased(person);
      nextMarriageDetails[person.id] = {
        ...createEmptyMarriageDetails(),
        data_casamento: String(rel?.data_casamento ?? ''),
        local_casamento: String(rel?.local_casamento ?? ''),
        ativo: rel?.ativo ?? defaultActive,
        data_separacao: String(rel?.data_separacao ?? ''),
        local_separacao: String(rel?.local_separacao ?? ''),
      };
    });

    setAllRelacionamentos(nextAllRelationships);
    setRelationships(nextRelationships);
    setInitialRelationships(nextRelationships);
    setMarriageDetails(nextMarriageDetails);
    setInitialMarriageDetails(nextMarriageDetails);
    setRemovedRelationshipIds(EMPTY_REMOVED_RELATIONSHIP_IDS);

    return {
      relationships: nextRelationships,
      allRelacionamentos: nextAllRelationships,
      marriageDetails: nextMarriageDetails,
    };
  }

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user) return;

      setLoading(true);
      draftHydratedRef.current = false;
      draftDirtyRef.current = false;
      await resolveFirstAccessLinkForUser(user);
      const { data, error } = await getPrimaryLinkedPersonWithPessoa(user.id);

      if (!mounted) return;

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      setLink(data);

      if (data?.pessoa?.id) {
        const draftKey = getMeusVinculosDraftKey(user.id, data.pessoa.id);
        const draft = readMeusVinculosDraft(draftKey);
        await reloadRelationships(data.pessoa.id);
        setProfileControlRequests([]);
        setSelectedControlPerson(null);
        setControlRequestReason('deceased');
        setControlRequestDescription('');
        setControlRequestError(null);
        setControlRequestDialogOpen(false);

        const dadosDraft = readMeusDadosDraft(getMeusDadosDraftKey(user.id, data.pessoa.id));
        if (mounted) setPendingAvatarDataUrl(dadosDraft?.pendingAvatarDataUrl ?? null);

        if (mounted && draft) {
          setRelationships(draft.relationships);
          setMarriageDetails(draft.marriageDetails);
          setLocalRelationshipRoles(draft.localRelationshipRoles);
          setChildOtherParent(draft.childOtherParent);
          setSpouseExpanded(draft.spouseExpanded);
          setRemovedRelationshipIds(draft.removedRelationshipIds);
          setHasLocalRelationshipChanges(draft.hasLocalRelationshipChanges);
          setHasPendingRelationshipRequest(draft.hasPendingRelationshipRequest);
          draftDirtyRef.current = true;
        }
      }

      if (mounted) {
        draftHydratedRef.current = true;
        setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user?.id || !pessoa?.id || !draftHydratedRef.current || !draftDirtyRef.current) return;

    writeMeusVinculosDraft(getMeusVinculosDraftKey(user.id, pessoa.id), {
      relationships,
      marriageDetails,
      localRelationshipRoles,
      childOtherParent,
      spouseExpanded,
      removedRelationshipIds,
      hasLocalRelationshipChanges,
      hasPendingRelationshipRequest,
    });
  }, [
    childOtherParent,
    hasLocalRelationshipChanges,
    hasPendingRelationshipRequest,
    localRelationshipRoles,
    marriageDetails,
    pessoa?.id,
    removedRelationshipIds,
    relationships,
    spouseExpanded,
    user?.id,
  ]);

  const markDraftDirty = () => {
    draftDirtyRef.current = true;
  };

  const openAddDialog = (group: RelationshipGroupKey, title: string) => {
    setAddDialog({ group, title });
    setAddForm({
      nome_completo: '',
      data_nascimento: '',
      local_nascimento: '',
      local_nascimento_exterior: false,
      parentRole: 'pai',
    });
  };

  const closeAddDialog = () => {
    setAddDialog(null);
    setAddForm({
      nome_completo: '',
      data_nascimento: '',
      local_nascimento: '',
      local_nascimento_exterior: false,
      parentRole: 'pai',
    });
  };

  const addRelative = () => {
    if (!addDialog) return;
    if (!addForm.nome_completo.trim()) {
      toast.error('Informe o nome completo do familiar.');
      return;
    }
    const birthLocationError = validateLocationByMode(addForm.local_nascimento, {
      international: addForm.local_nascimento_exterior,
    });
    if (birthLocationError) {
      toast.error(birthLocationError);
      return;
    }

    markDraftDirty();
    const person = createLocalPerson(addForm);

    setRelationships((current) => {
      if (addDialog.group === 'pais' && addForm.parentRole === 'mae') {
        return {
          ...current,
          maes: uniquePeople([...current.maes, person]),
        };
      }

      return {
        ...current,
        [addDialog.group]: uniquePeople([...current[addDialog.group], person]),
      };
    });
    setLocalRelationshipRoles((current) => ({
      ...current,
      [person.id]: addForm.parentRole,
    }));
    setRemovedRelationshipIds((current) => ({
      ...current,
      [addDialog.group]: current[addDialog.group].filter((id) => id !== person.id),
    }));

    if (addDialog.group === 'conjuges') {
      const defaultActive = !isPersonDeceased({ ...pessoa, falecido: pessoa?.falecido }) && !isPersonDeceased(person);
      setMarriageDetails((current) => ({
        ...current,
        [person.id]: {
          ...createEmptyMarriageDetails(),
          ativo: defaultActive,
        },
      }));
    }

    setHasLocalRelationshipChanges(true);
    closeAddDialog();
  };

  const removeRelative = (group: RelationshipGroupKey, personId: string) => {
    // TODO: persistir remoção de vínculo em Supabase quando a revisão de relacionamentos for definitiva.
    markDraftDirty();
    const wasInitialRelationship = getGroupPeople(initialRelationships, group).some((person) => person.id === personId);

    if (group === 'pais') {
      setRelationships((current) => ({
        ...current,
        pais: current.pais.filter((person) => person.id !== personId),
        maes: current.maes.filter((person) => person.id !== personId),
      }));
    } else {
      setRelationships((current) => ({
        ...current,
        [group]: current[group].filter((person) => person.id !== personId),
      }));
    }

    if (group === 'conjuges') {
      setMarriageDetails((current) => {
        const next = { ...current };
        delete next[personId];
        return next;
      });
      setSpouseExpanded((current) => {
        const next = { ...current };
        delete next[personId];
        return next;
      });
    }

    if (group === 'filhos') {
      setChildOtherParent((current) => {
        const next = { ...current };
        delete next[personId];
        return next;
      });
    }

    if (wasInitialRelationship) {
      setRemovedRelationshipIds((current) => ({
        ...current,
        [group]: Array.from(new Set([...current[group], personId])),
      }));
    } else {
      setLocalRelationshipRoles((current) => {
        const next = { ...current };
        delete next[personId];
        return next;
      });
    }

    setHasLocalRelationshipChanges(true);
  };

  const undoRemoveRelative = (group: RelationshipGroupKey, personId: string) => {
    const person = getGroupPeople(initialRelationships, group).find((item) => item.id === personId);
    if (!person) return;

    markDraftDirty();
    setRemovedRelationshipIds((current) => ({
      ...current,
      [group]: current[group].filter((id) => id !== personId),
    }));

    setRelationships((current) => {
      if (group === 'pais') {
        const wasMother = initialRelationships.maes.some((mae) => mae.id === personId);
        return wasMother
          ? { ...current, maes: uniquePeople([...current.maes, person]) }
          : { ...current, pais: uniquePeople([...current.pais, person]) };
      }

      return {
        ...current,
        [group]: uniquePeople([...current[group], person]),
      };
    });

    if (group === 'conjuges') {
      setMarriageDetails((current) => ({
        ...current,
        [personId]: initialMarriageDetails[personId] ?? createEmptyMarriageDetails(),
      }));
    }

    setHasLocalRelationshipChanges(true);
  };

  const openControlRequestDialog = (person: Pessoa) => {
    setSelectedControlPerson(person);
    setControlRequestReason('deceased');
    setControlRequestDescription('');
    setControlRequestError(null);
    setControlRequestDialogOpen(true);
  };

  const closeControlRequestDialog = () => {
    setControlRequestDialogOpen(false);
    setSelectedControlPerson(null);
    setControlRequestReason('deceased');
    setControlRequestDescription('');
    setControlRequestError(null);
  };

  const submitProfileControlRequest = () => {
    if (!selectedControlPerson) return;

    const trimmedDescription = controlRequestDescription.trim();
    if (!controlRequestReason) {
      setControlRequestError('Selecione um motivo para a solicitação.');
      return;
    }
    if (trimmedDescription.length < 10) {
      setControlRequestError('A justificativa deve ter pelo menos 10 caracteres.');
      return;
    }

    const alreadyRequested = profileControlRequests.some((request) => request.pessoaId === selectedControlPerson.id);
    if (alreadyRequested) {
      toast.info('Já existe uma solicitação de controle em análise para este perfil.');
      closeControlRequestDialog();
      return;
    }

    const nextRequest: ProfileControlRequestDraft = {
      pessoaId: selectedControlPerson.id,
      pessoaNome: selectedControlPerson.nome_completo,
      reason: controlRequestReason,
      relationshipDescription: trimmedDescription,
      createdAt: new Date().toISOString(),
    };

    setProfileControlRequests((current) => [...current, nextRequest]);
    closeControlRequestDialog();
    toast.success('Solicitação de controle enviada para análise.');
  };

  const updateMarriageDetail = (spouseId: string, details: MarriageDetailsForm) => {
    markDraftDirty();
    setMarriageDetails((current) => ({
      ...current,
      [spouseId]: normalizeMarriageDetails(details),
    }));
    setHasLocalRelationshipChanges(true);
  };

  const getGroupPeople = (groups: RelationshipGroups, group: RelationshipGroupKey) => {
    if (group === 'pais') return uniquePeople([...groups.pais, ...groups.maes]);
    return uniquePeople(groups[group]);
  };

  const getRelationshipTypeForGroup = (group: RelationshipGroupKey, person: Pessoa): Relacionamento['tipo_relacionamento'] => {
    if (group === 'pais') {
      return relationships.maes.some((mae) => mae.id === person.id) ? 'mae' : 'pai';
    }
    if (group === 'filhos') return localRelationshipRoles[person.id] ?? 'pai';
    if (group === 'conjuges') return 'conjuge';
    return 'irmao';
  };

  const getVisibleGroupPeople = (group: RelationshipGroupKey) => {
    const currentPeople = getGroupPeople(relationships, group);
    const currentIds = new Set(currentPeople.map((person) => person.id));
    const removedPeople = getGroupPeople(initialRelationships, group)
      .filter((person) => removedRelationshipIds[group].includes(person.id) && !currentIds.has(person.id));

    return uniquePeople([...currentPeople, ...removedPeople]);
  };

  const getRelationshipReviewStatus = (group: RelationshipGroupKey, person: Pessoa): RelationshipReviewStatus => {
    if (removedRelationshipIds[group].includes(person.id)) return 'removed_pending';

    const initialPeople = getGroupPeople(initialRelationships, group);
    const wasInitiallyPresent = initialPeople.some((initialPerson) => initialPerson.id === person.id);
    if (!wasInitiallyPresent) return 'added_pending';

    if (group === 'conjuges') {
      const initialDetails = normalizeMarriageDetails(initialMarriageDetails[person.id]);
      const currentDetails = normalizeMarriageDetails(marriageDetails[person.id]);
      if (JSON.stringify(initialDetails) !== JSON.stringify(currentDetails)) return 'edited_pending';
    }

    return 'confirmed';
  };

  const reviewGroups = useMemo(() => {
    const groups: RelationshipGroupKey[] = ['pais', 'filhos', 'conjuges', 'irmaos'];

    return groups.reduce<Record<RelationshipGroupKey, {
      people: Pessoa[];
      visiblePeople: Pessoa[];
      pendingCount: number;
      added: number;
      edited: number;
      removed: number;
    }>>((acc, group) => {
      const people = getGroupPeople(relationships, group);
      const visiblePeople = getVisibleGroupPeople(group);
      const statuses = visiblePeople.map((person) => getRelationshipReviewStatus(group, person));

      acc[group] = {
        people,
        visiblePeople,
        pendingCount: statuses.filter(relationshipStatusHasPending).length,
        added: statuses.filter((status) => status === 'added_pending').length,
        edited: statuses.filter((status) => status === 'edited_pending').length,
        removed: statuses.filter((status) => status === 'removed_pending').length,
      };
      return acc;
    }, {
      pais: { people: [], visiblePeople: [], pendingCount: 0, added: 0, edited: 0, removed: 0 },
      filhos: { people: [], visiblePeople: [], pendingCount: 0, added: 0, edited: 0, removed: 0 },
      conjuges: { people: [], visiblePeople: [], pendingCount: 0, added: 0, edited: 0, removed: 0 },
      irmaos: { people: [], visiblePeople: [], pendingCount: 0, added: 0, edited: 0, removed: 0 },
    });
  }, [initialMarriageDetails, initialRelationships, marriageDetails, relationships, removedRelationshipIds]);

  const reviewSummary = useMemo(() => {
    const added = reviewGroups.pais.added + reviewGroups.filhos.added + reviewGroups.conjuges.added + reviewGroups.irmaos.added;
    const edited = reviewGroups.pais.edited + reviewGroups.filhos.edited + reviewGroups.conjuges.edited + reviewGroups.irmaos.edited;
    const removed = reviewGroups.pais.removed + reviewGroups.filhos.removed + reviewGroups.conjuges.removed + reviewGroups.irmaos.removed;

    return {
      parents: reviewGroups.pais.people.length,
      children: reviewGroups.filhos.people.length,
      spouses: reviewGroups.conjuges.people.length,
      siblings: reviewGroups.irmaos.people.length,
      added,
      edited,
      removed,
      controlRequests: profileControlRequests.length,
      totalPending: added + edited + removed,
    };
  }, [profileControlRequests.length, reviewGroups]);

  const profileControlRequestIds = useMemo(() => new Set(profileControlRequests.map((request) => request.pessoaId)), [profileControlRequests]);
  const hasProfileControlRequest = (personId: string) => profileControlRequestIds.has(personId);

  const currentReviewChangesCount = reviewSummary.totalPending;
  const hasAnyPendingControlRequests = reviewSummary.controlRequests > 0;

  const getRelationshipInputForGroup = (
    action: CreateRelationshipChangeRequestInput['action'],
    group: RelationshipGroupKey,
    person: Pessoa,
    relationshipId?: string,
    changes?: Partial<Relacionamento>,
    existingRelationship?: Relacionamento
  ): CreateRelationshipChangeRequestInput => {
    const relationshipType = existingRelationship?.tipo_relacionamento ?? getRelationshipTypeForGroup(group, person);
    const details = group === 'conjuges'
      ? {
          data_casamento: marriageDetails[person.id]?.data_casamento || null,
          local_casamento: marriageDetails[person.id]?.local_casamento || null,
          ativo: marriageDetails[person.id]?.ativo ?? true,
          data_separacao: marriageDetails[person.id]?.data_separacao || null,
          local_separacao: marriageDetails[person.id]?.local_separacao || null,
        }
      : { ativo: true };

    return {
      requester_pessoa_id: pessoa?.id,
      action,
      target_pessoa_id: group === 'filhos' ? person.id : pessoa?.id,
      related_pessoa_id: group === 'filhos' ? pessoa?.id : person.id,
      relationship_id: relationshipId,
      relationship_type: relationshipType,
      relationship_subtype: existingRelationship?.subtipo_relacionamento ?? (group === 'conjuges' ? 'casamento' : 'sangue'),
      details: group === 'filhos' ? { ...details, inverseTipoForFilho: relationshipType as 'pai' | 'mae' } : details,
      changes,
    };
  };

  const createPendingRelationshipRequest = async (input: CreateRelationshipChangeRequestInput) => {
    const duplicate = await findPendingDuplicateRelationshipChangeRequest(input);
    if (duplicate) return false;
    await createRelationshipChangeRequest(input);
    return true;
  };

  const submitRelationshipRequests = async () => {
    if (!pessoa?.id || !hasLocalRelationshipChanges) {
      return { created: 0, skipped: 0 };
    }

    let created = 0;
    let skipped = 0;
    const groups: RelationshipGroupKey[] = ['pais', 'filhos', 'conjuges', 'irmaos'];

    for (const group of groups) {
      const initialPeople = getGroupPeople(initialRelationships, group);
      const currentPeople = getGroupPeople(relationships, group);
      const initialIds = new Set(initialPeople.map((person) => person.id));
      const currentIds = new Set(currentPeople.map((person) => person.id));

      for (const person of currentPeople.filter((currentPerson) => !initialIds.has(currentPerson.id))) {
        const requestInput = getRelationshipInputForGroup('create', group, person);
        if (person.id.startsWith('local-')) {
          const createdPerson = await adicionarPessoa({
            nome_completo: person.nome_completo,
            data_nascimento: person.data_nascimento,
            local_nascimento: person.local_nascimento,
            local_nascimento_exterior: person.local_nascimento_exterior,
            humano_ou_pet: 'Humano',
          });

          if (!createdPerson) {
            throw new Error(`Não foi possível cadastrar ${person.nome_completo} para solicitar o vínculo.`);
          }
          if (group === 'filhos') {
            requestInput.target_pessoa_id = createdPerson.id;
          } else {
            requestInput.related_pessoa_id = createdPerson.id;
          }
        }

        const wasCreated = await createPendingRelationshipRequest(requestInput);
        if (wasCreated) created += 1;
        else skipped += 1;
      }

      for (const person of initialPeople.filter((initialPerson) => !currentIds.has(initialPerson.id))) {
        const acceptedTypes: Relacionamento['tipo_relacionamento'][] = group === 'pais' || group === 'filhos'
          ? ['pai', 'mae', 'filho']
          : [group === 'conjuges' ? 'conjuge' : 'irmao'];
        const rel = findRelationshipBetween(allRelacionamentos, pessoa.id, person.id, acceptedTypes);
        if (!rel) continue;

        const wasCreated = await createPendingRelationshipRequest(getRelationshipInputForGroup('delete', group, person, rel.id, undefined, rel));
        if (wasCreated) created += 1;
        else skipped += 1;
      }
    }

    for (const spouse of getGroupPeople(relationships, 'conjuges')) {
      if (!getGroupPeople(initialRelationships, 'conjuges').some((person) => person.id === spouse.id)) continue;

      const initialDetails = normalizeMarriageDetails(initialMarriageDetails[spouse.id]);
      const currentDetails = normalizeMarriageDetails(marriageDetails[spouse.id]);
      if (JSON.stringify(initialDetails) === JSON.stringify(currentDetails)) {
        continue;
      }

      const rel = findRelationshipBetween(allRelacionamentos, pessoa.id, spouse.id, ['conjuge']);
      if (!rel) continue;

      const wasCreated = await createPendingRelationshipRequest(getRelationshipInputForGroup('update', 'conjuges', spouse, rel.id, {
        data_casamento: currentDetails.data_casamento,
        local_casamento: currentDetails.local_casamento,
        ativo: currentDetails.ativo,
        data_separacao: currentDetails.data_separacao,
        local_separacao: currentDetails.local_separacao,
      }, rel));
      if (wasCreated) created += 1;
      else skipped += 1;
    }

    return { created, skipped };
  };

  const handleFinish = async () => {
    if (!link?.id || !pessoa?.id) {
      toast.error('Não foi possível localizar seu vínculo com a árvore.');
      return;
    }

    setFinishing(true);

    let requestSummary = { created: 0, skipped: 0 };

    try {
      requestSummary = await submitRelationshipRequests();
    } catch (error) {
      setFinishing(false);
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar solicitações de vínculo.');
      return;
    }

    setFinishing(false);

    if (requestSummary.created > 0) {
      setHasPendingRelationshipRequest(true);
    }

    if (requestSummary.created > 0) {
      const duplicateText = requestSummary.skipped > 0
        ? ` ${requestSummary.skipped} solicitação já estava pendente.`
        : '';
      toast.success(`Sua solicitação está em aprovação. Você receberá um e-mail assim que a análise for finalizada. Aguarde as próximas horas.${duplicateText}`);
    } else if (requestSummary.skipped > 0) {
      toast.info('As solicitações desses vínculos já estavam pendentes para revisão.');
    } else {
      toast.success('Vínculos confirmados.');
    }
    navigate('/arquivos-historicos', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Carregando seus vínculos...</p>
        </div>
      </div>
    );
  }

  if (!link || !pessoa) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Sua conta ainda não está vinculada a uma pessoa da árvore.</p>
            <Button className="mt-4 w-full sm:w-auto" onClick={() => navigate('/entrar')}>
              Ir para autenticação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Confirmar vínculos familiares"
        subtitle="Revise quem são seus pais, filhos, cônjuges e irmãos antes de seguir."
        icon={Users}
        actions={[
          { label: 'Árvore geral', to: '/', icon: HEADER_ACTION_ICONS.Home },
          { label: 'Mapa Familiar', to: '/mapa-familiar', icon: HEADER_ACTION_ICONS.Network },
          { label: 'Meus dados', to: '/meus-dados', icon: HEADER_ACTION_ICONS.Settings },
        ]}
      />

      <MemberOnboardingSteps activeStep={2} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" onClick={() => navigate('/meus-dados')}>
            Voltar para meus dados
          </Button>
          {hasPendingRelationshipRequest && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Sua solicitação está em aprovação. Você receberá um e-mail quando a análise for finalizada.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-blue-700">Pessoa em revisão</p>
              <div className="mt-3 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                <PersonAvatar person={pessoa} className="h-16 w-16" imageSrc={pendingAvatarDataUrl} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">Você está revisando os vínculos familiares de:</p>
                  <h2 className="mt-1 min-w-0 break-words text-xl font-semibold leading-tight text-gray-950">
                    {pessoa.nome_completo}
                  </h2>
                  <div className="mt-2 flex min-w-0 flex-wrap gap-2 text-sm text-gray-600">
                    {formatOptionalValue(pessoa.data_nascimento) && (
                      <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        <span className="break-words">Nascimento: {formatOptionalValue(pessoa.data_nascimento)}</span>
                      </span>
                    )}
                    {formatOptionalValue(pessoa.local_nascimento || pessoa.local_atual) && (
                      <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="break-words">{formatOptionalValue(pessoa.local_nascimento || pessoa.local_atual)}</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-3 break-words text-sm text-gray-600">
                    Confira se os familiares abaixo estão corretos. Você pode adicionar vínculos, solicitar correções ou seguir se estiver tudo certo.
                  </p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {([
                ['pais', reviewSummary.parents, 'vínculo', 'vínculos'],
                ['filhos', reviewSummary.children, 'vínculo', 'vínculos'],
                ['conjuges', reviewSummary.spouses, 'vínculo', 'vínculos'],
                ['irmaos', reviewSummary.siblings, 'vínculo', 'vínculos'],
              ] as Array<[RelationshipGroupKey, number, string, string]>).map(([group, count, singular, plural]) => {
                const meta = RELATIONSHIP_GROUP_META[group];
                const Icon = meta.icon;

                return (
                  <div key={group} className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0 text-blue-700" />
                          <p className="font-semibold text-gray-900">{meta.summaryTitle}</p>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {formatCount(count, singular, plural)}
                          {reviewGroups[group].pendingCount > 0 ? ` · ${reviewGroups[group].pendingCount} em análise` : ''}
                        </p>
                      </div>
                      {reviewGroups[group].pendingCount > 0 && (
                        <span className="shrink-0 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          Em análise
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-6">
              <RelationshipGroupSection
                group="pais"
                people={reviewGroups.pais.visiblePeople}
                pendingCount={reviewGroups.pais.pendingCount}
                onAdd={() => openAddDialog('pais', 'Adicionar pai ou mãe')}
                onRemove={(personId) => removeRelative('pais', personId)}
                onUndoRemove={(personId) => undoRemoveRelative('pais', personId)}
                onRequestControl={openControlRequestDialog}
                getStatus={(person) => getRelationshipReviewStatus('pais', person)}
                hasControlRequest={(person) => hasProfileControlRequest(person.id)}
                ownPersonId={pessoa.id}
                isMother={(person) => relationships.maes.some((mae) => mae.id === person.id) || initialRelationships.maes.some((mae) => mae.id === person.id)}
              />

              <RelationshipGroupSection
                group="filhos"
                people={reviewGroups.filhos.visiblePeople}
                pendingCount={reviewGroups.filhos.pendingCount}
                onAdd={() => openAddDialog('filhos', 'Adicionar filho')}
                onRemove={(personId) => removeRelative('filhos', personId)}
                onUndoRemove={(personId) => undoRemoveRelative('filhos', personId)}
                onRequestControl={openControlRequestDialog}
                getStatus={(person) => getRelationshipReviewStatus('filhos', person)}
                hasControlRequest={(person) => hasProfileControlRequest(person.id)}
                ownPersonId={pessoa.id}
              >
                {(person, status) => status !== 'removed_pending' && (
                  <div className="space-y-3 rounded-lg border border-gray-200 bg-white/80 p-3">
                    <div className="space-y-2">
                      <Label htmlFor={`child-other-parent-${person.id}`}>Outro pai/mãe</Label>
                      <select
                        id={`child-other-parent-${person.id}`}
                        value={childOtherParent[person.id] ?? ''}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          markDraftDirty();
                          setChildOtherParent((current) => ({
                            ...current,
                            [person.id]: nextValue,
                          }));
                        }}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      >
                        <option value="">Não informado</option>
                        {uniquePeople(relationships.conjuges).map((spouse) => (
                          <option key={spouse.id} value={spouse.id}>{spouse.nome_completo}</option>
                        ))}
                      </select>
                    </div>
                    {relationships.conjuges.length === 0 && (
                      <p className="text-sm text-gray-500">Adicione um cônjuge para habilitar a seleção de outro pai/mãe.</p>
                    )}
                  </div>
                )}
              </RelationshipGroupSection>

              <RelationshipGroupSection
                group="conjuges"
                people={reviewGroups.conjuges.visiblePeople}
                pendingCount={reviewGroups.conjuges.pendingCount}
                onAdd={() => openAddDialog('conjuges', 'Adicionar cônjuge')}
                onRemove={(personId) => removeRelative('conjuges', personId)}
                onUndoRemove={(personId) => undoRemoveRelative('conjuges', personId)}
                onRequestControl={openControlRequestDialog}
                getStatus={(person) => getRelationshipReviewStatus('conjuges', person)}
                hasControlRequest={(person) => hasProfileControlRequest(person.id)}
                ownPersonId={pessoa.id}
              >
                {(person, status) => {
                  const details = marriageDetails[person.id] ?? createEmptyMarriageDetails();
                  const expanded = spouseExpanded[person.id] ?? false;
                  if (status === 'removed_pending') return null;

                  return (
                    <div className="space-y-3 rounded-lg border border-gray-200 bg-white/80 p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={details.ativo}
                            onChange={(event) => updateMarriageDetail(person.id, { ...details, ativo: event.target.checked })}
                            className="h-4 w-4"
                          />
                          Relacionamento ativo
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSpouseExpanded((current) => ({
                            ...current,
                            [person.id]: !current[person.id],
                          }))}
                          aria-label={expanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                        >
                          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      {expanded && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <Label htmlFor={`spouse wedding-date-${person.id}`}>Data de casamento</Label>
                            <Input
                              id={`spouse wedding-date-${person.id}`}
                              value={details.data_casamento}
                              onChange={(event) => updateMarriageDetail(person.id, { ...details, data_casamento: event.target.value })}
                              placeholder="DD/MM/AAAA ou AAAA"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`spouse wedding-place-${person.id}`}>Local de casamento</Label>
                            <Input
                              id={`spouse wedding-place-${person.id}`}
                              value={details.local_casamento}
                              onChange={(event) => updateMarriageDetail(person.id, { ...details, local_casamento: event.target.value })}
                              placeholder="Cidade/UF"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`spouse separation-date-${person.id}`}>Data de separação</Label>
                            <Input
                              id={`spouse separation-date-${person.id}`}
                              value={details.data_separacao}
                              onChange={(event) => updateMarriageDetail(person.id, { ...details, data_separacao: event.target.value })}
                              placeholder="DD/MM/AAAA ou AAAA"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`spouse separation-place-${person.id}`}>Local de separação</Label>
                            <Input
                              id={`spouse separation-place-${person.id}`}
                              value={details.local_separacao}
                              onChange={(event) => updateMarriageDetail(person.id, { ...details, local_separacao: event.target.value })}
                              placeholder="Cidade/UF"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              </RelationshipGroupSection>

              <RelationshipGroupSection
                group="irmaos"
                people={reviewGroups.irmaos.visiblePeople}
                pendingCount={reviewGroups.irmaos.pendingCount}
                onAdd={() => openAddDialog('irmaos', 'Adicionar irmão')}
                onRemove={(personId) => removeRelative('irmaos', personId)}
                onUndoRemove={(personId) => undoRemoveRelative('irmaos', personId)}
                onRequestControl={openControlRequestDialog}
                getStatus={(person) => getRelationshipReviewStatus('irmaos', person)}
                hasControlRequest={(person) => hasProfileControlRequest(person.id)}
                ownPersonId={pessoa.id}
              />
            </div>
          </section>

          <aside className="min-w-0">
            <div className="sticky top-4 h-fit min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <PersonAvatar person={pessoa} className="h-14 w-14" imageSrc={pendingAvatarDataUrl} />
                <div className="min-w-0">
                  <h2 className="break-words font-semibold text-gray-950">Resumo da revisão</h2>
                  <p className="break-words text-sm text-gray-600">{pessoa.nome_completo}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Vínculos atuais</p>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <dt className="text-gray-500">Pais</dt>
                      <dd className="font-semibold text-gray-900">{reviewSummary.parents}</dd>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <dt className="text-gray-500">Filhos</dt>
                      <dd className="font-semibold text-gray-900">{reviewSummary.children}</dd>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <dt className="text-gray-500">Cônjuges</dt>
                      <dd className="font-semibold text-gray-900">{reviewSummary.spouses}</dd>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <dt className="text-gray-500">Irmãos</dt>
                      <dd className="font-semibold text-gray-900">{reviewSummary.siblings}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Alterações nesta etapa</p>
                  {currentReviewChangesCount === 0 && !hasAnyPendingControlRequests ? (
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Nenhuma alteração pendente.</p>
                      <p>Você pode confirmar e continuar.</p>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2 text-sm text-gray-700">
                      {reviewSummary.added > 0 && <p>+ {formatCount(reviewSummary.added, 'vínculo adicionado', 'vínculos adicionados')}</p>}
                      {reviewSummary.removed > 0 && <p>- {formatCount(reviewSummary.removed, 'remoção solicitada', 'remoções solicitadas')}</p>}
                      {reviewSummary.edited > 0 && <p>{formatCount(reviewSummary.edited, 'vínculo alterado', 'vínculos alterados')}</p>}
                      {reviewSummary.controlRequests > 0 && <p>{formatCount(reviewSummary.controlRequests, 'solicitação de controle', 'solicitações de controle')}</p>}
                      <p className="pt-2 text-amber-900">
                        {currentReviewChangesCount > 0
                          ? 'Suas alterações serão enviadas para análise dos administradores da árvore.'
                          : 'Suas solicitações serão enviadas para análise dos administradores da árvore.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                  <p className="font-semibold">Solicitações de controle</p>
                  <p className="mt-1">{getProfileControlRequestSummaryLabel(reviewSummary.controlRequests)}</p>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                  Alterações em vínculos familiares passam por revisão antes de aparecerem definitivamente na árvore.
                </div>
                {hasAnyPendingControlRequests && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                    Solicitações de controle são avaliadas para proteger a privacidade e a integridade da árvore familiar.
                  </div>
                )}
              </div>

              <Button className="mt-5 w-full" onClick={handleFinish} disabled={finishing}>
                {finishing ? (
                  'Finalizando...'
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {currentReviewChangesCount === 0 && !hasAnyPendingControlRequests
                      ? 'Confirmar vínculos e continuar'
                      : hasAnyPendingControlRequests && currentReviewChangesCount === 0
                        ? 'Enviar solicitações e continuar'
                        : 'Enviar alterações e continuar'}
                  </>
                )}
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <Dialog open={controlRequestDialogOpen} onOpenChange={(open) => (open ? setControlRequestDialogOpen(true) : closeControlRequestDialog())}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="break-words">Solicitar controle do perfil</DialogTitle>
            <DialogDescription className="break-words">
              Você está pedindo permissão para editar e manter as informações deste perfil familiar.
            </DialogDescription>
          </DialogHeader>

          {selectedControlPerson && (
            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <PersonAvatar person={selectedControlPerson} className="h-14 w-14" />
              <div className="min-w-0">
                <p className="text-sm text-gray-600">Perfil selecionado</p>
                <p className="break-words font-semibold text-gray-950">{selectedControlPerson.nome_completo}</p>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="control-request-reason">Motivo</Label>
              <select
                id="control-request-reason"
                value={controlRequestReason}
                onChange={(event) => {
                  setControlRequestReason(event.target.value as ProfileControlRequestReason);
                  setControlRequestError(null);
                }}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <option value="deceased">{PROFILE_CONTROL_REASON_LABELS.deceased}</option>
                <option value="minor_or_dependent">{PROFILE_CONTROL_REASON_LABELS.minor_or_dependent}</option>
                <option value="close_family">{PROFILE_CONTROL_REASON_LABELS.close_family}</option>
                <option value="other">{PROFILE_CONTROL_REASON_LABELS.other}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="control-request-description">Explique brevemente sua relação com essa pessoa</Label>
              <textarea
                id="control-request-description"
                value={controlRequestDescription}
                onChange={(event) => {
                  setControlRequestDescription(event.target.value);
                  setControlRequestError(null);
                }}
                placeholder="Ex: sou filho, neto, sobrinho, responsável legal ou familiar próximo."
                rows={5}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              />
            </div>

            {controlRequestError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {controlRequestError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={closeControlRequestDialog}>
              Cancelar
            </Button>
            <Button type="button" className="w-full sm:w-auto" onClick={submitProfileControlRequest}>
              Enviar solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(addDialog)} onOpenChange={(open) => (!open ? closeAddDialog() : undefined)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="break-words">{addDialog?.title ?? 'Solicitar familiar'}</DialogTitle>
            <DialogDescription className="break-words">
              O vínculo será guardado no rascunho e formalizado no fluxo final de aprovação.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {(addDialog?.group === 'pais' || addDialog?.group === 'filhos') && (
              <div className="space-y-2">
                <Label htmlFor="relative-parent-role">
                  {addDialog.group === 'pais' ? 'Este familiar é' : 'Meu papel em relação ao filho'}
                </Label>
                <select
                  id="relative-parent-role"
                  value={addForm.parentRole}
                  onChange={(event) => setAddForm((current) => ({
                    ...current,
                    parentRole: event.target.value as 'pai' | 'mae',
                  }))}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <option value="pai">{addDialog.group === 'pais' ? 'Pai' : 'Sou pai'}</option>
                  <option value="mae">{addDialog.group === 'pais' ? 'Mãe' : 'Sou mãe'}</option>
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="relative-name">Nome completo</Label>
              <Input
                id="relative-name"
                value={addForm.nome_completo}
                onChange={(event) => setAddForm((current) => ({ ...current, nome_completo: event.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relative-birth-date">Data de nascimento opcional</Label>
              <Input
                id="relative-birth-date"
                value={addForm.data_nascimento}
                onChange={(event) => setAddForm((current) => ({ ...current, data_nascimento: event.target.value }))}
                placeholder="DD/MM/AAAA ou AAAA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relative-birth-place">Local de nascimento opcional</Label>
              <Input
                id="relative-birth-place"
                value={addForm.local_nascimento}
                onChange={(event) => setAddForm((current) => ({ ...current, local_nascimento: event.target.value }))}
                onBlur={() => setAddForm((current) => ({
                  ...current,
                  local_nascimento: normalizeLocationByMode(current.local_nascimento, {
                    international: current.local_nascimento_exterior,
                  }),
                }))}
                placeholder={addForm.local_nascimento_exterior ? 'Cidade (País)' : 'Cidade/UF'}
              />
              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300"
                  checked={addForm.local_nascimento_exterior}
                  onChange={(event) => setAddForm((current) => ({
                    ...current,
                    local_nascimento_exterior: event.target.checked,
                  }))}
                />
                <span className="break-words">Nascimento fora do Brasil</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={closeAddDialog}>
              Cancelar
            </Button>
            <Button type="button" className="w-full sm:w-auto" onClick={addRelative}>
              <Plus className="h-4 w-4" />
              Enviar para Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
