import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FileImage,
  FileText,
  Maximize2,
  Printer,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  buildTreeExportFilename,
  captureElementToCanvas,
  downloadCanvasAsPng,
  exportCanvasAsPdf,
  openTreePrintWindow,
  printCanvas,
  resolveTreeExportTarget,
} from './utils/treeExport';

type TreeRouteConfig = {
  label: string;
  title: string;
};

const TREE_ROUTES: Record<string, TreeRouteConfig> = {
  '/mapa-familiar': {
    label: 'mapa-familiar',
    title: 'Mapa Familiar',
  },
  '/mapa-familiar-horizontal': {
    label: 'mapa-familiar-horizontal',
    title: 'Mapa Familiar Horizontal',
  },
};

function getCurrentPath() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

function getCurrentTreeRoute() {
  return TREE_ROUTES[getCurrentPath()] ?? TREE_ROUTES['/mapa-familiar'];
}

function getTreeRoot() {
  return document.querySelector('[data-export-root="family-tree"]') as HTMLElement | null;
}

function clickTreeButton(label: string) {
  const root = getTreeRoot();
  const button = root?.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement | null;

  if (!button || button.disabled) {
    return false;
  }

  button.click();
  return true;
}

function runTreeButton(label: string, fallbackMessage: string) {
  if (!clickTreeButton(label)) {
    toast.info(fallbackMessage);
  }
}

async function captureTreeCanvas() {
  const element = resolveTreeExportTarget();

  if (!element) {
    throw new Error('Área da árvore não encontrada.');
  }

  return captureElementToCanvas(element);
}

async function printTree() {
  const printWindow = openTreePrintWindow();

  try {
    const canvas = await captureTreeCanvas();
    printCanvas(canvas, getCurrentTreeRoute().title, printWindow);
  } catch (error) {
    if (!printWindow.closed) printWindow.close();
    throw error;
  }
}

async function saveTreeImage() {
  const { label } = getCurrentTreeRoute();
  const canvas = await captureTreeCanvas();

  downloadCanvasAsPng(canvas, buildTreeExportFilename(label, 'png'));
}

async function saveTreePdf() {
  const { label, title } = getCurrentTreeRoute();
  const canvas = await captureTreeCanvas();

  await exportCanvasAsPdf(
    canvas,
    buildTreeExportFilename(label, 'pdf'),
    title,
  );
}

function isDirectFamilyMapPath(path: string) {
  return path === '/mapa-familiar' || path === '/mapa-familiar-horizontal';
}

export function MobileTreeControlsPortal() {
  const [path, setPath] = useState(() => getCurrentPath());
  const [panelOpen, setPanelOpen] = useState(false);
  const [arrowsVisible, setArrowsVisible] = useState(true);
  const isTreePage = useMemo(() => Boolean(TREE_ROUTES[path]), [path]);
  const isHandledByHomeMobilePanel = isDirectFamilyMapPath(path);

  useEffect(() => {
    const updatePath = () => setPath(getCurrentPath());
    const interval = window.setInterval(updatePath, 350);

    window.addEventListener('popstate', updatePath);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('popstate', updatePath);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('mobile-tree-controls-arrows-hidden', isTreePage && !arrowsVisible);

    return () => {
      document.documentElement.classList.remove('mobile-tree-controls-arrows-hidden');
    };
  }, [arrowsVisible, isTreePage]);

  useEffect(() => {
    if (!isTreePage || isHandledByHomeMobilePanel) {
      setPanelOpen(false);
      setArrowsVisible(true);
    }
  }, [isHandledByHomeMobilePanel, isTreePage]);

  if (!isTreePage || isHandledByHomeMobilePanel) return null;

  const runAction = async (action: () => void | Promise<void>, successMessage?: string) => {
    try {
      await action();
      setPanelOpen(false);

      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível concluir a ação.');
    }
  };

  return (
    <div className="mobile-tree-controls-portal md:hidden" aria-live="polite">
      {panelOpen && (
        <div className="mobile-tree-controls-panel" role="dialog" aria-label="Controles da árvore">
          <div className="mobile-tree-controls-panel-header">
            <h2>Controles</h2>
            <button type="button" onClick={() => setPanelOpen(false)} aria-label="Fechar controles">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mobile-tree-controls-grid">
            <button
              type="button"
              onClick={() => runTreeButton('Aumentar zoom', 'Controle de zoom indisponível nesta visualização.')}
            >
              <Search className="h-4 w-4" />
              Aumentar zoom
            </button>
            <button
              type="button"
              onClick={() => runTreeButton('Diminuir zoom', 'Controle de zoom indisponível nesta visualização.')}
            >
              <Search className="h-4 w-4 scale-90" />
              Diminuir zoom
            </button>
            <button type="button" onClick={() => window.dispatchEvent(new Event('resize'))}>
              <Maximize2 className="h-4 w-4" />
              Reajustar
            </button>
            <button type="button" onClick={() => setArrowsVisible((value) => !value)}>
              {arrowsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {arrowsVisible ? 'Ocultar setas' : 'Exibir setas'}
            </button>
            <button type="button" onClick={() => void runAction(saveTreePdf, 'PDF gerado.')}>
              <FileText className="h-4 w-4" />
              PDF
            </button>
            <button type="button" onClick={() => void runAction(saveTreeImage, 'Imagem gerada.')}>
              <FileImage className="h-4 w-4" />
              Imagem
            </button>
            <button type="button" onClick={() => void runAction(printTree)}>
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button type="button" onClick={() => toast.info('Seleção manual de área permanece disponível na versão desktop.')}>
              <Download className="h-4 w-4" />
              Seleção
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="mobile-tree-controls-trigger"
        onClick={() => setPanelOpen((value) => !value)}
        aria-label={panelOpen ? 'Fechar controles da árvore' : 'Abrir controles da árvore'}
        aria-expanded={panelOpen}
      >
        {panelOpen ? <ChevronDown className="h-5 w-5" /> : <SlidersHorizontal className="h-5 w-5" />}
      </button>
    </div>
  );
}
