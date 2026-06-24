import React from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronLeft, ChevronRight, Network, UsersRound } from 'lucide-react';

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
      <span className="absolute left-[13px] top-1/2 h-px w-5 -translate-y-1/2 bg-cyan-200/70" aria-hidden="true" />
      <article
        className={[
          'flex min-h-[74px] items-center gap-3 rounded-2xl border px-3 py-2 shadow-sm',
          card.highlight
            ? 'border-cyan-200 bg-cyan-700 text-white shadow-cyan-950/20'
            : 'border-white/10 bg-white text-slate-950',
        ].join(' ')}
      >
        <span
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black',
            card.highlight ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-800',
          ].join(' ')}
          aria-hidden="true"
        >
          {getInitials(card.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-black leading-tight">{card.name}</span>
          <span className={card.highlight ? 'mt-1 block truncate text-[11px] font-bold text-cyan-50' : 'mt-1 block truncate text-[11px] font-bold text-slate-500'}>
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
      className="relative flex h-full min-w-full snap-start flex-col overflow-y-auto px-4 pb-28 pt-28"
      aria-label={generation.title}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/10 p-4 text-white shadow-sm backdrop-blur">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">{generation.position}</p>
          <h2 className="mt-2 text-2xl font-black leading-none">{generation.title}</h2>
          <p className="mt-2 text-sm font-semibold text-cyan-50/85">{generation.subtitle}</p>
        </div>

        <div className="relative flex flex-1 flex-col justify-center gap-3">
          <span className="absolute bottom-8 left-[13px] top-8 w-px bg-cyan-200/45" aria-hidden="true" />
          {generation.cards.map((card) => (
            <LinhaGeracionalCardView key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function LinhaGeracional() {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef<number | null>(null);

  const mapaFamiliarPath = `/mapa-familiar${location.search}`;
  const mapaHorizontalDesktopPath = `/mapa-familiar-horizontal${location.search}`;

  React.useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
  }, []);

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

      setActiveIndex(Math.round(scroller.scrollLeft / scroller.clientWidth));
    });
  }, []);

  return (
    <>
      <main className="relative h-[100dvh] overflow-hidden bg-slate-950 text-white lg:hidden" data-linha-geracional-mobile-root="true">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_34%),linear-gradient(135deg,#0f172a,#164e63_58%,#042f2e)]" />

        <header className="absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-slate-950/75 px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] text-white shadow-lg backdrop-blur">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100">Nova experiência mobile</p>
              <h1 className="mt-1 truncate text-lg font-black leading-tight">Linha Geracional</h1>
            </div>
            <Link
              to={mapaFamiliarPath}
              className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white backdrop-blur active:scale-95"
            >
              Árvore
            </Link>
          </div>
        </header>

        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="relative z-10 flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Telas de gerações familiares"
        >
          {GENERATION_SCREENS.map((generation) => (
            <GenerationScreen key={generation.id} generation={generation} />
          ))}
        </div>

        <footer className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/80 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-3 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToGeneration(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white disabled:opacity-35"
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
                      index === activeIndex ? 'w-7 bg-cyan-200' : 'w-2 bg-white/35',
                    ].join(' ')}
                    aria-label={`Ir para ${generation.title}`}
                    aria-current={index === activeIndex ? 'step' : undefined}
                  />
                ))}
              </div>
              <p className="truncate text-center text-[11px] font-bold text-cyan-50/80">
                Deslize para navegar entre gerações
              </p>
            </div>

            <button
              type="button"
              onClick={() => goToGeneration(activeIndex + 1)}
              disabled={activeIndex === GENERATION_SCREENS.length - 1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white disabled:opacity-35"
              aria-label="Próxima geração"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </footer>
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
