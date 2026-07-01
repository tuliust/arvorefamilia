const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATHS = new Set(['/mapa-familiar', '/linha-geracional']);
const GENERATION_LINE_PATH = '/linha-geracional';
const STYLE_ID = 'mobile-map-panel-refinements-style';
const OVERLAY_ID = 'mobile-generation-safe-overview-overlay';
const BACKDROP_ID = 'mobile-map-toolbar-panel-backdrop';
const PANEL_SELECTOR = '[data-mobile-family-map-inline-overview="true"][data-mobile-family-map-panel-mode="overview"]';
const ACTIVE_TOOLBAR_SELECTOR = '[data-mobile-family-map-toolbar="true"][data-mobile-family-map-toolbar-active="true"]';
const BACKDROP_TOP_VAR = '--mobile-map-toolbar-backdrop-top';

type ManagedMapKind = 'family' | 'generation';
type ManagedGestureState =
  | { mode: 'pan'; x: number; y: number; translateX: number; translateY: number }
  | { mode: 'pinch'; startDistance: number; startScale: number; anchorX: number; anchorY: number };

type ManagedMapState = {
  gesture: ManagedGestureState | null;
  protectUntil: number;
  restoreTimer: number | null;
  scale: number;
  translateX: number;
  translateY: number;
};

const MANAGED_FULL_MAPS: Array<{
  kind: ManagedMapKind;
  viewportSelector: string;
  stageSelector: string;
}> = [
  {
    kind: 'family',
    viewportSelector: '#mobile-family-map-full-overview .mobile-family-full-map-viewport',
    stageSelector: '.mobile-family-full-map-stage',
  },
  {
    kind: 'generation',
    viewportSelector: '#mobile-generation-line-full-overview .mobile-generation-line-full-map-viewport',
    stageSelector: '.mobile-generation-line-full-map-stage',
  },
];

const managedMapStates: Record<ManagedMapKind, ManagedMapState> = {
  family: { gesture: null, protectUntil: 0, restoreTimer: null, scale: 1, translateX: 0, translateY: 0 },
  generation: { gesture: null, protectUntil: 0, restoreTimer: null, scale: 1, translateX: 0, translateY: 0 },
};

let scheduled = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function getPathname() {
  return typeof window === 'undefined' ? '' : window.location.pathname.replace(/\/$/, '');
}

function isFamilyMapToolbarPath() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && isMobileViewport()
    && FAMILY_MAP_PATHS.has(getPathname());
}

function isGenerationLineEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && isMobileViewport()
    && getPathname() === GENERATION_LINE_PATH;
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      #${BACKDROP_ID} {
        position: fixed !important;
        left: 0 !important;
        right: 0 !important;
        top: var(${BACKDROP_TOP_VAR}, 0px) !important;
        bottom: 0 !important;
        z-index: 10000 !important;
        background: rgba(15, 23, 42, 0.38) !important;
        backdrop-filter: blur(5px) saturate(0.86) !important;
        -webkit-backdrop-filter: blur(5px) saturate(0.86) !important;
        pointer-events: none !important;
      }

      html[data-mobile-map-toolbar-backdrop="true"] [data-mobile-family-map-toolbar="true"],
      html[data-mobile-map-toolbar-backdrop="true"] [role="dialog"][aria-label="Filtros do mapa familiar"],
      html[data-mobile-map-toolbar-backdrop="true"] [data-mobile-family-map-inline-overview="true"],
      html[data-mobile-map-toolbar-backdrop="true"] #mobile-family-map-full-overview,
      html[data-mobile-map-toolbar-backdrop="true"] #mobile-generation-line-full-overview {
        position: relative !important;
        z-index: 10001 !important;
      }

      html[data-mobile-map-toolbar-backdrop="true"] #${OVERLAY_ID} {
        z-index: 10002 !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"],
      [data-mobile-family-tree-screen="maternal-uncles"] {
        overflow: hidden !important;
        overscroll-behavior: contain !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] > div,
      [data-mobile-family-tree-screen="maternal-uncles"] > div {
        box-sizing: border-box !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        overscroll-behavior-y: contain !important;
        -webkit-overflow-scrolling: touch !important;
        padding-bottom: calc(env(safe-area-inset-bottom,0px) + 7rem) !important;
      }

      [role="dialog"][aria-label="Filtros do mapa familiar"] {
        box-sizing: border-box !important;
        border: 1px solid rgba(226, 232, 240, 0.96) !important;
        border-radius: 1.25rem !important;
        background: rgba(255, 255, 255, 0.96) !important;
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14) !important;
        padding: 0.5rem !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
      }

      #mobile-family-map-full-overview .mobile-family-full-map-viewport,
      #mobile-family-map-full-overview .mobile-family-full-map-stage,
      #mobile-generation-line-full-overview .mobile-generation-line-full-map-viewport,
      #mobile-generation-line-full-overview .mobile-generation-line-full-map-stage {
        touch-action: none !important;
        overscroll-behavior: contain !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-user-drag: none !important;
      }

      #${OVERLAY_ID} {
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 0.62rem !important;
        border: 1px solid rgba(203, 213, 225, 0.95) !important;
        border-radius: 1.45rem !important;
        background: rgba(255, 255, 255, 0.98) !important;
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14) !important;
        overflow: hidden !important;
        padding: 0.8rem !important;
        pointer-events: auto !important;
      }

      #${OVERLAY_ID} [data-generation-overlay-header="true"] {
        display: flex !important;
        flex-direction: column !important;
        gap: 0.22rem !important;
        text-align: left !important;
      }

      #${OVERLAY_ID} [data-generation-overlay-title="true"] {
        margin: 0 !important;
        color: rgb(15, 23, 42) !important;
        font-size: 1rem !important;
        font-weight: 950 !important;
        letter-spacing: -0.025em !important;
        line-height: 1.05 !important;
      }

      #${OVERLAY_ID} [data-generation-overlay-subtitle="true"] {
        margin: 0 !important;
        color: rgb(71, 85, 105) !important;
        font-size: 0.68rem !important;
        font-weight: 750 !important;
        letter-spacing: -0.015em !important;
        line-height: 1.12 !important;
      }

      #${OVERLAY_ID} [data-generation-overlay-grid="true"] {
        display: grid !important;
        grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
        gap: 0.38rem !important;
        min-height: 8.35rem !important;
      }

      #${OVERLAY_ID} [data-generation-overlay-card="true"] {
        appearance: none !important;
        display: flex !important;
        min-width: 0 !important;
        min-height: 8.35rem !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        border: 1px solid rgba(8, 145, 178, 0.26) !important;
        border-radius: 1.15rem !important;
        background: #fff !important;
        color: rgb(15, 23, 42) !important;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.10) !important;
        padding: 0.46rem 0.14rem !important;
        text-align: center !important;
        transition: transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease !important;
      }

      #${OVERLAY_ID} [data-generation-overlay-card="true"][aria-current="location"] {
        border-color: rgb(8, 145, 178) !important;
        box-shadow: inset 0 0 0 2px rgba(8, 145, 178, 0.45), 0 12px 28px rgba(8, 145, 178, 0.18) !important;
      }

      #${OVERLAY_ID} [data-generation-overlay-card="true"]:active {
        transform: scale(0.985) !important;
      }

      #${OVERLAY_ID} [data-generation-overlay-number-shell="true"] {
        display: flex !important;
        width: 2.76rem !important;
        height: 2.76rem !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 0.92rem !important;
        background: rgb(241, 245, 249) !important;
        color: rgb(15, 23, 42) !important;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.10) !important;
      }

      #${OVERLAY_ID} [data-generation-overlay-number="true"] {
        display: block !important;
        font-size: 1.48rem !important;
        font-weight: 950 !important;
        letter-spacing: -0.055em !important;
        line-height: 0.92 !important;
      }

      #${OVERLAY_ID} [data-generation-overlay-cta="true"] {
        appearance: none !important;
        display: flex !important;
        min-height: 3.25rem !important;
        width: 100% !important;
        align-items: center !important;
        justify-content: center !important;
        border: 1px solid rgb(14, 116, 144) !important;
        border-radius: 1rem !important;
        background: rgb(14, 116, 144) !important;
        color: white !important;
        font-size: 1rem !important;
        font-weight: 950 !important;
        letter-spacing: -0.025em !important;
        box-shadow: 0 10px 24px rgba(8, 145, 178, 0.22) !important;
      }
    }
  `;

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
  }

  if (style.textContent !== css) style.textContent = css;
  if (!style.parentElement) document.head.appendChild(style);
}

function removeToolbarBackdrop() {
  document.getElementById(BACKDROP_ID)?.remove();
  document.documentElement.removeAttribute('data-mobile-map-toolbar-backdrop');
  document.documentElement.style.removeProperty(BACKDROP_TOP_VAR);
}

function shouldShowToolbarBackdrop() {
  if (!isFamilyMapToolbarPath()) return false;

  const toolbar = document.querySelector<HTMLElement>(ACTIVE_TOOLBAR_SELECTOR);
  if (!toolbar) return false;

  const action = toolbar.dataset.mobileFamilyMapToolbarAction;
  return Boolean(action && ['visualizacao', 'formato', 'cor', 'grupos', 'zoom', 'exportar'].includes(action));
}

function getBackdropTop() {
  const toolbar = document.querySelector<HTMLElement>(ACTIVE_TOOLBAR_SELECTOR);
  const toolbarBottom = toolbar?.getBoundingClientRect().bottom ?? 0;
  return Math.max(0, Math.ceil(toolbarBottom));
}

function renderToolbarBackdrop() {
  if (!shouldShowToolbarBackdrop()) {
    removeToolbarBackdrop();
    return;
  }

  let backdrop = document.getElementById(BACKDROP_ID) as HTMLDivElement | null;
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = BACKDROP_ID;
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  document.documentElement.dataset.mobileMapToolbarBackdrop = 'true';
  document.documentElement.style.setProperty(BACKDROP_TOP_VAR, `${getBackdropTop()}px`);
}

function getActiveGeneration() {
  return Number(
    Array.from(document.querySelectorAll<HTMLButtonElement>('[data-family-map-horizontal-mobile-root="true"] nav[aria-label^="Gera"] button'))
      .find((button) => button.getAttribute('aria-current') === 'page' || button.getAttribute('aria-pressed') === 'true')
      ?.textContent?.match(/\d+/)?.[0]
  ) || 0;
}

function clickGenerationButton(generation: number) {
  const navButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-family-map-horizontal-mobile-root="true"] nav[aria-label^="Gera"] button'));
  const target = navButtons.find((button) => Number((button.textContent ?? '').match(/\d+/)?.[0]) === generation);
  target?.click();

  const activeMapButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => button.getAttribute('aria-pressed') === 'true' && /\bMapa\b/i.test(button.textContent ?? ''));
  window.setTimeout(() => activeMapButton?.click(), 30);
}

function removeGenerationOverlay() {
  document.getElementById(OVERLAY_ID)?.remove();
}

function renderGenerationOverlay(panel: HTMLElement) {
  const rect = panel.getBoundingClientRect();
  if (rect.width < 120 || rect.height < 120) return;

  let overlay = document.getElementById(OVERLAY_ID) as HTMLDivElement | null;
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    document.body.appendChild(overlay);
  }

  const activeGeneration = getActiveGeneration();
  const signature = `generation-safe-overlay:${activeGeneration}`;
  if (overlay.dataset.signature !== signature) {
    overlay.innerHTML = `
      <header data-generation-overlay-header="true">
        <h2 data-generation-overlay-title="true">Gerações</h2>
        <p data-generation-overlay-subtitle="true">Selecione a coluna: familiares mais antigos estão à esquerda, e os mais novos à direita.</p>
      </header>
      <div data-generation-overlay-grid="true">
        ${[1, 2, 3, 4, 5, 6].map((generation) => `
          <button type="button" data-generation-overlay-card="true" data-generation="${generation}" aria-label="Abrir geração ${generation}" ${activeGeneration === generation ? 'aria-current="location"' : ''}>
            <span data-generation-overlay-number-shell="true" aria-hidden="true">
              <span data-generation-overlay-number="true">${generation}</span>
            </span>
          </button>
        `).join('')}
      </div>
      <button type="button" data-generation-overlay-cta="true">Exibir visualização completa</button>
    `;
    overlay.dataset.signature = signature;
  }

  overlay.style.setProperty('position', 'fixed');
  overlay.style.setProperty('left', `${Math.round(rect.left)}px`);
  overlay.style.setProperty('top', `${Math.round(rect.top)}px`);
  overlay.style.setProperty('width', `${Math.round(rect.width)}px`);
  overlay.style.setProperty('height', 'auto');
  overlay.style.setProperty('z-index', '10002');

  const safeBottom = 106;
  const minHeight = 304;
  const availableHeight = Math.max(minHeight, window.innerHeight - rect.top - safeBottom);
  const contentHeight = Math.ceil(overlay.scrollHeight || minHeight);
  const nextHeight = Math.min(Math.max(rect.height, contentHeight, minHeight), availableHeight);
  overlay.style.setProperty('height', `${Math.round(nextHeight)}px`);
}

function refineGenerationOverview() {
  if (!isGenerationLineEnabled()) {
    removeGenerationOverlay();
    return;
  }

  ensureStyles();
  const panel = document.querySelector<HTMLElement>(PANEL_SELECTOR);
  if (!panel) {
    removeGenerationOverlay();
    return;
  }

  renderGenerationOverlay(panel);
}

function handleOverlayClick(event: Event) {
  const target = event.target instanceof Element ? event.target : null;
  const overlay = target?.closest<HTMLElement>(`#${OVERLAY_ID}`);
  if (!overlay) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();

  const card = target?.closest<HTMLButtonElement>('[data-generation-overlay-card="true"]');
  if (card) {
    const generation = Number(card.dataset.generation);
    if (Number.isFinite(generation)) {
      removeGenerationOverlay();
      clickGenerationButton(generation);
    }
    return;
  }

  const cta = target?.closest<HTMLButtonElement>('[data-generation-overlay-cta="true"]');
  if (cta) {
    const panel = document.querySelector<HTMLElement>(PANEL_SELECTOR);
    const nativeCta = panel?.querySelector<HTMLButtonElement>(':scope > button');
    removeGenerationOverlay();
    nativeCta?.click();
  }
}

function getManagedContext(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  for (const map of MANAGED_FULL_MAPS) {
    const viewport = target.closest<HTMLElement>(map.viewportSelector);
    const stage = viewport?.querySelector<HTMLElement>(map.stageSelector);
    if (viewport && stage) return { kind: map.kind, viewport, stage };
  }

  return null;
}

function readManagedTransform(stage: HTMLElement, state: ManagedMapState) {
  const transform = stage.style.transform || window.getComputedStyle(stage).transform || '';
  const translateScale = transform.match(/translate3d\((-?[0-9.]+)px,\s*(-?[0-9.]+)px,[^)]+\)\s*scale\((-?[0-9.]+)\)/);
  if (translateScale) {
    return {
      translateX: Number.parseFloat(translateScale[1]),
      translateY: Number.parseFloat(translateScale[2]),
      scale: Number.parseFloat(translateScale[3]),
    };
  }

  const matrix = transform.match(/matrix\((-?[0-9.]+),\s*(-?[0-9.]+),\s*(-?[0-9.]+),\s*(-?[0-9.]+),\s*(-?[0-9.]+),\s*(-?[0-9.]+)\)/);
  if (matrix) {
    return {
      translateX: Number.parseFloat(matrix[5]),
      translateY: Number.parseFloat(matrix[6]),
      scale: Number.parseFloat(matrix[1]),
    };
  }

  return {
    translateX: state.translateX,
    translateY: state.translateY,
    scale: state.scale,
  };
}

function managedDistance(first: Touch, second: Touch) {
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

function managedMidpoint(first: Touch, second: Touch, viewport: HTMLElement) {
  const rect = viewport.getBoundingClientRect();
  return {
    x: ((first.clientX + second.clientX) / 2) - rect.left,
    y: ((first.clientY + second.clientY) / 2) - rect.top,
  };
}

function managedClamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function markManagedInteraction(state: ManagedMapState) {
  state.protectUntil = Date.now() + 2500;
  queueManagedRestore();
}

function applyManagedTransform(kind: ManagedMapKind) {
  const map = MANAGED_FULL_MAPS.find((item) => item.kind === kind);
  const state = managedMapStates[kind];
  if (!map) return;

  const stage = document.querySelector<HTMLElement>(`${map.viewportSelector} ${map.stageSelector}`);
  if (!stage) return;

  const nextTransform = `translate3d(${state.translateX}px, ${state.translateY}px, 0) scale(${state.scale})`;
  if (stage.style.transform !== nextTransform) {
    stage.style.setProperty('transform', nextTransform, 'important');
  }
}

function restoreManagedTransforms() {
  const now = Date.now();
  (Object.keys(managedMapStates) as ManagedMapKind[]).forEach((kind) => {
    const state = managedMapStates[kind];
    if (state.protectUntil > now) applyManagedTransform(kind);
  });
}

function queueManagedRestore() {
  (Object.keys(managedMapStates) as ManagedMapKind[]).forEach((kind) => {
    const state = managedMapStates[kind];
    if (state.restoreTimer !== null) return;

    state.restoreTimer = window.setTimeout(() => {
      state.restoreTimer = null;
      restoreManagedTransforms();
      if (state.protectUntil > Date.now()) queueManagedRestore();
    }, 48);
  });
}

function stopManagedTouchEvent(event: TouchEvent) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function handleManagedTouchStart(event: TouchEvent) {
  const context = getManagedContext(event.target);
  if (!context) return;

  const state = managedMapStates[context.kind];
  const current = readManagedTransform(context.stage, state);
  state.translateX = current.translateX;
  state.translateY = current.translateY;
  state.scale = Number.isFinite(current.scale) && current.scale > 0 ? current.scale : 1;

  if (event.touches.length >= 2) {
    const [first, second] = [event.touches[0], event.touches[1]];
    const mid = managedMidpoint(first, second, context.viewport);
    state.gesture = {
      mode: 'pinch',
      startDistance: managedDistance(first, second),
      startScale: state.scale,
      anchorX: (mid.x - state.translateX) / state.scale,
      anchorY: (mid.y - state.translateY) / state.scale,
    };
    markManagedInteraction(state);
    stopManagedTouchEvent(event);
    return;
  }

  if (event.touches.length === 1) {
    const touch = event.touches[0];
    state.gesture = {
      mode: 'pan',
      x: touch.clientX,
      y: touch.clientY,
      translateX: state.translateX,
      translateY: state.translateY,
    };
    markManagedInteraction(state);
    stopManagedTouchEvent(event);
  }
}

function handleManagedTouchMove(event: TouchEvent) {
  const context = getManagedContext(event.target);
  if (!context) return;

  const state = managedMapStates[context.kind];
  if (!state.gesture) return;

  if (state.gesture.mode === 'pinch' && event.touches.length >= 2) {
    const [first, second] = [event.touches[0], event.touches[1]];
    const mid = managedMidpoint(first, second, context.viewport);
    const nextDistance = managedDistance(first, second);
    state.scale = managedClamp(state.gesture.startScale * (nextDistance / Math.max(1, state.gesture.startDistance)), 0.12, 3.4);
    state.translateX = mid.x - (state.gesture.anchorX * state.scale);
    state.translateY = mid.y - (state.gesture.anchorY * state.scale);
    applyManagedTransform(context.kind);
    markManagedInteraction(state);
    stopManagedTouchEvent(event);
    return;
  }

  if (state.gesture.mode === 'pan' && event.touches.length === 1) {
    const touch = event.touches[0];
    state.translateX = state.gesture.translateX + (touch.clientX - state.gesture.x);
    state.translateY = state.gesture.translateY + (touch.clientY - state.gesture.y);
    applyManagedTransform(context.kind);
    markManagedInteraction(state);
    stopManagedTouchEvent(event);
  }
}

function handleManagedTouchEnd(event: TouchEvent) {
  const context = getManagedContext(event.target);
  if (!context) return;

  const state = managedMapStates[context.kind];
  if (event.touches.length === 0) {
    state.gesture = null;
    markManagedInteraction(state);
    stopManagedTouchEvent(event);
    return;
  }

  if (event.touches.length === 1) {
    const touch = event.touches[0];
    state.gesture = {
      mode: 'pan',
      x: touch.clientX,
      y: touch.clientY,
      translateX: state.translateX,
      translateY: state.translateY,
    };
    markManagedInteraction(state);
    stopManagedTouchEvent(event);
  }
}

function scheduleRefinement() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    ensureStyles();
    renderToolbarBackdrop();
    refineGenerationOverview();
    restoreManagedTransforms();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  scheduleRefinement();
  [80, 180, 420, 900].forEach((delay) => window.setTimeout(scheduleRefinement, delay));

  document.addEventListener('click', handleOverlayClick, { capture: true });
  document.addEventListener('touchstart', handleManagedTouchStart, { capture: true, passive: false });
  document.addEventListener('touchmove', handleManagedTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleManagedTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', handleManagedTouchEnd, { capture: true, passive: false });

  const observer = new MutationObserver(scheduleRefinement);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      'data-mobile-family-map-panel-mode',
      'data-mobile-family-map-toolbar-active',
      'data-mobile-family-map-toolbar-action',
      'style',
      'aria-current',
      'aria-pressed',
    ],
  });

  window.addEventListener('resize', scheduleRefinement, { passive: true });
  window.addEventListener('orientationchange', () => window.setTimeout(scheduleRefinement, 180), { passive: true });
  window.addEventListener('popstate', scheduleRefinement, { passive: true });
  window.addEventListener('scroll', scheduleRefinement, { passive: true });
}

export {};
