const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-tree-overview-fixes-style';
const TOOLBAR_ZOOM_SELECTOR = '[data-mobile-family-map-toolbar-action="zoom"]';
const ACTIVE_TRIGGER_ATTR = 'data-mobile-family-map-overview-active';
const ACTION_DEBOUNCE_MS = 320;

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

const SCREEN_POSITIONS: Record<ScreenName, { column: number; row: number }> = {
  'paternal-ancestors': { column: 0, row: 0 },
  ancestors: { column: 1, row: 0 },
  'maternal-ancestors': { column: 2, row: 0 },
  'paternal-uncles': { column: 0, row: 1 },
  core: { column: 1, row: 1 },
  'maternal-uncles': { column: 2, row: 1 },
  'paternal-cousins': { column: 0, row: 2 },
  descendants: { column: 1, row: 2 },
  'maternal-cousins': { column: 2, row: 2 },
};

const DYNAMIC_SCREEN_NAMES = new Set<ScreenName>([
  'paternal-ancestors',
  'maternal-ancestors',
  'descendants',
]);

const REMOVED_SUMMARY_TEXTS = new Set([
  'ancestrais profundos',
  'tela acima do nucleo central',
  'tela abaixo do nucleo central',
  'tela inicial da arvore',
  'area lateral esquerda',
  'area lateral direita',
  'abaixo dos tios paternos',
  'abaixo dos tios maternos',
]);

let lastHandledAt = 0;
let observer: MutationObserver | null = null;
let sanitizeScheduled = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === FAMILY_MAP_PATH;
}

function isScreenName(value: string | null | undefined): value is ScreenName {
  return Boolean(value && value in SCREEN_POSITIONS);
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function getOverviewElement() {
  return document.getElementById(OVERVIEW_ID);
}

function getScreenElement(root: HTMLElement, screenName: ScreenName) {
  return root.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`);
}

function getZoomButtons() {
  return Array.from(document.querySelectorAll<HTMLElement>(TOOLBAR_ZOOM_SELECTOR));
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

function getTransformForScreen(screenName: ScreenName) {
  const { column, row } = SCREEN_POSITIONS[screenName];
  const x = column === 0 ? 0 : -(column * 100) / 3;
  const y = row === 0 ? 0 : -(row * 100) / 3;

  return `translate3d(calc(${x}% + 0px), calc(${y}% + 0px), 0)`;
}

function screenHasContent(root: HTMLElement, screenName: ScreenName) {
  if (screenName === 'core') return true;

  if (screenName === 'descendants') {
    return Boolean(
      getScreenElement(root, 'descendants')?.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key]')
      || getScreenElement(root, 'core')?.querySelector('[data-family-map-color-key="irmaos"], [data-family-map-color-key="sobrinhos"], [data-family-map-color-key="conjuge"], [data-family-map-color-key="pets"], [data-family-map-color-key="filhos"], [data-family-map-color-key="netos"]')
    );
  }

  return Boolean(
    getScreenElement(root, screenName)?.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key]')
  );
}

function applyScreenTransform(root: HTMLElement, screenName: ScreenName, animate = true) {
  const stage = getStage(root);
  if (!stage) return;

  stage.style.setProperty('transform', getTransformForScreen(screenName), 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');

  root.setAttribute('data-mobile-family-tree-active-screen', screenName);
  getScreenElement(root, screenName)?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll]').forEach((scrollArea) => {
    scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });

  if (animate) {
    window.setTimeout(() => {
      getStage()?.style.removeProperty('transition');
    }, 340);
  }
}

function closeOverview() {
  getOverviewElement()?.remove();
  document.body.style.removeProperty('overflow');
  getZoomButtons().forEach((button) => {
    button.removeAttribute(ACTIVE_TRIGGER_ATTR);
    button.removeAttribute('aria-pressed');
  });
}

function navigateToScreen(screenName: ScreenName) {
  if (!isMobileViewport() || !isFamilyMapPath()) return;

  const root = getRoot();
  if (!root || !screenHasContent(root, screenName)) return;

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

function getPeopleLabel(count: number) {
  return `${count} pessoa${count === 1 ? '' : 's'}`;
}

function shouldRemoveText(value: string) {
  const normalized = normalizeText(value);
  return normalized === 'toque para abrir'
    || normalized === 'voce esta aqui'
    || REMOVED_SUMMARY_TEXTS.has(normalized);
}

function removeUnwantedTextNodes(element: HTMLElement) {
  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && shouldRemoveText(node.textContent ?? '')) {
      node.remove();
      return;
    }

    if (node instanceof HTMLElement) removeUnwantedTextNodes(node);
  });
}

function sanitizeOverviewText() {
  const overlay = getOverviewElement();
  if (!overlay) return;

  overlay.querySelectorAll<HTMLElement>('.mobile-family-overview-tile-summary').forEach((summary) => {
    summary.remove();
  });

  overlay.querySelectorAll<HTMLElement>('.mobile-family-overview-tile').forEach((tile) => {
    Array.from(tile.children).forEach((child) => {
      if (child instanceof HTMLElement && shouldRemoveText(child.textContent ?? '')) child.remove();
    });
    removeUnwantedTextNodes(tile);
  });

  overlay.querySelectorAll<HTMLElement>('.mobile-family-overview-tile-count').forEach((countElement) => {
    const match = (countElement.textContent ?? '').match(/\d+/);
    if (!match) return;
    countElement.textContent = getPeopleLabel(Number(match[0]));
  });
}

function scheduleSanitizeOverviewText() {
  if (sanitizeScheduled) return;
  sanitizeScheduled = true;

  window.requestAnimationFrame(() => {
    sanitizeScheduled = false;
    sanitizeOverviewText();
  });
}

function ensureSanitizer() {
  const overlay = getOverviewElement();
  if (!overlay) return;

  if (observer) observer.disconnect();
  observer = new MutationObserver(scheduleSanitizeOverviewText);
  observer.observe(overlay, { childList: true, subtree: true, characterData: true });

  sanitizeOverviewText();
  [40, 160, 360, 800].forEach((delay) => window.setTimeout(sanitizeOverviewText, delay));
}

function ensureStyles() {
  const existing = document.getElementById(STYLE_ID);
  existing?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      #${OVERVIEW_ID} .mobile-family-overview-close,
      #${OVERVIEW_ID} .mobile-family-overview-tile[data-screen] {
        pointer-events: auto !important;
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: transparent;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile::before,
      #${OVERVIEW_ID} .mobile-family-overview-tile::after,
      #${OVERVIEW_ID} .mobile-family-overview-tile[data-current="true"]::before,
      #${OVERVIEW_ID} .mobile-family-overview-tile[data-current="true"]::after {
        display: none !important;
        content: none !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-summary {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function isDuplicateAction() {
  const now = Date.now();
  if (now - lastHandledAt < ACTION_DEBOUNCE_MS) return true;
  lastHandledAt = now;
  return false;
}

function handleOverviewActivation(event: Event) {
  const overlay = getOverviewElement();
  if (!overlay) return;

  const target = event.target instanceof Element ? event.target : null;
  if (!target || !overlay.contains(target)) return;

  const closeButton = target.closest<HTMLElement>('.mobile-family-overview-close');
  if (closeButton) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!isDuplicateAction()) closeOverview();
    return;
  }

  const tile = target.closest<HTMLElement>('.mobile-family-overview-tile[data-screen]');
  const screenName = tile?.dataset.screen;
  if (!isScreenName(screenName)) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  if (!isDuplicateAction()) navigateToScreen(screenName);
}

function handleDocumentMutation() {
  if (!getOverviewElement()) return;
  ensureStyles();
  ensureSanitizer();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();

  document.addEventListener('touchend', handleOverviewActivation, { capture: true, passive: false });
  document.addEventListener('pointerup', handleOverviewActivation, { capture: true });
  document.addEventListener('click', handleOverviewActivation, { capture: true });

  const documentObserver = new MutationObserver(handleDocumentMutation);
  documentObserver.observe(document.documentElement, { childList: true, subtree: true });

  [80, 300, 900].forEach((delay) => window.setTimeout(handleDocumentMutation, delay));
}

export {};