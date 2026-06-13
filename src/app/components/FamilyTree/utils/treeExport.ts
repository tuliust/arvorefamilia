import {
  injectExportSafeCss,
  sanitizeUnsupportedExportColors,
} from './exportColorSanitizer';

export interface ExportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaptureElementOptions {
  backgroundColor?: string | null;
  ignoreElements?: (node: Element) => boolean;
  maxScale?: number;
  scale?: number;
}

export interface ElementCaptureMetrics {
  width: number;
  height: number;
  scale: number;
  estimatedPixels: number;
}

export const DEFAULT_TREE_EXPORT_MAX_SCALE = 2;
export const DEFAULT_TREE_EXPORT_MAX_PIXELS = 24_000_000;

export function resolveTreeExportTarget(
  explicitTarget?: HTMLElement | null,
  searchRoot: ParentNode = document
) {
  if (explicitTarget) return explicitTarget;

  return (
    searchRoot.querySelector('[data-family-map-export-root="true"]') ||
    searchRoot.querySelector('[data-family-map-horizontal-root="true"]') ||
    searchRoot.querySelector('.react-flow') ||
    searchRoot.querySelector('[data-export-root="family-tree"]')
  ) as HTMLElement | null;
}

function getSafeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function getBrowserExportScale(maxScale = DEFAULT_TREE_EXPORT_MAX_SCALE) {
  if (typeof window === 'undefined') return 1;

  return Math.min(maxScale, window.devicePixelRatio || 1);
}

function canvasToDataUrl(canvas: HTMLCanvasElement) {
  try {
    return canvas.toDataURL('image/png');
  } catch (error) {
    throw new Error(
      `Não foi possível preparar a imagem para exportação. Verifique se há imagens externas sem permissão de uso. ${getSafeErrorMessage(error, '')}`.trim()
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getElementCssSize(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const width = Math.ceil(Math.max(rect.width, element.offsetWidth, element.scrollWidth, 1));
  const height = Math.ceil(Math.max(rect.height, element.offsetHeight, element.scrollHeight, 1));

  return { width, height };
}

export function getElementCaptureMetrics(
  element: HTMLElement,
  options: CaptureElementOptions = {}
): ElementCaptureMetrics {
  const { width, height } = getElementCssSize(element);
  const scale = options.scale ?? getBrowserExportScale(options.maxScale);
  const estimatedPixels = width * scale * height * scale;

  return {
    width,
    height,
    scale,
    estimatedPixels,
  };
}

export function assertSafeElementCaptureSize(
  element: HTMLElement,
  label = 'A árvore',
  maxPixels = DEFAULT_TREE_EXPORT_MAX_PIXELS,
  options: CaptureElementOptions = {}
) {
  const metrics = getElementCaptureMetrics(element, options);

  if (metrics.estimatedPixels <= maxPixels) return metrics;

  throw new Error(
    `${label} está muito grande para exportar com segurança neste zoom. Reduza o zoom ou use a exportação por área.`
  );
}

export function buildTreeExportFilename(label: string, extension: 'png' | 'pdf') {
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('-');
  const safeLabel = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'arvore-familia';

  return `${safeLabel}-${timestamp}.${extension}`;
}

export function getDefaultTreeExportIgnoreElements(node: Element) {
  const elementNode = node as HTMLElement;

  return Boolean(
    elementNode.closest?.('.react-flow__controls') ||
    elementNode.closest?.('.react-flow__minimap') ||
    elementNode.closest?.('[data-tree-export-ignore="true"]') ||
    elementNode.closest?.('[data-tree-node-menu="true"]') ||
    elementNode.closest?.('[data-tree-selection-overlay="true"]') ||
    elementNode.closest?.('[data-tree-legend="true"]') ||
    elementNode.closest?.('[data-tree-export-loading="true"]')
  );
}

function prepareClonedDocumentForTreeExport(clonedDocument: Document) {
  clonedDocument.documentElement.classList.add('is-exporting-family-tree');
  injectExportSafeCss(clonedDocument);

  const clonedRoots = clonedDocument.querySelectorAll<HTMLElement>([
    '[data-family-map-export-root="true"]',
    '[data-family-map-horizontal-root="true"]',
    '[data-export-root="family-tree"]',
    '.react-flow',
  ].join(','));

  sanitizeUnsupportedExportColors(clonedDocument.body);

  clonedRoots.forEach((clonedRoot) => {
    clonedRoot.style.overflow = 'visible';
    sanitizeUnsupportedExportColors(clonedRoot);
  });

  clonedDocument.querySelectorAll<HTMLElement>('[data-tree-export-ignore="true"], [data-tree-selection-overlay="true"], [data-tree-export-loading="true"]').forEach((node) => {
    node.style.setProperty('display', 'none', 'important');
    node.style.setProperty('visibility', 'hidden', 'important');
  });
}

export async function captureElementToCanvas(
  element: HTMLElement,
  options: CaptureElementOptions = {}
) {
  if (!element) {
    throw new Error('Área da árvore não encontrada para exportação.');
  }

  const { default: html2canvas } = await import('html2canvas');
  const metrics = getElementCaptureMetrics(element, options);
  const backgroundColor = options.backgroundColor === undefined
    ? '#ffffff'
    : options.backgroundColor;

  document.documentElement.classList.add('is-exporting-family-tree');

  try {
    return await html2canvas(element, {
      backgroundColor,
      scale: metrics.scale,
      width: metrics.width,
      height: metrics.height,
      windowWidth: Math.max(window.innerWidth, document.documentElement.clientWidth, metrics.width),
      windowHeight: Math.max(window.innerHeight, document.documentElement.clientHeight, metrics.height),
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      useCORS: true,
      allowTaint: false,
      imageTimeout: 15000,
      logging: false,
      removeContainer: true,
      ignoreElements: (node) =>
        getDefaultTreeExportIgnoreElements(node) || Boolean(options.ignoreElements?.(node)),
      onclone: prepareClonedDocumentForTreeExport,
    });
  } finally {
    document.documentElement.classList.remove('is-exporting-family-tree');
  }
}

export function cropCanvas(sourceCanvas: HTMLCanvasElement, rect: ExportRect) {
  const cropX = Math.max(0, Math.floor(rect.x));
  const cropY = Math.max(0, Math.floor(rect.y));

  if (cropX >= sourceCanvas.width || cropY >= sourceCanvas.height) {
    throw new Error('A área selecionada está fora da imagem capturada.');
  }

  const availableWidth = sourceCanvas.width - cropX;
  const availableHeight = sourceCanvas.height - cropY;
  const cropWidth = Math.min(availableWidth, Math.max(1, Math.ceil(rect.width)));
  const cropHeight = Math.min(availableHeight, Math.max(1, Math.ceil(rect.height)));

  if (cropWidth <= 0 || cropHeight <= 0) {
    throw new Error('A área selecionada está fora da imagem capturada.');
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = cropWidth;
  outputCanvas.height = cropHeight;

  const context = outputCanvas.getContext('2d');
  if (!context) {
    throw new Error('Não foi possível preparar o recorte da árvore.');
  }

  context.drawImage(
    sourceCanvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return outputCanvas;
}

export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string) {
  const imageUrl = canvasToDataUrl(canvas);
  const link = document.createElement('a');

  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function exportCanvasAsPdf(
  canvas: HTMLCanvasElement,
  filename: string,
  title = 'Árvore genealógica'
) {
  const imageUrl = canvasToDataUrl(canvas);
  const { jsPDF } = await import('jspdf');
  const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: 'a4',
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const titleHeight = title ? 22 : 0;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2 - titleHeight;
  const imageRatio = canvas.width / canvas.height;
  const fitRatio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
  const imageWidth = Math.max(1, canvas.width * fitRatio);
  const imageHeight = Math.max(1, imageWidth / imageRatio);
  const imageX = (pageWidth - imageWidth) / 2;
  const imageY = margin + titleHeight + Math.max(0, (maxHeight - imageHeight) / 2);

  if (title) {
    pdf.setFontSize(12);
    pdf.text(title, margin, margin + 10);
  }

  pdf.addImage(imageUrl, 'PNG', imageX, imageY, imageWidth, imageHeight);
  pdf.save(filename);
}

export function openTreePrintWindow() {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    throw new Error('O navegador bloqueou a janela de impressão.');
  }

  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>Preparando impressão</title>
    <style>
      html, body { margin: 0; min-height: 100%; background: #f8fafc; color: #0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      body { display: flex; align-items: center; justify-content: center; }
      p { margin: 0; font-size: 14px; }
    </style>
  </head>
  <body>
    <p>Preparando impressão da árvore...</p>
  </body>
</html>`);
  printWindow.document.close();

  return printWindow;
}

export function printCanvas(
  canvas: HTMLCanvasElement,
  title = 'Imprimir árvore',
  targetWindow?: Window | null
) {
  const printWindow = targetWindow ?? openTreePrintWindow();

  if (printWindow.closed) {
    throw new Error('A janela de impressão foi fechada antes da conclusão.');
  }

  const imageUrl = canvasToDataUrl(canvas);
  const safeTitle = escapeHtml(title);

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>${safeTitle}</title>
    <style>
      html, body { margin: 0; min-height: 100%; background: #f8fafc; }
      body { display: flex; align-items: center; justify-content: center; }
      img { width: 100vw; height: 100vh; object-fit: contain; display: block; }
      @page { margin: 0; }
      @media print {
        html, body { width: 100%; height: 100%; }
        img { width: 100%; height: 100%; }
      }
    </style>
  </head>
  <body>
    <img src="${imageUrl}" alt="Mapa familiar exportado" />
    <script>
      const image = document.querySelector('img');
      const printTree = () => {
        window.focus();
        window.print();
      };
      if (image.complete) {
        setTimeout(printTree, 50);
      } else {
        image.addEventListener('load', () => setTimeout(printTree, 50), { once: true });
      }
    </script>
  </body>
</html>`);
  printWindow.document.close();
}
