import React from 'react';

const PDFJS_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

type PdfDocumentPreviewProps = {
  url?: string;
  title?: string;
};

type PdfJsLib = {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (source: { data: ArrayBuffer }) => {
    promise: Promise<{
      numPages: number;
      getPage: (pageNumber: number) => Promise<{
        getViewport: (options: { scale: number }) => { width: number; height: number };
        render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
      }>;
    }>;
  };
};

declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

let pdfJsPromise: Promise<PdfJsLib> | null = null;

function loadPdfJs() {
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
    return Promise.resolve(window.pdfjsLib);
  }

  if (pdfJsPromise) return pdfJsPromise;

  pdfJsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${PDFJS_SCRIPT_URL}"]`);

    const resolveLoaded = () => {
      if (!window.pdfjsLib) {
        reject(new Error('PDF.js não carregou corretamente.'));
        return;
      }

      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      resolve(window.pdfjsLib);
    };

    if (existingScript) {
      if (window.pdfjsLib) {
        resolveLoaded();
      } else {
        existingScript.addEventListener('load', resolveLoaded, { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Não foi possível carregar o visualizador de PDF.')), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = PDFJS_SCRIPT_URL;
    script.async = true;
    script.onload = resolveLoaded;
    script.onerror = () => reject(new Error('Não foi possível carregar o visualizador de PDF.'));
    document.head.appendChild(script);
  });

  return pdfJsPromise;
}

function getPreviewScale(containerWidth: number) {
  if (containerWidth >= 900) return 1.45;
  if (containerWidth >= 700) return 1.25;
  if (containerWidth >= 480) return 1;
  return 0.78;
}

export function PdfDocumentPreview({ url, title = 'PDF' }: PdfDocumentPreviewProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'ready' | 'error'>(url ? 'loading' : 'idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    const container = containerRef.current;
    if (!url || !container) {
      setStatus('idle');
      return undefined;
    }

    let cancelled = false;
    const renderedCanvases: HTMLCanvasElement[] = [];

    async function renderPdf() {
      try {
        setStatus('loading');
        setErrorMessage('');
        container.innerHTML = '';

        const [pdfjsLib, response] = await Promise.all([
          loadPdfJs(),
          fetch(url, { cache: 'no-store' }),
        ]);

        if (!response.ok) {
          throw new Error('O arquivo PDF não pôde ser carregado.');
        }

        const data = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const scale = getPreviewScale(container.clientWidth || 900);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const canvasContext = canvas.getContext('2d');

          if (!canvasContext) throw new Error('Não foi possível preparar o canvas do PDF.');

          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          canvas.className = 'mx-auto mb-4 max-w-full rounded-sm bg-white shadow-sm';
          canvas.setAttribute('aria-label', `${title} - página ${pageNumber}`);

          container.appendChild(canvas);
          renderedCanvases.push(canvas);

          await page.render({ canvasContext, viewport }).promise;
        }

        if (!cancelled) setStatus('ready');
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(error instanceof Error ? error.message : 'Não foi possível visualizar este PDF.');
        }
      }
    }

    void renderPdf();

    return () => {
      cancelled = true;
      renderedCanvases.forEach((canvas) => canvas.remove());
      container.innerHTML = '';
    };
  }, [title, url]);

  return (
    <div className="relative h-full w-full overflow-auto bg-gray-100 p-4">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-sm font-medium text-gray-500">
          Carregando PDF...
        </div>
      )}

      {status === 'idle' && (
        <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
          Este arquivo não tem uma URL disponível para visualização.
        </div>
      )}

      {status === 'error' && (
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-500">
          {errorMessage || 'Não foi possível visualizar este PDF.'}
        </div>
      )}

      <div ref={containerRef} className={status === 'ready' ? 'min-h-full' : 'min-h-full opacity-0'} />
    </div>
  );
}
