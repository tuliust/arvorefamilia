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
  columns?: 'single' | 'double' | 'triple';
  variant?: 'mini' | 'compact' | 'horizontal';
  onPersonClick: (pessoa: Pessoa) => void;
  expanded: boolean;
  onExpandedChange: (id: string, expanded: boolean) => void;
  zIndex?: number;
};

type GroupLayout = {
  id: string;
  title: string;
  people: Pessoa[];
  left: number;
  top: number;
  width: number;
  height: number;
  columns?: 'single' | 'double' | 'triple';
  variant?: 'mini' | 'compact' | 'horizontal';
};

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 1020;
const MIN_TABLET_SCALE = 0.62;
const GROUP_VERTICAL_GAP = 46;
const TOP_START = 18;
const HORIZONTAL_CARD_HEIGHT = 74;
const MINI_CARD_HEIGHT = 112;
const GROUP_VERTICAL_PADDING = 44;
const GROUP_GRID_GAP = 8;
const COLLAPSED_LIMIT = 2;
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

function getRows(count: number, columns: 'single' | 'double' | 'triple', expanded: boolean) {
  const visibleCount = expanded ? count : Math.min(count, COLLAPSED_LIMIT);
  const columnCount = columns === 'triple' ? 3 : columns === 'double' ? 2 : 1;
  return Math.max(1, Math.ceil(visibleCount / columnCount));
}

function getGroupHeight({
  people,
  columns = 'double',
  variant = 'mini',
  expanded,
}: {
  people: Pessoa[];
  columns?: 'single' | 'double' | 'triple';
  variant?: 'mini' | 'compact' | 'horizontal';
  expanded: boolean;
}) {
  const cardHeight = variant === 'horizontal' ? HORIZONTAL_CARD_HEIGHT : MINI_CARD_HEIGHT;
  const rows = getRows(people.length, columns, expanded);
  return GROUP_VERTICAL_PADDING + rows * cardHeight + Math.max(0, rows - 1) * GROUP_GRID_GAP;
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
        collapsedLimit={COLLAPSED_LIMIT}
        expanded={expanded}
        onExpandedChange={(nextExpanded) => onExpandedChange(id, nextExpanded)}
        disableInternalScroll
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
  const left = side === 'paternal' ? 300 : 780;
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
    });
    const layout: GroupLayout = {
      id: row.id,
      title: row.title,
      people: row.people,
      left,
      top,
      width: 360,
      height,
      columns: row.columns,
      variant: row.variant,
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
  const spouses = filterGroup(model.spouses, 'conjuge');
  const siblings = filterGroup(model.siblings, 'irmaos');
  const nephews = filterGroup(model.nephews, 'sobrinhos');
  const children = filterGroup(model.children, 'filhos');
  const pets = filterGroup(model.pets, 'pets');
  const grandchildren = filterGroup(model.grandchildren, 'netos');

  const paternalAncestors = React.useMemo(
    () => buildAncestorLayouts({ side: 'paternal', branch: paternal, expandedGroups }),
    [expandedGroups, paternal],
  );
  const maternalAncestors = React.useMemo(
    () => buildAncestorLayouts({ side: 'maternal', branch: maternal, expandedGroups }),
    [expandedGroups, maternal],
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
    people: paternal.uncles,
    columns: 'double',
    variant: 'mini',
    expanded: expandedGroups.has('paternal-uncles'),
  });
  const maternalUnclesHeight = getGroupHeight({
    people: maternal.uncles,
    columns: 'double',
    variant: 'mini',
    expanded: expandedGroups.has('maternal-uncles'),
  });
  const paternalCousinsTop = parentTop + paternalUnclesHeight + GROUP_VERTICAL_GAP;
  const maternalCousinsTop = parentTop + maternalUnclesHeight + GROUP_VERTICAL_GAP;

  const descendantGroupTopRow = descendantsTop;
  const descendantGroupSecondRow = descendantsTop + 144;

  const spouse = spouses[0];
  const spouseCardLayout = spouse ? {
    left: 615,
    top: descendantGroupTopRow,
    width: 210,
    height: PARENT_CARD_HEIGHT,
  } : undefined;

  const descendantLayouts: GroupLayout[] = [
    {
      id: 'siblings',
      title: 'Irmãos',
      people: siblings,
      left: 340,
      top: descendantGroupTopRow,
      width: 300,
      height: getGroupHeight({ people: siblings, columns: 'double', variant: 'horizontal', expanded: expandedGroups.has('siblings') }),
      columns: 'double',
      variant: 'horizontal',
    },
    {
      id: 'children',
      title: 'Filhos',
      people: children,
      left: 940,
      top: descendantGroupTopRow,
      width: 300,
      height: getGroupHeight({ people: children, columns: 'double', variant: 'horizontal', expanded: expandedGroups.has('children') }),
      columns: 'double',
      variant: 'horizontal',
    },
    {
      id: 'nephews',
      title: 'Sobrinhos',
      people: nephews,
      left: 340,
      top: descendantGroupSecondRow,
      width: 300,
      height: getGroupHeight({ people: nephews, columns: 'double', variant: 'mini', expanded: expandedGroups.has('nephews') }),
      columns: 'double',
      variant: 'mini',
    },
    {
      id: 'pets',
      title: 'Pets',
      people: pets,
      left: 665,
      top: descendantGroupSecondRow,
      width: 180,
      height: getGroupHeight({ people: pets, columns: 'single', variant: 'mini', expanded: expandedGroups.has('pets') }),
      columns: 'single',
      variant: 'mini',
    },
    {
      id: 'grandchildren',
      title: 'Netos',
      people: grandchildren,
      left: 940,
      top: descendantGroupSecondRow,
      width: 300,
      height: getGroupHeight({ people: grandchildren, columns: 'double', variant: 'mini', expanded: expandedGroups.has('grandchildren') }),
      columns: 'double',
      variant: 'mini',
    },
  ];

  const renderedDescendantLayouts = descendantLayouts.filter((layout) => layout.people.length > 0);
  const descendantConnectorLayouts = spouseCardLayout
    ? [...renderedDescendantLayouts, spouseCardLayout]
    : renderedDescendantLayouts;
  const contentBottom = Math.max(
    centralBottomY,
    spouseCardLayout ? bottomY(spouseCardLayout) : 0,
    paternal.cousins.length > 0 ? paternalCousinsTop + getGroupHeight({ people: paternal.cousins, columns: 'double', variant: 'mini', expanded: expandedGroups.has('paternal-cousins') }) : 0,
    maternal.cousins.length > 0 ? maternalCousinsTop + getGroupHeight({ people: maternal.cousins, columns: 'double', variant: 'mini', expanded: expandedGroups.has('maternal-cousins') }) : 0,
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
      conjuge: spouses.length,
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
    spouses.length,
  ]);

  const hasCentralDescendants = descendantConnectorLayouts.length > 0;
  const paternalGrandparents = findLayout(paternalAncestors, 'paternal-grandparents');
  const maternalGrandparents = findLayout(maternalAncestors, 'maternal-grandparents');
  const fatherCenterX = 435;
  const motherCenterX = 1005;
  const centralCenterX = 720;
  const branchLeft = 8;
  const branchRight = 1172;
  const centralBranchY = centralTop - 36;
  const descendantsJunctionY = descendantsTop - 18;
  const unclesPaternal = { left: branchLeft, top: parentTop, width: 260, height: paternalUnclesHeight };
  const unclesMaternal = { left: branchRight, top: parentTop, width: 260, height: maternalUnclesHeight };
  const cousinsPaternal = {
    left: branchLeft,
    top: paternalCousinsTop,
    width: 260,
    height: getGroupHeight({ people: paternal.cousins, columns: 'double', variant: 'mini', expanded: expandedGroups.has('paternal-cousins') }),
  };
  const cousinsMaternal = {
    left: branchRight,
    top: maternalCousinsTop,
    width: 260,
    height: getGroupHeight({ people: maternal.cousins, columns: 'double', variant: 'mini', expanded: expandedGroups.has('maternal-cousins') }),
  };

  return (
    <div
      ref={viewportRef}
      className="absolute inset-x-0 bottom-0 top-[76px] overflow-auto overscroll-contain bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_38%,#f8fafc_100%)]"
    >
      <div
        className="relative mx-auto"
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
            <g fill="none" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
              {paternalGrandparents && paternal.uncles.length > 0 && (
                <path d={connectorPath([[centerX(paternalGrandparents), parentJunctionY], [centerX(unclesPaternal), parentJunctionY], [centerX(unclesPaternal), parentTop]])} />
              )}
              {maternalGrandparents && maternal.uncles.length > 0 && (
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
              {paternal.uncles.length > 0 && paternal.cousins.length > 0 && (
                <path d={connectorPath([[centerX(unclesPaternal), bottomY(unclesPaternal)], [centerX(cousinsPaternal), cousinsPaternal.top]])} />
              )}
              {maternal.uncles.length > 0 && maternal.cousins.length > 0 && (
                <path d={connectorPath([[centerX(unclesMaternal), bottomY(unclesMaternal)], [centerX(cousinsMaternal), cousinsMaternal.top]])} />
              )}
              {central && hasCentralDescendants && (
                <path d={connectorPath([[centralCenterX, centralBottomY], [centralCenterX, descendantsJunctionY]])} />
              )}
              {central && descendantConnectorLayouts.map((layout) => (
                <path
                  key={`central-${'id' in layout ? layout.id : 'spouse-card'}`}
                  d={connectorPath([[centralCenterX, descendantsJunctionY], [centerX(layout), descendantsJunctionY], [centerX(layout), layout.top]])}
                />
              ))}
            </g>
          </svg>

          {paternalAncestors.map((layout) => (
            <PositionedGroup key={layout.id} {...layout} expanded={expandedGroups.has(layout.id)} onExpandedChange={handleExpandedChange} onPersonClick={onPersonClick} />
          ))}
          {maternalAncestors.map((layout) => (
            <PositionedGroup key={layout.id} {...layout} expanded={expandedGroups.has(layout.id)} onExpandedChange={handleExpandedChange} onPersonClick={onPersonClick} />
          ))}

          <PositionedGroup id="paternal-uncles" title="Tios Paternos" people={paternal.uncles} left={branchLeft} top={parentTop} width={260} expanded={expandedGroups.has('paternal-uncles')} onExpandedChange={handleExpandedChange} onPersonClick={onPersonClick} />
          <div className="absolute z-10 w-[210px]" style={{ left: 330, top: parentTop }}>
            {directRelativeFilters.pais && (
              father
                ? <VisualPersonCard person={father} label="Pai" onClick={onPersonClick} />
                : <VisualEmptyCard label="Pai" />
            )}
          </div>
          <div className="absolute z-20 w-[210px]" style={{ left: 615, top: centralTop }}>
            {central && <VisualPersonCard person={central} label="Pessoa Central" central onClick={onPersonClick} />}
          </div>
          <div className="absolute z-10 w-[210px]" style={{ left: 900, top: parentTop }}>
            {directRelativeFilters.pais && (
              mother
                ? <VisualPersonCard person={mother} label="Mãe" onClick={onPersonClick} />
                : <VisualEmptyCard label="Mãe" />
            )}
          </div>
          <PositionedGroup id="maternal-uncles" title="Tios Maternos" people={maternal.uncles} left={branchRight} top={parentTop} width={260} expanded={expandedGroups.has('maternal-uncles')} onExpandedChange={handleExpandedChange} onPersonClick={onPersonClick} />

          <PositionedGroup id="paternal-cousins" title="Primos Paternos" people={paternal.cousins} left={branchLeft} top={paternalCousinsTop} width={260} expanded={expandedGroups.has('paternal-cousins')} onExpandedChange={handleExpandedChange} onPersonClick={onPersonClick} />
          {spouse && spouseCardLayout && (
            <div className="absolute z-10 w-[210px]" style={{ left: spouseCardLayout.left, top: spouseCardLayout.top }}>
              <VisualPersonCard person={spouse} label="Cônjuge" onClick={onPersonClick} />
            </div>
          )}
          {renderedDescendantLayouts.map((layout) => (
            <PositionedGroup key={layout.id} {...layout} expanded={expandedGroups.has(layout.id)} onExpandedChange={handleExpandedChange} onPersonClick={onPersonClick} />
          ))}
          <PositionedGroup id="maternal-cousins" title="Primos Maternos" people={maternal.cousins} left={branchRight} top={maternalCousinsTop} width={260} expanded={expandedGroups.has('maternal-cousins')} onExpandedChange={handleExpandedChange} onPersonClick={onPersonClick} />
        </div>
      </div>
    </div>
  );
}
