import React from 'react';
import { Cross, PawPrint, Star, UserRound } from 'lucide-react';

import type { Pessoa, Relacionamento } from '../../types';
import { isPetFamilyMember } from '../../utils/personEntity';
import { getInitials } from '../../utils/personFields';
import { FamilyTree, type FamilyTreeActions } from './FamilyTree';
import {
  buildMobileFamilyTreeModel,
  type MobileFamilyBranch,
} from './mobileFamilyTreeModel';
import type {
  DirectRelativeFilters,
  DirectRelativeGroup,
  EdgeFilters,
  GenealogyFilters,
  MarriageNodeDetails,
  VisualLineFilters,
} from './types';

type MobileTreeTab = 'core' | 'paternal' | 'maternal' | 'complete';

type CardVariant = 'default' | 'sibling' | 'pet' | 'mini';

type GroupColumns = 'single' | 'double' | 'triple';

type RelativeScreenKind = 'default' | 'uncles' | 'cousins';

type AncestorSubgroup = {
  id: string;
  title: string;
  people: Pessoa[];
};

interface MobileFamilyTreeViewProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  centralPersonId: string;
  visiblePersonIds?: Set<string>;
  familyTreeRef: React.Ref<FamilyTreeActions>;
  onPersonClick: (pessoa: Pessoa) => void;
  onPersonView: (pessoa: Pessoa) => void;
  onPersonEdit: (pessoa: Pessoa) => void;
  onPersonAddConnection: (pessoa: Pessoa) => void;
  onPersonRemove: (pessoa: Pessoa) => void;
  onMarriageClick: (details: MarriageNodeDetails) => void;
  selectedPersonId?: string;
  edgeFilters: EdgeFilters;
  directRelativeFilters: DirectRelativeFilters;
  genealogyFilters: GenealogyFilters;
  visualLineFilters: VisualLineFilters;
  layoutRevision: number;
  onDirectRelationRenderedCounts?: (counts: Record<DirectRelativeGroup, number>) => void;
}

const TABS: Array<{ id: MobileTreeTab; label: string }> = [
  { id: 'core', label: 'Núcleo' },
  { id: 'paternal', label: 'Paterno' },
  { id: 'maternal', label: 'Materno' },
  { id: 'complete', label: 'Completa' },
];

function getYear(value?: string | number) {
  if (value === undefined || value === null || value === '') return undefined;
  const match = String(value).match(/\b(18|19|20|21)\d{2}\b/);
  return match?.[0];
}

function getFirstTwoNames(fullName?: string) {
  return (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
}

function formatVitalLine(place?: string, date?: string | number) {
  const normalizedPlace = place?.trim();
  const year = getYear(date);
  return [normalizedPlace, year].filter(Boolean).join(' ');
}

function PersonAvatar({
  person,
  pet,
  className,
  iconClassName,
}: {
  person: Pessoa;
  pet: boolean;
  className: string;
  iconClassName: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/80 bg-white/20 shadow-inner ${className}`}
    >
      {person.foto_principal_url ? (
        <img
          src={person.foto_principal_url}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : pet ? (
        <PawPrint className={iconClassName} aria-hidden="true" />
      ) : (
        <span className="text-lg font-extrabold">{getInitials(person.nome_completo)}</span>
      )}
    </span>
  );
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
  const alignment = align === 'left' ? 'justify-start text-left' : 'justify-center text-center';
  const textSize = prominent ? 'text-[12px]' : compact ? 'text-[9px]' : 'text-[11px]';
  const gap = compact ? 'gap-0.5' : 'gap-1';
  const iconSize = prominent ? 'h-3.5 w-3.5' : compact ? 'h-2.5 w-2.5' : 'h-3 w-3';

  return (
    <>
      <span className={`mt-1 flex w-full min-w-0 items-center ${alignment} ${gap} ${textSize} font-semibold leading-tight text-cyan-50`}>
        <Star className={`${iconSize} shrink-0 fill-current`} aria-hidden="true" />
        <span className="truncate">{birthLine || 'Nascimento não informado'}</span>
      </span>
      {showDeathLine && (
        <span className={`mt-0.5 flex w-full min-w-0 items-center ${alignment} ${gap} ${textSize} font-semibold leading-tight text-cyan-50`}>
          <Cross className={`${iconSize} shrink-0`} aria-hidden="true" />
          <span className="truncate">{deathLine || 'Falecimento não informado'}</span>
        </span>
      )}
    </>
  );
}

function getPersonCardData(person: Pessoa) {
  return {
    pet: isPetFamilyMember(person),
    displayName: getFirstTwoNames(person.nome_completo) || person.nome_completo,
    birthLine: formatVitalLine(person.local_nascimento, person.data_nascimento),
    deathLine: formatVitalLine(person.local_falecimento, person.data_falecimento),
    showDeathLine: Boolean(person.falecido || person.data_falecimento || person.local_falecimento),
  };
}

function PersonCard({
  person,
  label,
  central = false,
  onClick,
}: {
  person: Pessoa;
  label?: string;
  central?: boolean;
  onClick: (person: Pessoa) => void;
}) {
  const { pet, displayName, birthLine, deathLine, showDeathLine } = getPersonCardData(person);

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      className={[
        'relative flex h-[164px] w-full min-w-0 flex-col items-center justify-center rounded-[1.35rem] border px-2.5 pb-2.5 pt-2.5 text-center shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition active:scale-[0.98]',
        central
          ? 'border-cyan-300 bg-gradient-to-b from-cyan-500 to-blue-700 text-white'
          : 'border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700 text-white',
      ].join(' ')}
    >
      {label && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow">
          {label}
        </span>
      )}
      <PersonAvatar
        person={person}
        pet={pet}
        className={central ? 'h-[66px] w-[66px]' : 'h-[64px] w-[64px]'}
        iconClassName={central ? 'h-8 w-8' : 'h-7 w-7'}
      />
      <span className="mt-1.5 w-full truncate whitespace-nowrap text-[12px] font-extrabold uppercase leading-none">
        {displayName}
      </span>
      <VitalLines birthLine={birthLine} deathLine={deathLine} showDeathLine={showDeathLine} />
    </button>
  );
}

function MainPersonCard({
  person,
  label,
  onClick,
}: {
  person: Pessoa;
  label?: string;
  onClick: (person: Pessoa) => void;
}) {
  const { pet, displayName, birthLine, deathLine, showDeathLine } = getPersonCardData(person);

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      className="relative flex h-[194px] w-full min-w-0 flex-col items-center justify-center rounded-[1.55rem] border border-cyan-300 bg-gradient-to-b from-cyan-500 to-blue-700 px-3.5 pb-4 pt-4 text-center text-white shadow-[0_12px_32px_rgba(15,23,42,0.16)] transition active:scale-[0.98]"
    >
      {label && (
        <span className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-white shadow">
          {label}
        </span>
      )}
      <PersonAvatar
        person={person}
        pet={pet}
        className="h-[86px] w-[86px]"
        iconClassName="h-10 w-10"
      />
      <span className="mt-3 w-full truncate whitespace-nowrap text-[15px] font-extrabold uppercase leading-none">
        {displayName}
      </span>
      <VitalLines
        birthLine={birthLine}
        deathLine={deathLine}
        showDeathLine={showDeathLine}
        prominent
      />
    </button>
  );
}

function SiblingPersonCard({
  person,
  onClick,
}: {
  person: Pessoa;
  onClick: (person: Pessoa) => void;
}) {
  const { pet, displayName, birthLine, deathLine, showDeathLine } = getPersonCardData(person);

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      className="flex h-[82px] w-full min-w-0 items-center gap-2 rounded-[1.1rem] border border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700 px-2.5 py-2 text-left text-white shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition active:scale-[0.98]"
    >
      <PersonAvatar
        person={person}
        pet={pet}
        className="h-[50px] w-[50px]"
        iconClassName="h-6 w-6"
      />
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span
          className="w-full overflow-hidden text-[11px] font-extrabold uppercase leading-[1.05]"
          style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}
        >
          {displayName}
        </span>
        <VitalLines
          birthLine={birthLine}
          deathLine={deathLine}
          showDeathLine={showDeathLine}
          align="left"
          compact
        />
      </span>
    </button>
  );
}

function AncestorPersonCard({
  person,
  onClick,
}: {
  person: Pessoa;
  onClick: (person: Pessoa) => void;
}) {
  const { pet, displayName, birthLine, deathLine, showDeathLine } = getPersonCardData(person);

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      className="flex h-[60px] w-full min-w-0 items-center gap-1.5 rounded-[0.85rem] border border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700 px-2 py-1.5 text-left text-white shadow-[0_6px_18px_rgba(15,23,42,0.08)] transition active:scale-[0.98]"
    >
      <PersonAvatar
        person={person}
        pet={pet}
        className="h-[34px] w-[34px] border-2"
        iconClassName="h-4 w-4"
      />
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span
          className="w-full overflow-hidden text-[8.5px] font-extrabold uppercase leading-[1.05]"
          style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}
        >
          {displayName}
        </span>
        <VitalLines
          birthLine={birthLine}
          deathLine={deathLine}
          showDeathLine={showDeathLine}
          align="left"
          compact
        />
      </span>
    </button>
  );
}

function MiniPersonCard({
  person,
  onClick,
}: {
  person: Pessoa;
  onClick: (person: Pessoa) => void;
}) {
  const { pet, displayName, birthLine, deathLine, showDeathLine } = getPersonCardData(person);

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      className="flex h-[104px] w-full min-w-0 flex-col items-center justify-center rounded-[0.95rem] border border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700 px-1.5 py-2 text-center text-white shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition active:scale-[0.98]"
    >
      <PersonAvatar
        person={person}
        pet={pet}
        className="h-[36px] w-[36px] border-2"
        iconClassName="h-5 w-5"
      />
      <span
        className="mt-1 w-full overflow-hidden text-[9px] font-extrabold uppercase leading-[1.05]"
        style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}
      >
        {displayName}
      </span>
      <VitalLines
        birthLine={birthLine}
        deathLine={deathLine}
        showDeathLine={showDeathLine}
        compact
      />
    </button>
  );
}

function PetPersonCard({
  person,
  onClick,
}: {
  person: Pessoa;
  onClick: (person: Pessoa) => void;
}) {
  const { pet, displayName, birthLine, deathLine, showDeathLine } = getPersonCardData(person);

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      className="flex h-[128px] w-full min-w-0 flex-col items-center justify-center rounded-[0.95rem] border border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700 px-1.5 py-2 text-center text-white shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition active:scale-[0.98]"
    >
      <PersonAvatar
        person={person}
        pet={pet}
        className="h-[38px] w-[38px] border-2"
        iconClassName="h-5 w-5"
      />
      <span
        className="mt-1 w-full overflow-hidden text-[9px] font-extrabold uppercase leading-[1.05]"
        style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}
      >
        {displayName}
      </span>
      <VitalLines
        birthLine={birthLine}
        deathLine={deathLine}
        showDeathLine={showDeathLine}
        compact
      />
    </button>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="flex h-[164px] min-w-0 flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-slate-300 bg-white/70 px-3 text-center text-sm font-semibold text-slate-500">
      <UserRound className="mb-2 h-8 w-8 text-slate-300" />
      {label}
    </div>
  );
}

function getGridColumnsClass(columns: GroupColumns) {
  if (columns === 'single') return 'grid-cols-1';
  if (columns === 'triple') return 'grid-cols-3';
  return 'grid-cols-2';
}

function FamilyGroup({
  id,
  title,
  people,
  expanded,
  onToggle,
  onPersonClick,
  columns = 'double',
  cardVariant = 'default',
  maxCollapsedItems = 4,
  topConnector = true,
  bottomConnector = false,
  stretch = false,
  screenKind = 'default',
}: {
  id: string;
  title: string;
  people: Pessoa[];
  expanded: boolean;
  onToggle: (id: string) => void;
  onPersonClick: (person: Pessoa) => void;
  columns?: GroupColumns;
  cardVariant?: CardVariant;
  maxCollapsedItems?: number;
  topConnector?: boolean;
  bottomConnector?: boolean;
  stretch?: boolean;
  screenKind?: RelativeScreenKind;
}) {
  if (people.length === 0) return null;
  const visiblePeople = people.length > maxCollapsedItems && !expanded ? people.slice(0, maxCollapsedItems) : people;
  const usePetCards = cardVariant === 'pet';
  const stretchedGroup = stretch && screenKind !== 'default';

  return (
    <section className={[
      'relative',
      stretchedGroup ? 'flex h-full min-h-0 flex-col' : '',
      topConnector ? 'pt-9' : 'pt-0',
      bottomConnector ? 'pb-9' : 'pb-0',
    ].join(' ')}>
      {topConnector && (
        <div className="absolute left-1/2 top-0 h-9 w-px -translate-x-1/2 bg-cyan-600" />
      )}
      <div className={[
        usePetCards
          ? 'relative z-10 rounded-[1.15rem] border border-cyan-200 bg-white/90 p-2 shadow-sm'
          : 'relative z-10 rounded-[1.4rem] border border-cyan-200 bg-white/90 p-3 shadow-sm',
        stretchedGroup ? 'flex h-full min-h-0 flex-col' : '',
      ].join(' ')}
      >
        <h2 className={usePetCards
          ? 'mb-2 text-center text-[11px] font-extrabold uppercase tracking-[0.06em] text-slate-800'
          : 'mb-3 text-center text-sm font-extrabold uppercase tracking-[0.08em] text-slate-800'}
        >
          {title}
        </h2>
        <div
          className={[
            usePetCards ? 'grid min-w-0 grid-cols-1 gap-2' : ['grid min-w-0 gap-2.5', getGridColumnsClass(columns)].join(' '),
            stretchedGroup ? 'flex-1 content-around items-center overflow-hidden' : '',
            screenKind === 'uncles' ? 'auto-rows-min' : '',
            screenKind === 'cousins' ? 'auto-rows-min gap-2' : '',
          ].join(' ')}
        >
          {visiblePeople.map((person) => {
            if (cardVariant === 'sibling') return <SiblingPersonCard key={person.id} person={person} onClick={onPersonClick} />;
            if (cardVariant === 'pet') return <PetPersonCard key={person.id} person={person} onClick={onPersonClick} />;
            if (cardVariant === 'mini') return <MiniPersonCard key={person.id} person={person} onClick={onPersonClick} />;
            return <PersonCard key={person.id} person={person} onClick={onPersonClick} />;
          })}
        </div>
        {people.length > maxCollapsedItems && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="mt-3 w-full rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-800"
          >
            {expanded ? 'Mostrar menos' : `Ver todos (${people.length})`}
          </button>
        )}
      </div>
      {bottomConnector && (
        <div className="absolute bottom-0 left-1/2 h-9 w-px -translate-x-1/2 bg-cyan-600" />
      )}
    </section>
  );
}

function VerticalRelativeScreen({
  title,
  people,
  groupId,
  expanded,
  onToggle,
  onPersonClick,
  columns,
  maxCollapsedItems,
  connectHorizontal,
  bottomConnector = true,
}: {
  title: string;
  people: Pessoa[];
  groupId: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  onPersonClick: (person: Pessoa) => void;
  columns: GroupColumns;
  maxCollapsedItems: number;
  connectHorizontal?: 'left' | 'right';
  bottomConnector?: boolean;
}) {
  const screenKind: RelativeScreenKind = columns === 'double' ? 'uncles' : 'cousins';

  return (
    <div className="relative h-full w-full shrink-0 snap-center overflow-hidden px-3">
      {connectHorizontal && (
        <div className={[
          'pointer-events-none absolute top-1/2 z-0 h-px -translate-y-1/2 bg-cyan-600',
          connectHorizontal === 'left' ? 'left-1/2 right-0' : 'left-0 right-1/2',
        ].join(' ')} />
      )}
      <div className={[
        'pointer-events-none absolute left-1/2 z-0 w-px -translate-x-1/2 bg-cyan-600',
        bottomConnector ? 'inset-y-0' : 'top-0 h-1/2',
      ].join(' ')} />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[380px] items-center py-[max(1rem,4vh)]">
        <div className={[
          'w-full min-w-0',
          screenKind === 'uncles' ? 'h-[78%]' : 'h-[74%]',
        ].join(' ')}>
          <FamilyGroup
            id={groupId}
            title={title}
            people={people}
            expanded={expanded}
            onToggle={onToggle}
            onPersonClick={onPersonClick}
            columns={columns}
            cardVariant={columns === 'double' ? 'sibling' : 'mini'}
            maxCollapsedItems={maxCollapsedItems}
            topConnector={false}
            bottomConnector={false}
            stretch
            screenKind={screenKind}
          />
        </div>
      </div>
    </div>
  );
}

function distributeAncestorSubgroups(groups: AncestorSubgroup[], maxTotal = 6) {
  const nonEmptyGroups = groups.filter((group) => group.people.length > 0);
  if (nonEmptyGroups.length === 0) return [];

  const maxPerGroup = nonEmptyGroups.length >= 3 ? 2 : nonEmptyGroups.length === 2 ? 3 : maxTotal;
  let remaining = maxTotal;

  return nonEmptyGroups
    .map((group) => {
      const people = group.people.slice(0, Math.min(maxPerGroup, remaining));
      remaining -= people.length;
      return { ...group, people };
    })
    .filter((group) => group.people.length > 0);
}

function AncestorGroupCard({
  group,
  onPersonClick,
}: {
  group: AncestorSubgroup;
  onPersonClick: (person: Pessoa) => void;
}) {
  return (
    <section className="relative z-10 flex min-h-0 flex-col rounded-[1.15rem] border border-cyan-200 bg-white/90 p-2.5 shadow-sm">
      <h3 className="mb-2 text-center text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-800">
        {group.title}
      </h3>
      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-center gap-2 overflow-hidden">
        {group.people.map((person) => (
          <AncestorPersonCard key={person.id} person={person} onClick={onPersonClick} />
        ))}
      </div>
    </section>
  );
}

function AncestorGroupsScreen({
  title,
  groups,
  onPersonClick,
}: {
  title: string;
  groups: AncestorSubgroup[];
  onPersonClick: (person: Pessoa) => void;
}) {
  const visibleGroups = distributeAncestorSubgroups(groups);

  return (
    <div className="relative h-full w-full shrink-0 snap-center overflow-hidden px-3">
      <h2 className="sr-only">{title}</h2>
      {visibleGroups.length === 0 ? (
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[360px] items-center px-1 pb-[calc(env(safe-area-inset-bottom)+5.75rem)] pt-4">
          <p className="w-full rounded-xl border border-dashed border-slate-200 bg-white/80 px-3 py-4 text-center text-xs font-semibold text-slate-500">
            Nenhum ancestral cadastrado neste ramo.
          </p>
        </div>
      ) : (
        <>
          <div className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-[24%] w-px -translate-x-1/2 bg-cyan-600" />
          <div className="relative z-10 mx-auto flex h-full w-full max-w-[370px] items-center py-[max(1rem,4vh)]">
            <div className="grid h-[76%] w-full min-w-0 auto-rows-fr grid-cols-1 gap-2.5 overflow-hidden">
              {visibleGroups.map((group) => (
                <AncestorGroupCard key={group.id} group={group} onPersonClick={onPersonClick} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ParentBranchSwipeScreen({
  side,
  title,
  ancestorsTitle,
  cousinsTitle,
  uncles,
  ancestorGroups,
  cousins,
  expandedGroups,
  onToggle,
  onPersonClick,
}: {
  side: 'left' | 'right';
  title: string;
  ancestorsTitle: string;
  cousinsTitle: string;
  uncles: Pessoa[];
  ancestorGroups: AncestorSubgroup[];
  cousins: Pessoa[];
  expandedGroups: Set<string>;
  onToggle: (id: string) => void;
  onPersonClick: (person: Pessoa) => void;
}) {
  const verticalScrollRef = React.useRef<HTMLDivElement | null>(null);
  const prefix = `core-parent-branch-${side}`;

  React.useEffect(() => {
    const container = verticalScrollRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.clientHeight;
    });
  }, [side, title]);

  return (
    <div className="relative h-full w-full shrink-0 snap-center overflow-hidden">
      <div
        ref={verticalScrollRef}
        className="flex h-full w-full snap-y snap-mandatory flex-col overflow-y-auto overflow-x-hidden scroll-smooth overscroll-y-contain"
      >
        <AncestorGroupsScreen
          title={ancestorsTitle}
          groups={ancestorGroups}
          onPersonClick={onPersonClick}
        />
        <VerticalRelativeScreen
          title={title}
          people={uncles}
          groupId={`${prefix}-uncles`}
          expanded={expandedGroups.has(`${prefix}-uncles`)}
          onToggle={onToggle}
          onPersonClick={onPersonClick}
          columns="double"
          maxCollapsedItems={6}
          connectHorizontal={side}
        />
        <VerticalRelativeScreen
          title={cousinsTitle}
          people={cousins}
          groupId={`${prefix}-cousins`}
          expanded={expandedGroups.has(`${prefix}-cousins`)}
          onToggle={onToggle}
          onPersonClick={onPersonClick}
          columns="triple"
          maxCollapsedItems={9}
          bottomConnector={false}
        />
      </div>
    </div>
  );
}

function BranchView({
  branch,
  maternal,
  expandedGroups,
  onToggleGroup,
  onPersonClick,
}: {
  branch: MobileFamilyBranch;
  maternal?: boolean;
  expandedGroups: Set<string>;
  onToggleGroup: (id: string) => void;
  onPersonClick: (person: Pessoa) => void;
}) {
  const prefix = maternal ? 'maternal' : 'paternal';
  const groups = [
    { id: `${prefix}-parent`, title: maternal ? 'Mãe' : 'Pai', people: branch.parent },
    { id: `${prefix}-grandparents`, title: `Avós ${maternal ? 'maternos' : 'paternos'}`, people: branch.grandparents },
    { id: `${prefix}-great-grandparents`, title: `Bisavós ${maternal ? 'maternos' : 'paternos'}`, people: branch.greatGrandparents },
    ...(!maternal ? [{
      id: `${prefix}-great-great-grandparents`,
      title: 'Tataravós paternos',
      people: branch.greatGreatGrandparents,
    }] : []),
    { id: `${prefix}-uncles`, title: `Tios ${maternal ? 'maternos' : 'paternos'}`, people: branch.uncles },
    { id: `${prefix}-cousins`, title: `Primos ${maternal ? 'maternos' : 'paternos'}`, people: branch.cousins },
  ];

  return (
    <div className="mx-auto w-full max-w-[430px] px-3 pb-28 pt-2">
      {groups.every((group) => group.people.length === 0) ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Nenhum familiar cadastrado neste ramo.
        </div>
      ) : groups.map((group) => (
        <FamilyGroup
          key={group.id}
          {...group}
          expanded={expandedGroups.has(group.id)}
          onToggle={onToggleGroup}
          onPersonClick={onPersonClick}
        />
      ))}
    </div>
  );
}

export function MobileFamilyTreeView({
  pessoas,
  relacionamentos,
  centralPersonId,
  visiblePersonIds,
  familyTreeRef,
  onPersonClick,
  onPersonView,
  onPersonEdit,
  onPersonAddConnection,
  onPersonRemove,
  onMarriageClick,
  selectedPersonId,
  edgeFilters,
  directRelativeFilters,
  genealogyFilters,
  visualLineFilters,
  layoutRevision,
  onDirectRelationRenderedCounts,
}: MobileFamilyTreeViewProps) {
  const [activeTab, setActiveTab] = React.useState<MobileTreeTab>('core');
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(() => new Set());
  const coreScrollRef = React.useRef<HTMLDivElement | null>(null);
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
    if (activeTab !== 'core') return;
    const container = coreScrollRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollLeft = container.clientWidth;
    });
  }, [activeTab, centralPersonId, layoutRevision]);

  const visibleSpouses = filterVisible(model.spouses);
  const visibleSiblings = filterVisible(model.siblings);
  const visibleNephews = filterVisible(model.nephews);
  const visibleChildren = filterVisible(model.children);
  const visiblePets = filterVisible(model.pets);
  const visibleGrandchildren = filterVisible(model.grandchildren);
  const paternalAncestorGroups: AncestorSubgroup[] = [
    { id: 'paternal-great-great-grandparents', title: 'Tataravós', people: visiblePaternal.greatGreatGrandparents },
    { id: 'paternal-great-grandparents', title: 'Bisavós', people: visiblePaternal.greatGrandparents },
    { id: 'paternal-grandparents', title: 'Avós', people: visiblePaternal.grandparents },
  ];
  const maternalAncestorGroups: AncestorSubgroup[] = [
    { id: 'maternal-great-great-grandparents', title: 'Tataravós', people: visibleMaternal.greatGreatGrandparents },
    { id: 'maternal-great-grandparents', title: 'Bisavós', people: visibleMaternal.greatGrandparents },
    { id: 'maternal-grandparents', title: 'Avós', people: visibleMaternal.grandparents },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_34%,#f8fafc_100%)]">
      <nav
        aria-label="Visualizações da árvore"
        className="absolute inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 px-2 py-2 shadow-sm backdrop-blur"
      >
        <div className="mx-auto grid max-w-[430px] grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={[
                'min-w-0 rounded-lg px-1 py-2 text-[11px] font-bold transition',
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

      {activeTab === 'complete' ? (
        <div className="absolute inset-x-0 bottom-0 top-[58px]">
          <FamilyTree
            ref={familyTreeRef}
            pessoas={pessoas}
            visiblePersonIds={visiblePersonIds}
            relacionamentos={relacionamentos}
            onPersonClick={onPersonClick}
            onPersonView={onPersonView}
            onPersonEdit={onPersonEdit}
            onPersonAddConnection={onPersonAddConnection}
            onPersonRemove={onPersonRemove}
            onMarriageClick={onMarriageClick}
            selectedPersonId={selectedPersonId}
            edgeFilters={edgeFilters}
            directRelativeFilters={directRelativeFilters}
            centralPersonId={centralPersonId}
            isMobile
            layoutRevision={layoutRevision}
            viewMode="visao-completa"
            genealogyFilters={genealogyFilters}
            visualLineFilters={visualLineFilters}
            onDirectRelationRenderedCounts={onDirectRelationRenderedCounts}
          />
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 top-[58px] overflow-hidden overscroll-contain">
          {activeTab === 'core' && (
            <div
              ref={coreScrollRef}
              className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth overscroll-x-contain"
            >
              <ParentBranchSwipeScreen
                side="left"
                title="Tios Paternos"
                ancestorsTitle="Ancestrais Paternos"
                cousinsTitle="Primos Paternos"
                uncles={visiblePaternal.uncles}
                ancestorGroups={paternalAncestorGroups}
                cousins={visiblePaternal.cousins}
                expandedGroups={expandedGroups}
                onToggle={toggleGroup}
                onPersonClick={onPersonClick}
              />

              <div className="relative h-full w-full shrink-0 snap-center overflow-y-auto">
                <div className="pointer-events-none absolute left-0 top-[92px] h-px w-[calc((100%-0.75rem)/4)] bg-cyan-600" />
                <div className="pointer-events-none absolute right-0 top-[92px] h-px w-[calc((100%-0.75rem)/4)] bg-cyan-600" />
                <div className="mx-auto w-full max-w-[430px] px-1 pb-28 pt-10">
                  <div className="mx-auto w-full max-w-[390px] px-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        {isVisible(model.father)
                          ? <PersonCard person={model.father} label="Pai" onClick={onPersonClick} />
                          : <EmptyCard label="Pai" />}
                        <div className="pointer-events-none absolute left-1/2 top-full h-7 w-px -translate-x-1/2 bg-cyan-600" />
                      </div>

                      <div className="relative">
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
                      <MainPersonCard person={model.central} label="Você" onClick={onPersonClick} />
                    </div>
                  )}

                  <div className="relative mx-auto h-9 w-full">
                    <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-cyan-600" />
                    <div className="absolute left-[calc(25%-3px)] right-[calc(25%-3px)] top-5 h-px bg-cyan-600" />
                    <div className="absolute left-[calc(25%-3px)] top-5 h-4 w-px -translate-x-1/2 bg-cyan-600" />
                    <div className="absolute right-[calc(25%-3px)] top-5 h-4 w-px translate-x-1/2 bg-cyan-600" />
                  </div>

                  <div className="grid grid-cols-2 items-start gap-3">
                    <div className="min-w-0">
                      <FamilyGroup
                        id="core-siblings"
                        title="Irmãos"
                        people={visibleSiblings}
                        expanded={expandedGroups.has('core-siblings')}
                        onToggle={toggleGroup}
                        onPersonClick={onPersonClick}
                        columns="single"
                        cardVariant="sibling"
                      />
                      <FamilyGroup
                        id="core-nephews"
                        title="Sobrinhos"
                        people={visibleNephews}
                        expanded={expandedGroups.has('core-nephews')}
                        onToggle={toggleGroup}
                        onPersonClick={onPersonClick}
                        columns="single"
                      />
                    </div>

                    <div className="min-w-0">
                      <FamilyGroup
                        id="core-spouses"
                        title="Cônjuge"
                        people={visibleSpouses}
                        expanded={expandedGroups.has('core-spouses')}
                        onToggle={toggleGroup}
                        onPersonClick={onPersonClick}
                        columns="single"
                      />
                      <div className="grid grid-cols-2 items-start gap-2">
                        <FamilyGroup
                          id="core-pets"
                          title="Pets"
                          people={visiblePets}
                          expanded={expandedGroups.has('core-pets')}
                          onToggle={toggleGroup}
                          onPersonClick={onPersonClick}
                          columns="single"
                          cardVariant="pet"
                        />
                        <FamilyGroup
                          id="core-children"
                          title="Filhos"
                          people={visibleChildren}
                          expanded={expandedGroups.has('core-children')}
                          onToggle={toggleGroup}
                          onPersonClick={onPersonClick}
                          columns="single"
                        />
                      </div>
                      <FamilyGroup
                        id="core-grandchildren"
                        title="Netos"
                        people={visibleGrandchildren}
                        expanded={expandedGroups.has('core-grandchildren')}
                        onToggle={toggleGroup}
                        onPersonClick={onPersonClick}
                        columns="single"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <ParentBranchSwipeScreen
                side="right"
                title="Tios Maternos"
                ancestorsTitle="Ancestrais Maternos"
                cousinsTitle="Primos Maternos"
                uncles={visibleMaternal.uncles}
                ancestorGroups={maternalAncestorGroups}
                cousins={visibleMaternal.cousins}
                expandedGroups={expandedGroups}
                onToggle={toggleGroup}
                onPersonClick={onPersonClick}
              />
            </div>
          )}
          {activeTab === 'paternal' && (
            <BranchView
              branch={visiblePaternal}
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              onPersonClick={onPersonClick}
            />
          )}
          {activeTab === 'maternal' && (
            <BranchView
              branch={visibleMaternal}
              maternal
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              onPersonClick={onPersonClick}
            />
          )}
        </div>
      )}
    </div>
  );
}
