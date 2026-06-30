const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const TOOLBAR_ZOOM_SELECTOR = '[data-mobile-family-map-toolbar-action="zoom"]';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-map-overview-button-fix-style';
const MOBILE_MAP_SHELL_TOP_OFFSET = 'calc(env(safe-area-inset-top, 0px) + 9rem)';
const MOBILE_MAP_SHELL_BOTTOM_OFFSET = 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)';
const MOBILE_MAP_OVERLAY_Z_INDEX = '900';
const DESCENDANTS_LOCK_ATTR = 'data-mobile-family-descendants-transform-lock';

const DESCENDANT_KEYS = ['irmaos', 'sobrinhos', 'conjuge', 'pets', 'filhos', 'netos'];

type ScreenName =
  | 'paternal-ancestors'
  | 'ancestors'
  | 'maternal-ancestors'
  | 'paternal-uncles'
  | 'core'
  | 'maternal-uncles'
  | 'paternal-cousins'
  | 'descendants'
  | 'maternal-cousins';

type ScreenConfig = {
  column: number;
  row: number;
  title: string;
};

const SCREEN_CONFIG: Record<ScreenName, ScreenConfig> = {
  'paternal-ancestors': { column: 0, row: 0, title: 'Ancestrais paternos' },
  ancestors: { column: 1, row: 0, title: 'Avós' },
  'maternal-ancestors': { column: 2, row: 0, title: 'Ancestrais maternos' },
  'paternal-uncles': { column: 0, row: 1, title: 'Tios paternos' },
  core: { column: 1, row: 1, title: 'Núcleo central' },
  'maternal-uncles': { column: 2, row: 1, title: 'Tios maternos' },
  'paternal-cousins': { column: 0, row: 2, title: 'Primos paternos' },
  descendants: { column: 1, row: 2, title: 'Descendentes' },
  'maternal-cousins': { column: 2, row: 2, title: 'Primos maternos' },
};

const ICONS_BY_SCREEN: Record<ScreenName, string> = {
  'paternal-ancestors': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <path d="M16 5v6" />
      <path d="M9 15h14" />
      <path d="M9 15v5" />
      <path d="M23 15v5" />
      <circle cx="16" cy="5" r="3" />
      <rect x="5.75" y="20" width="6.5" height="6" rx="2" />
      <rect x="19.75" y="20" width="6.5" height="6" rx="2" />
      <path d="M9 26h14" />
    </svg>
  `,
  ancestors: `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <circle cx="11" cy="9" r="3.4" />
      <circle cx="21" cy="9" r="3.4" />
      <path d="M8.5 18c1.4-2 3.3-3 5.5-3" />
      <path d="M23.5 18c-1.4-2-3.3-3-5.5-3" />
      <path d="M16 15v8" />
      <path d="M10 23h12" />
      <circle cx="10" cy="25" r="2.4" />
      <circle cx="22" cy="25" r="2.4" />
    </svg>
  `,
  'maternal-ancestors': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <path d="M16 5v5" />
      <circle cx="16" cy="5" r="3" />
      <path d="M16 10c-5 3-8 6.5-8 11" />
      <path d="M16 10c5 3 8 6.5 8 11" />
      <circle cx="8" cy="23" r="3" />
      <circle cx="24" cy="23" r="3" />
      <path d="M11 23h10" />
    </svg>
  `,
  'paternal-uncles': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <circle cx="11" cy="10" r="4" />
      <circle cx="21" cy="10" r="4" />
      <path d="M5.5 25c.8-4.4 3-6.7 6.5-6.7" />
      <path d="M26.5 25c-.8-4.4-3-6.7-6.5-6.7" />
      <path d="M13 20h6" />
    </svg>
  `,
  core: `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <path d="M7 16l9-8 9 8" />
      <path d="M10 15v10h12V15" />
      <circle cx="16" cy="17" r="2.5" />
      <path d="M11.5 24c.8-3 2.3-4.5 4.5-4.5s3.7 1.5 4.5 4.5" />
    </svg>
  `,
  'maternal-uncles': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <circle cx="16" cy="9" r="3.5" />
      <path d="M10.5 21.5c.8-4.2 2.7-6.4 5.5-6.4s4.7 2.2 5.5 6.4" />
      <path d="M7 24h18" />
      <path d="M8.5 14.5l-3-3" />
      <path d="M23.5 14.5l3-3" />
      <circle cx="5" cy="10" r="2" />
      <circle cx="27" cy="10" r="2" />
    </svg>
  `,
  'paternal-cousins': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <circle cx="9" cy="10" r="3" />
      <circle cx="23" cy="10" r="3" />
      <circle cx="9" cy="23" r="3" />
      <circle cx="23" cy="23" r="3" />
      <path d="M12 10h8" />
      <path d="M9 13v7" />
      <path d="M23 13v7" />
      <path d="M12 23h8" />
    </svg>
  `,
  descendants: `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <circle cx="16" cy="6" r="3" />
      <path d="M16 9v5" />
      <path d="M9 16h14" />
      <path d="M9 16v4" />
      <path d="M16 16v4" />
      <path d="M23 16v4" />
      <circle cx="9" cy="24" r="3" />
      <circle cx="16" cy="24" r="3" />
      <circle cx="23" cy="24" r="3" />
    </svg>
  `,
  'maternal-cousins': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <path d="M16 7v18" />
      <path d="M7 16h18" />
      <path d="M10 10l12 12" />
      <path d="M22 10L10 22" />
      <circle cx="16" cy="16" r="3.2" />
      <circle cx="16" cy="7" r="2.2" />
      <circle cx="25" cy="16" r="2.2" />
      <circle cx="16" cy="25" r="2.2" />
      <circle cx="7" cy="16" r="2.2" />
    </svg>
  `,
};

const SCREEN_ORDER = Object.keys(SCREEN_CONFIG) as ScreenName[];
let lastHandledAt = 0;

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

function isScreenName(value: string | null | undefined): value is ScreenName {
  return Boolean(value && value in SCREEN_CONFIG);
}

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value: string) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function getScreenElement(screenName: ScreenName, root = getRoot()) {
  return root?.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`) ?? null;
}

function getTransformForScreen(screenName: ScreenName) {
  const { column, row } = SCREEN_CONFIG[screenName];
  return `translate3d(calc(${-column * (100 / 3)}% + 0px), calc(${-row * (100 / 3)}% + 0px), 0)`;
}

function parseTranslatePercent(value: string) {
  const match = value.match(/translate3d\(calc\((-?\d+(?:\.\d+)?)%[^,]*,\s*calc\((-?\d+(?:\.\d+)?)%/);
  if (!match) return null;

  const x = Math.abs(Number(match[1]));
  const y = Math.abs(Number(match[2]));
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const toIndex = (percent: number) => {
    if (percent < 1) return 0;
    if (Math.abs(percent - 100 / 3) < 2) return 1;
    if (Math.abs(percent - 200 / 3) < 2) return 2;
    return null;
  };

  const column = toIndex(x);
  const row = toIndex(y);
  if (column === null || row === null) return null;

  return SCREEN_ORDER.find((screenName) => {
    const position = SCREEN_CONFIG[screenName];
    return position.column === column && position.row === row;
  }) ?? null;
}

function getCurrentScreen() {
  const root = getRoot();
  const explicit = root?.getAttribute('data-mobile-family-tree-active-screen');
  if (isScreenName(explicit)) return explicit;
  return parseTranslatePercent(getStage(root)?.style.transform ?? '') ?? 'core';
}

function descendantCardSelector() {
  return DESCENDANT_KEYS.map((key) => `[data-family-map-color-key="${key}"]`).join(', ');
}

function getSourceDescendantCount(root = getRoot()) {
  const coreScreen = getScreenElement('core', root);
  if (!coreScreen) return 0;
  return coreScreen.querySelectorAll(descendantCardSelector()).length;
}

function countCards(screenName: ScreenName) {
  const root = getRoot();
  if (!root) return 0;
  if (screenName === 'core') return getScreenElement('core', root)?.querySelectorAll('[data-family-map-mobile-card="true"]').length || 1;
  if (screenName === 'descendants') return getSourceDescendantCount(root);
  return getScreenElement(screenName, root)?.querySelectorAll('[data-family-map-mobile-card="true"]').length ?? 0;
}

function screenHasContent(screenName: ScreenName) {
  if (screenName === 'core') return true;
  if (screenName === 'descendants') return getSourceDescendantCount() > 0;
  return countCards(screenName) > 0;
}

function unlockDescendantLockForOverviewNavigation() {
  const root = getRoot();
  const stage = getStage(root);
  root?.removeAttribute(DESCENDANTS_LOCK_ATTR);
  stage?.style.setProperty('transition', 'none', 'important');
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      ${TOOLBAR_ZOOM_SELECTOR} {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.2rem !important;
      }

      ${TOOLBAR_ZOOM_SELECTOR}::before {
        content: '▦';
        display: inline-block;
        font-size: 0.72rem;
        line-height: 1;
        transform: translateY(-0.02rem);
      }

      #${OVERVIEW_ID} {
        position: fixed !important;
        top: ${MOBILE_MAP_SHELL_TOP_OFFSET} !important;
        right: 0 !important;
        bottom: ${MOBILE_MAP_SHELL_BOTTOM_OFFSET} !important;
        left: 0 !important;
        z-index: ${MOBILE_MAP_OVERLAY_Z_INDEX} !important;
        display: flex !important;
        flex-direction: column !important;
        min-height: 0 !important;
        background: linear-gradient(180deg, rgba(248, 250, 252, 0.99), rgba(239, 246, 255, 0.98)) !important;
        backdrop-filter: blur(10px) !important;
        padding: 0.75rem !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-map {
        box-sizing: border-box !important;
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        grid-template-rows: repeat(3, minmax(5.25rem, 1fr)) !important;
        gap: 0.52rem !important;
        width: min(100%, 28rem) !important;
        height: 100% !important;
        min-height: 0 !important;
        max-height: 100% !important;
        flex: 1 1 auto !important;
        margin: 0 auto !important;
        border: 1px solid rgba(203, 213, 225, 0.95) !important;
        border-radius: 1.75rem !important;
        background: rgba(255, 255, 255, 0.86) !important;
        box-shadow: 0 20px 54px rgba(15, 23, 42, 0.13) !important;
        padding: 0.64rem !important;
        overflow: auto !important;
        overscroll-behavior: contain !important;
        -webkit-overflow-scrolling: touch !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile {
        appearance: none !important;
        box-sizing: border-box !important;
        position: relative !important;
        display: flex !important;
        min-width: 0 !important;
        min-height: 0 !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 0.16rem !important;
        overflow: hidden !important;
        border: 1px solid rgb(203, 213, 225) !important;
        border-radius: 1.18rem !important;
        background: linear-gradient(180deg, rgba(255,255,255,0.99), rgba(248,250,252,0.98)) !important;
        color: rgb(15, 23, 42) !important;
        font: inherit !important;
        text-align: center !important;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
        padding: 8px !important;
        touch-action: manipulation !important;
        letter-spacing: 0 !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile::after {
        display: none !important;
        content: none !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[aria-current="location"] {
        border-color: rgb(37, 99, 235) !important;
        background: linear-gradient(180deg, rgba(239,246,255,1), rgba(255,255,255,0.99)) !important;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.14), 0 14px 30px rgba(37, 99, 235, 0.12) !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-title {
        position: relative !important;
        z-index: 1 !important;
        display: flex !important;
        width: 100% !important;
        min-height: 1.1rem !important;
        align-items: center !important;
        justify-content: center !important;
        color: rgb(15, 23, 42) !important;
        font-size: clamp(0.52rem, 2.32vw, 0.66rem) !important;
        font-weight: 950 !important;
        letter-spacing: -0.035em !important;
        line-height: 0.92 !important;
        text-align: center !important;
        text-transform: uppercase !important;
      }

      #${OVERVIEW_ID} .mobile-family-map-overview-tile-icon,
      #${OVERVIEW_ID} .mobile-family-overview-tile-icon {
        position: relative !important;
        z-index: 1 !important;
        display: flex !important;
        width: 100% !important;
        flex: 0 0 auto !important;
        min-height: 3.6rem !important;
        align-items: center !important;
        justify-content: center !important;
        margin: auto 0 !important;
        color: rgb(37, 99, 235) !important;
        opacity: 0.9 !important;
        letter-spacing: 0 !important;
      }

      #${OVERVIEW_ID} .mobile-family-map-overview-tile-icon svg,
      #${OVERVIEW_ID} .mobile-family-overview-tile-icon svg {
        display: block !important;
        width: clamp(2.8rem, 13.8vw, 4.1rem) !important;
        height: clamp(2.8rem, 13.8vw, 4.1rem) !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 1.55 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-count {
        position: relative !important;
        z-index: 1 !important;
        display: inline-flex !important;
        width: fit-content !important;
        max-width: 100% !important;
        align-items: center !important;
        justify-content: center !important;
        border: 1px solid rgb(191, 219, 254) !important;
        border-radius: 999px !important;
        background: rgb(239, 246, 255) !important;
        color: rgb(30, 64, 175) !important;
        margin: 0 auto !important;
        padding: 0.2rem 0.42rem !important;
        font-size: clamp(0.62rem, 2.55vw, 0.76rem) !important;
        font-weight: 900 !important;
        line-height: 1.05 !important;
        white-space: nowrap !important;
        letter-spacing: 0 !important;
        text-align: center !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-subtitle,
      #${OVERVIEW_ID} .mobile-family-overview-current-label,
      #${OVERVIEW_ID} [data-mobile-family-overview-current-label="true"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
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

function relabelToolbarButton() {
  document.querySelectorAll<HTMLButtonElement>(TOOLBAR_ZOOM_SELECTOR).forEach((button) => {
    if (normalize(button.textContent ?? '') !== 'mapa') button.textContent = 'Mapa';
    button.setAttribute('aria-label', 'Abrir visão geral do mapa familiar');
    button.setAttribute('title', 'Visão geral');
  });
}

function setToolbarOverviewActive(active: boolean) {
  document.querySelectorAll<HTMLButtonElement>(TOOLBAR_ZOOM_SELECTOR).forEach((button) => {
    if (active) {
      button.setAttribute('aria-pressed', 'true');
      button.setAttribute('data-mobile-family-map-overview-active', 'true');
    } else {
      button.removeAttribute('aria-pressed');
      button.removeAttribute('data-mobile-family-map-overview-active');
    }
  });
}

function closeOverview(updateToolbar = true) {
  document.getElementById(OVERVIEW_ID)?.remove();
  document.body.style.removeProperty('overflow');
  if (updateToolbar) setToolbarOverviewActive(false);
}

function clickBaseTab(screenName: ScreenName) {
  const root = getRoot();
  if (!root) return;

  const label = screenName.startsWith('paternal')
    ? 'paterno'
    : screenName.startsWith('maternal')
      ? 'materno'
      : 'central';

  const tab = Array.from(root.querySelectorAll<HTMLButtonElement>('nav[aria-label="Visualizações da árvore"] button'))
    .find((candidate) => normalize(candidate.textContent ?? '').includes(label));

  tab?.click();
}

function applyScreen(screenName: ScreenName, animate = true) {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) return;

  stage.style.setProperty('transform', getTransformForScreen(screenName), 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');
  root.setAttribute('data-mobile-family-tree-active-screen', screenName);

  getScreenElement(screenName, root)?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll], .mobile-family-descendant-screen__scroll').forEach((scrollArea) => {
    scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });

  if (animate) window.setTimeout(() => getStage()?.style.removeProperty('transition'), 340);
}

function navigateToScreen(screenName: ScreenName) {
  if (!screenHasContent(screenName)) return;

  unlockDescendantLockForOverviewNavigation();
  closeOverview();
  clickBaseTab(screenName);
  applyScreen(screenName);
  [60, 140, 300, 520, 780].forEach((delay) => {
    window.setTimeout(() => applyScreen(screenName, delay < 520), delay);
  });
}

function peopleLabel(count: number) {
  return `${count} pessoa${count === 1 ? '' : 's'}`;
}

function buildTile(screenName: ScreenName, currentScreen: ScreenName) {
  const config = SCREEN_CONFIG[screenName];
  const tile = document.createElement('button');
  const current = screenName === currentScreen;
  const count = countCards(screenName);

  tile.type = 'button';
  tile.className = 'mobile-family-overview-tile';
  tile.dataset.screen = screenName;
  tile.style.gridColumn = String(config.column + 1);
  tile.style.gridRow = String(config.row + 1);
  tile.setAttribute('aria-label', `${current ? 'Tela atual: ' : 'Abrir tela: '}${config.title}`);
  if (current) tile.setAttribute('aria-current', 'location');

  tile.innerHTML = `
    <span class="mobile-family-overview-tile-title">${escapeHtml(config.title)}</span>
    <span class="mobile-family-overview-tile-icon mobile-family-map-overview-tile-icon" data-mobile-family-map-unique-icon="${screenName}" aria-hidden="true">
      ${ICONS_BY_SCREEN[screenName].trim()}
    </span>
    <span class="mobile-family-overview-tile-count" data-mobile-family-overview-count-badge="true">${escapeHtml(peopleLabel(count))}</span>
  `;

  return tile;
}

function openOverview() {
  if (!isEnabled()) return;
  ensureStyles();
  relabelToolbarButton();
  closeOverview(false);

  const currentScreen = getCurrentScreen();
  const overlay = document.createElement('div');
  overlay.id = OVERVIEW_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Visão geral do mapa familiar');
  overlay.setAttribute('data-tree-export-ignore', 'true');
  overlay.setAttribute('data-mobile-family-map-overview-source', 'direct-map');
  overlay.setAttribute('data-mobile-family-map-overview-stable', 'true');

  overlay.innerHTML = '<div class="mobile-family-overview-map" aria-label="Grupos do mapa familiar"></div>';

  const map = overlay.querySelector<HTMLElement>('.mobile-family-overview-map');
  SCREEN_ORDER.forEach((screenName) => {
    if (screenName !== 'core' && !screenHasContent(screenName)) return;
    map?.appendChild(buildTile(screenName, currentScreen));
  });

  document.body.appendChild(overlay);
  document.body.style.setProperty('overflow', 'hidden');
  setToolbarOverviewActive(true);
}

function toggleOverview() {
  if (document.getElementById(OVERVIEW_ID)) closeOverview();
  else openOverview();
}

function consume(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function handleActivation(event: Event) {
  if (!isEnabled()) return;
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const zoomButton = target.closest<HTMLElement>(TOOLBAR_ZOOM_SELECTOR);
  if (zoomButton) {
    consume(event);
    const now = Date.now();
    if (now - lastHandledAt < 260) return;
    lastHandledAt = now;
    toggleOverview();
    return;
  }

  const overlay = document.getElementById(OVERVIEW_ID);
  if (!overlay || !overlay.contains(target)) return;

  const tile = target.closest<HTMLElement>('.mobile-family-overview-tile[data-screen]');
  const screenName = tile?.dataset.screen;
  if (!isScreenName(screenName)) return;

  consume(event);
  const now = Date.now();
  if (now - lastHandledAt < 260) return;
  lastHandledAt = now;
  navigateToScreen(screenName);
}

function applyFixes() {
  if (!isEnabled()) return;
  ensureStyles();
  relabelToolbarButton();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyFixes();
  [80, 240, 520, 1000, 1800].forEach((delay) => window.setTimeout(applyFixes, delay));

  window.addEventListener('pointerdown', handleActivation, { capture: true });
  window.addEventListener('pointerup', handleActivation, { capture: true });
  window.addEventListener('touchend', handleActivation, { capture: true, passive: false });
  window.addEventListener('click', handleActivation, { capture: true });
  window.addEventListener('resize', applyFixes, { passive: true });
  window.addEventListener('orientationchange', applyFixes, { passive: true });
  window.addEventListener('popstate', () => { closeOverview(false); applyFixes(); }, { passive: true });
  document.addEventListener('visibilitychange', applyFixes, { passive: true });

  const observer = new MutationObserver(applyFixes);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

export {};
