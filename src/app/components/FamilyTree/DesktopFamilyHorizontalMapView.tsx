import React from 'react';
import type { Node } from 'reactflow';
import { toast } from 'sonner';

import type { Pessoa, Relacionamento } from '../../types';
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
  openTreeExportPreviewWindow,
  prependTitleToCanvas,
  previewCanvasAsPdf,
  previewCanvasAsPng,
  previewCanvasForPrint,
} from './utils/treeExport';
import {
  TreeAreaSelectionOverlay,
} from './TreeAreaSelectionOverlay';

interface DesktopFamilyHorizontalMapViewProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  centralPersonId: string;
  visiblePersonIds?: Set<string>;
  directRelativeFilters: DirectRelativeFilters;
  onPersonClick: (pessoa: Pessoa) => void;
  layoutRevision: number;
  onScrollStateChange?: (hasScrolled: boolean) => void;
  onDirectRelationRenderedCounts?: (counts: Record<DirectRelativeGroup, number>) => void;
}

type Point = [number, number];

type RelationshipMaps = {
  parentsByChild: Map<string, Set<string>>;
  childrenByParent: Map<string, Set<string>>;
  spousesByPerson: Map<string, Set<string>>;
};

type PersonLayout = {
  person: Pessoa;
  generation: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

type Connector = {
  id: string;
  points: Point[];
  familyKey?: string;
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

const MAX_DIRECT_EXPORT_PIXELS = 24_000_000;

function estimateElementExportPixels(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const scale = typeof window === 'undefined'
    ? 1
    : Math.min(2, window.devicePixelRatio || 1);

  return rect.width * scale * rect.height * scale;
}

function assertSafeDirectExportSize(element: HTMLElement, label: string) {
  if (estimateElementExportPixels(element) <= MAX_DIRECT_EXPORT_PIXELS) return;

  throw new Error(
    `${label} está muito grande para exportar com segurança neste zoom. Reduza o zoom ou use a exportação por área.`
  );
}

function getExportFirstName(person?: Pessoa) {
  return person?.nome_completo?.trim().split(/\s+/).filter(Boolean)[0];
}


const CANVAS = {
  minWidth: 420,
  minHeight: 900,
  left: 64,
  top: 96,
  columnWidth: 246,
  cardWidth: 214,
  cardHeight: 74,
  rowGap: 22,
  minScale: 0.7,
  minZoom: 0.7,
  maxZoom: 2.2,
  zoomStep: 0.08,
};

const GENERATIONS = [1, 2, 3, 4, 5, 6] as const;
const STABLE_SCALE_RECALCULATION_DELAYS = [0, 120, 320] as const;

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

const ANCESTOR_SPOUSE_ANCHOR_GROUPS: DirectRelativeGroup[] = ['avos', 'bisavos', 'tataravos'];
const FILTERABLE_SPOUSE_ANCHOR_GROUPS: DirectRelativeGroup[] = ['irmaos', 'tios', 'primos', 'sobrinhos', 'filhos', 'netos'];

function getTreeHighlightGroupsActive() {
  return typeof document !== 'undefined'
    && document.documentElement.dataset.treeHighlightGroups === 'true';
}

function useTreeHighlightGroupsActive() {
  const [active, setActive] = React.useState(getTreeHighlightGroupsActive);

  React.useEffect(() => {
    const root = document.documentElement;
    const updateActive = () => setActive(getTreeHighlightGroupsActive());
    const observer = new MutationObserver(updateActive);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-tree-highlight-groups'],
    });
    updateActive();

    return () => observer.disconnect();
  }, []);

  return active;
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

function addToMap(map: Map<string, Set<string>>, key: string, value: string) {
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

function getFallbackSortableBirthValue(value?: string | number | null) {
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

function normalizeHorizontalPersonName(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function isNamedPerson(person: Pessoa, expectedName: string) {
  return normalizeHorizontalPersonName(person.nome_completo).includes(
    normalizeHorizontalPersonName(expectedName)
  );
}

function shouldPlaceSpouseBeforeAnchor(anchor: Pessoa, spouse: Pessoa) {
  // Exce??o visual expl?cita do Mapa Geneal?gico:
  // Suze Souza ? o segundo relacionamento de M?rcio Ailton e deve aparecer acima dele.
  return isNamedPerson(anchor, 'Marcio Ailton') && isNamedPerson(spouse, 'Suze Souza');
}

function shouldPlaceSpouseAfterAnchor(anchor: Pessoa, spouse: Pessoa) {
  // Exce??o visual expl?cita do Mapa Geneal?gico:
  // Layana deve aparecer abaixo de Tassius Marcius.
  return isNamedPerson(anchor, 'Tassius Marcius') && isNamedPerson(spouse, 'Layana');
}

function orderPeopleWithAdjacentSpouses(
  people: Pessoa[],
  maps: RelationshipMaps,
  adjacentPairKeys?: Set<string>,
) {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const originalIndexByPersonId = new Map(people.map((person, index) => [person.id, index]));
  const placedPersonIds = new Set<string>();
  const orderedPeople: Pessoa[] = [];

  const getOriginalIndex = (person: Pessoa) => originalIndexByPersonId.get(person.id) ?? Number.POSITIVE_INFINITY;

  const addPerson = (person: Pessoa) => {
    if (placedPersonIds.has(person.id)) return false;
    orderedPeople.push(person);
    placedPersonIds.add(person.id);
    return true;
  };

  const isActiveAdjacentPair = (firstId: string, secondId: string) => {
    if (!adjacentPairKeys) return true;
    return adjacentPairKeys.has(pairKey(firstId, secondId));
  };

  people.forEach((person) => {
    if (placedPersonIds.has(person.id)) return;

    const spouses = Array.from(maps.spousesByPerson.get(person.id) ?? [])
      .map((spouseId) => peopleById.get(spouseId))
      .filter((candidate): candidate is Pessoa => (
        Boolean(candidate)
        && !placedPersonIds.has(candidate.id)
        && isActiveAdjacentPair(person.id, candidate.id)
      ))
      .sort((a, b) => getOriginalIndex(a) - getOriginalIndex(b));

    const shouldWaitForPreferredAnchor = spouses.some((spouse) => shouldPlaceSpouseAfterAnchor(spouse, person));
    if (shouldWaitForPreferredAnchor) return;

    const spousesBefore = spouses.filter((spouse) => (
      shouldPlaceSpouseBeforeAnchor(person, spouse)
      || (!shouldPlaceSpouseAfterAnchor(person, spouse) && getOriginalIndex(spouse) < getOriginalIndex(person))
    ));

    const spousesBeforeIds = new Set(spousesBefore.map((spouse) => spouse.id));
    const spousesAfter = spouses.filter((spouse) => !spousesBeforeIds.has(spouse.id));

    spousesBefore.forEach(addPerson);
    addPerson(person);
    spousesAfter.forEach(addPerson);
  });

  people.forEach(addPerson);

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


function getHorizontalColorKeyForGeneration(generation: number) {
  if (generation === 1) return 'tataravos' as const;
  if (generation === 2) return 'bisavos' as const;
  if (generation === 3) return 'avos' as const;
  if (generation === 4) return 'pais' as const;
  if (generation === 5) return 'irmaos' as const;
  return 'filhos' as const;
}

function isAlwaysVisibleSpouseGeneration(generation?: number) {
  return generation !== undefined && generation >= 1 && generation <= 3;
}

function isFilterableSpouseGeneration(generation?: number) {
  return generation === undefined || generation >= 4;
}

function getPersonGenerationForVisibility(
  person: Pessoa,
  inferredGenerations: Map<string, number>,
) {
  return getManualGeneration(person) ?? inferredGenerations.get(person.id);
}

function getCardLabel(
  person: Pessoa,
  generation: number,
  centralPersonId: string,
  maps: RelationshipMaps,
  spouseTonePersonIds: Set<string>,
) {
  if (spouseTonePersonIds.has(person.id)) return 'Cônjuge';
  if (person.humano_ou_pet === 'Pet') return 'Pets';
  if (person.id === centralPersonId) return 'Pessoa Central';
  if (maps.spousesByPerson.get(centralPersonId)?.has(person.id)) return 'Cônjuge';

  if (generation === 1) return 'Tataravós';
  if (generation === 2) return 'Bisavós';
  if (generation === 3) return 'Avós';
  if (generation === 4) return 'Pais';
  if (generation === 6) return 'Filhos';
  return 'Irmãos';
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
    .filter((layout): layout is PersonLayout => Boolean(layout) && layout.generation > firstLayout.generation)
    .sort((a, b) => {
      const birthA = getFallbackSortableBirthValue(a.person.data_nascimento);
      const birthB = getFallbackSortableBirthValue(b.person.data_nascimento);
      if (birthA !== birthB) return birthA - birthB;
      return a.top - b.top;
    });
}

function getDistributedTrunkX(candidate: CoupleConnectorCandidate, index: number, total: number) {
  const parentColumnRight = candidate.upperLayout.left + candidate.upperLayout.width;
  const firstChildColumnLeft = Math.min(...candidate.childLayouts.map((layout) => layout.left));
  const minChildGeneration = Math.min(...candidate.childLayouts.map((layout) => layout.generation));
  const generationGap = minChildGeneration - candidate.generation;
  const minGap = 12;

  if (generationGap > 1) {
    const lastIntermediateColumnRight = candidate.upperLayout.left
      + (generationGap - 1) * CANVAS.columnWidth
      + candidate.upperLayout.width;

    const maxX = firstChildColumnLeft - minGap;
    const minX = parentColumnRight + minGap;
    const spreadOffset = total > 1 ? (index - (total - 1) / 2) * 6 : 0;
    const preferredX = lastIntermediateColumnRight + minGap + spreadOffset;

    if (maxX > minX) {
      return Math.min(maxX, Math.max(minX, preferredX));
    }
  }

  const gap = Math.max(minGap, firstChildColumnLeft - parentColumnRight);
  const step = gap / (total + 1);
  return parentColumnRight + step * (index + 1);
}

function buildConnectors(layouts: Map<string, PersonLayout>, maps: RelationshipMaps, allowedPairKeys?: Set<string>) {
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
      if (allowedPairKeys && !allowedPairKeys.has(key)) return;
      if (visiblePairKeys.has(key)) return;
      visiblePairKeys.add(key);

      const upperLayout = personLayout.top <= spouseLayout.top ? personLayout : spouseLayout;
      const lowerLayout = personLayout.top <= spouseLayout.top ? spouseLayout : personLayout;
      const spouseX = upperLayout.left + upperLayout.width / 2;
      const coupleMidY = (upperLayout.top + upperLayout.height + lowerLayout.top) / 2;

      connectors.push({
        id: `spouse-${key}`,
        familyKey: key,
        points: [
          [spouseX, upperLayout.top + upperLayout.height],
          [spouseX, lowerLayout.top],
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
        id: `couple-out-${candidate.key}`,
        familyKey: candidate.key,
        points: [
          [spouseX, candidate.coupleMidY],
          [trunkX, candidate.coupleMidY],
        ],
      });

      connectors.push({
        id: `couple-trunk-${candidate.key}`,
        familyKey: candidate.key,
        points: [
          [trunkX, trunkTop],
          [trunkX, trunkBottom],
        ],
      });

      candidate.childLayouts.forEach((childLayout) => {
        const childY = childLayout.top + childLayout.height / 2;
        connectors.push({
          id: `couple-child-${candidate.key}-${childLayout.person.id}`,
          familyKey: candidate.key,
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
  if (activeGenerations.length === 0) return CANVAS.minWidth;
  const visibleColumnsWidth = CANVAS.cardWidth + Math.max(0, activeGenerations.length - 1) * CANVAS.columnWidth;
  return Math.max(CANVAS.minWidth, CANVAS.left * 2 + visibleColumnsWidth);
}

function DesktopFamilyHorizontalMapViewComponent({
  pessoas,
  relacionamentos,
  centralPersonId,
  visiblePersonIds,
  directRelativeFilters,
  onPersonClick,
  layoutRevision,
  onScrollStateChange,
  onDirectRelationRenderedCounts,
}: DesktopFamilyHorizontalMapViewProps, ref: React.ForwardedRef<FamilyTreeActions>) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const exportRootRef = React.useRef<HTMLDivElement | null>(null);
  const mapSurfaceRef = React.useRef<HTMLDivElement | null>(null);
  const scrollStateRef = React.useRef(false);
  const [responsiveScale, setResponsiveScale] = React.useState(1);
  const [manualZoom, setManualZoom] = React.useState(1);
  const [isAreaSelectionOpen, setIsAreaSelectionOpen] = React.useState(false);
  const exportInProgressRef = React.useRef(false);

  const [highlightedConnectorFamilyKey, setHighlightedConnectorFamilyKey] = React.useState<string | null>(null);
  const hideGenerationHeaders = useTreeHighlightGroupsActive();
  const canvasTop = hideGenerationHeaders ? 40 : CANVAS.top;

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

    const allNonSpouseGroups: DirectRelativeGroup[] = [
      'pais',
      'avos',
      'bisavos',
      'tataravos',
      'filhos',
      'netos',
      'irmaos',
      'sobrinhos',
      'tios',
      'primos',
      'pets',
    ];

    const baseScopeIds = collectDirectFamilyScopePersonIds(graph, {
      centralPersonId,
      filters: createDirectRelativeFiltersForGroups(allNonSpouseGroups),
    });

    const inferredGenerations = inferHorizontalGenerations(statusFilteredPeople, maps, centralPersonId);
    const selectedPersonIds = new Set(baseScopeIds);
    const baseFamilyPersonIds = new Set(baseScopeIds);
    const spouseTonePersonIds = new Set<string>();
    const filterableSpousePersonIds = new Set<string>();
    const connectorPairKeys = new Set<string>();
    const checkedPairKeys = new Set<string>();

    statusFilteredPeople.forEach((person) => {
      const generation = getPersonGenerationForVisibility(person, inferredGenerations);
      if (generation === 6) selectedPersonIds.add(person.id);
    });

    if (selectedPersonIds.size === 0) {
      return {
        people: [] as Pessoa[],
        spouseTonePersonIds: new Set<string>(),
        filterableSpousePersonIds: new Set<string>(),
        connectorPairKeys: new Set<string>(),
      };
    }

    const addCommonChildrenForVisibleCouple = (firstId: string, secondId: string) => {
      const firstChildren = maps.childrenByParent.get(firstId) ?? new Set<string>();
      const secondChildren = maps.childrenByParent.get(secondId) ?? new Set<string>();

      firstChildren.forEach((childId) => {
        if (!secondChildren.has(childId)) return;
        if (!peopleById.has(childId)) return;
        selectedPersonIds.add(childId);
      });
    };

    maps.spousesByPerson.forEach((spouseIds, personId) => {
      const person = peopleById.get(personId);
      if (!person) return;

      spouseIds.forEach((spouseId) => {
        const spouse = peopleById.get(spouseId);
        if (!spouse) return;

        const coupleKey = pairKey(personId, spouseId);
        if (checkedPairKeys.has(coupleKey)) return;
        checkedPairKeys.add(coupleKey);

        const personGeneration = getPersonGenerationForVisibility(person, inferredGenerations);
        const spouseGeneration = getPersonGenerationForVisibility(spouse, inferredGenerations);
        const effectiveGeneration = personGeneration ?? spouseGeneration;

        const personIsBaseFamily = baseFamilyPersonIds.has(personId);
        const spouseIsBaseFamily = baseFamilyPersonIds.has(spouseId);
        const hasBaseFamilyAnchor = personIsBaseFamily || spouseIsBaseFamily;

        if (!hasBaseFamilyAnchor && !isAlwaysVisibleSpouseGeneration(effectiveGeneration)) return;

        if (isFilterableSpouseGeneration(effectiveGeneration)) {
          if (!personIsBaseFamily) filterableSpousePersonIds.add(personId);
          if (!spouseIsBaseFamily) filterableSpousePersonIds.add(spouseId);
        }

        const shouldActivateCouple = isAlwaysVisibleSpouseGeneration(effectiveGeneration)
          || directRelativeFilters.conjuge;

        if (!shouldActivateCouple) return;

        if (!personIsBaseFamily) {
          selectedPersonIds.add(personId);
          spouseTonePersonIds.add(personId);
        }

        if (!spouseIsBaseFamily) {
          selectedPersonIds.add(spouseId);
          spouseTonePersonIds.add(spouseId);
        }

        connectorPairKeys.add(coupleKey);
        addCommonChildrenForVisibleCouple(personId, spouseId);
      });
    });

    return {
      people: statusFilteredPeople.filter((person) => selectedPersonIds.has(person.id)),
      spouseTonePersonIds,
      filterableSpousePersonIds,
      connectorPairKeys,
    };
  }, [centralPersonId, directRelativeFilters.conjuge, maps, onPersonClick, pessoas, relacionamentos, visiblePersonIds]);
  const visibleHorizontalPessoas = horizontalVisibility.people;
  const centralPerson = React.useMemo(
    () => pessoas.find((person) => person.id === centralPersonId),
    [centralPersonId, pessoas],
  );
  const exportTitle = React.useMemo(() => {
    const firstName = getExportFirstName(centralPerson);
    return firstName ? `Mapa Genealógico de ${firstName}` : 'Mapa Genealógico';
  }, [centralPerson]);
  const spouseTonePersonIds = horizontalVisibility.spouseTonePersonIds;
  const filterableSpousePersonIds = horizontalVisibility.filterableSpousePersonIds;
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
      result.set(generation, orderPeopleWithAdjacentSpouses(
        orderedChildren,
        maps,
        horizontalVisibility.connectorPairKeys,
      ));
    });

    return result;
  }, [centralPersonId, generationByPersonId, genealogyReferencePlacements, horizontalVisibility.connectorPairKeys, maps, visibleHorizontalPessoas]);

  const activeGenerations = React.useMemo(
    () => GENERATIONS.filter((generation) => (peopleByGeneration.get(generation)?.length ?? 0) > 0),
    [peopleByGeneration],
  );
  const canvasWidth = React.useMemo(() => getCanvasWidth(activeGenerations), [activeGenerations]);

  const { layouts, canvasHeight } = React.useMemo(() => {
    const nextLayouts = new Map<string, PersonLayout>();
    let maxBottom = canvasTop + CANVAS.cardHeight;

    activeGenerations.forEach((generation, columnIndex) => {
      const people = peopleByGeneration.get(generation) ?? [];
      const left = CANVAS.left + columnIndex * CANVAS.columnWidth;

      people.forEach((person, rowIndex) => {
        const top = canvasTop + rowIndex * (CANVAS.cardHeight + CANVAS.rowGap);
        const layout: PersonLayout = {
          person,
          generation,
          left,
          top,
          width: CANVAS.cardWidth,
          height: CANVAS.cardHeight,
        };
        nextLayouts.set(person.id, layout);
        maxBottom = Math.max(maxBottom, top + CANVAS.cardHeight);
      });
    });

    return {
      layouts: nextLayouts,
      canvasHeight: Math.max(CANVAS.minHeight, maxBottom + canvasTop),
    };
  }, [activeGenerations, canvasTop, peopleByGeneration]);

  const connectors = React.useMemo(
    () => buildConnectors(layouts, maps, horizontalVisibility.connectorPairKeys),
    [horizontalVisibility.connectorPairKeys, layouts, maps],
  );

  React.useEffect(() => {
    setHighlightedConnectorFamilyKey((current) => (
      current && connectors.some((connector) => connector.familyKey === current) ? current : null
    ));
  }, [connectors]);

  const effectiveScale = responsiveScale * manualZoom;

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    let animationFrame = 0;
    const timers: number[] = [];

    const updateScale = () => {
      if (!viewportRef.current) return;

      const widthScale = viewport.clientWidth / canvasWidth;
      const heightScale = viewport.clientHeight / CANVAS.minHeight;
      const nextScale = Math.min(1, Math.max(CANVAS.minScale, Math.min(widthScale, heightScale)));

      setResponsiveScale((currentScale) => (
        Math.abs(currentScale - nextScale) < 0.001 ? currentScale : nextScale
      ));
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateScale);
    };

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(viewport);
    window.addEventListener('resize', scheduleUpdate);
    window.visualViewport?.addEventListener('resize', scheduleUpdate);

    STABLE_SCALE_RECALCULATION_DELAYS.forEach((delay) => {
      timers.push(window.setTimeout(scheduleUpdate, delay));
    });

    scheduleUpdate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
      window.visualViewport?.removeEventListener('resize', scheduleUpdate);
    };
  }, [canvasHeight, canvasWidth, layoutRevision]);

  React.useEffect(() => {
    setManualZoom(1);

    const resetViewportPosition = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
    };

    const timers = STABLE_SCALE_RECALCULATION_DELAYS.map((delay) =>
      window.setTimeout(resetViewportPosition, delay)
    );

    window.requestAnimationFrame(resetViewportPosition);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [centralPersonId, layoutRevision]);

  React.useEffect(() => {
    if (!onDirectRelationRenderedCounts) return;
    const generationCount = (generation: number) => peopleByGeneration.get(generation)?.length ?? 0;
    onDirectRelationRenderedCounts({
      ...EMPTY_COUNTS,
      pais: generationCount(4),
      avos: generationCount(3),
      bisavos: generationCount(2),
      tataravos: generationCount(1),
      conjuge: filterableSpousePersonIds.size,
      filhos: generationCount(6),
      pets: visibleHorizontalPessoas.filter((person) => person.humano_ou_pet === 'Pet').length,
    });
  }, [filterableSpousePersonIds.size, onDirectRelationRenderedCounts, peopleByGeneration, visibleHorizontalPessoas]);

  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const hasScrolled = event.currentTarget.scrollTop > 24;
    if (scrollStateRef.current === hasScrolled) return;
    scrollStateRef.current = hasScrolled;
    onScrollStateChange?.(hasScrolled);
  }, [onScrollStateChange]);

  const handleWheel = React.useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setManualZoom((currentZoom) => {
      const nextZoom = currentZoom + direction * CANVAS.zoomStep;
      return Math.min(CANVAS.maxZoom, Math.max(CANVAS.minZoom, Number(nextZoom.toFixed(2))));
    });
  }, []);

  const captureFamilyMap = React.useCallback(async () => {
    if (!exportRootRef.current) {
      throw new Error('Área do Mapa Genealógico não encontrada para exportação.');
    }

    assertSafeDirectExportSize(exportRootRef.current, 'O Mapa Genealógico');
    return captureElementToCanvas(exportRootRef.current);
  }, []);

  const handleZoomIn = React.useCallback(() => {
    setManualZoom((currentZoom) => Math.min(CANVAS.maxZoom, Number((currentZoom + CANVAS.zoomStep).toFixed(2))));
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setManualZoom((currentZoom) => Math.max(CANVAS.minZoom, Number((currentZoom - CANVAS.zoomStep).toFixed(2))));
  }, []);

  const handleSaveImage = React.useCallback(async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    let previewWindow: Window | null = null;

    try {
      previewWindow = openTreeExportPreviewWindow('Imagem da árvore');
      const canvas = prependTitleToCanvas(await captureFamilyMap(), exportTitle);
      previewCanvasAsPng(canvas, buildTreeExportFilename('mapa-familiar-horizontal', 'png'), 'Imagem da árvore', previewWindow);
    } catch (error) {
      if (previewWindow && !previewWindow.closed) previewWindow.close();
      console.error('Erro ao exportar imagem do Mapa Genealógico:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar a imagem do Mapa Genealógico.');
    } finally {
      exportInProgressRef.current = false;
    }
  }, [captureFamilyMap, exportTitle]);

  const handleSavePdf = React.useCallback(async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    let previewWindow: Window | null = null;

    try {
      previewWindow = openTreeExportPreviewWindow('PDF da árvore');
      const canvas = prependTitleToCanvas(await captureFamilyMap(), exportTitle);
      await previewCanvasAsPdf(
        canvas,
        buildTreeExportFilename('mapa-familiar-horizontal', 'pdf'),
        '',
        previewWindow,
      );
    } catch (error) {
      if (previewWindow && !previewWindow.closed) previewWindow.close();
      console.error('Erro ao exportar PDF do Mapa Genealógico:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar o PDF do Mapa Genealógico.');
    } finally {
      exportInProgressRef.current = false;
    }
  }, [captureFamilyMap, exportTitle]);

  const handlePrint = React.useCallback(async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    let printWindow: Window | null = null;

    try {
      printWindow = openTreeExportPreviewWindow('Imprimir árvore');
      const canvas = prependTitleToCanvas(await captureFamilyMap(), exportTitle);
      await previewCanvasForPrint(canvas, exportTitle, printWindow);
    } catch (error) {
      if (printWindow && !printWindow.closed) printWindow.close();
      console.error('Erro ao imprimir o Mapa Genealógico:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível imprimir o Mapa Genealógico.');
    } finally {
      exportInProgressRef.current = false;
    }
  }, [captureFamilyMap, exportTitle]);

  const handleStartAreaSelection = React.useCallback(() => {
    if (exportInProgressRef.current) return;

    if (!viewportRef.current) {
      toast.error('Área visível do Mapa Genealógico não encontrada para seleção.');
      return;
    }

    setIsAreaSelectionOpen((current) => !current);
  }, []);

  const handleCloseAreaSelection = React.useCallback(() => {
    setIsAreaSelectionOpen(false);
  }, []);

  React.useImperativeHandle(ref, () => ({
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    print: handlePrint,
    savePdf: handleSavePdf,
    saveImage: handleSaveImage,
    startAreaSelection: handleStartAreaSelection,
  }), [
    handlePrint,
    handleSaveImage,
    handleSavePdf,
    handleStartAreaSelection,
    handleZoomIn,
    handleZoomOut,
  ]);

  return (
    <div
      ref={viewportRef}
      onWheel={handleWheel}
      onScroll={handleScroll}
      data-family-map-horizontal-viewport="true"
      className="absolute inset-x-0 bottom-0 top-0 isolate overflow-auto overscroll-contain bg-transparent pt-[76px]"
    >
      <div
        ref={exportRootRef}
        data-family-map-export-root="true"
        data-family-map-horizontal-root="true"
        className="relative z-10 mx-auto"
        style={{
          width: canvasWidth * effectiveScale,
          height: canvasHeight * effectiveScale,
        }}
      >
        <div
          ref={mapSurfaceRef}
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${effectiveScale})`,
          }}
        >
          <svg
            data-family-map-connectors="true"
            data-family-map-has-highlight={highlightedConnectorFamilyKey ? 'true' : undefined}
            className="absolute inset-0 z-0 h-full w-full"
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            aria-hidden="true"
          >
            <g
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {connectors.map((connector) => {
                const connectorFamilyKey = connector.familyKey ?? connector.id;
                const isHighlighted = highlightedConnectorFamilyKey === connectorFamilyKey;

                return (
                  <React.Fragment key={connector.id}>
                    <path
                      data-family-map-connector-line="true"
                      data-family-map-highlighted={isHighlighted ? 'true' : undefined}
                      d={connectorPath(connector.points)}
                    />
                    <path
                      data-family-map-hit-area="true"
                      d={connectorPath(connector.points)}
                      pointerEvents="stroke"
                      className="cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        setHighlightedConnectorFamilyKey((current) => (
                          current === connectorFamilyKey ? null : connectorFamilyKey
                        ));
                      }}
                    />
                  </React.Fragment>
                );
              })}
            </g>
          </svg>

          {!hideGenerationHeaders && activeGenerations.map((generation, index) => (
            <div
              key={generation}
              className="absolute top-12 z-10 -translate-x-1/2 rounded-full bg-slate-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow"
              style={{ left: CANVAS.left + index * CANVAS.columnWidth + CANVAS.cardWidth / 2 }}
            >
              Geração {generation}
            </div>
          ))}

          {Array.from(layouts.values()).map((layout) => (
            <div
              key={layout.person.id}
              className="absolute z-20"
              style={{ left: layout.left, top: layout.top, width: layout.width }}
            >
              <VisualPersonCard
                person={layout.person}
                label={getCardLabel(layout.person, layout.generation, centralPersonId, maps, spouseTonePersonIds)}
                horizontal
                tone={spouseTonePersonIds.has(layout.person.id) ? 'spouse' : 'default'}
                familyMapColorKeyOverride={getHorizontalColorKeyForGeneration(layout.generation)}
                onClick={onPersonClick}
                vitalMode="year"
              />
            </div>
          ))}
        </div>
        {isAreaSelectionOpen && (
          <TreeAreaSelectionOverlay
            getTargetElement={() => viewportRef.current}
            filenameLabel="mapa-familiar-horizontal"
            title={exportTitle}
            onClose={handleCloseAreaSelection}
          />
        )}
      </div>
    </div>
  );
}

export const DesktopFamilyHorizontalMapView = React.forwardRef<
  FamilyTreeActions,
  DesktopFamilyHorizontalMapViewProps
>(DesktopFamilyHorizontalMapViewComponent);
