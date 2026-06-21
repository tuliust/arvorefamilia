const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const FULL_MAP_ID = 'mobile-family-map-full-overview';
const STYLE_ID = 'mobile-family-map-full-overview-style';
const FULL_MAP_BUTTON_ATTR = 'data-mobile-family-full-map-button';

type ScreenName =
  | 'paternal-ancestors'
  | 'grandparents'
  | 'maternal-ancestors'
  | 'paternal-uncles'
  | 'core'
  | 'maternal-uncles'
  | 'paternal-cousins'
  | 'descendants'
  | 'maternal-cousins';

type GestureState =
  | { mode: 'pan'; x: number; y: number; translateX: number; translateY: number }
  | { mode: 'pinch'; startDistance: number; startScale: number; anchorX: number; anchorY: number };

const SCREEN_ORDER: ScreenName[] = [
  'paternal-ancestors',
  'grandparents',
  'maternal-ancestors',
  'paternal-uncles',
  'core',
  'maternal-uncles',
  'paternal-cousins',
  'descendants',
  'maternal-cousins',
];

const SCREEN_TITLES: Record<ScreenName, string> = {
  'paternal-ancestors': 'Ancestrais paternos',
  grandparents: 'Avós',
  'maternal-ancestors': 'Ancestrais maternos',
  'paternal-uncles': 'Tios paternos',
  core: 'Núcleo central',
  'maternal-uncles': 'Tios maternos',
  'paternal-cousins': 'Primos paternos',
  descendants: 'Descendentes',
  'maternal-cousins': 'Primos maternos',
};

let gestureState: GestureState | null = null;
let scale = 1;
let translateX = 0;
let translateY = 0;
let scheduled = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && isMobileViewport()
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      #${OVERVIEW_ID} [${FULL_MAP_BUTTON_ATTR}="true"] {
        appearance: none !important;
        display: flex !important;
        width: min(100%, 28rem) !important;
        min-height: 3.1rem !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0.7rem auto 0 !important;
        border: 1px solid rgb(37, 99, 235) !important;
        border-radius: 1.15rem !important;
        background: rgb(37, 99, 235) !important;
        color: #fff !important;
        box-shadow: 0 14px 30px rgba(37, 99, 235, 0.22) !important;
        font: inherit !important;
        font-size: 0.9rem !important;
        font-weight: 900 !important;
        letter-spacing: -0.01em !important;
        line-height: 1 !important;
        text-align: center !important;
        touch-action: manipulation !important;
      }

      #${FULL_MAP_ID} {
        position: fixed !important;
        inset: 0 !important;
        z-index: 12140 !important;
        display: flex !important;
        flex-direction: column !important;
        background: rgba(248, 250, 252, 0.985) !important;
        backdrop-filter: blur(8px) !important;
        padding: calc(env(safe-area-inset-top, 0px) + 0.75rem) 0.75rem calc(env(safe-area-inset-bottom, 0px) + 5.4rem) !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-header {
        display: flex !important;
        align-items: center !important;
        gap: 0.75rem !important;
        width: min(100%, 28rem) !important;
        margin: 0 auto 0.75rem !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 1.35rem !important;
        background: rgba(255, 255, 255, 0.97) !important;
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12) !important;
        padding: 0.72rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-title-wrap {
        min-width: 0 !important;
        flex: 1 1 auto !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-title {
        margin: 0 !important;
        color: rgb(15, 23, 42) !important;
        font-size: 1.12rem !important;
        font-weight: 950 !important;
        line-height: 1.05 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-subtitle {
        margin: 0.2rem 0 0 !important;
        color: rgb(71, 85, 105) !important;
        font-size: 0.72rem !important;
        font-weight: 750 !important;
        line-height: 1.2 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-close,
      #${FULL_MAP_ID} .mobile-family-full-map-reset {
        appearance: none !important;
        display: inline-flex !important;
        flex: 0 0 auto !important;
        align-items: center !important;
        justify-content: center !important;
        border: 1px solid rgb(226, 232, 240) !important;
        background: #fff !important;
        color: rgb(15, 23, 42) !important;
        font: inherit !important;
        font-weight: 900 !important;
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08) !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-close {
        width: 2.45rem !important;
        height: 2.45rem !important;
        border-radius: 999px !important;
        font-size: 1.25rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-reset {
        min-height: 2.45rem !important;
        border-radius: 999px !important;
        padding: 0 0.72rem !important;
        font-size: 0.72rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-viewport {
        position: relative !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
        width: 100% !important;
        overflow: hidden !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 1.5rem !important;
        background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,245,249,0.98)) !important;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7), 0 20px 54px rgba(15,23,42,0.12) !important;
        touch-action: none !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-stage {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        display: grid !important;
        width: 1050px !important;
        min-height: 1180px !important;
        grid-template-columns: repeat(3, 330px) !important;
        align-items: start !important;
        gap: 18px !important;
        padding: 18px !important;
        transform-origin: 0 0 !important;
        will-change: transform !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-tile {
        min-width: 0 !important;
        min-height: 330px !important;
        border: 1px solid rgb(203, 213, 225) !important;
        border-radius: 1.25rem !important;
        background: rgba(255,255,255,0.98) !important;
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.1) !important;
        padding: 0.75rem !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-tile-title {
        margin: 0 0 0.55rem !important;
        color: rgb(15, 23, 42) !important;
        font-size: 0.72rem !important;
        font-weight: 950 !important;
        letter-spacing: 0.12em !important;
        line-height: 1.05 !important;
        text-align: center !important;
        text-transform: uppercase !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-tile-body,
      #${FULL_MAP_ID} .mobile-family-full-map-clone {
        width: 100% !important;
        min-width: 0 !important;
        min-height: 0 !important;
        height: auto !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone *,
      #${FULL_MAP_ID} .mobile-family-full-map-clone {
        max-width: 100% !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone .pointer-events-none.absolute,
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-uncle-branch-connector],
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-maternal-uncle-down-connector],
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-uncle-native-connector],
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-core-center-descendant-line],
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-family-tree-descendant-source],
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-family-tree-descendant-connector] {
        display: none !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone > div,
      #${FULL_MAP_ID} .mobile-family-full-map-clone > div > div,
      #${FULL_MAP_ID} .mobile-family-full-map-clone [class*="z-10"] {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: 0 !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: none !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone section {
        display: flex !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: 0 !important;
        height: auto !important;
        margin: 0 0 0.6rem !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone section > div:has(> h2),
      #${FULL_MAP_ID} .mobile-family-full-map-clone section > div:has(> h3) {
        width: 100% !important;
        min-height: 0 !important;
        height: auto !important;
        padding: 0.55rem !important;
        border-radius: 1rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone h2,
      #${FULL_MAP_ID} .mobile-family-full-map-clone h3,
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-family-map-group-title="true"] {
        margin: 0 0 0.45rem !important;
        font-size: 0.62rem !important;
        line-height: 1.05 !important;
        letter-spacing: 0.12em !important;
        text-align: center !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone h2 + div,
      #${FULL_MAP_ID} .mobile-family-full-map-clone h3 + div,
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-family-map-group="true"] > div:last-child {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 0.38rem !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-mobile-card="true"],
      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-color-key] {
        width: 100% !important;
        min-width: 0 !important;
        height: 54px !important;
        min-height: 54px !important;
        gap: 0.35rem !important;
        border-radius: 0.82rem !important;
        padding: 0.32rem 0.38rem !important;
        box-shadow: 0 5px 14px rgba(15,23,42,0.08) !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-mobile-card="true"] > :first-child,
      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-color-key] [data-family-map-avatar="true"] {
        width: 32px !important;
        min-width: 32px !important;
        max-width: 32px !important;
        height: 32px !important;
        min-height: 32px !important;
        max-height: 32px !important;
        flex: 0 0 32px !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-mobile-card="true"] > span,
      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-color-key] > span {
        min-width: 0 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-mobile-card="true"] > span > span:first-child,
      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-color-key] span.block {
        font-size: 0.48rem !important;
        line-height: 1.02 !important;
        letter-spacing: 0.02em !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone .family-map-status-icon {
        width: 0.5rem !important;
        height: 0.5rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-empty {
        display: flex !important;
        min-height: 5rem !important;
        align-items: center !important;
        justify-content: center !important;
        border: 1px dashed rgb(203, 213, 225) !important;
        border-radius: 1rem !important;
        color: rgb(100, 116, 139) !important;
        font-size: 0.72rem !important;
        font-weight: 800 !important;
        text-align: center !important;
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

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getScreen(screenName: ScreenName) {
  return getRoot()?.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`) ?? null;
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

function applyTransform() {
  const stage = document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-family-full-map-stage`);
  if (!stage) return;
  stage.style.setProperty('transform', `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`, 'important');
}

function resetTransform() {
  const viewport = document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-family-full-map-viewport`);
  const stage = document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-family-full-map-stage`);
  if (!viewport || !stage) return;

  const viewportRect = viewport.getBoundingClientRect();
  const stageWidth = stage.offsetWidth || 1050;
  const stageHeight = stage.offsetHeight || 1180;
  scale = clamp(Math.min((viewportRect.width - 20) / stageWidth, (viewportRect.height - 20) / stageHeight), 0.25, 0.72);
  translateX = Math.max(10, (viewportRect.width - (stageWidth * scale)) / 2);
  translateY = Math.max(10, (viewportRect.height - (stageHeight * scale)) / 2);
  applyTransform();
}

function cleanupClone(clone: HTMLElement) {
  clone.classList.add('mobile-family-full-map-clone');
  clone.querySelectorAll<HTMLElement>([
    '[data-tree-export-ignore="true"]',
    '.pointer-events-none.absolute',
    '[data-mobile-uncle-branch-connector]',
    '[data-mobile-maternal-uncle-down-connector]',
    '[data-mobile-uncle-native-connector]',
    '[data-mobile-core-center-descendant-line]',
    '[data-mobile-family-tree-descendant-source]',
    '[data-mobile-family-tree-descendant-connector]',
  ].join(',')).forEach((element) => element.remove());

  clone.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    button.setAttribute('type', 'button');
    button.setAttribute('tabindex', '-1');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  });

  clone.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    element.style.removeProperty('transform');
    element.style.removeProperty('transition');
    element.style.removeProperty('top');
    element.style.removeProperty('left');
    element.style.removeProperty('right');
    element.style.removeProperty('bottom');
    element.style.removeProperty('height');
    element.style.removeProperty('width');
  });
}

function buildScreenTile(screenName: ScreenName) {
  const tile = document.createElement('article');
  tile.className = 'mobile-family-full-map-tile';
  tile.dataset.fullMapScreen = screenName;
  tile.innerHTML = `<h3 class="mobile-family-full-map-tile-title">${SCREEN_TITLES[screenName]}</h3>`;

  const body = document.createElement('div');
  body.className = 'mobile-family-full-map-tile-body';
  const screen = getScreen(screenName);
  const source = screen?.querySelector<HTMLElement>(':scope > div > div[class*="z-10"]')
    ?? screen?.querySelector<HTMLElement>(':scope > div')
    ?? screen;

  if (source) {
    const clone = source.cloneNode(true) as HTMLElement;
    cleanupClone(clone);
    body.appendChild(clone);
  } else {
    body.innerHTML = '<div class="mobile-family-full-map-empty">Sem registros neste grupo.</div>';
  }

  tile.appendChild(body);
  return tile;
}

function buildFullMapStage() {
  const stage = document.createElement('div');
  stage.className = 'mobile-family-full-map-stage';
  SCREEN_ORDER.forEach((screenName) => stage.appendChild(buildScreenTile(screenName)));
  return stage;
}

function closeFullMap() {
  document.getElementById(FULL_MAP_ID)?.remove();
  if (!document.getElementById(OVERVIEW_ID)) document.body.style.removeProperty('overflow');
}

function handleTouchStart(event: TouchEvent) {
  const viewport = event.currentTarget as HTMLElement;
  if (!viewport || !document.getElementById(FULL_MAP_ID)) return;

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
  }
}

function handleTouchMove(event: TouchEvent) {
  const viewport = event.currentTarget as HTMLElement;
  if (!gestureState || !viewport || !document.getElementById(FULL_MAP_ID)) return;

  if (gestureState.mode === 'pinch' && event.touches.length >= 2) {
    const [first, second] = [event.touches[0], event.touches[1]];
    const mid = midpoint(first, second, viewport);
    const nextDistance = distance(first, second);
    scale = clamp(gestureState.startScale * (nextDistance / Math.max(1, gestureState.startDistance)), 0.24, 2.4);
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

function openFullMap() {
  if (!isEnabled()) return;
  ensureStyles();
  document.getElementById(FULL_MAP_ID)?.remove();

  const overlay = document.createElement('div');
  overlay.id = FULL_MAP_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Mapa completo da família');
  overlay.setAttribute('data-tree-export-ignore', 'true');
  overlay.innerHTML = `
    <header class="mobile-family-full-map-header">
      <div class="mobile-family-full-map-title-wrap">
        <h2 class="mobile-family-full-map-title">Mapa completo</h2>
        <p class="mobile-family-full-map-subtitle">Use dois dedos para ampliar, reduzir e arrastar.</p>
      </div>
      <button type="button" class="mobile-family-full-map-reset" aria-label="Reenquadrar mapa completo">Reenquadrar</button>
      <button type="button" class="mobile-family-full-map-close" aria-label="Fechar mapa completo">×</button>
    </header>
    <div class="mobile-family-full-map-viewport" aria-label="Mapa completo com zoom por pinça"></div>
  `;

  const viewport = overlay.querySelector<HTMLElement>('.mobile-family-full-map-viewport');
  viewport?.appendChild(buildFullMapStage());
  viewport?.addEventListener('touchstart', handleTouchStart, { passive: false });
  viewport?.addEventListener('touchmove', handleTouchMove, { passive: false });
  viewport?.addEventListener('touchend', handleTouchEnd, { passive: false });
  viewport?.addEventListener('touchcancel', handleTouchEnd, { passive: false });

  overlay.querySelector<HTMLButtonElement>('.mobile-family-full-map-close')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeFullMap();
  });

  overlay.querySelector<HTMLButtonElement>('.mobile-family-full-map-reset')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    resetTransform();
  });

  document.body.appendChild(overlay);
  document.body.style.setProperty('overflow', 'hidden');
  window.setTimeout(resetTransform, 40);
}

function ensureFullMapButton() {
  if (!isEnabled()) return;
  ensureStyles();
  const overview = document.getElementById(OVERVIEW_ID);
  const map = overview?.querySelector<HTMLElement>('.mobile-family-overview-map');
  if (!overview || !map) return;

  let button = overview.querySelector<HTMLButtonElement>(`[${FULL_MAP_BUTTON_ATTR}="true"]`);
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.setAttribute(FULL_MAP_BUTTON_ATTR, 'true');
    button.textContent = 'Exibir mapa completo';
    map.insertAdjacentElement('afterend', button);
  }

  if (button.dataset.mobileFamilyFullMapBound !== 'true') {
    button.dataset.mobileFamilyFullMapBound = 'true';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();
      openFullMap();
    });
  }
}

function scheduleEnsureButton() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    ensureFullMapButton();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  ensureFullMapButton();
  [80, 220, 520, 1000].forEach((delay) => window.setTimeout(ensureFullMapButton, delay));

  const observer = new MutationObserver(scheduleEnsureButton);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', () => {
    ensureFullMapButton();
    if (document.getElementById(FULL_MAP_ID)) resetTransform();
  }, { passive: true });
  window.addEventListener('orientationchange', () => {
    ensureFullMapButton();
    if (document.getElementById(FULL_MAP_ID)) window.setTimeout(resetTransform, 220);
  }, { passive: true });
  window.addEventListener('popstate', () => { closeFullMap(); }, { passive: true });
  document.addEventListener('visibilitychange', ensureFullMapButton, { passive: true });
}

export {};
