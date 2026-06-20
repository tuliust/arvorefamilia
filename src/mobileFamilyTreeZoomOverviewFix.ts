const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const TOOLBAR_ZOOM_SELECTOR = '[data-mobile-family-map-toolbar-action="zoom"]';
const ACTIVE_TRIGGER_ATTR = 'data-mobile-family-map-overview-active';

const SCREEN_CONFIG = {
  'paternal-ancestors': { title: 'Bisavós paternos', subtitle: 'Bisavós e tataravós paternos', row: 1, column: 1 },
  ancestors: { title: 'Avós', subtitle: 'Avós paternos e maternos', row: 1, column: 2 },
  'maternal-ancestors': { title: 'Bisavós maternos', subtitle: 'Bisavós e tataravós maternos', row: 1, column: 3 },
  'paternal-uncles': { title: 'Tios paternos', subtitle: 'Ramo do pai', row: 2, column: 1 },
  core: { title: 'Núcleo central', subtitle: 'Pais, pessoa principal e descendentes', row: 2, column: 2 },
  'maternal-uncles': { title: 'Tios maternos', subtitle: 'Ramo da mãe', row: 2, column: 3 },
  'paternal-cousins': { title: 'Primos paternos', subtitle: 'Descendentes dos tios paternos', row: 3, column: 1 },
  descendants: { title: 'Descendentes', subtitle: 'Irmãos, cônjuge, pets, filhos e netos', row: 3, column: 2 },
  'maternal-cousins': { title: 'Primos maternos', subtitle: 'Descendentes dos tios maternos', row: 3, column: 3 },
} as const;

type ScreenName = keyof typeof SCREEN_CONFIG;

const SCREEN_ORDER = Object.keys(SCREEN_CONFIG) as ScreenName[];
const DYNAMIC_SCREEN_NAMES = new Set<ScreenName>(['paternal-ancestors', 'maternal-ancestors', 'descendants']);

let lastZoomActivation = 0;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === FAMILY_MAP_PATH;
}

function isScreenName(value: string | null | undefined): value is ScreenName {
  return Boolean(value && value in SCREEN_CONFIG);
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root: HTMLElement) {
  return root.querySelector<HTMLElement>(STAGE_SELECTOR);
}

function getScreenElement(root: HTMLElement, screenName: ScreenName) {
  return root.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`);
}

function countCards(root: HTMLElement, screenName: ScreenName) {
  return getScreenElement(root, screenName)?.querySelectorAll('[data-family-map-mobile-card="true"]').length ?? 0;
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
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
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

function getVisibleScreen(root: HTMLElement): ScreenName {
  const explicitScreen = root.getAttribute('data-mobile-family-tree-active-screen');
  if (isScreenName(explicitScreen)) return explicitScreen;

  const rootRect = root.getBoundingClientRect();
  const centerX = rootRect.left + rootRect.width / 2;
  const centerY = rootRect.top + rootRect.height / 2;
  let nearest: { screenName: ScreenName; distance: number } | null = null;

  SCREEN_ORDER.forEach((screenName) => {
    const screenElement = getScreenElement(root, screenName);
    if (!screenElement) return;

    const rect = screenElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const distance = Math.hypot(rect.left + rect.width / 2 - centerX, rect.top + rect.height / 2 - centerY);
    if (!nearest || distance < nearest.distance) nearest = { screenName, distance };
  });

  return nearest?.screenName ?? 'core';
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
  root.setAttribute('data-mobile-family-tree-active-screen', screenName);

  getScreenElement(root, screenName)?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll]').forEach((scrollArea) => {
    scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });

  if (animate) {
    window.setTimeout(() => stage.style.removeProperty('transition'), 340);
  }
}

function navigateToScreen(screenName: ScreenName) {
  const root = getRoot();
  if (!root) return;

  closeOverview();
  clickBaseTab(root, screenName);

  window.requestAnimationFrame(() => {
    const currentRoot = getRoot();
    if (currentRoot) applyScreenTransform(currentRoot, screenName);
  });

  window.setTimeout(() => {
    const currentRoot = getRoot();
    if (currentRoot) applyScreenTransform(currentRoot, screenName);
  }, 90);

  window.setTimeout(() => {
    const currentRoot = getRoot();
    if (currentRoot) applyScreenTransform(currentRoot, screenName, false);
  }, 340);
}

function buildTile(root: HTMLElement, screenName: ScreenName, currentScreen: ScreenName) {
  const config = SCREEN_CONFIG[screenName];
  const tile = document.createElement('button');
  const current = screenName === currentScreen;

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
    <span class="mobile-family-overview-tile-count">${getPeopleLabel(countCards(root, screenName))}</span>
  `;

  tile.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigateToScreen(screenName);
  });

  return tile;
}

function openOverview() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;

  const root = getRoot();
  if (!root) return;

  getOverview()?.remove();

  const currentScreen = getVisibleScreen(root);
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
        <p class="mobile-family-overview-subtitle">Bloco marcado como Atual indica sua posição. Toque em outro grupo para abrir.</p>
      </div>
      <button type="button" class="mobile-family-overview-close" aria-label="Fechar visão geral">×</button>
    </header>
    <div class="mobile-family-overview-map" aria-label="Resumo visual dos grupos da árvore"></div>
  `;

  const map = overlay.querySelector<HTMLElement>('.mobile-family-overview-map');
  if (map) {
    SCREEN_ORDER.forEach((screenName) => {
      map.appendChild(buildTile(root, screenName, currentScreen));
    });
  }

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

function consumeZoomEvent(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();
}

function handleZoomPress(event: Event) {
  if (!isMobileViewport() || !isFamilyMapPath()) return;
  if (!getZoomButtonFromEvent(event)) return;

  const now = Date.now();
  consumeZoomEvent(event);

  if (now - lastZoomActivation < 450) return;
  lastZoomActivation = now;
  toggleOverview();
}

function handleZoomClick(event: MouseEvent) {
  if (!isMobileViewport() || !isFamilyMapPath()) return;
  if (!getZoomButtonFromEvent(event)) return;

  consumeZoomEvent(event);

  if (Date.now() - lastZoomActivation < 700) return;
  lastZoomActivation = Date.now();
  toggleOverview();
}

function handleRouteOrViewportChange() {
  if (!isMobileViewport() || !isFamilyMapPath()) closeOverview();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('pointerdown', handleZoomPress, { capture: true });
  document.addEventListener('touchstart', handleZoomPress, { capture: true, passive: false });
  document.addEventListener('click', handleZoomClick, { capture: true });
  window.addEventListener('resize', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('orientationchange', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('popstate', handleRouteOrViewportChange, { passive: true });
  document.addEventListener('visibilitychange', handleRouteOrViewportChange, { passive: true });
}

export {};
