import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { obterRelacionamentosDaPessoa } from '../services/dataService';
import {
  confirmOwnLinkedPersonData,
  getPrimaryLinkedPersonWithPessoa,
  listUserPersonLinksWithPessoa,
} from '../services/memberProfileService';
import type { Pessoa } from '../types';
import { RevisaoDados } from './RevisaoDados';

type RelationshipGroups = {
  pais: Pessoa[];
  maes: Pessoa[];
  conjuges: Pessoa[];
  filhos: Pessoa[];
  pets: Pessoa[];
  irmaos: Pessoa[];
};

type RelationshipGroupKey = 'pais' | 'filhos' | 'pets' | 'conjuges' | 'irmaos';

type RemovedRelationshipIds = Record<RelationshipGroupKey, string[]>;

type MeusVinculosDraft = {
  relationships?: Partial<RelationshipGroups>;
  removedRelationshipIds?: Partial<RemovedRelationshipIds>;
};

type ReviewStatus = 'added' | 'removed';

type ReviewEntry = {
  group: RelationshipGroupKey;
  groupLabel: string;
  person: Pessoa;
  status: ReviewStatus;
  genderHint?: 'homem' | 'mulher' | null;
};

const EMPTY_RELATIONSHIPS: RelationshipGroups = {
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

const GROUP_CONFIGS: Array<{ key: RelationshipGroupKey; label: string }> = [
  { key: 'pais', label: 'Pais' },
  { key: 'conjuges', label: 'Cônjuges' },
  { key: 'filhos', label: 'Filhos' },
  { key: 'pets', label: 'Pets' },
  { key: 'irmaos', label: 'Irmãos' },
];

const REVIEW_BADGE_CLASS_NAMES = {
  added: 'inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800',
  removed: 'inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-800',
};

function getMeusVinculosDraftKey(userId: string, pessoaId: string) {
  return `meus-vinculos-draft:${userId}:${pessoaId}`;
}

function uniquePeople(people: Pessoa[]) {
  return Array.from(new Map(people.map((person) => [person.id, person])).values());
}

function isPetPerson(person: Pessoa) {
  const entityType = String(person.humano_ou_pet ?? '').trim().toLowerCase();
  const gender = String(person.genero ?? '').trim().toLowerCase();

  return entityType === 'pet' || gender === 'pet' || gender === 'animal' || gender === 'mascote';
}

function normalizeRelationshipGroups(groups: Partial<RelationshipGroups>): RelationshipGroups {
  const filhos = uniquePeople(groups.filhos ?? []);
  const pets = uniquePeople([...(groups.pets ?? []), ...filhos.filter(isPetPerson)]);

  return {
    pais: uniquePeople(groups.pais ?? []),
    maes: uniquePeople(groups.maes ?? []),
    conjuges: uniquePeople(groups.conjuges ?? []),
    filhos: filhos.filter((person) => !isPetPerson(person)),
    pets,
    irmaos: uniquePeople(groups.irmaos ?? []),
  };
}

function readMeusVinculosDraft(userId: string, pessoaId: string) {
  try {
    const raw = window.sessionStorage.getItem(getMeusVinculosDraftKey(userId, pessoaId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as MeusVinculosDraft;
    return {
      relationships: parsed.relationships
        ? normalizeRelationshipGroups(parsed.relationships)
        : null,
      removedRelationshipIds: {
        pais: Array.isArray(parsed.removedRelationshipIds?.pais) ? parsed.removedRelationshipIds.pais : [],
        filhos: Array.isArray(parsed.removedRelationshipIds?.filhos) ? parsed.removedRelationshipIds.filhos : [],
        pets: Array.isArray(parsed.removedRelationshipIds?.pets) ? parsed.removedRelationshipIds.pets : [],
        conjuges: Array.isArray(parsed.removedRelationshipIds?.conjuges) ? parsed.removedRelationshipIds.conjuges : [],
        irmaos: Array.isArray(parsed.removedRelationshipIds?.irmaos) ? parsed.removedRelationshipIds.irmaos : [],
      } as RemovedRelationshipIds,
    };
  } catch {
    return null;
  }
}

function getGroupPeople(groups: RelationshipGroups, group: RelationshipGroupKey) {
  if (group === 'pais') return uniquePeople([...groups.pais, ...groups.maes]);
  return uniquePeople(groups[group]);
}

function getGenderHint(groups: RelationshipGroups, group: RelationshipGroupKey, personId: string): ReviewEntry['genderHint'] {
  if (group !== 'pais') return null;
  if (groups.maes.some((person) => person.id === personId)) return 'mulher';
  return 'homem';
}

function buildReviewEntries(initialRelationships: RelationshipGroups, draftRelationships: RelationshipGroups, removedIds: RemovedRelationshipIds) {
  const entries: ReviewEntry[] = [];

  GROUP_CONFIGS.forEach(({ key, label }) => {
    const initialPeople = getGroupPeople(initialRelationships, key);
    const draftPeople = getGroupPeople(draftRelationships, key);
    const initialIds = new Set(initialPeople.map((person) => person.id));
    const draftIds = new Set(draftPeople.map((person) => person.id));
    const groupRemovedIds = new Set(removedIds[key] ?? []);

    draftPeople
      .filter((person) => !initialIds.has(person.id))
      .forEach((person) => entries.push({
        group: key,
        groupLabel: label,
        person,
        status: 'added',
        genderHint: getGenderHint(draftRelationships, key, person.id),
      }));

    initialPeople
      .filter((person) => groupRemovedIds.has(person.id) || !draftIds.has(person.id))
      .forEach((person) => entries.push({
        group: key,
        groupLabel: label,
        person,
        status: 'removed',
        genderHint: getGenderHint(initialRelationships, key, person.id),
      }));
  });

  return entries;
}

function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '??';
}

function normalizeGender(gender?: unknown, fallback?: ReviewEntry['genderHint']) {
  const normalized = String(gender ?? fallback ?? '').trim().toLowerCase();
  if (['mulher', 'feminino', 'female', 'feminina', 'woman'].includes(normalized)) return 'mulher';
  if (['homem', 'masculino', 'male', 'masculina', 'man'].includes(normalized)) return 'homem';
  return fallback ?? 'homem';
}

function getLifeStatusLabel(person: Pessoa, genderHint?: ReviewEntry['genderHint']) {
  const gender = normalizeGender(person.genero, genderHint);
  if (person.falecido) return gender === 'mulher' ? 'Falecida' : 'Falecido';
  return gender === 'mulher' ? 'Viva' : 'Vivo';
}

function getStatusLabel(status: ReviewStatus) {
  return status === 'removed' ? 'Remoção em análise' : 'Em análise';
}

function findGroupCard(groupLabel: string) {
  const title = Array.from(document.querySelectorAll<HTMLParagraphElement>('p'))
    .find((element) => element.textContent?.trim() === groupLabel);

  return title?.parentElement ?? null;
}

function getOrCreateListContainer(groupCard: HTMLElement) {
  const existingList = Array.from(groupCard.children)
    .find((child) => child instanceof HTMLElement && child.className.includes('space-y-2')) as HTMLElement | undefined;

  if (existingList) return existingList;

  Array.from(groupCard.children).forEach((child) => {
    if (child.textContent?.trim() === 'Nenhum vínculo informado.') {
      child.remove();
    }
  });

  const list = document.createElement('div');
  list.className = 'space-y-2';
  groupCard.appendChild(list);
  return list;
}

function findPersonRow(list: HTMLElement, person: Pessoa) {
  return Array.from(list.querySelectorAll<HTMLElement>('[data-review-person-id], div'))
    .find((element) => {
      if (element.dataset.reviewPersonId === person.id) return true;
      const name = element.querySelector('p')?.textContent?.trim();
      return name === person.nome_completo;
    }) ?? null;
}

function ensureStatusContainer(row: HTMLElement) {
  const existing = Array.from(row.querySelectorAll<HTMLElement>('div'))
    .find((element) => element.className.includes('flex-wrap') && element.className.includes('gap-2'));

  if (existing) return existing;

  const content = row.querySelector<HTMLElement>('div.min-w-0') ?? row;
  const container = document.createElement('div');
  container.className = 'mt-1 flex flex-wrap items-center gap-2';
  content.appendChild(container);
  return container;
}

function appendBadge(row: HTMLElement, status: ReviewStatus) {
  const label = getStatusLabel(status);
  if (row.textContent?.includes(label)) return;
  if (row.querySelector(`[data-review-badge="${status}"]`)) return;

  const statusContainer = ensureStatusContainer(row);
  const badge = document.createElement('span');
  badge.dataset.reviewBadge = status;
  badge.className = REVIEW_BADGE_CLASS_NAMES[status];
  badge.textContent = label;
  statusContainer.appendChild(badge);
}

function createReviewRow(entry: ReviewEntry) {
  const row = document.createElement('div');
  row.dataset.reviewPersonId = entry.person.id;
  row.className = 'flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2';

  const avatar = document.createElement('div');
  avatar.className = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700';
  avatar.textContent = getInitials(entry.person.nome_completo);

  const content = document.createElement('div');
  content.className = 'min-w-0';

  const name = document.createElement('p');
  name.className = 'truncate text-sm font-semibold text-gray-900';
  name.textContent = entry.person.nome_completo;

  const meta = document.createElement('div');
  meta.className = 'mt-1 flex flex-wrap items-center gap-2';

  const lifeStatus = document.createElement('span');
  lifeStatus.className = 'text-xs text-gray-500';
  lifeStatus.textContent = getLifeStatusLabel(entry.person, entry.genderHint);

  meta.appendChild(lifeStatus);
  content.appendChild(name);
  content.appendChild(meta);
  row.appendChild(avatar);
  row.appendChild(content);
  appendBadge(row, entry.status);

  return row;
}

function applyReviewEntries(entries: ReviewEntry[]) {
  entries.forEach((entry) => {
    const groupCard = findGroupCard(entry.groupLabel);
    if (!groupCard) return;

    const list = getOrCreateListContainer(groupCard);
    const existingRow = findPersonRow(list, entry.person);

    if (existingRow) {
      appendBadge(existingRow, entry.status);
      return;
    }

    list.appendChild(createReviewRow(entry));
  });
}

function RelationshipReviewBadgeEnhancer() {
  const { user } = useAuth();
  const [reviewEntries, setReviewEntries] = useState<ReviewEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadReviewEntries() {
      if (!user?.id) return;

      try {
        const { data } = await getPrimaryLinkedPersonWithPessoa(user.id);
        const pessoa = data?.pessoa;
        if (!pessoa?.id) return;

        const draft = readMeusVinculosDraft(user.id, pessoa.id);
        if (!draft?.relationships) {
          if (!cancelled) setReviewEntries([]);
          return;
        }

        const storedRelationships = normalizeRelationshipGroups(await obterRelacionamentosDaPessoa(pessoa.id));
        const entries = buildReviewEntries(
          storedRelationships,
          draft.relationships,
          draft.removedRelationshipIds ?? EMPTY_REMOVED_RELATIONSHIP_IDS,
        );

        if (!cancelled) setReviewEntries(entries);
      } catch (error) {
        console.warn('Não foi possível marcar vínculos em análise na revisão:', error);
      }
    }

    void loadReviewEntries();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (reviewEntries.length === 0) return undefined;

    const apply = () => applyReviewEntries(reviewEntries);
    window.setTimeout(apply, 0);

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [reviewEntries]);

  return null;
}

function ResponsibleProfilesModal({
  open,
  profileNames,
  onEditNow,
  onLater,
}: {
  open: boolean;
  profileNames: string[];
  onEditNow: () => void;
  onLater: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-950">Você foi selecionado como responsável pelos perfis:</h2>
        <ul className="mt-4 space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
          {profileNames.map((name) => (
            <li key={name} className="text-sm font-medium text-gray-900">{name}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-gray-700">Deseja editar as páginas agora?</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onLater}>
            Depois
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={onEditNow}>
            Sim
          </Button>
        </div>
      </div>
    </div>
  );
}

function FinalReviewResponsibleProfilesGate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [finishing, setFinishing] = useState(false);
  const [responsibleProfileNames, setResponsibleProfileNames] = useState<string[]>([]);
  const modalOpen = responsibleProfileNames.length > 0;

  const goToTree = () => navigate('/mapa-familiar', { replace: true });
  const goToProfileEditor = () => navigate('/meus-dados');

  const finishAndResolveResponsibleProfiles = useMemo(() => async () => {
    if (!user?.id || finishing) return;

    setFinishing(true);

    try {
      const { data, error } = await getPrimaryLinkedPersonWithPessoa(user.id);
      const pessoa = data?.pessoa;

      if (error || !data?.id || !pessoa?.id) {
        throw new Error(error || 'Não foi possível localizar o perfil em revisão.');
      }

      const confirmation = await confirmOwnLinkedPersonData(data.id);
      if (confirmation.error) throw new Error(confirmation.error);

      window.sessionStorage.removeItem(getMeusVinculosDraftKey(user.id, pessoa.id));

      const linksResult = await listUserPersonLinksWithPessoa(user.id);
      const responsibleProfiles = linksResult.data
        .filter((link) => link.pessoa_id !== pessoa.id)
        .filter((link) => link.can_edit !== false)
        .map((link) => link.pessoa?.nome_completo || 'Perfil vinculado')
        .filter(Boolean);

      if (responsibleProfiles.length > 0) {
        setResponsibleProfileNames(responsibleProfiles);
        return;
      }

      goToTree();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível finalizar a revisão.');
    } finally {
      setFinishing(false);
    }
  }, [finishing, navigate, user?.id]);

  useEffect(() => {
    const handleFinishClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest('button');
      if (!button) return;
      if (!button.textContent?.includes('Finalizar e acessar árvore')) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      void finishAndResolveResponsibleProfiles();
    };

    document.addEventListener('click', handleFinishClick, true);

    return () => {
      document.removeEventListener('click', handleFinishClick, true);
    };
  }, [finishAndResolveResponsibleProfiles]);

  return (
    <ResponsibleProfilesModal
      open={modalOpen}
      profileNames={responsibleProfileNames}
      onEditNow={goToProfileEditor}
      onLater={goToTree}
    />
  );
}

export function RevisaoDadosFlowPage() {
  return (
    <>
      <RelationshipReviewBadgeEnhancer />
      <FinalReviewResponsibleProfilesGate />
      <RevisaoDados />
    </>
  );
}
