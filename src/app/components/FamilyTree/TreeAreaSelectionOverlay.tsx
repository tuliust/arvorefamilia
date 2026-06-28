import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileDown, ImageDown, Loader2, Printer, X } from 'lucide-react';

import {
  buildTreeExportFilename,
  captureElementToCanvas,
  cropCanvas,
  ExportRect,
  openTreeExportPreviewWindow,
  prependTitleToCanvas,
  previewCanvasAsPdf,
  previewCanvasAsPng,
  previewCanvasForPrint,
} from './utils/treeExport';

type ExportAction = 'png' | 'pdf' | 'print';

interface SelectionPoint {
  x: number;
  y: number;
}

interface TreeAreaSelectionOverlayProps {
  getTargetElement: () => HTMLElement | null;
  filenameLabel: string;
  title: string;
  onClose: () => void;
}

const MIN_SELECTION_SIZE = 80;
const MAX_EXPORT_PIXELS = 27_000_000;

export function waitForTreeExportPaint() {
  return new Promise<void>((resolve) => {
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
      resolve();
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

interface TreeExportLoadingOverlayProps {
  message: string;
  title?: string;
}

export function TreeExportLoadingOverlay({
  message,
  title = 'Exportando árvore',
}: TreeExportLoadingOverlayProps) {
  return (
    <div
      data-tree-export-ignore="true"
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby="tree-export-loading-title"
      aria-describedby="tree-export-loading-message"
    >
      <div className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-2xl">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-700" aria-hidden="true" />
        <p id="tree-export-loading-title" className="mt-3 text-sm font-semibold text-slate-900">
          {title}
        </p>
        <p id="tree-export-loading-message" className="mt-1 text-xs text-slate-600">
          {message}
        </p>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeSelection(start: SelectionPoint, end: SelectionPoint): ExportRect {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  return { x, y, width, height };
}

function getPointFromEvent(event: React.PointerEvent, target: HTMLElement): SelectionPoint {
  const rect = target.getBoundingClientRect();

  return {
    x: clamp(event.clientX - rect.left, 0, rect.width),
    y: clamp(event.clientY - rect.top, 0, rect.height),
  };
}

function getActionLabel(action: ExportAction) {
  if (action === 'png') return 'Preparando PNG...';
  if (action === 'pdf') return 'Preparando PDF...';
  return 'Preparando impressão...';
}

function getPreviewTitle(action: ExportAction) {
  if (action === 'png') return 'Imagem da área selecionada';
  if (action === 'pdf') return 'PDF da área selecionada';
  return 'Imprimir área selecionada';
}

function getEstimatedExportPixels(selection: ExportRect) {
  const scale = Math.min(3, Math.max(2, window.devicePixelRatio || 1));
  return selection.width * scale * selection.height * scale;
}

export function TreeAreaSelectionOverlay({
  getTargetElement,
  filenameLabel,
  title,
  onClose,
}: TreeAreaSelectionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [startPoint, setStartPoint] = useState<SelectionPoint | null>(null);
  const [endPoint, setEndPoint] = useState<SelectionPoint | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeAction, setActiveAction] = useState<ExportAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selection = useMemo(() => {
    if (!startPoint || !endPoint) return null;
    return normalizeSelection(startPoint, endPoint);
  }, [startPoint, endPoint]);
  const hasValidSelection = Boolean(
    selection &&
      selection.width >= MIN_SELECTION_SIZE &&
      selection.height >= MIN_SELECTION_SIZE
  );
  const isBusy = Boolean(activeAction);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBusy, onClose]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (isBusy || event.button !== 0) return;

    const target = getTargetElement();
    if (!target) {
      setError('Área da árvore não encontrada para seleção.');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const point = getPointFromEvent(event, target);
    setStartPoint(point);
    setEndPoint(point);
    setIsDragging(true);
    setError(null);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [getTargetElement, isBusy]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isBusy) return;

    const target = getTargetElement();
    if (!target) return;

    event.preventDefault();
    event.stopPropagation();
    setEndPoint(getPointFromEvent(event, target));
  }, [getTargetElement, isBusy, isDragging]);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const target = getTargetElement();
    if (target) {
      setEndPoint(getPointFromEvent(event, target));
    }

    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture can already be released by the browser on cancel.
      }
    }
  }, [getTargetElement, isDragging]);

  const exportSelectedArea = useCallback(async (action: ExportAction) => {
    if (!selection || !hasValidSelection || isBusy) {
      setError('Selecione uma área maior da árvore antes de exportar.');
      return;
    }

    const target = getTargetElement();
    if (!target) {
      setError('Área da árvore não encontrada para exportação.');
      return;
    }

    if (getEstimatedExportPixels(selection) > MAX_EXPORT_PIXELS) {
      setError('A área selecionada é muito grande para exportar com segurança. Selecione uma área menor da árvore visível.');
      return;
    }

    setActiveAction(action);
    setError(null);
    let previewWindow: Window | null = null;

    try {
      previewWindow = openTreeExportPreviewWindow(getPreviewTitle(action));
      await waitForTreeExportPaint();

      const targetRect = target.getBoundingClientRect();
      const canvas = await captureElementToCanvas(target, { captureVisibleAreaOnly: true });
      const scaleX = canvas.width / targetRect.width;
      const scaleY = canvas.height / targetRect.height;
      const croppedCanvas = cropCanvas(canvas, {
        x: selection.x * scaleX,
        y: selection.y * scaleY,
        width: selection.width * scaleX,
        height: selection.height * scaleY,
      });

      const titledCanvas = prependTitleToCanvas(croppedCanvas, title);

      if (action === 'png') {
        previewCanvasAsPng(
          titledCanvas,
          buildTreeExportFilename(`${filenameLabel}-area`, 'png'),
          'Imagem da área selecionada',
          previewWindow
        );
      } else if (action === 'pdf') {
        await previewCanvasAsPdf(
          titledCanvas,
          buildTreeExportFilename(`${filenameLabel}-area`, 'pdf'),
          'PDF da área selecionada',
          previewWindow
        );
      } else {
        await previewCanvasForPrint(titledCanvas, title, previewWindow);
      }

      onClose();
    } catch (exportError) {
      if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
      }
      setError(
        exportError instanceof Error
          ? exportError.message
          : 'Não foi possível exportar a área selecionada.'
      );
    } finally {
      setActiveAction(null);
    }
  }, [
    filenameLabel,
    getTargetElement,
    hasValidSelection,
    isBusy,
    onClose,
    selection,
    title,
  ]);

  const targetRect = getTargetElement()?.getBoundingClientRect();

  if (!targetRect) {
    return null;
  }

  const toolbarTop = selection
    ? clamp(selection.y + selection.height + 12, 16, Math.max(16, (targetRect?.height ?? 0) - 64))
    : 16;
  const toolbarWidth = Math.min(320, Math.max(240, (targetRect?.width ?? 0) - 32));
  const toolbarLeft = selection
    ? clamp(selection.x, 16, Math.max(16, (targetRect?.width ?? 0) - toolbarWidth - 16))
    : 16;

  return (
    <div
      ref={overlayRef}
      data-tree-selection-overlay="true"
      className="fixed z-[90] cursor-crosshair select-none bg-slate-950/20"
      style={{
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="presentation"
    >
      <div className="pointer-events-none absolute left-3 right-3 top-3 rounded-md bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-lg ring-1 ring-slate-200 sm:left-4 sm:right-auto sm:top-4 sm:max-w-[calc(100%-2rem)]">
        Arraste para selecionar uma área visível da árvore.
      </div>

      {selection && (
        <>
          <div
            className={[
              'pointer-events-none absolute border-2 bg-blue-500/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.28)]',
              hasValidSelection ? 'border-blue-500' : 'border-amber-500',
            ].join(' ')}
            style={{
              left: selection.x,
              top: selection.y,
              width: selection.width,
              height: selection.height,
            }}
          />

          <div
            className="absolute max-w-[calc(100%-2rem)] cursor-default rounded-lg border border-slate-200 bg-white p-2 shadow-xl"
            style={{ left: toolbarLeft, top: toolbarTop, width: toolbarWidth }}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerMove={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={!hasValidSelection || isBusy}
                onClick={() => exportSelectedArea('png')}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activeAction === 'png' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />}
                Salvar PNG
              </button>
              <button
                type="button"
                disabled={!hasValidSelection || isBusy}
                onClick={() => exportSelectedArea('pdf')}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activeAction === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                Salvar PDF
              </button>
              <button
                type="button"
                disabled={!hasValidSelection || isBusy}
                onClick={() => exportSelectedArea('print')}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activeAction === 'print' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                Imprimir
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={onClose}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>
            {!hasValidSelection && (
              <p className="mt-2 text-xs text-amber-700">
                Selecione uma área de pelo menos {MIN_SELECTION_SIZE} x {MIN_SELECTION_SIZE}px.
              </p>
            )}
            {activeAction && (
              <p className="mt-2 text-xs text-blue-700">{getActionLabel(activeAction)}</p>
            )}
            {error && (
              <p className="mt-2 max-w-md text-xs text-red-700">{error}</p>
            )}
          </div>
        </>
      )}

      {!selection && (
        <button
          type="button"
          disabled={isBusy}
          onClick={onClose}
          className="absolute right-3 top-14 inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-lg transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:right-4 sm:top-4"
        >
          <X className="h-4 w-4" />
          Cancelar
        </button>
      )}
    </div>
  );
}
