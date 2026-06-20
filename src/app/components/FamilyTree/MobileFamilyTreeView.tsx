import React from 'react';

import type { FamilyTreeActions } from './actions';
import { getPersonBirthYear, getPersonDeathYear } from '../../utils/personFields';
import type { EdgeFilters, GenealogyFilters, MarriageNodeDetails, VisualLineFilters } from './types';
import type { DirectRelativeFilters } from './types';
import type { Pessoa, Relacionamento } from '../../types';
import {
  buildMobileFamilyTreeModel,
  type AncestorSubgroup,
  type MobileFamilyBranch,
  type MobileFamilyTreeModel,
} from './mobileFamilyTreeModel';
import { getInitials } from './personDisplay';

type MobileTreeScreen = 'ancestors' | 'paternal-uncles' | 'core' | 'maternal-uncles' | 'paternal-cousins' | 'maternal-cousins';
type SwipeDirection = 'up' | 'down' | 'left' | 'right';

type MobileTreeTab = 'paternal' | 'central' | 'maternal';

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
  ancestors: { column: 1, row: 0 },
  'paternal-uncles': { column: 0, row: 1 },
  core: { column: 1, row: 1 },
  'maternal-uncles': { column: 2, row: 1 },
  'paternal-cousins': { column: 0, row: 2 },
  'maternal-cousins': { column: 2, row: 2 },
};

const TABS: Array<{ id: MobileTreeTab; label: string }> = [
  { id: 'paternal', label: 'Paterno' },
  { id: 'central', label: 'Central' },
  { id: 'maternal', label: 'Materno' },
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
  if (screen === 'paternal-uncles' || screen === 'paternal-cousins') return 'paternal';
  if (screen === 'maternal-uncles' || screen === 'maternal-cousins') return 'maternal';
  return 'central';
}

function getDisplayName(person?: Pessoa) {
  const name = person?.nome_completo?.trim();
  if (!name) return '';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return name;
  return `${parts[0]} ${parts[1]}`;
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

function getDestinationForScreen(
  screen: MobileTreeScreen,
  direction: SwipeDirection,
): MobileTreeScreen {
  const destinations: Partial<Record<SwipeDirection, MobileTreeScreen>> =
    screen === 'core'
      ? { up: 'ancestors', left: 'paternal-uncles', right: 'maternal-uncles' }
      : screen === 'paternal-uncles'
        ? { up: 'ancestors', down: 'paternal-cousins', right: 'core' }
        : screen === 'maternal-uncles'
          ? { up: 'ancestors', down: 'maternal-cousins', left: 'core' }
          : screen === 'paternal-cousins'
            ? { up: 'paternal-uncles' }
            : screen === 'maternal-cousins'
              ? { up: 'maternal-uncles' }
              : { down: 'core', left: 'paternal-uncles', right: 'maternal-uncles' };

  return destinations[direction] ?? screen;
}

function VitalLines({
  birthLine,
  deathLine,
  showDeathLine,
  align = 'center',
  compact = false,
  prominent = false,
}: {
  birthLine: string;
  deathLine: string;
  showDeathLine: boolean;
  align?: 'center' | 'left';
  compact?: boolean;
  prominent?: boolean;
}) {
  const textClass = prominent ? 'text-white' : 'text-slate-700';
  const iconClass = prominent ? 'text-white' : 'text-slate-700';
  const alignClass = align === 'left' ? 'items-start' : 'items-center';
  const sizeClass = compact ? 'text-[11px]' : prominent ? 'text-base' : 'text-sm';

  return (
    <div className={`mt-1 flex flex-col ${alignClass} gap-0.5 ${sizeClass} font-bold leading-tight ${textClass}`}>
      {birthLine && (
        <span className="inline-flex items-center gap-1">
          <span className={`${iconClass}`} aria-hidden="true">★</span>
          <span>{birthLine}</span>
        </span>
      )}
      {showDeathLine && deathLine && (
        <span className="inline-flex items-center gap-1">
          <span className={`${iconClass}`} aria-hidden="true">✚</span>
          <span>{deathLine}</span>
        </span>
      )}
    </div>
  );
}

function PersonCard({
  person,
  label,
  onClick,
  compact = false,
  horizontal = false,
}: {
  person: Pessoa;
  label?: string;
  onClick: (person: Pessoa) => void;
  compact?: boolean;
  horizontal?: boolean;
}) {
  const name = getDisplayName(person);
  const birthLine = getPersonBirthYear(person) ? String(getPersonBirthYear(person)) : '';
  const deathLine = getPersonDeathYear(person) ? String(getPersonDeathYear(person)) : '';
  const photoUrl = person.foto_url?.trim();

  if (horizontal) {
    return (
      <button
        type="button"
        onClick={() => onClick(person)}
        data-family-map-color-key={isPet(person) ? 'pets' : undefined}
        data-family-map-mobile-card="true"
        className="group relative flex min-h-[82px] w-full items-center gap-3 rounded-2xl border border-cyan-900/30 bg-gradient-to-br from-cyan-700 to-cyan-900 px-3 py-3 text-left text-white shadow-sm transition active:scale-[0.99]"
      >
        {label && (
          <span className="absolute -top-3 left-4 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white shadow-sm">
            {label}
          </span>
        )}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/90 bg-white/10 text-2xl font-black">
          {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : getGenderIcon(person)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="break-words text-[13px] font-black uppercase leading-[1.05] tracking-[0.02em] text-white">
            {name}
          </div>
          <VitalLines birthLine={birthLine} deathLine={deathLine} showDeathLine={Boolean(deathLine)} align="left" compact prominent />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      data-family-map-color-key={isPet(person) ? 'pets' : undefined}
      data-family-map-mobile-card="true"
      className={[
        'group relative flex flex-col items-center justify-center overflow-visible rounded-3xl border border-cyan-900/30 bg-gradient-to-br from-cyan-700 to-cyan-950 text-center text-white shadow-sm transition active:scale-[0.99]',
        compact ? 'min-h-[132px] px-3 py-4' : 'min-h-[170px] px-4 py-5',
      ].join(' ')}
    >
      {label && (
        <span className="absolute -top-4 rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white shadow-sm">
          {label}
        </span>
      )}
      <div className={['flex items-center justify-center overflow-hidden rounded-full border-4 border-white/90 bg-white/10 font-black', compact ? 'h-16 w-16 text-2xl' : 'h-20 w-20 text-3xl'].join(' ')}>
        {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : getGenderIcon(person)}
      </div>
      <div className="mt-3 max-w-full break-words text-[15px] font-black uppercase leading-tight tracking-[0.02em] text-white">
        {name}
      </div>
      <VitalLines birthLine={birthLine} deathLine={deathLine} showDeathLine={Boolean(deathLine)} prominent />
    </button>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="relative flex min-h-[150px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-4 py-5 text-center text-slate-400">
      <span className="absolute -top-3 rounded-full bg-slate-200 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <span className="text-3xl" aria-hidden="true">○</span>
      <span className="mt-2 text-xs font-bold">Não informado</span>
    </div>
  );
}

function MainPersonCard({ person, onClick }: { person: Pessoa; onClick: (person: Pessoa) => void }) {
  const name = getDisplayName(person);
  const year = getYearLine(person);
  const photoUrl = person.foto_url?.trim();

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      data-family-map-mobile-card="true"
      className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-[2rem] border border-cyan-900/30 bg-gradient-to-br from-cyan-800 to-slate-950 px-5 py-6 text-center text-white shadow-md transition active:scale-[0.99]"
    >
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/90 bg-white/10 text-4xl font-black">
        {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : getInitials(name)}
      </div>
      <div className="mt-4 break-words text-xl font-black uppercase leading-tight tracking-[0.02em] text-white">{name}</div>
      {year && (
        <div className="mt-2 flex items-center gap-1.5 text-lg font-bold text-white">
          <span aria-hidden="true">★</span>
          <span>{year}</span>
        </div>
      )}
    </button>
  );
}

function MiniSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-center text-[15px] font-black uppercase tracking-[0.16em] text-slate-950">
      {children}
    </h2>
  );
}

function VerticalRelativeScreen({
  title,
  people,
  groupId,
  expanded,
  onToggle,
  onPersonClick,
  columns = 'single',
  maxCollapsedItems = 4,
  connectHorizontal,
  connectAncestors = false,
  bottomConnector = true,
}: {
  title: string;
  people: Pessoa[];
  groupId: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  onPersonClick: (person: Pessoa) => void;
  columns?: 'single' | 'double' | 'triple';
  maxCollapsedItems?: number;
  connectHorizontal?: 'left' | 'right';
  connectAncestors?: boolean;
  bottomConnector?: boolean;
}) {
  const visiblePeople = expanded ? people : people.slice(0, maxCollapsedItems);
  const hiddenCount = Math.max(0, people.length - visiblePeople.length);
  const gridClass = columns === 'triple'
    ? 'grid-cols-2 min-[430px]:grid-cols-3'
    : columns === 'double'
      ? 'grid-cols-2'
      : 'grid-cols-1';

  return (
    <div className="relative h-full w-full overflow-hidden">
      {connectAncestors && (
        <div className="pointer-events-none absolute left-1/2 top-0 h-10 w-px -translate-x-1/2 bg-cyan-600" />
      )}
      {connectHorizontal && (
        <div
          className={[
            'pointer-events-none absolute top-1/2 z-0 h-px w-screen -translate-y-1/2 bg-cyan-600',
            connectHorizontal === 'left' ? 'right-1/2' : 'left-1/2',
          ].join(' ')}
        />
      )}
      {bottomConnector && people.length > 0 && (
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-px -translate-x-1/2 bg-cyan-600" />
      )}

      <div data-mobile-tree-scroll className="relative z-10 h-full overflow-y-auto overflow-x-visible overscroll-y-contain px-4 pb-28 pt-14">
        <section className="mx-auto max-w-[430px] rounded-[1.75rem] border border-cyan-900/20 bg-white/92 p-4 shadow-md backdrop-blur-sm">
          <MiniSectionTitle>{title}</MiniSectionTitle>
          {people.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/75 px-4 py-8 text-center text-sm font-semibold text-slate-500">
              Nenhum familiar encontrado neste grupo.
            </div>
          ) : (
            <>
              <div className={`grid ${gridClass} gap-3`}>
                {visiblePeople.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onClick={onPersonClick}
                    horizontal={columns !== 'single'}
                    compact={columns !== 'single'}
                  />
                ))}
              </div>

              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => onToggle(groupId)}
                  className="mt-3 w-full rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-900"
                >
                  Ver mais {hiddenCount} familiar{hiddenCount === 1 ? '' : 'es'}
                </button>
              )}
              {expanded && people.length > maxCollapsedItems && (
                <button
                  type="button"
                  onClick={() => onToggle(groupId)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600"
                >
                  Mostrar menos
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function AncestorGroup({ group, onPersonClick }: { group: AncestorSubgroup; onPersonClick: (person: Pessoa) => void }) {
  if (group.people.length === 0) return null;

  return (
    <section className="rounded-[1.5rem] border border-cyan-900/20 bg-white/92 p-3 shadow-sm backdrop-blur-sm">
      <MiniSectionTitle>{group.title}</MiniSectionTitle>
      <div className="grid gap-2">
        {group.people.map((person) => (
          <PersonCard key={person.id} person={person} onClick={onPersonClick} horizontal compact />
        ))}
      </div>
    </section>
  );
}

function AncestorsOverviewScreen({
  paternalGroups,
  maternalGroups,
  onPersonClick,
}: {
  paternalGroups: AncestorSubgroup[];
  maternalGroups: AncestorSubgroup[];
  onPersonClick: (person: Pessoa) => void;
}) {
  const hasAny = paternalGroups.some((group) => group.people.length > 0)
    || maternalGroups.some((group) => group.people.length > 0);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-12 w-px -translate-x-1/2 bg-cyan-600" />
      <div data-mobile-tree-scroll className="h-full overflow-y-auto overflow-x-visible px-4 pb-28 pt-16">
        {hasAny ? (
          <div className="mx-auto grid w-full max-w-[430px] grid-cols-2 gap-3">
            <div className="space-y-3">
              {paternalGroups.map((group) => <AncestorGroup key={group.id} group={group} onPersonClick={onPersonClick} />)}
            </div>
            <div className="space-y-3">
              {maternalGroups.map((group) => <AncestorGroup key={group.id} group={group} onPersonClick={onPersonClick} />)}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-sm rounded-3xl border border-dashed border-slate-300 bg-white/75 px-5 py-10 text-center text-sm font-semibold text-slate-500">
            Nenhum ancestral encontrado para esta pessoa.
          </div>
        )}
      </div>
    </div>
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
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(() => new Set());
  const touchStartRef = React.useRef<{
    x: number;
    y: number;
    atScrollTop: boolean;
    atScrollBottom: boolean;
  } | null>(null);
  const model = React.useMemo(
    () => buildMobileFamilyTreeModel(pessoas, relacionamentos, centralPersonId),
    [centralPersonId, pessoas, relacionamentos],
  );
  const isVisible = React.useCallback(
    (person: Pessoa | undefined): person is Pessoa => Boolean(
      person && (!visiblePersonIds || visiblePersonIds.has(person.id)),
    ),
    [visiblePersonIds],
  );
  const filterVisible = React.useCallback(
    (people: Pessoa[]) => people.filter(isVisible),
    [isVisible],
  );
  const toggleGroup = React.useCallback((id: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const visiblePaternal = React.useMemo<MobileFamilyBranch>(() => ({
    parent: filterVisible(model.paternal.parent),
    grandparents: filterVisible(model.paternal.grandparents),
    greatGrandparents: filterVisible(model.paternal.greatGrandparents),
    greatGreatGrandparents: filterVisible(model.paternal.greatGreatGrandparents),
    uncles: filterVisible(model.paternal.uncles),
    cousins: filterVisible(model.paternal.cousins),
  }), [filterVisible, model.paternal]);
  const visibleMaternal = React.useMemo<MobileFamilyBranch>(() => ({
    parent: filterVisible(model.maternal.parent),
    grandparents: filterVisible(model.maternal.grandparents),
    greatGrandparents: filterVisible(model.maternal.greatGrandparents),
    greatGreatGrandparents: filterVisible(model.maternal.greatGreatGrandparents),
    uncles: filterVisible(model.maternal.uncles),
    cousins: filterVisible(model.maternal.cousins),
  }), [filterVisible, model.maternal]);

  React.useEffect(() => {
    setActiveScreen('core');
    setDragOffset({ x: 0, y: 0 });
    setIsDraggingScreen(false);
  }, [centralPersonId, layoutRevision]);

  React.useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-mobile-family-tree-root="true"]');
    if (!root) return;
    root.setAttribute('data-mobile-family-tree-active-screen', activeScreen);
  }, [activeScreen]);

  const navigateByDirection = React.useCallback((direction: SwipeDirection) => {
    setActiveScreen((current) => getDestinationForScreen(current, direction));
  }, []);

  const handleTouchStart = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    setDragOffset({ x: 0, y: 0 });
    setIsDraggingScreen(false);
    const touch = event.touches[0];
    const target = event.target as HTMLElement;
    const scrollElement = target.closest<HTMLElement>('[data-mobile-tree-scroll]');
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      atScrollTop: !scrollElement || scrollElement.scrollTop <= 1,
      atScrollBottom: !scrollElement || scrollElement.scrollTop + scrollElement.clientHeight
        >= scrollElement.scrollHeight - 1,
    };
  }, []);

  const handleTouchMove = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    const touch = event.touches[0];
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const absoluteX = Math.abs(deltaX);
    const absoluteY = Math.abs(deltaY);
    const previewThreshold = 10;

    let direction: SwipeDirection | null = null;
    let axis: 'x' | 'y' | null = null;

    if (absoluteX >= previewThreshold && absoluteX > absoluteY * 1.2) {
      direction = deltaX < 0 ? 'left' : 'right';
      axis = 'x';
    } else if (absoluteY >= previewThreshold && absoluteY > absoluteX * 1.2) {
      direction = deltaY < 0 ? 'up' : 'down';
      axis = 'y';

      if (
        (direction === 'up' && !start.atScrollTop)
        || (direction === 'down' && !start.atScrollBottom)
      ) {
        setDragOffset({ x: 0, y: 0 });
        setIsDraggingScreen(false);
        return;
      }
    }

    if (!direction || !axis) {
      setDragOffset({ x: 0, y: 0 });
      setIsDraggingScreen(false);
      return;
    }

    const destination = getDestinationForScreen(activeScreen, direction);
    if (destination === activeScreen) {
      setDragOffset({ x: 0, y: 0 });
      setIsDraggingScreen(false);
      return;
    }

    const maxX = event.currentTarget.clientWidth * 0.42;
    const maxY = event.currentTarget.clientHeight * 0.42;
    const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));

    setDragOffset({
      x: axis === 'x' ? clamp(deltaX, maxX) : 0,
      y: axis === 'y' ? clamp(deltaY, maxY) : 0,
    });
    setIsDraggingScreen(true);
  }, [activeScreen]);

  const handleTouchEnd = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    setDragOffset({ x: 0, y: 0 });
    setIsDraggingScreen(false);
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const absoluteX = Math.abs(deltaX);
    const absoluteY = Math.abs(deltaY);
    const threshold = 56;

    if (absoluteX >= threshold && absoluteX > absoluteY * 1.2) {
      navigateByDirection(deltaX < 0 ? 'left' : 'right');
      return;
    }
    if (absoluteY < threshold || absoluteY <= absoluteX * 1.2) return;

    const direction: SwipeDirection = deltaY < 0 ? 'up' : 'down';
    if (
      (direction === 'up' && !start.atScrollTop)
      || (direction === 'down' && !start.atScrollBottom)
    ) return;
    navigateByDirection(direction);
  }, [navigateByDirection]);

  const visibleSpouses = filterVisible(model.spouses);
  const visibleSiblings = filterVisible(model.siblings);
  const visibleNephews = filterVisible(model.nephews);
  const visibleChildren = filterVisible(model.children);
  const visiblePets = filterVisible(model.pets);
  const visibleGrandchildren = filterVisible(model.grandchildren);
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

  const paternalAncestorGroups: AncestorSubgroup[] = [
    { id: 'paternal-great-great-grandparents', title: 'Tataravós paternos', people: visiblePaternal.greatGreatGrandparents },
    { id: 'paternal-great-grandparents', title: 'Bisavós paternos', people: visiblePaternal.greatGrandparents },
    { id: 'paternal-grandparents', title: 'Avós paternos', people: visiblePaternal.grandparents },
  ];
  const maternalAncestorGroups: AncestorSubgroup[] = [
    { id: 'maternal-great-great-grandparents', title: 'Tataravós maternos', people: visibleMaternal.greatGreatGrandparents },
    { id: 'maternal-great-grandparents', title: 'Bisavós maternos', people: visibleMaternal.greatGrandparents },
    { id: 'maternal-grandparents', title: 'Avós maternos', people: visibleMaternal.grandparents },
  ];
  const hasPaternalAncestors = paternalAncestorGroups.some((group) => group.people.length > 0);
  const hasMaternalAncestors = maternalAncestorGroups.some((group) => group.people.length > 0);
  const activeTab = getTabForScreen(activeScreen);
  const activePosition = SCREEN_POSITIONS[activeScreen];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_34%,#f8fafc_100%)]" data-mobile-family-tree-root="true">
      <nav
        aria-label="Visualizações da árvore"
        className="absolute inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 py-2 pl-2 pr-16 shadow-sm backdrop-blur"
      >
        <div className="grid w-full max-w-[330px] grid-cols-3 gap-0.5 rounded-xl bg-slate-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveScreen(
                  tab.id === 'paternal'
                    ? 'paternal-uncles'
                    : tab.id === 'maternal'
                      ? 'maternal-uncles'
                      : 'core',
                );
              }}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={[
                'min-w-0 rounded-lg px-0.5 py-2 text-[10px] font-bold transition min-[375px]:text-[11px]',
                activeTab === tab.id
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white',
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
          <div className="col-start-2 row-start-1 h-full w-full overflow-visible" data-mobile-family-tree-screen="ancestors">
            <AncestorsOverviewScreen
              paternalGroups={paternalAncestorGroups}
              maternalGroups={maternalAncestorGroups}
              onPersonClick={onPersonClick}
            />
          </div>

          <div className="col-start-1 row-start-2 h-full w-full overflow-visible" data-mobile-family-tree-screen="paternal-uncles">
            <VerticalRelativeScreen
              title="Tios Paternos"
              people={visiblePaternal.uncles}
              groupId="core-parent-branch-left-uncles"
              expanded={expandedGroups.has('core-parent-branch-left-uncles')}
              onToggle={toggleGroup}
              onPersonClick={onPersonClick}
              columns="double"
              maxCollapsedItems={6}
              connectHorizontal="left"
              connectAncestors={hasPaternalAncestors}
            />
          </div>

          <div className="relative col-start-2 row-start-2 h-full w-full overflow-visible" data-mobile-family-tree-screen="core">
            <div
              data-mobile-tree-scroll
              className="h-full overflow-y-auto overflow-x-visible overscroll-y-contain"
            >
              <div className="mx-auto w-full max-w-[430px] px-4 pb-28 pt-10">
                <div className="relative mx-auto w-full max-w-[390px]">
                  {hasPaternalAncestors && (
                    <div className="pointer-events-none absolute bottom-full left-1/4 h-10 w-px -translate-x-1/2 bg-cyan-600" />
                  )}
                  {hasMaternalAncestors && (
                    <div className="pointer-events-none absolute bottom-full right-1/4 h-10 w-px translate-x-1/2 bg-cyan-600" />
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative z-10">
                      <div className="pointer-events-none absolute right-full top-1/2 z-0 h-px w-screen -translate-y-1/2 bg-cyan-600" />
                      {isVisible(model.father)
                        ? <PersonCard person={model.father} label="Pai" onClick={onPersonClick} />
                        : <EmptyCard label="Pai" />}
                      <div className="pointer-events-none absolute left-1/2 top-full h-7 w-px -translate-x-1/2 bg-cyan-600" />
                    </div>

                    <div className="relative z-10">
                      <div className="pointer-events-none absolute left-full top-1/2 z-0 h-px w-screen -translate-y-1/2 bg-cyan-600" />
                      {isVisible(model.mother)
                        ? <PersonCard person={model.mother} label="Mãe" onClick={onPersonClick} />
                        : <EmptyCard label="Mãe" />}
                      <div className="pointer-events-none absolute left-1/2 top-full h-7 w-px -translate-x-1/2 bg-cyan-600" />
                    </div>
                  </div>

                  <div className="pointer-events-none relative h-12">
                    <div className="absolute left-[calc(25%-3px)] right-[calc(25%-3px)] top-7 h-px bg-cyan-600" />
                    <div className="absolute left-1/2 top-7 h-5 w-px -translate-x-1/2 bg-cyan-600" />
                  </div>
                </div>

                {isVisible(model.central) && (
                  <div className="relative mx-auto mt-0 w-[min(230px,calc(100vw-6rem))]">
                    <MainPersonCard person={model.central} onClick={onPersonClick} />
                  </div>
                )}

                <div className="relative mx-auto mt-6 h-9 w-full max-w-[330px]">
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan-600" />
                  <div className="absolute left-3 right-3 top-6 h-px bg-cyan-600" />
                </div>

                <div className="grid grid-cols-2 items-start gap-3">
                  {visibleSiblings.map((person) => (
                    <PersonCard key={person.id} person={person} label="Irmão" onClick={onPersonClick} horizontal compact />
                  ))}
                  {visibleNephews.map((person) => (
                    <PersonCard key={person.id} person={person} label="Sobrinho" onClick={onPersonClick} horizontal compact />
                  ))}
                  {visibleSpouses.map((person) => (
                    <PersonCard key={person.id} person={person} label="Cônjuge" onClick={onPersonClick} horizontal compact />
                  ))}
                  {visiblePets.map((person) => (
                    <PersonCard key={person.id} person={person} label="Pet" onClick={onPersonClick} horizontal compact />
                  ))}
                  {visibleChildren.map((person) => (
                    <PersonCard key={person.id} person={person} label="Filho" onClick={onPersonClick} horizontal compact />
                  ))}
                  {visibleGrandchildren.map((person) => (
                    <PersonCard key={person.id} person={person} label="Neto" onClick={onPersonClick} horizontal compact />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-start-3 row-start-2 h-full w-full overflow-visible" data-mobile-family-tree-screen="maternal-uncles">
            <VerticalRelativeScreen
              title="Tios Maternos"
              people={visibleMaternal.uncles}
              groupId="core-parent-branch-right-uncles"
              expanded={expandedGroups.has('core-parent-branch-right-uncles')}
              onToggle={toggleGroup}
              onPersonClick={onPersonClick}
              columns="double"
              maxCollapsedItems={6}
              connectHorizontal="right"
              connectAncestors={hasMaternalAncestors}
            />
          </div>

          <div className="col-start-1 row-start-3 h-full w-full overflow-visible" data-mobile-family-tree-screen="paternal-cousins">
            <VerticalRelativeScreen
              title="Primos Paternos"
              people={visiblePaternal.cousins}
              groupId="core-parent-branch-left-cousins"
              expanded
              onToggle={toggleGroup}
              onPersonClick={onPersonClick}
              columns="triple"
              maxCollapsedItems={visiblePaternal.cousins.length}
              bottomConnector={false}
            />
          </div>

          <div className="col-start-3 row-start-3 h-full w-full overflow-visible" data-mobile-family-tree-screen="maternal-cousins">
            <VerticalRelativeScreen
              title="Primos Maternos"
              people={visibleMaternal.cousins}
              groupId="core-parent-branch-right-cousins"
              expanded
              onToggle={toggleGroup}
              onPersonClick={onPersonClick}
              columns="triple"
              maxCollapsedItems={visibleMaternal.cousins.length}
              bottomConnector={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
