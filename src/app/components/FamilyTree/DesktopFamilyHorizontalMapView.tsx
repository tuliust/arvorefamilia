import React from 'react';
import type { Node } from 'reactflow';
import { toast } from 'sonner';

import type { Pessoa, Relacionamento } from '../../types';
import type { FamilyTreeActions } from './FamilyTree';
import { VisualPersonCard } from './FamilyTreeVisualCards';
import { buildTreeGraph } from './buildTreeGraph';
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
  printCanvas,
} from './utils/treeExport';

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
};

type GenealogyReferencePlacement = {
  x: number;
  y: number;
};

const CANVAS = {
  width: 1580,
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

function isParentChildRelationship(relationship: Relacionamento) {
  return relationship.tipo_relacionamento === 'pai'
    || relationship.tipo_relacionamento === 'mae'
    || relationship.tipo_relacionamento === 'filho'
    || relationship.tipo_relacionamento === 'filiacao_sangue'
    || relationship.tipo_relacionamento === 'filiacao_adotiva';
}

function getParentChildIds(relationship: Relacionamento) {
  if (relationship.tipo_relacionamento === 'filho') {
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
    if (manualGeneration !== undefined) {
      generationByPersonId.set(person.id, manualGeneration);
    }
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

    if (!generationByPersonId.has(current.personId)) {
      generationByPersonId.set(current.personId, generation);
    }

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

function getCardLabel(person: Pessoa, generation: number, centralPersonId: string, maps: RelationshipMaps) {
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

function buildConnectors(layouts: Map<string, PersonLayout>, maps: RelationshipMaps) {
  const connectors: Connector[] = [];
  const visiblePairKeys = new Set<string>();

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
      const x = upperLayout.left + upperLayout.width / 2;

      connectors.push({
        id: `spouse-${key}`,
        points: [
          [x, upperLayout.top + upperLayout.height],
          [x, lowerLayout.top],
        ],
      });
    });
  });

  return connectors;
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
  const scrollStateRef = React.useRef(false);
  const [responsiveScale, setResponsiveScale] = React.useState(1);
  const [manualZoom, setManualZoom] = React.useState(1);

  const visibleHorizontalPessoas = React.useMemo(() => {
    return pessoas.filter((person) => {
      if (visiblePersonIds && !visiblePersonIds.has(person.id)) return false;
      if (person.humano_ou_pet === 'Pet' && !directRelativeFilters.pets) return false;
      return true;
    });
  }, [directRelativeFilters.pets, pessoas, visiblePersonIds]);
  const maps = React.useMemo(() => buildRelationshipMaps(relacionamentos), [relacionamentos]);
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

      result.set(generation, orderPeopleWithAdjacentSpouses(generationPeople, maps));
    });

    return result;
  }, [centralPersonId, generationByPersonId, genealogyReferencePlacements, maps, visibleHorizontalPessoas]);

  const { layouts, canvasHeight } = React.useMemo(() => {
    const nextLayouts = new Map<string, PersonLayout>();
    let maxBottom = CANVAS.top + CANVAS.cardHeight;

    GENERATIONS.forEach((generation, columnIndex) => {
      const people = peopleByGeneration.get(generation) ?? [];
      const left = CANVAS.left + columnIndex * CANVAS.columnWidth;

      people.forEach((person, rowIndex) => {
        const top = CANVAS.top + rowIndex * (CANVAS.cardHeight + CANVAS.rowGap);
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
      canvasHeight: Math.max(CANVAS.minHeight, maxBottom + CANVAS.top),
    };
  }, [peopleByGeneration]);

  const connectors = React.useMemo(() => buildConnectors(layouts, maps), [layouts, maps]);
  const effectiveScale = responsiveScale * manualZoom;

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const updateScale = () => {
      const widthScale = viewport.clientWidth / CANVAS.width;
      const heightScale = viewport.clientHeight / CANVAS.minHeight;
      setResponsiveScale(Math.min(1, Math.max(CANVAS.minScale, Math.min(widthScale, heightScale))));
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    updateScale();
    return () => observer.disconnect();
  }, [canvasHeight, layoutRevision]);

  React.useEffect(() => {
    setManualZoom(1);
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
      filhos: generationCount(6),
      pets: visibleHorizontalPessoas.filter((person) => person.humano_ou_pet === 'Pet').length,
    });
  }, [onDirectRelationRenderedCounts, peopleByGeneration, visibleHorizontalPessoas]);

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
      throw new Error('Área do Mapa Familiar Horizontal não encontrada para exportação.');
    }

    return captureElementToCanvas(exportRootRef.current);
  }, []);

  const handleZoomIn = React.useCallback(() => {
    setManualZoom((currentZoom) => Math.min(CANVAS.maxZoom, Number((currentZoom + CANVAS.zoomStep).toFixed(2))));
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setManualZoom((currentZoom) => Math.max(CANVAS.minZoom, Number((currentZoom - CANVAS.zoomStep).toFixed(2))));
  }, []);

  const handleSaveImage = React.useCallback(async () => {
    try {
      const canvas = await captureFamilyMap();
      downloadCanvasAsPng(canvas, buildTreeExportFilename('mapa-familiar-horizontal', 'png'));
    } catch (error) {
      console.error('Erro ao exportar imagem do Mapa Familiar Horizontal:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar a imagem do Mapa Familiar Horizontal.');
    }
  }, [captureFamilyMap]);

  const handleSavePdf = React.useCallback(async () => {
    try {
      const canvas = await captureFamilyMap();
      await exportCanvasAsPdf(canvas, buildTreeExportFilename('mapa-familiar-horizontal', 'pdf'), 'Mapa Familiar Horizontal');
    } catch (error) {
      console.error('Erro ao exportar PDF do Mapa Familiar Horizontal:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar o PDF do Mapa Familiar Horizontal.');
    }
  }, [captureFamilyMap]);

  const handlePrint = React.useCallback(async () => {
    const printWindow = openTreePrintWindow();

    try {
      const canvas = await captureFamilyMap();
      printCanvas(canvas, 'Imprimir Mapa Familiar Horizontal', printWindow);
    } catch (error) {
      if (!printWindow.closed) printWindow.close();
      console.error('Erro ao imprimir o Mapa Familiar Horizontal:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível imprimir o Mapa Familiar Horizontal.');
    }
  }, [captureFamilyMap]);

  const handleDirectExport = React.useCallback(() => {
    toast.info('O Mapa Familiar Horizontal exporta diretamente a superfície atual.');
    void handleSaveImage();
  }, [handleSaveImage]);

  React.useImperativeHandle(ref, () => ({
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    print: handlePrint,
    savePdf: handleSavePdf,
    saveImage: handleSaveImage,
    startAreaSelection: handleDirectExport,
  }), [handleDirectExport, handlePrint, handleSaveImage, handleSavePdf, handleZoomIn, handleZoomOut]);

  return (
    <div
      ref={viewportRef}
      onWheel={handleWheel}
      onScroll={handleScroll}
      className="absolute inset-x-0 bottom-0 top-0 isolate overflow-auto overscroll-contain pt-[76px]"
      style={{ backgroundColor: '#ecfeff' }}
    >
      <div
        ref={exportRootRef}
        data-family-map-export-root="true"
        data-family-map-horizontal-root="true"
        className="relative z-10 mx-auto"
        style={{
          width: CANVAS.width * effectiveScale,
          height: canvasHeight * effectiveScale,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: CANVAS.width,
            height: canvasHeight,
            transform: `scale(${effectiveScale})`,
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox={`0 0 ${CANVAS.width} ${canvasHeight}`}
            aria-hidden="true"
          >
            <g
              fill="none"
              stroke="var(--family-map-connector, #a5eef6)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {connectors.map((connector) => (
                <path key={connector.id} d={connectorPath(connector.points)} />
              ))}
            </g>
          </svg>

          {GENERATIONS.map((generation, index) => (
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
                label={getCardLabel(layout.person, layout.generation, centralPersonId, maps)}
                horizontal
                onClick={onPersonClick}
                vitalMode="year"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const DesktopFamilyHorizontalMapView = React.forwardRef<
  FamilyTreeActions,
  DesktopFamilyHorizontalMapViewProps
>(DesktopFamilyHorizontalMapViewComponent);
