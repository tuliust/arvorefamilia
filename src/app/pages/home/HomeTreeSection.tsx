import React from 'react';
import { useLocation, type Location } from 'react-router';
import { FileDown, ImageDown, Minus, Plus, Printer, Scan } from 'lucide-react';

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

interface StateMessageProps {
  title: string;
  message: string;
  tone?: 'neutral' | 'error';
}

const EXPORT_PREVIEW_PNG_SCALE = 1.5;

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

function getExportPreviewIntent(action: SidebarTreeAction) {
  if (action === 'save-image') return 'png';
  if (action === 'save-pdf') return 'pdf';
  if (action === 'print') return 'print';
  return null;
}

function openTreeExportPreviewRoute(location: Location, action: SidebarTreeAction) {
  const intent = getExportPreviewIntent(action);
  if (!intent) return false;

  const params = new URLSearchParams(location.search);
  params.set('exportPreview', '1');
  params.set('exportIntent', intent);
  params.delete('exportAction');
  params.delete('tutorial');

  const query = params.toString();
  const url = `${location.pathname}${query ? `?${query}` : ''}`;
  const previewWindow = window.open(url, '_blank', 'noopener,noreferrer');

  if (!previewWindow) {
    window.alert('O navegador bloqueou a janela de preview da exportação. Libere pop-ups para este site e tente novamente.');
  }

  return true;
}

function getExportIntentTitle(intent: string | null) {
  if (intent === 'png') return 'Salvar imagem da árvore';
  if (intent === 'pdf') return 'Exportar PDF da árvore';
  if (intent === 'print') return 'Imprimir árvore';
  return 'Preview de exportação';
}

function getPreviewExportRoot() {
  return document.querySelector<HTMLElement>([
    '[data-family-map-export-root="true"]',
    '[data-family-map-horizontal-root="true"]',
    '[data-export-root="family-tree"]',
  ].join(','));
}

function buildPreviewPngFilename(viewMode: TreeViewMode, title: string) {
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('-');
  const safeTitle = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const fallback = viewMode === 'mapa-familiar-horizontal' ? 'mapa-genealogico' : 'arvore-familiar';

  return `${safeTitle || fallback}-${timestamp}.png`;
}

function waitForAnimationFrame() {
  return new Promise<void>((resolve) => {
    if (typeof window.requestAnimationFrame !== 'function') {
      resolve();
      return;
    }

    window.requestAnimationFrame(() => resolve());
  });
}

async function waitForPreviewExportStability() {
  const documentWithFonts = document as Document & { fonts?: { ready?: Promise<unknown> } };

  try {
    await Promise.race([
      Promise.resolve(documentWithFonts.fonts?.ready),
      new Promise((resolve) => window.setTimeout(resolve, 3000)),
    ]);
  } catch {
    // Font readiness is best effort. The preview can still be saved with fallback rendering.
  }

  await waitForAnimationFrame();
  await waitForAnimationFrame();
}

function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('Não foi possível preparar a imagem PNG para salvar.'));
    }, 'image/png');
  });
}

async function downloadPreviewTreeAsPng(filename: string) {
  const root = getPreviewExportRoot();

  if (!root) {
    throw new Error('Área da árvore não encontrada no preview de exportação.');
  }

  await waitForPreviewExportStability();

  const { default: html2canvas } = await import('html2canvas');
  const rect = root.getBoundingClientRect();
  const width = Math.ceil(Math.max(rect.width, root.offsetWidth, root.scrollWidth, 1));
  const height = Math.ceil(Math.max(rect.height, root.offsetHeight, root.scrollHeight, 1));
  const canvas = await html2canvas(root, {
    backgroundColor: '#f7f1e8',
    scale: EXPORT_PREVIEW_PNG_SCALE,
    width,
    height,
    windowWidth: Math.max(window.innerWidth, document.documentElement.clientWidth, width),
    windowHeight: Math.max(window.innerHeight, document.documentElement.clientHeight, height),
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
    useCORS: true,
    allowTaint: false,
    imageTimeout: 15000,
    logging: false,
    removeContainer: true,
    ignoreElements: (node) => Boolean((node as HTMLElement).closest?.('[data-tree-export-ignore="true"]')),
  });

  const blob = await canvasToPngBlob(canvas);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
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
  const [exportPreviewBusy, setExportPreviewBusy] = React.useState(false);
  const effectiveTreeLayoutRevision = treeLayoutRevision + restoreViewRevision;
  const searchParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isExportPreview = searchParams.get('exportPreview') === '1';
  const exportIntent = searchParams.get('exportIntent');
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

  const handleSavePreviewPng = React.useCallback(async () => {
    if (exportPreviewBusy) return;

    setExportPreviewBusy(true);

    try {
      await downloadPreviewTreeAsPng(buildPreviewPngFilename(treeViewMode, desktopTreeTitle));
    } catch (error) {
      console.error('Erro ao salvar PNG do preview da árvore:', error);
      window.alert(error instanceof Error ? error.message : 'Não foi possível salvar a imagem da árvore.');
    } finally {
      setExportPreviewBusy(false);
    }
  }, [desktopTreeTitle, exportPreviewBusy, treeViewMode]);

  React.useEffect(() => {
    const handleSidebarTreeAction = (event: Event) => {
      const action = (event as CustomEvent<SidebarTreeAction>).detail;

      if (!isExportPreview && (action === 'save-image' || action === 'save-pdf' || action === 'print')) {
        openTreeExportPreviewRoute(location, action);
        return;
      }

      if (isExportPreview && action === 'save-image') {
        void handleSavePreviewPng();
        return;
      }

      if (isExportPreview && (action === 'save-pdf' || action === 'print')) {
        window.print();
        return;
      }

      if (action === 'restore-view') {
        setFamilyMapHasScrolled(false);
        setRestoreViewRevision((revision) => revision + 1);
        return;
      }

      const treeActions = familyTreeRef.current;
      if (!treeActions) return;

      if (action === 'zoom-in') {
        treeActions.zoomIn();
        return;
      }

      if (action === 'zoom-out') {
        treeActions.zoomOut();
        return;
      }

      if (action === 'select-area') {
        treeActions.startAreaSelection();
        return;
      }

      if (action === 'save-image') {
        void treeActions.saveImage();
        return;
      }

      if (action === 'save-pdf') {
        void treeActions.savePdf();
        return;
      }

      if (action === 'print') {
        void treeActions.print();
      }
    };

    window.addEventListener(SIDEBAR_TREE_ACTION_EVENT, handleSidebarTreeAction);
    return () => window.removeEventListener(SIDEBAR_TREE_ACTION_EVENT, handleSidebarTreeAction);
  }, [familyTreeRef, handleSavePreviewPng, isExportPreview, location]);

  const showPngButton = !exportIntent || exportIntent === 'png';
  const showPdfButton = !exportIntent || exportIntent === 'pdf';
  const showPrintButton = !exportIntent || exportIntent === 'print';

  return (
    <section
      className={["relative min-w-0 w-0 flex-1 overflow-hidden overscroll-none", isExportPreview ? 'bg-[#f7f1e8]' : 'bg-gray-100'].join(' ')}
      data-tree-export-preview-page={isExportPreview ? 'true' : undefined}
    >
      {isExportPreview && (
        <style>
          {`
            body:has([data-tree-export-preview-page="true"]) header,
            body:has([data-tree-export-preview-page="true"]) aside,
            body:has([data-tree-export-preview-page="true"]) nav,
            body:has([data-tree-export-preview-page="true"]) [data-tour-target="tree-favorite"],
            body:has([data-tree-export-preview-page="true"]) .tree-canvas-zoom-controls,
            body:has([data-tree-export-preview-page="true"]) a[href="/duvidas"].fixed.bottom-8.right-8 {
              display: none !important;
            }

            body:has([data-tree-export-preview-page="true"]) main {
              width: 100vw !important;
              height: 100vh !important;
              max-width: 100vw !important;
              overflow: hidden !important;
            }

            body:has([data-tree-export-preview-page="true"]) [data-tree-export-preview-page="true"] {
              min-width: 100vw !important;
              width: 100vw !important;
              flex-basis: 100vw !important;
            }

            @media print {
              [data-tree-export-preview-toolbar="true"] {
                display: none !important;
              }

              body:has([data-tree-export-preview-page="true"]),
              body:has([data-tree-export-preview-page="true"]) main,
              body:has([data-tree-export-preview-page="true"]) [data-tree-export-preview-page="true"] {
                width: 100vw !important;
                height: 100vh !important;
                background: #f7f1e8 !important;
              }
            }
          `}
        </style>
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
              !isExportPreview && (treeViewMode === 'mapa-familiar' || treeViewMode === 'mapa-familiar-horizontal') && familyMapHasScrolled
                ? 'opacity-0 -translate-y-2'
                : 'translate-y-0 opacity-100',
            ].join(' ')}
          >
            <h1 className="px-20 text-[clamp(1.65rem,2.1vw,2.25rem)] font-bold leading-tight text-slate-950">
              {desktopTreeTitle}
            </h1>
          </div>
          {!isExportPreview && (
            <div className="absolute right-[6.75rem] top-4 z-30" data-tour-target="tree-favorite">
              <PageFavoriteButton path={location.pathname} className="h-9 w-9 rounded-xl border-gray-200 shadow-sm" />
            </div>
          )}
        </>
      )}

      {isExportPreview && canRenderTree && (
        <div
          className="absolute right-5 top-5 z-40 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur"
          data-tree-export-preview-toolbar="true"
          data-tree-export-ignore="true"
          aria-label={getExportIntentTitle(exportIntent)}
        >
          {showPngButton && (
            <button
              type="button"
              disabled={exportPreviewBusy}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSavePreviewPng}
            >
              <ImageDown className="h-4 w-4" />
              {exportPreviewBusy ? 'Preparando PNG...' : 'Salvar PNG'}
            </button>
          )}
          {showPdfButton && (
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-blue-50 hover:text-blue-800"
              onClick={() => window.print()}
              title="Use a opção Salvar como PDF na janela de impressão do navegador."
            >
              <FileDown className="h-4 w-4" />
              Exportar PDF
            </button>
          )}
          {showPrintButton && (
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-blue-50 hover:text-blue-800"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
          )}
        </div>
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

      {!isMobile && canRenderTree && !isExportPreview && (
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
          sidebarCollapsed={isExportPreview ? true : !sidebarOpen}
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
