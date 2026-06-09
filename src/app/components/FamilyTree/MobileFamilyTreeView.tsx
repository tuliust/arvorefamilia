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

type CardVariant = 'default' | 'sibling' | 'pet';

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
}: {
  birthLine: string;
  deathLine: string;
  showDeathLine: boolean;
  align?: 'center' | 'left';
  compact?: boolean;
}) {
  const alignment = align === 'left' ? 'justify-start text-left' : 'justify-center text-center';
  const textSize = compact ? 'text-[10px]' : 'text-[11px]';
  const gap = compact ? 'gap-0.5' : 'gap-1';

  return (
    <>
      <span className={`mt-1 flex w-full min-w-0 items-center ${alignment} ${gap} ${textSize} font-semibold leading-tight text-cyan-50`}>
        <Star className="h-3 w-3 shrink-0 fill-current" aria-hidden="true" />
        <span className="truncate">{birthLine || 'Nascimento não informado'}</span>
      </span>
      {showDeathLine && (
        <span className={`mt-0.5 flex w-full min-w-0 items-center ${alignment} ${gap} ${textSize} font-semibold leading-tight text-cyan-50`}>
          <Cross className="h-3 w-3 shrink-0" aria-hidden="true" />
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
      className="flex h-[164px] w-[calc((100%-0.625rem)/2)] min-w-0 flex-col items-center justify-center rounded-[1.1rem] border border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700 px-2 py-2 text-center text-white shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition active:scale-[0.98]"
    >
      <PersonAvatar
        person={person}
        pet={pet}
        className="h-[54px] w-[54px]"
        iconClassName="h-7 w-7"
      />
      <span
        className="mt-1.5 w-full overflow-hidden text-[11px] font-extrabold uppercase leading-[1.05]"
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

function FamilyGroup({
  id,
  title,
  people,
  expanded,
  onToggle,
  onPersonClick,
  columns = 'double',
  cardVariant = 'default',
}: {
  id: string;
  title: string;
  people: Pessoa[];
  expanded: boolean;
  onToggle: (id: string) => void;
  onPersonClick: (person: Pessoa) => void;
  columns?: 'single' | 'double';
  cardVariant?: CardVariant;
}) {
  if (people.length === 0) return null;
  const visiblePeople = people.length > 4 && !expanded ? people.slice(0, 3) : people;
  const usePetCards = cardVariant === 'pet';

  return (
    <section className="relative pt-9">
      <div className="absolute left-1/2 top-0 h-9 w-px -translate-x-1/2 bg-cyan-600" />
      <div className="rounded-[1.4rem] border border-cyan-200 bg-white/90 p-3 shadow-sm">
        <h2 className="mb-3 text-center text-sm font-extrabold uppercase tracking-[0.08em] text-slate-800">
          {title}
        </h2>
        <div
          className={usePetCards
            ? 'flex min-w-0 flex-wrap justify-center gap-2.5'
            : [
              'grid min-w-0 gap-2.5',
              columns === 'single' ? 'grid-cols-1' : 'grid-cols-2',
            ].join(' ')}
        >
          {visiblePeople.map((person) => {
            if (cardVariant === 'sibling') return <SiblingPersonCard key={person.id} person={person} onClick={onPersonClick} />;
            if (cardVariant === 'pet') return <PetPersonCard key={person.id} person={person} onClick={onPersonClick} />;
            return <PersonCard key={person.id} person={person} onClick={onPersonClick} />;
          })}
        </div>
        {people.length > 4 && (
          <button
            type="button"
            onClick={() => onToggle(id)}
            className="mt-3 w-full rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-800"
          >
            {expanded ? 'Mostrar menos' : `Ver todos (${people.length})`}
          </button>
        )}
      </div>
    </section>
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

  const visibleSpouses = filterVisible(model.spouses);
  const visibleSiblings = filterVisible(model.siblings);
  const visibleNephews = filterVisible(model.nephews);
  const visibleChildren = filterVisible(model.children);
  const visiblePets = filterVisible(model.pets);
  const visibleGrandchildren = filterVisible(model.grandchildren);

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
        <div className="absolute inset-x-0 bottom-0 top-[58px] overflow-y-auto overflow-x-hidden overscroll-contain">
          {activeTab === 'core' && (
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
                <div className="relative mx-auto mt-0 w-[min(181px,calc((100vw-1.75rem)/2))]">
                  <PersonCard person={model.central} label="Você" central onClick={onPersonClick} />
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
                  <FamilyGroup
                    id="core-children"
                    title="Filhos"
                    people={visibleChildren}
                    expanded={expandedGroups.has('core-children')}
                    onToggle={toggleGroup}
                    onPersonClick={onPersonClick}
                    columns="single"
                  />
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
