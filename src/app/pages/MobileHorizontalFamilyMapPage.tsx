import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, RefreshCw, UsersRound } from 'lucide-react';

import { MobileFamilyHorizontalMapFilteredView } from '../components/FamilyTree/MobileFamilyHorizontalMapFilteredView';
import type { DirectRelativeFilters, DirectRelativeGroup } from '../components/FamilyTree/types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { getPrimaryLinkedPersonWithPessoa } from '../services/memberProfileService';
import type { Pessoa, Relacionamento } from '../types';

const MOBILE_HORIZONTAL_MAX_WAVES = 4;
const MOBILE_HORIZONTAL_MAX_PEOPLE = 260;
const SUPABASE_IN_CHUNK_SIZE = 80;

const MOBILE_HORIZONTAL_FILTERS: DirectRelativeFilters = {
  pais: true,
  avos: true,
  bisavos: true,
  tataravos: true,
  conjuge: true,
  filhos: true,
  netos: true,
  irmaos: true,
  sobrinhos: true,
  tios: true,
  primos: true,
  pets: true,
};

const EMPTY_COUNTS: Record<DirectRelativeGroup, number> = {
  pais: 0,
  avos: 0,
  bisavos: 0,
  tataravos: 0,
  conjuge: 0,
  filhos: 0,
  netos: 0,
  irmaos: 0,
  sobrinhos: 0,
  tios: 0,
  primos: 0,
  pets: 0,
};

const PESSOA_SELECT = [
  'id',
  'nome_completo',
  'data_nascimento',
  'local_nascimento',
  'data_falecimento',
  'local_falecimento',
  'falecido',
  'foto_principal_url',
  'genero',
  'humano_ou_pet',
  'lado',
  'manual_generation',
].join(',');

const RELACIONAMENTO_SELECT = [
  'id',
  'pessoa_origem_id',
  'pessoa_destino_id',
  'tipo_relacionamento',
  'subtipo_relacionamento',
  'data_casamento',
  'data_separacao',
  'local_casamento',
  'local_separacao',
  'ativo',
  'observacoes',
].join(',');

type MobileHorizontalLoadState = {
  loading: boolean;
  error: string | null;
  centralPersonId: string;
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
};

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

function getFirstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] || 'Família';
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

async function fetchScopedTreeData(centralPersonId: string) {
  const personIds = new Set<string>([centralPersonId]);
  const relationshipsByKey = new Map<string, Relacionamento>();
  let frontier = new Set<string>([centralPersonId]);

  for (let wave = 0; wave < MOBILE_HORIZONTAL_MAX_WAVES && frontier.size > 0; wave += 1) {
    const relationships = await fetchRelationshipsForIds(Array.from(frontier));
    const nextFrontier = new Set<string>();

    relationships.forEach((relationship) => {
      relationshipsByKey.set(getRelationshipKey(relationship), relationship);

      [relationship.pessoa_origem_id, relationship.pessoa_destino_id].forEach((personId) => {
        if (!personId || personIds.has(personId)) return;
        if (personIds.size >= MOBILE_HORIZONTAL_MAX_PEOPLE) return;

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

function MobileHorizontalLoading({ label = 'Preparando mapa genealógico...' }: { label?: string }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#f8efe4] px-6 text-center">
      <div className="rounded-3xl border border-cyan-100 bg-white/95 p-6 shadow-xl">
        <RefreshCw className="mx-auto h-7 w-7 animate-spin text-cyan-700" aria-hidden="true" />
        <p className="mt-3 text-sm font-bold text-slate-700">{label}</p>
      </div>
    </div>
  );
}

function MobileHorizontalError({ message }: { message: string }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#f8efe4] px-6 text-center">
      <div className="rounded-3xl border border-red-100 bg-white/95 p-6 shadow-xl">
        <p className="text-sm font-bold text-red-700">{message}</p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white"
          >
            Tentar novamente
          </button>
          <Link to="/mapa-familiar" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">
            Voltar para árvore
          </Link>
        </div>
      </div>
    </div>
  );
}

export function MobileHorizontalFamilyMapPage() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const requestedPersonId = React.useMemo(() => new URLSearchParams(location.search).get('pessoa') || '', [location.search]);
  const [renderedCounts, setRenderedCounts] = React.useState<Record<DirectRelativeGroup, number>>(EMPTY_COUNTS);
  const [state, setState] = React.useState<MobileHorizontalLoadState>({
    loading: true,
    error: null,
    centralPersonId: '',
    pessoas: [],
    relacionamentos: [],
  });

  React.useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadMobileHorizontalTree() {
      if (!user?.id) {
        setState({
          loading: false,
          error: 'Entre para visualizar o mapa familiar.',
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

        if (!centralPersonId) {
          throw new Error('Nenhuma pessoa principal vinculada ao seu usuário.');
        }

        const scopedData = await fetchScopedTreeData(centralPersonId);

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

        console.info('[MobileHorizontalFamilyMapPage] mapa mobile carregado', {
          centralPersonId,
          pessoas: scopedData.pessoas.length,
          relacionamentos: scopedData.relacionamentos.length,
        });
      } catch (error) {
        if (cancelled) return;

        const message = error instanceof Error ? error.message : 'Não foi possível carregar o mapa horizontal mobile.';
        console.error('[MobileHorizontalFamilyMapPage] erro ao carregar mapa mobile', error);

        setState({
          loading: false,
          error: message,
          centralPersonId: '',
          pessoas: [],
          relacionamentos: [],
        });
      }
    }

    loadMobileHorizontalTree();

    return () => {
      cancelled = true;
    };
  }, [authLoading, requestedPersonId, user?.id]);

  if (authLoading || state.loading) return <MobileHorizontalLoading />;
  if (state.error) return <MobileHorizontalError message={state.error} />;

  const centralPerson = state.pessoas.find((person) => person.id === state.centralPersonId);

  return (
    <div className="min-h-[100dvh] bg-[#f8efe4]" data-mobile-horizontal-family-map-page="true">
      <header className="fixed inset-x-0 top-0 z-[80] border-b border-slate-200 bg-white/95 px-3 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            to={`/mapa-familiar${location.search}`}
            aria-label="Voltar para árvore familiar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-700">Linha Geracional</p>
            <h1 className="truncate text-sm font-black text-slate-950">
              {centralPerson ? `Família de ${getFirstName(centralPerson.nome_completo)}` : 'Mapa familiar'}
            </h1>
          </div>
          <div className="rounded-2xl bg-cyan-50 px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-[0.08em] text-cyan-800">
            <UsersRound className="mx-auto h-4 w-4" aria-hidden="true" />
            {Object.values(renderedCounts).reduce((total, count) => total + count, 0)} vínculos
          </div>
        </div>
      </header>

      <main className="fixed inset-x-0 bottom-0 top-[calc(env(safe-area-inset-top,0px)+4.65rem)] overflow-hidden">
        <MobileFamilyHorizontalMapFilteredView
          pessoas={state.pessoas}
          relacionamentos={state.relacionamentos}
          centralPersonId={state.centralPersonId}
          directRelativeFilters={MOBILE_HORIZONTAL_FILTERS}
          onPersonClick={(person) => navigate(`/pessoa/${person.id}`)}
          layoutRevision={state.pessoas.length + state.relacionamentos.length}
          onDirectRelationRenderedCounts={setRenderedCounts}
        />
      </main>
    </div>
  );
}
