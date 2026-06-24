import React from 'react';
import { toast } from 'sonner';

import type { Pessoa, Relacionamento } from '../../types';
import { isPetFamilyMember } from '../../utils/personEntity';
import type { FamilyTreeActions } from './FamilyTree';
import {
  type DirectRelativeFilters,
  type DirectRelativeGroup,
} from './types';

interface MobileFamilyHorizontalMapFilteredViewProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  centralPersonId: string;
  visiblePersonIds?: Set<string>;
  directRelativeFilters: DirectRelativeFilters;
  onPersonClick: (pessoa: Pessoa) => void;
  layoutRevision: number;
  onDirectRelationRenderedCounts?: (counts: Record<DirectRelativeGroup, number>) => void;
}

type RelationshipMaps = {
  parentsByChild: Map<string, Set<string>>;
  childrenByParent: Map<string, Set<string>>;
  spousesByPerson: Map<string, Set<string>>;
};

type MobileHorizontalGeneration = {
  generation: number;
  label: string;
  people: Pessoa[];
  totalCount: number;
};

const MAX_PEOPLE_PER_GENERATION = 24;

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

function addToMap(map: Map<string, Set<string>>, key?: string | null, value?: string | null) {
  if (!key || !value) return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key)!.add(value);
}

function addIds(target: Set<string>, ids?: Set<string>) {
  ids?.forEach((id) => target.add(id));
}

function isParentChildRelationship(relationship: Relacionamento) {
  const type = relationship.tipo_relacionamento as string;
  return type === 'pai'
    || type === 'mae'
    || type === 'filho'
    || type === 'filiacao_sangue'
    || type === 'filiacao_adotiva';
}

function getParentChildIds(relationship: Relacionamento) {
  if (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae') {
    return {
      parentId: relationship.pessoa_destino_id,
      childId: relationship.pessoa_origem_id,
    };
  }

  return {
    parentId: relationship.pessoa_origem_id,
    childId: relationship.pessoa_destino_id,
  };
}

function buildRelationshipMaps(relacionamentos: Relacionamento[]): RelationshipMaps {
  const parentsByChild = new Map<string, Set<string>>();
  const childrenByParent = new Map<string, Set<string>>();
  const spousesByPerson = new Map<string, Set<string>>();

  relacionamentos.forEach((relationship) => {
    if (!relationship.pessoa_origem_id || !relationship.pessoa_destino_id) return;

    if (isParentChildRelationship(relationship)) {
      const { parentId, childId } = getParentChildIds(relationship);
      addToMap(parentsByChild, childId, parentId);
      addToMap(childrenByParent, parentId, childId);
      return;
    }

    if (relationship.tipo_relacionamento === 'conjuge') {
      addToMap(spousesByPerson, relationship.pessoa_origem_id, relationship.pessoa_destino_id);
      addToMap(spousesByPerson, relationship.pessoa_destino_id, relationship.pessoa_origem_id);
    }
  });

  return { parentsByChild, childrenByParent, spousesByPerson };
}

function collectParents(personIds: Set<string>, maps: RelationshipMaps) {
  const result = new Set<string>();

  personIds.forEach((personId) => {
    addIds(result, maps.parentsByChild.get(personId));
  });

  return result;
}

function collectChildren(personIds: Set<string>, maps: RelationshipMaps) {
  const result = new Set<string>();

  personIds.forEach((personId) => {
    addIds(result, maps.childrenByParent.get(personId));
  });

  return result;
}

function collectSiblings(personId: string, maps: RelationshipMaps) {
  const siblings = new Set<string>();

  maps.parentsByChild.get(personId)?.forEach((parentId) => {
    maps.childrenByParent.get(parentId)?.forEach((siblingId) => {
      if (siblingId !== personId) siblings.add(siblingId);
    });
  });

  return siblings;
}

function getSortableBirthValue(value?: string | number | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const year = String(value).match(/\d{4}/)?.[0];
  return year ? Number(year) : Number.POSITIVE_INFINITY;
}

function sortPeople(a: Pessoa, b: Pessoa, centralPersonId: string) {
  if (a.id === centralPersonId) return -1;
  if (b.id === centralPersonId) return 1;

  const birthA = getSortableBirthValue(a.data_nascimento);
  const birthB = getSortableBirthValue(b.data_nascimento);
  if (birthA !== birthB) return birthA - birthB;

  return (a.nome_completo || '').localeCompare(b.nome_completo || '', 'pt-BR');
}

function intersectVisiblePersonIds(ids: Set<string>, visiblePersonIds: Set<string> | undefined, centralPersonId: string) {
  if (!visiblePersonIds) return ids;

  const visibleIds = new Set<string>();
  ids.forEach((id) => {
    if (id === centralPersonId || visiblePersonIds.has(id)) visibleIds.add(id);
  });

  return visibleIds;
}

function getPeopleFromIds(ids: Set<string>, peopleById: Map<string, Pessoa>, centralPersonId: string) {
  return Array.from(ids)
    .map((id) => peopleById.get(id))
    .filter((person): person is Pessoa => Boolean(person))
    .sort((a, b) => sortPeople(a, b, centralPersonId));
}

function limitPeople(people: Pessoa[]) {
  return people.slice(0, MAX_PEOPLE_PER_GENERATION);
}

function createGeneration(generation: number, label: string, people: Pessoa[]): MobileHorizontalGeneration | undefined {
  if (people.length === 0) return undefined;

  return {
    generation,
    label,
    people: limitPeople(people),
    totalCount: people.length,
  };
}

function buildMobileHorizontalGenerations({
  pessoas,
  relacionamentos,
  centralPersonId,
  visiblePersonIds,
  directRelativeFilters,
}: {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  centralPersonId: string;
  visiblePersonIds?: Set<string>;
  directRelativeFilters: DirectRelativeFilters;
}) {
  const maps = buildRelationshipMaps(relacionamentos);
  const peopleById = new Map(pessoas.map((person) => [person.id, person]));
  const centralPerson = peopleById.get(centralPersonId);
  const centralIds = new Set([centralPersonId]);
  const parents = intersectVisiblePersonIds(collectParents(centralIds, maps), visiblePersonIds, centralPersonId);
  const grandparents = intersectVisiblePersonIds(collectParents(parents, maps), visiblePersonIds, centralPersonId);
  const greatGrandparents = intersectVisiblePersonIds(collectParents(grandparents, maps), visiblePersonIds, centralPersonId);
  const greatGreatGrandparents = intersectVisiblePersonIds(collectParents(greatGrandparents, maps), visiblePersonIds, centralPersonId);
  const allChildren = intersectVisiblePersonIds(collectChildren(centralIds, maps), visiblePersonIds, centralPersonId);
  const children = new Set(Array.from(allChildren).filter((id) => {
    const person = peopleById.get(id);
    return person && !isPetFamilyMember(person);
  }));
  const pets = new Set(Array.from(allChildren).filter((id) => {
    const person = peopleById.get(id);
    return person && isPetFamilyMember(person);
  }));
  const grandchildren = intersectVisiblePersonIds(collectChildren(children, maps), visiblePersonIds, centralPersonId);
  const siblings = intersectVisiblePersonIds(collectSiblings(centralPersonId, maps), visiblePersonIds, centralPersonId);
  const nephews = intersectVisiblePersonIds(collectChildren(siblings, maps), visiblePersonIds, centralPersonId);
  const unclesAndAunts = new Set<string>();

  parents.forEach((parentId) => {
    collectSiblings(parentId, maps).forEach((relativeId) => unclesAndAunts.add(relativeId));
  });

  const visibleUnclesAndAunts = intersectVisiblePersonIds(unclesAndAunts, visiblePersonIds, centralPersonId);
  const cousins = intersectVisiblePersonIds(collectChildren(visibleUnclesAndAunts, maps), visiblePersonIds, centralPersonId);
  const spouses = intersectVisiblePersonIds(maps.spousesByPerson.get(centralPersonId) ?? new Set(), visiblePersonIds, centralPersonId);
  const nucleus = new Set<string>();

  if (centralPerson) nucleus.add(centralPerson.id);
  if (directRelativeFilters.conjuge) addIds(nucleus, spouses);
  if (directRelativeFilters.irmaos) addIds(nucleus, siblings);
  if (directRelativeFilters.primos) addIds(nucleus, cousins);

  const generationOne = directRelativeFilters.tataravos ? getPeopleFromIds(greatGreatGrandparents, peopleById, centralPersonId) : [];
  const generationTwo = directRelativeFilters.bisavos ? getPeopleFromIds(greatGrandparents, peopleById, centralPersonId) : [];
  const generationThree = directRelativeFilters.avos ? getPeopleFromIds(grandparents, peopleById, centralPersonId) : [];
  const generationFourIds = new Set<string>();
  if (directRelativeFilters.pais) addIds(generationFourIds, parents);
  if (directRelativeFilters.tios) addIds(generationFourIds, visibleUnclesAndAunts);

  const generationSixIds = new Set<string>();
  if (directRelativeFilters.filhos) addIds(generationSixIds, children);
  if (directRelativeFilters.netos) addIds(generationSixIds, grandchildren);
  if (directRelativeFilters.sobrinhos) addIds(generationSixIds, nephews);
  if (directRelativeFilters.pets) addIds(generationSixIds, pets);

  const generations = [
    createGeneration(1, 'Tataravós', generationOne),
    createGeneration(2, 'Bisavós', generationTwo),
    createGeneration(3, 'Avós', generationThree),
    createGeneration(4, 'Pais e tios', getPeopleFromIds(generationFourIds, peopleById, centralPersonId)),
    createGeneration(5, 'Núcleo', getPeopleFromIds(nucleus, peopleById, centralPersonId)),
    createGeneration(6, 'Descendentes', getPeopleFromIds(generationSixIds, peopleById, centralPersonId)),
  ].filter((generation): generation is MobileHorizontalGeneration => Boolean(generation));

  return {
    generations,
    counts: {
      ...EMPTY_COUNTS,
      pais: directRelativeFilters.pais ? parents.size : 0,
      avos: directRelativeFilters.avos ? grandparents.size : 0,
      bisavos: directRelativeFilters.bisavos ? greatGrandparents.size : 0,
      tataravos: directRelativeFilters.tataravos ? greatGreatGrandparents.size : 0,
      conjuge: directRelativeFilters.conjuge ? spouses.size : 0,
      filhos: directRelativeFilters.filhos ? children.size : 0,
      netos: directRelativeFilters.netos ? grandchildren.size : 0,
      irmaos: directRelativeFilters.irmaos ? siblings.size : 0,
      sobrinhos: directRelativeFilters.sobrinhos ? nephews.size : 0,
      tios: directRelativeFilters.tios ? visibleUnclesAndAunts.size : 0,
      primos: directRelativeFilters.primos ? cousins.size : 0,
      pets: directRelativeFilters.pets ? pets.size : 0,
    },
  };
}

function getCardLabel(person: Pessoa, centralPersonId: string, generation: MobileHorizontalGeneration) {
  if (person.id === centralPersonId) return 'Pessoa Central';
  if (isPetFamilyMember(person)) return 'Pets';
  return generation.label;
}

function getFirstTwoNames(fullName?: string | null) {
  return (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ') || 'Pessoa';
}

function getYear(value?: string | number | null) {
  if (!value) return '';
  return String(value).match(/\b(18|19|20|21)\d{2}\b/)?.[0] ?? '';
}

function MobileHorizontalSimplePersonCard({
  person,
  label,
  central,
  onClick,
}: {
  person: Pessoa;
  label: string;
  central: boolean;
  onClick: (person: Pessoa) => void;
}) {
  const birthYear = getYear(person.data_nascimento);
  const deathYear = getYear(person.data_falecimento);
  const deceased = Boolean(person.falecido || person.data_falecimento);

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      className={[
        'flex min-h-[64px] w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left shadow-sm active:scale-[0.99]',
        central
          ? 'border-cyan-300 bg-cyan-700 text-white'
          : 'border-slate-200 bg-white text-slate-900',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black',
          central ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-800',
        ].join(' ')}
        aria-hidden="true"
      >
        {getFirstTwoNames(person.nome_completo).slice(0, 1)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black leading-tight">
          {getFirstTwoNames(person.nome_completo)}
        </span>
        <span className={central ? 'mt-0.5 block truncate text-[11px] font-bold text-cyan-50' : 'mt-0.5 block truncate text-[11px] font-bold text-slate-500'}>
          {label}
          {birthYear ? ` ? ${birthYear}` : ''}
          {deceased && deathYear ? ` ? ${deathYear}` : ''}
        </span>
      </span>
    </button>
  );
}

function MobileFamilyHorizontalMapFilteredViewComponent({
  pessoas,
  relacionamentos,
  centralPersonId,
  visiblePersonIds,
  directRelativeFilters,
  onPersonClick,
  layoutRevision,
  onDirectRelationRenderedCounts,
}: MobileFamilyHorizontalMapFilteredViewProps, ref: React.ForwardedRef<FamilyTreeActions>) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const { generations, counts } = React.useMemo(() => buildMobileHorizontalGenerations({
    pessoas,
    relacionamentos,
    centralPersonId,
    visiblePersonIds,
    directRelativeFilters,
  }), [centralPersonId, directRelativeFilters, pessoas, relacionamentos, visiblePersonIds]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [centralPersonId, layoutRevision, generations.length]);

  React.useEffect(() => {
    onDirectRelationRenderedCounts?.(counts);
  }, [counts, onDirectRelationRenderedCounts]);

  React.useImperativeHandle(ref, () => ({
    zoomIn: () => toast.info('Zoom não é necessário nesta visualização mobile.'),
    zoomOut: () => toast.info('Zoom não é necessário nesta visualização mobile.'),
    print: async () => {
      toast.info('Impressão disponível na versão desktop.');
    },
    savePdf: async () => {
      toast.info('PDF disponível na versão desktop.');
    },
    saveImage: async () => {
      toast.info('Imagem disponível na versão desktop.');
    },
    startAreaSelection: () => toast.info('Seleção de área disponível na versão desktop.'),
  }), []);

  const activeGeneration = generations[Math.min(activeIndex, Math.max(0, generations.length - 1))];

  if (!activeGeneration) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#f8efe4] px-6 text-center">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-6 text-sm font-semibold text-slate-500 shadow-sm">
          Nenhuma geração visível para os filtros atuais.
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f8efe4]" data-family-map-horizontal-mobile-root="true">
      <nav
        aria-label="Gerações do Mapa Genealógico"
        className="absolute inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 px-2 py-2 shadow-sm backdrop-blur"
        data-tree-export-ignore="true"
      >
        <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain pb-0.5 pr-14 [-webkit-overflow-scrolling:touch]">
          {generations.map((generation, index) => (
            <button
              key={generation.generation}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-current={index === activeIndex ? 'page' : undefined}
              className={[
                'shrink-0 rounded-full px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.04em] transition',
                index === activeIndex
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 active:bg-slate-200',
              ].join(' ')}
            >
              Ger {generation.generation}
            </button>
          ))}
        </div>
      </nav>

      <div className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+5.65rem)] top-[48px] overflow-y-auto overscroll-y-contain px-4 py-4 [-webkit-overflow-scrolling:touch]">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-center shadow-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-cyan-700">
              Geração {activeGeneration.generation}
            </p>
            <h2 className="mt-1 text-base font-black text-slate-950">{activeGeneration.label}</h2>
            {activeGeneration.totalCount > activeGeneration.people.length && (
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Mostrando {activeGeneration.people.length} de {activeGeneration.totalCount} pessoas nesta geração.
              </p>
            )}
          </div>

          {activeGeneration.people.map((person) => (
            <MobileHorizontalSimplePersonCard
              key={person.id}
              person={person}
              label={getCardLabel(person, centralPersonId, activeGeneration)}
              central={person.id === centralPersonId}
              onClick={onPersonClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const MobileFamilyHorizontalMapFilteredView = React.forwardRef<
  FamilyTreeActions,
  MobileFamilyHorizontalMapFilteredViewProps
>(MobileFamilyHorizontalMapFilteredViewComponent);
