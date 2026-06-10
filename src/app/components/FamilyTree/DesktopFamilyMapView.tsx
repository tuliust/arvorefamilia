import React from 'react';

import type { Pessoa, Relacionamento } from '../../types';
import {
  VisualEmptyCard,
  VisualGroup,
  VisualPersonCard,
} from './FamilyTreeVisualCards';
import {
  buildMobileFamilyTreeModel,
  type MobileFamilyBranch,
} from './mobileFamilyTreeModel';
import type { DirectRelativeFilters, DirectRelativeGroup } from './types';

interface DesktopFamilyMapViewProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  centralPersonId: string;
  visiblePersonIds?: Set<string>;
  directRelativeFilters: DirectRelativeFilters;
  onPersonClick: (pessoa: Pessoa) => void;
  layoutRevision: number;
  onDirectRelationRenderedCounts?: (counts: Record<DirectRelativeGroup, number>) => void;
}

type GroupKind =
  | 'ancestor'
  | 'lateral-many'
  | 'central-small'
  | 'descendant'
  | 'pet'
  | 'direct-card'
  | 'single';
type GroupArea = 'left' | 'center' | 'right' | 'ancestors' | 'lower';
type GroupColumns = 'single' | 'double' | 'triple' | 'quad';
type GroupVariant = 'mini' | 'compact' | 'horizontal';
type SpousePolicy = 'never' | 'always' | 'filter';
type AnchorName = 'topCenter' | 'bottomCenter' | 'leftCenter' | 'rightCenter';
type Point = [number, number];

type FamilyMapGroupId =
  | 'paternalGreatGreatGrandparents'
  | 'paternalGreatGrandparents'
  | 'paternalGrandparents'
  | 'paternalUncles'
  | 'paternalCousins'
  | 'father'
  | 'central'
  | 'mother'
  | 'maternalGreatGreatGrandparents'
  | 'maternalGreatGrandparents'
  | 'maternalGrandparents'
  | 'maternalUncles'
  | 'maternalCousins'
  | 'siblings'
  | 'nephews'
  | 'spouse'
  | 'children'
  | 'pets'
  | 'grandchildren';

type GroupConfig = {
  id: FamilyMapGroupId;
  title: string;
  kind: GroupKind;
  area: GroupArea;
  x: number;
  y: number;
  width: number;
  singleWidth?: number;
  columns: GroupColumns;
  collapsedLimit: number;
  variant: GroupVariant;
  expandable: boolean;
  allowsSpouses: boolean;
  spousePolicy: SpousePolicy;
  spouseTone?: 'spouse' | 'ancestorSpouse';
  isLateral: boolean;
  isAncestor: boolean;
  isLower: boolean;
  isDirectCard: boolean;
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

type Connector = {
  id: string;
  points: Point[];
};

const FAMILY_MAP_LAYOUT = {
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
    width: 3,
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
    paternalGreatGreatGrandparents: {
      id: 'paternalGreatGreatGrandparents',
      title: 'Tataravós Paternos',
      kind: 'ancestor',
      area: 'ancestors',
      x: 265,
      y: 18,
      width: 430,
      columns: 'double',
      collapsedLimit: 4,
      variant: 'horizontal',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'always',
      spouseTone: 'ancestorSpouse',
      isLateral: false,
      isAncestor: true,
      isLower: false,
      isDirectCard: false,
    },
    paternalGreatGrandparents: {
      id: 'paternalGreatGrandparents',
      title: 'Bisavós Paternos',
      kind: 'ancestor',
      area: 'ancestors',
      x: 265,
      y: 18,
      width: 430,
      columns: 'double',
      collapsedLimit: 4,
      variant: 'horizontal',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'always',
      spouseTone: 'ancestorSpouse',
      isLateral: false,
      isAncestor: true,
      isLower: false,
      isDirectCard: false,
    },
    paternalGrandparents: {
      id: 'paternalGrandparents',
      title: 'Avós Paternos',
      kind: 'ancestor',
      area: 'ancestors',
      x: 265,
      y: 18,
      width: 430,
      columns: 'double',
      collapsedLimit: 4,
      variant: 'horizontal',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'always',
      spouseTone: 'ancestorSpouse',
      isLateral: false,
      isAncestor: true,
      isLower: false,
      isDirectCard: false,
    },
    paternalUncles: {
      id: 'paternalUncles',
      title: 'Tios Paternos',
      kind: 'lateral-many',
      area: 'left',
      x: -160,
      y: 0,
      width: 480,
      singleWidth: 300,
      columns: 'quad',
      collapsedLimit: 8,
      variant: 'mini',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'filter',
      isLateral: true,
      isAncestor: false,
      isLower: false,
      isDirectCard: false,
    },
    paternalCousins: {
      id: 'paternalCousins',
      title: 'Primos Paternos',
      kind: 'lateral-many',
      area: 'left',
      x: -160,
      y: 0,
      width: 480,
      singleWidth: 300,
      columns: 'quad',
      collapsedLimit: 8,
      variant: 'mini',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'filter',
      isLateral: true,
      isAncestor: false,
      isLower: false,
      isDirectCard: false,
    },
    father: {
      id: 'father',
      title: 'Pai',
      kind: 'direct-card',
      area: 'center',
      x: 375,
      y: 0,
      width: 210,
      columns: 'single',
      collapsedLimit: 1,
      variant: 'compact',
      expandable: false,
      allowsSpouses: false,
      spousePolicy: 'never',
      isLateral: false,
      isAncestor: false,
      isLower: false,
      isDirectCard: true,
    },
    central: {
      id: 'central',
      title: 'Pessoa Central',
      kind: 'direct-card',
      area: 'center',
      x: 615,
      y: 0,
      width: 210,
      columns: 'single',
      collapsedLimit: 1,
      variant: 'compact',
      expandable: false,
      allowsSpouses: false,
      spousePolicy: 'never',
      isLateral: false,
      isAncestor: false,
      isLower: false,
      isDirectCard: true,
    },
    mother: {
      id: 'mother',
      title: 'Mãe',
      kind: 'direct-card',
      area: 'center',
      x: 855,
      y: 0,
      width: 210,
      columns: 'single',
      collapsedLimit: 1,
      variant: 'compact',
      expandable: false,
      allowsSpouses: false,
      spousePolicy: 'never',
      isLateral: false,
      isAncestor: false,
      isLower: false,
      isDirectCard: true,
    },
    maternalGreatGreatGrandparents: {
      id: 'maternalGreatGreatGrandparents',
      title: 'Tataravós Maternos',
      kind: 'ancestor',
      area: 'ancestors',
      x: 745,
      y: 18,
      width: 430,
      columns: 'double',
      collapsedLimit: 4,
      variant: 'horizontal',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'always',
      spouseTone: 'ancestorSpouse',
      isLateral: false,
      isAncestor: true,
      isLower: false,
      isDirectCard: false,
    },
    maternalGreatGrandparents: {
      id: 'maternalGreatGrandparents',
      title: 'Bisavós Maternos',
      kind: 'ancestor',
      area: 'ancestors',
      x: 745,
      y: 18,
      width: 430,
      columns: 'double',
      collapsedLimit: 4,
      variant: 'horizontal',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'always',
      spouseTone: 'ancestorSpouse',
      isLateral: false,
      isAncestor: true,
      isLower: false,
      isDirectCard: false,
    },
    maternalGrandparents: {
      id: 'maternalGrandparents',
      title: 'Avós Maternos',
      kind: 'ancestor',
      area: 'ancestors',
      x: 745,
      y: 18,
      width: 430,
      columns: 'double',
      collapsedLimit: 4,
      variant: 'horizontal',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'always',
      spouseTone: 'ancestorSpouse',
      isLateral: false,
      isAncestor: true,
      isLower: false,
      isDirectCard: false,
    },
    maternalUncles: {
      id: 'maternalUncles',
      title: 'Tios Maternos',
      kind: 'lateral-many',
      area: 'right',
      x: 1120,
      y: 0,
      width: 480,
      singleWidth: 300,
      columns: 'quad',
      collapsedLimit: 8,
      variant: 'mini',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'filter',
      isLateral: true,
      isAncestor: false,
      isLower: false,
      isDirectCard: false,
    },
    maternalCousins: {
      id: 'maternalCousins',
      title: 'Primos Maternos',
      kind: 'lateral-many',
      area: 'right',
      x: 1120,
      y: 0,
      width: 480,
      singleWidth: 300,
      columns: 'quad',
      collapsedLimit: 8,
      variant: 'mini',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'filter',
      isLateral: true,
      isAncestor: false,
      isLower: false,
      isDirectCard: false,
    },
    siblings: {
      id: 'siblings',
      title: 'Irmãos',
      kind: 'central-small',
      area: 'lower',
      x: 340,
      y: 0,
      width: 360,
      singleWidth: 260,
      columns: 'double',
      collapsedLimit: 2,
      variant: 'horizontal',
      expandable: true,
      allowsSpouses: false,
      spousePolicy: 'never',
      isLateral: false,
      isAncestor: false,
      isLower: true,
      isDirectCard: false,
    },
    nephews: {
      id: 'nephews',
      title: 'Sobrinhos',
      kind: 'central-small',
      area: 'lower',
      x: 340,
      y: 0,
      width: 300,
      singleWidth: 220,
      columns: 'double',
      collapsedLimit: 2,
      variant: 'mini',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'filter',
      isLateral: false,
      isAncestor: false,
      isLower: true,
      isDirectCard: false,
    },
    spouse: {
      id: 'spouse',
      title: 'Cônjuge',
      kind: 'direct-card',
      area: 'lower',
      x: 720,
      y: 0,
      width: 210,
      columns: 'single',
      collapsedLimit: 1,
      variant: 'compact',
      expandable: false,
      allowsSpouses: false,
      spousePolicy: 'always',
      spouseTone: 'spouse',
      isLateral: false,
      isAncestor: false,
      isLower: true,
      isDirectCard: true,
    },
    children: {
      id: 'children',
      title: 'Filhos',
      kind: 'descendant',
      area: 'lower',
      x: 940,
      y: 0,
      width: 300,
      singleWidth: 260,
      columns: 'double',
      collapsedLimit: 2,
      variant: 'horizontal',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'filter',
      isLateral: false,
      isAncestor: false,
      isLower: true,
      isDirectCard: false,
    },
    pets: {
      id: 'pets',
      title: 'Pets',
      kind: 'pet',
      area: 'lower',
      x: 665,
      y: 0,
      width: 180,
      singleWidth: 180,
      columns: 'single',
      collapsedLimit: 2,
      variant: 'mini',
      expandable: true,
      allowsSpouses: false,
      spousePolicy: 'never',
      isLateral: false,
      isAncestor: false,
      isLower: true,
      isDirectCard: false,
    },
    grandchildren: {
      id: 'grandchildren',
      title: 'Netos',
      kind: 'descendant',
      area: 'lower',
      x: 940,
      y: 0,
      width: 300,
      singleWidth: 220,
      columns: 'double',
      collapsedLimit: 2,
      variant: 'mini',
      expandable: true,
      allowsSpouses: true,
      spousePolicy: 'filter',
      isLateral: false,
      isAncestor: false,
      isLower: true,
      isDirectCard: false,
    },
  } satisfies Record<FamilyMapGroupId, GroupConfig>,
} as const;

const PATERNAL_ANCESTOR_IDS: FamilyMapGroupId[] = [
  'paternalGreatGreatGrandparents',
  'paternalGreatGrandparents',
  'paternalGrandparents',
];
const MATERNAL_ANCESTOR_IDS: FamilyMapGroupId[] = [
  'maternalGreatGreatGrandparents',
  'maternalGreatGrandparents',
  'maternalGrandparents',
];
const RENDERED_GROUP_IDS: FamilyMapGroupId[] = [
  ...PATERNAL_ANCESTOR_IDS,
  ...MATERNAL_ANCESTOR_IDS,
  'paternalUncles',
  'paternalCousins',
  'maternalUncles',
  'maternalCousins',
  'siblings',
  'nephews',
  'children',
  'pets',
  'grandchildren',
];

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
  const nextPartnerId = nextPerson
    ? group.spousePartnerByPersonId.get(nextPerson.id)
    : undefined;

  return lastPerson && nextPerson && nextPartnerId === lastPerson.id
    ? [...visible, nextPerson]
    : visible;
}

function getGridCellCount(
  people: Pessoa[],
  columns: GroupColumns,
  spousePartnerByPersonId: Map<string, string>,
) {
  const columnCount = getColumnCount(columns);
  let cells = 0;

  people.forEach((person, index) => {
    const partnerId = spousePartnerByPersonId.get(person.id);
    const previousPerson = people[index - 1];
    if (partnerId && previousPerson?.id === partnerId && cells % columnCount === 0) {
      cells += 1;
    }
    cells += 1;
  });

  return cells;
}

function getGroupHeight(group: ComposedGroup, config: GroupConfig, expanded: boolean) {
  const visiblePeople = getVisiblePeople(group, config, expanded);
  const cardHeight = config.variant === 'horizontal'
    ? FAMILY_MAP_LAYOUT.metrics.horizontalCardHeight
    : FAMILY_MAP_LAYOUT.metrics.miniCardHeight;
  const cells = getGridCellCount(
    visiblePeople,
    config.columns,
    group.spousePartnerByPersonId,
  );
  const rows = Math.max(1, Math.ceil(cells / getColumnCount(config.columns)));

  return FAMILY_MAP_LAYOUT.metrics.groupVerticalPadding
    + rows * cardHeight
    + Math.max(0, rows - 1) * FAMILY_MAP_LAYOUT.metrics.gridGap;
}

function getGroupWidth(config: GroupConfig, peopleCount: number) {
  return peopleCount === 1 && config.singleWidth
    ? Math.min(config.width, config.singleWidth)
    : config.width;
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
    config.spousePolicy === 'always'
    || (config.spousePolicy === 'filter' && spouseFilterActive)
  );

  const addPerson = (person: Pessoa) => {
    if (seen.has(person.id) || excludedIds.has(person.id) || !isVisible(person)) return false;
    seen.add(person.id);
    result.push(person);
    return true;
  };

  people.forEach((person) => {
    if (!addPerson(person) && !seen.has(person.id)) return;
    if (!includeSpouses) return;

    // Pairing is only created from explicit `conjuge` relationships; adjacency is never inferred.
    (spousesByPerson.get(person.id) ?? []).forEach((spouse) => {
      if (!addPerson(spouse)) return;
      spousePersonIds.add(spouse.id);
      spousePartnerByPersonId.set(spouse.id, person.id);
    });
  });

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

function stackGroups(
  ids: FamilyMapGroupId[],
  groups: Map<FamilyMapGroupId, ComposedGroup>,
  expandedGroups: Set<string>,
) {
  let top = FAMILY_MAP_LAYOUT.metrics.topStart;
  const layouts: ResolvedGroup[] = [];

  ids.forEach((id) => {
    const config = FAMILY_MAP_LAYOUT.groups[id];
    const group = groups.get(id);
    if (!group?.people.length) return;
    const height = getGroupHeight(group, config, expandedGroups.has(id));
    layouts.push({
      ...config,
      ...group,
      left: config.x,
      top,
      height,
    });
    top += height + FAMILY_MAP_LAYOUT.metrics.groupGap;
  });

  return layouts;
}

function resolveGroup(
  id: FamilyMapGroupId,
  groups: Map<FamilyMapGroupId, ComposedGroup>,
  expandedGroups: Set<string>,
  top: number,
  baseArea?: { x: number; width: number },
) {
  const config = FAMILY_MAP_LAYOUT.groups[id];
  const group = groups.get(id);
  if (!group?.people.length) return undefined;
  const width = getGroupWidth(config, group.people.length);
  return {
    ...config,
    ...group,
    left: baseArea ? centerWithin(baseArea.x, baseArea.width, width) : config.x,
    top,
    width,
    height: getGroupHeight(group, config, expandedGroups.has(id)),
  } satisfies ResolvedGroup;
}

function getGroupAnchor(
  layouts: Map<FamilyMapGroupId, ResolvedGroup>,
  groupId: FamilyMapGroupId,
  anchorName: AnchorName,
) {
  const layout = layouts.get(groupId);
  if (!layout) return undefined;
  if (anchorName === 'topCenter') return [layout.left + layout.width / 2, layout.top] as Point;
  if (anchorName === 'bottomCenter') return [layout.left + layout.width / 2, layout.top + layout.height] as Point;
  if (anchorName === 'leftCenter') return [layout.left, layout.top + layout.height / 2] as Point;
  return [layout.left + layout.width, layout.top + layout.height / 2] as Point;
}

function makeConnector(
  layouts: Map<FamilyMapGroupId, ResolvedGroup>,
  id: string,
  fromGroupId: FamilyMapGroupId,
  fromAnchor: AnchorName,
  toGroupId: FamilyMapGroupId,
  toAnchor: AnchorName,
  via?: (from: Point, to: Point) => Point[],
) {
  const from = getGroupAnchor(layouts, fromGroupId, fromAnchor);
  const to = getGroupAnchor(layouts, toGroupId, toAnchor);
  if (!from || !to) return undefined;
  return { id, points: via ? via(from, to) : [from, to] } satisfies Connector;
}

function connectorPath(points: Point[]) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

function verticalConnector(
  layouts: Map<FamilyMapGroupId, ResolvedGroup>,
  id: string,
  fromId: FamilyMapGroupId,
  toId: FamilyMapGroupId,
) {
  return makeConnector(
    layouts,
    id,
    fromId,
    'bottomCenter',
    toId,
    'topCenter',
    (from, to) => {
      if (from[0] === to[0]) return [from, to];
      const middleY = from[1] + (to[1] - from[1]) / 2;
      return [from, [from[0], middleY], [to[0], middleY], to];
    },
  );
}

function branchConnector(
  layouts: Map<FamilyMapGroupId, ResolvedGroup>,
  id: string,
  fromId: FamilyMapGroupId,
  toId: FamilyMapGroupId,
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

function PositionedGroup({
  layout,
  expanded,
  onExpandedChange,
  onPersonClick,
}: {
  layout: ResolvedGroup;
  expanded: boolean;
  onExpandedChange: (id: string, expanded: boolean) => void;
  onPersonClick: (pessoa: Pessoa) => void;
}) {
  return (
    <div
      className="absolute z-10 min-h-0"
      style={{ left: layout.left, top: layout.top, width: layout.width }}
    >
      <VisualGroup
        title={layout.title}
        people={layout.people}
        columns={layout.columns}
        variant={layout.variant}
        titleVariant="pill"
        expandable={layout.expandable}
        collapsedLimit={layout.collapsedLimit}
        expanded={expanded}
        onExpandedChange={(nextExpanded) => onExpandedChange(layout.id, nextExpanded)}
        disableInternalScroll
        spousePersonIds={layout.spousePersonIds}
        spousePartnerByPersonId={layout.spousePartnerByPersonId}
        spouseTone={layout.spouseTone}
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
  tone,
  onPersonClick,
}: {
  layout: ResolvedGroup;
  person?: Pessoa;
  emptyLabel?: string;
  central?: boolean;
  tone?: 'spouse';
  onPersonClick: (pessoa: Pessoa) => void;
}) {
  return (
    <div
      className="absolute z-20"
      style={{ left: layout.left, top: layout.top, width: layout.width }}
    >
      {person ? (
        <VisualPersonCard
          person={person}
          label={layout.title}
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

export function DesktopFamilyMapView({
  pessoas,
  relacionamentos,
  centralPersonId,
  visiblePersonIds,
  directRelativeFilters,
  onPersonClick,
  layoutRevision,
  onDirectRelationRenderedCounts,
}: DesktopFamilyMapViewProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [responsiveScale, setResponsiveScale] = React.useState(1);
  const [manualZoom, setManualZoom] = React.useState(1);
  const [expandedGroups, handleExpandedChange] = useExpandedGroups();
  const model = React.useMemo(
    () => buildMobileFamilyTreeModel(pessoas, relacionamentos, centralPersonId),
    [centralPersonId, pessoas, relacionamentos],
  );
  const isVisible = React.useCallback(
    (person: Pessoa | undefined, preserveCentral = false): person is Pessoa => Boolean(
      person && (preserveCentral || !visiblePersonIds || visiblePersonIds.has(person.id)),
    ),
    [visiblePersonIds],
  );
  const filterVisible = React.useCallback(
    (people: Pessoa[]) => people.filter((person) => isVisible(person)),
    [isVisible],
  );
  const filterGroup = React.useCallback(
    (people: Pessoa[], group: DirectRelativeGroup) => (
      directRelativeFilters[group] ? filterVisible(people) : []
    ),
    [directRelativeFilters, filterVisible],
  );
  const spousesByPerson = React.useMemo(
    () => buildSpousesByPerson(pessoas, relacionamentos),
    [pessoas, relacionamentos],
  );

  const paternal = React.useMemo<MobileFamilyBranch>(() => ({
    parent: filterGroup(model.paternal.parent, 'pais'),
    grandparents: filterGroup(model.paternal.grandparents, 'avos'),
    greatGrandparents: filterGroup(model.paternal.greatGrandparents, 'bisavos'),
    greatGreatGrandparents: filterGroup(model.paternal.greatGreatGrandparents, 'tataravos'),
    uncles: filterGroup(model.paternal.uncles, 'tios'),
    cousins: filterGroup(model.paternal.cousins, 'primos'),
  }), [filterGroup, model.paternal]);
  const maternal = React.useMemo<MobileFamilyBranch>(() => ({
    parent: filterGroup(model.maternal.parent, 'pais'),
    grandparents: filterGroup(model.maternal.grandparents, 'avos'),
    greatGrandparents: filterGroup(model.maternal.greatGrandparents, 'bisavos'),
    greatGreatGrandparents: filterGroup(model.maternal.greatGreatGrandparents, 'tataravos'),
    uncles: filterGroup(model.maternal.uncles, 'tios'),
    cousins: filterGroup(model.maternal.cousins, 'primos'),
  }), [filterGroup, model.maternal]);

  const father = directRelativeFilters.pais && isVisible(model.father) ? model.father : undefined;
  const mother = directRelativeFilters.pais && isVisible(model.mother) ? model.mother : undefined;
  const central = isVisible(model.central, true) ? model.central : undefined;
  const mainSpouses = filterVisible(model.spouses);
  const mainSpouse = mainSpouses[0];
  const siblings = filterGroup(model.siblings, 'irmaos');
  const nephews = filterGroup(model.nephews, 'sobrinhos');
  const children = filterGroup(model.children, 'filhos');
  const pets = filterGroup(model.pets, 'pets');
  const grandchildren = filterGroup(model.grandchildren, 'netos');
  const excludedSpouseIds = React.useMemo(
    () => new Set([centralPersonId, ...mainSpouses.map((person) => person.id)]),
    [centralPersonId, mainSpouses],
  );

  const sourcePeople = React.useMemo<Record<FamilyMapGroupId, Pessoa[]>>(() => ({
    paternalGreatGreatGrandparents: paternal.greatGreatGrandparents,
    paternalGreatGrandparents: paternal.greatGrandparents,
    paternalGrandparents: paternal.grandparents,
    paternalUncles: paternal.uncles,
    paternalCousins: paternal.cousins,
    father: father ? [father] : [],
    central: central ? [central] : [],
    mother: mother ? [mother] : [],
    maternalGreatGreatGrandparents: maternal.greatGreatGrandparents,
    maternalGreatGrandparents: maternal.greatGrandparents,
    maternalGrandparents: maternal.grandparents,
    maternalUncles: maternal.uncles,
    maternalCousins: maternal.cousins,
    siblings,
    nephews,
    spouse: mainSpouse ? [mainSpouse] : [],
    children,
    pets,
    grandchildren,
  }), [
    central,
    children,
    father,
    grandchildren,
    mainSpouse,
    maternal,
    mother,
    nephews,
    paternal,
    pets,
    siblings,
  ]);

  const composedGroups = React.useMemo(() => {
    const groups = new Map<FamilyMapGroupId, ComposedGroup>();
    (Object.keys(FAMILY_MAP_LAYOUT.groups) as FamilyMapGroupId[]).forEach((id) => {
      groups.set(id, composeGroup({
        people: sourcePeople[id],
        config: FAMILY_MAP_LAYOUT.groups[id],
        spousesByPerson,
        isVisible,
        spouseFilterActive: directRelativeFilters.conjuge,
        excludedIds: excludedSpouseIds,
      }));
    });
    return groups;
  }, [
    directRelativeFilters.conjuge,
    excludedSpouseIds,
    isVisible,
    sourcePeople,
    spousesByPerson,
  ]);

  const paternalAncestorLayouts = stackGroups(
    PATERNAL_ANCESTOR_IDS,
    composedGroups,
    expandedGroups,
  );
  const maternalAncestorLayouts = stackGroups(
    MATERNAL_ANCESTOR_IDS,
    composedGroups,
    expandedGroups,
  );
  const ancestorBottom = Math.max(
    FAMILY_MAP_LAYOUT.metrics.topStart + FAMILY_MAP_LAYOUT.metrics.horizontalCardHeight,
    ...paternalAncestorLayouts.map((layout) => layout.top + layout.height),
    ...maternalAncestorLayouts.map((layout) => layout.top + layout.height),
  );
  const parentTop = ancestorBottom + FAMILY_MAP_LAYOUT.metrics.parentTopGap;
  const centralTop = parentTop
    + FAMILY_MAP_LAYOUT.metrics.parentCardHeight
    + FAMILY_MAP_LAYOUT.metrics.centralTopGap;
  const descendantsTop = centralTop
    + FAMILY_MAP_LAYOUT.metrics.centralCardHeight
    + FAMILY_MAP_LAYOUT.metrics.descendantsTopGap;

  const fatherLayout: ResolvedGroup = {
    ...FAMILY_MAP_LAYOUT.groups.father,
    ...(composedGroups.get('father') as ComposedGroup),
    left: FAMILY_MAP_LAYOUT.groups.father.x,
    top: parentTop,
    height: FAMILY_MAP_LAYOUT.metrics.parentCardHeight,
  };
  const motherLayout: ResolvedGroup = {
    ...FAMILY_MAP_LAYOUT.groups.mother,
    ...(composedGroups.get('mother') as ComposedGroup),
    left: FAMILY_MAP_LAYOUT.groups.mother.x,
    top: parentTop,
    height: FAMILY_MAP_LAYOUT.metrics.parentCardHeight,
  };
  const centralLayout: ResolvedGroup = {
    ...FAMILY_MAP_LAYOUT.groups.central,
    ...(composedGroups.get('central') as ComposedGroup),
    left: FAMILY_MAP_LAYOUT.groups.central.x,
    top: centralTop,
    height: FAMILY_MAP_LAYOUT.metrics.centralCardHeight,
  };
  const spouseLayout: ResolvedGroup | undefined = mainSpouse ? {
    ...FAMILY_MAP_LAYOUT.groups.spouse,
    ...(composedGroups.get('spouse') as ComposedGroup),
    left: FAMILY_MAP_LAYOUT.groups.spouse.x,
    top: descendantsTop,
    height: FAMILY_MAP_LAYOUT.metrics.parentCardHeight,
  } : undefined;

  const paternalUnclesLayout = resolveGroup(
    'paternalUncles',
    composedGroups,
    expandedGroups,
    parentTop,
    FAMILY_MAP_LAYOUT.areas.left,
  );
  const maternalUnclesLayout = resolveGroup(
    'maternalUncles',
    composedGroups,
    expandedGroups,
    parentTop,
    FAMILY_MAP_LAYOUT.areas.right,
  );
  const paternalCousinsLayout = resolveGroup(
    'paternalCousins',
    composedGroups,
    expandedGroups,
    parentTop
      + (paternalUnclesLayout?.height ?? 0)
      + FAMILY_MAP_LAYOUT.metrics.groupGap,
    FAMILY_MAP_LAYOUT.areas.left,
  );
  const maternalCousinsLayout = resolveGroup(
    'maternalCousins',
    composedGroups,
    expandedGroups,
    parentTop
      + (maternalUnclesLayout?.height ?? 0)
      + FAMILY_MAP_LAYOUT.metrics.groupGap,
    FAMILY_MAP_LAYOUT.areas.right,
  );
  const siblingsLayout = resolveGroup(
    'siblings',
    composedGroups,
    expandedGroups,
    descendantsTop,
    FAMILY_MAP_LAYOUT.areas.lowerLeft,
  );
  const nephewsLayout = resolveGroup(
    'nephews',
    composedGroups,
    expandedGroups,
    descendantsTop
      + (siblingsLayout?.height ?? FAMILY_MAP_LAYOUT.metrics.horizontalCardHeight)
      + FAMILY_MAP_LAYOUT.metrics.descendantRowGap,
    FAMILY_MAP_LAYOUT.areas.lowerLeft,
  );
  const rightLowerTop = spouseLayout
    ? spouseLayout.top + spouseLayout.height + FAMILY_MAP_LAYOUT.metrics.groupGap
    : descendantsTop;
  const childrenLayout = resolveGroup(
    'children',
    composedGroups,
    expandedGroups,
    rightLowerTop,
    FAMILY_MAP_LAYOUT.areas.lowerRight,
  );
  const petsLayout = resolveGroup(
    'pets',
    composedGroups,
    expandedGroups,
    rightLowerTop,
    FAMILY_MAP_LAYOUT.areas.lowerMiddle,
  );
  const grandchildrenLayout = resolveGroup(
    'grandchildren',
    composedGroups,
    expandedGroups,
    childrenLayout
      ? childrenLayout.top + childrenLayout.height + FAMILY_MAP_LAYOUT.metrics.groupGap
      : rightLowerTop,
    FAMILY_MAP_LAYOUT.areas.lowerRight,
  );

  const resolvedLayouts = new Map<FamilyMapGroupId, ResolvedGroup>();
  [
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
    fatherLayout,
    centralLayout,
    motherLayout,
    spouseLayout,
  ].forEach((layout) => {
    if (layout) resolvedLayouts.set(layout.id, layout);
  });

  const groupLayouts = RENDERED_GROUP_IDS
    .map((id) => resolvedLayouts.get(id))
    .filter((layout): layout is ResolvedGroup => Boolean(layout?.people.length));
  const contentBottom = Math.max(
    centralLayout.top + centralLayout.height,
    ...groupLayouts.map((layout) => layout.top + layout.height),
    spouseLayout ? spouseLayout.top + spouseLayout.height : 0,
  );
  const canvasHeight = Math.max(
    FAMILY_MAP_LAYOUT.canvas.minHeight,
    contentBottom + FAMILY_MAP_LAYOUT.metrics.groupGap,
  );

  const connectors: Connector[] = [];
  const addConnector = (connector?: Connector) => {
    if (connector) connectors.push(connector);
  };
  const connectAncestorChain = (ids: FamilyMapGroupId[]) => {
    const visibleIds = ids.filter((id) => resolvedLayouts.get(id)?.people.length);
    visibleIds.slice(0, -1).forEach((id, index) => {
      addConnector(verticalConnector(
        resolvedLayouts,
        `${id}-${visibleIds[index + 1]}`,
        id,
        visibleIds[index + 1],
      ));
    });
  };
  connectAncestorChain(PATERNAL_ANCESTOR_IDS);
  connectAncestorChain(MATERNAL_ANCESTOR_IDS);

  const paternalLastAncestor = [...PATERNAL_ANCESTOR_IDS]
    .reverse()
    .find((id) => resolvedLayouts.get(id)?.people.length);
  const maternalLastAncestor = [...MATERNAL_ANCESTOR_IDS]
    .reverse()
    .find((id) => resolvedLayouts.get(id)?.people.length);
  const parentJunctionY = parentTop - FAMILY_MAP_LAYOUT.connectors.junctionGap;
  const centralJunctionY = centralTop - 36;
  const descendantJunctionY = descendantsTop - FAMILY_MAP_LAYOUT.connectors.junctionGap;

  if (paternalLastAncestor && father) {
    addConnector(branchConnector(
      resolvedLayouts,
      'paternal-ancestors-father',
      paternalLastAncestor,
      'father',
      parentJunctionY,
    ));
  }
  if (maternalLastAncestor && mother) {
    addConnector(branchConnector(
      resolvedLayouts,
      'maternal-ancestors-mother',
      maternalLastAncestor,
      'mother',
      parentJunctionY,
    ));
  }
  if (paternalLastAncestor && paternalUnclesLayout) {
    addConnector(branchConnector(
      resolvedLayouts,
      'paternal-ancestors-uncles',
      paternalLastAncestor,
      'paternalUncles',
      parentJunctionY,
    ));
  }
  if (maternalLastAncestor && maternalUnclesLayout) {
    addConnector(branchConnector(
      resolvedLayouts,
      'maternal-ancestors-uncles',
      maternalLastAncestor,
      'maternalUncles',
      parentJunctionY,
    ));
  }
  if (father && central) {
    addConnector(branchConnector(
      resolvedLayouts,
      'father-central',
      'father',
      'central',
      centralJunctionY,
    ));
  }
  if (mother && central) {
    addConnector(branchConnector(
      resolvedLayouts,
      'mother-central',
      'mother',
      'central',
      centralJunctionY,
    ));
  }
  if (paternalUnclesLayout && paternalCousinsLayout) {
    addConnector(verticalConnector(
      resolvedLayouts,
      'paternal-uncles-cousins',
      'paternalUncles',
      'paternalCousins',
    ));
  }
  if (maternalUnclesLayout && maternalCousinsLayout) {
    addConnector(verticalConnector(
      resolvedLayouts,
      'maternal-uncles-cousins',
      'maternalUncles',
      'maternalCousins',
    ));
  }

  const lowerRootIds = [
    siblingsLayout && 'siblings',
    spouseLayout && 'spouse',
    !spouseLayout && childrenLayout && 'children',
    !spouseLayout && petsLayout && 'pets',
    !spouseLayout && !childrenLayout && grandchildrenLayout && 'grandchildren',
  ].filter((id): id is FamilyMapGroupId => Boolean(id));
  if (central && lowerRootIds.length > 0) {
    lowerRootIds.forEach((id) => {
      addConnector(branchConnector(
        resolvedLayouts,
        `central-${id}`,
        'central',
        id,
        descendantJunctionY,
      ));
    });
  }
  if (siblingsLayout && nephewsLayout) {
    addConnector(verticalConnector(
      resolvedLayouts,
      'siblings-nephews',
      'siblings',
      'nephews',
    ));
  }
  if (spouseLayout) {
    const spouseBranchY = spouseLayout.top
      + spouseLayout.height
      + FAMILY_MAP_LAYOUT.metrics.groupGap / 2;
    if (childrenLayout) {
      addConnector(branchConnector(
        resolvedLayouts,
        'spouse-children',
        'spouse',
        'children',
        spouseBranchY,
      ));
    }
    if (petsLayout) {
      addConnector(branchConnector(
        resolvedLayouts,
        'spouse-pets',
        'spouse',
        'pets',
        spouseBranchY,
      ));
    }
    if (!childrenLayout && grandchildrenLayout) {
      addConnector(branchConnector(
        resolvedLayouts,
        'spouse-grandchildren',
        'spouse',
        'grandchildren',
        spouseBranchY,
      ));
    }
  }
  if (childrenLayout && grandchildrenLayout) {
    addConnector(verticalConnector(
      resolvedLayouts,
      'children-grandchildren',
      'children',
      'grandchildren',
    ));
  }

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const updateScale = () => {
      const widthScale = viewport.clientWidth / FAMILY_MAP_LAYOUT.canvas.width;
      const heightScale = viewport.clientHeight / FAMILY_MAP_LAYOUT.canvas.minHeight;
      setResponsiveScale(Math.min(
        1,
        Math.max(
          FAMILY_MAP_LAYOUT.canvas.minScale,
          Math.min(widthScale, heightScale),
        ),
      ));
    };
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    updateScale();
    return () => observer.disconnect();
  }, [canvasHeight, layoutRevision]);

  React.useEffect(() => {
    setManualZoom(1);
  }, [centralPersonId, layoutRevision]);

  const handleWheel = React.useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setManualZoom((currentZoom) => {
      const nextZoom = currentZoom + direction * FAMILY_MAP_LAYOUT.canvas.zoomStep;
      return Math.min(
        FAMILY_MAP_LAYOUT.canvas.maxZoom,
        Math.max(
          FAMILY_MAP_LAYOUT.canvas.minZoom,
          Number(nextZoom.toFixed(2)),
        ),
      );
    });
  }, []);

  const collateralSpouseCount = React.useMemo(() => collectCollateralSpouses(
    [
      paternal.uncles,
      paternal.cousins,
      maternal.uncles,
      maternal.cousins,
      nephews,
      children,
      grandchildren,
    ],
    spousesByPerson,
    isVisible,
    excludedSpouseIds,
  ), [
    children,
    excludedSpouseIds,
    grandchildren,
    isVisible,
    maternal.cousins,
    maternal.uncles,
    nephews,
    paternal.cousins,
    paternal.uncles,
    spousesByPerson,
  ]);

  React.useEffect(() => {
    if (!onDirectRelationRenderedCounts) return;
    onDirectRelationRenderedCounts({
      ...EMPTY_COUNTS,
      pais: Number(Boolean(father)) + Number(Boolean(mother)),
      avos: paternal.grandparents.length + maternal.grandparents.length,
      bisavos: paternal.greatGrandparents.length + maternal.greatGrandparents.length,
      tataravos: paternal.greatGreatGrandparents.length + maternal.greatGreatGrandparents.length,
      conjuge: collateralSpouseCount,
      filhos: children.length,
      netos: grandchildren.length,
      irmaos: siblings.length,
      sobrinhos: nephews.length,
      tios: paternal.uncles.length + maternal.uncles.length,
      primos: paternal.cousins.length + maternal.cousins.length,
      pets: pets.length,
    });
  }, [
    children.length,
    collateralSpouseCount,
    father,
    grandchildren.length,
    maternal,
    mother,
    nephews.length,
    onDirectRelationRenderedCounts,
    paternal,
    pets.length,
    siblings.length,
  ]);

  const effectiveScale = responsiveScale * manualZoom;

  return (
    <div
      ref={viewportRef}
      onWheel={handleWheel}
      className="absolute inset-x-0 bottom-0 top-0 isolate overflow-auto overscroll-contain pt-[76px]"
      style={{ backgroundColor: FAMILY_MAP_LAYOUT.canvas.background }}
    >
      <div
        className="relative z-10 mx-auto"
        style={{
          width: FAMILY_MAP_LAYOUT.canvas.width * effectiveScale,
          height: canvasHeight * effectiveScale,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: FAMILY_MAP_LAYOUT.canvas.width,
            height: canvasHeight,
            transform: `scale(${effectiveScale})`,
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox={`0 0 ${FAMILY_MAP_LAYOUT.canvas.width} ${canvasHeight}`}
            aria-hidden="true"
          >
            <g
              fill="none"
              stroke={FAMILY_MAP_LAYOUT.connectors.color}
              strokeWidth={FAMILY_MAP_LAYOUT.connectors.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {connectors.map((connector) => (
                <path key={connector.id} d={connectorPath(connector.points)} />
              ))}
            </g>
          </svg>

          {groupLayouts.map((layout) => (
            <PositionedGroup
              key={layout.id}
              layout={layout}
              expanded={expandedGroups.has(layout.id)}
              onExpandedChange={handleExpandedChange}
              onPersonClick={onPersonClick}
            />
          ))}

          {directRelativeFilters.pais && (
            <>
              <DirectPersonCard
                layout={fatherLayout}
                person={father}
                emptyLabel="Pai"
                onPersonClick={onPersonClick}
              />
              <DirectPersonCard
                layout={motherLayout}
                person={mother}
                emptyLabel="Mãe"
                onPersonClick={onPersonClick}
              />
            </>
          )}
          {central && (
            <DirectPersonCard
              layout={centralLayout}
              person={central}
              central
              onPersonClick={onPersonClick}
            />
          )}
          {mainSpouse && spouseLayout && (
            <DirectPersonCard
              layout={spouseLayout}
              person={mainSpouse}
              tone="spouse"
              onPersonClick={onPersonClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}

