import React, { useEffect, useMemo, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FileImage,
  FileText,
  Maximize2,
  Minus,
  Plus,
  Printer,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const TREE_PATHS = new Set(['/minha-arvore', '/genealogia', '/visao-completa']);

function getCurrentPath() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

function getTreeRoot() {
  return document.querySelector('[data-export-root="family-tree"]') as HTMLElement | null;
}

function getTreeCaptureElement() {
  return document.querySelector('[data-export-root="family-tree"] .react-flow') as HTMLElement | null;
}

function clickTreeButton(label: string) {
  const root = getTreeRoot();
  const button = root?.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement | null;
  if (!button || button.disabled) return false;
  button.click();
  return true;
}

function getFilename(extension: string) {
  const path = getCurrentPath();
  const prefix = path === '/genealogia'
    ? 'genealogia'
    : path === '/visao-completa'
      ? 'visao-completa'
      : 'minha-arvore';
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${prefix}-${timestamp}.${extension}`;
}

async function captureTreeCanvas() {
  const element = getTreeCaptureElement() ?? getTreeRoot();
  if (!element) {
    throw new Error('Área da árvore não encontrada.');
  }

  return html2canvas(element, {
    backgroundColor: '#ffffff',
    useCORS: true,
    allowTaint: true,
    logging: false,
    scale: Math.min(2, window.devicePixelRatio || 1),
  });
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}

async function saveTreeImage() {
  const canvas = await captureTreeCanvas();
  downloadCanvas(canvas, getFilename('png'));
}

async function saveTreePdf() {
  const canvas = await captureTreeCanvas();
  const imageData = canvas.toDataURL('image/png');
  const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const width = canvas.width * ratio;
  const height = canvas.height * ratio;
  const x = (pageWidth - width) / 2;
  const y = (pageHeight - height) / 2;

  pdf.addImage(imageData, 'PNG', x, y, width, height);
  pdf.save(getFilename('pdf'));
}

async function printTree() {
  const canvas = await captureTreeCanvas();
  const imageData = canvas.toDataURL('image/png');
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');

  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão.');
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Imprimir árvore</title>
        <style>
          body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #fff; }
          img { max-width: 100vw; max-height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="${imageData}" alt="Árvore genealógica" />
        <script>window.onload = () => { window.focus(); window.print(); };</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function MobileTreeControlsPortal() {
  const [path, setPath] = useState(() => getCurrentPath());
  const [panelOpen, setPanelOpen] = useState(false);
  const [arrowsVisible, setArrowsVisible] = useState(true);
  const isTreePage = useMemo(() => TREE_PATHS.has(path), [path]);

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

  if (!isTreePage) return null;

  const runAction = async (action: () => void | Promise<void>, successMessage?: string) => {
    try {
      await action();
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível concluir a ação.');
    }
  };

  return (
    <div className="mobile-tree-controls-portal md:hidden" aria-live="polite">
      {panelOpen && (
        <div className="mobile-tree-controls-panel" role="dialog" aria-label="Controles da árvore">
          <div className="mobile-tree-controls-panel-header">
            <div>
              <p className="mobile-tree-controls-eyebrow">Árvore</p>
              <h2>Controles</h2>
            </div>
            <button type="button" onClick={() => setPanelOpen(false)} aria-label="Fechar controles">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mobile-tree-controls-grid">
            <button type="button" onClick={() => clickTreeButton('Aumentar zoom')}>
              <Plus className="h-4 w-4" />
              Zoom +
            </button>
            <button type="button" onClick={() => clickTreeButton('Diminuir zoom')}>
              <Minus className="h-4 w-4" />
              Zoom -
            </button>
            <button type="button" onClick={() => window.dispatchEvent(new Event('resize'))}>
              <Maximize2 className="h-4 w-4" />
              Reajustar
            </button>
            <button type="button" onClick={() => setArrowsVisible((value) => !value)}>
              {arrowsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {arrowsVisible ? 'Ocultar setas' : 'Exibir setas'}
            </button>
            <button type="button" onClick={() => runAction(saveTreePdf, 'PDF gerado.')}>
              <FileText className="h-4 w-4" />
              PDF
            </button>
            <button type="button" onClick={() => runAction(saveTreeImage, 'Imagem gerada.')}>
              <FileImage className="h-4 w-4" />
              Imagem
            </button>
            <button type="button" onClick={() => runAction(printTree)}>
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
