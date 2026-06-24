import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  MessageCircle,
  Network,
  Plus,
  Search,
  Sparkles,
  Star,
  UsersRound,
} from 'lucide-react';

import { HomeHeader } from './home/HomeHeader';
import type { Pessoa } from '../types';

type LinhaGeracionalCard = {
  id: string;
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
  cards: LinhaGeracionalCard[];
};

const GENERATION_SCREENS: LinhaGeracionalScreen[] = [
  {
    id: 'tataravos',
    title: 'Tataravós',
    subtitle: 'Origem remota da família',
    position: 'Geração 1 de 6',
    cards: [
      { id: 'tataravo-1', name: 'Ancestral materno', label: 'Linha materna', years: 'séc. XIX' },
      { id: 'tataravo-2', name: 'Ancestral paterno', label: 'Linha paterna', years: 'séc. XIX' },
    ],
  },
  {
    id: 'bisavos',
    title: 'Bisavós',
    subtitle: 'Ramos familiares de origem',
    position: 'Geração 2 de 6',
    cards: [
      { id: 'bisavo-1', name: 'Bisavó materna', label: 'Ascendente', years: '1890 – 1975' },
      { id: 'bisavo-2', name: 'Bisavô materno', label: 'Ascendente', years: '1888 – 1968' },
      { id: 'bisavo-3', name: 'Bisavó paterna', label: 'Ascendente', years: '1896 – 1981' },
    ],
  },
  {
    id: 'avos',
    title: 'Avós',
    subtitle: 'Geração de ligação familiar',
    position: 'Geração 3 de 6',
    cards: [
      { id: 'avo-1', name: 'Avó materna', label: 'Família materna', years: '1922 – 2008' },
      { id: 'avo-2', name: 'Avô materno', label: 'Família materna', years: '1919 – 1999' },
      { id: 'avo-3', name: 'Avó paterna', label: 'Família paterna', years: '1927 – 2012' },
      { id: 'avo-4', name: 'Avô paterno', label: 'Família paterna', years: '1924 – 2001' },
    ],
  },
  {
    id: 'pais',
    title: 'Pais e tios',
    subtitle: 'Geração anterior direta',
    position: 'Geração 4 de 6',
    cards: [
      { id: 'pai-1', name: 'Mãe', label: 'Ascendente direta', years: '1956' },
      { id: 'pai-2', name: 'Pai', label: 'Ascendente direto', years: '1954' },
      { id: 'tio-1', name: 'Tia', label: 'Colateral', years: '1959' },
    ],
  },
  {
    id: 'nucleo',
    title: 'Núcleo',
    subtitle: 'Pessoa central e vínculos próximos',
    position: 'Geração 5 de 6',
    cards: [
      { id: 'central', name: 'Pessoa central', label: 'Referência do mapa', years: '1989', highlight: true },
      { id: 'conjuge', name: 'Cônjuge', label: 'Vínculo afetivo', years: '1988' },
      { id: 'irmao', name: 'Irmão', label: 'Mesmo núcleo familiar', years: '1992' },
    ],
  },
  {
    id: 'descendentes',
    title: 'Descendentes',
    subtitle: 'Filhos, netos e novos ramos',
    position: 'Geração 6 de 6',
    cards: [
      { id: 'filho-1', name: 'Filho ou filha', label: 'Descendente direto' },
      { id: 'neto-1', name: 'Neto ou neta', label: 'Nova geração' },
    ],
  },
];

const TOOLBAR_ITEMS = ['Formato', 'Cor', 'Filtros', 'Zoom'];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('') || 'F';
}

function LinhaGeracionalCardView({ card }: { card: LinhaGeracionalCard }) {
  return (
    <div className="relative pl-8">
      <span className="absolute left-[13px] top-1/2 h-px w-5 -translate-y-1/2 bg-blue-200" aria-hidden="true" />
      <article
        className={[
          'flex min-h-[74px] items-center gap-3 rounded-2xl border px-3 py-2 shadow-sm',
          card.highlight
            ? 'border-blue-200 bg-blue-600 text-white shadow-blue-950/10'
            : 'border-slate-200 bg-white text-blue-950',
        ].join(' ')}
      >
        <span
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black',
            card.highlight ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700',
          ].join(' ')}
          aria-hidden="true"
        >
          {getInitials(card.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-black leading-tight">{card.name}</span>
          <span className={card.highlight ? 'mt-1 block truncate text-[11px] font-bold text-blue-50' : 'mt-1 block truncate text-[11px] font-bold text-slate-500'}>
            {card.label}{card.years ? ` · ${card.years}` : ''}
          </span>
        </span>
      </article>
    </div>
  );
}

function GenerationScreen({ generation }: { generation: LinhaGeracionalScreen }) {
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
          <span className="absolute bottom-10 left-[13px] top-10 w-px bg-blue-200" aria-hidden="true" />
          {generation.cards.map((card) => (
            <LinhaGeracionalCardView key={card.id} card={card} />
          ))}
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

export function LinhaGeracional() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [searchExpanded, setSearchExpanded] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef<number | null>(null);

  const mapaFamiliarPath = `/mapa-familiar${location.search}`;
  const mapaHorizontalDesktopPath = `/mapa-familiar-horizontal${location.search}`;

  React.useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
  }, []);

  const navigateFromLinhaGeracional = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const goToGeneration = React.useCallback((nextIndex: number) => {
    const index = Math.max(0, Math.min(GENERATION_SCREENS.length - 1, nextIndex));
    const scroller = scrollerRef.current;

    setActiveIndex(index);

    if (!scroller) return;
    scroller.scrollTo({ left: scroller.clientWidth * index, behavior: 'smooth' });
  }, []);

  const handleScroll = React.useCallback(() => {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const scroller = scrollerRef.current;
      if (!scroller || scroller.clientWidth <= 0) return;

      const nextIndex = Math.max(0, Math.min(
        GENERATION_SCREENS.length - 1,
        Math.round(scroller.scrollLeft / scroller.clientWidth),
      ));
      setActiveIndex(nextIndex);
    });
  }, []);

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

  return (
    <>
      <main className="flex min-h-[100dvh] flex-col overflow-hidden bg-white text-blue-950 lg:hidden" data-linha-geracional-mobile-root="true">
        <HomeHeader
          currentTreeViewLabel="Linha Geracional"
          isSearchExpanded={searchExpanded}
          searchExpanded={searchExpanded}
          onSearchExpandedChange={setSearchExpanded}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          searchInputRef={searchInputRef}
          pessoasFiltradas={[]}
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
                    {GENERATION_SCREENS[activeIndex]?.title || 'Gerações'}
                  </h1>
                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                    {activeIndex + 1}/{GENERATION_SCREENS.length}
                  </span>
                </div>
              </div>

              <div
                ref={scrollerRef}
                onScroll={handleScroll}
                className="relative z-10 flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Telas de gerações familiares"
              >
                {GENERATION_SCREENS.map((generation) => (
                  <GenerationScreen key={generation.id} generation={generation} />
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
                    <div className="flex items-center gap-1.5" aria-label={`Geração ${activeIndex + 1} de ${GENERATION_SCREENS.length}`}>
                      {GENERATION_SCREENS.map((generation, index) => (
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
                    disabled={activeIndex === GENERATION_SCREENS.length - 1}
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
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Voltar à árvore
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
