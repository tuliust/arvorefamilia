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

interface StateMessageProps {
  title: string;
  message: string;
  tone?: 'neutral' | 'error';
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
  const shouldHideAllDirectEdges = shouldApplyDirectTreeVisualAdjustments && !(
    edgeFilters.conjugal ||
    edgeFilters.filiacao_sangue ||
    edgeFilters.filiacao_adotiva ||
    edgeFilters.irmaos
  );
  const shouldHideDirectCousinGridEdges = shouldApplyDirectTreeVisualAdjustments && !edgeFilters.irmaos;

  return (
    <section
      className="relative min-w-0 w-0 flex-1 overflow-hidden bg-gray-100"
    >
      {isMobile && (
        <style>
          {`
            [data-export-root="family-tree"] button[aria-label="Mover árvore para cima"] {
              top: 1rem !important;
              right: 6.5rem !important;
              left: auto !important;
              transform: none !important;
              width: 2.25rem !important;
              height: 2.25rem !important;
              border-radius: 0.5rem !important;
              box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12) !important;
            }

            [data-export-root="family-tree"] > .pointer-events-none.absolute.inset-x-0.z-10.text-center {
              top: 4rem !important;
              height: 3rem !important;
              padding-inline: 4.5rem !important;
            }

            [data-export-root="family-tree"] > .pointer-events-none.absolute.inset-x-0.z-10.text-center h2 {
              font-size: 1rem !important;
              line-height: 1.1 !important;
            }

            [data-export-root="family-tree"] > .pointer-events-none.absolute.inset-x-0.z-10.text-center p {
              margin-top: 0.125rem !important;
              font-size: 0.72rem !important;
              line-height: 1.12 !important;
            }
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
              overflow: visible !important;
              text-overflow: clip !important;
              white-space: normal !important;
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
          visiblePersonIds={visiblePersonIdsByLifeStatus}
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
