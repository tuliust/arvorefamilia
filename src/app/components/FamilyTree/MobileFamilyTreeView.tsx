import React from 'react';

import type { FamilyTreeActions } from './actions';
import { getPersonBirthYear, getPersonDeathYear } from '../../utils/personFields';
import type { DirectRelativeFilters, EdgeFilters, GenealogyFilters, MarriageNodeDetails, VisualLineFilters } from './types';
import type { Pessoa, Relacionamento } from '../../types';
import { buildMobileFamilyTreeModel } from './mobileFamilyTreeModel';
import { getInitials } from './personDisplay';

type MobileTreeScreen =
  | 'paternal-ancestors'
  | 'ancestors'
  | 'maternal-ancestors'
  | 'paternal-uncles'
  | 'core'
  | 'maternal-uncles'
  | 'paternal-cousins'
  | 'descendants'
  | 'maternal-cousins';

type SwipeDirection = 'up' | 'down' | 'left' | 'right';
type MobileTreeTab = 'paternal' | 'central' | 'maternal';

type TouchStartState = {
  x: number;
  y: number;
  screen: MobileTreeScreen;
  scrollElement: HTMLElement | null;
  atScrollTop: boolean;
  atScrollBottom: boolean;
};

interface MobileFamilyTreeViewProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  centralPersonId?: string;
  visiblePersonIds?: Set<string>;
  familyTreeRef?: React.RefObject<FamilyTreeActions | null>;
  onPersonClick: (pessoa: Pessoa) => void;
  onPersonView?: (pessoa: Pessoa) => void;
  onPersonEdit?: (pessoa: Pessoa) => void;
  onPersonAddConnection?: (pessoa: Pessoa) => void;
  onPersonRemove?: (pessoa: Pessoa) => void;
  onMarriageClick?: (details: MarriageNodeDetails) => void;
  selectedPersonId?: string;
  edgeFilters?: EdgeFilters;
  directRelativeFilters?: DirectRelativeFilters;
  genealogyFilters?: GenealogyFilters;
  visualLineFilters?: VisualLineFilters;
  layoutRevision?: number;
  onDirectRelationRenderedCounts?: (counts: Record<string, number>) => void;
}

const SCREEN_POSITIONS: Record<MobileTreeScreen, { column: number; row: number }> = {
  'paternal-ancestors': { column: 0, row: 0 },
  ancestors: { column: 1, row: 0 },
  'maternal-ancestors': { column: 2, row: 0 },
  'paternal-uncles': { column: 0, row: 1 },
  core: { column: 1, row: 1 },
  'maternal-uncles': { column: 2, row: 1 },
  'paternal-cousins': { column: 0, row: 2 },
  descendants: { column: 1, row: 2 },
  'maternal-cousins': { column: 2, row: 2 },
};

const DESTINATIONS: Record<MobileTreeScreen, Partial<Record<SwipeDirection, MobileTreeScreen>>> = {
  'paternal-ancestors': { right: 'ancestors' },
  ancestors: { left: 'paternal-ancestors', right: 'maternal-ancestors', down: 'core' },
  'maternal-ancestors': { left: 'ancestors' },
  'paternal-uncles': { down: 'paternal-cousins', right: 'core' },
  core: { up: 'ancestors', left: 'paternal-uncles', right: 'maternal-uncles', down: 'descendants' },
  'maternal-uncles': { down: 'maternal-cousins', left: 'core' },
  'paternal-cousins': { up: 'paternal-uncles' },
  descendants: { up: 'core' },
  'maternal-cousins': { up: 'maternal-uncles' },
};

const TABS: Array<{ id: MobileTreeTab; label: string; screen: MobileTreeScreen }> = [
  { id: 'paternal', label: 'Paterno', screen: 'paternal-uncles' },
  { id: 'central', label: 'Central', screen: 'core' },
  { id: 'maternal', label: 'Materno', screen: 'maternal-uncles' },
];

const EMPTY_COUNTS: Record<string, number> = {
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

function getTabForScreen(screen: MobileTreeScreen): MobileTreeTab {
  if (screen.startsWith('paternal')) return 'paternal';
  if (screen.startsWith('maternal')) return 'maternal';
  return 'central';
}

function getDisplayName(person?: Pessoa) {
  const name = person?.nome_completo?.trim();
  if (!name) return '';
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.length <= 2 ? name : `${parts[0]} ${parts[1]}`;
}

function getYearLine(person?: Pessoa) {
  if (!person) return '';
  const birth = getPersonBirthYear(person);
  const death = getPersonDeathYear(person);
  if (birth && death) return `${birth} — ${death}`;
  if (birth) return String(birth);
  if (death) return `† ${death}`;
  return '';
}

function isPet(person?: Pessoa) {
  const type = String(person?.tipo_entidade || '').toLowerCase();
  return type === 'pet' || type === 'animal';
}

function getGenderIcon(person?: Pessoa) {
  if (isPet(person)) return '🐾';
  const gender = String(person?.genero || person?.sexo || '').toLowerCase();
  if (gender.startsWith('f')) return '♀';
  if (gender.startsWith('m')) return '♂';
  return '○';
}

function getDestinationForScreen(screen: MobileTreeScreen, direction: SwipeDirection) {
  return DESTINATIONS[screen][direction] ?? screen;
}

function getGestureDirection(deltaX: number, deltaY: number, threshold: number): SwipeDirection | null {
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);

  if (absoluteX >= threshold && absoluteX > absoluteY * 1.15) return deltaX < 0 ? 'left' : 'right';
  if (absoluteY >= threshold && absoluteY > absoluteX * 1.15) return deltaY < 0 ? 'up' : 'down';
  return null;
}

function canScrollVertically(start: TouchStartState, direction: SwipeDirection) {
  if (!start.scrollElement) return false;
  if (direction === 'up') return !start.atScrollBottom;
  if (direction === 'down') return !start.atScrollTop;
  return false;
}

function PersonCard({
  person,
  label,
  onClick,
  compact = false,
  horizontal = false,
  prominent = false,
}: {
  person: Pessoa;
  label?: string;
  onClick: (person: Pessoa) => void;
  compact?: boolean;
  horizontal?: boolean;
  prominent?: boolean;
}) {
  const name = getDisplayName(person);
  const year = getYearLine(person);
  const photoUrl = person.foto_url?.trim();

  if (horizontal) {
    return (
      <button
        type="button"
        onClick={() => onClick(person)}
        data-family-map-mobile-card="true"
        data-family-map-color-key={isPet(person) ? 'pets' : undefined}
        className="relative flex min-h-[82px] w-full items-center gap-3 rounded-2xl border border-cyan-900/25 bg-gradient-to-br from-cyan-700 to-cyan-950 px-3 py-3 text-left text-white shadow-sm active:scale-[0.99]"
      >
        {label && (
          <span className="absolute -top-3 left-4 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">
            {label}
          </span>
        )}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/90 bg-white/10 text-2xl font-black">
          {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : getGenderIcon(person)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="break-words text-[13px] font-black uppercase leading-[1.05] tracking-[0.02em] text-white">{name}</div>
          {year && <div className="mt-1 text-xs font-bold text-white/90">{year}</div>}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      data-family-map-mobile-card="true"
      data-family-map-color-key={isPet(person) ? 'pets' : undefined}
      className={[
        'relative flex w-full flex-col items-center justify-center overflow-visible rounded-3xl border border-cyan-900/25 text-center text-white shadow-sm active:scale-[0.99]',
        prominent ? 'min-h-[190px] bg-gradient-to-br from-cyan-800 to-slate-950 px-5 py-6' : 'bg-gradient-to-br from-cyan-700 to-cyan-950',
        compact ? 'min-h-[126px] px-3 py-4' : 'min-h-[160px] px-4 py-5',
      ].join(' ')}
    >
      {label && (
        <span className="absolute -top-4 rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
          {label}
        </span>
      )}
      <div className={['flex items-center justify-center overflow-hidden rounded-full border-4 border-white/90 bg-white/10 font-black', prominent ? 'h-24 w-24 text-4xl' : compact ? 'h-16 w-16 text-2xl' : 'h-20 w-20 text-3xl'].join(' ')}>
        {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : prominent ? getInitials(name) : getGenderIcon(person)}
      </div>
      <div className={['mt-3 max-w-full break-words font-black uppercase leading-tight tracking-[0.02em] text-white', prominent ? 'text-xl' : 'text-[15px]'].join(' ')}>{name}</div>
      {year && <div className={['mt-2 font-bold text-white/90', prominent ? 'text-lg' : 'text-sm'].join(' ')}>{year}</div>}
    </button>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="relative flex min-h-[150px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 px-4 py-5 text-center text-slate-400">
      <span className="absolute -top-3 rounded-full bg-slate-200 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <span className="text-3xl" aria-hidden="true">○</span>
      <span className="mt-2 text-xs font-bold">Não informado</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-center text-[15px] font-black uppercase tracking-[0.16em] text-slate-950">
      {children}
    </h2>
  );
}

function PeopleSection({
  title,
  people,
  emptyMessage = 'Nenhum familiar encontrado neste grupo.',
  columns = 'single',
  onPersonClick,
}: {
  title: string;
  people: Pessoa[];
  emptyMessage?: string;
  columns?: 'single' | 'double' | 'triple';
  onPersonClick: (person: Pessoa) => void;
}) {
  const gridClass = columns === 'triple'
    ? 'grid-cols-2 min-[430px]:grid-cols-3'
    : columns === 'double'
      ? 'grid-cols-2'
      : 'grid-cols-1';

  return (
    <section className="relative mx-auto w-full max-w-[430px] rounded-[1.75rem] border border-cyan-900/20 bg-white/92 p-4 shadow-md backdrop-blur-sm">
      <SectionTitle>{title}</SectionTitle>
      {people.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/75 px-4 py-8 text-center text-sm font-semibold text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <div className={`grid ${gridClass} gap-3`}>
          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onClick={onPersonClick}
              horizontal={columns !== 'single'}
              compact={columns !== 'single'}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden">
      <div data-mobile-tree-scroll className="h-full overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pb-32 pt-16">
        {children}
      </div>
    </div>
  );
}

function AncestorDeepScreen({
  title,
  greatGrandparents,
  greatGreatGrandparents,
  onPersonClick,
}: {
  title: string;
  greatGrandparents: Pessoa[];
  greatGreatGrandparents: Pessoa[];
  onPersonClick: (person: Pessoa) => void;
}) {
  return (
    <ScreenShell>
      <div className="space-y-4">
        <PeopleSection title={`Bisavós ${title}`} people={greatGrandparents} columns="double" onPersonClick={onPersonClick} />
        <PeopleSection title={`Tataravós ${title}`} people={greatGreatGrandparents} columns="double" onPersonClick={onPersonClick} />
      </div>
    </ScreenShell>
  );
}

function AncestorsScreen({
  paternalGrandparents,
  maternalGrandparents,
  onPersonClick,
}: {
  paternalGrandparents: Pessoa[];
  maternalGrandparents: Pessoa[];
  onPersonClick: (person: Pessoa) => void;
}) {
  return (
    <ScreenShell>
      <div className="mx-auto grid w-full max-w-[430px] grid-cols-2 gap-3">
        <PeopleSection title="Avós paternos" people={paternalGrandparents} columns="single" onPersonClick={onPersonClick} />
        <PeopleSection title="Avós maternos" people={maternalGrandparents} columns="single" onPersonClick={onPersonClick} />
      </div>
    </ScreenShell>
  );
}

function CoreScreen({
  father,
  mother,
  central,
  onPersonClick,
}: {
  father?: Pessoa;
  mother?: Pessoa;
  central?: Pessoa;
  onPersonClick: (person: Pessoa) => void;
}) {
  return (
    <ScreenShell>
      <div className="mx-auto w-full max-w-[430px] px-0 pb-10 pt-2">
        <div className="relative mx-auto w-full max-w-[390px]">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              {father ? <PersonCard person={father} label="Pai" onClick={onPersonClick} /> : <EmptyCard label="Pai" />}
              <div className="pointer-events-none absolute left-1/2 top-full h-7 w-px -translate-x-1/2 bg-cyan-700" />
            </div>
            <div className="relative">
              {mother ? <PersonCard person={mother} label="Mãe" onClick={onPersonClick} /> : <EmptyCard label="Mãe" />}
              <div className="pointer-events-none absolute left-1/2 top-full h-7 w-px -translate-x-1/2 bg-cyan-700" />
            </div>
          </div>

          <div className="pointer-events-none relative h-12">
            <div className="absolute left-[calc(25%-3px)] right-[calc(25%-3px)] top-7 h-[3px] bg-cyan-700" />
            <div className="absolute left-1/2 top-7 h-5 w-[3px] -translate-x-1/2 bg-cyan-700" />
          </div>
        </div>

        {central && (
          <div className="relative mx-auto mt-0 w-[min(230px,calc(100vw-6rem))]">
            <PersonCard person={central} onClick={onPersonClick} prominent />
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-cyan-100 bg-white/80 px-4 py-3 text-center text-xs font-bold text-slate-600 shadow-sm">
          Deslize para cima, esquerda, direita ou baixo para navegar pelos grupos da família.
        </div>
      </div>
    </ScreenShell>
  );
}

function DescendantsScreen({
  spouses,
  siblings,
  nephews,
  children,
  pets,
  grandchildren,
  onPersonClick,
}: {
  spouses: Pessoa[];
  siblings: Pessoa[];
  nephews: Pessoa[];
  children: Pessoa[];
  pets: Pessoa[];
  grandchildren: Pessoa[];
  onPersonClick: (person: Pessoa) => void;
}) {
  return (
    <ScreenShell>
      <div className="space-y-4">
        <PeopleSection title="Cônjuges" people={spouses} columns="double" onPersonClick={onPersonClick} />
        <PeopleSection title="Irmãos e sobrinhos" people={[...siblings, ...nephews]} columns="double" onPersonClick={onPersonClick} />
        <PeopleSection title="Filhos, pets e netos" people={[...children, ...pets, ...grandchildren]} columns="double" onPersonClick={onPersonClick} />
      </div>
    </ScreenShell>
  );
}

export function MobileFamilyTreeView({
  pessoas,
  relacionamentos,
  centralPersonId,
  visiblePersonIds,
  onPersonClick,
  layoutRevision,
  onDirectRelationRenderedCounts,
}: MobileFamilyTreeViewProps) {
  const [activeScreen, setActiveScreen] = React.useState<MobileTreeScreen>('core');
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [isDraggingScreen, setIsDraggingScreen] = React.useState(false);
  const touchStartRef = React.useRef<TouchStartState | null>(null);

  const model = React.useMemo(
    () => buildMobileFamilyTreeModel(pessoas, relacionamentos, centralPersonId),
    [centralPersonId, pessoas, relacionamentos],
  );

  const isVisible = React.useCallback(
    (person: Pessoa | undefined): person is Pessoa => Boolean(person && (!visiblePersonIds || visiblePersonIds.has(person.id))),
    [visiblePersonIds],
  );

  const filterVisible = React.useCallback((people: Pessoa[]) => people.filter(isVisible), [isVisible]);

  const visiblePaternal = React.useMemo(() => ({
    parent: filterVisible(model.paternal.parent),
    grandparents: filterVisible(model.paternal.grandparents),
    greatGrandparents: filterVisible(model.paternal.greatGrandparents),
    greatGreatGrandparents: filterVisible(model.paternal.greatGreatGrandparents),
    uncles: filterVisible(model.paternal.uncles),
    cousins: filterVisible(model.paternal.cousins),
  }), [filterVisible, model.paternal]);

  const visibleMaternal = React.useMemo(() => ({
    parent: filterVisible(model.maternal.parent),
    grandparents: filterVisible(model.maternal.grandparents),
    greatGrandparents: filterVisible(model.maternal.greatGrandparents),
    greatGreatGrandparents: filterVisible(model.maternal.greatGreatGrandparents),
    uncles: filterVisible(model.maternal.uncles),
    cousins: filterVisible(model.maternal.cousins),
  }), [filterVisible, model.maternal]);

  const visibleSpouses = React.useMemo(() => filterVisible(model.spouses), [filterVisible, model.spouses]);
  const visibleSiblings = React.useMemo(() => filterVisible(model.siblings), [filterVisible, model.siblings]);
  const visibleNephews = React.useMemo(() => filterVisible(model.nephews), [filterVisible, model.nephews]);
  const visibleChildren = React.useMemo(() => filterVisible(model.children), [filterVisible, model.children]);
  const visiblePets = React.useMemo(() => filterVisible(model.pets), [filterVisible, model.pets]);
  const visibleGrandchildren = React.useMemo(() => filterVisible(model.grandchildren), [filterVisible, model.grandchildren]);

  React.useEffect(() => {
    setActiveScreen('core');
    setDragOffset({ x: 0, y: 0 });
    setIsDraggingScreen(false);
  }, [centralPersonId, layoutRevision]);

  React.useEffect(() => {
    if (!onDirectRelationRenderedCounts) return;

    onDirectRelationRenderedCounts({
      ...EMPTY_COUNTS,
      pais: Number(isVisible(model.father)) + Number(isVisible(model.mother)),
      avos: visiblePaternal.grandparents.length + visibleMaternal.grandparents.length,
      bisavos: visiblePaternal.greatGrandparents.length + visibleMaternal.greatGrandparents.length,
      tataravos: visiblePaternal.greatGreatGrandparents.length + visibleMaternal.greatGreatGrandparents.length,
      conjuge: visibleSpouses.length,
      filhos: visibleChildren.length,
      netos: visibleGrandchildren.length,
      irmaos: visibleSiblings.length,
      sobrinhos: visibleNephews.length,
      tios: visiblePaternal.uncles.length + visibleMaternal.uncles.length,
      primos: visiblePaternal.cousins.length + visibleMaternal.cousins.length,
      pets: visiblePets.length,
    });
  }, [
    isVisible,
    model.father,
    model.mother,
    onDirectRelationRenderedCounts,
    visibleChildren.length,
    visibleGrandchildren.length,
    visibleMaternal.cousins.length,
    visibleMaternal.greatGrandparents.length,
    visibleMaternal.greatGreatGrandparents.length,
    visibleMaternal.grandparents.length,
    visibleMaternal.uncles.length,
    visibleNephews.length,
    visiblePaternal.cousins.length,
    visiblePaternal.greatGrandparents.length,
    visiblePaternal.greatGreatGrandparents.length,
    visiblePaternal.grandparents.length,
    visiblePaternal.uncles.length,
    visiblePets.length,
    visibleSiblings.length,
    visibleSpouses.length,
  ]);

  const activeTab = getTabForScreen(activeScreen);
  const activePosition = SCREEN_POSITIONS[activeScreen];

  const navigateToScreen = React.useCallback((screen: MobileTreeScreen) => {
    setActiveScreen(screen);
    setDragOffset({ x: 0, y: 0 });
    setIsDraggingScreen(false);
  }, []);

  const navigateByDirection = React.useCallback((direction: SwipeDirection) => {
    setActiveScreen((current) => getDestinationForScreen(current, direction));
  }, []);

  const handleTouchStart = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;

    const target = event.target instanceof HTMLElement ? event.target : null;
    const scrollElement = target?.closest<HTMLElement>('[data-mobile-tree-scroll]') ?? null;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      screen: activeScreen,
      scrollElement,
      atScrollTop: !scrollElement || scrollElement.scrollTop <= 1,
      atScrollBottom: !scrollElement || scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 1,
    };
    setDragOffset({ x: 0, y: 0 });
    setIsDraggingScreen(false);
  }, [activeScreen]);

  const handleTouchMove = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    const touch = event.touches[0];
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const direction = getGestureDirection(deltaX, deltaY, 10);
    if (!direction) return;

    const destination = getDestinationForScreen(start.screen, direction);
    if (destination === start.screen) return;

    if ((direction === 'up' || direction === 'down') && canScrollVertically(start, direction)) return;

    event.preventDefault();
    event.stopPropagation();

    const maxX = event.currentTarget.clientWidth * 0.34;
    const maxY = event.currentTarget.clientHeight * 0.34;
    const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));

    setDragOffset({
      x: direction === 'left' || direction === 'right' ? clamp(deltaX, maxX) : 0,
      y: direction === 'up' || direction === 'down' ? clamp(deltaY, maxY) : 0,
    });
    setIsDraggingScreen(true);
  }, []);

  const handleTouchEnd = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    setDragOffset({ x: 0, y: 0 });
    setIsDraggingScreen(false);
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const direction = getGestureDirection(deltaX, deltaY, 54);
    if (!direction) return;

    const destination = getDestinationForScreen(start.screen, direction);
    if (destination === start.screen) return;

    if ((direction === 'up' || direction === 'down') && canScrollVertically(start, direction)) return;

    event.preventDefault();
    event.stopPropagation();
    navigateByDirection(direction);
  }, [navigateByDirection]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_34%,#f8fafc_100%)]" data-mobile-family-tree-root="true">
      <nav aria-label="Visualizações da árvore" className="absolute inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 py-2 pl-2 pr-16 shadow-sm backdrop-blur">
        <div className="grid w-full max-w-[330px] grid-cols-3 gap-0.5 rounded-xl bg-slate-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateToScreen(tab.screen)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={[
                'min-w-0 rounded-lg px-0.5 py-2 text-[10px] font-bold transition min-[375px]:text-[11px]',
                activeTab === tab.id ? 'bg-cyan-700 text-white shadow-sm' : 'text-slate-600 hover:bg-white',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div
        className="absolute inset-x-0 bottom-0 top-[58px] overflow-hidden overscroll-contain"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <div
          data-mobile-family-tree-stage="true"
          className={[
            'grid h-[300%] w-[300%] grid-cols-3 grid-rows-3 overflow-visible',
            isDraggingScreen ? '' : 'transition-transform duration-300 ease-out',
          ].join(' ')}
          style={{
            transform: `translate3d(calc(${-activePosition.column * (100 / 3)}% + ${dragOffset.x}px), calc(${-activePosition.row * (100 / 3)}% + ${dragOffset.y}px), 0)`,
          }}
        >
          <div className="h-full w-full overflow-hidden" data-mobile-family-tree-screen="paternal-ancestors">
            <AncestorDeepScreen
              title="paternos"
              greatGrandparents={visiblePaternal.greatGrandparents}
              greatGreatGrandparents={visiblePaternal.greatGreatGrandparents}
              onPersonClick={onPersonClick}
            />
          </div>

          <div className="h-full w-full overflow-hidden" data-mobile-family-tree-screen="ancestors">
            <AncestorsScreen
              paternalGrandparents={visiblePaternal.grandparents}
              maternalGrandparents={visibleMaternal.grandparents}
              onPersonClick={onPersonClick}
            />
          </div>

          <div className="h-full w-full overflow-hidden" data-mobile-family-tree-screen="maternal-ancestors">
            <AncestorDeepScreen
              title="maternos"
              greatGrandparents={visibleMaternal.greatGrandparents}
              greatGreatGrandparents={visibleMaternal.greatGreatGrandparents}
              onPersonClick={onPersonClick}
            />
          </div>

          <div className="h-full w-full overflow-hidden" data-mobile-family-tree-screen="paternal-uncles">
            <ScreenShell>
              <PeopleSection title="Tios paternos" people={visiblePaternal.uncles} columns="double" onPersonClick={onPersonClick} />
            </ScreenShell>
          </div>

          <div className="h-full w-full overflow-hidden" data-mobile-family-tree-screen="core">
            <CoreScreen father={isVisible(model.father) ? model.father : undefined} mother={isVisible(model.mother) ? model.mother : undefined} central={isVisible(model.central) ? model.central : undefined} onPersonClick={onPersonClick} />
          </div>

          <div className="h-full w-full overflow-hidden" data-mobile-family-tree-screen="maternal-uncles">
            <ScreenShell>
              <PeopleSection title="Tios maternos" people={visibleMaternal.uncles} columns="double" onPersonClick={onPersonClick} />
            </ScreenShell>
          </div>

          <div className="h-full w-full overflow-hidden" data-mobile-family-tree-screen="paternal-cousins">
            <ScreenShell>
              <PeopleSection title="Primos paternos" people={visiblePaternal.cousins} columns="triple" onPersonClick={onPersonClick} />
            </ScreenShell>
          </div>

          <div className="h-full w-full overflow-hidden" data-mobile-family-tree-screen="descendants">
            <DescendantsScreen
              spouses={visibleSpouses}
              siblings={visibleSiblings}
              nephews={visibleNephews}
              children={visibleChildren}
              pets={visiblePets}
              grandchildren={visibleGrandchildren}
              onPersonClick={onPersonClick}
            />
          </div>

          <div className="h-full w-full overflow-hidden" data-mobile-family-tree-screen="maternal-cousins">
            <ScreenShell>
              <PeopleSection title="Primos maternos" people={visibleMaternal.cousins} columns="triple" onPersonClick={onPersonClick} />
            </ScreenShell>
          </div>
        </div>
      </div>
    </div>
  );
}
