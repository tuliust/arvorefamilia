import { toast } from 'sonner';

type SelectionRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type SaveFilePickerWritable = {
  write: (data: Blob) => Promise<void> | void;
  close: () => Promise<void> | void;
};

type SaveFilePickerHandle = {
  createWritable: () => Promise<SaveFilePickerWritable>;
};

type SaveFilePickerOptions = {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
};

type WindowWithSaveFilePicker = Window & {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<SaveFilePickerHandle>;
};

type DisplayMediaTrackSettings = MediaTrackSettings & {
  displaySurface?: 'browser' | 'window' | 'monitor' | 'application';
};

type ViewportCaptureMapper = {
  scaleX: number;
  scaleY: number;
};

const MIN_SELECTION_SIZE = 24;
const AREA_CAPTURE_OVERLAY_ID = 'screen-area-capture-overlay';

function isUserCancelledError(error: unknown) {
  return error instanceof DOMException
    && ['AbortError', 'NotAllowedError'].includes(error.name);
}

function isSavePickerCancelledError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
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

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeSelectionRect(startX: number, startY: number, endX: number, endY: number): SelectionRect {
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const right = Math.max(startX, endX);
  const bottom = Math.max(startY, endY);

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

function removeExistingOverlay() {
  document.getElementById(AREA_CAPTURE_OVERLAY_ID)?.remove();
}

function createSelectionOverlay() {
  removeExistingOverlay();

  const overlay = document.createElement('div');
  overlay.id = AREA_CAPTURE_OVERLAY_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Selecionar área da tela para salvar imagem');
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483647',
    'cursor:crosshair',
    'background:rgba(15,23,42,0.22)',
    'user-select:none',
    'touch-action:none',
  ].join(';');

  const instruction = document.createElement('div');
  instruction.textContent = 'Arraste para selecionar a área que deseja salvar. Pressione Esc para cancelar.';
  instruction.style.cssText = [
    'position:fixed',
    'left:50%',
    'top:18px',
    'transform:translateX(-50%)',
    'max-width:min(92vw,620px)',
    'border-radius:999px',
    'background:rgba(255,255,255,0.96)',
    'border:1px solid rgba(148,163,184,0.55)',
    'box-shadow:0 12px 32px rgba(15,23,42,0.22)',
    'color:#0f172a',
    'font:700 13px/1.3 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    'padding:10px 16px',
    'text-align:center',
    'pointer-events:none',
  ].join(';');

  const selection = document.createElement('div');
  selection.style.cssText = [
    'position:fixed',
    'display:none',
    'border:2px solid #2563eb',
    'background:rgba(37,99,235,0.16)',
    'box-shadow:0 0 0 9999px rgba(15,23,42,0.32), 0 12px 28px rgba(15,23,42,0.24)',
    'border-radius:12px',
    'pointer-events:none',
  ].join(';');

  overlay.appendChild(instruction);
  overlay.appendChild(selection);
  document.body.appendChild(overlay);

  return { overlay, selection };
}

function selectVisibleScreenArea() {
  return new Promise<SelectionRect>((resolve, reject) => {
    const { overlay, selection } = createSelectionOverlay();

    let selecting = false;
    let startX = 0;
    let startY = 0;
    let settled = false;

    const cleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
      overlay.remove();
    };

    const settleResolve = (rect: SelectionRect) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(rect);
    };

    const settleReject = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const updateSelection = (endX: number, endY: number) => {
      const rect = normalizeSelectionRect(startX, startY, endX, endY);
      selection.style.display = 'block';
      selection.style.left = `${rect.left}px`;
      selection.style.top = `${rect.top}px`;
      selection.style.width = `${rect.width}px`;
      selection.style.height = `${rect.height}px`;
    };

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        settleReject(new DOMException('Captura cancelada.', 'AbortError'));
      }
    }

    overlay.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;

      selecting = true;
      startX = clamp(event.clientX, 0, window.innerWidth);
      startY = clamp(event.clientY, 0, window.innerHeight);
      overlay.setPointerCapture(event.pointerId);
      updateSelection(startX, startY);
    });

    overlay.addEventListener('pointermove', (event) => {
      if (!selecting) return;

      updateSelection(
        clamp(event.clientX, 0, window.innerWidth),
        clamp(event.clientY, 0, window.innerHeight),
      );
    });

    overlay.addEventListener('pointerup', (event) => {
      if (!selecting) return;

      selecting = false;
      const rect = normalizeSelectionRect(
        startX,
        startY,
        clamp(event.clientX, 0, window.innerWidth),
        clamp(event.clientY, 0, window.innerHeight),
      );

      if (rect.width < MIN_SELECTION_SIZE || rect.height < MIN_SELECTION_SIZE) {
        settleReject(new Error('Selecione uma área maior para salvar a imagem.'));
        return;
      }

      settleResolve(rect);
    });

    document.addEventListener('keydown', handleKeyDown);
  });
}

async function requestCurrentTabStream() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Este navegador não permite captura real da tela. Use a exportação por imagem como alternativa.');
  }

  toast.message('Na janela do navegador, selecione "Esta aba" ou "Aba atual". Não selecione "Janela" nem "Tela inteira".');

  const options = {
    video: {
      displaySurface: 'browser',
    },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: 'include',
    surfaceSwitching: 'exclude',
  } as unknown as DisplayMediaStreamOptions;

  return navigator.mediaDevices.getDisplayMedia(options);
}

function assertCurrentTabCapture(stream: MediaStream, video: HTMLVideoElement) {
  const track = stream.getVideoTracks()[0];
  const settings = track?.getSettings?.() as DisplayMediaTrackSettings | undefined;

  if (settings?.displaySurface && settings.displaySurface !== 'browser') {
    throw new Error('Para salvar a área correta, selecione "Esta aba" ou "Aba atual" na permissão de captura. Captura de janela ou tela inteira inclui a barra do navegador e desloca o recorte.');
  }

  const videoWidth = Math.max(video.videoWidth, 1);
  const videoHeight = Math.max(video.videoHeight, 1);
  const viewportWidth = Math.max(window.innerWidth, 1);
  const viewportHeight = Math.max(window.innerHeight, 1);
  const scaleX = videoWidth / viewportWidth;
  const scaleY = videoHeight / viewportHeight;
  const scaleDelta = Math.abs(scaleX - scaleY) / Math.max(scaleX, scaleY, 1);
  const topChromeLikeExcess = videoHeight - viewportHeight * scaleX;
  const maxAllowedExcess = Math.max(28, viewportHeight * scaleX * 0.035);

  if (scaleDelta > 0.04 || topChromeLikeExcess > maxAllowedExcess) {
    throw new Error('A captura escolhida parece incluir a janela inteira do navegador. Selecione "Esta aba" ou "Aba atual" para que o recorte corresponda exatamente à área selecionada.');
  }

  return {
    scaleX,
    scaleY,
  };
}

async function createVideoElement(stream: MediaStream) {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('A captura da tela demorou demais para iniciar.')), 8000);

    video.addEventListener('loadedmetadata', () => {
      window.clearTimeout(timeout);
      resolve();
    }, { once: true });

    video.addEventListener('error', () => {
      window.clearTimeout(timeout);
      reject(new Error('Não foi possível preparar o vídeo da captura de tela.'));
    }, { once: true });
  });

  await video.play();
  await waitForAnimationFrame();

  return video;
}

async function captureSelectedAreaFromVideo(video: HTMLVideoElement, rect: SelectionRect, mapper: ViewportCaptureMapper) {
  const sourceX = Math.round(rect.left * mapper.scaleX);
  const sourceY = Math.round(rect.top * mapper.scaleY);
  const sourceWidth = Math.round(rect.width * mapper.scaleX);
  const sourceHeight = Math.round(rect.height * mapper.scaleY);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(sourceWidth, 1);
  canvas.height = Math.max(sourceHeight, 1);

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Não foi possível preparar a imagem da área selecionada.');
  }

  context.drawImage(
    video,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return canvas;
}

function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('Não foi possível gerar o PNG da área selecionada.'));
    }, 'image/png');
  });
}

function fallbackDownload(blob: Blob, suggestedFilename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = suggestedFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

async function saveBlob(blob: Blob, suggestedFilename: string) {
  const showSaveFilePicker = (window as WindowWithSaveFilePicker).showSaveFilePicker;

  if (!showSaveFilePicker) {
    fallbackDownload(blob, suggestedFilename);
    return 'download';
  }

  try {
    const handle = await showSaveFilePicker({
      suggestedName: suggestedFilename,
      types: [
        {
          description: 'Imagem PNG',
          accept: { 'image/png': ['.png'] },
        },
      ],
    });
    const writable = await handle.createWritable();

    await writable.write(blob);
    await writable.close();

    return 'picker';
  } catch (error) {
    if (isSavePickerCancelledError(error)) {
      throw error;
    }

    fallbackDownload(blob, suggestedFilename);
    return 'download';
  }
}

export async function captureVisibleScreenAreaAsPng({
  suggestedFilename,
}: {
  suggestedFilename: string;
}) {
  let stream: MediaStream | null = null;

  try {
    stream = await requestCurrentTabStream();

    const video = await createVideoElement(stream);
    const mapper = assertCurrentTabCapture(stream, video);

    toast.message('Arraste na página para selecionar a área que deseja salvar.');
    const rect = await selectVisibleScreenArea();

    await waitForAnimationFrame();
    await waitForAnimationFrame();
    await wait(160);

    const canvas = await captureSelectedAreaFromVideo(video, rect, mapper);
    const blob = await canvasToPngBlob(canvas);
    const mode = await saveBlob(blob, suggestedFilename);

    toast.success(
      mode === 'picker'
        ? 'Imagem salva com sucesso.'
        : 'Imagem baixada como PNG.',
    );
  } catch (error) {
    if (isUserCancelledError(error)) {
      toast.info('Captura de área cancelada.');
      return;
    }

    const message = error instanceof Error
      ? error.message
      : 'Não foi possível capturar a área da tela.';

    console.error('Erro ao capturar área real da tela:', error);
    toast.error(message);
  } finally {
    stream?.getTracks().forEach((track) => track.stop());
    removeExistingOverlay();
  }
}
