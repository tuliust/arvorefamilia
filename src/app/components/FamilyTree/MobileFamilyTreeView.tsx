import React from 'react';
import { PawPrint, UserRound } from 'lucide-react';

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

function getLocation(person: Pessoa) {
  return person.local_atual?.trim() || person.local_nascimento?.trim() || undefined;
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
  const pet = isPetFamilyMember(person);
  const location = getLocation(person);
  const year = getYear(person.data_nascimento);

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      className={[
        'relative flex min-w-0 flex-col items-center rounded-[1.35rem] border px-2.5 pb-3 pt-3 text-center shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition active:scale-[0.98]',
        central
          ? 'min-h-[214px] border-cyan-300 bg-gradient-to-b from-cyan-500 to-blue-700 text-white'
          : 'min-h-[184px] border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700 text-white',
      ].join(' ')}
    >
      {label && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow">
          {label}
        </span>
      )}
      <span
        className={[
          'flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/80 bg-white/20 shadow-inner',
          central ? 'h-[88px] w-[88px]' : 'h-[72px] w-[72px]',
        ].join(' ')}
      >
        {person.foto_principal_url ? (
          <img
            src={person.foto_principal_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : pet ? (
          <PawPrint className={central ? 'h-10 w-10' : 'h-8 w-8'} aria-hidden="true" />
        ) : (
          <span className="text-lg font-extrabold">{getInitials(person.nome_completo)}</span>
        )}
      </span>
      <span
        className="mt-2 w-full overflow-hidden text-[13px] font-extrabold uppercase leading-[1.12]"
        style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}
      >
        {person.nome_completo}
      </span>
      {location && (
        <span
          className="mt-1 w-full overflow-hidden text-[11px] font-medium leading-tight text-cyan-50"
          style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}
        >
          {location}
        </span>
      )}
      {year && <span className="mt-0.5 text-xs font-bold text-white/90">{year}</span>}
      <span className="mt-auto flex h-7 w-7 items-center justify-center rounded-full border border-white/35 bg-white/15">
        {pet ? <PawPrint className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="flex min-h-[184px] min-w-0 flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-slate-300 bg-white/70 px-3 text-center text-sm font-semibold text-slate-500">
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
}: {
  id: string;
  title: string;
  people: Pessoa[];
  expanded: boolean;
  onToggle: (id: string) => void;
  onPersonClick: (person: Pessoa) => void;
}) {
  if (people.length === 0) return null;
  const visiblePeople = people.length > 4 && !expanded ? people.slice(0, 3) : people;

  return (
    <section className="relative pt-9">
      <div className="absolute left-1/2 top-0 h-9 w-px -translate-x-1/2 bg-cyan-600" />
      <div className="rounded-[1.4rem] border border-cyan-200 bg-white/90 p-3 shadow-sm">
        <h2 className="mb-3 text-center text-sm font-extrabold uppercase tracking-[0.08em] text-slate-800">
          {title}
        </h2>
        <div className="grid min-w-0 grid-cols-2 gap-2.5">
          {visiblePeople.map((person) => (
            <PersonCard key={person.id} person={person} onClick={onPersonClick} />
          ))}
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
            <div className="mx-auto w-full max-w-[430px] px-3 pb-28 pt-5">
              <h1 className="text-center text-xl font-extrabold text-slate-900">Minha árvore</h1>
              <p className="mt-1 text-center text-xs font-medium text-slate-500">Núcleo familiar direto</p>

              <div className="relative mt-9 grid grid-cols-2 gap-2.5">
                {isVisible(model.father)
                  ? <PersonCard person={model.father} label="Pai" onClick={onPersonClick} />
                  : <EmptyCard label="Pai" />}
                {isVisible(model.mother)
                  ? <PersonCard person={model.mother} label="Mãe" onClick={onPersonClick} />
                  : <EmptyCard label="Mãe" />}
                <div className="pointer-events-none absolute -bottom-8 left-1/4 right-1/4 h-8 rounded-t-xl border-x border-t border-cyan-600" />
                <div className="pointer-events-none absolute -bottom-8 left-1/2 h-8 w-px -translate-x-1/2 bg-cyan-600" />
              </div>

              {isVisible(model.central) && (
                <div className="relative mx-auto mt-12 w-[min(190px,58vw)]">
                  <PersonCard person={model.central} label="Você" central onClick={onPersonClick} />
                </div>
              )}

              {filterVisible(model.spouses).length > 0 && (
                <FamilyGroup
                  id="core-spouses"
                  title="Cônjuge"
                  people={filterVisible(model.spouses)}
                  expanded={expandedGroups.has('core-spouses')}
                  onToggle={toggleGroup}
                  onPersonClick={onPersonClick}
                />
              )}
              <FamilyGroup
                id="core-siblings"
                title="Irmãos"
                people={filterVisible(model.siblings)}
                expanded={expandedGroups.has('core-siblings')}
                onToggle={toggleGroup}
                onPersonClick={onPersonClick}
              />
              <FamilyGroup
                id="core-nephews"
                title="Sobrinhos"
                people={filterVisible(model.nephews)}
                expanded={expandedGroups.has('core-nephews')}
                onToggle={toggleGroup}
                onPersonClick={onPersonClick}
              />
              <FamilyGroup
                id="core-pets"
                title="Pets"
                people={filterVisible(model.pets)}
                expanded={expandedGroups.has('core-pets')}
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
