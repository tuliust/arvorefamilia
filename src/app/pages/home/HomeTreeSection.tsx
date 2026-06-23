import React from 'react';
import { useLocation } from 'react-router';

import type { FamilyTreeActions } from '../../components/FamilyTree/actions';
import { DesktopFamilyMapView } from '../../components/FamilyTree/DesktopFamilyMapView';
import { DesktopFamilyHorizontalMapFilteredView } from '../../components/FamilyTree/DesktopFamilyHorizontalMapFilteredView';
import { MobileFamilyHorizontalMapFilteredView } from '../../components/FamilyTree/MobileFamilyHorizontalMapFilteredView';
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
import {
  dispatchTreeAction,
  SIDEBAR_TREE_ACTION_EVENT,
  type SidebarTreeAction,
} from './SidebarPanelTabs';
import { Minus, Plus, Scan } from 'lucide-react';

interface StateMessageProps {
  title: string;
  message: string;
  tone?: 'neutral' | 'error';
}

function getTreeTitleFirstName(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return 'Família';
  return clean.split(/\s+/)[0] || clean;
}

function getDesktopTreeTitle(viewMode: TreeViewMode, firstName: string) {
  if (viewMode === 'mapa-familiar') {
    return `Árvore Familiar de ${firstName}`;
  }

  return `Mapa Genealógico de ${firstName}`;
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
  const desktopTreeViewportTop = 82;
  React.useEffect(() => {
    setFamilyMapHasScrolled(false);
  }, [centralReferencePersonId, treeLayoutRevision, treeViewMode]);

  const effectiveVisiblePersonIds = visiblePersonIdsByLifeStatus;

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
    <section className="relative min-w-0 w-0 flex-1 overflow-hidden overscroll-none bg-gray-100">
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
          <div className="absolute right-[6.75rem] top-4 z-30" data-tour-target="tree-favorite">
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
          `}
        </style>
      )}

      {!isMobile && canRenderTree && (
        <div className="tree-canvas-zoom-controls" aria-label="Controles de zoom da árvore" data-tree-export-ignore="true">
          <button type="button" onClick={() => dispatchTreeAction('zoom-in')} aria-label="Aumentar zoom" title="Aumentar zoom">
            <Plus className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => dispatchTreeAction('zoom-out')} aria-label="Diminuir zoom" title="Diminuir zoom">
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => dispatchTreeAction('restore-view')} aria-label="Restaurar visualização" title="Restaurar visualização">
            <Scan className="h-4 w-4" />
          </button>
        </div>
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
      ) : canRenderTree && isMobile && treeViewMode === 'mapa-familiar' ? (
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
        <MobileFamilyHorizontalMapFilteredView
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
        <DesktopFamilyHorizontalMapFilteredView
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
      ) : (
        renderStateMessage({
          title: 'Carregando árvore',
          message: 'Preparando a referência principal da árvore.',
        })
      )}
    </section>
  );
}
