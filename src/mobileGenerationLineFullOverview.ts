const MOBILE_QUERY = '(max-width: 767px)';
const GENERATION_LINE_PATH = '/linha-geracional';
const FULL_MAP_ID = 'mobile-generation-line-full-overview';
const INLINE_SELECTOR = '[data-mobile-generation-line-full-inline="true"]';
const STYLE_ID = 'mobile-generation-line-full-overview-style';
const FULL_MAP_OPEN_EVENT = 'arvorefamilia:mobile-generation-full-map-open';
const HORIZONTAL_ROOT_SELECTOR = '[data-family-map-horizontal-mobile-root="true"]';
const HORIZONTAL_CARD_SELECTOR = '[data-mobile-horizontal-generation][data-mobile-horizontal-card="true"]';
const HORIZONTAL_CONNECTOR_SELECTOR = 'svg[data-family-map-connectors="true"]';

type GestureState =
  | { mode: 'pan'; x: number; y: number; translateX: number; translateY: number }
  | { mode: 'pinch'; startDistance: number; startScale: number; anchorX: number; anchorY: number };

type CollectedGeneration = {
  generation: number;
  cards: HTMLElement[];
  paths: string[];
  width: number;
  height: number;
};

type CollectedFullMap = {
  signature: string;
  width: number;
  height: number;
  headers: HTMLElement[];
  cards: HTMLElement[];
  paths: string[];
};

let gestureState: GestureState | null = null;
let scale = 1;
let translateX = 0;
let translateY = 0;
let scheduled = false;
let hydrationInFlight: Promise<void> | null = null;
let userTransformLocked = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && isMobileViewport()
    && window.location.pathname.replace(/\/$/, '') === GENERATION_LINE_PATH;
}

function setFullMapSourceHidden(active: boolean, snapshotting = false) {
  if (active) document.documentElement.dataset.mobileGenerationFullMapActive = 'true';
  else delete document.documentElement.dataset.mobileGenerationFullMapActive;

  if (snapshotting) document.documentElement.dataset.mobileGenerationFullMapSnapshotting = 'true';
  else delete document.documentElement.dataset.mobileGenerationFullMapSnapshotting;
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      html[data-mobile-generation-full-map-active="true"] [data-family-map-horizontal-mobile-root="true"],
      html[data-mobile-generation-full-map-snapshotting="true"] [data-family-map-horizontal-mobile-root="true"] {
        visibility: hidden !important;
        pointer-events: none !important;
      }

      #${FULL_MAP_ID} {
        position: relative !important;
        display: flex !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 0 !important;
        flex: 1 1 auto !important;
        overflow: hidden !important;
        background: var(--tree-palette-canvas-bg, #ecfeff) !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-viewport {
        position: relative !important;
        flex: 1 1 auto !important;
        width: 100% !important;
        height: 100% !important;
        min-height: min(72vh, 32rem) !important;
        overflow: hidden !important;
        border: 0 !important;
        border-radius: 0.85rem !important;
        background: var(--tree-palette-canvas-bg, #ecfeff) !important;
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tree-palette-group-border, #0891b2) 28%, transparent) !important;
        overscroll-behavior: contain !important;
        touch-action: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-stage {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        transform-origin: 0 0 !important;
        will-change: transform !important;
        overflow: visible !important;
        touch-action: none !important;
        overscroll-behavior: contain !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-connectors {
        position: absolute !important;
        inset: 0 !important;
        z-index: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-connectors path {
        fill: none !important;
        stroke: var(--family-map-connector, var(--tree-palette-edge-child, #a5eef6)) !important;
        stroke-width: 3 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #${FULL_MAP_ID} [data-mobile-horizontal-generation][data-mobile-horizontal-card="true"] {
        position: absolute !important;
      }

      #${FULL_MAP_ID} [data-mobile-horizontal-generation][data-mobile-horizontal-card="true"] * {
        pointer-events: none !important;
      }
    }
  `;

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
  }

  if (style.textContent !== css) style.textContent = css;
  if (document.head.lastElementChild !== style) document.head.appendChild(style);
}

function getInlineFullMap() {
  const fullMap = document.querySelector<HTMLElement>(
    `#${FULL_MAP_ID}[data-mobile-generation-line-full-inline="true"], ${INLINE_SELECTOR} #${FULL_MAP_ID}`
  );
  if (!fullMap) return null;

  return fullMap.matches('[data-mobile-generation-line-full-inline="true"]') || fullMap.closest(INLINE_SELECTOR)
    ? fullMap
    : null;
}

function getGenerationButtons() {
  const root = document.querySelector<HTMLElement>(HORIZONTAL_ROOT_SELECTOR);
  if (!root) return [];

  return Array.from(root.querySelectorAll<HTMLButtonElement>('nav[aria-label^="Gera"] button'))
    .map((button) => {
      const generation = Number((button.textContent ?? '').match(/\d+/)?.[0]);
      return { button, generation };
    })
    .filter((item): item is { button: HTMLButtonElement; generation: number } => Number.isFinite(item.generation));
}

function getActiveGenerationButton() {
  return getGenerationButtons().find(({ button }) => button.getAttribute('aria-current') === 'page' || button.getAttribute('aria-pressed') === 'true')
    ?? getGenerationButtons()[0]
    ?? null;
}

function waitForRender(delay = 140) {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.setTimeout(resolve, delay));
  });
}

function parseSvgViewBox(svg: SVGSVGElement | null) {
  const fallback = { width: 960, height: 720 };
  if (!svg) return fallback;

  const values = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [];
  const width = values[2];
  const height = values[3];

  return {
    width: Number.isFinite(width) && width > 0 ? width : fallback.width,
    height: Number.isFinite(height) && height > 0 ? height : fallback.height,
  };
}

function cloneGenerationHeaders(root: HTMLElement) {
  const surface = root.querySelector<HTMLElement>('[data-mobile-horizontal-map-surface="true"] > div');
  if (!surface) return [];

  return Array.from(surface.children)
    .filter((child): child is HTMLElement => (
      child instanceof HTMLElement
      && !child.matches(HORIZONTAL_CARD_SELECTOR)
      && /Gera(?:ç|c)[aã]o\s+\d+/i.test(child.textContent ?? '')
    ))
    .map((header) => {
      const clone = header.cloneNode(true) as HTMLElement;
      clone.dataset.mobileGenerationLineFullClonedHeader = 'true';
      clone.style.setProperty('position', 'absolute', 'important');
      return clone;
    });
}

function collectVisibleGeneration(generation: number): CollectedGeneration | null {
  const root = document.querySelector<HTMLElement>(HORIZONTAL_ROOT_SELECTOR);
  if (!root) return null;

  const svg = root.querySelector<SVGSVGElement>(HORIZONTAL_CONNECTOR_SELECTOR);
  const { width, height } = parseSvgViewBox(svg);
  const cards = Array.from(root.querySelectorAll<HTMLElement>(HORIZONTAL_CARD_SELECTOR))
    .filter((card) => Number(card.getAttribute('data-mobile-horizontal-generation')) === generation)
    .map((card) => {
      const clone = card.cloneNode(true) as HTMLElement;
      clone.dataset.mobileGenerationLineFullClonedCard = 'true';
      clone.style.setProperty('position', 'absolute', 'important');
      return clone;
    });

  const paths = Array.from(svg?.querySelectorAll<SVGPathElement>('path') ?? [])
    .map((path) => path.getAttribute('d') ?? '')
    .filter(Boolean);

  return { generation, cards, paths, width, height };
}

async function collectFullMap(): Promise<CollectedFullMap | null> {
  const buttons = getGenerationButtons();
  if (buttons.length === 0) return null;

  const originalGeneration = getActiveGenerationButton()?.generation;
  const generations = Array.from(new Set(buttons.map(({ generation }) => generation))).sort((a, b) => a - b);
  const byGeneration = new Map(buttons.map((item) => [item.generation, item.button]));
  const collected: CollectedGeneration[] = [];
  let headers: HTMLElement[] = [];

  setFullMapSourceHidden(true, true);
  try {
    for (const generation of generations) {
      byGeneration.get(generation)?.click();
      await waitForRender();

      const root = document.querySelector<HTMLElement>(HORIZONTAL_ROOT_SELECTOR);
      if (root && headers.length === 0) headers = cloneGenerationHeaders(root);

      const current = collectVisibleGeneration(generation);
      if (current) collected.push(current);
    }
  } finally {
    if (typeof originalGeneration === 'number') {
      byGeneration.get(originalGeneration)?.click();
    }
    setFullMapSourceHidden(true, false);
  }

  if (collected.length === 0) return null;

  const allCards = collected.flatMap((group) => group.cards);
  const allPaths = Array.from(new Set(collected.flatMap((group) => group.paths)));
  const maxCardBottom = allCards.reduce((max, card) => {
    const top = Number.parseFloat(card.style.top || '0');
    const height = Number.parseFloat(card.style.height || '') || card.offsetHeight || 0;
    return Math.max(max, top + height);
  }, 0);

  const width = Math.max(...collected.map((group) => group.width), 360);
  const height = Math.max(...collected.map((group) => group.height), maxCardBottom + 120, 520);
  const signature = [
    `w:${width}`,
    `h:${height}`,
    `g:${collected.map((group) => `${group.generation}-${group.cards.length}`).join('|')}`,
    `p:${allPaths.length}`,
  ].join(';');

  return {
    signature,
    width,
    height,
    headers,
    cards: allCards,
    paths: allPaths,
  };
}

function buildStage(model: CollectedFullMap) {
  const stage = document.createElement('div');
  stage.className = 'mobile-generation-line-full-map-stage';
  stage.style.setProperty('width', `${model.width}px`, 'important');
  stage.style.setProperty('height', `${model.height}px`, 'important');
  stage.dataset.signature = model.signature;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'mobile-generation-line-full-map-connectors');
  svg.setAttribute('viewBox', `0 0 ${model.width} ${model.height}`);
  svg.setAttribute('aria-hidden', 'true');

  model.paths.forEach((d) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  });

  stage.appendChild(svg);
  model.headers.forEach((header) => stage.appendChild(header));
  model.cards.forEach((card) => stage.appendChild(card));

  return stage;
}

function distance(first: Touch, second: Touch) {
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

function midpoint(first: Touch, second: Touch, viewport: HTMLElement) {
  const rect = viewport.getBoundingClientRect();
  return {
    x: ((first.clientX + second.clientX) / 2) - rect.left,
    y: ((first.clientY + second.clientY) / 2) - rect.top,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getStage() {
  return document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-generation-line-full-map-stage`);
}

function applyTransform() {
  getStage()?.style.setProperty('transform', `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`, 'important');
}

function markUserTransform(viewport?: HTMLElement | null) {
  userTransformLocked = true;
  viewport?.setAttribute('data-mobile-generation-line-user-transformed', 'true');
}

function resetTransform(force = false) {
  const viewport = document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-generation-line-full-map-viewport`);
  const stage = getStage();
  if (!viewport || !stage) return;

  const userTransformed = userTransformLocked || viewport.dataset.mobileGenerationLineUserTransformed === 'true';
  if (!force && userTransformed) {
    applyTransform();
    return;
  }

  const viewportRect = viewport.getBoundingClientRect();
  if (viewportRect.width < 120 || viewportRect.height < 220) {
    window.setTimeout(() => resetTransform(force), 80);
    return;
  }

  const stageWidth = stage.offsetWidth || 900;
  const stageHeight = stage.offsetHeight || 560;
  const fitScale = Math.min((viewportRect.width - 12) / stageWidth, (viewportRect.height - 12) / stageHeight);
  scale = clamp(fitScale * 1.02, 0.16, 1.05);
  translateX = (viewportRect.width - (stageWidth * scale)) / 2;
  translateY = (viewportRect.height - (stageHeight * scale)) / 2;
  viewport.dataset.mobileGenerationLineFullMapFitted = 'true';
  applyTransform();
}

function handleTouchStart(event: TouchEvent) {
  const viewport = event.currentTarget as HTMLElement;
  if (!viewport || !document.getElementById(FULL_MAP_ID)) return;

  markUserTransform(viewport);

  if (event.touches.length === 2) {
    const [first, second] = [event.touches[0], event.touches[1]];
    const mid = midpoint(first, second, viewport);
    gestureState = {
      mode: 'pinch',
      startDistance: distance(first, second),
      startScale: scale,
      anchorX: (mid.x - translateX) / scale,
      anchorY: (mid.y - translateY) / scale,
    };
    event.preventDefault();
    return;
  }

  if (event.touches.length === 1) {
    const touch = event.touches[0];
    gestureState = {
      mode: 'pan',
      x: touch.clientX,
      y: touch.clientY,
      translateX,
      translateY,
    };
    event.preventDefault();
  }
}

function handleTouchMove(event: TouchEvent) {
  const viewport = event.currentTarget as HTMLElement;
  if (!gestureState || !viewport || !document.getElementById(FULL_MAP_ID)) return;

  markUserTransform(viewport);

  if (gestureState.mode === 'pinch' && event.touches.length >= 2) {
    const [first, second] = [event.touches[0], event.touches[1]];
    const mid = midpoint(first, second, viewport);
    const nextDistance = distance(first, second);
    scale = clamp(gestureState.startScale * (nextDistance / Math.max(1, gestureState.startDistance)), 0.14, 3.2);
    translateX = mid.x - (gestureState.anchorX * scale);
    translateY = mid.y - (gestureState.anchorY * scale);
    applyTransform();
    event.preventDefault();
    return;
  }

  if (gestureState.mode === 'pan' && event.touches.length === 1) {
    const touch = event.touches[0];
    translateX = gestureState.translateX + (touch.clientX - gestureState.x);
    translateY = gestureState.translateY + (touch.clientY - gestureState.y);
    applyTransform();
    event.preventDefault();
  }
}

function handleTouchEnd(event: TouchEvent) {
  const viewport = event.currentTarget as HTMLElement;
  markUserTransform(viewport);

  if (event.touches.length === 0) {
    gestureState = null;
    return;
  }

  if (event.touches.length === 1) {
    const touch = event.touches[0];
    gestureState = {
      mode: 'pan',
      x: touch.clientX,
      y: touch.clientY,
      translateX,
      translateY,
    };
  }
}

async function hydrateFullMap() {
  if (!isEnabled()) {
    setFullMapSourceHidden(false, false);
    userTransformLocked = false;
    return;
  }
  if (hydrationInFlight) return hydrationInFlight;

  hydrationInFlight = (async () => {
    ensureStyles();
    const fullMap = getInlineFullMap();
    const viewport = fullMap?.querySelector<HTMLElement>('.mobile-generation-line-full-map-viewport');
    if (!viewport) {
      setFullMapSourceHidden(false, false);
      userTransformLocked = false;
      return;
    }

    setFullMapSourceHidden(true, false);
    const model = await collectFullMap();
    if (!model) return;

    const currentStage = viewport.querySelector<HTMLElement>('.mobile-generation-line-full-map-stage');
    const shouldRebuild = viewport.dataset.mobileGenerationLineFullMapHydrated !== 'true'
      || !currentStage
      || currentStage.dataset.signature !== model.signature;

    if (shouldRebuild) {
      userTransformLocked = false;
      viewport.removeAttribute('data-mobile-generation-line-user-transformed');
      viewport.replaceChildren(buildStage(model));
      viewport.dataset.mobileGenerationLineFullMapHydrated = 'true';
      viewport.removeAttribute('data-mobile-generation-line-full-map-fitted');

      if (viewport.dataset.mobileGenerationLineFullMapGestures !== 'true') {
        viewport.addEventListener('touchstart', handleTouchStart, { passive: false });
        viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
        viewport.addEventListener('touchend', handleTouchEnd, { passive: false });
        viewport.addEventListener('touchcancel', handleTouchEnd, { passive: false });
        viewport.dataset.mobileGenerationLineFullMapGestures = 'true';
      }
    }

    const userTransformed = userTransformLocked || viewport.dataset.mobileGenerationLineUserTransformed === 'true';
    if (shouldRebuild || viewport.dataset.mobileGenerationLineFullMapFitted !== 'true') {
      window.requestAnimationFrame(() => resetTransform(true));
      window.setTimeout(() => resetTransform(true), 40);
      return;
    }

    if (userTransformed) {
      applyTransform();
    }
  })().finally(() => {
    hydrationInFlight = null;
  });

  return hydrationInFlight;
}

function scheduleHydrateFullMap() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    void hydrateFullMap();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  window.addEventListener(FULL_MAP_OPEN_EVENT, scheduleHydrateFullMap);
  window.addEventListener('resize', scheduleHydrateFullMap, { passive: true });
  window.addEventListener('orientationchange', () => window.setTimeout(scheduleHydrateFullMap, 220), { passive: true });
  window.addEventListener('popstate', () => {
    gestureState = null;
    userTransformLocked = false;
    setFullMapSourceHidden(false, false);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleHydrateFullMap(); }, { passive: true });

  const observer = new MutationObserver(() => {
    if (getInlineFullMap()) scheduleHydrateFullMap();
    else {
      userTransformLocked = false;
      setFullMapSourceHidden(false, false);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

export {};
