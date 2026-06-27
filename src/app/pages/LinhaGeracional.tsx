import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  AlertCircle,
  CalendarDays,
  Home as HomeIcon,
  MessageCircle,
  Network,
  RefreshCw,
  Sparkles,
  Star,
} from 'lucide-react';

import { HomeHeader } from './home/HomeHeader';
import { HomeMobileNav } from './home/HomeMobileNav';
import { MobileFamilyHorizontalMapView } from '../components/FamilyTree/MobileFamilyHorizontalMapView';
import {
  TREE_COLOR_PALETTE_CSS_VARIABLES,
  TREE_COLOR_PALETTE_STORAGE_KEY,
  TREE_COLOR_PALETTES,
  isTreeColorPalette,
  type TreeColorPalette,
} from '../components/FamilyTree/treeColorPalettes';
import type { DirectRelativeFilters } from '../components/FamilyTree/types';
import { useAuth } from '../contexts/AuthContext';
import {
  obterTodasPessoas,
  obterTodosRelacionamentos,
} from '../services/dataService';
import { getPrimaryLinkedPersonWithPessoa } from '../services/memberProfileService';
import {
  getCachedTreeData,
  setCachedTreeData,
} from '../services/treeDataCache';
import type { Pessoa, Relacionamento } from '../types';

type LinhaGeracionalLoadState = {
  loading: boolean;
  error: string | null;
  centralPersonId: string;
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
};

const FULL_HORIZONTAL_FILTERS: DirectRelativeFilters = {
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

function getStoredTreeColorPalette(): TreeColorPalette {
  if (typeof window === 'undefined') return 'white';

  const stored = window.localStorage.getItem(TREE_COLOR_PALETTE_STORAGE_KEY);
  return isTreeColorPalette(stored) ? stored : 'white';
}

function applyTreeColorPalette(value: TreeColorPalette) {
  if (typeof document === 'undefined') return;

  const palette = TREE_COLOR_PALETTES[value];
  const root = document.documentElement;

  root.dataset.treeColorPalette = value;

  TREE_COLOR_PALETTE_CSS_VARIABLES.forEach((variableName) => {
    root.style.setProperty(variableName, palette.cssVariables[variableName]);
  });
}

function getFirstPersonName(value?: string | null) {
  const clean = String(value ?? '').trim();
  return clean.split(/\s+/).filter(Boolean)[0] || 'Pessoa';
}

async function loadFullTreeData() {
  const cached = getCachedTreeData();
  if (cached?.pessoas?.length && cached?.relacionamentos) return cached;

  const [pessoas, relacionamentos] = await Promise.all([
    obterTodasPessoas(),
    obterTodosRelacionamentos(),
  ]);

  const nextData = { pessoas, relacionamentos };
  setCachedTreeData(nextData);
  return nextData;
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
    <main className="flex min-h-[100dvh] items-center justify-center px-6 text-center lg:hidden" style={{ background: 'var(--tree-palette-canvas-bg)' }}>
      <div className="rounded-3xl border border-blue-100 bg-white/95 p-6 shadow-xl">
        <RefreshCw className="mx-auto h-7 w-7 animate-spin text-blue-700" aria-hidden="true" />
        <p className="mt-3 text-sm font-bold text-slate-700">Preparando linha geracional...</p>
      </div>
    </main>
  );
}

function LinhaGeracionalError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6 text-center lg:hidden" style={{ background: 'var(--tree-palette-canvas-bg)' }}>
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
  const [searchExpanded, setSearchExpanded] = React.useState(false);
  const [mobileLegendOpen, setMobileLegendOpen] = React.useState(false);
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

  React.useEffect(() => {
    applyTreeColorPalette(getStoredTreeColorPalette());
  }, []);

  const mapaHorizontalDesktopPath = `/mapa-familiar-horizontal${location.search}`;

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
        const [treeData, linkedPersonResult] = await Promise.all([
          loadFullTreeData(),
          requestedPersonId
            ? Promise.resolve({ data: { pessoa_id: requestedPersonId }, error: undefined })
            : getPrimaryLinkedPersonWithPessoa(user.id),
        ]);

        if (linkedPersonResult.error) throw new Error(linkedPersonResult.error);

        const centralPersonId = linkedPersonResult.data?.pessoa_id || '';
        if (!centralPersonId) throw new Error('Nenhuma pessoa principal vinculada ao seu usuário.');

        if (cancelled) return;

        setState({
          loading: false,
          error: null,
          centralPersonId,
          pessoas: treeData.pessoas,
          relacionamentos: treeData.relacionamentos,
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

  const filteredSearchPeople = React.useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase('pt-BR');
    if (!term) return [];

    return state.pessoas
      .filter((person) => person.nome_completo.toLocaleLowerCase('pt-BR').includes(term))
      .slice(0, 8);
  }, [searchTerm, state.pessoas]);

  const centralPerson = React.useMemo(
    () => state.pessoas.find((person) => person.id === state.centralPersonId),
    [state.centralPersonId, state.pessoas],
  );

  const navigateFromLinhaGeracional = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

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
      <main
        className="flex min-h-[100dvh] flex-col overflow-hidden lg:hidden"
        data-linha-geracional-mobile-root="true"
        data-family-map-horizontal-root="true"
        style={{
          background: 'var(--tree-palette-canvas-bg)',
          color: 'var(--tree-palette-text-primary)',
        }}
      >
        <HomeHeader
          currentTreeViewLabel={centralPerson ? `Família de ${getFirstPersonName(centralPerson.nome_completo)}` : 'Árvore Familiar'}
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

        <HomeMobileNav
          legendOpen={mobileLegendOpen}
          onToggleLegend={() => setMobileLegendOpen((current) => !current)}
          navigateFromHome={navigateFromLinhaGeracional}
        />

        <section
          className="relative min-h-0 flex-1 overflow-hidden pb-[calc(env(safe-area-inset-bottom,0px)+5.8rem)]"
          style={{ background: 'var(--tree-palette-canvas-bg)' }}
        >
          <MobileFamilyHorizontalMapView
            pessoas={state.pessoas}
            relacionamentos={state.relacionamentos}
            centralPersonId={state.centralPersonId}
            directRelativeFilters={FULL_HORIZONTAL_FILTERS}
            onPersonClick={handlePersonClick}
            layoutRevision={loadRevision}
          />
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
            Esta experiência foi criada para celular. No desktop, mantenha a visualização horizontal completa.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to={mapaHorizontalDesktopPath}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-cyan-800"
            >
              Abrir mapa horizontal
            </Link>
            <Link
              to="/mapa-familiar"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
            >
              Voltar à árvore
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
