import React from 'react';

import { FamilyTree, type FamilyTreeActions } from '../../components/FamilyTree/FamilyTree';
import type {
  DirectRelativeFilters,
  DirectRelativeGroup,
  EdgeFilters,
  GenealogyFilters,
  MarriageNodeDetails,
  VisualLineFilters,
} from '../../components/FamilyTree/types';
import type { TreeViewMode } from '../../components/FamilyTree/treeViewMode';
import type { Pessoa, Relacionamento } from '../../types';
import { GenealogyMobileStageTabs } from './GenealogyMobileStageTabs';

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

function getGenealogyMobileStageViewportOffset(generation: number | null) {
  switch (generation) {
    case 4:
    case 5:
    case 6:
      return -100;
    case 1:
    case 2:
    case 3:
    default:
      return 0;
  }
}

interface HomeTreeSectionProps {
  isTreeResolving: boolean;
  loadError: string | null;
  pessoas: Pessoa[];
  centralReferencePersonId?: string;
  canRenderTree: boolean;
  familyTreeRef: React.Ref<FamilyTreeActions>;
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
  treeLayoutRevision,
  treeViewMode,
  genealogyFilters,
  visualLineFilters,
  renderStateMessage,
  onDirectRelationRenderedCounts,
}: HomeTreeSectionProps) {
  const shouldApplyDirectTreeVisualAdjustments = treeViewMode === 'minha-arvore';
  const isGenealogyMobile = isMobile && treeViewMode === 'genealogia';
  const [activeGenealogyGeneration, setActiveGenealogyGeneration] = React.useState<number | null>(null);
  const defaultGenealogyMobileGeneration = React.useMemo(() => {
    if (!isGenealogyMobile) return null;

    const availableGenerations = new Set<number>();

    pessoas.forEach((pessoa) => {
      const generation = getPersonGeneration(pessoa);
      if (generation === null) return;
      if (visiblePersonIdsByLifeStatus && !visiblePersonIdsByLifeStatus.has(pessoa.id)) return;

      availableGenerations.add(generation);
    });

    return Array.from(availableGenerations).sort((generationA, generationB) => generationA - generationB)[0] ?? null;
  }, [isGenealogyMobile, pessoas, visiblePersonIdsByLifeStatus]);
  const effectiveActiveGenealogyGeneration = isGenealogyMobile
    ? activeGenealogyGeneration ?? defaultGenealogyMobileGeneration
    : null;
  const genealogyMobileStageViewportOffset = isGenealogyMobile
    ? getGenealogyMobileStageViewportOffset(effectiveActiveGenealogyGeneration)
    : 0;
  const shouldHideAllDirectEdges = shouldApplyDirectTreeVisualAdjustments && !(
    edgeFilters.conjugal ||
    edgeFilters.filiacao_sangue ||
    edgeFilters.filiacao_adotiva ||
    edgeFilters.irmaos
  );
  const shouldHideDirectCousinGridEdges = shouldApplyDirectTreeVisualAdjustments && !edgeFilters.irmaos;

  React.useEffect(() => {
    if (!isGenealogyMobile) {
      setActiveGenealogyGeneration(null);
      return;
    }

    if (activeGenealogyGeneration === null && defaultGenealogyMobileGeneration !== null) {
      setActiveGenealogyGeneration(defaultGenealogyMobileGeneration);
    }
  }, [activeGenealogyGeneration, defaultGenealogyMobileGeneration, isGenealogyMobile]);

  const effectiveVisiblePersonIds = visiblePersonIdsByLifeStatus;

  return (
    <section
      className="relative min-w-0 w-0 flex-1 overflow-hidden bg-gray-100"
    >
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

            ${isGenealogyMobile ? `
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

              [data-export-root="family-tree"][data-export-view="genealogia"] .react-flow__viewport {
                translate: 0 ${genealogyMobileStageViewportOffset}px;
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

      {isGenealogyMobile && (
        <GenealogyMobileStageTabs
          pessoas={pessoas}
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
      ) : canRenderTree ? (
        <FamilyTree
          ref={familyTreeRef}
          pessoas={pessoas}
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
          layoutRevision={treeLayoutRevision}
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
