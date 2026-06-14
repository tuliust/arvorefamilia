import React from 'react';
import { useLocation } from 'react-router';

import { FamilyTree, type FamilyTreeActions } from '../../components/FamilyTree/FamilyTree';
import { DesktopFamilyMapView } from '../../components/FamilyTree/DesktopFamilyMapView';
import { DesktopFamilyHorizontalMapView } from '../../components/FamilyTree/DesktopFamilyHorizontalMapView';
import { MobileFamilyHorizontalMapView } from '../../components/FamilyTree/MobileFamilyHorizontalMapView';
import { MobileFamilyTreeView } from '../../components/FamilyTree/MobileFamilyTreeView';
import type {
  DirectRelativeFilters,
  DirectRelativeGroup,
  EdgeFilters,
  GenealogyFilters,
  MarriageNodeDetails,
  VisualLineFilters,
} from '../../components/FamilyTree/types';
import type { TreeViewMode } from '../../components/FamilyTree/treeViewMode';
import { PageFavoriteButton } from '../../components/favorites/PageFavoriteButton';
import type { Pessoa, Relacionamento } from '../../types';
import { GenealogyMobileStageTabs } from './GenealogyMobileStageTabs';
import {
  SIDEBAR_TREE_ACTION_EVENT,
  type SidebarTreeAction,
} from './SidebarPanelTabs';

interface StateMessageProps {
  title: string;
  message: string;
  tone?: 'neutral' | 'error';
}

function getPersonGeneration(pessoa: Pessoa) {
  const generation = pessoa.manual_generation;
  return typeof generation === 'number' && Number.isFinite(generation)
    ? generation
    : null;
}

function inferGenealogyManualGenerations(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[],
  centralPersonId?: string
) {
  if (!centralPersonId) return pessoas;

  const peopleById = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  if (!peopleById.has(centralPersonId)) return pessoas;

  const parentsByChild = new Map<string, Set<string>>();
  const childrenByParent = new Map<string, Set<string>>();
  const spousesByPerson = new Map<string, Set<string>>();

  const addToMap = (map: Map<string, Set<string>>, key: string, value: string) => {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(value);
  };

  relacionamentos.forEach((relacionamento) => {
    const origemId = relacionamento.pessoa_origem_id;
    const destinoId = relacionamento.pessoa_destino_id;
    if (!origemId || !destinoId) return;

    if (
      relacionamento.tipo_relacionamento === 'filiacao_sangue' ||
      relacionamento.tipo_relacionamento === 'filiacao_adotiva'
    ) {
      addToMap(parentsByChild, destinoId, origemId);
      addToMap(childrenByParent, origemId, destinoId);
      return;
    }

    if (relacionamento.tipo_relacionamento === 'conjuge') {
      addToMap(spousesByPerson, origemId, destinoId);
      addToMap(spousesByPerson, destinoId, origemId);
    }
  });

  const generationByPersonId = new Map<string, number>();
  const queue: Array<{ personId: string; generation: number }> = [
    { personId: centralPersonId, generation: 5 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    const existingGeneration = generationByPersonId.get(current.personId);
    if (existingGeneration !== undefined) {
      const shouldKeepExisting =
        Math.abs(existingGeneration - 5) <= Math.abs(current.generation - 5);
      if (shouldKeepExisting) continue;
    }

    generationByPersonId.set(current.personId, current.generation);

    parentsByChild.get(current.personId)?.forEach((parentId) => {
      const parentGeneration = Math.max(1, current.generation - 1);
      if (parentGeneration !== current.generation) {
        queue.push({ personId: parentId, generation: parentGeneration });
      }
    });

    childrenByParent.get(current.personId)?.forEach((childId) => {
      const childGeneration = Math.min(6, current.generation + 1);
      if (childGeneration !== current.generation) {
        queue.push({ personId: childId, generation: childGeneration });
      }
    });

    spousesByPerson.get(current.personId)?.forEach((spouseId) => {
      queue.push({ personId: spouseId, generation: current.generation });
    });
  }

  return pessoas.map((pessoa) => {
    const inferredGeneration = generationByPersonId.get(pessoa.id);
    if (inferredGeneration === undefined) return pessoa;

    return {
      ...pessoa,
      manual_generation: inferredGeneration,
    };
  });
}

function getTreeTitleFirstName(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return 'Família';
  return clean.split(/\s+/)[0] || clean;
}

function getDesktopTreeTitle(viewMode: TreeViewMode, firstName: string) {
  if (viewMode === 'minha-arvore') {
    return `Árvore de ${firstName}`;
  }

  if (viewMode === 'mapa-familiar') {
    return `Mapa Familiar de ${firstName}`;
  }

  if (viewMode === 'mapa-familiar-horizontal') {
    return `Genealogia de ${firstName}`;
  }

  if (viewMode === 'genealogia') {
    return `Família de ${firstName}`;
  }

  return `Linha Genealógica de ${firstName}`;
}

interface HomeTreeSectionProps {
  isTreeResolving: boolean;
  loadError: string | null;
  pessoas: Pessoa[];
  centralReferencePersonId?: string;
  canRenderTree: boolean;
  familyTreeRef: React.RefObject<FamilyTreeActions | null>;
  visiblePersonIdsByLifeStatus?: Set<string>;
  relacionamentos: Relacionamento[];
  onPersonClick: (pessoa: Pessoa) => void;
  onPersonView: (pessoa: Pessoa) => void;
  onPersonEdit: (pessoa: Pessoa) => void;
  onPersonAddConnection: (pessoa: Pessoa) => void;
  onPersonRemove: (pessoa: Pessoa) => void;
  onMarriageClick: (details: MarriageNodeDetails) => void;
  selectedPersonId?: string;
  edgeFilters: EdgeFilters;
  directRelativeFilters: DirectRelativeFilters;
  isMobile: boolean;
  sidebarOpen?: boolean;
  treeLayoutRevision: number;
  treeViewMode: TreeViewMode;
  genealogyFilters: GenealogyFilters;
  visualLineFilters: VisualLineFilters;
  renderStateMessage: (props: StateMessageProps) => React.ReactNode;
  onDirectRelationRenderedCounts?: (counts: Record<DirectRelativeGroup, number>) => void;
}

export function HomeTreeSection({
  isTreeResolving,
  loadError,
  pessoas,
  centralReferencePersonId,
  canRenderTree,
  familyTreeRef,
  visiblePersonIdsByLifeStatus,
  relacionamentos,
  onPersonClick,
  onPersonView,
  onPersonEdit,
  onPersonAddConnection,
  onPersonRemove,
  onMarriageClick,
  selectedPersonId,
  edgeFilters,
  directRelativeFilters,
  isMobile,
  sidebarOpen = true,
  treeLayoutRevision,
  treeViewMode,
  genealogyFilters,
  visualLineFilters,
  renderStateMessage,
  onDirectRelationRenderedCounts,
}: HomeTreeSectionProps) {
  const location = useLocation();
  const shouldApplyDirectTreeVisualAdjustments = treeViewMode === 'minha-arvore';
  const usesMobileGenerationStages = isMobile && (
    treeViewMode === 'genealogia' || treeViewMode === 'visao-completa'
  );
  const [activeGenealogyGeneration, setActiveGenealogyGeneration] = React.useState<number | null>(null);
  const [familyMapHasScrolled, setFamilyMapHasScrolled] = React.useState(false);
  const [restoreViewRevision, setRestoreViewRevision] = React.useState(0);
  const effectiveTreeLayoutRevision = treeLayoutRevision + restoreViewRevision;
  const desktopTitleFirstName = React.useMemo(() => {
    const centralPerson = pessoas.find((pessoa) => pessoa.id === centralReferencePersonId);
    return getTreeTitleFirstName(centralPerson?.nome_completo);
  }, [centralReferencePersonId, pessoas]);
  const desktopTreeTitle = React.useMemo(
    () => getDesktopTreeTitle(treeViewMode, desktopTitleFirstName),
    [desktopTitleFirstName, treeViewMode]
  );
  const desktopTreeViewportTop = treeViewMode === 'minha-arvore' ? 86 : 82;
  const mobileGenealogyPessoas = React.useMemo(() => {
    if (!usesMobileGenerationStages) return pessoas;

    return inferGenealogyManualGenerations(pessoas, relacionamentos, centralReferencePersonId);
  }, [centralReferencePersonId, pessoas, relacionamentos, usesMobileGenerationStages]);
  const treePessoas = usesMobileGenerationStages ? mobileGenealogyPessoas : pessoas;
  const availableMobileGenerations = React.useMemo(() => {
    if (!usesMobileGenerationStages) return [];

    const availableGenerations = new Set<number>();

    mobileGenealogyPessoas.forEach((pessoa) => {
      const generation = getPersonGeneration(pessoa);
      if (generation === null) return;
      if (visiblePersonIdsByLifeStatus && !visiblePersonIdsByLifeStatus.has(pessoa.id)) return;

      availableGenerations.add(generation);
    });

    return Array.from(availableGenerations).sort((generationA, generationB) => generationA - generationB);
  }, [usesMobileGenerationStages, mobileGenealogyPessoas, visiblePersonIdsByLifeStatus]);
  const mobileGenerationSignature = React.useMemo(
    () => availableMobileGenerations.join('|'),
    [availableMobileGenerations]
  );
  const defaultGenealogyMobileGeneration = availableMobileGenerations[0] ?? null;
  const effectiveActiveGenealogyGeneration = usesMobileGenerationStages
    ? activeGenealogyGeneration ?? defaultGenealogyMobileGeneration
    : null;
  const shouldHideAllDirectEdges = shouldApplyDirectTreeVisualAdjustments && !(
    edgeFilters.conjugal ||
    edgeFilters.filiacao_sangue ||
    edgeFilters.filiacao_adotiva ||
    edgeFilters.irmaos
  );
  const shouldHideDirectCousinGridEdges = shouldApplyDirectTreeVisualAdjustments && !edgeFilters.irmaos;

  React.useEffect(() => {
    if (!usesMobileGenerationStages) {
      setActiveGenealogyGeneration(null);
      return;
    }

    setActiveGenealogyGeneration(defaultGenealogyMobileGeneration);
  }, [
    centralReferencePersonId,
    defaultGenealogyMobileGeneration,
    mobileGenerationSignature,
    treeViewMode,
    usesMobileGenerationStages,
  ]);

  React.useEffect(() => {
    setFamilyMapHasScrolled(false);
  }, [centralReferencePersonId, treeLayoutRevision, treeViewMode]);

  const effectiveVisiblePersonIds = visiblePersonIdsByLifeStatus;

  const handleTreeWheelCapture = React.useCallback((event: React.WheelEvent<HTMLElement>) => {
    if (isMobile || treeViewMode !== 'minha-arvore') return;
    if (event.deltaY >= 0) return;

    event.preventDefault();
    event.stopPropagation();
  }, [isMobile, treeViewMode]);

  React.useEffect(() => {
    const handleSidebarTreeAction = (event: Event) => {
      const action = (event as CustomEvent<SidebarTreeAction>).detail;

      if (action === 'restore-view') {
        setFamilyMapHasScrolled(false);
        setRestoreViewRevision((revision) => revision + 1);
        return;
      }

      const treeActions = familyTreeRef.current;
      if (!treeActions) return;

      if (action === 'zoom-in') treeActions.zoomIn();
      if (action === 'zoom-out') treeActions.zoomOut();
      if (action === 'select-area') treeActions.startAreaSelection();
      if (action === 'save-image') void treeActions.saveImage();
      if (action === 'save-pdf') void treeActions.savePdf();
      if (action === 'print') void treeActions.print();
    };

    window.addEventListener(SIDEBAR_TREE_ACTION_EVENT, handleSidebarTreeAction);
    return () => window.removeEventListener(SIDEBAR_TREE_ACTION_EVENT, handleSidebarTreeAction);
  }, [familyTreeRef]);

  return (
    <section
      className="relative min-w-0 w-0 flex-1 overflow-hidden overscroll-none bg-gray-100"
      onWheelCapture={handleTreeWheelCapture}
    >
      {!isMobile && (
        <>
          <style>
            {`
              header button[aria-label="Adicionar aos favoritos"],
              header button[aria-label="Remover dos favoritos"] {
                display: none !important;
              }

              [data-export-root="family-tree"] > .pointer-events-none.absolute.inset-x-0.z-10.text-center {
                display: none !important;
              }

              [data-export-root="family-tree"] > div.absolute.left-0.right-0 {
                top: ${desktopTreeViewportTop}px !important;
              }
            `}
          </style>
          <div
            className={[
              'pointer-events-none absolute inset-x-0 top-5 z-20 text-center transition duration-200 ease-out',
              (treeViewMode === 'mapa-familiar' || treeViewMode === 'mapa-familiar-horizontal') && familyMapHasScrolled
                ? 'opacity-0 -translate-y-2'
                : 'translate-y-0 opacity-100',
            ].join(' ')}
          >
            <h1 className="px-20 text-[clamp(1.65rem,2.1vw,2.25rem)] font-bold leading-tight text-slate-950">
              {desktopTreeTitle}
            </h1>
          </div>
          <div className="absolute right-[6.75rem] top-4 z-30">
            <PageFavoriteButton path={location.pathname} className="h-9 w-9 rounded-xl border-gray-200 shadow-sm" />
          </div>
        </>
      )}

      {isMobile && (
        <style>
          {`
            [data-export-root="family-tree"] button[aria-label="Mover árvore para cima"] {
              top: 1rem !important;
              right: 6.75rem !important;
              left: auto !important;
              transform: none !important;
              width: 2.75rem !important;
              height: 2.75rem !important;
              border-radius: 9999px !important;
              box-shadow: 0 4px 12px rgba(15, 23, 42, 0.16) !important;
            }

            [data-export-root="family-tree"] button[aria-label="Mover árvore para baixo"] {
              bottom: 6.25rem !important;
              z-index: 60 !important;
            }

            [data-export-root="family-tree"] > .pointer-events-none.absolute.inset-x-0.z-10.text-center {
              top: 4.35rem !important;
              height: 3.65rem !important;
              padding-inline: 3.25rem !important;
            }

            [data-export-root="family-tree"] > .pointer-events-none.absolute.inset-x-0.z-10.text-center h2 {
              font-size: 1.25rem !important;
              line-height: 1.15 !important;
            }

            [data-export-root="family-tree"] > .pointer-events-none.absolute.inset-x-0.z-10.text-center p {
              margin-top: 0.2rem !important;
              font-size: 0.84rem !important;
              line-height: 1.18 !important;
            }

            ${usesMobileGenerationStages ? `
              [data-export-root="family-tree"] > .pointer-events-none.absolute.inset-x-0.z-10.text-center {
                display: none !important;
              }

              [data-export-root="family-tree"] button[aria-label="Mover árvore para cima"],
              [data-export-root="family-tree"] button[aria-label="Mover árvore para baixo"],
              [data-export-root="family-tree"] button[aria-label="Mover árvore para a esquerda"],
              [data-export-root="family-tree"] button[aria-label="Mover árvore para a direita"],
              [data-export-root="family-tree"] button[aria-label="Aumentar zoom"],
              [data-export-root="family-tree"] button[aria-label="Diminuir zoom"] {
                display: none !important;
              }
            ` : ''}
          `}
        </style>
      )}

      {shouldApplyDirectTreeVisualAdjustments && (
        <style>
          {`
            .react-flow__node-personNode > .relative > .cursor-pointer {
              overflow: visible !important;
            }

            .react-flow__node-personNode h3 {
              line-height: 1.18 !important;
              padding-bottom: 0.08em;
            }

            .react-flow__node-personNode p {
              line-height: 1.2 !important;
              ${isMobile ? `
                overflow: visible !important;
                text-overflow: clip !important;
                white-space: normal !important;
              ` : `
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
              `}
            }

            ${shouldHideAllDirectEdges ? `
              .react-flow__edges .react-flow__edge,
              .react-flow__edges svg g.react-flow__edge,
              .react-flow__edges svg path.react-flow__edge-path,
              .react-flow__edges svg path.react-flow__edge-interaction {
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
            ` : ''}

            ${!shouldHideAllDirectEdges && shouldHideDirectCousinGridEdges ? `
              .react-flow__edge[data-id^="direct-primos-paternos-grid-"],
              .react-flow__edge[data-id^="direct-primos-maternos-grid-"],
              .react-flow__edge[class*="react-flow__edge-direct-primos-paternos-grid-"],
              .react-flow__edge[class*="react-flow__edge-direct-primos-maternos-grid-"],
              .react-flow__edge[data-testid*="direct-primos-paternos-grid-"],
              .react-flow__edge[data-testid*="direct-primos-maternos-grid-"],
              g.react-flow__edge[class*="direct-primos-paternos-grid-"],
              g.react-flow__edge[class*="direct-primos-maternos-grid-"] {
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
            ` : ''}
          `}
        </style>
      )}

      {usesMobileGenerationStages && (
        <GenealogyMobileStageTabs
          pessoas={mobileGenealogyPessoas}
          visiblePersonIds={visiblePersonIdsByLifeStatus}
          activeGeneration={effectiveActiveGenealogyGeneration}
          onGenerationChange={setActiveGenealogyGeneration}
        />
      )}

      {isTreeResolving ? (
        renderStateMessage({
          title: 'Carregando árvore',
          message: 'Buscando pessoas e relacionamentos…',
        })
      ) : loadError ? (
        renderStateMessage({
          title: 'Erro ao carregar a árvore',
          message: loadError,
          tone: 'error',
        })
      ) : pessoas.length === 0 || !centralReferencePersonId ? (
        renderStateMessage({
          title: 'Nenhuma pessoa encontrada',
          message: 'A tabela pessoas não retornou registros para renderizar a árvore.',
        })
      ) : canRenderTree && isMobile && (
        treeViewMode === 'minha-arvore' || treeViewMode === 'mapa-familiar'
      ) ? (
        <MobileFamilyTreeView
          pessoas={pessoas}
          visiblePersonIds={effectiveVisiblePersonIds}
          relacionamentos={relacionamentos}
          centralPersonId={centralReferencePersonId}
          familyTreeRef={familyTreeRef}
          onPersonClick={onPersonClick}
          onPersonView={onPersonView}
          onPersonEdit={onPersonEdit}
          onPersonAddConnection={onPersonAddConnection}
          onPersonRemove={onPersonRemove}
          onMarriageClick={onMarriageClick}
          selectedPersonId={selectedPersonId}
          edgeFilters={edgeFilters}
          directRelativeFilters={directRelativeFilters}
          genealogyFilters={genealogyFilters}
          visualLineFilters={visualLineFilters}
          layoutRevision={effectiveTreeLayoutRevision}
          onDirectRelationRenderedCounts={onDirectRelationRenderedCounts}
        />
      ) : canRenderTree && isMobile && treeViewMode === 'mapa-familiar-horizontal' ? (
        <MobileFamilyHorizontalMapView
          ref={familyTreeRef}
          pessoas={pessoas}
          visiblePersonIds={effectiveVisiblePersonIds}
          relacionamentos={relacionamentos}
          centralPersonId={centralReferencePersonId}
          directRelativeFilters={directRelativeFilters}
          onPersonClick={onPersonClick}
          layoutRevision={effectiveTreeLayoutRevision}
          onDirectRelationRenderedCounts={onDirectRelationRenderedCounts}
        />
      ) : canRenderTree && treeViewMode === 'mapa-familiar-horizontal' ? (
        <DesktopFamilyHorizontalMapView
          ref={familyTreeRef}
          pessoas={pessoas}
          visiblePersonIds={effectiveVisiblePersonIds}
          relacionamentos={relacionamentos}
          centralPersonId={centralReferencePersonId}
          directRelativeFilters={directRelativeFilters}
          onPersonClick={onPersonClick}
          layoutRevision={effectiveTreeLayoutRevision}
          onScrollStateChange={setFamilyMapHasScrolled}
          onDirectRelationRenderedCounts={onDirectRelationRenderedCounts}
        />
      ) : canRenderTree && treeViewMode === 'mapa-familiar' ? (
        <DesktopFamilyMapView
          ref={familyTreeRef}
          pessoas={pessoas}
          visiblePersonIds={effectiveVisiblePersonIds}
          relacionamentos={relacionamentos}
          centralPersonId={centralReferencePersonId}
          directRelativeFilters={directRelativeFilters}
          onPersonClick={onPersonClick}
          layoutRevision={effectiveTreeLayoutRevision}
          sidebarCollapsed={!sidebarOpen}
          onScrollStateChange={setFamilyMapHasScrolled}
          onDirectRelationRenderedCounts={onDirectRelationRenderedCounts}
        />
      ) : canRenderTree ? (
        <FamilyTree
          ref={familyTreeRef}
          pessoas={treePessoas}
          visiblePersonIds={effectiveVisiblePersonIds}
          relacionamentos={relacionamentos}
          onPersonClick={onPersonClick}
          onPersonView={onPersonView}
          onPersonEdit={onPersonEdit}
          onPersonAddConnection={onPersonAddConnection}
          onPersonRemove={onPersonRemove}
          onMarriageClick={onMarriageClick}
          selectedPersonId={selectedPersonId}
          edgeFilters={edgeFilters}
          directRelativeFilters={directRelativeFilters}
          centralPersonId={centralReferencePersonId}
          isMobile={isMobile}
          layoutRevision={effectiveTreeLayoutRevision}
          activeGenealogyGeneration={effectiveActiveGenealogyGeneration}
          viewMode={treeViewMode}
          genealogyFilters={genealogyFilters}
          visualLineFilters={visualLineFilters}
          onDirectRelationRenderedCounts={onDirectRelationRenderedCounts}
        />
      ) : (
        renderStateMessage({
          title: 'Carregando árvore',
          message: 'Preparando a referência principal da árvore.',
        })
      )}
    </section>
  );
}
