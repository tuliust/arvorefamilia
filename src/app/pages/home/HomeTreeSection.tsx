import React from 'react';
import { useLocation } from 'react-router';
import { FileDown, ImageDown, Minus, Plus, Printer, Scan } from 'lucide-react';
import { toast } from 'sonner';

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
import { injectExportSafeCss, sanitizeUnsupportedExportColors } from '../../components/FamilyTree/utils/exportColorSanitizer';
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
const EXPORT_PREVIEW_SAFE_PADDING = 28;
const EXPORT_PREVIEW_CAPTURE_CLASS = 'tree-export-preview-capture-mode';
const TREE_EXPORT_ROOT_SELECTOR = [
  '[data-family-map-export-root="true"]',
  '[data-family-map-horizontal-root="true"]',
  '[data-export-root="family-tree"]',
].join(',');

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

function openTreeExportPreviewRoute(location: ReturnType<typeof useLocation>, action: SidebarTreeAction) {
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
    toast.warning('O navegador bloqueou a janela de preview da exporta��o. Libere pop-ups para este site e tente novamente.');
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
  return document.querySelector<HTMLElement>(TREE_EXPORT_ROOT_SELECTOR);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildPreviewExportFilename(viewMode: TreeViewMode, title: string, extension: 'png' | 'pdf') {
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

  return `${safeTitle || fallback}-${timestamp}.${extension}`;
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

function addSafePaddingToCanvas(sourceCanvas: HTMLCanvasElement) {
  const padding = Math.max(0, Math.round(EXPORT_PREVIEW_SAFE_PADDING * EXPORT_PREVIEW_PNG_SCALE));
  if (!padding) return sourceCanvas;

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = sourceCanvas.width + padding * 2;
  outputCanvas.height = sourceCanvas.height + padding * 2;

  const context = outputCanvas.getContext('2d');
  if (!context) return sourceCanvas;

  context.fillStyle = '#f7f1e8';
  context.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  context.drawImage(sourceCanvas, padding, padding);

  return outputCanvas;
}

function injectPreviewCaptureCss(documentRef: Document) {
  if (documentRef.getElementById('tree-export-preview-capture-mode-css')) return;

  const style = documentRef.createElement('style');
  style.id = 'tree-export-preview-capture-mode-css';
  style.textContent = `
    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-export-root="true"],
    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-horizontal-root="true"],
    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-export-root="family-tree"] {
      overflow: visible !important;
      background: #f7f1e8 !important;
      isolation: isolate !important;
    }

    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-export-root="true"] *,
    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-horizontal-root="true"] *,
    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-export-root="family-tree"] * {
      box-shadow: none !important;
      text-shadow: none !important;
      filter: none !important;
      -webkit-filter: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }

    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-export-root="true"] [class*="shadow"],
    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-horizontal-root="true"] [class*="shadow"],
    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-export-root="family-tree"] [class*="shadow"],
    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-export-root="true"] [class*="blur"],
    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-horizontal-root="true"] [class*="blur"],
    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-export-root="family-tree"] [class*="blur"] {
      box-shadow: none !important;
      filter: none !important;
      -webkit-filter: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }

    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-tree-export-ignore="true"] {
      display: none !important;
      visibility: hidden !important;
    }

    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-group-title="true"] {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: visible !important;
      text-align: center !important;
      white-space: nowrap !important;
      line-height: 1 !important;
      padding-top: 0.16rem !important;
      padding-bottom: 0.12rem !important;
    }

    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-person-name="true"] {
      margin-bottom: 0.16rem !important;
      line-height: 1.15 !important;
    }

    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-meta-row="true"] {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 0.14rem !important;
      line-height: 1.15 !important;
      text-align: left !important;
    }

    html.${EXPORT_PREVIEW_CAPTURE_CLASS} [data-family-map-meta-icon="true"] {
      flex: 0 0 auto !important;
      align-self: center !important;
      margin: 0 !important;
      vertical-align: middle !important;
    }
  `;
  documentRef.head.appendChild(style);
}

function sanitizePreviewCaptureDom(documentRef: Document) {
  documentRef.querySelectorAll<HTMLElement>(TREE_EXPORT_ROOT_SELECTOR).forEach((root) => {
    root.style.setProperty('overflow', 'visible', 'important');
    root.style.setProperty('background', '#f7f1e8', 'important');
    root.style.setProperty('isolation', 'isolate', 'important');

    root.querySelectorAll<HTMLElement>('*').forEach((node) => {
      node.style.setProperty('box-shadow', 'none', 'important');
      node.style.setProperty('text-shadow', 'none', 'important');
      node.style.setProperty('filter', 'none', 'important');
      node.style.setProperty('-webkit-filter', 'none', 'important');
      node.style.setProperty('backdrop-filter', 'none', 'important');
      node.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
    });
  });

  documentRef.querySelectorAll<HTMLElement>('[data-tree-export-ignore="true"]').forEach((node) => {
    node.style.setProperty('display', 'none', 'important');
    node.style.setProperty('visibility', 'hidden', 'important');
  });
}

async function withPreviewCaptureMode<T>(callback: () => Promise<T>) {
  injectPreviewCaptureCss(document);
  document.documentElement.classList.add(EXPORT_PREVIEW_CAPTURE_CLASS);

  try {
    await waitForAnimationFrame();
    await waitForAnimationFrame();
    return await callback();
  } finally {
    document.documentElement.classList.remove(EXPORT_PREVIEW_CAPTURE_CLASS);
  }
}

function preparePreviewCloneForCapture(clonedDocument: Document) {
  clonedDocument.documentElement.classList.add(EXPORT_PREVIEW_CAPTURE_CLASS);
  injectExportSafeCss(clonedDocument);
  injectPreviewCaptureCss(clonedDocument);
  sanitizeUnsupportedExportColors(clonedDocument.body);
  sanitizePreviewCaptureDom(clonedDocument);
}

async function capturePreviewTreeCanvas() {
  const root = getPreviewExportRoot();

  if (!root) {
    throw new Error('Área da árvore não encontrada no preview de exportação.');
  }

  const { default: html2canvas } = await import('html2canvas');

  return withPreviewCaptureMode(async () => {
    await waitForPreviewExportStability();

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
      onclone: preparePreviewCloneForCapture,
    });

    return addSafePaddingToCanvas(canvas);
  });
}

async function downloadPreviewTreeAsPng(filename: string) {
  const canvas = await capturePreviewTreeCanvas();
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

async function downloadPreviewTreeAsPdf(filename: string, title: string) {
  const canvas = await capturePreviewTreeCanvas();
  const { jsPDF } = await import('jspdf');
  const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: 'a4',
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;
  const fitRatio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
  const imageWidth = canvas.width * fitRatio;
  const imageHeight = canvas.height * fitRatio;
  const imageX = (pageWidth - imageWidth) / 2;
  const imageY = (pageHeight - imageHeight) / 2;

  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', imageX, imageY, imageWidth, imageHeight);
  pdf.setProperties({ title });
  pdf.save(filename);
}

async function printPreviewTreeOnOnePage(title: string) {
  const canvas = await capturePreviewTreeCanvas();
  const imageUrl = canvas.toDataURL('image/png');
  const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';
  const iframe = document.createElement('iframe');

  iframe.setAttribute('title', title);
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  const printWindow = iframe.contentWindow;
  const printDocument = iframe.contentDocument;

  if (!printWindow || !printDocument) {
    iframe.remove();
    throw new Error('Não foi possível preparar a janela de impressão.');
  }

  printDocument.open();
  printDocument.write(`<!doctype html>
<html>
  <head>
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: ${orientation}; margin: 0; }
      html, body { margin: 0; width: 100%; height: 100%; background: #f7f1e8; }
      body { display: flex; align-items: center; justify-content: center; overflow: hidden; }
      img { display: block; width: 100vw; height: 100vh; object-fit: contain; }
      @media print {
        html, body { width: 100%; height: 100%; }
        img { width: 100vw; height: 100vh; object-fit: contain; }
      }
    </style>
  </head>
  <body>
    <img src="${imageUrl}" alt="${escapeHtml(title)}" />
  </body>
</html>`);
  printDocument.close();

  await new Promise<void>((resolve, reject) => {
    const image = printDocument.querySelector('img');
    const cleanup = () => window.setTimeout(() => iframe.remove(), 1200);
    const print = () => {
      try {
        printWindow.focus();
        printWindow.print();
        cleanup();
        resolve();
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    if (!image) {
      window.setTimeout(print, 100);
      return;
    }

    if (image.complete) {
      window.setTimeout(print, 100);
      return;
    }

    image.addEventListener('load', () => window.setTimeout(print, 100), { once: true });
    image.addEventListener('error', () => {
      cleanup();
      reject(new Error('Não foi possível carregar a imagem para impressão.'));
    }, { once: true });
  });
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

  const runPreviewExport = React.useCallback(async (action: 'png' | 'pdf' | 'print') => {
    if (exportPreviewBusy) return;

    setExportPreviewBusy(true);

    try {
      if (action === 'png') {
        await downloadPreviewTreeAsPng(buildPreviewExportFilename(treeViewMode, desktopTreeTitle, 'png'));
        return;
      }

      if (action === 'pdf') {
        await downloadPreviewTreeAsPdf(buildPreviewExportFilename(treeViewMode, desktopTreeTitle, 'pdf'), desktopTreeTitle);
        return;
      }

      await printPreviewTreeOnOnePage(desktopTreeTitle);
    } catch (error) {
      console.error('Erro ao exportar preview da árvore:', error);
      window.alert(error instanceof Error ? error.message : 'Não foi possível exportar a árvore.');
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
        void runPreviewExport('png');
        return;
      }

      if (isExportPreview && action === 'save-pdf') {
        void runPreviewExport('pdf');
        return;
      }

      if (isExportPreview && action === 'print') {
        void runPreviewExport('print');
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
  }, [familyTreeRef, isExportPreview, location, runPreviewExport]);

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
              onClick={() => runPreviewExport('png')}
            >
              <ImageDown className="h-4 w-4" />
              {exportPreviewBusy ? 'Preparando PNG...' : 'Salvar PNG'}
            </button>
          )}
          {showPdfButton && (
            <button
              type="button"
              disabled={exportPreviewBusy}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => runPreviewExport('pdf')}
            >
              <FileDown className="h-4 w-4" />
              {exportPreviewBusy ? 'Preparando PDF...' : 'Exportar PDF'}
            </button>
          )}
          {showPrintButton && (
            <button
              type="button"
              disabled={exportPreviewBusy}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => runPreviewExport('print')}
            >
              <Printer className="h-4 w-4" />
              {exportPreviewBusy ? 'Preparando impressão...' : 'Imprimir'}
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
