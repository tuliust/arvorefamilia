const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const HORIZONTAL_MAP_PATH = '/mapa-familiar-horizontal';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const HORIZONTAL_ROOT_SELECTOR = '[data-family-map-horizontal-mobile-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const TOOLBAR_ZOOM_SELECTOR = '[data-mobile-family-map-toolbar-action="zoom"]';
const ACTIVE_TRIGGER_ATTR = 'data-mobile-family-map-overview-active';

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
const DYNAMIC_SCREEN_NAMES = new Set<ScreenName>(['paternal-ancestors', 'maternal-ancestors', 'descendants']);
let lastActivation = 0;

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

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getHorizontalRoot() {
  return document.querySelector<HTMLElement>(HORIZONTAL_ROOT_SELECTOR);
}

function getStage(root: HTMLElement) {
  return root.querySelector<HTMLElement>(STAGE_SELECTOR);
}

function getScreenElement(root: HTMLElement, screenName: ScreenName) {
  return root.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`);
}

function countDirectCards(root: HTMLElement, screenName: ScreenName) {
  return getScreenElement(root, screenName)?.querySelectorAll('[data-family-map-mobile-card="true"]').length ?? 0;
}

function countHorizontalCards(screenName: ScreenName) {
  const generation = SCREEN_CONFIG[screenName].horizontalGeneration;
  return getHorizontalRoot()?.querySelectorAll(`[data-mobile-horizontal-generation="${generation}"]`).length ?? 0;
}

function getPeopleLabel(count: number) {
  return `${count} pessoa${count === 1 ? '' : 's'}`;
}

function escapeHtml(value: string) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

function getFallbackTabLabel(screenName: ScreenName) {
  if (screenName.startsWith('paternal')) return 'Paterno';
  if (screenName.startsWith('maternal')) return 'Materno';
  return 'Central';
}

function clickBaseTab(root: HTMLElement, screenName: ScreenName) {
  if (DYNAMIC_SCREEN_NAMES.has(screenName)) return;

  const label = normalizeText(getFallbackTabLabel(screenName));
  const button = Array.from(root.querySelectorAll<HTMLButtonElement>('nav[aria-label="Visualizações da árvore"] button'))
    .find((candidate) => normalizeText(candidate.textContent ?? '').includes(label));

  button?.click();
}

function clickHorizontalGeneration(screenName: ScreenName) {
  const generation = SCREEN_CONFIG[screenName].horizontalGeneration;
  const targetText = `ger ${generation}`;
  const button = Array.from(getHorizontalRoot()?.querySelectorAll<HTMLButtonElement>('nav[aria-label="Gerações do Mapa Genealógico"] button') ?? [])
    .find((candidate) => normalizeText(candidate.textContent ?? '') === targetText);

  button?.click();
}

function getVisibleScreen(root: HTMLElement): ScreenName {
  const explicitScreen = root.getAttribute('data-mobile-family-tree-active-screen');
  if (isScreenName(explicitScreen)) return explicitScreen;
  return 'core';
}

function getVisibleHorizontalScreen(): ScreenName {
  const activeButton = Array.from(getHorizontalRoot()?.querySelectorAll<HTMLButtonElement>('nav[aria-label="Gerações do Mapa Genealógico"] button') ?? [])
    .find((button) => button.getAttribute('aria-current') === 'page');
  const generation = Number((activeButton?.textContent ?? '').match(/\d+/)?.[0]);
  return SCREEN_ORDER.find((screenName) => SCREEN_CONFIG[screenName].horizontalGeneration === generation) ?? 'core';
}

function setToolbarActive(active: boolean) {
  document.querySelectorAll<HTMLButtonElement>(TOOLBAR_ZOOM_SELECTOR).forEach((button) => {
    if (active) {
      button.setAttribute(ACTIVE_TRIGGER_ATTR, 'true');
      button.setAttribute('aria-pressed', 'true');
    } else {
      button.removeAttribute(ACTIVE_TRIGGER_ATTR);
      button.removeAttribute('aria-pressed');
    }
  });
}

function getOverview() {
  return document.getElementById(OVERVIEW_ID);
}

function closeOverview() {
  getOverview()?.remove();
  document.body.style.removeProperty('overflow');
  setToolbarActive(false);
}

function applyScreenTransform(root: HTMLElement, screenName: ScreenName, animate = true) {
  const stage = getStage(root);
  const config = SCREEN_CONFIG[screenName];
  if (!stage || !config) return;

  const column = config.column - 1;
  const row = config.row - 1;
  const transform = `translate3d(calc(${-column * (100 / 3)}% + 0px), calc(${-row * (100 / 3)}% + 0px), 0)`;

  stage.style.setProperty('transform', transform, 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');
  root.setAttribute('data-mobile-family-tree-active-screen', screenName);

  getScreenElement(root, screenName)?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll], .mobile-family-descendant-screen__scroll').forEach((scrollArea) => {
    scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });

  if (animate) window.setTimeout(() => stage.style.removeProperty('transition'), 340);
}

function navigateToScreen(screenName: ScreenName) {
  const routeKind = getRouteKind();
  if (!routeKind) return;

  closeOverview();

  if (routeKind === 'horizontal') {
    clickHorizontalGeneration(screenName);
    [80, 220, 420].forEach((delay) => window.setTimeout(() => clickHorizontalGeneration(screenName), delay));
    return;
  }

  const root = getRoot();
  if (!root) return;
  clickBaseTab(root, screenName);
  applyScreenTransform(root, screenName);
  [80, 220, 420, 760].forEach((delay) => {
    window.setTimeout(() => {
      const currentRoot = getRoot();
      if (currentRoot) applyScreenTransform(currentRoot, screenName, delay < 420);
    }, delay);
  });
}

function buildTile(screenName: ScreenName, currentScreen: ScreenName, routeKind: RouteKind) {
  const config = SCREEN_CONFIG[screenName];
  const tile = document.createElement('button');
  const current = screenName === currentScreen;
  const count = routeKind === 'direct'
    ? (getRoot() ? countDirectCards(getRoot()!, screenName) : 0)
    : countHorizontalCards(screenName);

  tile.type = 'button';
  tile.className = 'mobile-family-overview-tile';
  tile.dataset.screen = screenName;
  if (current) tile.dataset.current = 'true';
  tile.style.gridColumn = String(config.column);
  tile.style.gridRow = String(config.row);
  tile.setAttribute('aria-label', `${current ? 'Tela atual: ' : 'Abrir '}${config.title}`);
  if (current) tile.setAttribute('aria-current', 'location');

  tile.innerHTML = `
    ${current ? '<span class="mobile-family-overview-tile-current">Atual</span>' : ''}
    <span class="mobile-family-overview-tile-title">${escapeHtml(config.title)}</span>
    <span class="mobile-family-overview-tile-subtitle">${escapeHtml(config.subtitle)}</span>
    <span class="mobile-family-overview-tile-count">${getPeopleLabel(count)}</span>
  `;

  tile.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigateToScreen(screenName);
  });

  return tile;
}

function openOverview() {
  if (!isMobileViewport()) return;
  const routeKind = getRouteKind();
  if (!routeKind) return;
  const root = routeKind === 'direct' ? getRoot() : getHorizontalRoot();
  if (!root) return;

  getOverview()?.remove();

  const currentScreen = routeKind === 'direct' ? getVisibleScreen(root as HTMLElement) : getVisibleHorizontalScreen();
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
  if (map) SCREEN_ORDER.forEach((screenName) => map.appendChild(buildTile(screenName, currentScreen, routeKind)));

  overlay.querySelector<HTMLButtonElement>('.mobile-family-overview-close')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeOverview();
  });

  document.body.appendChild(overlay);
  document.body.style.setProperty('overflow', 'hidden');
  setToolbarActive(true);
}

function toggleOverview() {
  if (getOverview()) closeOverview();
  else openOverview();
}

function getZoomButtonFromEvent(event: Event) {
  const target = event.target instanceof Element ? event.target : null;
  return target?.closest<HTMLButtonElement>(TOOLBAR_ZOOM_SELECTOR) ?? null;
}

function consumeEvent(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();
}

function handleOverviewTileActivation(event: Event) {
  if (!isSupportedRoute()) return;
  const overlay = getOverview();
  const target = event.target instanceof Element ? event.target : null;
  if (!overlay || !target || !overlay.contains(target)) return;

  const closeButton = target.closest<HTMLElement>('.mobile-family-overview-close');
  if (closeButton) {
    consumeEvent(event);
    closeOverview();
    return;
  }

  const tile = target.closest<HTMLElement>('.mobile-family-overview-tile[data-screen]');
  const screenName = tile?.dataset.screen;
  if (!isScreenName(screenName)) return;

  consumeEvent(event);
  if (Date.now() - lastActivation < 250) return;
  lastActivation = Date.now();
  navigateToScreen(screenName);
}

function handleZoomPress(event: Event) {
  if (!isSupportedRoute()) return;
  if (!getZoomButtonFromEvent(event)) return;
  consumeEvent(event);
  if (Date.now() - lastActivation < 450) return;
  lastActivation = Date.now();
  toggleOverview();
}

function handleZoomClick(event: MouseEvent) {
  if (!isSupportedRoute()) return;
  if (!getZoomButtonFromEvent(event)) return;
  consumeEvent(event);
  if (Date.now() - lastActivation < 700) return;
  lastActivation = Date.now();
  toggleOverview();
}

function handleRouteOrViewportChange() {
  if (!isSupportedRoute()) closeOverview();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('pointerup', handleOverviewTileActivation, { capture: true });
  window.addEventListener('touchend', handleOverviewTileActivation, { capture: true, passive: false });
  window.addEventListener('click', handleOverviewTileActivation, { capture: true });
  window.addEventListener('pointerdown', handleZoomPress, { capture: true });
  window.addEventListener('touchstart', handleZoomPress, { capture: true, passive: false });
  window.addEventListener('click', handleZoomClick, { capture: true });
  window.addEventListener('resize', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('orientationchange', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('popstate', handleRouteOrViewportChange, { passive: true });
  document.addEventListener('visibilitychange', handleRouteOrViewportChange, { passive: true });
}

export {};
