const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-tree-overview-mode-style';
const TOOLBAR_ZOOM_SELECTOR = '[data-mobile-family-map-toolbar-action="zoom"]';
const ACTIVE_TRIGGER_ATTR = 'data-mobile-family-map-overview-active';

type ScreenName =
  | 'ancestors'
  | 'paternal-uncles'
  | 'core'
  | 'maternal-uncles'
  | 'paternal-cousins'
  | 'maternal-cousins';

const SCREEN_CONFIG: Record<ScreenName, {
  title: string;
  subtitle: string;
  row: number;
  column: number;
}> = {
  ancestors: {
    title: 'Ancestrais',
    subtitle: 'Avós, bisavós e tataravós',
    row: 1,
    column: 2,
  },
  'paternal-uncles': {
    title: 'Tios paternos',
    subtitle: 'Ramo do pai',
    row: 2,
    column: 1,
  },
  core: {
    title: 'Núcleo central',
    subtitle: 'Pais, pessoa principal e descendentes',
    row: 2,
    column: 2,
  },
  'maternal-uncles': {
    title: 'Tios maternos',
    subtitle: 'Ramo da mãe',
    row: 2,
    column: 3,
  },
  'paternal-cousins': {
    title: 'Primos paternos',
    subtitle: 'Descendentes dos tios paternos',
    row: 3,
    column: 1,
  },
  'maternal-cousins': {
    title: 'Primos maternos',
    subtitle: 'Descendentes dos tios maternos',
    row: 3,
    column: 3,
  },
};

const SCREEN_ORDER: ScreenName[] = [
  'ancestors',
  'paternal-uncles',
  'core',
  'maternal-uncles',
  'paternal-cousins',
  'maternal-cousins',
];

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === FAMILY_MAP_PATH;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getZoomButtons() {
  return Array.from(document.querySelectorAll<HTMLButtonElement>(TOOLBAR_ZOOM_SELECTOR));
}

function setToolbarActive(active: boolean) {
  getZoomButtons().forEach((button) => {
    if (active) {
      button.setAttribute(ACTIVE_TRIGGER_ATTR, 'true');
      button.setAttribute('aria-pressed', 'true');
    } else {
      button.removeAttribute(ACTIVE_TRIGGER_ATTR);
      button.removeAttribute('aria-pressed');
    }
  });
}

function getOverviewElement() {
  return document.getElementById(OVERVIEW_ID);
}

function isOverviewOpen() {
  return Boolean(getOverviewElement());
}

function getScreenElement(root: HTMLElement, screenName: ScreenName) {
  return root.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`);
}

function countCards(screenElement: HTMLElement | null) {
  if (!screenElement) return 0;
  return screenElement.querySelectorAll('[data-family-map-mobile-card="true"]').length;
}

function hasScreenContent(root: HTMLElement, screenName: ScreenName) {
  if (screenName === 'core') return true;
  return countCards(getScreenElement(root, screenName)) > 0;
}

function getScreenCount(root: HTMLElement, screenName: ScreenName) {
  const cardCount = countCards(getScreenElement(root, screenName));
  if (screenName === 'core') return cardCount || 1;
  return cardCount;
}

function escapeHtml(value: string) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${TOOLBAR_ZOOM_SELECTOR}[${ACTIVE_TRIGGER_ATTR}="true"] {
        background: rgb(14, 116, 144) !important;
        color: rgb(255, 255, 255) !important;
        box-shadow: 0 1px 4px rgba(15, 23, 42, 0.18) !important;
      }

      #${OVERVIEW_ID} {
        position: fixed;
        inset: 0;
        z-index: 12050;
        display: flex;
        flex-direction: column;
        background: rgba(248, 250, 252, 0.96);
        backdrop-filter: blur(7px);
        padding: calc(env(safe-area-inset-top, 0px) + 0.75rem) 0.75rem calc(env(safe-area-inset-bottom, 0px) + 5.4rem);
      }

      #${OVERVIEW_ID} .mobile-family-overview-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0 auto 0.75rem;
        width: min(100%, 28rem);
        border: 1px solid rgb(226, 232, 240);
        border-radius: 1.35rem;
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
        padding: 0.75rem;
      }

      #${OVERVIEW_ID} .mobile-family-overview-icon {
        display: inline-flex;
        width: 2.75rem;
        height: 2.75rem;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        background: rgb(37, 99, 235);
        color: #fff;
        font-size: 1.55rem;
        font-weight: 900;
        line-height: 1;
      }

      #${OVERVIEW_ID} .mobile-family-overview-title-wrap {
        min-width: 0;
        flex: 1 1 auto;
      }

      #${OVERVIEW_ID} .mobile-family-overview-title {
        margin: 0;
        color: rgb(15, 23, 42);
        font-size: 1.15rem;
        font-weight: 900;
        letter-spacing: -0.035em;
        line-height: 1.08;
      }

      #${OVERVIEW_ID} .mobile-family-overview-subtitle {
        margin: 0.15rem 0 0;
        color: rgb(71, 85, 105);
        font-size: 0.73rem;
        font-weight: 700;
        line-height: 1.2;
      }

      #${OVERVIEW_ID} .mobile-family-overview-close {
        display: inline-flex;
        width: 2.5rem;
        height: 2.5rem;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        border: 1px solid rgb(226, 232, 240);
        border-radius: 999px;
        background: #fff;
        color: rgb(15, 23, 42);
        font-size: 1.2rem;
        font-weight: 900;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
      }

      #${OVERVIEW_ID} .mobile-family-overview-map {
        position: relative;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-template-rows: repeat(3, minmax(5.6rem, 1fr));
        gap: 0.55rem;
        margin: 0 auto;
        width: min(100%, 28rem);
        min-height: min(64dvh, 38rem);
        flex: 1 1 auto;
        border: 1px solid rgb(226, 232, 240);
        border-radius: 1.5rem;
        background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(241,245,249,0.92));
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7), 0 18px 44px rgba(15, 23, 42, 0.12);
        padding: 0.8rem;
        overflow: hidden;
      }

      #${OVERVIEW_ID} .mobile-family-overview-map::before,
      #${OVERVIEW_ID} .mobile-family-overview-map::after {
        content: "";
        position: absolute;
        z-index: 0;
        background: color-mix(in srgb, var(--tree-palette-edge-child, #ca8a04) 78%, transparent);
        pointer-events: none;
      }

      #${OVERVIEW_ID} .mobile-family-overview-map::before {
        left: 50%;
        top: 0.8rem;
        bottom: 0.8rem;
        width: 2px;
        transform: translateX(-50%);
      }

      #${OVERVIEW_ID} .mobile-family-overview-map::after {
        left: 0.8rem;
        right: 0.8rem;
        top: 50%;
        height: 2px;
        transform: translateY(-50%);
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile {
        position: relative;
        z-index: 1;
        display: flex;
        min-width: 0;
        min-height: 0;
        flex-direction: column;
        justify-content: center;
        gap: 0.28rem;
        border: 1px solid rgb(203, 213, 225);
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.94);
        padding: 0.55rem;
        color: rgb(15, 23, 42);
        text-align: left;
        box-shadow: 0 9px 22px rgba(15, 23, 42, 0.1);
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[data-screen="core"] {
        border-color: color-mix(in srgb, var(--tree-palette-border-central, #bae6fd) 74%, #fff);
        background: color-mix(in srgb, var(--tree-palette-bg-central, #ecfeff) 32%, #fff);
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[data-screen$="uncles"] {
        border-color: color-mix(in srgb, var(--tree-palette-border-tios, #d9f99d) 74%, #fff);
        background: color-mix(in srgb, var(--tree-palette-bg-tios, #f7fee7) 30%, #fff);
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[data-screen$="cousins"] {
        border-color: color-mix(in srgb, var(--tree-palette-border-primos, #fed7aa) 74%, #fff);
        background: color-mix(in srgb, var(--tree-palette-bg-primos, #fff7ed) 32%, #fff);
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[data-screen="ancestors"] {
        border-color: color-mix(in srgb, var(--tree-palette-border-avos, #fecaca) 74%, #fff);
        background: color-mix(in srgb, var(--tree-palette-bg-avos, #fef2f2) 30%, #fff);
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-title {
        color: rgb(15, 23, 42);
        font-size: 0.78rem;
        font-weight: 950;
        letter-spacing: 0.04em;
        line-height: 1.04;
        text-transform: uppercase;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-subtitle {
        color: rgb(71, 85, 105);
        font-size: 0.64rem;
        font-weight: 700;
        line-height: 1.1;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-count {
        display: inline-flex;
        width: fit-content;
        align-items: center;
        border-radius: 999px;
        background: rgb(15, 23, 42);
        color: #fff;
        padding: 0.18rem 0.48rem;
        font-size: 0.62rem;
        font-weight: 900;
        line-height: 1;
      }

      #${OVERVIEW_ID} .mobile-family-overview-empty {
        position: relative;
        z-index: 1;
        border: 1px dashed rgba(148, 163, 184, 0.36);
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.35);
      }

      @supports not (background: color-mix(in srgb, white, black)) {
        #${OVERVIEW_ID} .mobile-family-overview-map::before,
        #${OVERVIEW_ID} .mobile-family-overview-map::after {
          background: var(--tree-palette-edge-child, #ca8a04);
        }
      }
    }
  `;
  document.head.appendChild(style);
}

function buildTile(root: HTMLElement, screenName: ScreenName) {
  const config = SCREEN_CONFIG[screenName];
  const count = getScreenCount(root, screenName);
  const tile = document.createElement('div');

  tile.className = 'mobile-family-overview-tile';
  tile.dataset.screen = screenName;
  tile.style.gridColumn = String(config.column);
  tile.style.gridRow = String(config.row);

  tile.innerHTML = `
    <span class="mobile-family-overview-tile-title">${escapeHtml(config.title)}</span>
    <span class="mobile-family-overview-tile-subtitle">${escapeHtml(config.subtitle)}</span>
    <span class="mobile-family-overview-tile-count">${count} card${count === 1 ? '' : 's'}</span>
  `;

  return tile;
}

function buildEmptyCell(row: number, column: number) {
  const cell = document.createElement('div');
  cell.className = 'mobile-family-overview-empty';
  cell.style.gridColumn = String(column);
  cell.style.gridRow = String(row);
  return cell;
}

function openOverview() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;
  const root = getRoot();
  if (!root) return;

  closeOverview(false);
  ensureStyles();

  const overlay = document.createElement('div');
  overlay.id = OVERVIEW_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Visão geral da árvore familiar');
  overlay.setAttribute('data-tree-export-ignore', 'true');

  overlay.innerHTML = `
    <header class="mobile-family-overview-header">
      <span class="mobile-family-overview-icon" aria-hidden="true">−</span>
      <div class="mobile-family-overview-title-wrap">
        <h2 class="mobile-family-overview-title">Visão geral</h2>
        <p class="mobile-family-overview-subtitle">Mapa reduzido dos grupos disponíveis na árvore.</p>
      </div>
      <button type="button" class="mobile-family-overview-close" aria-label="Fechar visão geral">×</button>
    </header>
    <div class="mobile-family-overview-map" aria-label="Resumo visual dos grupos da árvore"></div>
  `;

  const map = overlay.querySelector<HTMLElement>('.mobile-family-overview-map');
  if (map) {
    for (let row = 1; row <= 3; row += 1) {
      for (let column = 1; column <= 3; column += 1) {
        const screenName = SCREEN_ORDER.find((candidate) => {
          const config = SCREEN_CONFIG[candidate];
          return config.row === row && config.column === column;
        });

        if (screenName && hasScreenContent(root, screenName)) {
          map.appendChild(buildTile(root, screenName));
        } else {
          map.appendChild(buildEmptyCell(row, column));
        }
      }
    }
  }

  overlay.querySelector<HTMLButtonElement>('.mobile-family-overview-close')?.addEventListener('click', () => {
    closeOverview();
  });

  document.body.appendChild(overlay);
  document.body.style.setProperty('overflow', 'hidden');
  setToolbarActive(true);
}

function closeOverview(updateToolbar = true) {
  getOverviewElement()?.remove();
  document.body.style.removeProperty('overflow');
  if (updateToolbar) setToolbarActive(false);
}

function toggleOverview() {
  if (isOverviewOpen()) closeOverview();
  else openOverview();
}

function handleToolbarClick(event: MouseEvent) {
  if (!isMobileViewport() || !isFamilyMapPath()) return;

  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest<HTMLButtonElement>(TOOLBAR_ZOOM_SELECTOR);

  if (!button) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  toggleOverview();
}

function handleRouteOrViewportChange() {
  if (!isMobileViewport() || !isFamilyMapPath()) {
    closeOverview();
    return;
  }

  if (isOverviewOpen()) setToolbarActive(true);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  document.addEventListener('click', handleToolbarClick, { capture: true });
  window.addEventListener('resize', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('orientationchange', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('popstate', handleRouteOrViewportChange, { passive: true });
  document.addEventListener('visibilitychange', handleRouteOrViewportChange, { passive: true });
}

export {};
