const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const ANCESTORS_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="ancestors"]';
const MOBILE_CARD_SELECTOR = '[data-family-map-mobile-card="true"]';
const SIDE_GROUP_SELECTOR = '[data-mobile-family-tree-grandparent-side]';
const CONNECTOR_LAYER_ATTR = 'data-mobile-family-tree-ancestor-connectors';
const STYLE_ID = 'mobile-family-tree-ancestor-connectors-style';

type AncestorSide = 'paternal' | 'maternal';

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

function getAncestorsScreen(root = getRoot()) {
  return root?.querySelector<HTMLElement>(ANCESTORS_SCREEN_SELECTOR) ?? null;
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getGroupTitle(group: HTMLElement) {
  return normalize(group.querySelector('h2, h3')?.textContent ?? '');
}

function isGrandparentGroup(group: HTMLElement) {
  const title = getGroupTitle(group);
  return title.includes('avos') && !title.includes('bisavos') && !title.includes('tataravos');
}

function getAncestorGroupSide(group: HTMLElement): AncestorSide | null {
  const explicitSide = group.getAttribute('data-mobile-family-tree-grandparent-side');
  if (explicitSide === 'paternal' || explicitSide === 'maternal') return explicitSide;

  const title = getGroupTitle(group);
  if (title.includes('paternos')) return 'paternal';
  if (title.includes('maternos')) return 'maternal';

  return null;
}

function isAncestorsScreenVisible(root: HTMLElement, screen: HTMLElement) {
  const rootRect = root.getBoundingClientRect();
  const screenRect = screen.getBoundingClientRect();

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

      ${ANCESTORS_SCREEN_SELECTOR} {
        position: relative !important;
        overflow: visible !important;
        isolation: isolate;
      }

      ${ANCESTORS_SCREEN_SELECTOR} [${CONNECTOR_LAYER_ATTR}="true"] {
        position: absolute;
        inset: 0;
        z-index: 1;
        overflow: visible;
        pointer-events: none;
      }

      ${ANCESTORS_SCREEN_SELECTOR} ${SIDE_GROUP_SELECTOR} {
        position: relative !important;
        z-index: 10 !important;
        overflow: visible !important;
      }

      ${ANCESTORS_SCREEN_SELECTOR} ${SIDE_GROUP_SELECTOR}::before,
      ${ANCESTORS_SCREEN_SELECTOR} ${SIDE_GROUP_SELECTOR}::after {
        content: none !important;
        display: none !important;
      }

      .mobile-family-tree-ancestor-connector-line {
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

function getConnectorLayer(screen: HTMLElement) {
  let layer = screen.querySelector<HTMLElement>(`[${CONNECTOR_LAYER_ATTR}="true"]`);

  if (!layer) {
    layer = document.createElement('div');
    layer.setAttribute(CONNECTOR_LAYER_ATTR, 'true');
    screen.prepend(layer);
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
  line.className = 'mobile-family-tree-ancestor-connector-line';
  Object.assign(line.style, styles);
  layer.appendChild(line);
}

function getGrandparentGroups(screen: HTMLElement) {
  const groups = Array.from(screen.querySelectorAll<HTMLElement>('section'))
    .filter((group) => group.querySelector(MOBILE_CARD_SELECTOR))
    .filter(isGrandparentGroup);

  groups.forEach((group) => {
    const side = getAncestorGroupSide(group);
    if (side) group.setAttribute('data-mobile-family-tree-grandparent-side', side);
  });

  return groups;
}

function renderConnectors() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;

  const root = getRoot();
  const screen = getAncestorsScreen(root);
  if (!root || !screen) return;

  ensureStyles();

  if (!isAncestorsScreenVisible(root, screen)) {
    removeConnectorLayers();
    return;
  }

  const screenRect = screen.getBoundingClientRect();
  if (screenRect.width <= 0 || screenRect.height <= 0) return;

  const groups = getGrandparentGroups(screen);
  const layer = getConnectorLayer(screen);
  layer.replaceChildren();

  const lineWidth = getLineWidth(root);
  const halfLine = lineWidth / 2;

  groups.forEach((group) => {
    const side = getAncestorGroupSide(group);
    if (!side) return;

    const groupRect = group.getBoundingClientRect();
    if (groupRect.width <= 0 || groupRect.height <= 0) return;

    const groupCenterX = groupRect.left - screenRect.left + groupRect.width / 2;
    const groupBottom = groupRect.bottom - screenRect.top;

    createLine(layer, {
      left: `${groupCenterX - halfLine}px`,
      top: `${groupBottom}px`,
      width: `${lineWidth}px`,
      height: `${Math.max(0, screenRect.height - groupBottom)}px`,
    });
  });
}

function scheduleRender() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;
  if (scheduledFrame) window.cancelAnimationFrame(scheduledFrame);

  scheduledFrame = window.requestAnimationFrame(() => {
    scheduledFrame = 0;
    renderConnectors();
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
