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
import { Loader2, Minus, Plus, Scan } from 'lucide-react';

interface StateMessageProps {
  title: string;
  message: string;
  tone?: 'neutral' | 'error';
}

type TreeExportAction = Extract<SidebarTreeAction, 'save-image' | 'save-pdf' | 'print'>;

const TREE_EXPORT_LOADING_CONTENT: Record<TreeExportAction, { title: string; message: string }> = {
  'save-image': {
    title: 'Preparando imagem',
    message: 'Gerando a imagem da Árvore. A janela de salvar ser? aberta em instantes.',
  },
  'save-pdf': {
    title: 'Preparando PDF',
    message: 'Gerando o PDF da Árvore. A janela de salvar ser? aberta em instantes.',
  },
  print: {
    title: 'Preparando impressão',
    message: 'Gerando a visualização de impressão da Árvore.',
  },
};

function getTreeTitleFirstName(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return 'FamÃ­lia';
  return clean.split(/\s+/)[0] || clean;
}

function getDesktopTreeTitle(viewMode: TreeViewMode, firstName: string) {
  if (viewMode === 'mapa-familiar') {
    return `Ãrvore Familiar de ${firstName}`;
  }

  return `Mapa GenealÃ³gico de ${firstName}`;
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
  const [activeExportAction, setActiveExportAction] = React.useState<TreeExportAction | null>(null);
  const exportLoadingTimeoutRef = React.useRef<number | null>(null);
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

  const clearExportLoading = React.useCallback((action: TreeExportAction, delay = 0) => {
    if (exportLoadingTimeoutRef.current !== null) {
      window.clearTimeout(exportLoadingTimeoutRef.current);
    }

    exportLoadingTimeoutRef.current = window.setTimeout(() => {
      setActiveExportAction((currentAction) => (
        currentAction === action ? null : currentAction
      ));
      exportLoadingTimeoutRef.current = null;
    }, delay);
  }, []);

  const waitForSystemExportDialog = React.useCallback((action: TreeExportAction) => {
    return new Promise<void>((resolve) => {
      let settled = false;
      let fallbackTimer: number | null = null;
      let postBlurTimer: number | null = null;

      const cleanup = () => {
        window.removeEventListener('blur', handleLikelyDialogOpen);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        if (fallbackTimer !== null) {
          window.clearTimeout(fallbackTimer);
        }

        if (postBlurTimer !== null) {
          window.clearTimeout(postBlurTimer);
        }
      };

      const finish = () => {
        if (settled) return;

        settled = true;
        cleanup();
        resolve();
      };

      const handleLikelyDialogOpen = () => {
        // Mantem o modal por um curto intervalo depois do blur para evitar
        // piscada antes da janela do sistema assumir o foco visual.
        postBlurTimer = window.setTimeout(finish, 900);
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState !== 'visible') {
          handleLikelyDialogOpen();
        }
      };

      window.addEventListener('blur', handleLikelyDialogOpen, { once: true });
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Fallback: alguns navegadores/downloads não disparam blur.
      // Nestes casos, manter o modal durante o período cr?tico evita a sensação de travamento.
      const fallbackMs = action === 'print' ? 45000 : 60000;
      fallbackTimer = window.setTimeout(finish, fallbackMs);
    });
  }, []);

  const runExportAction = React.useCallback(async (
    action: TreeExportAction,
    executor: () => Promise<void>
  ) => {
    setActiveExportAction(action);

    try {
      await executor();
      await waitForSystemExportDialog(action);
    } finally {
      clearExportLoading(action, 250);
    }
  }, [clearExportLoading, waitForSystemExportDialog]);

  React.useEffect(() => () => {
    if (exportLoadingTimeoutRef.current !== null) {
      window.clearTimeout(exportLoadingTimeoutRef.current);
    }
  }, []);

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

      if (action === 'save-image') {
        void runExportAction(action, () => treeActions.saveImage());
      }

      if (action === 'save-pdf') {
        void runExportAction(action, () => treeActions.savePdf());
      }

      if (action === 'print') {
        void runExportAction(action, () => treeActions.print());
      }
    };

    window.addEventListener(SIDEBAR_TREE_ACTION_EVENT, handleSidebarTreeAction);
    return () => window.removeEventListener(SIDEBAR_TREE_ACTION_EVENT, handleSidebarTreeAction);
  }, [familyTreeRef, runExportAction]);

  const activeExportContent = activeExportAction
    ? TREE_EXPORT_LOADING_CONTENT[activeExportAction]
    : null;

  return (
    <section className="relative min-w-0 w-0 flex-1 overflow-hidden overscroll-none bg-gray-100">
      {activeExportContent && (
        <TreeGlobalExportLoadingOverlay
          title={activeExportContent.title}
          message={activeExportContent.message}
        />
      )}

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
            [data-export-root="family-tree"] button[aria-label="Mover Ã¡rvore para cima"] {
              top: 1rem !important;
              right: 6.75rem !important;
              left: auto !important;
              transform: none !important;
              width: 2.75rem !important;
              height: 2.75rem !important;
              border-radius: 9999px !important;
              box-shadow: 0 4px 12px rgba(15, 23, 42, 0.16) !important;
            }

            [data-export-root="family-tree"] button[aria-label="Mover Ã¡rvore para baixo"] {
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
        <div className="tree-canvas-zoom-controls" aria-label="Controles de zoom da Ã¡rvore" data-tree-export-ignore="true">
          <button type="button" onClick={() => dispatchTreeAction('zoom-in')} aria-label="Aumentar zoom" title="Aumentar zoom">
            <Plus className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => dispatchTreeAction('zoom-out')} aria-label="Diminuir zoom" title="Diminuir zoom">
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => dispatchTreeAction('restore-view')} aria-label="Restaurar visualizaÃ§Ã£o" title="Restaurar visualizaÃ§Ã£o">
            <Scan className="h-4 w-4" />
          </button>
        </div>
      )}

      {isTreeResolving ? (
        renderStateMessage({
          title: 'Carregando Ã¡rvore',
          message: 'Buscando pessoas e relacionamentosâ€¦',
        })
      ) : loadError ? (
        renderStateMessage({
          title: 'Erro ao carregar a Ã¡rvore',
          message: loadError,
          tone: 'error',
        })
      ) : pessoas.length === 0 || !centralReferencePersonId ? (
        renderStateMessage({
          title: 'Nenhuma pessoa encontrada',
          message: 'A tabela pessoas nÃ£o retornou registros para renderizar a Ã¡rvore.',
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
          title: 'Carregando Ã¡rvore',
          message: 'Preparando a referÃªncia principal da Ã¡rvore.',
        })
      )}
    </section>
  );
}

function TreeGlobalExportLoadingOverlay({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div
      data-tree-export-ignore="true"
      data-tree-export-loading="true"
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby="tree-global-export-loading-title"
      aria-describedby="tree-global-export-loading-message"
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-700" aria-hidden="true" />
        <p id="tree-global-export-loading-title" className="mt-3 text-sm font-bold text-slate-950">
          {title}
        </p>
        <p id="tree-global-export-loading-message" className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
          {message}
        </p>
      </div>
    </div>
  );
}
