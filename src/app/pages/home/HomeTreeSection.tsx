import React from 'react';

import { FamilyTree, type FamilyTreeActions } from '../../components/FamilyTree/FamilyTree';
import type {
  DirectRelativeFilters,
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
}: HomeTreeSectionProps) {
  return (
    <section
      className="relative min-w-0 w-0 flex-1 overflow-hidden bg-gray-100"
    >
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
