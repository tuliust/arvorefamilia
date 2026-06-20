const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const HORIZONTAL_MAP_PATH = '/mapa-familiar-horizontal';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const DIRECT_ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const DIRECT_STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const HORIZONTAL_ROOT_SELECTOR = '[data-family-map-horizontal-mobile-root="true"]';
const TOOLBAR_ZOOM_SELECTOR = '[data-mobile-family-map-toolbar-action="zoom"]';
const ACTIVE_TRIGGER_ATTR = 'data-mobile-family-map-overview-active';
const STYLE_ID = 'mobile-family-map-overview-navigation-bridge-style';

const SCREEN_CONFIG = {
  'paternal-ancestors': { title: 'Bisavós paternos', subtitle: 'Bisavós e tataravós paternos', row: 1, column: 1, horizontalGeneration: 1 },
  ancestors: { title: 'Avós', subtitle: 'Avós paternos e maternos', row: 1, column: 2, horizontalGeneration: 3 },
  'maternal-ancestors': { title: 'Bisavós maternos', subtitle: 'Bisavós e tataravós maternos', row: 1, column: 3, horizontalGeneration: 1 },
  'paternal-uncles': { title: 'Tios paternos', subtitle: 'Ramo do pai', row: 2, column: 1, horizontalGeneration: 4 },
  core: { title: 'Núcleo central', subtitle: 'Pais, pessoa principal e descendentes', row: 2, column: 2, horizontalGeneration: 5 },
  'maternal-uncles': { title: 'Tios maternos', subtitle: 'Ramo da mãe', row: 2, column: 3, horizontalGeneration: 4 },
  'paternal-cousins': { title: 'Primos paternos', subtitle: 'Descendentes dos tios paternos', row: 3, column: 1, horizontalGeneration: 5 },
  descendants: { title: 'Descendentes', subtitle: 'Irmãos, cônjuge, pets, filhos e netos', row: 3, column: 2, horizontalGeneration: 6 },
  'maternal-cousins': { title: 'Primos maternos', subtitle: 'Descendentes dos tios maternos', row: 3, column: 3, horizontalGeneration: 5 },
} as const;

type ScreenName = keyof typeof SCREEN_CONFIG;

type RouteKind = 'direct' | 'horizontal';

const SCREEN_ORDER = Object.keys(SCREEN_CONFIG) as ScreenName[];
const DYNAMIC_DIRECT_SCREENS = new Set<ScreenName>(['paternal-ancestors', 'maternal-ancestors', 'descendants']);
let lastHandledAt = 0;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function getRouteKind(): RouteKind | null {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path === DIRECT_MAP_PATH) return 'direct';
  if (path === HORIZONTAL_MAP_PATH) return 'horizontal';
  return null;
}

function isSupportedRoute() {
  return isMobileViewport() && Boolean(getRouteKind());
}

function isScreenName(value: string | null | undefined): value is ScreenName {
  return Boolean(value && value in SCREEN_CONFIG);
}

function getDirectRoot() {
  return document.querySelector<HTMLElement>(DIRECT_ROOT_SELECTOR);
}

function getDirectStage(root = getDirectRoot()) {
  return root?.querySelector<HTMLElement>(DIRECT_STAGE_SELECTOR) ?? null;
}

function getHorizontalRoot() {
  return document.querySelector<HTMLElement>(HORIZONTAL_ROOT_SELECTOR);
}

function getOverview() {
  return document.getElementById(OVERVIEW_ID);
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value: string) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function setZoomToolbarActive(active: boolean) {
  document.querySelectorAll<HTMLElement>(TOOLBAR_ZOOM_SELECTOR).forEach((button) => {
    if (active) {
      button.setAttribute(ACTIVE_TRIGGER_ATTR, 'true');
      button.setAttribute('aria-pressed', 'true');
    } else {
      button.removeAttribute(ACTIVE_TRIGGER_ATTR);
      button.removeAttribute('aria-pressed');
    }
  });
}

function closeOverview(updateToolbar = true) {
  getOverview()?.remove();
  document.body.style.removeProperty('overflow');
  if (updateToolbar) setZoomToolbarActive(false);
}

function getDirectTransform(screenName: ScreenName) {
  const config = SCREEN_CONFIG[screenName];
  const column = config.column - 1;
  const row = config.row - 1;
  return `translate3d(calc(${-column * (100 / 3)}% + 0px), calc(${-row * (100 / 3)}% + 0px), 0)`;
}

function clickDirectBaseTab(root: HTMLElement, screenName: ScreenName) {
  if (DYNAMIC_DIRECT_SCREENS.has(screenName)) return;

  const fallbackLabel = screenName.startsWith('paternal')
    ? 'paterno'
    : screenName.startsWith('maternal')
      ? 'materno'
      : 'central';

  const tab = Array.from(root.querySelectorAll<HTMLButtonElement>('nav[aria-label="Visualizações da árvore"] button'))
    .find((candidate) => normalize(candidate.textContent ?? '').includes(fallbackLabel));

  tab?.click();
}

function applyDirectScreen(screenName: ScreenName, animate = true) {
  const root = getDirectRoot();
  const stage = getDirectStage(root);
  if (!root || !stage) return;

  stage.style.setProperty('transform', getDirectTransform(screenName), 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');
  root.setAttribute('data-mobile-family-tree-active-screen', screenName);

  root.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`)
    ?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll], .mobile-family-descendant-screen__scroll')
    .forEach((scrollArea) => scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
}

function navigateDirect(screenName: ScreenName) {
  const root = getDirectRoot();
  if (!root) return;

  clickDirectBaseTab(root, screenName);
  applyDirectScreen(screenName);

  [40, 100, 220, 420, 760].forEach((delay) => {
    window.setTimeout(() => applyDirectScreen(screenName, delay < 420), delay);
  });
}

function clickHorizontalGeneration(generation: number) {
  const root = getHorizontalRoot();
  if (!root) return;

  const targetText = `ger ${generation}`;
  const button = Array.from(root.querySelectorAll<HTMLButtonElement>('nav[aria-label="Gerações do Mapa Genealógico"] button'))
    .find((candidate) => normalize(candidate.textContent ?? '') === targetText);

  button?.click();
}

function navigateHorizontal(screenName: ScreenName) {
  const generation = SCREEN_CONFIG[screenName].horizontalGeneration;
  clickHorizontalGeneration(generation);
  [60, 180, 380].forEach((delay) => window.setTimeout(() => clickHorizontalGeneration(generation), delay));
}

function navigateToOverviewScreen(screenName: ScreenName) {
  const routeKind = getRouteKind();
  if (!routeKind) return;

  closeOverview();

  if (routeKind === 'direct') navigateDirect(screenName);
  else navigateHorizontal(screenName);
}

function countDirectCards(screenName: ScreenName) {
  const root = getDirectRoot();
  return root?.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`)
    ?.querySelectorAll('[data-family-map-mobile-card="true"]').length ?? 0;
}

function countHorizontalGenerationCards(screenName: ScreenName) {
  const generation = SCREEN_CONFIG[screenName].horizontalGeneration;
  const root = getHorizontalRoot();
  return root?.querySelectorAll(`[data-mobile-horizontal-generation="${generation}"]`).length ?? 0;
}

function getTileCount(screenName: ScreenName, routeKind: RouteKind) {
  if (routeKind === 'direct') return countDirectCards(screenName);
  return countHorizontalGenerationCards(screenName);
}

function getVisibleDirectScreen() {
  const explicit = getDirectRoot()?.getAttribute('data-mobile-family-tree-active-screen');
  return isScreenName(explicit) ? explicit : 'core';
}

function getVisibleHorizontalScreen(): ScreenName {
  const root = getHorizontalRoot();
  const activeButton = Array.from(root?.querySelectorAll<HTMLButtonElement>('nav[aria-label="Gerações do Mapa Genealógico"] button') ?? [])
    .find((button) => button.getAttribute('aria-current') === 'page');
  const generation = Number((activeButton?.textContent ?? '').match(/\d+/)?.[0]);

  return SCREEN_ORDER.find((screenName) => SCREEN_CONFIG[screenName].horizontalGeneration === generation) ?? 'core';
}

function getCurrentScreen(routeKind: RouteKind): ScreenName {
  return routeKind === 'direct' ? getVisibleDirectScreen() : getVisibleHorizontalScreen();
}

function getPeopleLabel(count: number) {
  return `${count} pessoa${count === 1 ? '' : 's'}`;
}

function buildTile(screenName: ScreenName, currentScreen: ScreenName, routeKind: RouteKind) {
  const config = SCREEN_CONFIG[screenName];
  const tile = document.createElement('button');
  const current = screenName === currentScreen;
  const count = getTileCount(screenName, routeKind);

  tile.type = 'button';
  tile.className = 'mobile-family-overview-tile';
  tile.dataset.screen = screenName;
  tile.style.gridColumn = String(config.column);
  tile.style.gridRow = String(config.row);
  tile.setAttribute('aria-label', `${current ? 'Tela atual: ' : 'Abrir '}${config.title}`);
  if (current) {
    tile.dataset.current = 'true';
    tile.setAttribute('aria-current', 'location');
  }

  tile.innerHTML = `
    ${current ? '<span class="mobile-family-overview-tile-current">Atual</span>' : ''}
    <span class="mobile-family-overview-tile-title">${escapeHtml(config.title)}</span>
    <span class="mobile-family-overview-tile-subtitle">${escapeHtml(config.subtitle)}</span>
    <span class="mobile-family-overview-tile-count">${getPeopleLabel(count)}</span>
  `;

  return tile;
}

function ensureStyles() {
  const existing = document.getElementById(STYLE_ID);
  existing?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      #${OVERVIEW_ID} {
        z-index: 13000 !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[data-screen] {
        pointer-events: auto !important;
        touch-action: manipulation !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function openOverview() {
  const routeKind = getRouteKind();
  if (!isMobileViewport() || !routeKind) return;

  closeOverview(false);
  ensureStyles();

  const currentScreen = getCurrentScreen(routeKind);
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
        <p class="mobile-family-overview-subtitle">Toque em um grupo para navegar até a posição correspondente.</p>
      </div>
      <button type="button" class="mobile-family-overview-close" aria-label="Fechar visão geral">×</button>
    </header>
    <div class="mobile-family-overview-map" aria-label="Resumo visual dos grupos da árvore"></div>
  `;

  const map = overlay.querySelector<HTMLElement>('.mobile-family-overview-map');
  SCREEN_ORDER.forEach((screenName) => map?.appendChild(buildTile(screenName, currentScreen, routeKind)));

  document.body.appendChild(overlay);
  document.body.style.setProperty('overflow', 'hidden');
  setZoomToolbarActive(true);
}

function handleActivation(event: Event) {
  if (!isSupportedRoute()) return;

  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const zoomButton = target.closest<HTMLElement>(TOOLBAR_ZOOM_SELECTOR);
  if (zoomButton) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();

    const now = Date.now();
    if (now - lastHandledAt < 260) return;
    lastHandledAt = now;

    if (getOverview()) closeOverview();
    else openOverview();
    return;
  }

  const overlay = getOverview();
  if (!overlay || !overlay.contains(target)) return;

  const closeButton = target.closest<HTMLElement>('.mobile-family-overview-close');
  if (closeButton) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    closeOverview();
    return;
  }

  const tile = target.closest<HTMLElement>('.mobile-family-overview-tile[data-screen]');
  const screenName = tile?.dataset.screen;
  if (!isScreenName(screenName)) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();

  const now = Date.now();
  if (now - lastHandledAt < 260) return;
  lastHandledAt = now;
  navigateToOverviewScreen(screenName);
}

function handleRouteOrViewportChange() {
  if (!isSupportedRoute()) closeOverview();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  window.addEventListener('pointerdown', handleActivation, { capture: true });
  window.addEventListener('touchend', handleActivation, { capture: true, passive: false });
  window.addEventListener('pointerup', handleActivation, { capture: true });
  window.addEventListener('click', handleActivation, { capture: true });
  window.addEventListener('resize', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('orientationchange', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('popstate', handleRouteOrViewportChange, { passive: true });
  document.addEventListener('visibilitychange', handleRouteOrViewportChange, { passive: true });
}

export {};
