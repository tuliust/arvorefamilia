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
  title: string;
  people: Pessoa[];
  x: number;
  y: number;
  width: number;
  columns?: 'single' | 'double' | 'triple';
  variant?: 'mini' | 'compact' | 'horizontal';
  onPersonClick: (pessoa: Pessoa) => void;
};

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 1040;
const MIN_TABLET_SCALE = 0.62;

const FAMILY_COLUMN_WIDTH = 360;
const SIDE_COLUMN_WIDTH = 260;
const CORE_CARD_WIDTH = 210;
const CORE_GROUP_WIDTH = 780;

const PATERNAL_FAMILY_X = 300;
const MATERNAL_FAMILY_X = 780;
const PATERNAL_SIDE_X = 40;
const MATERNAL_SIDE_X = 1140;
const FATHER_X = 330;
const CENTRAL_X = 615;
const MOTHER_X = 900;
const CORE_GROUP_X = 330;

const TATARAVOS_Y = 8;
const BISAVOS_Y = 122;
const AVOS_Y = 236;
const PARENTS_Y = 360;
const CENTRAL_Y = 540;
const COUSINS_Y = 586;
const CORE_GROUPS_Y = 780;

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

function PositionedGroup({
  title,
  people,
  x,
  y,
  width,
  columns = 'double',
  variant = 'mini',
  onPersonClick,
}: MapGroupProps) {
  if (people.length === 0) return null;

  return (
    <div
      className="absolute z-10 min-h-0"
      style={{ left: x, top: y, width }}
    >
      <VisualGroup
        title={title}
        people={people}
        columns={columns}
        variant={variant}
        titleVariant="pill"
        expandable
        collapsedLimit={2}
        disableInternalScroll
        onPersonClick={onPersonClick}
      />
    </div>
  );
}

function CoreGroup({
  title,
  people,
  columns = 'double',
  variant = 'horizontal',
  onPersonClick,
}: {
  title: string;
  people: Pessoa[];
  columns?: 'single' | 'double' | 'triple';
  variant?: 'mini' | 'compact' | 'horizontal';
  onPersonClick: (pessoa: Pessoa) => void;
}) {
  if (people.length === 0) return null;

  return (
    <VisualGroup
      title={title}
      people={people}
      columns={columns}
      variant={variant}
      titleVariant="pill"
      expandable
      collapsedLimit={2}
      disableInternalScroll
      onPersonClick={onPersonClick}
    />
  );
}

function connectorPath(points: Array<[number, number]>) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
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
  }, [layoutRevision]);

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

  const hasCentralDescendants = [
    siblings,
    spouses,
    nephews,
    children,
    pets,
    grandchildren,
  ].some((people) => people.length > 0);

  return (
    <div
      ref={viewportRef}
      className="absolute inset-x-0 bottom-0 top-[76px] overflow-auto overscroll-contain bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_38%,#f8fafc_100%)]"
    >
      <div
        className="relative mx-auto"
        style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            aria-hidden="true"
          >
            <g fill="none" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {paternal.greatGreatGrandparents.length > 0 && paternal.greatGrandparents.length > 0 && (
                <path d={connectorPath([[480, 112], [480, BISAVOS_Y]])} />
              )}
              {paternal.greatGrandparents.length > 0 && paternal.grandparents.length > 0 && (
                <path d={connectorPath([[480, 226], [480, AVOS_Y]])} />
              )}
              {maternal.greatGreatGrandparents.length > 0 && maternal.greatGrandparents.length > 0 && (
                <path d={connectorPath([[960, 112], [960, BISAVOS_Y]])} />
              )}
              {maternal.greatGrandparents.length > 0 && maternal.grandparents.length > 0 && (
                <path d={connectorPath([[960, 226], [960, AVOS_Y]])} />
              )}
              {paternal.grandparents.length > 0 && father && (
                <path d={connectorPath([[480, 340], [480, 350], [435, 350], [435, PARENTS_Y]])} />
              )}
              {maternal.grandparents.length > 0 && mother && (
                <path d={connectorPath([[960, 340], [960, 350], [1005, 350], [1005, PARENTS_Y]])} />
              )}
              {paternal.grandparents.length > 0 && paternal.uncles.length > 0 && (
                <path d={connectorPath([[480, 350], [170, 350], [170, PARENTS_Y]])} />
              )}
              {maternal.grandparents.length > 0 && maternal.uncles.length > 0 && (
                <path d={connectorPath([[960, 350], [1270, 350], [1270, PARENTS_Y]])} />
              )}
              {father && central && (
                <path d={connectorPath([[435, 524], [435, 532], [720, 532], [720, CENTRAL_Y]])} />
              )}
              {mother && central && (
                <path d={connectorPath([[1005, 524], [1005, 532], [720, 532]])} />
              )}
              {paternal.uncles.length > 0 && paternal.cousins.length > 0 && (
                <path d={connectorPath([[170, 532], [170, COUSINS_Y]])} />
              )}
              {maternal.uncles.length > 0 && maternal.cousins.length > 0 && (
                <path d={connectorPath([[1270, 532], [1270, COUSINS_Y]])} />
              )}
              {central && hasCentralDescendants && (
                <path d={connectorPath([[720, 734], [720, 760]])} />
              )}
              {central && siblings.length > 0 && (
                <path d={connectorPath([[720, 760], [460, 760], [460, CORE_GROUPS_Y]])} />
              )}
              {central && spouses.length > 0 && (
                <path d={connectorPath([[720, 760], [720, CORE_GROUPS_Y]])} />
              )}
              {central && children.length > 0 && (
                <path d={connectorPath([[720, 760], [980, 760], [980, CORE_GROUPS_Y]])} />
              )}
              {central && nephews.length > 0 && (
                <path d={connectorPath([[460, 760], [460, 920]])} />
              )}
              {central && pets.length > 0 && (
                <path d={connectorPath([[720, 760], [720, 920]])} />
              )}
              {central && grandchildren.length > 0 && (
                <path d={connectorPath([[980, 760], [980, 920]])} />
              )}
            </g>
          </svg>

          <PositionedGroup title="Tataravós Paternos" people={paternal.greatGreatGrandparents} x={PATERNAL_FAMILY_X} y={TATARAVOS_Y} width={FAMILY_COLUMN_WIDTH} variant="horizontal" onPersonClick={onPersonClick} />
          <PositionedGroup title="Tataravós Maternos" people={maternal.greatGreatGrandparents} x={MATERNAL_FAMILY_X} y={TATARAVOS_Y} width={FAMILY_COLUMN_WIDTH} variant="horizontal" onPersonClick={onPersonClick} />
          <PositionedGroup title="Bisavós Paternos" people={paternal.greatGrandparents} x={PATERNAL_FAMILY_X} y={BISAVOS_Y} width={FAMILY_COLUMN_WIDTH} variant="horizontal" onPersonClick={onPersonClick} />
          <PositionedGroup title="Bisavós Maternos" people={maternal.greatGrandparents} x={MATERNAL_FAMILY_X} y={BISAVOS_Y} width={FAMILY_COLUMN_WIDTH} variant="horizontal" onPersonClick={onPersonClick} />
          <PositionedGroup title="Avós Paternos" people={paternal.grandparents} x={PATERNAL_FAMILY_X} y={AVOS_Y} width={FAMILY_COLUMN_WIDTH} variant="horizontal" onPersonClick={onPersonClick} />
          <PositionedGroup title="Avós Maternos" people={maternal.grandparents} x={MATERNAL_FAMILY_X} y={AVOS_Y} width={FAMILY_COLUMN_WIDTH} variant="horizontal" onPersonClick={onPersonClick} />

          <PositionedGroup title="Tios Paternos" people={paternal.uncles} x={PATERNAL_SIDE_X} y={PARENTS_Y} width={SIDE_COLUMN_WIDTH} onPersonClick={onPersonClick} />
          <div className="absolute z-10" style={{ left: FATHER_X, top: PARENTS_Y, width: CORE_CARD_WIDTH }}>
            {directRelativeFilters.pais && (
              father
                ? <VisualPersonCard person={father} label="Pai" onClick={onPersonClick} />
                : <VisualEmptyCard label="Pai" />
            )}
          </div>
          <div className="absolute z-20" style={{ left: CENTRAL_X, top: CENTRAL_Y, width: CORE_CARD_WIDTH }}>
            {central && <VisualPersonCard person={central} label="Pessoa Central" central onClick={onPersonClick} />}
          </div>
          <div className="absolute z-10" style={{ left: MOTHER_X, top: PARENTS_Y, width: CORE_CARD_WIDTH }}>
            {directRelativeFilters.pais && (
              mother
                ? <VisualPersonCard person={mother} label="Mãe" onClick={onPersonClick} />
                : <VisualEmptyCard label="Mãe" />
            )}
          </div>
          <PositionedGroup title="Tios Maternos" people={maternal.uncles} x={MATERNAL_SIDE_X} y={PARENTS_Y} width={SIDE_COLUMN_WIDTH} onPersonClick={onPersonClick} />

          <PositionedGroup title="Primos Paternos" people={paternal.cousins} x={PATERNAL_SIDE_X} y={COUSINS_Y} width={SIDE_COLUMN_WIDTH} onPersonClick={onPersonClick} />
          <div
            className="absolute z-10 grid grid-cols-3 items-start gap-3"
            style={{ left: CORE_GROUP_X, top: CORE_GROUPS_Y, width: CORE_GROUP_WIDTH }}
          >
            <div><CoreGroup title="Irmãos" people={siblings} columns="double" variant="horizontal" onPersonClick={onPersonClick} /></div>
            <div><CoreGroup title="Cônjuge" people={spouses} columns="double" variant="horizontal" onPersonClick={onPersonClick} /></div>
            <div><CoreGroup title="Filhos" people={children} columns="double" variant="horizontal" onPersonClick={onPersonClick} /></div>
            <div><CoreGroup title="Sobrinhos" people={nephews} columns="double" variant="mini" onPersonClick={onPersonClick} /></div>
            <div><CoreGroup title="Pets" people={pets} columns="double" variant="mini" onPersonClick={onPersonClick} /></div>
            <div><CoreGroup title="Netos" people={grandchildren} columns="double" variant="mini" onPersonClick={onPersonClick} /></div>
          </div>
          <PositionedGroup title="Primos Maternos" people={maternal.cousins} x={MATERNAL_SIDE_X} y={COUSINS_Y} width={SIDE_COLUMN_WIDTH} onPersonClick={onPersonClick} />
        </div>
      </div>
    </div>
  );
}
