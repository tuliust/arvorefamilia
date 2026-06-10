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
  className: string;
  columns?: 'single' | 'double' | 'triple';
  variant?: 'mini' | 'compact' | 'horizontal';
  maxHeightClassName?: string;
  onPersonClick: (pessoa: Pessoa) => void;
};

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 1080;
const MIN_TABLET_SCALE = 0.62;

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
  className,
  columns = 'double',
  variant = 'mini',
  maxHeightClassName = 'max-h-[12rem]',
  onPersonClick,
}: MapGroupProps) {
  if (people.length === 0) return null;

  return (
    <div className={`absolute z-10 min-h-0 ${className}`}>
      <VisualGroup
        title={title}
        people={people}
        columns={columns}
        variant={variant}
        maxHeightClassName={maxHeightClassName}
        onPersonClick={onPersonClick}
      />
    </div>
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
                <path d={connectorPath([[480, 132], [480, 145]])} />
              )}
              {paternal.greatGrandparents.length > 0 && paternal.grandparents.length > 0 && (
                <path d={connectorPath([[480, 257], [480, 270]])} />
              )}
              {maternal.greatGreatGrandparents.length > 0 && maternal.greatGrandparents.length > 0 && (
                <path d={connectorPath([[960, 132], [960, 145]])} />
              )}
              {maternal.greatGrandparents.length > 0 && maternal.grandparents.length > 0 && (
                <path d={connectorPath([[960, 257], [960, 270]])} />
              )}
              {paternal.grandparents.length > 0 && father && (
                <path d={connectorPath([[480, 382], [480, 398], [435, 398], [435, 410]])} />
              )}
              {maternal.grandparents.length > 0 && mother && (
                <path d={connectorPath([[960, 382], [960, 398], [1005, 398], [1005, 410]])} />
              )}
              {paternal.grandparents.length > 0 && paternal.uncles.length > 0 && (
                <path d={connectorPath([[480, 398], [170, 398], [170, 410]])} />
              )}
              {maternal.grandparents.length > 0 && maternal.uncles.length > 0 && (
                <path d={connectorPath([[960, 398], [1270, 398], [1270, 410]])} />
              )}
              {father && central && (
                <path d={connectorPath([[435, 574], [435, 596], [720, 596], [720, 604]])} />
              )}
              {mother && central && (
                <path d={connectorPath([[1005, 574], [1005, 596], [720, 596]])} />
              )}
              {paternal.uncles.length > 0 && paternal.cousins.length > 0 && (
                <path d={connectorPath([[170, 604], [170, 650]])} />
              )}
              {maternal.uncles.length > 0 && maternal.cousins.length > 0 && (
                <path d={connectorPath([[1270, 604], [1270, 650]])} />
              )}
              {central && hasCentralDescendants && (
                <path d={connectorPath([[720, 798], [720, 810]])} />
              )}
              {central && siblings.length > 0 && (
                <path d={connectorPath([[720, 810], [460, 810], [460, 820]])} />
              )}
              {central && spouses.length > 0 && (
                <path d={connectorPath([[720, 810], [720, 820]])} />
              )}
              {central && children.length > 0 && (
                <path d={connectorPath([[720, 810], [980, 810], [980, 820]])} />
              )}
              {central && nephews.length > 0 && (
                <path d={connectorPath([[460, 810], [460, 950]])} />
              )}
              {central && pets.length > 0 && (
                <path d={connectorPath([[720, 810], [720, 950]])} />
              )}
              {central && grandchildren.length > 0 && (
                <path d={connectorPath([[980, 810], [980, 950]])} />
              )}
            </g>
          </svg>

          <PositionedGroup title="Tataravós Paternos" people={paternal.greatGreatGrandparents} className="left-[300px] top-[20px] w-[360px]" variant="horizontal" maxHeightClassName="max-h-[78px]" onPersonClick={onPersonClick} />
          <PositionedGroup title="Tataravós Maternos" people={maternal.greatGreatGrandparents} className="left-[780px] top-[20px] w-[360px]" variant="horizontal" maxHeightClassName="max-h-[78px]" onPersonClick={onPersonClick} />
          <PositionedGroup title="Bisavós Paternos" people={paternal.greatGrandparents} className="left-[300px] top-[145px] w-[360px]" variant="horizontal" maxHeightClassName="max-h-[78px]" onPersonClick={onPersonClick} />
          <PositionedGroup title="Bisavós Maternos" people={maternal.greatGrandparents} className="left-[780px] top-[145px] w-[360px]" variant="horizontal" maxHeightClassName="max-h-[78px]" onPersonClick={onPersonClick} />
          <PositionedGroup title="Avós Paternos" people={paternal.grandparents} className="left-[300px] top-[270px] w-[360px]" variant="horizontal" maxHeightClassName="max-h-[78px]" onPersonClick={onPersonClick} />
          <PositionedGroup title="Avós Maternos" people={maternal.grandparents} className="left-[780px] top-[270px] w-[360px]" variant="horizontal" maxHeightClassName="max-h-[78px]" onPersonClick={onPersonClick} />

          <PositionedGroup title="Tios Paternos" people={paternal.uncles} className="left-[40px] top-[410px] w-[260px]" maxHeightClassName="max-h-[158px]" onPersonClick={onPersonClick} />
          <div className="absolute left-[330px] top-[410px] z-10 w-[210px]">
            {directRelativeFilters.pais && (
              father
                ? <VisualPersonCard person={father} label="Pai" onClick={onPersonClick} />
                : <VisualEmptyCard label="Pai" />
            )}
          </div>
          <div className="absolute left-[615px] top-[604px] z-20 w-[210px]">
            {central && <VisualPersonCard person={central} label="Pessoa Central" central onClick={onPersonClick} />}
          </div>
          <div className="absolute left-[900px] top-[410px] z-10 w-[210px]">
            {directRelativeFilters.pais && (
              mother
                ? <VisualPersonCard person={mother} label="Mãe" onClick={onPersonClick} />
                : <VisualEmptyCard label="Mãe" />
            )}
          </div>
          <PositionedGroup title="Tios Maternos" people={maternal.uncles} className="left-[1140px] top-[410px] w-[260px]" maxHeightClassName="max-h-[158px]" onPersonClick={onPersonClick} />

          <PositionedGroup title="Primos Paternos" people={paternal.cousins} className="left-[40px] top-[650px] w-[260px]" maxHeightClassName="max-h-[238px]" onPersonClick={onPersonClick} />
          <div className="absolute left-[330px] top-[820px] z-10 grid w-[780px] grid-cols-3 items-start gap-3">
            <div>{siblings.length > 0 && <VisualGroup title="Irmãos" people={siblings} columns="single" variant="horizontal" maxHeightClassName="max-h-[92px]" onPersonClick={onPersonClick} />}</div>
            <div>{spouses.length > 0 && <VisualGroup title="Cônjuge" people={spouses} columns="single" variant="horizontal" maxHeightClassName="max-h-[92px]" onPersonClick={onPersonClick} />}</div>
            <div>{children.length > 0 && <VisualGroup title="Filhos" people={children} columns="single" variant="horizontal" maxHeightClassName="max-h-[92px]" onPersonClick={onPersonClick} />}</div>
            <div>{nephews.length > 0 && <VisualGroup title="Sobrinhos" people={nephews} columns="double" variant="mini" maxHeightClassName="max-h-[90px]" onPersonClick={onPersonClick} />}</div>
            <div>{pets.length > 0 && <VisualGroup title="Pets" people={pets} columns="double" variant="mini" maxHeightClassName="max-h-[90px]" onPersonClick={onPersonClick} />}</div>
            <div>{grandchildren.length > 0 && <VisualGroup title="Netos" people={grandchildren} columns="double" variant="mini" maxHeightClassName="max-h-[90px]" onPersonClick={onPersonClick} />}</div>
          </div>
          <PositionedGroup title="Primos Maternos" people={maternal.cousins} className="left-[1140px] top-[650px] w-[260px]" maxHeightClassName="max-h-[238px]" onPersonClick={onPersonClick} />
        </div>
      </div>
    </div>
  );
}
