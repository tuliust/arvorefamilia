import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Baby,
  ChevronDown,
  ChevronUp,
  Heart,
  PawPrint,
  Plus,
  UserRound,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
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
  RelationshipChangeRequestDetails,
  createRelationshipChangeRequest,
  findPendingDuplicateRelationshipChangeRequest,
} from '../services/relationshipChangeRequestService';
import {
  getPrimaryLinkedPersonWithPessoa,
  getLinkedPersonIds,
  resolveFirstAccessLinkForUser,
  searchPeopleForRelationship,
  UserPersonLinkRecord,
} from '../services/memberProfileService';
import { Pessoa, Relacionamento } from '../types';
import { normalizeLocationByMode, validateLocationByMode } from '../utils/personFields';
import { ProfileControlRequestDialog } from './meus-vinculos/ProfileControlRequestDialog';
import { RelativeCard } from './meus-vinculos/RelativeCard';
import { RelationshipGroupPanel } from './meus-vinculos/RelationshipGroupPanel';
import { RelationshipOverview } from './meus-vinculos/RelationshipOverview';
import {
  canRequestProfileControl,
  formatOptionalValue,
  getChildOtherParentOptions,
  getChildRelationshipLabel,
  getPetRelationshipLabel,
  findKnownOtherParentForChild,
  getRelationshipChangeNoticeText,
  getRelationshipControlNoticeText,
  getRelationshipFinalButtonLabel,
  getSiblingRelationshipLabel,
  getRelationshipOverviewGroupLabel,
  isPetPerson,
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
  pets: Pessoa[];
  irmaos: Pessoa[];
};

type AddRelativeForm = {
  nome_completo: string;
  data_nascimento: string;
  local_nascimento: string;
  local_nascimento_exterior: boolean;
  parentRole: 'pai' | 'mae';
};

type AddRelativeMode = 'search' | 'create' | 'confirm';

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
  pets: [],
  irmaos: [],
};

const EMPTY_REMOVED_RELATIONSHIP_IDS: RemovedRelationshipIds = {
  pais: [],
  filhos: [],
  pets: [],
  conjuges: [],
  irmaos: [],
};

function uniquePeople(people: Pessoa[]) {
  return Array.from(new Map(people.map((person) => [person.id, person])).values());
}

function splitChildrenAndPets(people: Pessoa[]) {
  return people.reduce<{ filhos: Pessoa[]; pets: Pessoa[] }>((groups, person) => {
    if (isPetPerson(person)) {
      groups.pets.push(person);
    } else {
      groups.filhos.push(person);
    }
    return groups;
  }, { filhos: [], pets: [] });
}

function normalizeRelationshipGroups(groups: RelationshipGroups): RelationshipGroups {
  const split = splitChildrenAndPets(uniquePeople([...(groups.filhos ?? []), ...(groups.pets ?? [])]));

  return {
    pais: uniquePeople(groups.pais ?? []).filter((person) => !split.pets.some((pet) => pet.id === person.id)),
    maes: uniquePeople(groups.maes ?? []).filter((person) => !split.pets.some((pet) => pet.id === person.id)),
    conjuges: uniquePeople(groups.conjuges ?? []).filter((person) => !split.pets.some((pet) => pet.id === person.id)),
    filhos: split.filhos,
    pets: split.pets,
    irmaos: uniquePeople(groups.irmaos ?? []).filter((person) => !split.pets.some((pet) => pet.id === person.id)),
  };
}

function normalizeSpouseActivity(details: MarriageDetails, spouses: Pessoa[], currentPerson?: Pessoa | null): MarriageDetails {
  let activeSpouseId: string | null = null;
  const currentPersonDeceased = currentPerson ? isPersonDeceased(currentPerson) : false;

  return spouses.reduce<MarriageDetails>((next, spouse) => {
    const normalized = normalizeMarriageDetails(details[spouse.id]);
    const spouseDeceased = isPersonDeceased(spouse);
    const canBeActive = !currentPersonDeceased && !spouseDeceased;
    const shouldStayActive = canBeActive && normalized.ativo && !activeSpouseId;

    if (shouldStayActive) {
      activeSpouseId = spouse.id;
    }

    next[spouse.id] = {
      ...normalized,
      ativo: shouldStayActive,
    };
    return next;
  }, {});
}

function createLocalPerson(form: AddRelativeForm, humanoOuPet: Pessoa['humano_ou_pet'] = 'Humano'): Pessoa {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    nome_completo: form.nome_completo.trim(),
    data_nascimento: form.data_nascimento.trim() || undefined,
    local_nascimento: normalizeLocationByMode(form.local_nascimento, {
      international: form.local_nascimento_exterior,
    }) || undefined,
    local_nascimento_exterior: form.local_nascimento_exterior,
    humano_ou_pet: humanoOuPet,
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
        pets: Array.isArray(draft.relationships.pets) ? draft.relationships.pets : [],
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
        pets: Array.isArray(draft.removedRelationshipIds?.pets) ? draft.removedRelationshipIds.pets : [],
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
  const [addRelativeMode, setAddRelativeMode] = useState<AddRelativeMode>('search');
  const [relativeSearchTerm, setRelativeSearchTerm] = useState('');
  const [relativeSearchResults, setRelativeSearchResults] = useState<Pessoa[]>([]);
  const [relativeSearchLoading, setRelativeSearchLoading] = useState(false);
  const [relativeSearchError, setRelativeSearchError] = useState<string | null>(null);
  const [selectedExistingRelative, setSelectedExistingRelative] = useState<Pessoa | null>(null);
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
  const [linkedPersonIds, setLinkedPersonIds] = useState<Set<string>>(() => new Set());
  const [pendingAvatarDataUrl, setPendingAvatarDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const draftHydratedRef = useRef(false);
  const draftDirtyRef = useRef(false);

  const pessoa = link?.pessoa;
  const isOnboarding = link?.dados_confirmados === false;

  async function reloadRelationships(pessoaId: string) {
    const [nextRelationships, nextAllRelationships] = await Promise.all([
      obterRelacionamentosDaPessoa(pessoaId),
      obterTodosRelacionamentos(),
    ]);
    const normalizedRelationships = normalizeRelationshipGroups(nextRelationships as RelationshipGroups);
    const nextMarriageDetails: MarriageDetails = {};
    uniquePeople(normalizedRelationships.conjuges).forEach((person) => {
      const rel = findRelationshipBetween(nextAllRelationships, pessoaId, person.id, ['conjuge']);
      const defaultActive = !isPersonDeceased({ ...pessoa, falecido: pessoa?.falecido }) && !isPersonDeceased(person);
      nextMarriageDetails[person.id] = {
        ...createEmptyMarriageDetails(),
        data_casamento: String(rel?.data_casamento ?? ''),
        local_casamento: String(rel?.local_casamento ?? ''),
        ativo: isPersonDeceased(person) || isPersonDeceased({ ...pessoa, falecido: pessoa?.falecido }) ? false : (rel?.ativo ?? defaultActive),
        data_separacao: String(rel?.data_separacao ?? ''),
        local_separacao: String(rel?.local_separacao ?? ''),
      };
    });

    setAllRelacionamentos(nextAllRelationships);
    const normalizedMarriageDetails = normalizeSpouseActivity(nextMarriageDetails, normalizedRelationships.conjuges, pessoa);

    setRelationships(normalizedRelationships);
    setInitialRelationships(normalizedRelationships);
    setMarriageDetails(normalizedMarriageDetails);
    setInitialMarriageDetails(normalizedMarriageDetails);
    setRemovedRelationshipIds(EMPTY_REMOVED_RELATIONSHIP_IDS);

    return {
      relationships: normalizedRelationships,
      allRelacionamentos: nextAllRelationships,
      marriageDetails: normalizedMarriageDetails,
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
          const normalizedDraftRelationships = normalizeRelationshipGroups(draft.relationships);
          setRelationships(normalizedDraftRelationships);
          setMarriageDetails(normalizeSpouseActivity(draft.marriageDetails, normalizedDraftRelationships.conjuges, data.pessoa));
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

  const resetAddRelativeFlow = () => {
    setAddDialog(null);
    setAddForm({
      nome_completo: '',
      data_nascimento: '',
      local_nascimento: '',
      local_nascimento_exterior: false,
      parentRole: 'pai',
    });
    setAddRelativeMode('search');
    setRelativeSearchTerm('');
    setRelativeSearchResults([]);
    setRelativeSearchLoading(false);
    setRelativeSearchError(null);
    setSelectedExistingRelative(null);
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
    setAddRelativeMode('search');
    setRelativeSearchTerm('');
    setRelativeSearchResults([]);
    setRelativeSearchLoading(false);
    setRelativeSearchError(null);
    setSelectedExistingRelative(null);
  };

  const closeAddDialog = () => {
    resetAddRelativeFlow();
  };

  const getSearchConflictMessage = (person: Pessoa) => {
    if (!addDialog || !pessoa?.id) return null;
    if (person.id === pessoa.id) return 'Esta é a pessoa em revisão.';

    const visiblePerson = reviewGroups[addDialog.group].visiblePeople.find((item) => item.id === person.id);
    if (!visiblePerson) return null;

    const status = getRelationshipReviewStatus(addDialog.group, visiblePerson);
    if (status === 'added_pending') return 'Esta pessoa já foi adicionada nesta revisão.';
    if (status === 'removed_pending') return 'Esta pessoa já está marcada para remoção nesta revisão.';
    return 'Esta pessoa já está vinculada nesta categoria.';
  };

  const runRelativeSearch = async () => {
    const searchTerm = relativeSearchTerm.trim();
    if (searchTerm.length < 2) {
      setRelativeSearchError('Digite pelo menos 2 caracteres para buscar.');
      setRelativeSearchResults([]);
      return;
    }

    setRelativeSearchLoading(true);
    setRelativeSearchError(null);

    try {
      const { data, error } = await searchPeopleForRelationship(searchTerm);
      if (error) {
        setRelativeSearchResults([]);
        setRelativeSearchError('Não foi possível buscar pessoas agora. Você ainda pode criar um novo cadastro.');
        return;
      }

      setRelativeSearchResults(data);
    } catch {
      setRelativeSearchResults([]);
      setRelativeSearchError('Não foi possível buscar pessoas agora. Você ainda pode criar um novo cadastro.');
    } finally {
      setRelativeSearchLoading(false);
    }
  };

  const selectExistingRelative = (person: Pessoa) => {
    setSelectedExistingRelative(person);
    setAddRelativeMode('confirm');
    setRelativeSearchError(null);
  };

  const startCreateNewRelative = () => {
    setSelectedExistingRelative(null);
    setAddRelativeMode('create');
    setRelativeSearchError(null);
    if (!addForm.nome_completo.trim()) {
      setAddForm((current) => ({
        ...current,
        nome_completo: relativeSearchTerm.trim(),
      }));
    }
  };

  const goBackToSearch = () => {
    setSelectedExistingRelative(null);
    setAddRelativeMode('search');
    setRelativeSearchError(null);
  };

  useEffect(() => {
    if (addRelativeMode !== 'search') return;

    const searchTerm = relativeSearchTerm.trim();

    if (searchTerm.length === 0) {
      setRelativeSearchResults([]);
      setRelativeSearchLoading(false);
      setRelativeSearchError(null);
      return;
    }

    let cancelled = false;
    setRelativeSearchResults([]);
    setRelativeSearchLoading(true);
    setRelativeSearchError(null);

    const timeoutId = window.setTimeout(() => {
      searchPeopleForRelationship(searchTerm)
        .then(({ data, error }) => {
          if (cancelled) return;

          if (error) {
            setRelativeSearchResults([]);
            setRelativeSearchError('Não foi possível buscar pessoas agora. Você ainda pode criar um novo cadastro.');
            return;
          }

          setRelativeSearchResults(data);
        })
        .catch(() => {
          if (cancelled) return;
          setRelativeSearchResults([]);
          setRelativeSearchError('Não foi possível buscar pessoas agora. Você ainda pode criar um novo cadastro.');
        })
        .finally(() => {
          if (!cancelled) setRelativeSearchLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [addRelativeMode, relativeSearchTerm]);

  const addRelative = () => {
    if (!addDialog) return;

    const person = selectedExistingRelative ?? null;

    if (!person) {
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
    }

    if (person) {
      const conflictMessage = getSearchConflictMessage(person);
      if (conflictMessage) {
        toast.error(conflictMessage);
        return;
      }
    }

    if (addDialog.group === 'pets' && person && !isPetPerson(person)) {
      toast.error('Selecione um cadastro de pet ou crie um novo pet.');
      return;
    }

    if (addDialog.group === 'filhos' && person && isPetPerson(person)) {
      toast.error('Pets devem ser adicionados no grupo Pets, não em Filhos.');
      return;
    }

    markDraftDirty();

    const relativePerson = person ?? createLocalPerson(addForm, addDialog.group === 'pets' ? 'Pet' : 'Humano');

    setRelationships((current) => {
      if (addDialog.group === 'pais') {
        return addForm.parentRole === 'mae'
          ? {
              ...current,
              pais: current.pais.filter((item) => item.id !== relativePerson.id),
              maes: uniquePeople([...current.maes, relativePerson]),
            }
          : {
              ...current,
              pais: uniquePeople([...current.pais, relativePerson]),
              maes: current.maes.filter((item) => item.id !== relativePerson.id),
            };
      }

      if (addDialog.group === 'pets') {
        return {
          ...current,
          filhos: current.filhos.filter((item) => item.id !== relativePerson.id),
          pets: uniquePeople([...current.pets, { ...relativePerson, humano_ou_pet: 'Pet' }]),
        };
      }

      if (addDialog.group === 'filhos') {
        return {
          ...current,
          filhos: uniquePeople([...current.filhos, { ...relativePerson, humano_ou_pet: 'Humano' }]),
          pets: current.pets.filter((item) => item.id !== relativePerson.id),
        };
      }

      return {
        ...current,
        [addDialog.group]: uniquePeople([...current[addDialog.group], relativePerson]),
      };
    });

    if (addDialog.group === 'filhos' || addDialog.group === 'pets') {
      setLocalRelationshipRoles((current) => ({
        ...current,
        [relativePerson.id]: addForm.parentRole,
      }));
    }

    setRemovedRelationshipIds((current) => ({
      ...current,
      [addDialog.group]: current[addDialog.group].filter((id) => id !== relativePerson.id),
    }));

    if (addDialog.group === 'conjuges') {
      const defaultActive = !isPersonDeceased({ ...pessoa, falecido: pessoa?.falecido }) && !isPersonDeceased(relativePerson);
      setMarriageDetails((current) => {
        const nextDetails = {
          ...createEmptyMarriageDetails(),
          ativo: defaultActive,
        };

        if (!defaultActive) {
          return {
            ...current,
            [relativePerson.id]: nextDetails,
          };
        }

        return Object.fromEntries(
          Object.entries({ ...current, [relativePerson.id]: nextDetails }).map(([id, value]) => [
            id,
            id === relativePerson.id
              ? nextDetails
              : { ...normalizeMarriageDetails(value), ativo: false },
          ])
        );
      });
    }

    setHasLocalRelationshipChanges(true);
    resetAddRelativeFlow();
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

    if (group === 'filhos' || group === 'pets') {
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
    const spouse = getGroupPeople(relationships, 'conjuges').find((person) => person.id === spouseId);
    const normalizedDetails = normalizeMarriageDetails(details);
    const spouseDeceased = spouse ? isPersonDeceased(spouse) : false;
    const currentPersonDeceased = pessoa ? isPersonDeceased(pessoa) : false;
    const canBeActive = !spouseDeceased && !currentPersonDeceased;
    const nextDetails = {
      ...normalizedDetails,
      ativo: canBeActive ? normalizedDetails.ativo : false,
    };

    setMarriageDetails((current) => {
      if (!nextDetails.ativo) {
        return {
          ...current,
          [spouseId]: nextDetails,
        };
      }

      return Object.fromEntries(
        Object.entries({ ...current, [spouseId]: nextDetails }).map(([id, value]) => [
          id,
          id === spouseId
            ? nextDetails
            : { ...normalizeMarriageDetails(value), ativo: false },
        ])
      );
    });
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
    if (group === 'pets') return localRelationshipRoles[person.id] ?? 'pai';
    if (group === 'conjuges') return 'conjuge';
    return 'irmao';
  };

  const getChildOtherParentOptionsForPerson = (child: Pessoa) => getChildOtherParentOptions({
    child,
    currentPersonId: pessoa.id,
    allRelacionamentos,
    candidatePeople: uniquePeople([
      ...relationships.conjuges,
      ...relationships.pais,
      ...relationships.maes,
    ]),
  });

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
    const groups: RelationshipGroupKey[] = ['pais', 'filhos', 'pets', 'conjuges', 'irmaos'];

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
      pets: { people: [], visiblePeople: [], pendingCount: 0, added: 0, edited: 0, removed: 0 },
      conjuges: { people: [], visiblePeople: [], pendingCount: 0, added: 0, edited: 0, removed: 0 },
      irmaos: { people: [], visiblePeople: [], pendingCount: 0, added: 0, edited: 0, removed: 0 },
    });
  }, [initialMarriageDetails, initialRelationships, marriageDetails, relationships, removedRelationshipIds]);

  useEffect(() => {
    if (!pessoa?.id || (reviewGroups.filhos.visiblePeople.length === 0 && reviewGroups.pets.visiblePeople.length === 0)) return;

    setChildOtherParent((current) => {
      let changed = false;
      const next = { ...current };

      [...reviewGroups.filhos.visiblePeople, ...reviewGroups.pets.visiblePeople].forEach((child) => {
        if (next[child.id]) return;

        const knownOtherParent = findKnownOtherParentForChild({
          child,
          currentPersonId: pessoa.id,
          allRelacionamentos,
          candidatePeople: uniquePeople([
            ...relationships.conjuges,
            ...relationships.pais,
            ...relationships.maes,
          ]),
        });

        if (knownOtherParent?.id) {
          next[child.id] = knownOtherParent.id;
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [
    allRelacionamentos,
    pessoa?.id,
    relationships.conjuges,
    relationships.maes,
    relationships.pais,
    reviewGroups.filhos.visiblePeople,
    reviewGroups.pets.visiblePeople,
  ]);

  const reviewSummary = useMemo(() => {
    const added = reviewGroups.pais.added + reviewGroups.filhos.added + reviewGroups.pets.added + reviewGroups.conjuges.added + reviewGroups.irmaos.added;
    const edited = reviewGroups.pais.edited + reviewGroups.filhos.edited + reviewGroups.pets.edited + reviewGroups.conjuges.edited + reviewGroups.irmaos.edited;
    const removed = reviewGroups.pais.removed + reviewGroups.filhos.removed + reviewGroups.pets.removed + reviewGroups.conjuges.removed + reviewGroups.irmaos.removed;

    return {
      parents: reviewGroups.pais.people.length,
      children: reviewGroups.filhos.people.length,
      pets: reviewGroups.pets.people.length,
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

  const visibleRelationshipPersonIds = useMemo(() => {
    return Array.from(new Set([
      ...reviewGroups.pais.visiblePeople.map((person) => person.id),
      ...reviewGroups.filhos.visiblePeople.map((person) => person.id),
      ...reviewGroups.pets.visiblePeople.map((person) => person.id),
      ...reviewGroups.conjuges.visiblePeople.map((person) => person.id),
      ...reviewGroups.irmaos.visiblePeople.map((person) => person.id),
    ].filter((id) => Boolean(id) && !String(id).startsWith('local-')))).sort();
  }, [reviewGroups]);

  const visibleRelationshipPersonIdsKey = useMemo(() => visibleRelationshipPersonIds.join('|'), [visibleRelationshipPersonIds]);

  useEffect(() => {
    let mounted = true;

    async function loadLinkedIds() {
      if (visibleRelationshipPersonIds.length === 0) {
        if (mounted) setLinkedPersonIds(new Set());
        return;
      }

      const { data, error } = await getLinkedPersonIds(visibleRelationshipPersonIds);
      if (!mounted) return;
      if (!error) {
        setLinkedPersonIds(data);
      }
    }

    loadLinkedIds();

    return () => {
      mounted = false;
    };
  }, [visibleRelationshipPersonIdsKey]);

  const reviewCounts: RelationshipCounts = {
    parents: reviewSummary.parents,
    children: reviewSummary.children,
    pets: reviewSummary.pets,
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
    { key: 'pets', label: getRelationshipOverviewGroupLabel('pets'), count: reviewSummary.pets, pendingCount: reviewGroups.pets.pendingCount },
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
    const details: RelationshipChangeRequestDetails = group === 'conjuges'
      ? {
          data_casamento: marriageDetails[person.id]?.data_casamento || null,
          local_casamento: marriageDetails[person.id]?.local_casamento || null,
          ativo: marriageDetails[person.id]?.ativo ?? true,
          data_separacao: marriageDetails[person.id]?.data_separacao || null,
          local_separacao: marriageDetails[person.id]?.local_separacao || null,
        }
      : {
          ativo: true,
          relationshipGroup: group === 'pets' ? 'pets' : group === 'filhos' ? 'filhos' : undefined,
          otherParentId: childOtherParent[person.id] && childOtherParent[person.id] !== '__none__'
            ? childOtherParent[person.id]
            : null,
        };

    return {
      requester_pessoa_id: pessoa?.id,
      action,
      target_pessoa_id: group === 'filhos' || group === 'pets' ? person.id : pessoa?.id,
      related_pessoa_id: group === 'filhos' || group === 'pets' ? pessoa?.id : person.id,
      relationship_id: relationshipId,
      relationship_type: relationshipType,
      relationship_subtype: existingRelationship?.subtipo_relacionamento ?? (group === 'conjuges' ? 'casamento' : group === 'pets' ? 'adotivo' : 'sangue'),
      details: group === 'filhos' || group === 'pets' ? { ...details, inverseTipoForFilho: relationshipType as 'pai' | 'mae' } : details,
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
    const groups: RelationshipGroupKey[] = ['pais', 'filhos', 'pets', 'conjuges', 'irmaos'];

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
            humano_ou_pet: group === 'pets' ? 'Pet' : 'Humano',
          });

          if (!createdPerson) {
            throw new Error(`Não foi possível cadastrar ${person.nome_completo} para solicitar o vínculo.`);
          }
          if (group === 'filhos' || group === 'pets') {
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
        const acceptedTypes: Relacionamento['tipo_relacionamento'][] = group === 'pais' || group === 'filhos' || group === 'pets'
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

    const profileTextSavePromises: Promise<boolean>[] = [];
    window.dispatchEvent(new CustomEvent('meus-vinculos:save-profile-text', {
      detail: {
        register: (promise: Promise<boolean>) => profileTextSavePromises.push(promise),
      },
    }));

    try {
      const profileTextResults = await Promise.all(profileTextSavePromises);
      if (profileTextResults.some((saved) => saved === false)) {
        throw new Error('Não foi possível salvar a Mini Bio e as Curiosidades antes de continuar.');
      }
    } catch (error) {
      setFinishing(false);
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar os textos antes de continuar.');
      return;
    }

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
    if (isOnboarding) {
      navigate('/arquivos-historicos', { replace: true });
    }
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
        title={isOnboarding ? 'Confirmar vínculos familiares' : 'Editar vínculos familiares'}
        subtitle={isOnboarding ? 'Revise quem são seus pais, filhos, pets, cônjuges e irmãos antes de seguir.' : 'Atualize pais, filhos, pets, cônjuges, irmãos e solicitações de controle de perfil.'}
        icon={Users}
        hideHeaderActions={isOnboarding}
        hideMobileHeaderActions={isOnboarding}
        hideMobileBottomNav={isOnboarding}
      />

      {isOnboarding && <MemberOnboardingSteps activeStep={2} hidePreferences={pessoa?.falecido === true} />}

      <main className="mx-auto max-w-7xl px-4 py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-6">
        {hasPendingRelationshipRequest && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Sua solicitação está em aprovação. Você receberá um e-mail quando a análise for finalizada.
          </div>
        )}

        <section className="min-w-0 space-y-6">
          <RelationshipOverview
            person={pessoa}
            avatarSrc={pendingAvatarDataUrl}
            groups={overviewGroups}
          />

          <div className="space-y-6">
            <RelationshipGroupPanel
              id="vinculos-pais"
              title="Pais"
              description="Confirme pai e mãe cadastrados para sua árvore."
              icon={UserRound}
              count={reviewGroups.pais.visiblePeople.length}
              pendingCount={reviewGroups.pais.pendingCount}
              emptyTitle="Nenhum pai ou mãe cadastrado"
              emptyDescription="Adicione pai ou mãe para completar a geração anterior da árvore."
              addButtonLabel="Adicionar pai ou mãe"
              onAdd={() => openAddDialog('pais', 'Adicionar pai ou mãe')}
              showEmptyAddButton={false}
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
                    hasAuthUser={linkedPersonIds.has(person.id)}
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
              id="vinculos-filhos"
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
                const otherParentOptions = getChildOtherParentOptionsForPerson(person);

                return (
                  <RelativeCard
                    key={`filhos-${person.id}-${status}`}
                    person={person}
                    relationshipGroup="filhos"
                    relationshipLabel={getChildRelationshipLabel(person)}
                    status={status}
                    hasAuthUser={linkedPersonIds.has(person.id)}
                    canRequestControl={canRequestProfileControl(person, pessoa.id, hasProfileControlRequest(person.id), status)}
                    onRemove={() => removeRelative('filhos', person.id)}
                    onUndoRemove={() => undoRemoveRelative('filhos', person.id)}
                    onCancelAddition={() => removeRelative('filhos', person.id)}
                    onRequestControl={() => openControlRequestDialog(person)}
                  >
                    {status !== 'removed_pending' && (
                      <div className="space-y-3 rounded-lg border border-gray-200 bg-white/80 p-3">
                        <div className="space-y-2">
                          <Label htmlFor={`child-other-parent-${person.id}`}>Alterar a mãe</Label>
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
                            {otherParentOptions.map((option) => (
                              <option key={option.id} value={option.id}>{option.nome_completo}</option>
                            ))}
                          </select>
                        </div>
                        {otherParentOptions.length === 0 && (
                          <p className="text-sm text-gray-500">Adicione um cônjuge ou cadastre o outro pai/mãe para habilitar a seleção.</p>
                        )}
                      </div>
                    )}
                  </RelativeCard>
                );
              })}
            </RelationshipGroupPanel>

            <RelationshipGroupPanel
              id="vinculos-pets"
              title="Pets"
              description="Confirme seus pets e, se houver, informe outros tutores."
              icon={PawPrint}
              count={reviewGroups.pets.visiblePeople.length}
              pendingCount={reviewGroups.pets.pendingCount}
              emptyTitle="Nenhum pet cadastrado"
              emptyDescription="Adicione pets em uma área própria, sem tratá-los como filhos."
              addButtonLabel="Adicionar pet"
              onAdd={() => openAddDialog('pets', 'Adicionar pet')}
            >
              {reviewGroups.pets.visiblePeople.map((person) => {
                const status: RelationshipReviewStatus = hasProfileControlRequest(person.id)
                  ? 'control_pending'
                  : getRelationshipReviewStatus('pets', person);
                const otherTutorOptions = getChildOtherParentOptionsForPerson(person);
                const tutorValue = childOtherParent[person.id] ?? '';

                return (
                  <RelativeCard
                    key={`pets-${person.id}-${status}`}
                    person={person}
                    relationshipGroup="pets"
                    relationshipLabel={getPetRelationshipLabel(person)}
                    status={status}
                    hasAuthUser={linkedPersonIds.has(person.id)}
                    canRequestControl={canRequestProfileControl(person, pessoa.id, hasProfileControlRequest(person.id), status)}
                    onRemove={() => removeRelative('pets', person.id)}
                    onUndoRemove={() => undoRemoveRelative('pets', person.id)}
                    onCancelAddition={() => removeRelative('pets', person.id)}
                    onRequestControl={() => openControlRequestDialog(person)}
                  >
                    {status !== 'removed_pending' && (
                      <div className="space-y-3 rounded-lg border border-gray-200 bg-white/80 p-3">
                        <div className="space-y-2">
                          <Label htmlFor={`pet-other-tutor-${person.id}`}>Outros tutores</Label>
                          <select
                            id={`pet-other-tutor-${person.id}`}
                            value={tutorValue}
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
                            <option value="">Manter tutor atual do pré-cadastro</option>
                            <option value="__none__">Não há outro tutor do pet</option>
                            {otherTutorOptions.map((option) => (
                              <option key={option.id} value={option.id}>Alterar para {option.nome_completo}</option>
                            ))}
                          </select>
                        </div>
                        {otherTutorOptions.length === 0 && (
                          <p className="text-sm text-gray-500">Adicione um cônjuge ou outro familiar para habilitar a seleção de tutor adicional.</p>
                        )}
                      </div>
                    )}
                  </RelativeCard>
                );
              })}
            </RelationshipGroupPanel>

            <RelationshipGroupPanel
              id="vinculos-conjuges"
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
                const spouseDeceased = isPersonDeceased(person);
                const currentPersonDeceased = isPersonDeceased(pessoa);
                const activeDisabled = spouseDeceased || currentPersonDeceased;
                const expanded = spouseExpanded[person.id] ?? false;

                return (
                  <RelativeCard
                    key={`conjuges-${person.id}-${status}`}
                    person={person}
                    relationshipGroup="conjuges"
                    relationshipLabel="Cônjuge"
                    status={status}
                    hasAuthUser={linkedPersonIds.has(person.id)}
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
                              checked={details.ativo && !activeDisabled}
                              disabled={activeDisabled}
                              onChange={(event) => updateMarriageDetail(person.id, { ...details, ativo: event.target.checked })}
                              className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            Relacionamento ativo
                          </label>
                          {activeDisabled && (
                            <p className="text-sm text-gray-500">
                              Relacionamento inativo porque {spouseDeceased ? 'o cônjuge é falecido' : 'a pessoa em revisão é falecida'}.
                            </p>
                          )}
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
              id="vinculos-irmaos"
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
                    relationshipLabel={getSiblingRelationshipLabel(person)}
                    status={status}
                    hasAuthUser={linkedPersonIds.has(person.id)}
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

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-950">{isOnboarding ? 'Finalizar revisão' : 'Salvar vínculos'}</h2>
              <p className="text-sm text-gray-600">{isOnboarding ? 'Confirme os vínculos familiares para continuar.' : 'Salve as alterações desta área sem avançar pelo fluxo de primeiro acesso.'}</p>
            </div>

            <div className="mt-4 space-y-3">
              {reviewChanges.totalPending > 0 && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {getRelationshipChangeNoticeText(reviewChanges.totalPending > 0)}
                </p>
              )}

              {reviewChanges.controlRequests > 0 && (
                <p className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                  {getRelationshipControlNoticeText()}
                </p>
              )}
            </div>

            <Button className="mt-5 w-full" onClick={handleFinish} disabled={finishing}>
              {finishing
                ? 'Salvando...'
                : isOnboarding
                  ? getRelationshipFinalButtonLabel(reviewChanges.totalPending > 0, reviewChanges.controlRequests > 0)
                  : 'Salvar vínculos'}
            </Button>
          </section>
        </section>
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
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="break-words">{addDialog?.title ?? 'Solicitar familiar'}</DialogTitle>
            <DialogDescription className="break-words">
              O vínculo será guardado no rascunho e formalizado no fluxo final de aprovação.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {addRelativeMode === 'search' && (
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();

                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="relative-search-name">Nome da pessoa</Label>
                  <Input
                    id="relative-search-name"
                    value={relativeSearchTerm}
                    onChange={(event) => {
                      setRelativeSearchTerm(event.target.value);
                      setRelativeSearchError(null);
                    }}
                    placeholder="Ex: Maria Souza, João Limeira..."
                  />
                  <p className="text-sm text-gray-600">
                    Digite o nome da pessoa para verificar se ela já existe na árvore antes de criar um novo cadastro.
                  </p>
                </div>

                {relativeSearchError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    {relativeSearchError}
                  </p>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={startCreateNewRelative}>
                    Criar nova pessoa
                  </Button>
                </div>

                {relativeSearchLoading && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    Buscando pessoas cadastradas...
                  </div>
                )}

                {!relativeSearchLoading && relativeSearchResults.length > 0 && (
                  <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    {relativeSearchResults.map((result) => {
                      const conflictMessage = getSearchConflictMessage(result);
                      const birthLabel = formatOptionalValue(result.data_nascimento);
                      const locationLabel = formatOptionalValue(result.local_nascimento || result.local_atual);

                      return (
                        <article key={result.id} className="rounded-lg border border-gray-100 bg-white p-3 transition hover:border-blue-300 hover:bg-blue-50/40">
                          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 gap-3">
                              <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                                {String(result.foto_principal_url ?? '').trim() ? (
                                  <img
                                    src={String(result.foto_principal_url ?? '').trim()}
                                    alt={result.nome_completo}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="inline-flex h-full w-full items-center justify-center text-sm font-semibold">
                                    {result.nome_completo.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'EU'}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 space-y-1">
                                <h4 className="break-words text-base font-semibold text-gray-950">{result.nome_completo}</h4>
                                <div className="flex min-w-0 flex-wrap gap-2 text-sm text-gray-600">
                                  {birthLabel && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
                                      <span className="font-medium text-gray-500">Nascimento:</span>
                                      <span className="break-words text-gray-900">{birthLabel}</span>
                                    </span>
                                  )}
                                  {locationLabel && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-200">
                                      <span className="font-medium text-gray-500">Local:</span>
                                      <span className="break-words text-gray-900">{locationLabel}</span>
                                    </span>
                                  )}
                                  {result.falecido && (
                                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-red-800 ring-1 ring-red-200">
                                      Falecido(a)
                                    </span>
                                  )}
                                </div>
                                {conflictMessage && (
                                  <p className="text-sm text-red-700">{conflictMessage}</p>
                                )}
                              </div>
                            </div>

                            <Button
                              type="button"
                              className="w-full shrink-0 sm:w-auto"
                              variant={conflictMessage ? 'outline' : 'default'}
                              disabled={Boolean(conflictMessage)}
                              onClick={() => selectExistingRelative(result)}
                            >
                              Usar esta pessoa
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </form>
            )}

            {addRelativeMode === 'confirm' && selectedExistingRelative && (
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-800">Pessoa selecionada</p>
                  <div className="mt-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 shrink-0 overflow-hidden rounded-full bg-blue-100 text-blue-800 ring-1 ring-blue-200">
                      {String(selectedExistingRelative.foto_principal_url ?? '').trim() ? (
                        <img
                          src={String(selectedExistingRelative.foto_principal_url ?? '').trim()}
                          alt={selectedExistingRelative.nome_completo}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="inline-flex h-full w-full items-center justify-center text-sm font-semibold">
                          {selectedExistingRelative.nome_completo.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'EU'}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="break-words text-base font-semibold text-gray-950">{selectedExistingRelative.nome_completo}</h4>
                      <div className="mt-1 flex min-w-0 flex-wrap gap-2 text-sm text-gray-600">
                        {formatOptionalValue(selectedExistingRelative.data_nascimento) && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 ring-1 ring-blue-100">
                            <span className="font-medium text-gray-500">Nascimento:</span>
                            <span className="break-words text-gray-900">{formatOptionalValue(selectedExistingRelative.data_nascimento)}</span>
                          </span>
                        )}
                        {formatOptionalValue(selectedExistingRelative.local_nascimento || selectedExistingRelative.local_atual) && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 ring-1 ring-blue-100">
                            <span className="font-medium text-gray-500">Local:</span>
                            <span className="break-words text-gray-900">
                              {formatOptionalValue(selectedExistingRelative.local_nascimento || selectedExistingRelative.local_atual)}
                            </span>
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-blue-900">
                        Este vínculo será revisado antes de aparecer definitivamente na árvore.
                      </p>
                    </div>
                  </div>
                </div>

                {(addDialog.group === 'pais' || addDialog.group === 'filhos') && (
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

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={goBackToSearch}>
                    Trocar pessoa
                  </Button>
                </div>
              </div>
            )}

            {addRelativeMode === 'create' && (
              <div className="space-y-4">
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
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={goBackToSearch}>
                    Voltar para busca
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={closeAddDialog}>
              Cancelar
            </Button>
            {addRelativeMode !== 'search' && (
              <Button type="button" className="w-full sm:w-auto" onClick={addRelative}>
                <Plus className="h-4 w-4" />
                {selectedExistingRelative ? 'Confirmar vínculo' : 'Enviar para Aprovação'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
