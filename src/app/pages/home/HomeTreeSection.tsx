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

function getTreeTitleFirstName(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return 'Família';
  return clean.split(/\s+/)[0] || clean;
}

function getDesktopTreeTitle(viewMode: TreeViewMode, firstName: string) {
  if (viewMode === 'minha-arvore') {
    return `Árvore de ${firstName}`;
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
  const usesMobileGenerationStages = isMobile && (
    treeViewMode === 'genealogia' || treeViewMode === 'visao-completa'
  );
  const [activeGenealogyGeneration, setActiveGenealogyGeneration] = React.useState<number | null>(null);
  const desktopTitleFirstName = React.useMemo(() => {
    const centralPerson = pessoas.find((pessoa) => pessoa.id === centralReferencePersonId);
    return getTreeTitleFirstName(centralPerson?.nome_completo);
  }, [centralReferencePersonId, pessoas]);
  const desktopTreeTitle = React.useMemo(
    () => getDesktopTreeTitle(treeViewMode, desktopTitleFirstName),
    [desktopTitleFirstName, treeViewMode]
  );
  const desktopTreeViewportTop = treeViewMode === 'minha-arvore' ? 86 : 82;
  const availableMobileGenerations = React.useMemo(() => {
    if (!usesMobileGenerationStages) return [];

    const availableGenerations = new Set<number>();

    pessoas.forEach((pessoa) => {
      const generation = getPersonGeneration(pessoa);
      if (generation === null) return;
      if (visiblePersonIdsByLifeStatus && !visiblePersonIdsByLifeStatus.has(pessoa.id)) return;

      availableGenerations.add(generation);
    });

    return Array.from(availableGenerations).sort((generationA, generationB) => generationA - generationB);
  }, [usesMobileGenerationStages, pessoas, visiblePersonIdsByLifeStatus]);
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

  const effectiveVisiblePersonIds = visiblePersonIdsByLifeStatus;

  return (
    <section
      className="relative min-w-0 w-0 flex-1 overflow-hidden overscroll-none bg-gray-100"
    >
      {!isMobile && (
        <>
          <style>
            {`
              [data-export-root="family-tree"] > .pointer-events-none.absolute.inset-x-0.z-10.text-center {
                display: none !important;
              }

              [data-export-root="family-tree"] > div.absolute.left-0.right-0 {
                top: ${desktopTreeViewportTop}px !important;
              }
            `}
          </style>
          <div className="pointer-events-none absolute inset-x-0 top-5 z-20 text-center">
            <h1 className="px-20 text-[clamp(1.65rem,2.1vw,2.25rem)] font-bold leading-tight text-slate-950">
              {desktopTreeTitle}
            </h1>
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
