import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import type { Pessoa, Relacionamento } from '../../types';
import { isPetFamilyMember } from '../../utils/personEntity';
import type { FamilyTreeActions } from './FamilyTree';
import { VisualPersonCard } from './FamilyTreeVisualCards';
import { buildTreeGraph } from './buildTreeGraph';
import { collectDirectFamilyScopePersonIds } from './layouts/directFamilyDistributedLayout';
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

type Connector = {
  id: string;
  fromGeneration: number;
  toGeneration: number;
  fromPersonId: string;
  toPersonId: string;
};

type PersonPosition = {
  personId: string;
  generation: number;
  index: number;
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

function sortPeopleByBirthThenName(a: Pessoa, b: Pessoa, centralPersonId: string) {
  if (a.id === centralPersonId) return -1;
  if (b.id === centralPersonId) return 1;

  const birthA = getFallbackSortableBirthValue(a.data_nascimento);
  const birthB = getFallbackSortableBirthValue(b.data_nascimento);
  if (birthA !== birthB) return birthA - birthB;

  return (a.nome_completo || '').localeCompare(b.nome_completo || '', 'pt-BR');
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

function buildParentChildConnectors(
  peopleByGeneration: Map<number, Pessoa[]>,
  generationByPersonId: Map<string, number>,
  maps: RelationshipMaps,
) {
  const visiblePersonIds = new Set<string>();
  peopleByGeneration.forEach((people) => people.forEach((person) => visiblePersonIds.add(person.id)));

  const connectors: Connector[] = [];

  visiblePersonIds.forEach((childId) => {
    const childGeneration = generationByPersonId.get(childId);
    if (!childGeneration) return;

    maps.parentsByChild.get(childId)?.forEach((parentId) => {
      if (!visiblePersonIds.has(parentId)) return;
      const parentGeneration = generationByPersonId.get(parentId);
      if (!parentGeneration || parentGeneration >= childGeneration) return;

      connectors.push({
        id: `mobile-horizontal-parent-${parentId}-${childId}`,
        fromGeneration: parentGeneration,
        toGeneration: childGeneration,
        fromPersonId: parentId,
        toPersonId: childId,
      });
    });
  });

  return connectors;
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
  const captureRef = React.useRef<HTMLDivElement | null>(null);
  const swipeStateRef = React.useRef<SwipeState | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [dragX, setDragX] = React.useState(0);
  const [manualZoom, setManualZoom] = React.useState(1);
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
    return firstName ? `Genealogia de ${firstName}` : 'Genealogia';
  }, [centralPerson]);

  const generationByPersonId = React.useMemo(
    () => inferHorizontalGenerations(visibleHorizontalPessoas, maps, centralPersonId),
    [centralPersonId, maps, visibleHorizontalPessoas],
  );

  const peopleByGeneration = React.useMemo(() => {
    const result = new Map<number, Pessoa[]>();
    GENERATIONS.forEach((generation) => result.set(generation, []));

    visibleHorizontalPessoas.forEach((person) => {
      const generation = generationByPersonId.get(person.id);
      if (!generation || generation < 1 || generation > 6) return;
      result.get(generation)?.push(person);
    });

    result.forEach((generationPeople) => {
      generationPeople.sort((a, b) => sortPeopleByBirthThenName(a, b, centralPersonId));
    });

    return result;
  }, [centralPersonId, generationByPersonId, visibleHorizontalPessoas]);

  const activeGenerations = React.useMemo(
    () => GENERATIONS.filter((generation) => (peopleByGeneration.get(generation)?.length ?? 0) > 0),
    [peopleByGeneration],
  );

  const positionByPersonId = React.useMemo(() => {
    const positions = new Map<string, PersonPosition>();

    activeGenerations.forEach((generation) => {
      const people = peopleByGeneration.get(generation) ?? [];
      people.forEach((person, index) => {
        positions.set(person.id, { personId: person.id, generation, index });
      });
    });

    return positions;
  }, [activeGenerations, peopleByGeneration]);

  const connectors = React.useMemo(
    () => buildParentChildConnectors(peopleByGeneration, generationByPersonId, maps),
    [generationByPersonId, maps, peopleByGeneration],
  );

  const activeGenerationSignature = activeGenerations.join('|');

  React.useEffect(() => {
    const centralGeneration = generationByPersonId.get(centralPersonId);
    const defaultIndex = centralGeneration ? getScreenIndex(activeGenerations, centralGeneration) : 0;
    setActiveIndex(defaultIndex >= 0 ? defaultIndex : 0);
    setDragX(0);
    setManualZoom(1);
  }, [activeGenerationSignature, centralPersonId, generationByPersonId, layoutRevision]);

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
      goToIndex(deltaX < 0 ? activeIndex + 1 : activeIndex - 1);
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
      const canvas = prependTitleToCanvas(await captureActiveGeneration(), exportTitle);
      downloadCanvasAsPng(canvas, buildTreeExportFilename('mapa-familiar-horizontal-mobile', 'png'));
      await waitForExportUiSettle();
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
      const canvas = prependTitleToCanvas(await captureActiveGeneration(), exportTitle);
      await exportCanvasAsPdf(
        canvas,
        buildTreeExportFilename('mapa-familiar-horizontal-mobile', 'pdf'),
        '',
      );
      await waitForExportUiSettle();
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
      const canvas = prependTitleToCanvas(await captureActiveGeneration(), exportTitle);
      await printCanvas(canvas, exportTitle, printWindow);
      await waitForExportUiSettle();
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

  const viewportWidth = viewportRef.current?.clientWidth ?? 0;
  const screenWidthPercent = 100 / activeGenerations.length;
  const trackTransform = `translate3d(calc(${-activeIndex * screenWidthPercent}% + ${dragX}px), 0, 0)`;
  const activeGeneration = activeGenerations[activeIndex];

  if (activeGenerations.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-transparent px-6 text-center">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-6 text-sm font-semibold text-slate-500 shadow-sm">
          Nenhuma geração visível para os filtros atuais.
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className="absolute inset-0 overflow-hidden bg-transparent"
      data-family-map-horizontal-mobile-root="true"
    >
      <nav
        aria-label="Gerações do Mapa Familiar Horizontal"
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
          <span className="ml-auto shrink-0 rounded-full bg-white px-3 py-2 text-[11px] font-bold text-slate-500 shadow-sm">
            {activeGeneration ? `${GENERATION_LABELS[activeGeneration] ?? `Geração ${activeGeneration}`}` : ''}
          </span>
        </div>
      </nav>

      <div
        className="absolute inset-x-0 bottom-0 top-[58px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={[
            'flex h-full',
            dragX === 0 ? 'transition-transform duration-300 ease-out' : '',
          ].join(' ')}
          style={{
            width: `${activeGenerations.length * 100}%`,
            transform: trackTransform,
          }}
        >
          {activeGenerations.map((generation, screenIndex) => {
            const people = peopleByGeneration.get(generation) ?? [];
            const isActiveScreen = screenIndex === activeIndex;

            return (
              <section
                key={generation}
                ref={isActiveScreen ? captureRef : undefined}
                className="relative h-full min-w-0 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-transparent px-4 pb-[calc(env(safe-area-inset-bottom,0px)+6.25rem)] pt-6 [-webkit-overflow-scrolling:touch]"
                style={{ width: `${screenWidthPercent}%` }}
              >
                <div
                  className="mx-auto w-full max-w-[390px] origin-top"
                  style={{ transform: `scale(${manualZoom})`, transformOrigin: 'top center' }}
                >
                  <div className="mb-5 text-center">
                    <span className="inline-flex rounded-full bg-slate-600 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-white shadow">
                      Geração {generation}
                    </span>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {screenIndex + 1} de {activeGenerations.length}
                    </p>
                  </div>

                  <div className="relative space-y-4 pb-10">
                    {people.map((person, index) => {
                      const position = positionByPersonId.get(person.id);
                      const hasIncomingConnector = connectors.some((connector) => connector.toPersonId === person.id);
                      const hasOutgoingConnector = connectors.some((connector) => connector.fromPersonId === person.id);

                      return (
                        <div key={person.id} className="relative">
                          {hasIncomingConnector && (
                            <div className="pointer-events-none absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-[var(--family-map-connector,#0e7490)] opacity-70" />
                          )}
                          {index > 0 && (
                            <div className="pointer-events-none absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-[var(--family-map-connector,#0e7490)] opacity-40" />
                          )}
                          <VisualPersonCard
                            person={person}
                            label={getCardLabel(person, generation, centralPersonId, maps, spouseTonePersonIds)}
                            horizontal
                            roomy
                            onClick={onPersonClick}
                            vitalMode="year"
                          />
                          {hasOutgoingConnector && position && (
                            <div className="pointer-events-none absolute left-1/2 top-full h-4 w-px -translate-x-1/2 bg-[var(--family-map-connector,#0e7490)] opacity-70" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
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
