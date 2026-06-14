import React from 'react';
import type { Node } from 'reactflow';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import type { Pessoa, Relacionamento } from '../../types';
import { isPetFamilyMember } from '../../utils/personEntity';
import type { FamilyTreeActions } from './FamilyTree';
import { VisualPersonCard } from './FamilyTreeVisualCards';
import { buildTreeGraph } from './buildTreeGraph';
import { collectDirectFamilyScopePersonIds } from './layouts/directFamilyDistributedLayout';
import { genealogyColumnsLayout } from './layouts/genealogyColumnsLayout';
import {
  DEFAULT_EDGE_FILTERS,
  type DirectRelativeFilters,
  type DirectRelativeGroup,
} from './types';
import {
  buildTreeExportFilename,
  captureElementToCanvas,
  downloadCanvasAsPng,
  exportCanvasAsPdf,
  openTreePrintWindow,
  prependTitleToCanvas,
  printCanvas,
  waitForExportUiSettle,
} from './utils/treeExport';
import {
  TreeExportLoadingOverlay,
  waitForTreeExportPaint,
} from './TreeAreaSelectionOverlay';

interface MobileFamilyHorizontalMapViewProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  centralPersonId: string;
  visiblePersonIds?: Set<string>;
  directRelativeFilters: DirectRelativeFilters;
  onPersonClick: (pessoa: Pessoa) => void;
  layoutRevision: number;
  onDirectRelationRenderedCounts?: (counts: Record<DirectRelativeGroup, number>) => void;
}

type SwipeState = {
  startX: number;
  startY: number;
  active: boolean;
};

type RelationshipMaps = {
  parentsByChild: Map<string, Set<string>>;
  childrenByParent: Map<string, Set<string>>;
  spousesByPerson: Map<string, Set<string>>;
};

type Point = [number, number];

type PersonLayout = {
  person: Pessoa;
  generation: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

type ConnectorKind = 'family' | 'spouse';

type Connector = {
  id: string;
  points: Point[];
  kind: ConnectorKind;
};

type CoupleConnectorCandidate = {
  key: string;
  generation: number;
  upperLayout: PersonLayout;
  lowerLayout: PersonLayout;
  childLayouts: PersonLayout[];
  coupleMidY: number;
};

type GenealogyReferencePlacement = {
  x: number;
  y: number;
};

const GENERATIONS = [1, 2, 3, 4, 5, 6] as const;
const ANCESTOR_SPOUSE_ANCHOR_GROUPS: DirectRelativeGroup[] = ['avos', 'bisavos', 'tataravos'];
const FILTERABLE_SPOUSE_ANCHOR_GROUPS: DirectRelativeGroup[] = ['tios', 'primos', 'sobrinhos', 'filhos', 'netos'];

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

const GENERATION_LABELS: Record<number, string> = {
  1: 'Tataravós',
  2: 'Bisavós',
  3: 'Avós',
  4: 'Pais',
  5: 'Núcleo',
  6: 'Descendentes',
};

const MOBILE_HORIZONTAL_CANVAS = {
  left: 0,
  top: 96,
  cardWidth: 192,
  cardHeight: 108,
  rowGap: 12,
  columnWidth: 264,
  minHeight: 560,
  headerTop: 32,
  headerHeight: 32,
  bottomPadding: 40,
  spouseConnectorOverlap: 10,
};

function isParentChildRelationship(relationship: Relacionamento) {
  return relationship.tipo_relacionamento === 'pai'
    || relationship.tipo_relacionamento === 'mae'
    || relationship.tipo_relacionamento === 'filho'
    || relationship.tipo_relacionamento === 'filiacao_sangue'
    || relationship.tipo_relacionamento === 'filiacao_adotiva';
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

function addToMap(map: Map<string, Set<string>>, key?: string | null, value?: string | null) {
  if (!key || !value) return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key)!.add(value);
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

function getManualGeneration(person: Pessoa) {
  const manualGeneration = Number(person.manual_generation);
  if (!Number.isFinite(manualGeneration)) return undefined;

  return Math.min(6, Math.max(1, Math.trunc(manualGeneration)));
}

function inferHorizontalGenerations(
  pessoas: Pessoa[],
  maps: RelationshipMaps,
  centralPersonId: string,
) {
  const peopleById = new Map(pessoas.map((person) => [person.id, person]));
  const generationByPersonId = new Map<string, number>();

  pessoas.forEach((person) => {
    const manualGeneration = getManualGeneration(person);
    if (manualGeneration !== undefined) generationByPersonId.set(person.id, manualGeneration);
  });

  const visited = new Set<string>();
  const queue: Array<{ personId: string; generation: number }> = [
    { personId: centralPersonId, generation: generationByPersonId.get(centralPersonId) ?? 5 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || !peopleById.has(current.personId) || visited.has(current.personId)) continue;
    visited.add(current.personId);

    const generation = generationByPersonId.get(current.personId)
      ?? Math.min(6, Math.max(1, current.generation));

    if (!generationByPersonId.has(current.personId)) generationByPersonId.set(current.personId, generation);

    maps.parentsByChild.get(current.personId)?.forEach((parentId) => {
      queue.push({ personId: parentId, generation: generation - 1 });
    });
    maps.childrenByParent.get(current.personId)?.forEach((childId) => {
      queue.push({ personId: childId, generation: generation + 1 });
    });
    maps.spousesByPerson.get(current.personId)?.forEach((spouseId) => {
      queue.push({ personId: spouseId, generation });
    });
  }

  return generationByPersonId;
}

function getFallbackSortableBirthValue(value?: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const year = String(value).match(/\d{4}/)?.[0];
  return year ? Number(year) : Number.POSITIVE_INFINITY;
}

function sortPeopleByFallback(a: Pessoa, b: Pessoa, centralPersonId: string) {
  if (a.id === centralPersonId) return -1;
  if (b.id === centralPersonId) return 1;

  const birthA = getFallbackSortableBirthValue(a.data_nascimento);
  const birthB = getFallbackSortableBirthValue(b.data_nascimento);
  if (birthA !== birthB) return birthA - birthB;

  return (a.nome_completo || '').localeCompare(b.nome_completo || '', 'pt-BR');
}

function sortPeopleByBirthThenName(people: Pessoa[]) {
  return [...people].sort((a, b) => {
    const birthA = getFallbackSortableBirthValue(a.data_nascimento);
    const birthB = getFallbackSortableBirthValue(b.data_nascimento);
    if (birthA !== birthB) return birthA - birthB;
    return (a.nome_completo || '').localeCompare(b.nome_completo || '', 'pt-BR');
  });
}

function getParentGroupKey(person: Pessoa, maps: RelationshipMaps) {
  const parentIds = Array.from(maps.parentsByChild.get(person.id) ?? []).sort();
  if (parentIds.length === 0) return undefined;
  return parentIds.join('::');
}

function orderChildrenByParentGroups(people: Pessoa[], maps: RelationshipMaps) {
  const groupByParentKey = new Map<string, Pessoa[]>();
  const placedPersonIds = new Set<string>();
  const orderedPeople: Pessoa[] = [];

  people.forEach((person) => {
    const parentKey = getParentGroupKey(person, maps);
    if (!parentKey) return;
    if (!groupByParentKey.has(parentKey)) groupByParentKey.set(parentKey, []);
    groupByParentKey.get(parentKey)!.push(person);
  });

  people.forEach((person) => {
    if (placedPersonIds.has(person.id)) return;

    const parentKey = getParentGroupKey(person, maps);
    const siblings = parentKey ? groupByParentKey.get(parentKey) : undefined;

    if (!siblings || siblings.length <= 1) {
      orderedPeople.push(person);
      placedPersonIds.add(person.id);
      return;
    }

    sortPeopleByBirthThenName(siblings).forEach((sibling) => {
      if (placedPersonIds.has(sibling.id)) return;
      orderedPeople.push(sibling);
      placedPersonIds.add(sibling.id);
    });
  });

  return orderedPeople;
}

function orderPeopleWithAdjacentSpouses(people: Pessoa[], maps: RelationshipMaps) {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const originalIndexByPersonId = new Map(people.map((person, index) => [person.id, index]));
  const placedPersonIds = new Set<string>();
  const orderedPeople: Pessoa[] = [];

  people.forEach((person) => {
    if (placedPersonIds.has(person.id)) return;

    orderedPeople.push(person);
    placedPersonIds.add(person.id);

    const spouse = Array.from(maps.spousesByPerson.get(person.id) ?? [])
      .map((spouseId) => peopleById.get(spouseId))
      .filter((candidate): candidate is Pessoa => Boolean(candidate) && !placedPersonIds.has(candidate.id))
      .sort((a, b) => {
        const indexA = originalIndexByPersonId.get(a.id) ?? Number.POSITIVE_INFINITY;
        const indexB = originalIndexByPersonId.get(b.id) ?? Number.POSITIVE_INFINITY;
        return indexA - indexB;
      })[0];

    if (!spouse) return;

    orderedPeople.push(spouse);
    placedPersonIds.add(spouse.id);
  });

  return orderedPeople;
}

function isPersonNodeWithPessoa(node: Node): node is Node & { data: { pessoa: Pessoa } } {
  return node.type === 'personNode' && Boolean(node.data?.pessoa);
}

function buildGenealogyReferencePlacements(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[],
  onPersonClick: (pessoa: Pessoa) => void,
) {
  const graph = buildTreeGraph({
    pessoas,
    relacionamentos,
    onPersonClick,
    edgeFilters: DEFAULT_EDGE_FILTERS,
  });

  const layout = genealogyColumnsLayout(graph, {
    edgeFilters: DEFAULT_EDGE_FILTERS,
    hideUngenerated: true,
  });

  const placements = new Map<string, GenealogyReferencePlacement>();

  layout.nodes
    .filter(isPersonNodeWithPessoa)
    .forEach((node) => {
      placements.set(node.data.pessoa.id, {
        x: node.position.x,
        y: node.position.y,
      });
    });

  return placements;
}

function createDirectRelativeFiltersForGroups(groups: DirectRelativeGroup[]): DirectRelativeFilters {
  const activeGroups = new Set(groups);

  return {
    pais: activeGroups.has('pais'),
    avos: activeGroups.has('avos'),
    bisavos: activeGroups.has('bisavos'),
    tataravos: activeGroups.has('tataravos'),
    conjuge: activeGroups.has('conjuge'),
    filhos: activeGroups.has('filhos'),
    netos: activeGroups.has('netos'),
    irmaos: activeGroups.has('irmaos'),
    sobrinhos: activeGroups.has('sobrinhos'),
    tios: activeGroups.has('tios'),
    primos: activeGroups.has('primos'),
    pets: activeGroups.has('pets'),
  };
}

function getExportFirstName(person?: Pessoa) {
  return person?.nome_completo?.trim().split(/\s+/).filter(Boolean)[0];
}

function getCardLabel(person: Pessoa, generation: number, centralPersonId: string, maps: RelationshipMaps, spouseTonePersonIds: Set<string>) {
  if (spouseTonePersonIds.has(person.id)) return 'Cônjuge';
  if (isPetFamilyMember(person)) return 'Pets';
  if (person.id === centralPersonId) return 'Pessoa Central';
  if (maps.spousesByPerson.get(centralPersonId)?.has(person.id)) return 'Cônjuge';

  return GENERATION_LABELS[generation] ?? `Geração ${generation}`;
}

function connectorPath(points: Point[]) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

function pairKey(firstId: string, secondId: string) {
  return [firstId, secondId].sort().join('::');
}

function getChildLayoutsForCouple(
  firstLayout: PersonLayout,
  secondLayout: PersonLayout,
  layouts: Map<string, PersonLayout>,
  maps: RelationshipMaps,
) {
  const firstChildren = maps.childrenByParent.get(firstLayout.person.id) ?? new Set<string>();
  const secondChildren = maps.childrenByParent.get(secondLayout.person.id) ?? new Set<string>();
  const commonChildIds = Array.from(firstChildren).filter((childId) => secondChildren.has(childId));

  return commonChildIds
    .map((childId) => layouts.get(childId))
    .filter((layout): layout is PersonLayout => Boolean(layout) && layout.generation === firstLayout.generation + 1)
    .sort((a, b) => {
      const birthA = getFallbackSortableBirthValue(a.person.data_nascimento);
      const birthB = getFallbackSortableBirthValue(b.person.data_nascimento);
      if (birthA !== birthB) return birthA - birthB;
      return a.top - b.top;
    });
}

function getDistributedTrunkX(candidate: CoupleConnectorCandidate, index: number, total: number) {
  const columnRight = candidate.upperLayout.left + candidate.upperLayout.width;
  const nextColumnLeft = Math.min(...candidate.childLayouts.map((layout) => layout.left));
  const gap = Math.max(12, nextColumnLeft - columnRight);
  const step = gap / (total + 1);
  return columnRight + step * (index + 1);
}

function buildConnectors(layouts: Map<string, PersonLayout>, maps: RelationshipMaps) {
  const connectors: Connector[] = [];
  const visiblePairKeys = new Set<string>();
  const childConnectorCandidates: CoupleConnectorCandidate[] = [];

  maps.spousesByPerson.forEach((spouseIds, personId) => {
    const personLayout = layouts.get(personId);
    if (!personLayout) return;

    spouseIds.forEach((spouseId) => {
      const spouseLayout = layouts.get(spouseId);
      if (!spouseLayout || spouseLayout.generation !== personLayout.generation) return;

      const key = pairKey(personId, spouseId);
      if (visiblePairKeys.has(key)) return;
      visiblePairKeys.add(key);

      const upperLayout = personLayout.top <= spouseLayout.top ? personLayout : spouseLayout;
      const lowerLayout = personLayout.top <= spouseLayout.top ? spouseLayout : personLayout;
      const spouseX = upperLayout.left + upperLayout.width / 2;
      const coupleMidY = (upperLayout.top + upperLayout.height + lowerLayout.top) / 2;
      const spouseConnectorStartY = upperLayout.top
        + upperLayout.height
        - MOBILE_HORIZONTAL_CANVAS.spouseConnectorOverlap;
      const spouseConnectorEndY = lowerLayout.top
        + MOBILE_HORIZONTAL_CANVAS.spouseConnectorOverlap;

      connectors.push({
        id: `mobile-spouse-${key}`,
        kind: 'spouse',
        points: [
          [spouseX, spouseConnectorStartY],
          [spouseX, spouseConnectorEndY],
        ],
      });

      const childLayouts = getChildLayoutsForCouple(upperLayout, lowerLayout, layouts, maps);
      if (childLayouts.length === 0) return;

      childConnectorCandidates.push({
        key,
        generation: upperLayout.generation,
        upperLayout,
        lowerLayout,
        childLayouts,
        coupleMidY,
      });
    });
  });

  const candidatesByGeneration = new Map<number, CoupleConnectorCandidate[]>();
  childConnectorCandidates.forEach((candidate) => {
    if (!candidatesByGeneration.has(candidate.generation)) candidatesByGeneration.set(candidate.generation, []);
    candidatesByGeneration.get(candidate.generation)!.push(candidate);
  });

  candidatesByGeneration.forEach((candidates) => {
    const orderedCandidates = [...candidates].sort((a, b) => a.coupleMidY - b.coupleMidY);

    orderedCandidates.forEach((candidate, index) => {
      const spouseX = candidate.upperLayout.left + candidate.upperLayout.width / 2;
      const trunkX = getDistributedTrunkX(candidate, index, orderedCandidates.length);
      const childCenters = candidate.childLayouts.map((layout) => layout.top + layout.height / 2);
      const firstChildY = Math.min(...childCenters);
      const lastChildY = Math.max(...childCenters);
      const trunkTop = Math.min(candidate.coupleMidY, firstChildY);
      const trunkBottom = Math.max(candidate.coupleMidY, lastChildY);

      connectors.push({
        id: `mobile-couple-out-${candidate.key}`,
        kind: 'family',
        points: [
          [spouseX, candidate.coupleMidY],
          [trunkX, candidate.coupleMidY],
        ],
      });

      connectors.push({
        id: `mobile-couple-trunk-${candidate.key}`,
        kind: 'family',
        points: [
          [trunkX, trunkTop],
          [trunkX, trunkBottom],
        ],
      });

      candidate.childLayouts.forEach((childLayout) => {
        const childY = childLayout.top + childLayout.height / 2;

        connectors.push({
          id: `mobile-couple-child-${candidate.key}-${childLayout.person.id}`,
          kind: 'family',
          points: [
            [trunkX, childY],
            [childLayout.left, childY],
          ],
        });
      });
    });
  });

  return connectors;
}

function getCanvasWidth(activeGenerations: number[]) {
  if (activeGenerations.length === 0) return MOBILE_HORIZONTAL_CANVAS.cardWidth;

  return MOBILE_HORIZONTAL_CANVAS.cardWidth
    + Math.max(0, activeGenerations.length - 1) * MOBILE_HORIZONTAL_CANVAS.columnWidth;
}

function getScreenIndex(activeGenerations: number[], generation: number) {
  return Math.max(0, activeGenerations.indexOf(generation));
}

function MobileFamilyHorizontalMapViewComponent({
  pessoas,
  relacionamentos,
  centralPersonId,
  visiblePersonIds,
  directRelativeFilters,
  onPersonClick,
  layoutRevision,
  onDirectRelationRenderedCounts,
}: MobileFamilyHorizontalMapViewProps, ref: React.ForwardedRef<FamilyTreeActions>) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const captureRef = React.useRef<HTMLElement | null>(null);
  const stageScrollRef = React.useRef<HTMLDivElement | null>(null);
  const generationColumnRefs = React.useRef(new Map<number, HTMLElement | null>());
  const swipeStateRef = React.useRef<SwipeState | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [dragX, setDragX] = React.useState(0);
  const [manualZoom, setManualZoom] = React.useState(1);
  const [stageViewportWidth, setStageViewportWidth] = React.useState(MOBILE_HORIZONTAL_CANVAS.cardWidth);
  const [exportLoadingMessage, setExportLoadingMessage] = React.useState<string | null>(null);

  const maps = React.useMemo(() => buildRelationshipMaps(relacionamentos), [relacionamentos]);

  const horizontalVisibility = React.useMemo(() => {
    const statusFilteredPeople = pessoas.filter((person) => {
      if (visiblePersonIds && !visiblePersonIds.has(person.id)) return false;
      return true;
    });
    const peopleById = new Map(statusFilteredPeople.map((person) => [person.id, person]));
    const graph = buildTreeGraph({
      pessoas: statusFilteredPeople,
      relacionamentos,
      selectedPersonId: centralPersonId,
      onPersonClick,
      edgeFilters: DEFAULT_EDGE_FILTERS,
    });
    const directScopeIds = collectDirectFamilyScopePersonIds(graph, {
      centralPersonId,
      filters: directRelativeFilters,
    });

    if (directScopeIds.size === 0) {
      return {
        people: [] as Pessoa[],
        spouseTonePersonIds: new Set<string>(),
        filterableSpousePersonIds: new Set<string>(),
      };
    }

    const selectedPersonIds = new Set(directScopeIds);
    const spouseTonePersonIds = new Set<string>();
    const filterableSpousePersonIds = new Set<string>();
    const requiredSpousePersonIds = new Set<string>();

    const collectScopeForGroups = (groups: DirectRelativeGroup[]) => collectDirectFamilyScopePersonIds(graph, {
      centralPersonId,
      filters: createDirectRelativeFiltersForGroups(groups),
    });

    const includeSpousesForAnchors = (
      anchorIds: Iterable<string>,
      trackedSpouseIds?: Set<string>,
    ) => {
      Array.from(anchorIds).forEach((anchorId) => {
        maps.spousesByPerson.get(anchorId)?.forEach((spouseId) => {
          if (!peopleById.has(spouseId)) return;
          selectedPersonIds.add(spouseId);
          trackedSpouseIds?.add(spouseId);
          if (!directScopeIds.has(spouseId)) spouseTonePersonIds.add(spouseId);
        });
      });
    };

    includeSpousesForAnchors([centralPersonId], requiredSpousePersonIds);

    const activeAncestorGroups = ANCESTOR_SPOUSE_ANCHOR_GROUPS.filter((group) => directRelativeFilters[group]);
    includeSpousesForAnchors(collectScopeForGroups(activeAncestorGroups), requiredSpousePersonIds);

    const activeFilterableGroups = FILTERABLE_SPOUSE_ANCHOR_GROUPS.filter((group) => directRelativeFilters[group]);
    const filterableAnchorIds = collectScopeForGroups(activeFilterableGroups);
    Array.from(filterableAnchorIds).forEach((anchorId) => {
      maps.spousesByPerson.get(anchorId)?.forEach((spouseId) => {
        if (!peopleById.has(spouseId) || requiredSpousePersonIds.has(spouseId)) return;
        filterableSpousePersonIds.add(spouseId);
      });
    });

    if (directRelativeFilters.conjuge) {
      includeSpousesForAnchors(filterableAnchorIds);
    }

    return {
      people: statusFilteredPeople.filter((person) => selectedPersonIds.has(person.id)),
      spouseTonePersonIds,
      filterableSpousePersonIds,
    };
  }, [centralPersonId, directRelativeFilters, maps, onPersonClick, pessoas, relacionamentos, visiblePersonIds]);

  const visibleHorizontalPessoas = horizontalVisibility.people;
  const spouseTonePersonIds = horizontalVisibility.spouseTonePersonIds;
  const filterableSpousePersonIds = horizontalVisibility.filterableSpousePersonIds;

  const centralPerson = React.useMemo(
    () => pessoas.find((person) => person.id === centralPersonId),
    [centralPersonId, pessoas],
  );

  const exportTitle = React.useMemo(() => {
    const firstName = getExportFirstName(centralPerson);
    return firstName ? `Mapa Genealógico de ${firstName}` : 'Mapa Genealógico';
  }, [centralPerson]);

  const generationByPersonId = React.useMemo(
    () => inferHorizontalGenerations(visibleHorizontalPessoas, maps, centralPersonId),
    [centralPersonId, maps, visibleHorizontalPessoas],
  );

  const genealogyReferencePlacements = React.useMemo(
    () => buildGenealogyReferencePlacements(visibleHorizontalPessoas, relacionamentos, onPersonClick),
    [onPersonClick, relacionamentos, visibleHorizontalPessoas],
  );

  const peopleByGeneration = React.useMemo(() => {
    const result = new Map<number, Pessoa[]>();
    GENERATIONS.forEach((generation) => result.set(generation, []));

    visibleHorizontalPessoas.forEach((person) => {
      const generation = generationByPersonId.get(person.id);
      if (!generation || generation < 1 || generation > 6) return;
      result.get(generation)?.push(person);
    });

    result.forEach((generationPeople, generation) => {
      generationPeople.sort((a, b) => {
        const referenceA = genealogyReferencePlacements.get(a.id);
        const referenceB = genealogyReferencePlacements.get(b.id);

        if (referenceA && referenceB) {
          if (referenceA.y !== referenceB.y) return referenceA.y - referenceB.y;
          return referenceA.x - referenceB.x;
        }

        if (referenceA) return -1;
        if (referenceB) return 1;

        return sortPeopleByFallback(a, b, centralPersonId);
      });

      const orderedChildren = orderChildrenByParentGroups(generationPeople, maps);
      result.set(generation, orderPeopleWithAdjacentSpouses(orderedChildren, maps));
    });

    return result;
  }, [centralPersonId, generationByPersonId, genealogyReferencePlacements, maps, visibleHorizontalPessoas]);

  const activeGenerations = React.useMemo(
    () => GENERATIONS.filter((generation) => (peopleByGeneration.get(generation)?.length ?? 0) > 0),
    [peopleByGeneration],
  );

  const { layouts, canvasWidth, canvasHeight } = React.useMemo(() => {
    const nextLayouts = new Map<string, PersonLayout>();
    let maxBottom = MOBILE_HORIZONTAL_CANVAS.top + MOBILE_HORIZONTAL_CANVAS.cardHeight;

    activeGenerations.forEach((generation, columnIndex) => {
      const people = peopleByGeneration.get(generation) ?? [];
      const left = MOBILE_HORIZONTAL_CANVAS.left + columnIndex * MOBILE_HORIZONTAL_CANVAS.columnWidth;

      people.forEach((person, rowIndex) => {
        const top = MOBILE_HORIZONTAL_CANVAS.top
          + rowIndex * (MOBILE_HORIZONTAL_CANVAS.cardHeight + MOBILE_HORIZONTAL_CANVAS.rowGap);

        const layout: PersonLayout = {
          person,
          generation,
          left,
          top,
          width: MOBILE_HORIZONTAL_CANVAS.cardWidth,
          height: MOBILE_HORIZONTAL_CANVAS.cardHeight,
        };

        nextLayouts.set(person.id, layout);
        maxBottom = Math.max(maxBottom, top + MOBILE_HORIZONTAL_CANVAS.cardHeight);
      });
    });

    return {
      layouts: nextLayouts,
      canvasWidth: getCanvasWidth(activeGenerations),
      canvasHeight: Math.max(
        MOBILE_HORIZONTAL_CANVAS.minHeight,
        maxBottom + MOBILE_HORIZONTAL_CANVAS.bottomPadding,
      ),
    };
  }, [activeGenerations, peopleByGeneration]);

  const connectors = React.useMemo(
    () => buildConnectors(layouts, maps),
    [layouts, maps],
  );

  const familyConnectors = React.useMemo(
    () => connectors.filter((connector) => connector.kind === 'family'),
    [connectors],
  );

  const spouseConnectors = React.useMemo(
    () => connectors.filter((connector) => connector.kind === 'spouse'),
    [connectors],
  );

  const activeGenerationSignature = activeGenerations.join('|');

  React.useEffect(() => {
    const centralGeneration = generationByPersonId.get(centralPersonId);
    const defaultIndex = centralGeneration ? getScreenIndex(activeGenerations, centralGeneration) : 0;
    setActiveIndex(defaultIndex >= 0 ? defaultIndex : 0);
    setDragX(0);
    setManualZoom(1);
  }, [activeGenerationSignature, centralPersonId, generationByPersonId, layoutRevision]);

  const activeGeneration = activeGenerations[activeIndex];
  const activeColumnIndex = Math.max(0, activeIndex);
  const activeColumnLeft = MOBILE_HORIZONTAL_CANVAS.left
    + activeColumnIndex * MOBILE_HORIZONTAL_CANVAS.columnWidth;

  const activeLayouts = React.useMemo(
    () => Array.from(layouts.values())
      .filter((layout) => layout.generation === activeGeneration)
      .sort((a, b) => a.top - b.top),
    [activeGeneration, layouts],
  );

  const activeGenerationHeight = React.useMemo(() => {
    const headerBottom = MOBILE_HORIZONTAL_CANVAS.headerTop
      + MOBILE_HORIZONTAL_CANVAS.headerHeight;

    if (activeLayouts.length === 0) {
      return headerBottom + MOBILE_HORIZONTAL_CANVAS.bottomPadding;
    }

    const lastCardBottom = Math.max(...activeLayouts.map((layout) => layout.top + layout.height));

    return lastCardBottom + 12;
  }, [activeLayouts]);

  const activeConnectorViewportWidth = React.useMemo(
    () => Math.max(MOBILE_HORIZONTAL_CANVAS.cardWidth, stageViewportWidth),
    [stageViewportWidth],
  );

  const activeConnectorViewportLeft = React.useMemo(() => {
    const sideInset = Math.max(
      0,
      (activeConnectorViewportWidth - MOBILE_HORIZONTAL_CANVAS.cardWidth) / 2,
    );

    return Math.max(0, activeColumnLeft - sideInset);
  }, [activeColumnLeft, activeConnectorViewportWidth]);

  const activeSpouseConnectors = React.useMemo(
    () => spouseConnectors.filter((connector) => connector.points.every(([x]) => (
      x >= activeColumnLeft
      && x <= activeColumnLeft + MOBILE_HORIZONTAL_CANVAS.cardWidth
    ))),
    [activeColumnLeft, spouseConnectors],
  );

  React.useEffect(() => {
    if (activeGenerations.length === 0) {
      onDirectRelationRenderedCounts?.(EMPTY_COUNTS);
      return;
    }

    const generationCount = (generation: number) => peopleByGeneration.get(generation)?.length ?? 0;

    onDirectRelationRenderedCounts?.({
      ...EMPTY_COUNTS,
      pais: generationCount(4),
      avos: generationCount(3),
      bisavos: generationCount(2),
      tataravos: generationCount(1),
      filhos: generationCount(6),
      conjuge: filterableSpousePersonIds.size,
      pets: visibleHorizontalPessoas.filter(isPetFamilyMember).length,
    });
  }, [activeGenerations.length, filterableSpousePersonIds.size, onDirectRelationRenderedCounts, peopleByGeneration, visibleHorizontalPessoas]);

  const goToIndex = React.useCallback((index: number) => {
    setActiveIndex(Math.max(0, Math.min(activeGenerations.length - 1, index)));
    setDragX(0);
  }, [activeGenerations.length]);

  const setGenerationColumnRef = React.useCallback((generation: number) => (node: HTMLElement | null) => {
    if (node) {
      generationColumnRefs.current.set(generation, node);
      return;
    }

    generationColumnRefs.current.delete(generation);
  }, []);

  React.useEffect(() => {
    const stage = stageScrollRef.current;
    if (!stage) return;

    stage.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [activeIndex, layoutRevision]);

  React.useEffect(() => {
    const stage = stageScrollRef.current;
    if (!stage) return;

    const updateStageViewportWidth = () => {
      setStageViewportWidth(Math.max(MOBILE_HORIZONTAL_CANVAS.cardWidth, stage.clientWidth));
    };

    updateStageViewportWidth();

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateStageViewportWidth)
      : undefined;

    resizeObserver?.observe(stage);
    window.addEventListener('resize', updateStageViewportWidth);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateStageViewportWidth);
    };
  }, [activeIndex, layoutRevision]);

  const handleTouchStart = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;

    swipeStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      active: false,
    };
    setDragX(0);
  }, []);

  const handleTouchMove = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const swipeState = swipeStateRef.current;
    const touch = event.touches[0];
    if (!swipeState || !touch) return;

    const deltaX = touch.clientX - swipeState.startX;
    const deltaY = touch.clientY - swipeState.startY;
    const absoluteX = Math.abs(deltaX);
    const absoluteY = Math.abs(deltaY);

    if (!swipeState.active && absoluteX < 10) return;
    if (absoluteX <= absoluteY * 1.2) return;

    swipeState.active = true;
    setDragX(deltaX);
  }, []);

  const handleTouchEnd = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const swipeState = swipeStateRef.current;
    const touch = event.changedTouches[0];
    swipeStateRef.current = null;

    if (!swipeState || !touch) {
      setDragX(0);
      return;
    }

    const deltaX = touch.clientX - swipeState.startX;
    const absoluteX = Math.abs(deltaX);
    const threshold = Math.max(56, (viewportRef.current?.clientWidth ?? 360) * 0.18);

    if (swipeState.active && absoluteX >= threshold) {
      goToIndex(deltaX > 0 ? activeIndex + 1 : activeIndex - 1);
      return;
    }

    setDragX(0);
  }, [activeIndex, goToIndex]);

  const captureActiveGeneration = React.useCallback(async () => {
    const element = captureRef.current;
    if (!element) {
      throw new Error('Tela da geração ativa não encontrada para exportação.');
    }

    return captureElementToCanvas(element);
  }, []);

  const handleSaveImage = React.useCallback(async () => {
    if (exportLoadingMessage) return;
    setExportLoadingMessage('Preparando imagem...');

    try {
      await waitForTreeExportPaint();
      await waitForExportUiSettle(150);
      const canvas = prependTitleToCanvas(await captureActiveGeneration(), exportTitle);
      downloadCanvasAsPng(canvas, buildTreeExportFilename('mapa-familiar-horizontal-mobile', 'png'));
      await waitForExportUiSettle(700);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar a imagem.');
    } finally {
      setExportLoadingMessage(null);
    }
  }, [captureActiveGeneration, exportLoadingMessage, exportTitle]);

  const handleSavePdf = React.useCallback(async () => {
    if (exportLoadingMessage) return;
    setExportLoadingMessage('Gerando PDF...');

    try {
      await waitForTreeExportPaint();
      await waitForExportUiSettle(150);
      const canvas = prependTitleToCanvas(await captureActiveGeneration(), exportTitle);
      await exportCanvasAsPdf(
        canvas,
        buildTreeExportFilename('mapa-familiar-horizontal-mobile', 'pdf'),
        '',
      );
      await waitForExportUiSettle(700);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar o PDF.');
    } finally {
      setExportLoadingMessage(null);
    }
  }, [captureActiveGeneration, exportLoadingMessage, exportTitle]);

  const handlePrint = React.useCallback(async () => {
    if (exportLoadingMessage) return;
    const printWindow = openTreePrintWindow();
    setExportLoadingMessage('Preparando impressão...');

    try {
      await waitForTreeExportPaint();
      await waitForExportUiSettle(150);
      const canvas = prependTitleToCanvas(await captureActiveGeneration(), exportTitle);
      await printCanvas(canvas, exportTitle, printWindow);
      await waitForExportUiSettle(700);
    } catch (error) {
      if (!printWindow.closed) printWindow.close();
      toast.error(error instanceof Error ? error.message : 'Não foi possível imprimir.');
    } finally {
      setExportLoadingMessage(null);
    }
  }, [captureActiveGeneration, exportLoadingMessage, exportTitle]);

  React.useImperativeHandle(ref, () => ({
    zoomIn: () => setManualZoom((currentZoom) => Math.min(1.35, Number((currentZoom + 0.08).toFixed(2)))),
    zoomOut: () => setManualZoom((currentZoom) => Math.max(0.78, Number((currentZoom - 0.08).toFixed(2)))),
    print: handlePrint,
    savePdf: handleSavePdf,
    saveImage: handleSaveImage,
    startAreaSelection: () => toast.info('Seleção manual de área permanece disponível na versão desktop.'),
  }), [handlePrint, handleSaveImage, handleSavePdf]);


  if (activeGenerations.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#f8efe4] px-6 text-center">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-6 text-sm font-semibold text-slate-500 shadow-sm">
          Nenhuma geração visível para os filtros atuais.
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className="absolute inset-0 overflow-hidden bg-[#f8efe4]"
      data-family-map-horizontal-mobile-root="true"
    >
      <nav
        aria-label="Gerações do Mapa Genealógico"
        className="absolute inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 px-2 py-2 shadow-sm backdrop-blur"
        data-tree-export-ignore="true"
      >
        <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-webkit-overflow-scrolling:touch]">
          {activeGenerations.map((generation, index) => (
            <button
              key={generation}
              type="button"
              onClick={() => goToIndex(index)}
              aria-current={index === activeIndex ? 'page' : undefined}
              className={[
                'shrink-0 rounded-full px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] transition',
                index === activeIndex
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 active:bg-slate-200',
              ].join(' ')}
            >
              G{generation}
            </button>
          ))}
        </div>
      </nav>

      <div
        ref={stageScrollRef}
        className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+5.65rem)] top-[48px] overflow-x-hidden overflow-y-auto overscroll-x-none overscroll-y-contain bg-[#f8efe4] [-webkit-overflow-scrolling:touch]"
        data-mobile-horizontal-stage="true"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative mx-auto w-[12rem] pb-3 pt-8"
          style={{ transform: `scale(${manualZoom})`, transformOrigin: 'top center' }}
        >
          <div
            ref={(node) => {
              if (node) captureRef.current = node;
            }}
            className="relative"
            style={{
              width: MOBILE_HORIZONTAL_CANVAS.cardWidth,
              height: activeGenerationHeight,
            }}
            data-mobile-horizontal-map-surface="true"
          >
            <div
              className="absolute z-10 -translate-x-1/2 rounded-full bg-slate-600 px-5 py-2 text-[12px] font-extrabold uppercase tracking-[0.18em] text-white shadow-md"
              style={{
                left: MOBILE_HORIZONTAL_CANVAS.cardWidth / 2,
                top: MOBILE_HORIZONTAL_CANVAS.headerTop,
              }}
            >
              Geração {activeGeneration}
            </div>

            {familyConnectors.length > 0 && (
              <svg
                data-family-map-family-connectors="true"
                className="pointer-events-none absolute top-0 z-0 h-full"
                style={{
                  left: -Math.max(
                    0,
                    (activeConnectorViewportWidth - MOBILE_HORIZONTAL_CANVAS.cardWidth) / 2,
                  ),
                  width: activeConnectorViewportWidth,
                  height: activeGenerationHeight,
                }}
                viewBox={`${activeConnectorViewportLeft} 0 ${activeConnectorViewportWidth} ${activeGenerationHeight}`}
                aria-hidden="true"
              >
                <g
                  fill="none"
                  stroke="#d9ad82"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {familyConnectors.map((connector) => (
                    <path key={connector.id} d={connectorPath(connector.points)} />
                  ))}
                </g>
              </svg>
            )}

            {activeSpouseConnectors.length > 0 && (
              <svg
                data-family-map-spouse-connectors="true"
                className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                viewBox={`${activeColumnLeft} 0 ${MOBILE_HORIZONTAL_CANVAS.cardWidth} ${activeGenerationHeight}`}
                aria-hidden="true"
              >
                <g
                  fill="none"
                  stroke="#d9ad82"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {activeSpouseConnectors.map((connector) => (
                    <path key={connector.id} d={connectorPath(connector.points)} />
                  ))}
                </g>
              </svg>
            )}

            {activeLayouts.map((layout) => (
              <div
                key={layout.person.id}
                className="absolute z-20"
                style={{
                  left: layout.left - activeColumnLeft,
                  top: layout.top,
                  width: layout.width,
                }}
                data-mobile-horizontal-generation={layout.generation}
                data-mobile-horizontal-card="true"
              >
                <VisualPersonCard
                  person={layout.person}
                  label={getCardLabel(layout.person, layout.generation, centralPersonId, maps, spouseTonePersonIds)}
                  horizontal
                  roomy
                  onClick={onPersonClick}
                  vitalMode="year"
                />
              </div>
            ))}
          </div>
        </div>
      </div>


      {activeIndex > 0 && (
        <button
          type="button"
          onClick={() => goToIndex(activeIndex - 1)}
          className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-lg"
          aria-label="Ir para geração anterior"
          data-tree-export-ignore="true"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {activeIndex < activeGenerations.length - 1 && (
        <button
          type="button"
          onClick={() => goToIndex(activeIndex + 1)}
          className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-lg"
          aria-label="Ir para próxima geração"
          data-tree-export-ignore="true"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {exportLoadingMessage && (
        <TreeExportLoadingOverlay
          title="Exportando geração"
          message={exportLoadingMessage}
        />
      )}
    </div>
  );

}

export const MobileFamilyHorizontalMapView = React.forwardRef<
  FamilyTreeActions,
  MobileFamilyHorizontalMapViewProps
>(MobileFamilyHorizontalMapViewComponent);
