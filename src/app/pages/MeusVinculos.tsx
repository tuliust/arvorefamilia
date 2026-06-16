import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Baby,
  ChevronDown,
  ChevronUp,
  Heart,
  Plus,
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
import { isPersonDeceased } from '../utils/personFields';
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
import { ProfileControlRequestDialog } from './meus-vinculos/ProfileControlRequestDialog';
import { RelativeCard } from './meus-vinculos/RelativeCard';
import { RelationshipGroupPanel } from './meus-vinculos/RelationshipGroupPanel';
import { RelationshipOverview } from './meus-vinculos/RelationshipOverview';
import { RelationshipReviewAside } from './meus-vinculos/RelationshipReviewAside';
import {
  canRequestProfileControl,
  getRelationshipOverviewGroupLabel,
  relationshipStatusHasPending,
} from './meus-vinculos/meusVinculosUtils';
import {
  ProfileControlRequestDraft,
  ProfileControlRequestReason,
  RelationshipChangeCounts,
  RelationshipCounts,
  RelationshipGroupKey,
  RelationshipOverviewGroup,
  RelationshipReviewStatus,
  RemovedRelationshipIds,
} from './meus-vinculos/types';

type RelationshipGroups = {
  pais: Pessoa[];
  maes: Pessoa[];
  conjuges: Pessoa[];
  filhos: Pessoa[];
  irmaos: Pessoa[];
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

  const reviewCounts: RelationshipCounts = {
    parents: reviewSummary.parents,
    children: reviewSummary.children,
    spouses: reviewSummary.spouses,
    siblings: reviewSummary.siblings,
  };
  const reviewChanges: RelationshipChangeCounts = {
    added: reviewSummary.added,
    edited: reviewSummary.edited,
    removed: reviewSummary.removed,
    controlRequests: reviewSummary.controlRequests,
    totalPending: reviewSummary.totalPending,
  };
  const overviewGroups: RelationshipOverviewGroup[] = [
    { key: 'pais', label: getRelationshipOverviewGroupLabel('pais'), count: reviewSummary.parents, pendingCount: reviewGroups.pais.pendingCount },
    { key: 'filhos', label: getRelationshipOverviewGroupLabel('filhos'), count: reviewSummary.children, pendingCount: reviewGroups.filhos.pendingCount },
    { key: 'conjuges', label: getRelationshipOverviewGroupLabel('conjuges'), count: reviewSummary.spouses, pendingCount: reviewGroups.conjuges.pendingCount },
    { key: 'irmaos', label: getRelationshipOverviewGroupLabel('irmaos'), count: reviewSummary.siblings, pendingCount: reviewGroups.irmaos.pendingCount },
  ];

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
            <RelationshipOverview
              person={pessoa}
              avatarSrc={pendingAvatarDataUrl}
              groups={overviewGroups}
            />

            <div className="space-y-6">
              <RelationshipGroupPanel
                title="Pais"
                description="Confirme pai e mãe cadastrados para sua árvore."
                icon={UserRound}
                count={reviewGroups.pais.visiblePeople.length}
                pendingCount={reviewGroups.pais.pendingCount}
                emptyTitle="Nenhum pai ou mãe cadastrado"
                emptyDescription="Adicione pai ou mãe para completar a geração anterior da árvore."
                addButtonLabel="Adicionar pai ou mãe"
                onAdd={() => openAddDialog('pais', 'Adicionar pai ou mãe')}
              >
                {reviewGroups.pais.visiblePeople.map((person) => {
                  const status: RelationshipReviewStatus = hasProfileControlRequest(person.id)
                    ? 'control_pending'
                    : getRelationshipReviewStatus('pais', person);
                  const isMother = relationships.maes.some((mae) => mae.id === person.id) || initialRelationships.maes.some((mae) => mae.id === person.id);

                  return (
                    <RelativeCard
                      key={`pais-${person.id}-${status}`}
                      person={person}
                      relationshipGroup="pais"
                      relationshipLabel={isMother ? 'Mãe' : 'Pai'}
                      status={status}
                      canRequestControl={canRequestProfileControl(person, pessoa.id, hasProfileControlRequest(person.id), status)}
                      onRemove={() => removeRelative('pais', person.id)}
                      onUndoRemove={() => undoRemoveRelative('pais', person.id)}
                      onCancelAddition={() => removeRelative('pais', person.id)}
                      onRequestControl={() => openControlRequestDialog(person)}
                    />
                  );
                })}
              </RelationshipGroupPanel>

              <RelationshipGroupPanel
                title="Filhos"
                description="Confirme seus filhos e, se souber, informe o outro pai/mãe."
                icon={Baby}
                count={reviewGroups.filhos.visiblePeople.length}
                pendingCount={reviewGroups.filhos.pendingCount}
                emptyTitle="Nenhum filho cadastrado"
                emptyDescription="Adicione filhos para conectar a próxima geração."
                addButtonLabel="Adicionar filho"
                onAdd={() => openAddDialog('filhos', 'Adicionar filho')}
              >
                {reviewGroups.filhos.visiblePeople.map((person) => {
                  const status: RelationshipReviewStatus = hasProfileControlRequest(person.id)
                    ? 'control_pending'
                    : getRelationshipReviewStatus('filhos', person);

                  return (
                    <RelativeCard
                      key={`filhos-${person.id}-${status}`}
                      person={person}
                      relationshipGroup="filhos"
                      relationshipLabel="Filho(a)"
                      status={status}
                      canRequestControl={canRequestProfileControl(person, pessoa.id, hasProfileControlRequest(person.id), status)}
                      onRemove={() => removeRelative('filhos', person.id)}
                      onUndoRemove={() => undoRemoveRelative('filhos', person.id)}
                      onCancelAddition={() => removeRelative('filhos', person.id)}
                      onRequestControl={() => openControlRequestDialog(person)}
                    >
                      {status !== 'removed_pending' && (
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
                    </RelativeCard>
                  );
                })}
              </RelationshipGroupPanel>

              <RelationshipGroupPanel
                title="Cônjuges"
                description="Registre relacionamentos importantes e detalhes de casamento ou separação."
                icon={Heart}
                count={reviewGroups.conjuges.visiblePeople.length}
                pendingCount={reviewGroups.conjuges.pendingCount}
                emptyTitle="Nenhum cônjuge cadastrado"
                emptyDescription="Adicione cônjuges para registrar relacionamentos importantes."
                addButtonLabel="Adicionar cônjuge"
                onAdd={() => openAddDialog('conjuges', 'Adicionar cônjuge')}
              >
                {reviewGroups.conjuges.visiblePeople.map((person) => {
                  const status: RelationshipReviewStatus = hasProfileControlRequest(person.id)
                    ? 'control_pending'
                    : getRelationshipReviewStatus('conjuges', person);
                  const details = marriageDetails[person.id] ?? createEmptyMarriageDetails();
                  const expanded = spouseExpanded[person.id] ?? false;

                  return (
                    <RelativeCard
                      key={`conjuges-${person.id}-${status}`}
                      person={person}
                      relationshipGroup="conjuges"
                      relationshipLabel="Cônjuge"
                      status={status}
                      canRequestControl={canRequestProfileControl(person, pessoa.id, hasProfileControlRequest(person.id), status)}
                      onRemove={() => removeRelative('conjuges', person.id)}
                      onUndoRemove={() => undoRemoveRelative('conjuges', person.id)}
                      onCancelAddition={() => removeRelative('conjuges', person.id)}
                      onRequestControl={() => openControlRequestDialog(person)}
                    >
                      {status !== 'removed_pending' && (
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
                      )}
                    </RelativeCard>
                  );
                })}
              </RelationshipGroupPanel>

              <RelationshipGroupPanel
                title="Irmãos"
                description="Complete os vínculos laterais com irmãos e irmãs."
                icon={Users}
                count={reviewGroups.irmaos.visiblePeople.length}
                pendingCount={reviewGroups.irmaos.pendingCount}
                emptyTitle="Nenhum irmão cadastrado"
                emptyDescription="Adicione irmãos para completar os vínculos laterais da família."
                addButtonLabel="Adicionar irmão"
                onAdd={() => openAddDialog('irmaos', 'Adicionar irmão')}
              >
                {reviewGroups.irmaos.visiblePeople.map((person) => {
                  const status: RelationshipReviewStatus = hasProfileControlRequest(person.id)
                    ? 'control_pending'
                    : getRelationshipReviewStatus('irmaos', person);

                  return (
                    <RelativeCard
                      key={`irmaos-${person.id}-${status}`}
                      person={person}
                      relationshipGroup="irmaos"
                      relationshipLabel="Irmão(ã)"
                      status={status}
                      canRequestControl={canRequestProfileControl(person, pessoa.id, hasProfileControlRequest(person.id), status)}
                      onRemove={() => removeRelative('irmaos', person.id)}
                      onUndoRemove={() => undoRemoveRelative('irmaos', person.id)}
                      onCancelAddition={() => removeRelative('irmaos', person.id)}
                      onRequestControl={() => openControlRequestDialog(person)}
                    />
                  );
                })}
              </RelationshipGroupPanel>
            </div>
          </section>

          <aside className="min-w-0">
            <RelationshipReviewAside
              counts={reviewCounts}
              changes={reviewChanges}
              hasPendingRelationshipRequest={hasPendingRelationshipRequest}
              saving={finishing}
              onConfirm={handleFinish}
            />
          </aside>
        </div>
      </main>

      <ProfileControlRequestDialog
        open={controlRequestDialogOpen}
        person={selectedControlPerson}
        reason={controlRequestReason}
        description={controlRequestDescription}
        error={controlRequestError}
        onOpenChange={(open) => (open ? setControlRequestDialogOpen(true) : closeControlRequestDialog())}
        onReasonChange={(reason) => {
          setControlRequestReason(reason);
          setControlRequestError(null);
        }}
        onDescriptionChange={(value) => {
          setControlRequestDescription(value);
          setControlRequestError(null);
        }}
        onSubmit={submitProfileControlRequest}
      />

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
