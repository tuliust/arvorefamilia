import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  Layers,
  MessageCircle,
  Network,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  UsersRound,
} from 'lucide-react';

import { HomeHeader } from './home/HomeHeader';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { getPrimaryLinkedPersonWithPessoa } from '../services/memberProfileService';
import type { Pessoa, Relacionamento } from '../types';

const LINHA_GERACIONAL_MAX_WAVES = 3;
const LINHA_GERACIONAL_MAX_PEOPLE = 140;
const SUPABASE_IN_CHUNK_SIZE = 40;
const MAX_CARDS_PER_SCREEN = 36;

const PESSOA_SELECT = [
  'id',
  'nome_completo',
  'data_nascimento',
  'data_falecimento',
  'falecido',
  'foto_principal_url',
  'genero',
  'humano_ou_pet',
  'lado',
  'manual_generation',
  'permitir_exibir_data_nascimento',
].join(',');

const RELACIONAMENTO_SELECT = [
  'id',
  'pessoa_origem_id',
  'pessoa_destino_id',
  'tipo_relacionamento',
  'subtipo_relacionamento',
  'ativo',
].join(',');

type LinhaGeracionalCard = {
  id: string;
  person: Pessoa;
  name: string;
  label: string;
  years?: string;
  highlight?: boolean;
};

type LinhaGeracionalScreen = {
  id: string;
  title: string;
  subtitle: string;
  position: string;
  generation: number;
  cards: LinhaGeracionalCard[];
  truncated?: boolean;
};

type LinhaGeracionalLoadState = {
  loading: boolean;
  error: string | null;
  centralPersonId: string;
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
};

type RelationshipMaps = {
  parentsByChild: Map<string, Set<string>>;
  childrenByParent: Map<string, Set<string>>;
  spousesByPerson: Map<string, Set<string>>;
  siblingsByPerson: Map<string, Set<string>>;
};

const SCREEN_DEFINITIONS: Array<Omit<LinhaGeracionalScreen, 'cards' | 'position'> & { emptyLabel: string }> = [
  {
    id: 'tataravos',
    title: 'Tataravós',
    subtitle: 'Origem remota da família',
    generation: -4,
    emptyLabel: 'Nenhum tataravô encontrado neste recorte.',
  },
  {
    id: 'bisavos',
    title: 'Bisavós',
    subtitle: 'Ramos familiares de origem',
    generation: -3,
    emptyLabel: 'Nenhum bisavô encontrado neste recorte.',
  },
  {
    id: 'avos',
    title: 'Avós',
    subtitle: 'Geração de ligação familiar',
    generation: -2,
    emptyLabel: 'Nenhum avô encontrado neste recorte.',
  },
  {
    id: 'pais',
    title: 'Pais e tios',
    subtitle: 'Geração anterior direta',
    generation: -1,
    emptyLabel: 'Nenhum registro nessa geração.',
  },
  {
    id: 'nucleo',
    title: 'Núcleo',
    subtitle: 'Pessoa central, cônjuges e irmãos',
    generation: 0,
    emptyLabel: 'Nenhuma pessoa no núcleo.',
  },
  {
    id: 'filhos',
    title: 'Filhos',
    subtitle: 'Descendentes diretos',
    generation: 1,
    emptyLabel: 'Nenhum filho encontrado neste recorte.',
  },
  {
    id: 'netos',
    title: 'Netos',
    subtitle: 'Novas gerações da família',
    generation: 2,
    emptyLabel: 'Nenhum neto encontrado neste recorte.',
  },
];

const TOOLBAR_ITEMS = ['Formato', 'Cor', 'Filtros', 'Zoom'];

function normalizePessoa(row: any): Pessoa {
  return {
    ...row,
    humano_ou_pet: row?.humano_ou_pet || 'Humano',
    falecido: Boolean(row?.falecido || row?.data_falecimento),
  } as Pessoa;
}

function normalizeRelacionamento(row: any): Relacionamento {
  return {
    ...row,
    ativo: row?.ativo ?? true,
  } as Relacionamento;
}

function chunkIds(ids: string[], chunkSize = SUPABASE_IN_CHUNK_SIZE) {
  const chunks: string[][] = [];

  for (let index = 0; index < ids.length; index += chunkSize) {
    chunks.push(ids.slice(index, index + chunkSize));
  }

  return chunks;
}

function getRelationshipKey(relationship: Relacionamento) {
  return relationship.id || [
    relationship.pessoa_origem_id,
    relationship.pessoa_destino_id,
    relationship.tipo_relacionamento,
    relationship.subtipo_relacionamento ?? '',
  ].join('::');
}

async function fetchPessoaById(id: string) {
  const { data, error } = await supabase
    .from('pessoas')
    .select(PESSOA_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizePessoa(data) : null;
}

async function fetchPessoasByIds(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  const rows: Pessoa[] = [];

  for (const chunk of chunkIds(uniqueIds)) {
    const { data, error } = await supabase
      .from('pessoas')
      .select(PESSOA_SELECT)
      .in('id', chunk);

    if (error) throw new Error(error.message);
    rows.push(...((data || []).map(normalizePessoa)));
  }

  return rows;
}

async function fetchRelationshipsForIds(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  const relationshipsByKey = new Map<string, Relacionamento>();

  for (const chunk of chunkIds(uniqueIds)) {
    const [originResult, destinationResult] = await Promise.all([
      supabase
        .from('relacionamentos')
        .select(RELACIONAMENTO_SELECT)
        .in('pessoa_origem_id', chunk),
      supabase
        .from('relacionamentos')
        .select(RELACIONAMENTO_SELECT)
        .in('pessoa_destino_id', chunk),
    ]);

    if (originResult.error) throw new Error(originResult.error.message);
    if (destinationResult.error) throw new Error(destinationResult.error.message);

    [...(originResult.data || []), ...(destinationResult.data || [])]
      .map(normalizeRelacionamento)
      .filter((relationship) => relationship.ativo !== false)
      .forEach((relationship) => {
        relationshipsByKey.set(getRelationshipKey(relationship), relationship);
      });
  }

  return Array.from(relationshipsByKey.values());
}

async function fetchScopedLinhaGeracionalData(centralPersonId: string) {
  const personIds = new Set<string>([centralPersonId]);
  const relationshipsByKey = new Map<string, Relacionamento>();
  let frontier = new Set<string>([centralPersonId]);

  for (let wave = 0; wave < LINHA_GERACIONAL_MAX_WAVES && frontier.size > 0; wave += 1) {
    const relationships = await fetchRelationshipsForIds(Array.from(frontier));
    const nextFrontier = new Set<string>();

    relationships.forEach((relationship) => {
      relationshipsByKey.set(getRelationshipKey(relationship), relationship);

      [relationship.pessoa_origem_id, relationship.pessoa_destino_id].forEach((personId) => {
        if (!personId || personIds.has(personId)) return;
        if (personIds.size >= LINHA_GERACIONAL_MAX_PEOPLE) return;

        personIds.add(personId);
        nextFrontier.add(personId);
      });
    });

    frontier = nextFrontier;
  }

  const pessoas = await fetchPessoasByIds(Array.from(personIds));
  const loadedPersonIds = new Set(pessoas.map((person) => person.id));
  const relacionamentos = Array.from(relationshipsByKey.values()).filter((relationship) => (
    loadedPersonIds.has(relationship.pessoa_origem_id)
    && loadedPersonIds.has(relationship.pessoa_destino_id)
  ));

  return { pessoas, relacionamentos };
}

function addMapSet(map: Map<string, Set<string>>, key: string, value: string) {
  if (!key || !value || key === value) return;
  const set = map.get(key) ?? new Set<string>();
  set.add(value);
  map.set(key, set);
}

function buildRelationshipMaps(relacionamentos: Relacionamento[]): RelationshipMaps {
  const maps: RelationshipMaps = {
    parentsByChild: new Map(),
    childrenByParent: new Map(),
    spousesByPerson: new Map(),
    siblingsByPerson: new Map(),
  };

  relacionamentos
    .filter((relationship) => relationship.ativo !== false)
    .forEach((relationship) => {
      const origemId = relationship.pessoa_origem_id;
      const destinoId = relationship.pessoa_destino_id;
      if (!origemId || !destinoId) return;

      if (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae') {
        addMapSet(maps.parentsByChild, origemId, destinoId);
        addMapSet(maps.childrenByParent, destinoId, origemId);
        return;
      }

      if (relationship.tipo_relacionamento === 'filho') {
        addMapSet(maps.parentsByChild, destinoId, origemId);
        addMapSet(maps.childrenByParent, origemId, destinoId);
        return;
      }

      if (relationship.tipo_relacionamento === 'conjuge') {
        addMapSet(maps.spousesByPerson, origemId, destinoId);
        addMapSet(maps.spousesByPerson, destinoId, origemId);
        return;
      }

      if (relationship.tipo_relacionamento === 'irmao') {
        addMapSet(maps.siblingsByPerson, origemId, destinoId);
        addMapSet(maps.siblingsByPerson, destinoId, origemId);
      }
    });

  return maps;
}

function inferGenerations(centralPersonId: string, maps: RelationshipMaps) {
  const generations = new Map<string, number>([[centralPersonId, 0]]);
  const queue: string[] = [centralPersonId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const personId = queue.shift();
    if (!personId || visited.has(personId)) continue;
    visited.add(personId);

    const generation = generations.get(personId) ?? 0;

    const candidates: Array<[string, number]> = [
      ...Array.from(maps.parentsByChild.get(personId) ?? []).map((parentId): [string, number] => [parentId, generation - 1]),
      ...Array.from(maps.childrenByParent.get(personId) ?? []).map((childId): [string, number] => [childId, generation + 1]),
      ...Array.from(maps.spousesByPerson.get(personId) ?? []).map((spouseId): [string, number] => [spouseId, generation]),
      ...Array.from(maps.siblingsByPerson.get(personId) ?? []).map((siblingId): [string, number] => [siblingId, generation]),
    ];

    candidates.forEach(([nextPersonId, nextGeneration]) => {
      if (nextGeneration < -4 || nextGeneration > 2) return;
      if (!generations.has(nextPersonId)) {
        generations.set(nextPersonId, nextGeneration);
        queue.push(nextPersonId);
      }
    });
  }

  return generations;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('') || 'F';
}

function getShortName(name?: string | null) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length <= 2) return parts.join(' ') || 'Pessoa';
  return [parts[0], parts[1], parts[parts.length - 1]].filter(Boolean).join(' ');
}

function getFirstName(name?: string | null) {
  return String(name ?? '').trim().split(/\s+/).filter(Boolean)[0] || 'Família';
}

function getYear(value?: string | number | null) {
  if (!value) return '';
  return String(value).match(/\b(18|19|20|21)\d{2}\b/)?.[0] ?? '';
}

function getYearsLabel(person: Pessoa) {
  const birthYear = person.permitir_exibir_data_nascimento === false ? '' : getYear(person.data_nascimento);
  const deathYear = getYear(person.data_falecimento);

  if (birthYear && deathYear) return `${birthYear} – ${deathYear}`;
  if (birthYear) return birthYear;
  if (deathYear) return `† ${deathYear}`;
  return '';
}

function isPet(person: Pessoa) {
  const entityType = String(person.humano_ou_pet ?? '').trim().toLowerCase();
  const gender = String(person.genero ?? '').trim().toLowerCase();
  return entityType === 'pet' || gender === 'pet' || gender === 'animal' || gender === 'mascote';
}

function getCardLabel(person: Pessoa, centralPersonId: string, generation: number, maps: RelationshipMaps) {
  if (person.id === centralPersonId) return 'Pessoa central';
  if (isPet(person)) return 'Pet da família';

  if (generation === 0) {
    if (maps.spousesByPerson.get(centralPersonId)?.has(person.id)) return 'Cônjuge';
    if (maps.siblingsByPerson.get(centralPersonId)?.has(person.id)) return 'Irmão ou irmã';
    return 'Núcleo familiar';
  }

  if (generation < 0) {
    if (generation === -1 && maps.parentsByChild.get(centralPersonId)?.has(person.id)) return 'Ascendente direto';
    return 'Ascendente';
  }

  if (generation === 1) return 'Descendente direto';
  if (generation === 2) return 'Nova geração';
  return 'Familiar';
}

function sortPeopleForGeneration(centralPersonId: string) {
  return (a: LinhaGeracionalCard, b: LinhaGeracionalCard) => {
    if (a.id === centralPersonId) return -1;
    if (b.id === centralPersonId) return 1;
    if (a.highlight !== b.highlight) return a.highlight ? -1 : 1;
    return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
  };
}

function buildGenerationScreens(pessoas: Pessoa[], relacionamentos: Relacionamento[], centralPersonId: string): LinhaGeracionalScreen[] {
  const maps = buildRelationshipMaps(relacionamentos);
  const generations = inferGenerations(centralPersonId, maps);
  const peopleByGeneration = new Map<number, Pessoa[]>();

  pessoas.forEach((person) => {
    const generation = generations.get(person.id);
    if (generation === undefined) return;

    const nextPeople = peopleByGeneration.get(generation) ?? [];
    nextPeople.push(person);
    peopleByGeneration.set(generation, nextPeople);
  });

  return SCREEN_DEFINITIONS.map((definition, index) => {
    const people = peopleByGeneration.get(definition.generation) ?? [];
    const cards = people
      .map((person): LinhaGeracionalCard => ({
        id: person.id,
        person,
        name: getShortName(person.nome_completo),
        label: getCardLabel(person, centralPersonId, definition.generation, maps),
        years: getYearsLabel(person),
        highlight: person.id === centralPersonId,
      }))
      .sort(sortPeopleForGeneration(centralPersonId));

    return {
      ...definition,
      position: `Geração ${index + 1} de ${SCREEN_DEFINITIONS.length}`,
      cards: cards.slice(0, MAX_CARDS_PER_SCREEN),
      truncated: cards.length > MAX_CARDS_PER_SCREEN,
    };
  });
}

function LinhaGeracionalCardView({ card, onClick }: { card: LinhaGeracionalCard; onClick: (person: Pessoa) => void }) {
  return (
    <div className="relative pl-8">
      <span className="absolute left-[13px] top-1/2 h-px w-5 -translate-y-1/2 bg-blue-200" aria-hidden="true" />
      <button
        type="button"
        onClick={() => onClick(card.person)}
        className={[
          'flex min-h-[74px] w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left shadow-sm active:scale-[0.99]',
          card.highlight
            ? 'border-blue-200 bg-blue-600 text-white shadow-blue-950/10'
            : 'border-slate-200 bg-white text-blue-950',
        ].join(' ')}
      >
        <span
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-black',
            card.highlight ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700',
          ].join(' ')}
          aria-hidden="true"
        >
          {card.person.foto_principal_url ? (
            <img src={card.person.foto_principal_url} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            getInitials(card.name)
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-black leading-tight">{card.name}</span>
          <span className={card.highlight ? 'mt-1 block truncate text-[11px] font-bold text-blue-50' : 'mt-1 block truncate text-[11px] font-bold text-slate-500'}>
            {card.label}{card.years ? ` · ${card.years}` : ''}
          </span>
        </span>
      </button>
    </div>
  );
}

function GenerationScreen({ generation, onPersonClick }: { generation: LinhaGeracionalScreen; onPersonClick: (person: Pessoa) => void }) {
  return (
    <section
      className="relative flex h-full min-w-full snap-start flex-col overflow-y-auto px-4 py-4"
      aria-label={generation.title}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 text-blue-950 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">{generation.position}</p>
          <h2 className="mt-2 text-2xl font-black leading-none tracking-[-0.035em]">{generation.title}</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">{generation.subtitle}</p>
        </div>

        <div className="relative flex flex-1 flex-col justify-center gap-3 pb-4">
          {generation.cards.length > 0 && <span className="absolute bottom-10 left-[13px] top-10 w-px bg-blue-200" aria-hidden="true" />}
          {generation.cards.length > 0 ? (
            generation.cards.map((card) => (
              <LinhaGeracionalCardView key={card.id} card={card} onClick={onPersonClick} />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-6 text-center text-sm font-bold text-slate-500">
              {SCREEN_DEFINITIONS.find((screen) => screen.id === generation.id)?.emptyLabel || 'Nenhum familiar encontrado.'}
            </div>
          )}
          {generation.truncated && (
            <p className="rounded-2xl bg-blue-50 px-3 py-2 text-center text-[11px] font-bold text-blue-700">
              Mostrando os primeiros {MAX_CARDS_PER_SCREEN} registros desta geração.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function LinhaGeracionalToolbar({ mapaFamiliarPath }: { mapaFamiliarPath: string }) {
  return (
    <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3">
        <div className="grid min-w-0 flex-1 grid-cols-4 overflow-hidden rounded-full bg-slate-100 p-1">
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className="h-10 rounded-full px-1 text-center text-[13px] font-black text-slate-600 transition active:bg-white active:text-blue-700"
            >
              {item}
            </button>
          ))}
        </div>
        <Link
          to={mapaFamiliarPath}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-[0_6px_18px_rgba(15,23,42,0.15)] active:scale-95"
          aria-label="Abrir painel da árvore familiar"
        >
          <Plus className="h-8 w-8" />
        </Link>
      </div>
    </div>
  );
}

function LinhaGeracionalBottomNav({ navigateTo }: { navigateTo: (path: string) => void }) {
  const itemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100';
  const activeItemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg bg-blue-50 px-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition active:bg-blue-100';

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.16)] backdrop-blur" data-tree-export-ignore="true">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1.5">
        <button type="button" className={activeItemClassName} onClick={() => navigateTo('/mapa-familiar')} aria-label="Abrir Home" aria-current="page">
          <HomeIcon className="h-5 w-5" />
          <span>Home</span>
        </button>
        <button type="button" className={itemClassName} onClick={() => navigateTo('/calendario-familiar')} aria-label="Abrir calendário familiar">
          <CalendarDays className="h-5 w-5" />
          <span>Calendário</span>
        </button>
        <button type="button" className={itemClassName} onClick={() => navigateTo('/forum')} aria-label="Abrir fórum">
          <MessageCircle className="h-5 w-5" />
          <span>Fórum</span>
        </button>
        <button type="button" className={itemClassName} onClick={() => navigateTo('/meus-favoritos')} aria-label="Abrir favoritos">
          <Star className="h-5 w-5" />
          <span>Favoritos</span>
        </button>
        <button type="button" className={itemClassName} onClick={() => navigateTo('/curiosidades')} aria-label="Abrir curiosidades">
          <Sparkles className="h-5 w-5" />
          <span>Curiosidades</span>
        </button>
      </div>
    </nav>
  );
}

function LinhaGeracionalLoading() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f8efe4] px-6 text-center lg:hidden">
      <div className="rounded-3xl border border-blue-100 bg-white/95 p-6 shadow-xl">
        <RefreshCw className="mx-auto h-7 w-7 animate-spin text-blue-700" aria-hidden="true" />
        <p className="mt-3 text-sm font-bold text-slate-700">Preparando linha geracional...</p>
      </div>
    </main>
  );
}

function LinhaGeracionalError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f8efe4] px-6 text-center lg:hidden">
      <div className="rounded-3xl border border-red-100 bg-white/95 p-6 shadow-xl">
        <AlertCircle className="mx-auto h-8 w-8 text-red-600" aria-hidden="true" />
        <p className="mt-3 text-sm font-bold text-red-700">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-2xl bg-blue-700 px-4 py-2 text-sm font-bold text-white"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}

export function LinhaGeracional() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const requestedPersonId = React.useMemo(() => new URLSearchParams(location.search).get('pessoa') || '', [location.search]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [searchExpanded, setSearchExpanded] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loadRevision, setLoadRevision] = React.useState(0);
  const [state, setState] = React.useState<LinhaGeracionalLoadState>({
    loading: true,
    error: null,
    centralPersonId: '',
    pessoas: [],
    relacionamentos: [],
  });
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef<number | null>(null);

  const mapaFamiliarPath = `/mapa-familiar${location.search}`;
  const mapaHorizontalDesktopPath = `/mapa-familiar-horizontal${location.search}`;

  React.useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function loadLinhaGeracional() {
      if (authLoading) return;

      if (!user?.id) {
        setState({
          loading: false,
          error: 'Entre para visualizar a linha geracional.',
          centralPersonId: '',
          pessoas: [],
          relacionamentos: [],
        });
        return;
      }

      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const linkedPersonResult = requestedPersonId
          ? { data: { pessoa_id: requestedPersonId, pessoa: await fetchPessoaById(requestedPersonId) }, error: undefined }
          : await getPrimaryLinkedPersonWithPessoa(user.id);

        if (linkedPersonResult.error) throw new Error(linkedPersonResult.error);

        const centralPersonId = linkedPersonResult.data?.pessoa_id || linkedPersonResult.data?.pessoa?.id || '';
        if (!centralPersonId) throw new Error('Nenhuma pessoa principal vinculada ao seu usuário.');

        const scopedData = await fetchScopedLinhaGeracionalData(centralPersonId);

        if (!scopedData.pessoas.some((person) => person.id === centralPersonId)) {
          const centralPerson = linkedPersonResult.data?.pessoa || await fetchPessoaById(centralPersonId);
          if (centralPerson) scopedData.pessoas.unshift(centralPerson);
        }

        if (cancelled) return;

        setState({
          loading: false,
          error: null,
          centralPersonId,
          pessoas: scopedData.pessoas,
          relacionamentos: scopedData.relacionamentos,
        });
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Não foi possível carregar a linha geracional.';
        setState({
          loading: false,
          error: message,
          centralPersonId: '',
          pessoas: [],
          relacionamentos: [],
        });
      }
    }

    void loadLinhaGeracional();

    return () => {
      cancelled = true;
    };
  }, [authLoading, loadRevision, requestedPersonId, user?.id]);

  const generationScreens = React.useMemo(
    () => buildGenerationScreens(state.pessoas, state.relacionamentos, state.centralPersonId),
    [state.centralPersonId, state.pessoas, state.relacionamentos],
  );

  const filteredSearchPeople = React.useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase('pt-BR');
    if (!term) return [];

    return state.pessoas
      .filter((person) => person.nome_completo.toLocaleLowerCase('pt-BR').includes(term))
      .slice(0, 8);
  }, [searchTerm, state.pessoas]);

  const centralPerson = state.pessoas.find((person) => person.id === state.centralPersonId);

  const navigateFromLinhaGeracional = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const goToGeneration = React.useCallback((nextIndex: number) => {
    const index = Math.max(0, Math.min(generationScreens.length - 1, nextIndex));
    const scroller = scrollerRef.current;

    setActiveIndex(index);

    if (!scroller) return;
    scroller.scrollTo({ left: scroller.clientWidth * index, behavior: 'smooth' });
  }, [generationScreens.length]);

  const handleScroll = React.useCallback(() => {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const scroller = scrollerRef.current;
      if (!scroller || scroller.clientWidth <= 0) return;

      const nextIndex = Math.max(0, Math.min(
        generationScreens.length - 1,
        Math.round(scroller.scrollLeft / scroller.clientWidth),
      ));
      setActiveIndex(nextIndex);
    });
  }, [generationScreens.length]);

  const handleSearchSubmit = React.useCallback(() => {
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm) return;

    setSearchExpanded(false);
    navigate(`/busca?q=${encodeURIComponent(trimmedSearchTerm)}`);
  }, [navigate, searchTerm]);

  const handlePersonSearchSelect = React.useCallback((pessoa: Pessoa) => {
    if (!pessoa.id) return;
    setSearchExpanded(false);
    setSearchTerm('');
    navigate(`/pessoa/${pessoa.id}`);
  }, [navigate]);

  const handlePersonClick = React.useCallback((pessoa: Pessoa) => {
    if (!pessoa.id) return;
    navigate(`/pessoa/${pessoa.id}`);
  }, [navigate]);

  if (authLoading || state.loading) return <LinhaGeracionalLoading />;
  if (state.error) return <LinhaGeracionalError message={state.error} onRetry={() => setLoadRevision((current) => current + 1)} />;

  return (
    <>
      <main className="flex min-h-[100dvh] flex-col overflow-hidden bg-white text-blue-950 lg:hidden" data-linha-geracional-mobile-root="true">
        <HomeHeader
          currentTreeViewLabel={centralPerson ? `Família de ${getFirstName(centralPerson.nome_completo)}` : 'Linha Geracional'}
          isSearchExpanded={searchExpanded}
          searchExpanded={searchExpanded}
          onSearchExpandedChange={setSearchExpanded}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          searchInputRef={searchInputRef}
          pessoasFiltradas={filteredSearchPeople}
          handleSearchSelect={handlePersonSearchSelect}
          headerActionTextClassName="hidden sm:inline"
          onCuriosities={() => navigate('/curiosidades')}
          navigateFromHome={navigateFromLinhaGeracional}
        />

        <LinhaGeracionalToolbar mapaFamiliarPath={mapaFamiliarPath} />

        <section className="min-h-0 flex-1 overflow-hidden bg-white pb-[calc(env(safe-area-inset-bottom,0px)+5.8rem)]">
          <div className="flex h-full flex-col rounded-t-2xl bg-yellow-300 p-4">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm bg-slate-50 shadow-inner">
              <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Linha Geracional</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <h1 className="truncate text-lg font-black tracking-[-0.035em] text-blue-950">
                    {generationScreens[activeIndex]?.title || 'Gerações'}
                  </h1>
                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                    {activeIndex + 1}/{generationScreens.length}
                  </span>
                </div>
              </div>

              <div
                ref={scrollerRef}
                onScroll={handleScroll}
                className="relative z-10 flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Telas de gerações familiares"
              >
                {generationScreens.map((generation) => (
                  <GenerationScreen key={generation.id} generation={generation} onPersonClick={handlePersonClick} />
                ))}
              </div>

              <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => goToGeneration(activeIndex - 1)}
                    disabled={activeIndex === 0}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-700 shadow-sm disabled:opacity-35"
                    aria-label="Geração anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="flex items-center gap-1.5" aria-label={`Geração ${activeIndex + 1} de ${generationScreens.length}`}>
                      {generationScreens.map((generation, index) => (
                        <button
                          key={generation.id}
                          type="button"
                          onClick={() => goToGeneration(index)}
                          className={[
                            'h-2 rounded-full transition-all',
                            index === activeIndex ? 'w-7 bg-blue-600' : 'w-2 bg-slate-300',
                          ].join(' ')}
                          aria-label={`Ir para ${generation.title}`}
                          aria-current={index === activeIndex ? 'step' : undefined}
                        />
                      ))}
                    </div>
                    <p className="truncate text-center text-[11px] font-bold text-slate-500">
                      Deslize para navegar entre gerações
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => goToGeneration(activeIndex + 1)}
                    disabled={activeIndex === generationScreens.length - 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-700 shadow-sm disabled:opacity-35"
                    aria-label="Próxima geração"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LinhaGeracionalBottomNav navigateTo={navigateFromLinhaGeracional} />
      </main>

      <main className="hidden min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900 lg:flex">
        <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800">
            <Network className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-black">Linha Geracional é mobile</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
            Esta nova experiência foi criada apenas para celular. No desktop, mantenha a visualização horizontal completa.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to={mapaHorizontalDesktopPath}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-cyan-800"
            >
              <UsersRound className="h-4 w-4" />
              Abrir mapa horizontal desktop
            </Link>
            <Link
              to={mapaFamiliarPath}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              <Layers className="h-4 w-4" />
              Voltar à árvore
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
