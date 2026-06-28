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
  captureVisibleAreaOnly?: boolean;
}

export interface ElementCaptureMetrics {
  width: number;
  height: number;
  scale: number;
  estimatedPixels: number;
}

export const DEFAULT_TREE_EXPORT_MIN_SCALE = 2;
export const DEFAULT_TREE_EXPORT_MAX_SCALE = 3;
export const DEFAULT_TREE_EXPORT_MAX_PIXELS = 54_000_000;

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

  return Math.min(maxScale, Math.max(DEFAULT_TREE_EXPORT_MIN_SCALE, window.devicePixelRatio || 1));
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

function openExportPreviewWindow(title: string) {
  const previewWindow = window.open('', '_blank');

  if (!previewWindow) return null;

  previewWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>${escapeHtml(title)}</title>
    <style>
      html, body { margin: 0; min-height: 100%; background: #f8fafc; color: #0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      body { display: flex; align-items: center; justify-content: center; padding: 2rem; box-sizing: border-box; }
      p { margin: 0; font-size: 14px; font-weight: 600; }
    </style>
  </head>
  <body>
    <p>Preparando exportação...</p>
  </body>
</html>`);
  previewWindow.document.close();

  return previewWindow;
}

export function openTreeExportPreviewWindow(title: string) {
  const previewWindow = openExportPreviewWindow(title);

  if (!previewWindow) {
    throw new Error('O navegador bloqueou a janela de preview da exportação. Libere pop-ups para este site e tente novamente.');
  }

  return previewWindow;
}

function writeImagePreviewWindow(
  previewWindow: Window,
  imageUrl: string,
  title: string,
  filename: string,
  actionLabel = 'Salvar'
) {
  const safeTitle = escapeHtml(title || 'Imagem da árvore');
  const safeFilename = escapeHtml(filename);
  const safeActionLabel = escapeHtml(actionLabel);

  previewWindow.document.open();
  previewWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>${safeTitle}</title>
    <style>
      html, body { margin: 0; min-height: 100%; background: #f8fafc; color: #0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      body { min-height: 100vh; box-sizing: border-box; padding: 1.25rem; }
      header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; }
      h1 { margin: 0; font-size: 1rem; line-height: 1.2; }
      a { display: inline-flex; align-items: center; justify-content: center; min-height: 2.4rem; border-radius: 0.75rem; background: #1d4ed8; color: #fff; padding: 0 1rem; font-size: 0.875rem; font-weight: 700; text-decoration: none; }
      figure { margin: 0; border: 1px solid #e2e8f0; border-radius: 1rem; background: #fff; box-shadow: 0 16px 42px rgb(15 23 42 / 0.12); overflow: auto; }
      img { display: block; width: auto; max-width: none; height: auto; margin: 0 auto; }
    </style>
  </head>
  <body>
    <header>
      <h1>${safeTitle}</h1>
      <a href="${imageUrl}" download="${safeFilename}">${safeActionLabel}</a>
    </header>
    <figure>
      <img src="${imageUrl}" alt="${safeTitle}" />
    </figure>
  </body>
</html>`);
  previewWindow.document.close();
  previewWindow.focus();
}

function writePdfPreviewWindow(
  previewWindow: Window,
  pdfUrl: string,
  title: string,
  filename: string,
  actionLabel = 'Exportar'
) {
  const safeTitle = escapeHtml(title || 'PDF da árvore');
  const safeFilename = escapeHtml(filename);
  const safeActionLabel = escapeHtml(actionLabel);

  previewWindow.document.open();
  previewWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>${safeTitle}</title>
    <style>
      html, body { margin: 0; width: 100%; height: 100%; background: #f8fafc; color: #0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      body { display: grid; grid-template-rows: auto 1fr; }
      header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.8rem 1rem; border-bottom: 1px solid #e2e8f0; background: #fff; }
      h1 { margin: 0; font-size: 0.95rem; line-height: 1.2; }
      a { display: inline-flex; align-items: center; justify-content: center; min-height: 2.25rem; border-radius: 0.75rem; background: #1d4ed8; color: #fff; padding: 0 0.9rem; font-size: 0.84rem; font-weight: 700; text-decoration: none; }
      iframe { width: 100%; height: 100%; border: 0; background: #fff; }
    </style>
  </head>
  <body>
    <header>
      <h1>${safeTitle}</h1>
      <a href="${pdfUrl}" download="${safeFilename}">${safeActionLabel}</a>
    </header>
    <iframe src="${pdfUrl}" title="${safeTitle}"></iframe>
  </body>
</html>`);
  previewWindow.document.close();
  previewWindow.focus();
}

function writePrintPreviewWindow(
  previewWindow: Window,
  imageUrl: string,
  title: string
) {
  const safeTitle = escapeHtml(title || 'Imprimir árvore');

  previewWindow.document.open();
  previewWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>${safeTitle}</title>
    <style>
      html, body { margin: 0; min-height: 100%; background: #f8fafc; color: #0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      body { min-height: 100vh; box-sizing: border-box; padding: 1.25rem; }
      header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; }
      h1 { margin: 0; font-size: 1rem; line-height: 1.2; }
      button { display: inline-flex; align-items: center; justify-content: center; min-height: 2.4rem; border: 0; border-radius: 0.75rem; background: #1d4ed8; color: #fff; padding: 0 1rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; }
      figure { margin: 0; border: 1px solid #e2e8f0; border-radius: 1rem; background: #fff; box-shadow: 0 16px 42px rgb(15 23 42 / 0.12); overflow: auto; }
      img { display: block; width: auto; max-width: none; height: auto; margin: 0 auto; }
      @page { margin: 0; }
      @media print {
        body { padding: 0; background: #fff; }
        header { display: none !important; }
        figure { margin: 0; border: 0; border-radius: 0; box-shadow: none; overflow: visible; }
        img { width: 100vw; height: 100vh; object-fit: contain; }
      }
    </style>
  </head>
  <body>
    <header>
      <h1>${safeTitle}</h1>
      <button type="button" id="print-button">Imprimir</button>
    </header>
    <figure>
      <img src="${imageUrl}" alt="Mapa familiar exportado" />
    </figure>
    <script>
      document.getElementById('print-button')?.addEventListener('click', () => window.print());
    </script>
  </body>
</html>`);
  previewWindow.document.close();
  previewWindow.focus();
}

function getElementCssSize(element: HTMLElement, captureVisibleAreaOnly = false) {
  const rect = element.getBoundingClientRect();

  if (captureVisibleAreaOnly) {
    return {
      width: Math.ceil(Math.max(rect.width, 1)),
      height: Math.ceil(Math.max(rect.height, 1)),
    };
  }

  const width = Math.ceil(Math.max(rect.width, element.offsetWidth, element.scrollWidth, 1));
  const height = Math.ceil(Math.max(rect.height, element.offsetHeight, element.scrollHeight, 1));

  return { width, height };
}

export function getElementCaptureMetrics(
  element: HTMLElement,
  options: CaptureElementOptions = {}
): ElementCaptureMetrics {
  const { width, height } = getElementCssSize(element, options.captureVisibleAreaOnly);
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

export function waitForExportUiSettle(milliseconds = 450) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function waitForAnimationFrame() {
  return new Promise<void>((resolve) => {
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
      resolve();
      return;
    }

    window.requestAnimationFrame(() => resolve());
  });
}

export async function waitForTreeExportStability() {
  const documentWithFonts = document as Document & { fonts?: { ready?: Promise<unknown> } };

  try {
    await documentWithFonts.fonts?.ready;
  } catch {
    // Font readiness is best effort; export can continue with fallback fonts.
  }

  await waitForAnimationFrame();
  await waitForAnimationFrame();
  await waitForExportUiSettle(120);
}

function clampCanvasValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export interface PrependCanvasTitleOptions {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  titleHeight?: number;
}

export function prependTitleToCanvas(
  sourceCanvas: HTMLCanvasElement,
  title?: string,
  options: PrependCanvasTitleOptions = {}
) {
  const normalizedTitle = title?.trim();
  if (!normalizedTitle) return sourceCanvas;

  const titleHeight = Math.round(
    options.titleHeight ??
      clampCanvasValue(sourceCanvas.width * 0.045, 72, 132)
  );
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = sourceCanvas.width;
  outputCanvas.height = sourceCanvas.height + titleHeight;

  const context = outputCanvas.getContext('2d');
  if (!context) {
    throw new Error('Não foi possível preparar o título da exportação.');
  }

  const backgroundColor = options.backgroundColor ?? '#f7f1e8';
  const textColor = options.textColor ?? '#5b4636';
  const borderColor = options.borderColor ?? 'rgba(168, 95, 69, 0.28)';
  const fontSize = Math.round(clampCanvasValue(titleHeight * 0.36, 24, 38));

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

  context.fillStyle = textColor;
  context.font = `700 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
    normalizedTitle,
    outputCanvas.width / 2,
    Math.round(titleHeight / 2)
  );

  context.strokeStyle = borderColor;
  context.lineWidth = Math.max(1, Math.round(sourceCanvas.width / 1800));
  context.beginPath();
  context.moveTo(0, titleHeight - 0.5);
  context.lineTo(outputCanvas.width, titleHeight - 0.5);
  context.stroke();

  context.drawImage(sourceCanvas, 0, titleHeight);

  return outputCanvas;
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

function normalizeInlineSvgIconsForTreeExport(root: ParentNode) {
  const documentRef = root instanceof Document ? root : ((root as Node).ownerDocument ?? document);
  const windowRef = documentRef.defaultView;

  root.querySelectorAll<SVGSVGElement>('svg').forEach((svg) => {
    if (svg.closest('[data-family-map-connectors="true"], .react-flow__edges')) return;

    const computedSvg = windowRef?.getComputedStyle(svg);
    const svgColor = computedSvg?.color && computedSvg.color !== 'rgba(0, 0, 0, 0)'
      ? computedSvg.color
      : '#0f172a';

    svg.style.setProperty('color', svgColor, 'important');

    svg.querySelectorAll<SVGElement>('path, circle, rect, ellipse, line, polyline, polygon').forEach((shape) => {
      const computedShape = windowRef?.getComputedStyle(shape);
      const fillAttr = shape.getAttribute('fill');
      const strokeAttr = shape.getAttribute('stroke');
      const computedFill = computedShape?.fill;
      const computedStroke = computedShape?.stroke;

      if (fillAttr !== 'none' && computedFill !== 'none') {
        const fill = !fillAttr || fillAttr === 'currentColor' || computedFill === 'currentcolor'
          ? svgColor
          : computedFill || fillAttr;
        shape.setAttribute('fill', fill);
        shape.style.setProperty('fill', fill, 'important');
      }

      if (strokeAttr && strokeAttr !== 'none' && computedStroke !== 'none') {
        const stroke = strokeAttr === 'currentColor' || computedStroke === 'currentcolor'
          ? svgColor
          : computedStroke || strokeAttr;
        shape.setAttribute('stroke', stroke);
        shape.style.setProperty('stroke', stroke, 'important');
      }
    });

    if (!svg.closest('[data-family-map-color-key]')) return;

    try {
      const serializedSvg = new XMLSerializer().serializeToString(svg);
      const image = documentRef.createElement('img');
      const computed = windowRef?.getComputedStyle(svg);

      image.setAttribute('src', `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializedSvg)}`);
      image.setAttribute('alt', '');
      image.setAttribute('aria-hidden', 'true');
      image.setAttribute('decoding', 'sync');
      image.className = svg.getAttribute('class') ?? '';

      if (computed) {
        image.style.width = computed.width;
        image.style.height = computed.height;
        image.style.display = computed.display === 'inline' ? 'inline-block' : computed.display;
        image.style.verticalAlign = computed.verticalAlign;
        image.style.flexShrink = computed.flexShrink;
      }

      svg.replaceWith(image);
    } catch {
      // Keep the original inline SVG if serialization is not available.
    }
  });
}

function injectTreeExportLayoutCss(clonedDocument: Document) {
  const style = clonedDocument.createElement('style');
  style.setAttribute('data-tree-export-layout-fixes', 'true');
  style.textContent = `
    .is-exporting-family-tree [data-family-map-export-root="true"],
    .is-exporting-family-tree [data-family-map-horizontal-root="true"],
    .is-exporting-family-tree [data-export-root="family-tree"],
    .is-exporting-family-tree .react-flow {
      overflow: visible !important;
    }

    .is-exporting-family-tree [data-family-map-export-root="true"] *,
    .is-exporting-family-tree [data-family-map-horizontal-root="true"] *,
    .is-exporting-family-tree [data-export-root="family-tree"] *,
    .is-exporting-family-tree .react-flow__node * {
      text-rendering: geometricPrecision !important;
    }

    .is-exporting-family-tree .truncate,
    .is-exporting-family-tree [class*="line-clamp"],
    .is-exporting-family-tree [style*="-webkit-line-clamp"] {
      overflow: visible !important;
      text-overflow: clip !important;
      white-space: normal !important;
      -webkit-line-clamp: unset !important;
      line-clamp: unset !important;
      max-height: none !important;
    }

    .is-exporting-family-tree p,
    .is-exporting-family-tree span,
    .is-exporting-family-tree strong,
    .is-exporting-family-tree h1,
    .is-exporting-family-tree h2,
    .is-exporting-family-tree h3 {
      line-height: 1.28 !important;
      overflow: visible !important;
    }

    .is-exporting-family-tree [data-family-map-group-title="true"] {
      box-sizing: border-box !important;
      display: inline-flex !important;
      min-height: 1.28rem !important;
      align-items: center !important;
      justify-content: center !important;
      padding-block: 0.3rem !important;
      text-align: center !important;
      line-height: 1 !important;
      vertical-align: middle !important;
    }

    .is-exporting-family-tree [data-family-map-vital-line="true"] {
      box-sizing: border-box !important;
      display: flex !important;
      width: 100% !important;
      min-width: 0 !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 0.18rem !important;
      text-align: left !important;
      line-height: 1.2 !important;
    }

    .is-exporting-family-tree [data-family-map-vital-line="true"] .family-map-status-icon {
      display: block !important;
      flex: 0 0 auto !important;
      align-self: center !important;
      margin: 0 !important;
      transform: none !important;
      vertical-align: middle !important;
    }

    .is-exporting-family-tree [data-family-map-vital-line="true"] .family-map-status-icon + span {
      display: block !important;
      min-width: 0 !important;
      line-height: 1.2 !important;
      text-align: left !important;
    }
  `;
  clonedDocument.head.appendChild(style);
}

function prepareClonedDocumentForTreeExport(clonedDocument: Document) {
  clonedDocument.documentElement.classList.add('is-exporting-family-tree');
  injectExportSafeCss(clonedDocument);
  injectTreeExportLayoutCss(clonedDocument);

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
    normalizeInlineSvgIconsForTreeExport(clonedRoot);
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
    await waitForTreeExportStability();

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

function fallbackDownload(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string) {
  const imageUrl = canvasToDataUrl(canvas);
  const previewWindow = openExportPreviewWindow('Imagem da árvore');

  if (!previewWindow) {
    fallbackDownload(imageUrl, filename);
    return;
  }

  writeImagePreviewWindow(previewWindow, imageUrl, 'Imagem da árvore', filename, 'Salvar');
}

export function previewCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string,
  title = 'Imagem da árvore',
  targetWindow?: Window | null
) {
  const imageUrl = canvasToDataUrl(canvas);
  const previewWindow = targetWindow && !targetWindow.closed
    ? targetWindow
    : openExportPreviewWindow(title);

  if (!previewWindow) {
    fallbackDownload(imageUrl, filename);
    return;
  }

  writeImagePreviewWindow(previewWindow, imageUrl, title, filename, 'Salvar');
}

function buildCanvasPdf(canvas: HTMLCanvasElement, title = 'Árvore genealógica') {
  return import('jspdf').then(({ jsPDF }) => {
    const imageUrl = canvasToDataUrl(canvas);
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

    return pdf.output('blob') as Blob;
  });
}

export async function exportCanvasAsPdf(
  canvas: HTMLCanvasElement,
  filename: string,
  title = 'Árvore genealógica'
) {
  const pdfBlob = await buildCanvasPdf(canvas, title);
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const previewWindow = openExportPreviewWindow(title || 'PDF da árvore');

  if (!previewWindow) {
    fallbackDownload(pdfUrl, filename);
    window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 30000);
    return;
  }

  writePdfPreviewWindow(previewWindow, pdfUrl, title || 'PDF da árvore', filename, 'Exportar');
  previewWindow.addEventListener('beforeunload', () => URL.revokeObjectURL(pdfUrl), { once: true });
}

export async function previewCanvasAsPdf(
  canvas: HTMLCanvasElement,
  filename: string,
  title = 'Árvore genealógica',
  targetWindow?: Window | null
) {
  const pdfBlob = await buildCanvasPdf(canvas, title);
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const previewWindow = targetWindow && !targetWindow.closed
    ? targetWindow
    : openExportPreviewWindow(title || 'PDF da árvore');

  if (!previewWindow) {
    fallbackDownload(pdfUrl, filename);
    window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 30000);
    return;
  }

  writePdfPreviewWindow(previewWindow, pdfUrl, title || 'PDF da árvore', filename, 'Exportar');
  previewWindow.addEventListener('beforeunload', () => URL.revokeObjectURL(pdfUrl), { once: true });
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

export async function previewCanvasForPrint(
  canvas: HTMLCanvasElement,
  title = 'Imprimir árvore',
  targetWindow?: Window | null
) {
  const printWindow = targetWindow && !targetWindow.closed
    ? targetWindow
    : openTreePrintWindow();

  if (printWindow.closed) {
    throw new Error('A janela de impressão foi fechada antes da conclusão.');
  }

  const imageUrl = canvasToDataUrl(canvas);
  writePrintPreviewWindow(printWindow, imageUrl, title);
}

export async function printCanvas(
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
  </body>
</html>`);
  printWindow.document.close();

  await new Promise<void>((resolve, reject) => {
    const image = printWindow.document.querySelector('img');

    const resolveAfterPrint = () => {
      if (printWindow.closed) {
        reject(new Error('A janela de impressão foi fechada antes da conclusão.'));
        return;
      }

      try {
        printWindow.focus();
        printWindow.print();
        window.setTimeout(resolve, 650);
      } catch (error) {
        reject(error);
      }
    };

    if (!image) {
      window.setTimeout(resolveAfterPrint, 120);
      return;
    }

    if (image.complete) {
      window.setTimeout(resolveAfterPrint, 120);
      return;
    }

    image.addEventListener('load', () => window.setTimeout(resolveAfterPrint, 120), { once: true });
    image.addEventListener('error', () => reject(new Error('Não foi possível carregar a imagem para impressão.')), { once: true });
  });
}
