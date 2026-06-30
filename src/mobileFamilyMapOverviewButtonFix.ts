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

const SCREEN_CONFIG: Record<ScreenName, { column: number; row: number; title: string; subtitle: string }> = {
  'paternal-ancestors': { column: 0, row: 0, title: 'Ancestrais paternos', subtitle: 'Bisavós e tataravós' },
  ancestors: { column: 1, row: 0, title: 'Avós', subtitle: 'Avós paternos e maternos' },
  'maternal-ancestors': { column: 2, row: 0, title: 'Ancestrais maternos', subtitle: 'Bisavós e tataravós' },
  'paternal-uncles': { column: 0, row: 1, title: 'Tios paternos', subtitle: 'Ramo do pai' },
  core: { column: 1, row: 1, title: 'Núcleo central', subtitle: 'Pais e pessoa principal' },
  'maternal-uncles': { column: 2, row: 1, title: 'Tios maternos', subtitle: 'Ramo da mãe' },
  'paternal-cousins': { column: 0, row: 2, title: 'Primos paternos', subtitle: 'Descendentes dos tios' },
  descendants: { column: 1, row: 2, title: 'Descendentes', subtitle: 'Irmãos, filhos e netos' },
  'maternal-cousins': { column: 2, row: 2, title: 'Primos maternos', subtitle: 'Descendentes dos tios' },
};

const SCREEN_ORDER = Object.keys(SCREEN_CONFIG) as ScreenName[];
let lastHandledAt = 0;

const TILE_ICON_HTML = `
  <span class="mobile-family-map-overview-tile-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 4.5v4.25" />
      <path d="M7.5 13.25h9" />
      <path d="M7.5 13.25v2.25" />
      <path d="M16.5 13.25v2.25" />
      <path d="M12 8.75v6.75" />
      <circle cx="12" cy="4.5" r="2.25" />
      <circle cx="7.5" cy="18" r="2.25" />
      <circle cx="12" cy="18" r="2.25" />
      <circle cx="16.5" cy="18" r="2.25" />
    </svg>
  </span>
`;

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
        background: linear-gradient(180deg, rgba(248, 250, 252, 0.99), rgba(239, 246, 255, 0.98)) !important;
        backdrop-filter: blur(10px) !important;
        padding: 0.75rem !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-header {
        box-sizing: border-box !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.75rem !important;
        width: min(100%, 28rem) !important;
        margin: 0 auto 0.75rem !important;
        border: 1px solid rgba(203, 213, 225, 0.92) !important;
        border-radius: 1.55rem !important;
        background: rgba(255, 255, 255, 0.98) !important;
        box-shadow: 0 18px 44px rgba(15, 23, 42, 0.13) !important;
        padding: 0.82rem !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-title-wrap {
        min-width: 0 !important;
        flex: 1 1 auto !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-title {
        margin: 0 !important;
        color: rgb(15, 23, 42) !important;
        font-size: clamp(1.25rem, 6vw, 1.72rem) !important;
        font-weight: 950 !important;
        letter-spacing: -0.055em !important;
        line-height: 1 !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-subtitle {
        margin: 0.22rem 0 0 !important;
        color: rgb(71, 85, 105) !important;
        font-size: 0.82rem !important;
        font-weight: 760 !important;
        line-height: 1.18 !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-close {
        appearance: none !important;
        display: inline-flex !important;
        width: 2.75rem !important;
        height: 2.75rem !important;
        flex: 0 0 auto !important;
        align-items: center !important;
        justify-content: center !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 999px !important;
        background: #fff !important;
        color: rgb(15, 23, 42) !important;
        font: inherit !important;
        font-size: 1.35rem !important;
        font-weight: 950 !important;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.09) !important;
        touch-action: manipulation !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-map {
        box-sizing: border-box !important;
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        grid-auto-rows: minmax(5.95rem, 1fr) !important;
        gap: 0.52rem !important;
        width: min(100%, 28rem) !important;
        min-height: min(63dvh, 38rem) !important;
        flex: 1 1 auto !important;
        margin: 0 auto !important;
        border: 1px solid rgba(203, 213, 225, 0.95) !important;
        border-radius: 1.75rem !important;
        background: rgba(255, 255, 255, 0.86) !important;
        box-shadow: 0 20px 54px rgba(15, 23, 42, 0.13) !important;
        padding: 0.64rem !important;
        overflow: auto !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile {
        appearance: none !important;
        box-sizing: border-box !important;
        position: relative !important;
        display: flex !important;
        min-width: 0 !important;
        min-height: 0 !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        gap: 0.24rem !important;
        overflow: hidden !important;
        border: 1px solid rgb(203, 213, 225) !important;
        border-radius: 1.18rem !important;
        background: linear-gradient(180deg, rgba(255,255,255,0.99), rgba(248,250,252,0.98)) !important;
        color: rgb(15, 23, 42) !important;
        font: inherit !important;
        text-align: left !important;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
        padding: 0.52rem 0.42rem !important;
        touch-action: manipulation !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile::after {
        content: '';
        position: absolute;
        inset: auto 0 0 0;
        height: 2.25rem;
        background: linear-gradient(180deg, rgba(255,255,255,0), rgba(239,246,255,0.72));
        pointer-events: none;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[aria-current="location"] {
        border-color: rgb(37, 99, 235) !important;
        background: linear-gradient(180deg, rgba(239,246,255,1), rgba(255,255,255,0.99)) !important;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.14), 0 14px 30px rgba(37, 99, 235, 0.12) !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-title {
        position: relative !important;
        z-index: 1 !important;
        display: block !important;
        width: 100% !important;
        color: rgb(15, 23, 42) !important;
        font-size: clamp(0.52rem, 2.32vw, 0.66rem) !important;
        font-weight: 950 !important;
        letter-spacing: 0.045em !important;
        line-height: 0.98 !important;
        text-transform: uppercase !important;
      }

      #${OVERVIEW_ID} .mobile-family-map-overview-tile-icon {
        position: relative !important;
        z-index: 1 !important;
        display: flex !important;
        width: 100% !important;
        flex: 1 1 auto !important;
        min-height: 1.65rem !important;
        align-items: center !important;
        justify-content: center !important;
        color: rgb(37, 99, 235) !important;
        opacity: 0.9 !important;
      }

      #${OVERVIEW_ID} .mobile-family-map-overview-tile-icon svg {
        display: block !important;
        width: clamp(1.4rem, 6.8vw, 2rem) !important;
        height: clamp(1.4rem, 6.8vw, 2rem) !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 1.9 !important;
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
        padding: 0.2rem 0.42rem !important;
        font-size: clamp(0.62rem, 2.55vw, 0.76rem) !important;
        font-weight: 900 !important;
        line-height: 1.05 !important;
        white-space: nowrap !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-subtitle,
      #${OVERVIEW_ID} .mobile-family-overview-current-label {
        display: none !important;
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
    ${TILE_ICON_HTML}
    <span class="mobile-family-overview-tile-count">${escapeHtml(peopleLabel(count))}</span>
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

  overlay.innerHTML = `
    <header class="mobile-family-overview-header">
      <div class="mobile-family-overview-title-wrap">
        <h2 class="mobile-family-overview-title">Mapa da família</h2>
        <p class="mobile-family-overview-subtitle">Toque em um grupo para abrir a tela correspondente.</p>
      </div>
      <button type="button" class="mobile-family-overview-close" aria-label="Fechar visão geral">×</button>
    </header>
    <div class="mobile-family-overview-map" aria-label="Grupos do mapa familiar"></div>
  `;

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

  const closeButton = target.closest<HTMLElement>('.mobile-family-overview-close');
  if (closeButton) {
    consume(event);
    closeOverview();
    return;
  }

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
