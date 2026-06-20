const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const CORE_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="core"]';
const CENTRAL_CARD_SELECTOR = '[data-family-map-color-key="central"]';
const CONNECTOR_LAYER_ATTR = 'data-mobile-family-tree-core-descendant-connectors';
const STYLE_ID = 'mobile-family-tree-core-descendant-connector-style';

let scheduledFrame = 0;
let observer: MutationObserver | null = null;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === FAMILY_MAP_PATH;
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getCoreScreen(root = getRoot()) {
  return root?.querySelector<HTMLElement>(CORE_SCREEN_SELECTOR) ?? null;
}

function getCentralCard(coreScreen: HTMLElement) {
  const cards = Array.from(coreScreen.querySelectorAll<HTMLElement>(CENTRAL_CARD_SELECTOR));
  return cards.find((card) => card.offsetWidth > 0 && card.offsetHeight > 0) ?? null;
}

function isCoreScreenVisible(root: HTMLElement, coreScreen: HTMLElement) {
  const rootRect = root.getBoundingClientRect();
  const screenRect = coreScreen.getBoundingClientRect();

  return (
    screenRect.bottom > rootRect.top
    && screenRect.top < rootRect.bottom
    && screenRect.right > rootRect.left
    && screenRect.left < rootRect.right
  );
}

function removeConnectorLayers() {
  document.querySelectorAll<HTMLElement>(`[${CONNECTOR_LAYER_ATTR}="true"]`).forEach((layer) => layer.remove());
}

function ensureStyles() {
  const existing = document.getElementById(STYLE_ID);
  existing?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${ROOT_SELECTOR} {
        --mobile-family-tree-connector-color: var(--tree-palette-edge-child, var(--tree-palette-line, #6B7A5E));
        --mobile-family-tree-connector-width: var(--tree-palette-line-width, 3px);
      }

      ${CORE_SCREEN_SELECTOR} {
        position: relative !important;
        overflow: visible !important;
        isolation: isolate;
      }

      ${CORE_SCREEN_SELECTOR} [${CONNECTOR_LAYER_ATTR}="true"] {
        position: absolute;
        inset: 0;
        z-index: 1;
        overflow: visible;
        pointer-events: none;
      }

      .mobile-family-tree-core-descendant-connector-line {
        position: absolute;
        display: block;
        border-radius: 0;
        background: var(--mobile-family-tree-connector-color);
        opacity: 1;
        pointer-events: none;
      }
    }
  `;
  document.head.appendChild(style);
}

function getConnectorLayer(coreScreen: HTMLElement) {
  let layer = coreScreen.querySelector<HTMLElement>(`[${CONNECTOR_LAYER_ATTR}="true"]`);

  if (!layer) {
    layer = document.createElement('div');
    layer.setAttribute(CONNECTOR_LAYER_ATTR, 'true');
    coreScreen.prepend(layer);
  }

  return layer;
}

function getLineWidth(root: HTMLElement) {
  const rootStyles = getComputedStyle(root);
  const customWidth = rootStyles.getPropertyValue('--mobile-family-tree-connector-width').trim()
    || rootStyles.getPropertyValue('--tree-palette-line-width').trim();
  const parsed = Number.parseFloat(customWidth);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
}

function createLine(layer: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  const line = document.createElement('span');
  line.className = 'mobile-family-tree-core-descendant-connector-line';
  Object.assign(line.style, styles);
  layer.appendChild(line);
}

function renderConnector() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;

  const root = getRoot();
  const coreScreen = getCoreScreen(root);
  if (!root || !coreScreen) return;

  ensureStyles();

  if (!isCoreScreenVisible(root, coreScreen)) {
    removeConnectorLayers();
    return;
  }

  const centralCard = getCentralCard(coreScreen);
  const descendantsReady = root.getAttribute('data-mobile-family-tree-descendants-ready') === 'true';
  if (!centralCard || !descendantsReady) {
    removeConnectorLayers();
    return;
  }

  const screenRect = coreScreen.getBoundingClientRect();
  const cardRect = centralCard.getBoundingClientRect();
  if (screenRect.width <= 0 || screenRect.height <= 0 || cardRect.width <= 0 || cardRect.height <= 0) return;

  const layer = getConnectorLayer(coreScreen);
  layer.replaceChildren();

  const lineWidth = getLineWidth(root);
  const halfLine = lineWidth / 2;
  const cardCenterX = cardRect.left - screenRect.left + cardRect.width / 2;
  const cardBottom = cardRect.bottom - screenRect.top;

  createLine(layer, {
    left: `${cardCenterX - halfLine}px`,
    top: `${cardBottom}px`,
    width: `${lineWidth}px`,
    height: `${Math.max(0, screenRect.height - cardBottom)}px`,
  });
}

function scheduleRender() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;
  if (scheduledFrame) window.cancelAnimationFrame(scheduledFrame);

  scheduledFrame = window.requestAnimationFrame(() => {
    scheduledFrame = 0;
    renderConnector();
  });
}

function observeTree() {
  const root = getRoot();
  if (!root || observer) return;

  observer = new MutationObserver(() => scheduleRender());
  observer.observe(root, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function handleRouteOrViewportChange() {
  if (!isMobileViewport() || !isFamilyMapPath()) {
    removeConnectorLayers();
    return;
  }

  observeTree();
  scheduleRender();
  window.setTimeout(scheduleRender, 120);
  window.setTimeout(scheduleRender, 360);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  handleRouteOrViewportChange();
  window.addEventListener('resize', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('orientationchange', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('popstate', handleRouteOrViewportChange, { passive: true });
  document.addEventListener('visibilitychange', handleRouteOrViewportChange, { passive: true });
  document.addEventListener('click', () => window.setTimeout(scheduleRender, 80), { capture: true, passive: true });
  document.addEventListener('scroll', () => scheduleRender(), { capture: true, passive: true });
  document.addEventListener('touchend', () => window.setTimeout(scheduleRender, 80), { capture: true, passive: true });
  window.setTimeout(handleRouteOrViewportChange, 240);
  window.setTimeout(handleRouteOrViewportChange, 700);
}

export {};
