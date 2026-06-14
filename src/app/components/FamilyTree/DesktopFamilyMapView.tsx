import React from 'react';
import { toast } from 'sonner';

import type { Pessoa, Relacionamento } from '../../types';
import type { FamilyTreeActions } from './FamilyTree';
import {
  VisualEmptyCard,
  VisualGroup,
  VisualPersonCard,
} from './FamilyTreeVisualCards';
import { buildMobileFamilyTreeModel } from './mobileFamilyTreeModel';
import type { DirectRelativeFilters, DirectRelativeGroup } from './types';
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
  TreeAreaSelectionOverlay,
  TreeExportLoadingOverlay,
  waitForTreeExportPaint,
} from './TreeAreaSelectionOverlay';

interface DesktopFamilyMapViewProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  centralPersonId: string;
  visiblePersonIds?: Set<string>;
  directRelativeFilters: DirectRelativeFilters;
  onPersonClick: (pessoa: Pessoa) => void;
  layoutRevision: number;
  sidebarCollapsed?: boolean;
  onScrollStateChange?: (hasScrolled: boolean) => void;
  onDirectRelationRenderedCounts?: (counts: Record<DirectRelativeGroup, number>) => void;
}

type GroupColumns = 'single' | 'double' | 'triple' | 'quad';
type GroupVariant = 'mini' | 'compact' | 'horizontal';
type SpousePolicy = 'never' | 'always' | 'filter';
type AnchorName = 'topCenter' | 'bottomCenter' | 'leftCenter' | 'rightCenter';
type Point = [number, number];

type GroupConfig = {
  id: string;
  title: string;
  x: number;
  width: number;
  singleWidth?: number;
  columns: GroupColumns;
  collapsedLimit: number;
  variant: GroupVariant;
  expandable: boolean;
  allowsSpouses: boolean;
  spousePolicy: SpousePolicy;
  spouseTone?: 'spouse' | 'ancestorSpouse';
  directCard?: boolean;
};

type ComposedGroup = {
  people: Pessoa[];
  spousePersonIds: Set<string>;
  spousePartnerByPersonId: Map<string, string>;
};

type ResolvedGroup = GroupConfig & ComposedGroup & {
  left: number;
  top: number;
  height: number;
};

type PositionedLayout = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

type Connector = {
  id: string;
  points: Point[];
};

type FamilyMapLayout = {
  canvas: {
    width: number;
    minHeight: number;
    background: string;
    minScale: number;
    minZoom: number;
    maxZoom: number;
    zoomStep: number;
  };
  metrics: {
    topStart: number;
    groupGap: number;
    groupVerticalPadding: number;
    gridGap: number;
    horizontalCardHeight: number;
    miniCardHeight: number;
    parentCardHeight: number;
    centralCardHeight: number;
    parentTopGap: number;
    centralTopGap: number;
    descendantsTopGap: number;
    descendantRowGap: number;
  };
  connectors: {
    color: string;
    width: number;
    junctionGap: number;
  };
  areas: Record<string, { x: number; width: number }>;
  groups: Record<string, GroupConfig>;
};

const EXPORT_HORIZONTAL_PADDING = 48;
const MAX_DIRECT_EXPORT_PIXELS = 24_000_000;
const GROUP_HORIZONTAL_PADDING = 24;

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

const STATIC_GROUP_IDS = [
  'paternalGreatGreatGrandparents',
  'paternalGreatGrandparents',
  'paternalGrandparents',
  'maternalGreatGreatGrandparents',
  'maternalGreatGrandparents',
  'maternalGrandparents',
  'paternalUncles',
  'paternalCousins',
  'maternalUncles',
  'maternalCousins',
  'siblings',
  'nephews',
  'children',
  'pets',
  'grandchildren',
] as const;

const PATERNAL_ANCESTOR_IDS = [
  'paternalGreatGreatGrandparents',
  'paternalGreatGrandparents',
  'paternalGrandparents',
] as const;

const MATERNAL_ANCESTOR_IDS = [
  'maternalGreatGreatGrandparents',
  'maternalGreatGrandparents',
  'maternalGrandparents',
] as const;

const ADAPTIVE_UNCLES_GROUP_IDS = new Set<string>([
  'paternalUncles',
  'maternalUncles',
]);

const FAMILY_MAP_LAYOUT_BASE: FamilyMapLayout = {
  canvas: {
    width: 1440,
    minHeight: 1020,
    background: '#ecfeff',
    minScale: 0.62,
    minZoom: 0.7,
    maxZoom: 2.2,
    zoomStep: 0.08,
  },
  metrics: {
    topStart: 18,
    groupGap: 46,
    groupVerticalPadding: 44,
    gridGap: 8,
    horizontalCardHeight: 74,
    miniCardHeight: 112,
    parentCardHeight: 164,
    centralCardHeight: 194,
    parentTopGap: 50,
    centralTopGap: 54,
    descendantsTopGap: 52,
    descendantRowGap: 46,
  },
  connectors: {
    color: '#a5eef6',
    width: 2,
    junctionGap: 18,
  },
  areas: {
    left: { x: -160, width: 480 },
    paternalAncestors: { x: 265, width: 430 },
    center: { x: 615, width: 210 },
    maternalAncestors: { x: 745, width: 430 },
    right: { x: 1120, width: 480 },
    lowerLeft: { x: 340, width: 360 },
    lowerMiddle: { x: 665, width: 180 },
    lowerRight: { x: 940, width: 300 },
  },
  groups: {
    paternalGreatGreatGrandparents: group('paternalGreatGreatGrandparents', 'Tataravós Paternos', 265, 430, 'double', 4, 'horizontal', true, 'always', 'ancestorSpouse'),
    paternalGreatGrandparents: group('paternalGreatGrandparents', 'Bisavós Paternos', 265, 430, 'double', 4, 'horizontal', true, 'always', 'ancestorSpouse'),
    paternalGrandparents: group('paternalGrandparents', 'Avós Paternos', 265, 430, 'double', 4, 'horizontal', true, 'always', 'ancestorSpouse'),
    paternalUncles: group('paternalUncles', 'Tios Paternos', -160, 480, 'quad', 8, 'mini', true, 'filter', undefined, 300),
    paternalCousins: group('paternalCousins', 'Primos Paternos', -160, 480, 'quad', 8, 'mini', true, 'filter', undefined, 250),
    father: group('father', 'Pai', 375, 210, 'single', 1, 'compact', false, 'never', undefined, undefined, true),
    central: group('central', 'Pessoa Central', 615, 210, 'single', 1, 'compact', false, 'never', undefined, undefined, true),
    mother: group('mother', 'Mãe', 855, 210, 'single', 1, 'compact', false, 'never', undefined, undefined, true),
    maternalGreatGreatGrandparents: group('maternalGreatGreatGrandparents', 'Tataravós Maternos', 745, 430, 'double', 4, 'horizontal', true, 'always', 'ancestorSpouse'),
    maternalGreatGrandparents: group('maternalGreatGrandparents', 'Bisavós Maternos', 745, 430, 'double', 4, 'horizontal', true, 'always', 'ancestorSpouse'),
    maternalGrandparents: group('maternalGrandparents', 'Avós Maternos', 745, 430, 'double', 4, 'horizontal', true, 'always', 'ancestorSpouse'),
    maternalUncles: group('maternalUncles', 'Tios Maternos', 1120, 480, 'quad', 8, 'mini', true, 'filter', undefined, 300),
    maternalCousins: group('maternalCousins', 'Primos Maternos', 1120, 480, 'quad', 8, 'mini', true, 'filter', undefined, 250),
    siblings: group('siblings', 'Irmãos', 340, 360, 'double', 2, 'horizontal', true, 'never', undefined, 260),
    nephews: group('nephews', 'Sobrinhos', 340, 300, 'double', 2, 'mini', true, 'filter', undefined, 220),
    spouse: group('spouse', 'Cônjuge', 720, 210, 'single', 1, 'compact', false, 'always', 'spouse', undefined, true),
    children: group('children', 'Filhos', 940, 300, 'double', 2, 'horizontal', true, 'filter', undefined, 260),
    pets: group('pets', 'Pets', 665, 180, 'single', 2, 'mini', true, 'never', undefined, 180),
    grandchildren: group('grandchildren', 'Netos', 940, 300, 'double', 2, 'mini', true, 'filter', undefined, 220),
  },
};

function group(
  id: string,
  title: string,
  x: number,
  width: number,
  columns: GroupColumns,
  collapsedLimit: number,
  variant: GroupVariant,
  expandable: boolean,
  spousePolicy: SpousePolicy,
  spouseTone?: 'spouse' | 'ancestorSpouse',
  singleWidth?: number,
  directCard = false,
): GroupConfig {
  return {
    id,
    title,
    x,
    width,
    singleWidth,
    columns,
    collapsedLimit,
    variant,
    expandable,
    allowsSpouses: spousePolicy !== 'never',
    spousePolicy,
    spouseTone,
    directCard,
  };
}

function getWideLayout(): FamilyMapLayout {
  const base = FAMILY_MAP_LAYOUT_BASE;
  const groups: Record<string, GroupConfig> = {
    ...base.groups,
    paternalGreatGreatGrandparents: { ...base.groups.paternalGreatGreatGrandparents, x: 500 },
    paternalGreatGrandparents: { ...base.groups.paternalGreatGrandparents, x: 500 },
    paternalGrandparents: { ...base.groups.paternalGrandparents, x: 500 },
    paternalUncles: { ...base.groups.paternalUncles, x: 20, width: 560, singleWidth: 340 },
    paternalCousins: { ...base.groups.paternalCousins, x: 20, width: 560, singleWidth: 250 },
    father: { ...base.groups.father, x: 595 },
    central: { ...base.groups.central, x: 835 },
    mother: { ...base.groups.mother, x: 1075 },
    maternalGreatGreatGrandparents: { ...base.groups.maternalGreatGreatGrandparents, x: 950 },
    maternalGreatGrandparents: { ...base.groups.maternalGreatGrandparents, x: 950 },
    maternalGrandparents: { ...base.groups.maternalGrandparents, x: 950 },
    maternalUncles: { ...base.groups.maternalUncles, x: 1300, width: 560, singleWidth: 340 },
    maternalCousins: { ...base.groups.maternalCousins, x: 1300, width: 560, singleWidth: 250 },
    siblings: { ...base.groups.siblings, x: 520, width: 360, singleWidth: 300 },
    nephews: { ...base.groups.nephews, x: 520, width: 360, singleWidth: 280 },
    spouse: { ...base.groups.spouse, x: 950 },
    children: { ...base.groups.children, x: 1190, width: 420, singleWidth: 300 },
    pets: { ...base.groups.pets, x: 950, width: 210, singleWidth: 210 },
    grandchildren: { ...base.groups.grandchildren, x: 1190, width: 420, singleWidth: 280 },
  };

  return {
    ...base,
    canvas: { ...base.canvas, width: 1880, minScale: 0.68 },
    metrics: { ...base.metrics, horizontalCardHeight: 82, miniCardHeight: 124 },
    areas: {
      left: { x: 20, width: 560 },
      paternalAncestors: { x: 500, width: 430 },
      center: { x: 835, width: 210 },
      maternalAncestors: { x: 950, width: 430 },
      right: { x: 1300, width: 560 },
      lowerLeft: { x: 520, width: 360 },
      lowerMiddle: { x: 950, width: 210 },
      lowerRight: { x: 1190, width: 420 },
    },
    groups,
  };
}

function getFamilyMapLayout(isWideLayout: boolean) {
  return isWideLayout ? getWideLayout() : FAMILY_MAP_LAYOUT_BASE;
}

function estimateElementExportPixels(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const scale = typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  return rect.width * scale * rect.height * scale;
}

function assertSafeDirectExportSize(element: HTMLElement, label: string) {
  if (estimateElementExportPixels(element) <= MAX_DIRECT_EXPORT_PIXELS) return;
  throw new Error(`${label} está muito grande para exportar com segurança neste zoom. Reduza o zoom ou use a exportação por área.`);
}

function getOffsetLayout<T extends PositionedLayout>(layout: T, offsetX: number): T {
  return { ...layout, left: layout.left + offsetX };
}

function getOffsetConnectorPoints(points: Point[], offsetX: number): Point[] {
  return points.map(([x, y]) => [x + offsetX, y]);
}

function getExportLoadingMessage(action: 'image' | 'pdf' | 'print') {
  if (action === 'image') return 'Preparando imagem...';
  if (action === 'pdf') return 'Gerando PDF...';
  return 'Preparando impressão...';
}

function getExportFirstName(person?: Pessoa) {
  return person?.nome_completo?.trim().split(/\s+/).filter(Boolean)[0];
}

function getFirstName(person?: Pessoa) {
  return getExportFirstName(person) ?? 'relacionamento';
}

function getColumnCount(columns: GroupColumns) {
  if (columns === 'quad') return 4;
  if (columns === 'triple') return 3;
  if (columns === 'double') return 2;
  return 1;
}

function getVisiblePeople(group: ComposedGroup, config: GroupConfig, expanded: boolean) {
  if (expanded || group.people.length <= config.collapsedLimit) return group.people;
  const visible = group.people.slice(0, config.collapsedLimit);
  const lastPerson = visible[visible.length - 1];
  const nextPerson = group.people[visible.length];
  const nextPartnerId = nextPerson ? group.spousePartnerByPersonId.get(nextPerson.id) : undefined;
  return lastPerson && nextPerson && nextPartnerId === lastPerson.id ? [...visible, nextPerson] : visible;
}

function getAdaptiveGroupColumns(config: GroupConfig, visiblePeople: Pessoa[]): GroupColumns {
  return ADAPTIVE_UNCLES_GROUP_IDS.has(config.id) && (visiblePeople.length === 3 || visiblePeople.length === 6)
    ? 'triple'
    : config.columns;
}

function getAdaptiveGroupWidth(config: GroupConfig, peopleCount: number, columns: GroupColumns, layout: FamilyMapLayout) {
  if (peopleCount === 1 && config.singleWidth) return Math.min(config.width, config.singleWidth);
  if (!ADAPTIVE_UNCLES_GROUP_IDS.has(config.id) || columns !== 'triple') return config.width;

  const originalColumnCount = getColumnCount(config.columns);
  const adaptiveColumnCount = getColumnCount(columns);
  const originalGridWidth = config.width
    - GROUP_HORIZONTAL_PADDING
    - Math.max(0, originalColumnCount - 1) * layout.metrics.gridGap;
  const cardWidth = originalGridWidth / originalColumnCount;

  return GROUP_HORIZONTAL_PADDING
    + adaptiveColumnCount * cardWidth
    + Math.max(0, adaptiveColumnCount - 1) * layout.metrics.gridGap;
}

function getGridCellCount(people: Pessoa[], columns: GroupColumns, spousePartnerByPersonId: Map<string, string>) {
  const columnCount = getColumnCount(columns);
  let cells = 0;
  people.forEach((person, index) => {
    const partnerId = spousePartnerByPersonId.get(person.id);
    const previousPerson = people[index - 1];
    if (partnerId && previousPerson?.id === partnerId && cells % columnCount === 0) cells += 1;
    cells += 1;
  });
  return cells;
}

function getGroupHeight(
  groupData: ComposedGroup,
  config: GroupConfig,
  visiblePeople: Pessoa[],
  columns: GroupColumns,
  layout: FamilyMapLayout,
  hideGroupChrome = false,
) {
  const cardHeight = config.variant === 'horizontal'
    ? layout.metrics.horizontalCardHeight
    : layout.metrics.miniCardHeight;
  const cells = getGridCellCount(visiblePeople, columns, groupData.spousePartnerByPersonId);
  const rows = Math.max(1, Math.ceil(cells / getColumnCount(columns)));
  const verticalPadding = hideGroupChrome ? 0 : layout.metrics.groupVerticalPadding;
  return verticalPadding + rows * cardHeight + Math.max(0, rows - 1) * layout.metrics.gridGap;
}

function centerWithin(baseX: number, baseWidth: number, width: number) {
  return baseX + (baseWidth - width) / 2;
}

function buildSpousesByPerson(pessoas: Pessoa[], relacionamentos: Relacionamento[]) {
  const peopleById = new Map(pessoas.map((person) => [person.id, person]));
  const spousesByPerson = new Map<string, Pessoa[]>();
  const addSpouse = (personId: string, spouseId: string) => {
    const spouse = peopleById.get(spouseId);
    if (!spouse) return;
    const spouses = spousesByPerson.get(personId) ?? [];
    if (!spouses.some((person) => person.id === spouse.id)) {
      spouses.push(spouse);
      spousesByPerson.set(personId, spouses);
    }
  };

  relacionamentos.forEach((relationship) => {
    if (relationship.tipo_relacionamento !== 'conjuge') return;
    addSpouse(relationship.pessoa_origem_id, relationship.pessoa_destino_id);
    addSpouse(relationship.pessoa_destino_id, relationship.pessoa_origem_id);
  });

  return spousesByPerson;
}

function buildParentsByChild(relacionamentos: Relacionamento[]) {
  const parentsByChild = new Map<string, Set<string>>();
  const add = (childId: string, parentId: string) => {
    const parents = parentsByChild.get(childId) ?? new Set<string>();
    parents.add(parentId);
    parentsByChild.set(childId, parents);
  };

  relacionamentos.forEach((relationship) => {
    if (relationship.tipo_relacionamento === 'filho') {
      add(relationship.pessoa_destino_id, relationship.pessoa_origem_id);
      return;
    }
    if (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae') {
      add(relationship.pessoa_origem_id, relationship.pessoa_destino_id);
    }
  });

  return parentsByChild;
}

function getOtherParentId(childId: string, centralPersonId: string, parentsByChild: Map<string, Set<string>>) {
  return Array.from(parentsByChild.get(childId) ?? []).find((parentId) => parentId !== centralPersonId);
}

function composeGroup({
  people,
  config,
  spousesByPerson,
  isVisible,
  spouseFilterActive,
  excludedIds,
}: {
  people: Pessoa[];
  config: GroupConfig;
  spousesByPerson: Map<string, Pessoa[]>;
  isVisible: (person: Pessoa | undefined) => person is Pessoa;
  spouseFilterActive: boolean;
  excludedIds: Set<string>;
}): ComposedGroup {
  const result: Pessoa[] = [];
  const seen = new Set<string>();
  const spousePersonIds = new Set<string>();
  const spousePartnerByPersonId = new Map<string, string>();
  const includeSpouses = config.allowsSpouses && (
    config.spousePolicy === 'always' || (config.spousePolicy === 'filter' && spouseFilterActive)
  );
  const canRenderPerson = (person: Pessoa | undefined): person is Pessoa => Boolean(
    person && !excludedIds.has(person.id) && isVisible(person),
  );
  const addPerson = (person: Pessoa) => {
    if (seen.has(person.id) || !canRenderPerson(person)) return false;
    seen.add(person.id);
    result.push(person);
    return true;
  };
  const getVisibleSpouse = (person: Pessoa) => (spousesByPerson.get(person.id) ?? [])
    .find((spouse) => canRenderPerson(spouse) && !seen.has(spouse.id));

  if (includeSpouses) {
    people.forEach((person) => {
      if (seen.has(person.id) || !canRenderPerson(person)) return;
      const spouse = getVisibleSpouse(person);
      if (!spouse) return;
      addPerson(person);
      if (addPerson(spouse)) {
        spousePersonIds.add(spouse.id);
        spousePartnerByPersonId.set(spouse.id, person.id);
      }
    });
  }

  people.forEach((person) => addPerson(person));
  return { people: result, spousePersonIds, spousePartnerByPersonId };
}

function collectCollateralSpouses(
  groups: Pessoa[][],
  spousesByPerson: Map<string, Pessoa[]>,
  isVisible: (person: Pessoa | undefined) => person is Pessoa,
  excludedIds: Set<string>,
) {
  const spouseIds = new Set<string>();
  groups.flat().forEach((person) => {
    (spousesByPerson.get(person.id) ?? []).forEach((spouse) => {
      if (!excludedIds.has(spouse.id) && isVisible(spouse)) spouseIds.add(spouse.id);
    });
  });
  return spouseIds.size;
}

function resolveGroup(
  config: GroupConfig,
  groupData: ComposedGroup,
  expandedGroups: Set<string>,
  top: number,
  layout: FamilyMapLayout,
  baseArea?: { x: number; width: number },
  hideGroupChrome = false,
) {
  if (!groupData.people.length) return undefined;
  const visiblePeople = getVisiblePeople(groupData, config, expandedGroups.has(config.id));
  const columns = getAdaptiveGroupColumns(config, visiblePeople);
  const width = getAdaptiveGroupWidth(config, visiblePeople.length, columns, layout);
  return {
    ...config,
    ...groupData,
    left: baseArea ? centerWithin(baseArea.x, baseArea.width, width) : config.x,
    top,
    width,
    columns,
    height: getGroupHeight(groupData, config, visiblePeople, columns, layout, hideGroupChrome),
  } satisfies ResolvedGroup;
}

function stackGroups(
  ids: readonly string[],
  groups: Map<string, ComposedGroup>,
  expandedGroups: Set<string>,
  layout: FamilyMapLayout,
  hideGroupChrome = false,
) {
  let top = layout.metrics.topStart;
  const layouts: ResolvedGroup[] = [];
  ids.forEach((id) => {
    const config = layout.groups[id];
    const groupData = groups.get(id);
    if (!config || !groupData?.people.length) return;
    const resolved = resolveGroup(config, groupData, expandedGroups, top, layout, undefined, hideGroupChrome);
    if (!resolved) return;
    layouts.push(resolved);
    top += resolved.height + layout.metrics.groupGap;
  });
  return layouts;
}

function getGroupAnchor(layouts: Map<string, PositionedLayout>, groupId: string, anchorName: AnchorName) {
  const layout = layouts.get(groupId);
  if (!layout) return undefined;
  if (anchorName === 'topCenter') return [layout.left + layout.width / 2, layout.top] as Point;
  if (anchorName === 'bottomCenter') return [layout.left + layout.width / 2, layout.top + layout.height] as Point;
  if (anchorName === 'leftCenter') return [layout.left, layout.top + layout.height / 2] as Point;
  return [layout.left + layout.width, layout.top + layout.height / 2] as Point;
}

function makeConnector(
  layouts: Map<string, PositionedLayout>,
  id: string,
  fromGroupId: string,
  fromAnchor: AnchorName,
  toGroupId: string,
  toAnchor: AnchorName,
  via?: (from: Point, to: Point) => Point[],
) {
  const from = getGroupAnchor(layouts, fromGroupId, fromAnchor);
  const to = getGroupAnchor(layouts, toGroupId, toAnchor);
  if (!from || !to) return undefined;
  return { id, points: via ? via(from, to) : [from, to] } satisfies Connector;
}

function verticalConnector(layouts: Map<string, PositionedLayout>, id: string, fromId: string, toId: string) {
  return makeConnector(layouts, id, fromId, 'bottomCenter', toId, 'topCenter', (from, to) => {
    if (from[0] === to[0]) return [from, to];
    const middleY = from[1] + (to[1] - from[1]) / 2;
    return [from, [from[0], middleY], [to[0], middleY], to];
  });
}

function branchConnector(
  layouts: Map<string, PositionedLayout>,
  id: string,
  fromId: string,
  toId: string,
  junctionY: number,
) {
  return makeConnector(
    layouts,
    id,
    fromId,
    'bottomCenter',
    toId,
    'topCenter',
    (from, to) => [from, [from[0], junctionY], [to[0], junctionY], to],
  );
}

function connectorPath(points: Point[]) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

function useExpandedGroups() {
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(() => new Set());
  const handleExpandedChange = React.useCallback((id: string, expanded: boolean) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (expanded) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  return [expandedGroups, handleExpandedChange] as const;
}

function useTreeHighlightGroupsActive() {
  const [active, setActive] = React.useState(false);
  React.useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const root = document.documentElement;
    const update = () => setActive(root.dataset.treeHighlightGroups === 'true');
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['data-tree-highlight-groups'] });
    return () => observer.disconnect();
  }, []);
  return active;
}

function PositionedGroup({
  layout,
  vitalMode,
  expanded,
  hideChrome = false,
  onExpandedChange,
  onPersonClick,
}: {
  layout: ResolvedGroup;
  vitalMode: 'year' | 'full';
  expanded: boolean;
  hideChrome?: boolean;
  onExpandedChange: (id: string, expanded: boolean) => void;
  onPersonClick: (pessoa: Pessoa) => void;
}) {
  return (
    <div className="absolute z-10 min-h-0" style={{ left: layout.left, top: layout.top, width: layout.width }}>
      <VisualGroup
        title={layout.title}
        people={layout.people}
        columns={layout.columns}
        variant={layout.variant}
        titleVariant="pill"
        hideChrome={hideChrome}
        expandable={layout.expandable}
        collapsedLimit={layout.collapsedLimit}
        expanded={expanded}
        onExpandedChange={(nextExpanded) => onExpandedChange(layout.id, nextExpanded)}
        disableInternalScroll
        spousePersonIds={layout.spousePersonIds}
        spousePartnerByPersonId={layout.spousePartnerByPersonId}
        spouseTone={layout.spouseTone}
        vitalMode={vitalMode}
        roomy={vitalMode === 'full'}
        onPersonClick={onPersonClick}
      />
    </div>
  );
}

function DirectPersonCard({
  layout,
  person,
  emptyLabel,
  central,
  showLabel = true,
  tone,
  onPersonClick,
}: {
  layout: PositionedLayout & { title: string };
  person?: Pessoa;
  emptyLabel?: string;
  central?: boolean;
  showLabel?: boolean;
  tone?: 'spouse';
  onPersonClick: (pessoa: Pessoa) => void;
}) {
  return (
    <div className="absolute z-20" style={{ left: layout.left, top: layout.top, width: layout.width }}>
      {person ? (
        <VisualPersonCard
          person={person}
          label={showLabel ? layout.title : undefined}
          central={central}
          tone={tone}
          vitalMode="full"
          onClick={onPersonClick}
        />
      ) : emptyLabel ? (
        <VisualEmptyCard label={emptyLabel} />
      ) : null}
    </div>
  );
}

function makeDirectLayout(config: GroupConfig, top: number, height: number, people: Pessoa[] = []) {
  return {
    ...config,
    people,
    spousePersonIds: new Set<string>(),
    spousePartnerByPersonId: new Map<string, string>(),
    left: config.x,
    top,
    height,
  } satisfies ResolvedGroup;
}

function DesktopFamilyMapViewComponent({
  pessoas,
  relacionamentos,
  centralPersonId,
  visiblePersonIds,
  directRelativeFilters,
  onPersonClick,
  layoutRevision,
  sidebarCollapsed = false,
  onScrollStateChange,
  onDirectRelationRenderedCounts,
}: DesktopFamilyMapViewProps, ref: React.ForwardedRef<FamilyTreeActions>) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const exportRootRef = React.useRef<HTMLDivElement | null>(null);
  const scrollStateRef = React.useRef(false);
  const [responsiveScale, setResponsiveScale] = React.useState(1);
  const [manualZoom, setManualZoom] = React.useState(1);
  const [isAreaSelectionOpen, setIsAreaSelectionOpen] = React.useState(false);
  const [exportLoadingMessage, setExportLoadingMessage] = React.useState<string | null>(null);
  const [expandedGroups, handleExpandedChange] = useExpandedGroups();
  const hideGroupChrome = useTreeHighlightGroupsActive();
  const isWideLayout = Boolean(sidebarCollapsed);
  const familyMapLayout = React.useMemo(() => getFamilyMapLayout(isWideLayout), [isWideLayout]);
  const model = React.useMemo(
    () => buildMobileFamilyTreeModel(pessoas, relacionamentos, centralPersonId),
    [centralPersonId, pessoas, relacionamentos],
  );
  const parentsByChild = React.useMemo(() => buildParentsByChild(relacionamentos), [relacionamentos]);
  const isVisible = React.useCallback(
    (person: Pessoa | undefined, preserveCentral = false): person is Pessoa => Boolean(
      person && (preserveCentral || !visiblePersonIds || visiblePersonIds.has(person.id)),
    ),
    [visiblePersonIds],
  );
  const filterVisible = React.useCallback((people: Pessoa[]) => people.filter((person) => isVisible(person)), [isVisible]);
  const filterGroup = React.useCallback(
    (people: Pessoa[], groupName: DirectRelativeGroup) => (directRelativeFilters[groupName] ? filterVisible(people) : []),
    [directRelativeFilters, filterVisible],
  );
  const spousesByPerson = React.useMemo(() => buildSpousesByPerson(pessoas, relacionamentos), [pessoas, relacionamentos]);

  const father = directRelativeFilters.pais && isVisible(model.father) ? model.father : undefined;
  const mother = directRelativeFilters.pais && isVisible(model.mother) ? model.mother : undefined;
  const central = isVisible(model.central, true) ? model.central : undefined;
  const exportTitle = React.useMemo(() => {
    const firstName = getExportFirstName(central);
    return firstName ? `Árvore Familiar de ${firstName}` : 'Árvore Familiar';
  }, [central]);

  const mainSpouses = filterVisible(model.spouses);
  const mainSpouse = mainSpouses[0];
  const spouseIds = React.useMemo(() => new Set(mainSpouses.map((person) => person.id)), [mainSpouses]);
  const additionalSpouses = mainSpouses.slice(1);
  const siblings = filterGroup(model.siblings, 'irmaos');
  const nephews = filterGroup(model.nephews, 'sobrinhos');
  const allChildren = filterGroup(model.children, 'filhos');
  const pets = filterGroup(model.pets, 'pets');
  const grandchildren = filterGroup(model.grandchildren, 'netos');

  const groupedChildren = React.useMemo(() => {
    const childrenBySpouseId = new Map<string, Pessoa[]>();
    const primaryChildren: Pessoa[] = [];
    allChildren.forEach((child) => {
      const otherParentId = getOtherParentId(child.id, centralPersonId, parentsByChild);
      if (otherParentId && spouseIds.has(otherParentId) && otherParentId !== mainSpouse?.id) {
        const childrenForSpouse = childrenBySpouseId.get(otherParentId) ?? [];
        childrenForSpouse.push(child);
        childrenBySpouseId.set(otherParentId, childrenForSpouse);
        return;
      }
      primaryChildren.push(child);
    });
    return { primaryChildren, childrenBySpouseId };
  }, [allChildren, centralPersonId, mainSpouse?.id, parentsByChild, spouseIds]);

  const excludedSpouseIds = React.useMemo(
    () => new Set([centralPersonId, ...mainSpouses.map((person) => person.id)]),
    [centralPersonId, mainSpouses],
  );

  const sourcePeople = React.useMemo<Record<string, Pessoa[]>>(() => ({
    paternalGreatGreatGrandparents: filterGroup(model.paternal.greatGreatGrandparents, 'tataravos'),
    paternalGreatGrandparents: filterGroup(model.paternal.greatGrandparents, 'bisavos'),
    paternalGrandparents: filterGroup(model.paternal.grandparents, 'avos'),
    paternalUncles: filterGroup(model.paternal.uncles, 'tios'),
    paternalCousins: filterGroup(model.paternal.cousins, 'primos'),
    father: father ? [father] : [],
    central: central ? [central] : [],
    mother: mother ? [mother] : [],
    maternalGreatGreatGrandparents: filterGroup(model.maternal.greatGreatGrandparents, 'tataravos'),
    maternalGreatGrandparents: filterGroup(model.maternal.greatGrandparents, 'bisavos'),
    maternalGrandparents: filterGroup(model.maternal.grandparents, 'avos'),
    maternalUncles: filterGroup(model.maternal.uncles, 'tios'),
    maternalCousins: filterGroup(model.maternal.cousins, 'primos'),
    siblings,
    nephews,
    spouse: mainSpouse ? [mainSpouse] : [],
    children: groupedChildren.primaryChildren,
    pets,
    grandchildren,
  }), [
    central,
    father,
    filterGroup,
    grandchildren,
    groupedChildren.primaryChildren,
    mainSpouse,
    model,
    mother,
    nephews,
    pets,
    siblings,
  ]);

  const composedGroups = React.useMemo(() => {
    const groups = new Map<string, ComposedGroup>();
    Object.keys(familyMapLayout.groups).forEach((id) => {
      groups.set(id, composeGroup({
        people: sourcePeople[id] ?? [],
        config: familyMapLayout.groups[id],
        spousesByPerson,
        isVisible,
        spouseFilterActive: directRelativeFilters.conjuge,
        excludedIds: excludedSpouseIds,
      }));
    });
    return groups;
  }, [directRelativeFilters.conjuge, excludedSpouseIds, familyMapLayout.groups, isVisible, sourcePeople, spousesByPerson]);

  const paternalAncestorLayouts = stackGroups(PATERNAL_ANCESTOR_IDS, composedGroups, expandedGroups, familyMapLayout, hideGroupChrome);
  const maternalAncestorLayouts = stackGroups(MATERNAL_ANCESTOR_IDS, composedGroups, expandedGroups, familyMapLayout, hideGroupChrome);
  const ancestorBottom = Math.max(
    familyMapLayout.metrics.topStart + familyMapLayout.metrics.horizontalCardHeight,
    ...paternalAncestorLayouts.map((layout) => layout.top + layout.height),
    ...maternalAncestorLayouts.map((layout) => layout.top + layout.height),
  );
  const parentTop = ancestorBottom + familyMapLayout.metrics.parentTopGap;
  const centralTop = parentTop + familyMapLayout.metrics.parentCardHeight + familyMapLayout.metrics.centralTopGap;
  const descendantsTop = centralTop + familyMapLayout.metrics.centralCardHeight + familyMapLayout.metrics.descendantsTopGap;

  const fatherLayout = makeDirectLayout(familyMapLayout.groups.father, parentTop, familyMapLayout.metrics.parentCardHeight, father ? [father] : []);
  const motherLayout = makeDirectLayout(familyMapLayout.groups.mother, parentTop, familyMapLayout.metrics.parentCardHeight, mother ? [mother] : []);
  const centralLayout = makeDirectLayout(familyMapLayout.groups.central, centralTop, familyMapLayout.metrics.centralCardHeight, central ? [central] : []);
  const spouseLayout = mainSpouse
    ? makeDirectLayout(familyMapLayout.groups.spouse, descendantsTop, familyMapLayout.metrics.parentCardHeight, [mainSpouse])
    : undefined;

  const paternalUnclesLayout = resolveGroup(
    familyMapLayout.groups.paternalUncles,
    composedGroups.get('paternalUncles') as ComposedGroup,
    expandedGroups,
    parentTop,
    familyMapLayout,
    familyMapLayout.areas.left,
    hideGroupChrome,
  );
  const maternalUnclesLayout = resolveGroup(
    familyMapLayout.groups.maternalUncles,
    composedGroups.get('maternalUncles') as ComposedGroup,
    expandedGroups,
    parentTop,
    familyMapLayout,
    familyMapLayout.areas.right,
    hideGroupChrome,
  );
  const paternalCousinsLayout = resolveGroup(
    familyMapLayout.groups.paternalCousins,
    composedGroups.get('paternalCousins') as ComposedGroup,
    expandedGroups,
    parentTop + (paternalUnclesLayout?.height ?? 0) + familyMapLayout.metrics.groupGap,
    familyMapLayout,
    familyMapLayout.areas.left,
    hideGroupChrome,
  );
  const maternalCousinsLayout = resolveGroup(
    familyMapLayout.groups.maternalCousins,
    composedGroups.get('maternalCousins') as ComposedGroup,
    expandedGroups,
    parentTop + (maternalUnclesLayout?.height ?? 0) + familyMapLayout.metrics.groupGap,
    familyMapLayout,
    familyMapLayout.areas.right,
    hideGroupChrome,
  );
  const siblingsLayout = resolveGroup(
    familyMapLayout.groups.siblings,
    composedGroups.get('siblings') as ComposedGroup,
    expandedGroups,
    descendantsTop,
    familyMapLayout,
    familyMapLayout.areas.lowerLeft,
    hideGroupChrome,
  );
  const nephewsLayout = resolveGroup(
    familyMapLayout.groups.nephews,
    composedGroups.get('nephews') as ComposedGroup,
    expandedGroups,
    descendantsTop + (siblingsLayout?.height ?? familyMapLayout.metrics.horizontalCardHeight) + familyMapLayout.metrics.descendantRowGap,
    familyMapLayout,
    familyMapLayout.areas.lowerLeft,
    hideGroupChrome,
  );

  const rightLowerTop = spouseLayout
    ? spouseLayout.top + spouseLayout.height + familyMapLayout.metrics.groupGap
    : descendantsTop;
  const childrenLayout = resolveGroup(
    familyMapLayout.groups.children,
    composedGroups.get('children') as ComposedGroup,
    expandedGroups,
    rightLowerTop,
    familyMapLayout,
    familyMapLayout.areas.lowerRight,
    hideGroupChrome,
  );
  const petsLayout = resolveGroup(
    familyMapLayout.groups.pets,
    composedGroups.get('pets') as ComposedGroup,
    expandedGroups,
    rightLowerTop,
    familyMapLayout,
    familyMapLayout.areas.lowerMiddle,
    hideGroupChrome,
  );
  const grandchildrenLayout = resolveGroup(
    familyMapLayout.groups.grandchildren,
    composedGroups.get('grandchildren') as ComposedGroup,
    expandedGroups,
    childrenLayout ? childrenLayout.top + childrenLayout.height + familyMapLayout.metrics.groupGap : rightLowerTop,
    familyMapLayout,
    familyMapLayout.areas.lowerRight,
    hideGroupChrome,
  );

  const primaryLowerBottom = Math.max(
    descendantsTop,
    siblingsLayout ? siblingsLayout.top + siblingsLayout.height : 0,
    nephewsLayout ? nephewsLayout.top + nephewsLayout.height : 0,
    spouseLayout ? spouseLayout.top + spouseLayout.height : 0,
    childrenLayout ? childrenLayout.top + childrenLayout.height : 0,
    petsLayout ? petsLayout.top + petsLayout.height : 0,
    grandchildrenLayout ? grandchildrenLayout.top + grandchildrenLayout.height : 0,
  );

  const additionalBranches = React.useMemo(() => {
    const branches: Array<{ spouse: Pessoa; spouseLayout: ResolvedGroup; childrenLayout?: ResolvedGroup }> = [];
    let nextTop = primaryLowerBottom + (additionalSpouses.length ? familyMapLayout.metrics.descendantRowGap : 0);
    additionalSpouses.forEach((spouse, index) => {
      const spouseConfig = {
        ...familyMapLayout.groups.spouse,
        id: `additionalSpouse-${spouse.id}`,
        title: 'Outro relacionamento',
      };
      const childConfig = {
        ...familyMapLayout.groups.children,
        id: `additionalChildren-${spouse.id}`,
        title: `Filhos com ${getFirstName(spouse)}`,
      };
      const spouseLayoutForBranch = makeDirectLayout(
        spouseConfig,
        nextTop,
        familyMapLayout.metrics.parentCardHeight,
        [spouse],
      );
      const composedChildren = composeGroup({
        people: groupedChildren.childrenBySpouseId.get(spouse.id) ?? [],
        config: childConfig,
        spousesByPerson,
        isVisible,
        spouseFilterActive: directRelativeFilters.conjuge,
        excludedIds: excludedSpouseIds,
      });
      const childrenLayoutForBranch = resolveGroup(
        childConfig,
        composedChildren,
        expandedGroups,
        nextTop + familyMapLayout.metrics.parentCardHeight + familyMapLayout.metrics.groupGap,
        familyMapLayout,
        familyMapLayout.areas.lowerRight,
        hideGroupChrome,
      );
      branches.push({
        spouse,
        spouseLayout: spouseLayoutForBranch,
        childrenLayout: childrenLayoutForBranch,
      });
      nextTop = Math.max(
        spouseLayoutForBranch.top + spouseLayoutForBranch.height,
        childrenLayoutForBranch ? childrenLayoutForBranch.top + childrenLayoutForBranch.height : 0,
      ) + familyMapLayout.metrics.descendantRowGap;
    });
    return branches;
  }, [
    additionalSpouses,
    directRelativeFilters.conjuge,
    excludedSpouseIds,
    expandedGroups,
    familyMapLayout,
    groupedChildren.childrenBySpouseId,
    hideGroupChrome,
    isVisible,
    primaryLowerBottom,
    spousesByPerson,
  ]);

  const groupLayouts = [
    ...paternalAncestorLayouts,
    ...maternalAncestorLayouts,
    paternalUnclesLayout,
    paternalCousinsLayout,
    maternalUnclesLayout,
    maternalCousinsLayout,
    siblingsLayout,
    nephewsLayout,
    childrenLayout,
    petsLayout,
    grandchildrenLayout,
    ...additionalBranches.map((branch) => branch.childrenLayout),
  ].filter((layout): layout is ResolvedGroup => Boolean(layout?.people.length));

  const layoutsById = new Map<string, PositionedLayout>();
  [
    ...groupLayouts,
    fatherLayout,
    centralLayout,
    motherLayout,
    spouseLayout,
    ...additionalBranches.map((branch) => branch.spouseLayout),
  ].forEach((layout) => {
    if (layout) layoutsById.set(layout.id, layout);
  });

  const contentBottom = Math.max(
    centralLayout.top + centralLayout.height,
    ...Array.from(layoutsById.values()).map((layout) => layout.top + layout.height),
  );
  const canvasHeight = Math.max(familyMapLayout.canvas.minHeight, contentBottom + familyMapLayout.metrics.groupGap);
  const layoutsForExportBounds = [
    centralLayout,
    ...(directRelativeFilters.pais ? [fatherLayout, motherLayout] : []),
    ...(spouseLayout ? [spouseLayout] : []),
    ...additionalBranches.map((branch) => branch.spouseLayout),
    ...groupLayouts,
  ];
  const contentMinX = Math.min(0, ...layoutsForExportBounds.map((layout) => layout.left));
  const contentMaxX = Math.max(
    familyMapLayout.canvas.width,
    ...layoutsForExportBounds.map((layout) => layout.left + layout.width),
  );
  const exportCanvasWidth = contentMaxX - contentMinX + EXPORT_HORIZONTAL_PADDING * 2;
  const renderOffsetX = -contentMinX + EXPORT_HORIZONTAL_PADDING;

  const connectors: Connector[] = [];
  const addConnector = (connector?: Connector) => {
    if (connector) connectors.push(connector);
  };
  const connectAncestorChain = (ids: readonly string[]) => {
    const visibleIds = ids.filter((id) => layoutsById.get(id));
    visibleIds.slice(0, -1).forEach((id, index) => {
      addConnector(verticalConnector(layoutsById, `${id}-${visibleIds[index + 1]}`, id, visibleIds[index + 1]));
    });
  };
  connectAncestorChain(PATERNAL_ANCESTOR_IDS);
  connectAncestorChain(MATERNAL_ANCESTOR_IDS);

  const paternalLastAncestor = [...PATERNAL_ANCESTOR_IDS].reverse().find((id) => layoutsById.get(id));
  const maternalLastAncestor = [...MATERNAL_ANCESTOR_IDS].reverse().find((id) => layoutsById.get(id));
  const parentJunctionY = parentTop - familyMapLayout.connectors.junctionGap;
  const centralJunctionY = centralTop - 36;
  const descendantJunctionY = descendantsTop - familyMapLayout.connectors.junctionGap;

  if (paternalLastAncestor && father) addConnector(branchConnector(layoutsById, 'paternal-ancestors-father', paternalLastAncestor, 'father', parentJunctionY));
  if (maternalLastAncestor && mother) addConnector(branchConnector(layoutsById, 'maternal-ancestors-mother', maternalLastAncestor, 'mother', parentJunctionY));
  if (paternalLastAncestor && paternalUnclesLayout) addConnector(branchConnector(layoutsById, 'paternal-ancestors-uncles', paternalLastAncestor, 'paternalUncles', parentJunctionY));
  if (maternalLastAncestor && maternalUnclesLayout) addConnector(branchConnector(layoutsById, 'maternal-ancestors-uncles', maternalLastAncestor, 'maternalUncles', parentJunctionY));
  if (father && central) addConnector(branchConnector(layoutsById, 'father-central', 'father', 'central', centralJunctionY));
  if (mother && central) addConnector(branchConnector(layoutsById, 'mother-central', 'mother', 'central', centralJunctionY));
  if (paternalUnclesLayout && paternalCousinsLayout) addConnector(verticalConnector(layoutsById, 'paternal-uncles-cousins', 'paternalUncles', 'paternalCousins'));
  if (maternalUnclesLayout && maternalCousinsLayout) addConnector(verticalConnector(layoutsById, 'maternal-uncles-cousins', 'maternalUncles', 'maternalCousins'));

  const lowerRootIds = [
    siblingsLayout && 'siblings',
    spouseLayout && 'spouse',
    !spouseLayout && childrenLayout && 'children',
    !spouseLayout && petsLayout && 'pets',
    !spouseLayout && !childrenLayout && grandchildrenLayout && 'grandchildren',
    ...additionalBranches.map((branch) => branch.spouseLayout.id),
  ].filter((id): id is string => Boolean(id));
  if (central && lowerRootIds.length > 0) {
    lowerRootIds.forEach((id) => {
      addConnector(branchConnector(layoutsById, `central-${id}`, 'central', id, descendantJunctionY));
    });
  }
  if (siblingsLayout && nephewsLayout) addConnector(verticalConnector(layoutsById, 'siblings-nephews', 'siblings', 'nephews'));
  if (spouseLayout) {
    const spouseBranchY = spouseLayout.top + spouseLayout.height + familyMapLayout.metrics.groupGap / 2;
    if (childrenLayout) addConnector(branchConnector(layoutsById, 'spouse-children', 'spouse', 'children', spouseBranchY));
    if (petsLayout) addConnector(branchConnector(layoutsById, 'spouse-pets', 'spouse', 'pets', spouseBranchY));
    if (!childrenLayout && grandchildrenLayout) addConnector(branchConnector(layoutsById, 'spouse-grandchildren', 'spouse', 'grandchildren', spouseBranchY));
  }
  additionalBranches.forEach((branch) => {
    if (!branch.childrenLayout) return;
    const spouseBranchY = branch.spouseLayout.top + branch.spouseLayout.height + familyMapLayout.metrics.groupGap / 2;
    addConnector(branchConnector(
      layoutsById,
      `${branch.spouseLayout.id}-${branch.childrenLayout.id}`,
      branch.spouseLayout.id,
      branch.childrenLayout.id,
      spouseBranchY,
    ));
  });
  if (childrenLayout && grandchildrenLayout) addConnector(verticalConnector(layoutsById, 'children-grandchildren', 'children', 'grandchildren'));

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const updateScale = () => {
      const widthScale = viewport.clientWidth / exportCanvasWidth;
      const heightScale = viewport.clientHeight / familyMapLayout.canvas.minHeight;
      setResponsiveScale(Math.min(1, Math.max(familyMapLayout.canvas.minScale, Math.min(widthScale, heightScale))));
    };
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    updateScale();
    return () => observer.disconnect();
  }, [canvasHeight, exportCanvasWidth, familyMapLayout, layoutRevision]);

  React.useEffect(() => {
    setManualZoom(1);
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
    }
  }, [centralPersonId, isWideLayout, layoutRevision]);

  const handleWheel = React.useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setManualZoom((currentZoom) => {
      const nextZoom = currentZoom + direction * familyMapLayout.canvas.zoomStep;
      return Math.min(
        familyMapLayout.canvas.maxZoom,
        Math.max(familyMapLayout.canvas.minZoom, Number(nextZoom.toFixed(2))),
      );
    });
  }, [familyMapLayout.canvas]);

  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const hasScrolled = event.currentTarget.scrollTop > 24;
    if (scrollStateRef.current === hasScrolled) return;
    scrollStateRef.current = hasScrolled;
    onScrollStateChange?.(hasScrolled);
  }, [onScrollStateChange]);

  React.useEffect(() => {
    scrollStateRef.current = false;
    onScrollStateChange?.(false);
  }, [centralPersonId, layoutRevision, onScrollStateChange]);

  const collateralSpouseCount = React.useMemo(() => collectCollateralSpouses(
    [
      sourcePeople.paternalUncles,
      sourcePeople.paternalCousins,
      sourcePeople.maternalUncles,
      sourcePeople.maternalCousins,
      nephews,
      allChildren,
      grandchildren,
    ],
    spousesByPerson,
    isVisible,
    excludedSpouseIds,
  ), [allChildren, excludedSpouseIds, grandchildren, isVisible, nephews, sourcePeople, spousesByPerson]);

  React.useEffect(() => {
    if (!onDirectRelationRenderedCounts) return;
    onDirectRelationRenderedCounts({
      ...EMPTY_COUNTS,
      pais: Number(Boolean(father)) + Number(Boolean(mother)),
      avos: sourcePeople.paternalGrandparents.length + sourcePeople.maternalGrandparents.length,
      bisavos: sourcePeople.paternalGreatGrandparents.length + sourcePeople.maternalGreatGrandparents.length,
      tataravos: sourcePeople.paternalGreatGreatGrandparents.length + sourcePeople.maternalGreatGreatGrandparents.length,
      conjuge: mainSpouses.length + collateralSpouseCount,
      filhos: allChildren.length,
      netos: grandchildren.length,
      irmaos: siblings.length,
      sobrinhos: nephews.length,
      tios: sourcePeople.paternalUncles.length + sourcePeople.maternalUncles.length,
      primos: sourcePeople.paternalCousins.length + sourcePeople.maternalCousins.length,
      pets: pets.length,
    });
  }, [
    allChildren.length,
    collateralSpouseCount,
    father,
    grandchildren.length,
    mainSpouses.length,
    mother,
    nephews.length,
    onDirectRelationRenderedCounts,
    pets.length,
    siblings.length,
    sourcePeople,
  ]);

  const effectiveScale = responsiveScale * manualZoom;
  const captureFamilyMap = React.useCallback(async () => {
    if (!exportRootRef.current) throw new Error('Área do Árvore Familiar não encontrada para exportação.');
    assertSafeDirectExportSize(exportRootRef.current, 'O Árvore Familiar');
    return captureElementToCanvas(exportRootRef.current);
  }, []);
  const handleZoomIn = React.useCallback(() => {
    setManualZoom((currentZoom) => Math.min(
      familyMapLayout.canvas.maxZoom,
      Number((currentZoom + familyMapLayout.canvas.zoomStep).toFixed(2)),
    ));
  }, [familyMapLayout.canvas]);
  const handleZoomOut = React.useCallback(() => {
    setManualZoom((currentZoom) => Math.max(
      familyMapLayout.canvas.minZoom,
      Number((currentZoom - familyMapLayout.canvas.zoomStep).toFixed(2)),
    ));
  }, [familyMapLayout.canvas]);
  const handleSaveImage = React.useCallback(async () => {
    if (exportLoadingMessage) return;
    setExportLoadingMessage(getExportLoadingMessage('image'));
    try {
      await waitForTreeExportPaint();
      await waitForExportUiSettle(150);
      const canvas = prependTitleToCanvas(await captureFamilyMap(), exportTitle);
      downloadCanvasAsPng(canvas, buildTreeExportFilename('mapa-familiar', 'png'));
      await waitForExportUiSettle(700);
    } catch (error) {
      console.error('Erro ao exportar imagem do Árvore Familiar:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar a imagem do Árvore Familiar.');
    } finally {
      setExportLoadingMessage(null);
    }
  }, [captureFamilyMap, exportLoadingMessage, exportTitle]);
  const handleSavePdf = React.useCallback(async () => {
    if (exportLoadingMessage) return;
    setExportLoadingMessage(getExportLoadingMessage('pdf'));
    try {
      await waitForTreeExportPaint();
      await waitForExportUiSettle(150);
      const canvas = prependTitleToCanvas(await captureFamilyMap(), exportTitle);
      await exportCanvasAsPdf(canvas, buildTreeExportFilename('mapa-familiar', 'pdf'), '');
      await waitForExportUiSettle(700);
    } catch (error) {
      console.error('Erro ao exportar PDF do Árvore Familiar:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar o PDF do Árvore Familiar.');
    } finally {
      setExportLoadingMessage(null);
    }
  }, [captureFamilyMap, exportLoadingMessage, exportTitle]);
  const handlePrint = React.useCallback(async () => {
    if (exportLoadingMessage) return;
    const printWindow = openTreePrintWindow();
    setExportLoadingMessage(getExportLoadingMessage('print'));
    try {
      await waitForTreeExportPaint();
      await waitForExportUiSettle(150);
      const canvas = prependTitleToCanvas(await captureFamilyMap(), exportTitle);
      await printCanvas(canvas, exportTitle, printWindow);
      await waitForExportUiSettle(700);
    } catch (error) {
      if (!printWindow.closed) printWindow.close();
      console.error('Erro ao imprimir o Árvore Familiar:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível imprimir o Árvore Familiar.');
    } finally {
      setExportLoadingMessage(null);
    }
  }, [captureFamilyMap, exportLoadingMessage, exportTitle]);
  const handleStartAreaSelection = React.useCallback(() => {
    if (exportLoadingMessage) return;
    if (!viewportRef.current) {
      toast.error('Área visível do Árvore Familiar não encontrada para seleção.');
      return;
    }
    setIsAreaSelectionOpen((current) => !current);
  }, [exportLoadingMessage]);
  const handleCloseAreaSelection = React.useCallback(() => setIsAreaSelectionOpen(false), []);

  React.useImperativeHandle(ref, () => ({
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    print: handlePrint,
    savePdf: handleSavePdf,
    saveImage: handleSaveImage,
    startAreaSelection: handleStartAreaSelection,
  }), [handlePrint, handleSaveImage, handleSavePdf, handleStartAreaSelection, handleZoomIn, handleZoomOut]);

  return (
    <div
      ref={viewportRef}
      onWheel={handleWheel}
      onScroll={handleScroll}
      className="absolute inset-x-0 bottom-0 top-0 isolate overflow-auto overscroll-contain pt-[76px]"
      style={{ backgroundColor: familyMapLayout.canvas.background }}
    >
      <div
        ref={exportRootRef}
        data-family-map-export-root="true"
        className="relative z-10 mx-auto"
        style={{ width: exportCanvasWidth * effectiveScale, height: canvasHeight * effectiveScale }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: exportCanvasWidth, height: canvasHeight, transform: `scale(${effectiveScale})` }}
        >
          <svg
            data-family-map-connectors="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox={`0 0 ${exportCanvasWidth} ${canvasHeight}`}
            aria-hidden="true"
          >
            <g
              fill="none"
              stroke={familyMapLayout.connectors.color}
              strokeWidth={familyMapLayout.connectors.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {connectors.map((connector) => (
                <path key={connector.id} d={connectorPath(getOffsetConnectorPoints(connector.points, renderOffsetX))} />
              ))}
            </g>
          </svg>

          {groupLayouts.map((layout) => (
            <PositionedGroup
              key={layout.id}
              layout={getOffsetLayout(layout, renderOffsetX)}
              vitalMode={isWideLayout ? 'full' : 'year'}
              expanded={expandedGroups.has(layout.id)}
              hideChrome={hideGroupChrome}
              onExpandedChange={handleExpandedChange}
              onPersonClick={onPersonClick}
            />
          ))}

          {directRelativeFilters.pais && (
            <>
              <DirectPersonCard
                layout={getOffsetLayout(fatherLayout, renderOffsetX)}
                person={father}
                emptyLabel="Pai"
                showLabel={!hideGroupChrome}
                onPersonClick={onPersonClick}
              />
              <DirectPersonCard
                layout={getOffsetLayout(motherLayout, renderOffsetX)}
                person={mother}
                emptyLabel="Mãe"
                showLabel={!hideGroupChrome}
                onPersonClick={onPersonClick}
              />
            </>
          )}
          {central && (
            <DirectPersonCard
              layout={getOffsetLayout(centralLayout, renderOffsetX)}
              person={central}
              central
              showLabel={false}
              onPersonClick={onPersonClick}
            />
          )}
          {mainSpouse && spouseLayout && (
            <DirectPersonCard
              layout={getOffsetLayout(spouseLayout, renderOffsetX)}
              person={mainSpouse}
              tone="spouse"
              showLabel={!hideGroupChrome}
              onPersonClick={onPersonClick}
            />
          )}
          {additionalBranches.map((branch) => (
            <DirectPersonCard
              key={branch.spouseLayout.id}
              layout={getOffsetLayout(branch.spouseLayout, renderOffsetX)}
              person={branch.spouse}
              tone="spouse"
              showLabel={!hideGroupChrome}
              onPersonClick={onPersonClick}
            />
          ))}
        </div>
        {isAreaSelectionOpen && (
          <TreeAreaSelectionOverlay
            getTargetElement={() => viewportRef.current}
            filenameLabel="mapa-familiar"
            title={exportTitle}
            onClose={handleCloseAreaSelection}
          />
        )}
      </div>
      {exportLoadingMessage && (
        <TreeExportLoadingOverlay title="Exportando Árvore Familiar" message={exportLoadingMessage} />
      )}
    </div>
  );
}

export const DesktopFamilyMapView = React.forwardRef<FamilyTreeActions, DesktopFamilyMapViewProps>(DesktopFamilyMapViewComponent);
