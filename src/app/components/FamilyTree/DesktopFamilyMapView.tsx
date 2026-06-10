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

type MapGroupProps = {
  id: string;
  title: string;
  people: Pessoa[];
  left: number;
  top: number;
  width: number;
  columns?: 'single' | 'double' | 'triple' | 'quad';
  variant?: 'mini' | 'compact' | 'horizontal';
  onPersonClick: (pessoa: Pessoa) => void;
  expanded: boolean;
  onExpandedChange: (id: string, expanded: boolean) => void;
  zIndex?: number;
  collapsedLimit?: number;
  spouseTone?: 'spouse' | 'ancestorSpouse';
  spousesByPerson: Map<string, Pessoa[]>;
  showSpouseConnectors: boolean;
};

type GroupLayout = {
  id: string;
  title: string;
  people: Pessoa[];
  left: number;
  top: number;
  width: number;
  height: number;
  columns?: 'single' | 'double' | 'triple' | 'quad';
  variant?: 'mini' | 'compact' | 'horizontal';
  collapsedLimit?: number;
};

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 1020;
const CONNECTOR_COLOR = '#7ddce8';
const MIN_TABLET_SCALE = 0.62;
const GROUP_VERTICAL_GAP = 46;
const TOP_START = 18;
const HORIZONTAL_CARD_HEIGHT = 74;
const MINI_CARD_HEIGHT = 112;
const GROUP_VERTICAL_PADDING = 44;
const GROUP_GRID_GAP = 8;
const COLLAPSED_LIMIT = 2;
const SIDE_BRANCH_COLLAPSED_LIMIT = 8;
const SIDE_BRANCH_WIDTH = 660;
const SIDE_BRANCH_SINGLE_WIDTH = 300;
const SIBLINGS_GROUP_WIDTH = 360;
const PATERNAL_BRANCH_INNER_EDGE = 334;
const MATERNAL_BRANCH_LEFT = 1106;
const ANCESTOR_COLLAPSED_LIMIT = 4;
const FATHER_TOP_OFFSET = 50;
const PARENT_CARD_HEIGHT = 164;
const CENTRAL_CARD_HEIGHT = 194;

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

function getRows(
  count: number,
  columns: 'single' | 'double' | 'triple' | 'quad',
  expanded: boolean,
  collapsedLimit = COLLAPSED_LIMIT,
) {
  const visibleCount = expanded ? count : Math.min(count, collapsedLimit);
  const columnCount = columns === 'quad' ? 4 : columns === 'triple' ? 3 : columns === 'double' ? 2 : 1;
  return Math.max(1, Math.ceil(visibleCount / columnCount));
}

function getGroupHeight({
  people,
  columns = 'double',
  variant = 'mini',
  expanded,
  collapsedLimit = COLLAPSED_LIMIT,
}: {
  people: Pessoa[];
  columns?: 'single' | 'double' | 'triple' | 'quad';
  variant?: 'mini' | 'compact' | 'horizontal';
  expanded: boolean;
  collapsedLimit?: number;
}) {
  const cardHeight = variant === 'horizontal' ? HORIZONTAL_CARD_HEIGHT : MINI_CARD_HEIGHT;
  const rows = getRows(people.length, columns, expanded, collapsedLimit);
  return GROUP_VERTICAL_PADDING + rows * cardHeight + Math.max(0, rows - 1) * GROUP_GRID_GAP;
}

function getGroupWidth({
  people,
  columns = 'double',
  variant = 'mini',
  baseWidth,
}: {
  people: Pessoa[];
  columns?: 'single' | 'double' | 'triple' | 'quad';
  variant?: 'mini' | 'compact' | 'horizontal';
  baseWidth: number;
}) {
  if (people.length !== 1) return baseWidth;
  if (variant === 'horizontal') return Math.min(baseWidth, 260);
  if (columns === 'single') return Math.min(baseWidth, 220);
  return Math.min(baseWidth, 220);
}

function centeredLeft(baseLeft: number, baseWidth: number, width: number) {
  return baseLeft + (baseWidth - width) / 2;
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

function interleaveSpouses(
  people: Pessoa[],
  spousesByPerson: Map<string, Pessoa[]>,
  isVisible: (person: Pessoa | undefined) => person is Pessoa,
  options: { enabled: boolean; excludedIds?: Set<string> },
) {
  if (!options.enabled) return people;

  const excludedIds = options.excludedIds ?? new Set<string>();
  const result: Pessoa[] = [];
  const seen = new Set<string>();

  const addPerson = (person: Pessoa) => {
    if (seen.has(person.id) || excludedIds.has(person.id) || !isVisible(person)) return;
    seen.add(person.id);
    result.push(person);
  };

  people.forEach((person) => {
    addPerson(person);
    (spousesByPerson.get(person.id) ?? []).forEach(addPerson);
  });

  return result;
}

function collectCollateralSpouses(
  people: Pessoa[],
  spousesByPerson: Map<string, Pessoa[]>,
  isVisible: (person: Pessoa | undefined) => person is Pessoa,
  excludedIds: Set<string>,
) {
  const result: Pessoa[] = [];
  const seen = new Set<string>();

  people.forEach((person) => {
    (spousesByPerson.get(person.id) ?? []).forEach((spouse) => {
      if (seen.has(spouse.id) || excludedIds.has(spouse.id) || !isVisible(spouse)) return;
      seen.add(spouse.id);
      result.push(spouse);
    });
  });

  return result;
}


function getSpouseConnectorIds(
  people: Pessoa[],
  spousesByPerson: Map<string, Pessoa[]>,
  enabled: boolean,
) {
  if (!enabled) return undefined;
  const spouseIds = new Set<string>();

  people.forEach((person, index) => {
    if (index === 0) return;
    const previousPerson = people[index - 1];
    const isPreviousSpouse = (spousesByPerson.get(previousPerson.id) ?? []).some(
      (spouse) => spouse.id === person.id,
    );
    if (isPreviousSpouse) spouseIds.add(person.id);
  });

  return spouseIds;
}

function PositionedGroup({
  id,
  title,
  people,
  left,
  top,
  width,
  columns = 'double',
  variant = 'mini',
  onPersonClick,
  expanded,
  onExpandedChange,
  zIndex = 10,
  collapsedLimit = COLLAPSED_LIMIT,
  spouseTone = 'spouse',
  spousesByPerson,
  showSpouseConnectors,
}: MapGroupProps) {
  if (people.length === 0) return null;

  return (
    <div className="absolute min-h-0" style={{ left, top, width, zIndex }}>
      <VisualGroup
        title={title}
        people={people}
        columns={columns}
        variant={variant}
        titleVariant="pill"
        expandable
        collapsedLimit={collapsedLimit}
        expanded={expanded}
        onExpandedChange={(nextExpanded) => onExpandedChange(id, nextExpanded)}
        disableInternalScroll
        spousePersonIds={getSpouseConnectorIds(people, spousesByPerson, showSpouseConnectors)}
        spouseTone={spouseTone}
        onPersonClick={onPersonClick}
      />
    </div>
  );
}

function connectorPath(points: Array<[number, number]>) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

function centerX(layout: { left: number; width: number }) {
  return layout.left + layout.width / 2;
}

function bottomY(layout: { top: number; height: number }) {
  return layout.top + layout.height;
}

function buildAncestorLayouts({
  side,
  branch,
  expandedGroups,
}: {
  side: 'paternal' | 'maternal';
  branch: MobileFamilyBranch;
  expandedGroups: Set<string>;
}): GroupLayout[] {
  const ANCESTOR_GROUP_WIDTH = 430;
  const left = side === 'paternal' ? 265 : 745;
  const rows: Array<Omit<GroupLayout, 'left' | 'top' | 'width' | 'height'> & { expanded: boolean }> = [
    {
      id: `${side}-great-great-grandparents`,
      title: side === 'paternal' ? 'Tataravós Paternos' : 'Tataravós Maternos',
      people: branch.greatGreatGrandparents,
      columns: 'double',
      variant: 'horizontal',
      expanded: expandedGroups.has(`${side}-great-great-grandparents`),
    },
    {
      id: `${side}-great-grandparents`,
      title: side === 'paternal' ? 'Bisavós Paternos' : 'Bisavós Maternos',
      people: branch.greatGrandparents,
      columns: 'double',
      variant: 'horizontal',
      expanded: expandedGroups.has(`${side}-great-grandparents`),
    },
    {
      id: `${side}-grandparents`,
      title: side === 'paternal' ? 'Avós Paternos' : 'Avós Maternos',
      people: branch.grandparents,
      columns: 'double',
      variant: 'horizontal',
      expanded: expandedGroups.has(`${side}-grandparents`),
    },
  ].filter((row) => row.people.length > 0);

  let top = TOP_START;
  return rows.map((row) => {
    const height = getGroupHeight({
      people: row.people,
      columns: row.columns,
      variant: row.variant,
      expanded: row.expanded,
      collapsedLimit: ANCESTOR_COLLAPSED_LIMIT,
    });
    const layout: GroupLayout = {
      id: row.id,
      title: row.title,
      people: row.people,
      left,
      top,
      width: ANCESTOR_GROUP_WIDTH,
      height,
      columns: row.columns,
      variant: row.variant,
      collapsedLimit: ANCESTOR_COLLAPSED_LIMIT,
    };
    top += height + GROUP_VERTICAL_GAP;
    return layout;
  });
}

function findLayout(layouts: GroupLayout[], id: string) {
  return layouts.find((layout) => layout.id === id);
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
  const [scale, setScale] = React.useState(1);
  const [expandedGroups, handleExpandedChange] = useExpandedGroups();
  const model = React.useMemo(
    () => buildMobileFamilyTreeModel(pessoas, relacionamentos, centralPersonId),
    [centralPersonId, pessoas, relacionamentos],
  );
  const isVisible = React.useCallback(
    (person: Pessoa | undefined, preserveCentral = false): person is Pessoa => Boolean(
      person && (preserveCentral || !visiblePersonIds || visiblePersonIds.has(person.id))
    ),
    [visiblePersonIds],
  );
  const filterVisible = React.useCallback(
    (people: Pessoa[]) => people.filter((person) => isVisible(person)),
    [isVisible],
  );
  const spousesByPerson = React.useMemo(
    () => buildSpousesByPerson(pessoas, relacionamentos),
    [pessoas, relacionamentos],
  );
  const filterGroup = React.useCallback(
    (people: Pessoa[], group: DirectRelativeGroup) => (
      directRelativeFilters[group] ? filterVisible(people) : []
    ),
    [directRelativeFilters, filterVisible],
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
  const spouses = filterVisible(model.spouses);
  const siblings = filterGroup(model.siblings, 'irmaos');
  const nephews = filterGroup(model.nephews, 'sobrinhos');
  const children = filterGroup(model.children, 'filhos');
  const pets = filterGroup(model.pets, 'pets');
  const grandchildren = filterGroup(model.grandchildren, 'netos');
  const collateralSpouseExcludedIds = React.useMemo(() => new Set([
    centralPersonId,
    ...spouses.map((person) => person.id),
  ]), [centralPersonId, spouses]);
  const withCollateralSpouses = React.useCallback((people: Pessoa[]) => interleaveSpouses(
    people,
    spousesByPerson,
    isVisible,
    { enabled: directRelativeFilters.conjuge, excludedIds: collateralSpouseExcludedIds },
  ), [collateralSpouseExcludedIds, directRelativeFilters.conjuge, isVisible, spousesByPerson]);
  const withAncestorSpouses = React.useCallback((people: Pessoa[]) => interleaveSpouses(
    people,
    spousesByPerson,
    isVisible,
    { enabled: true, excludedIds: collateralSpouseExcludedIds },
  ), [collateralSpouseExcludedIds, isVisible, spousesByPerson]);
  const collateralSpouses = React.useMemo(() => collectCollateralSpouses([
    ...paternal.uncles,
    ...paternal.cousins,
    ...maternal.uncles,
    ...maternal.cousins,
    ...nephews,
    ...children,
    ...grandchildren,
  ], spousesByPerson, isVisible, collateralSpouseExcludedIds), [
    children,
    collateralSpouseExcludedIds,
    grandchildren,
    isVisible,
    maternal.cousins,
    maternal.uncles,
    nephews,
    paternal.cousins,
    paternal.uncles,
    spousesByPerson,
  ]);
  const nephewsWithSpouses = React.useMemo(
    () => withCollateralSpouses(nephews),
    [nephews, withCollateralSpouses],
  );
  const childrenWithSpouses = React.useMemo(
    () => withCollateralSpouses(children),
    [children, withCollateralSpouses],
  );
  const grandchildrenWithSpouses = React.useMemo(
    () => withCollateralSpouses(grandchildren),
    [grandchildren, withCollateralSpouses],
  );
  const paternalMap = React.useMemo<MobileFamilyBranch>(() => ({
    parent: paternal.parent,
    grandparents: withAncestorSpouses(paternal.grandparents),
    greatGrandparents: withAncestorSpouses(paternal.greatGrandparents),
    greatGreatGrandparents: withAncestorSpouses(paternal.greatGreatGrandparents),
    uncles: withCollateralSpouses(paternal.uncles),
    cousins: withCollateralSpouses(paternal.cousins),
  }), [paternal, withAncestorSpouses, withCollateralSpouses]);
  const maternalMap = React.useMemo<MobileFamilyBranch>(() => ({
    parent: maternal.parent,
    grandparents: withAncestorSpouses(maternal.grandparents),
    greatGrandparents: withAncestorSpouses(maternal.greatGrandparents),
    greatGreatGrandparents: withAncestorSpouses(maternal.greatGreatGrandparents),
    uncles: withCollateralSpouses(maternal.uncles),
    cousins: withCollateralSpouses(maternal.cousins),
  }), [maternal, withAncestorSpouses, withCollateralSpouses]);

  const paternalUncles = React.useMemo(
    () => paternalMap.uncles,
    [paternalMap.uncles],
  );
  const paternalCousins = React.useMemo(
    () => paternalMap.cousins,
    [paternalMap.cousins],
  );
  const maternalUncles = React.useMemo(
    () => maternalMap.uncles,
    [maternalMap.uncles],
  );
  const maternalCousins = React.useMemo(
    () => maternalMap.cousins,
    [maternalMap.cousins],
  );

  const paternalAncestors = React.useMemo(
    () => buildAncestorLayouts({ side: 'paternal', branch: paternalMap, expandedGroups }),
    [expandedGroups, paternalMap],
  );
  const maternalAncestors = React.useMemo(
    () => buildAncestorLayouts({ side: 'maternal', branch: maternalMap, expandedGroups }),
    [expandedGroups, maternalMap],
  );

  const maxAncestorBottom = Math.max(
    ...paternalAncestors.map(bottomY),
    ...maternalAncestors.map(bottomY),
    TOP_START + HORIZONTAL_CARD_HEIGHT,
  );
  const parentTop = maxAncestorBottom + FATHER_TOP_OFFSET;
  const parentJunctionY = parentTop - 18;
  const parentBottomY = parentTop + PARENT_CARD_HEIGHT;
  const centralTop = parentBottomY + 54;
  const centralBottomY = centralTop + CENTRAL_CARD_HEIGHT;
  const descendantsTop = centralBottomY + 52;

  const paternalUnclesHeight = getGroupHeight({
    people: paternalUncles,
    columns: 'quad',
    variant: 'mini',
    expanded: expandedGroups.has('paternal-uncles'),
    collapsedLimit: SIDE_BRANCH_COLLAPSED_LIMIT,
  });
  const maternalUnclesHeight = getGroupHeight({
    people: maternalUncles,
    columns: 'quad',
    variant: 'mini',
    expanded: expandedGroups.has('maternal-uncles'),
    collapsedLimit: SIDE_BRANCH_COLLAPSED_LIMIT,
  });
  const paternalCousinsTop = parentTop + paternalUnclesHeight + GROUP_VERTICAL_GAP;
  const maternalCousinsTop = parentTop + maternalUnclesHeight + GROUP_VERTICAL_GAP;

  const descendantGroupTopRow = descendantsTop;
  const leftDescendantSecondRow = descendantsTop + 144;
  const branchWidth = SIDE_BRANCH_WIDTH;
  const branchLeft = PATERNAL_BRANCH_INNER_EDGE - SIDE_BRANCH_WIDTH;
  const branchRight = MATERNAL_BRANCH_LEFT;
  const descendantColumnWidth = 300;
  const petColumnWidth = 180;
  const siblingsWidth = getGroupWidth({ people: siblings, columns: 'double', variant: 'horizontal', baseWidth: SIBLINGS_GROUP_WIDTH });

  const spouse = spouses[0];
  const spouseCardLayout = spouse ? {
    left: 720,
    top: descendantGroupTopRow,
    width: 210,
    height: PARENT_CARD_HEIGHT,
  } : undefined;
  const rightDescendantSecondRow = spouseCardLayout
    ? bottomY(spouseCardLayout) + GROUP_VERTICAL_GAP
    : descendantsTop;
  const childrenHeight = getGroupHeight({
    people: childrenWithSpouses,
    columns: 'double',
    variant: 'horizontal',
    expanded: expandedGroups.has('children'),
  });
  const childrenWidth = getGroupWidth({
    people: childrenWithSpouses,
    columns: 'double',
    variant: 'horizontal',
    baseWidth: descendantColumnWidth,
  });
  const grandchildrenTop = childrenWithSpouses.length > 0
    ? rightDescendantSecondRow + childrenHeight + GROUP_VERTICAL_GAP
    : rightDescendantSecondRow;

  const descendantLayouts: GroupLayout[] = [
    {
      id: 'siblings',
      title: 'Irmãos',
      people: siblings,
      left: centeredLeft(340, SIBLINGS_GROUP_WIDTH, siblingsWidth),
      top: descendantGroupTopRow,
      width: siblingsWidth,
      height: getGroupHeight({ people: siblings, columns: 'double', variant: 'horizontal', expanded: expandedGroups.has('siblings') }),
      columns: 'double',
      variant: 'horizontal',
    },
    {
      id: 'children',
      title: 'Filhos',
      people: childrenWithSpouses,
      left: centeredLeft(940, descendantColumnWidth, childrenWidth),
      top: rightDescendantSecondRow,
      width: childrenWidth,
      height: childrenHeight,
      columns: 'double',
      variant: 'horizontal',
    },
    {
      id: 'nephews',
      title: 'Sobrinhos',
      people: nephewsWithSpouses,
      left: centeredLeft(340, descendantColumnWidth, getGroupWidth({ people: nephewsWithSpouses, columns: 'double', variant: 'mini', baseWidth: descendantColumnWidth })),
      top: leftDescendantSecondRow,
      width: getGroupWidth({ people: nephewsWithSpouses, columns: 'double', variant: 'mini', baseWidth: descendantColumnWidth }),
      height: getGroupHeight({ people: nephewsWithSpouses, columns: 'double', variant: 'mini', expanded: expandedGroups.has('nephews') }),
      columns: 'double',
      variant: 'mini',
    },
    {
      id: 'pets',
      title: 'Pets',
      people: pets,
      left: centeredLeft(665, petColumnWidth, getGroupWidth({ people: pets, columns: 'single', variant: 'mini', baseWidth: petColumnWidth })),
      top: rightDescendantSecondRow,
      width: getGroupWidth({ people: pets, columns: 'single', variant: 'mini', baseWidth: petColumnWidth }),
      height: getGroupHeight({ people: pets, columns: 'single', variant: 'mini', expanded: expandedGroups.has('pets') }),
      columns: 'single',
      variant: 'mini',
    },
    {
      id: 'grandchildren',
      title: 'Netos',
      people: grandchildrenWithSpouses,
      left: centeredLeft(940, descendantColumnWidth, getGroupWidth({ people: grandchildrenWithSpouses, columns: 'double', variant: 'mini', baseWidth: descendantColumnWidth })),
      top: grandchildrenTop,
      width: getGroupWidth({ people: grandchildrenWithSpouses, columns: 'double', variant: 'mini', baseWidth: descendantColumnWidth }),
      height: getGroupHeight({ people: grandchildrenWithSpouses, columns: 'double', variant: 'mini', expanded: expandedGroups.has('grandchildren') }),
      columns: 'double',
      variant: 'mini',
    },
  ];

  const renderedDescendantLayouts = descendantLayouts.filter((layout) => layout.people.length > 0);
  const leftDescendantLayouts = renderedDescendantLayouts.filter((layout) => (
    layout.id === 'siblings' || layout.id === 'nephews'
  ));
  const childrenLayout = renderedDescendantLayouts.find((layout) => layout.id === 'children');
  const petsLayout = renderedDescendantLayouts.find((layout) => layout.id === 'pets');
  const grandchildrenLayout = renderedDescendantLayouts.find((layout) => layout.id === 'grandchildren');
  const rightLowerDescendantLayouts = renderedDescendantLayouts.filter((layout) => (
    layout.id === 'children' || layout.id === 'pets' || layout.id === 'grandchildren'
  ));
  const rightDescendantLayouts = [
    ...(spouseCardLayout ? [spouseCardLayout] : []),
    ...rightLowerDescendantLayouts,
  ];
  const contentBottom = Math.max(
    centralBottomY,
    spouseCardLayout ? bottomY(spouseCardLayout) : 0,
    paternalCousins.length > 0 ? paternalCousinsTop + getGroupHeight({ people: paternalCousins, columns: 'quad', variant: 'mini', expanded: expandedGroups.has('paternal-cousins'), collapsedLimit: SIDE_BRANCH_COLLAPSED_LIMIT }) : 0,
    maternalCousins.length > 0 ? maternalCousinsTop + getGroupHeight({ people: maternalCousins, columns: 'quad', variant: 'mini', expanded: expandedGroups.has('maternal-cousins'), collapsedLimit: SIDE_BRANCH_COLLAPSED_LIMIT }) : 0,
    ...renderedDescendantLayouts.map(bottomY),
  );
  const canvasHeight = Math.max(CANVAS_HEIGHT, contentBottom + 52);

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const updateScale = () => {
      const widthScale = viewport.clientWidth / CANVAS_WIDTH;
      const heightScale = viewport.clientHeight / CANVAS_HEIGHT;
      setScale(Math.min(1, Math.max(MIN_TABLET_SCALE, Math.min(widthScale, heightScale))));
    };
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    updateScale();

    return () => observer.disconnect();
  }, [layoutRevision, canvasHeight]);

  React.useEffect(() => {
    if (!onDirectRelationRenderedCounts) return;

    onDirectRelationRenderedCounts({
      ...EMPTY_COUNTS,
      pais: Number(Boolean(father)) + Number(Boolean(mother)),
      avos: paternal.grandparents.length + maternal.grandparents.length,
      bisavos: paternal.greatGrandparents.length + maternal.greatGrandparents.length,
      tataravos: paternal.greatGreatGrandparents.length + maternal.greatGreatGrandparents.length,
      conjuge: collateralSpouses.length,
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
    father,
    grandchildren.length,
    maternal,
    mother,
    nephews.length,
    onDirectRelationRenderedCounts,
    paternal,
    pets.length,
    siblings.length,
    collateralSpouses.length,
  ]);

  const hasCentralDescendants = leftDescendantLayouts.length > 0 || rightDescendantLayouts.length > 0;
  const paternalGrandparents = findLayout(paternalAncestors, 'paternal-grandparents');
  const maternalGrandparents = findLayout(maternalAncestors, 'maternal-grandparents');
  const fatherCenterX = 480;
  const motherCenterX = 960;
  const centralCenterX = 720;
  const centralBranchY = centralTop - 36;
  const descendantsJunctionY = descendantsTop - 18;
  const leftDescendantBranchX = leftDescendantLayouts.length > 0
    ? centerX(leftDescendantLayouts[0])
    : centralCenterX;
  const rightDescendantBranchX = rightDescendantLayouts.length > 0
    ? centerX(rightDescendantLayouts[0])
    : centralCenterX;
  const getSideBranchWidth = (people: Pessoa[]) => (people.length === 1 ? SIDE_BRANCH_SINGLE_WIDTH : branchWidth);
  const paternalUnclesWidth = getSideBranchWidth(paternalUncles);
  const maternalUnclesWidth = getSideBranchWidth(maternalUncles);
  const paternalCousinsWidth = getSideBranchWidth(paternalCousins);
  const maternalCousinsWidth = getSideBranchWidth(maternalCousins);
  const unclesPaternal = {
    left: centeredLeft(branchLeft, branchWidth, paternalUnclesWidth),
    top: parentTop,
    width: paternalUnclesWidth,
    height: paternalUnclesHeight,
  };
  const unclesMaternal = {
    left: centeredLeft(branchRight, branchWidth, maternalUnclesWidth),
    top: parentTop,
    width: maternalUnclesWidth,
    height: maternalUnclesHeight,
  };
  const cousinsPaternal = {
    left: centeredLeft(branchLeft, branchWidth, paternalCousinsWidth),
    top: paternalCousinsTop,
    width: paternalCousinsWidth,
    height: getGroupHeight({ people: paternalCousins, columns: 'quad', variant: 'mini', expanded: expandedGroups.has('paternal-cousins'), collapsedLimit: SIDE_BRANCH_COLLAPSED_LIMIT }),
  };
  const cousinsMaternal = {
    left: centeredLeft(branchRight, branchWidth, maternalCousinsWidth),
    top: maternalCousinsTop,
    width: maternalCousinsWidth,
    height: getGroupHeight({ people: maternalCousins, columns: 'quad', variant: 'mini', expanded: expandedGroups.has('maternal-cousins'), collapsedLimit: SIDE_BRANCH_COLLAPSED_LIMIT }),
  };

  return (
    <div
      ref={viewportRef}
      className="absolute inset-x-0 bottom-0 top-[76px] isolate overflow-auto overscroll-contain bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_38%,#f8fafc_100%)] before:pointer-events-none before:absolute before:inset-x-0 before:-top-[76px] before:z-0 before:h-[76px] before:bg-[#ecfeff]"
    >
      <div
        className="relative z-10 mx-auto"
        style={{ width: CANVAS_WIDTH * scale, height: canvasHeight * scale }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: CANVAS_WIDTH,
            height: canvasHeight,
            transform: `scale(${scale})`,
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox={`0 0 ${CANVAS_WIDTH} ${canvasHeight}`}
            aria-hidden="true"
          >
            <g fill="none" stroke={CONNECTOR_COLOR} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {[paternalAncestors, maternalAncestors].map((layouts) => layouts.map((layout, index) => {
                const nextLayout = layouts[index + 1];
                if (!nextLayout) return null;
                const x = centerX(layout);
                return <path key={`${layout.id}-${nextLayout.id}`} d={connectorPath([[x, bottomY(layout)], [x, nextLayout.top]])} />;
              }))}
              {paternalGrandparents && father && (
                <path d={connectorPath([[centerX(paternalGrandparents), bottomY(paternalGrandparents)], [centerX(paternalGrandparents), parentJunctionY], [fatherCenterX, parentJunctionY], [fatherCenterX, parentTop]])} />
              )}
              {maternalGrandparents && mother && (
                <path d={connectorPath([[centerX(maternalGrandparents), bottomY(maternalGrandparents)], [centerX(maternalGrandparents), parentJunctionY], [motherCenterX, parentJunctionY], [motherCenterX, parentTop]])} />
              )}
              {paternalGrandparents && paternalUncles.length > 0 && (
                <path d={connectorPath([[centerX(paternalGrandparents), parentJunctionY], [centerX(unclesPaternal), parentJunctionY], [centerX(unclesPaternal), parentTop]])} />
              )}
              {maternalGrandparents && maternalUncles.length > 0 && (
                <path d={connectorPath([[centerX(maternalGrandparents), parentJunctionY], [centerX(unclesMaternal), parentJunctionY], [centerX(unclesMaternal), parentTop]])} />
              )}
              {father && central && (
                <path d={connectorPath([[fatherCenterX, parentBottomY], [fatherCenterX, centralBranchY], [centralCenterX, centralBranchY]])} />
              )}
              {mother && central && (
                <path d={connectorPath([[motherCenterX, parentBottomY], [motherCenterX, centralBranchY], [centralCenterX, centralBranchY]])} />
              )}
              {central && (
                <path d={connectorPath([[centralCenterX, centralBranchY], [centralCenterX, centralTop - 12]])} />
              )}
              {paternalUncles.length > 0 && paternalCousins.length > 0 && (
                <path d={connectorPath([[centerX(unclesPaternal), bottomY(unclesPaternal)], [centerX(cousinsPaternal), cousinsPaternal.top]])} />
              )}
              {maternalUncles.length > 0 && maternalCousins.length > 0 && (
                <path d={connectorPath([[centerX(unclesMaternal), bottomY(unclesMaternal)], [centerX(cousinsMaternal), cousinsMaternal.top]])} />
              )}
              {central && hasCentralDescendants && (
                <path d={connectorPath([[centralCenterX, centralBottomY], [centralCenterX, descendantsJunctionY]])} />
              )}
              {central && leftDescendantLayouts.length > 0 && (
                <path d={connectorPath([[centralCenterX, descendantsJunctionY], [leftDescendantBranchX, descendantsJunctionY]])} />
              )}
              {central && spouseCardLayout && (
                <path d={connectorPath([[centralCenterX, descendantsJunctionY], [centerX(spouseCardLayout), descendantsJunctionY], [centerX(spouseCardLayout), spouseCardLayout.top]])} />
              )}
              {central && !spouseCardLayout && rightLowerDescendantLayouts.length > 0 && (
                <path d={connectorPath([[centralCenterX, descendantsJunctionY], [rightDescendantBranchX, descendantsJunctionY]])} />
              )}
              {central && leftDescendantLayouts.map((layout) => (
                <path
                  key={`left-descendant-${layout.id}`}
                  d={connectorPath([[leftDescendantBranchX, descendantsJunctionY], [leftDescendantBranchX, layout.top]])}
                />
              ))}
              {central && !spouseCardLayout && rightLowerDescendantLayouts.map((layout) => (
                <path
                  key={`right-descendant-${layout.id}`}
                  d={connectorPath([[rightDescendantBranchX, descendantsJunctionY], [rightDescendantBranchX, layout.top], [centerX(layout), layout.top]])}
                />
              ))}
              {central && spouseCardLayout && rightLowerDescendantLayouts.length > 0 && (() => {
                const spouseCenterX = centerX(spouseCardLayout);
                const spouseLowerJunctionY = bottomY(spouseCardLayout) + GROUP_VERTICAL_GAP / 2;
                const branchTargets = [petsLayout, childrenLayout].filter(Boolean) as GroupLayout[];
                const firstTarget = branchTargets[0] ?? grandchildrenLayout;
                if (!firstTarget) return null;

                return (
                  <>
                    <path d={connectorPath([[spouseCenterX, bottomY(spouseCardLayout)], [spouseCenterX, spouseLowerJunctionY]])} />
                    {branchTargets.map((layout) => (
                      <path
                        key={`spouse-branch-${layout.id}`}
                        d={connectorPath([[spouseCenterX, spouseLowerJunctionY], [centerX(layout), spouseLowerJunctionY], [centerX(layout), layout.top]])}
                      />
                    ))}
                    {grandchildrenLayout && childrenLayout && (
                      <path d={connectorPath([[centerX(childrenLayout), bottomY(childrenLayout)], [centerX(childrenLayout), grandchildrenLayout.top]])} />
                    )}
                    {grandchildrenLayout && !childrenLayout && (
                      <path d={connectorPath([[spouseCenterX, spouseLowerJunctionY], [centerX(grandchildrenLayout), spouseLowerJunctionY], [centerX(grandchildrenLayout), grandchildrenLayout.top]])} />
                    )}
                  </>
                );
              })()}
            </g>
          </svg>

          {paternalAncestors.map((layout) => (
            <PositionedGroup key={layout.id} {...layout} expanded={expandedGroups.has(layout.id)} onExpandedChange={handleExpandedChange} spousesByPerson={spousesByPerson} showSpouseConnectors spouseTone="ancestorSpouse" onPersonClick={onPersonClick} />
          ))}
          {maternalAncestors.map((layout) => (
            <PositionedGroup key={layout.id} {...layout} expanded={expandedGroups.has(layout.id)} onExpandedChange={handleExpandedChange} spousesByPerson={spousesByPerson} showSpouseConnectors spouseTone="ancestorSpouse" onPersonClick={onPersonClick} />
          ))}

          <PositionedGroup id="paternal-uncles" title="Tios Paternos" people={paternalUncles} left={unclesPaternal.left} top={parentTop} width={unclesPaternal.width} columns="quad" collapsedLimit={SIDE_BRANCH_COLLAPSED_LIMIT} expanded={expandedGroups.has('paternal-uncles')} onExpandedChange={handleExpandedChange} spousesByPerson={spousesByPerson} showSpouseConnectors={directRelativeFilters.conjuge} onPersonClick={onPersonClick} />
          <div className="absolute z-10 w-[210px]" style={{ left: 375, top: parentTop }}>
            {directRelativeFilters.pais && (
              father
                ? <VisualPersonCard person={father} label="Pai" vitalMode="full" onClick={onPersonClick} />
                : <VisualEmptyCard label="Pai" />
            )}
          </div>
          <div className="absolute z-20 w-[210px]" style={{ left: 615, top: centralTop }}>
            {central && <VisualPersonCard person={central} label="Pessoa Central" central vitalMode="full" onClick={onPersonClick} />}
          </div>
          <div className="absolute z-10 w-[210px]" style={{ left: 855, top: parentTop }}>
            {directRelativeFilters.pais && (
              mother
                ? <VisualPersonCard person={mother} label="Mãe" vitalMode="full" onClick={onPersonClick} />
                : <VisualEmptyCard label="Mãe" />
            )}
          </div>
          <PositionedGroup id="maternal-uncles" title="Tios Maternos" people={maternalUncles} left={unclesMaternal.left} top={parentTop} width={unclesMaternal.width} columns="quad" collapsedLimit={SIDE_BRANCH_COLLAPSED_LIMIT} expanded={expandedGroups.has('maternal-uncles')} onExpandedChange={handleExpandedChange} spousesByPerson={spousesByPerson} showSpouseConnectors={directRelativeFilters.conjuge} onPersonClick={onPersonClick} />

          <PositionedGroup id="paternal-cousins" title="Primos Paternos" people={paternalCousins} left={cousinsPaternal.left} top={paternalCousinsTop} width={cousinsPaternal.width} columns="quad" collapsedLimit={SIDE_BRANCH_COLLAPSED_LIMIT} expanded={expandedGroups.has('paternal-cousins')} onExpandedChange={handleExpandedChange} spousesByPerson={spousesByPerson} showSpouseConnectors={directRelativeFilters.conjuge} onPersonClick={onPersonClick} />
          {spouse && spouseCardLayout && (
            <div className="absolute z-10 w-[210px]" style={{ left: spouseCardLayout.left, top: spouseCardLayout.top }}>
              <VisualPersonCard person={spouse} label="Cônjuge" tone="spouse" vitalMode="full" onClick={onPersonClick} />
            </div>
          )}
          {renderedDescendantLayouts.map((layout) => (
            <PositionedGroup key={layout.id} {...layout} expanded={expandedGroups.has(layout.id)} onExpandedChange={handleExpandedChange} spousesByPerson={spousesByPerson} showSpouseConnectors={directRelativeFilters.conjuge} onPersonClick={onPersonClick} />
          ))}
          <PositionedGroup id="maternal-cousins" title="Primos Maternos" people={maternalCousins} left={cousinsMaternal.left} top={maternalCousinsTop} width={cousinsMaternal.width} columns="quad" collapsedLimit={SIDE_BRANCH_COLLAPSED_LIMIT} expanded={expandedGroups.has('maternal-cousins')} onExpandedChange={handleExpandedChange} spousesByPerson={spousesByPerson} showSpouseConnectors={directRelativeFilters.conjuge} onPersonClick={onPersonClick} />
        </div>
      </div>
    </div>
  );
}
