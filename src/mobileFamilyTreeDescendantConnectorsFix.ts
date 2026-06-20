const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const DESCENDANTS_SCREEN_SELECTOR = '.mobile-family-descendant-screen, [data-mobile-family-tree-screen="descendants"]';
const DESCENDANTS_GRID_SELECTOR = '.mobile-family-descendant-screen__grid';
const CONNECTOR_LAYER_ATTR = 'data-mobile-family-tree-descendant-connectors';
const STYLE_ID = 'mobile-family-tree-descendant-connectors-style';
const DESCENDANT_BRANCH_GAP = 56;

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

function getDescendantsScreen(root = getRoot()) {
  return root?.querySelector<HTMLElement>(DESCENDANTS_SCREEN_SELECTOR) ?? null;
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getSearchScope(screen: HTMLElement) {
  return screen.querySelector<HTMLElement>(DESCENDANTS_GRID_SELECTOR) ?? screen;
}

function getGroupTitle(section: HTMLElement) {
  return normalize(section.querySelector('h2, h3')?.textContent ?? '');
}

function findGroup(screen: HTMLElement, titlePart: string) {
  const normalizedTitlePart = normalize(titlePart);
  const scope = getSearchScope(screen);

  return Array.from(scope.querySelectorAll<HTMLElement>('section'))
    .find((section) => (
      section.querySelector('[data-family-map-mobile-card="true"]')
      && getGroupTitle(section).includes(normalizedTitlePart)
    )) ?? null;
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

      .mobile-family-descendant-screen,
      [data-mobile-family-tree-screen="descendants"] {
        overflow: visible !important;
        isolation: isolate;
      }

      .mobile-family-descendant-screen__scroll {
        padding-top: 0 !important;
      }

      .mobile-family-descendant-screen__inner {
        padding-top: 0 !important;
      }

      .mobile-family-descendant-screen__connector,
      .mobile-family-descendant-screen__connector * {
        display: none !important;
      }

      [${CONNECTOR_LAYER_ATTR}="true"] {
        position: absolute;
        inset: 0;
        z-index: 1;
        overflow: visible;
        pointer-events: none;
      }

      .mobile-family-descendant-connector-line {
        position: absolute;
        display: block;
        border-radius: 0;
        background: var(--mobile-family-tree-connector-color);
        opacity: 1;
        pointer-events: none;
      }

      .mobile-family-descendant-screen section,
      [data-mobile-family-tree-screen="descendants"] section {
        position: relative !important;
        z-index: 10 !important;
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
  line.className = 'mobile-family-descendant-connector-line';
  Object.assign(line.style, styles);
  layer.appendChild(line);
}

function getRelativeRect(element: HTMLElement, screenRect: DOMRect) {
  const rect = element.getBoundingClientRect();

  return {
    left: rect.left - screenRect.left,
    right: rect.right - screenRect.left,
    top: rect.top - screenRect.top,
    bottom: rect.bottom - screenRect.top,
    width: rect.width,
    height: rect.height,
    centerX: rect.left - screenRect.left + rect.width / 2,
  };
}

function renderConnectors() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;

  const root = getRoot();
  const screen = getDescendantsScreen(root);
  if (!root || !screen) return;

  ensureStyles();

  const screenRect = screen.getBoundingClientRect();
  if (screenRect.width <= 0 || screenRect.height <= 0) return;

  const siblings = findGroup(screen, 'irmãos');
  const spouses = findGroup(screen, 'cônjuge');
  const nephews = findGroup(screen, 'sobrinhos');
  const layer = getConnectorLayer(screen);
  layer.replaceChildren();

  const lineWidth = getLineWidth(root);
  const halfLine = lineWidth / 2;

  if (siblings && spouses) {
    const siblingsRect = getRelativeRect(siblings, screenRect);
    const spousesRect = getRelativeRect(spouses, screenRect);
    const groupTop = Math.min(siblingsRect.top, spousesRect.top);
    const branchY = Math.max(lineWidth, groupTop - DESCENDANT_BRANCH_GAP);
    const trunkX = (siblingsRect.centerX + spousesRect.centerX) / 2;
    const branchLeft = Math.min(siblingsRect.centerX, spousesRect.centerX);
    const branchRight = Math.max(siblingsRect.centerX, spousesRect.centerX);

    createLine(layer, {
      left: `${trunkX - halfLine}px`,
      top: '0px',
      width: `${lineWidth}px`,
      height: `${Math.max(0, branchY)}px`,
    });

    createLine(layer, {
      left: `${branchLeft}px`,
      top: `${branchY - halfLine}px`,
      width: `${Math.max(0, branchRight - branchLeft)}px`,
      height: `${lineWidth}px`,
    });

    createLine(layer, {
      left: `${siblingsRect.centerX - halfLine}px`,
      top: `${branchY}px`,
      width: `${lineWidth}px`,
      height: `${Math.max(0, siblingsRect.top - branchY)}px`,
    });

    createLine(layer, {
      left: `${spousesRect.centerX - halfLine}px`,
      top: `${branchY}px`,
      width: `${lineWidth}px`,
      height: `${Math.max(0, spousesRect.top - branchY)}px`,
    });
  }

  if (siblings && nephews) {
    const siblingsRect = getRelativeRect(siblings, screenRect);
    const nephewsRect = getRelativeRect(nephews, screenRect);
    const startY = siblingsRect.bottom;
    const endY = nephewsRect.top;

    createLine(layer, {
      left: `${siblingsRect.centerX - halfLine}px`,
      top: `${startY}px`,
      width: `${lineWidth}px`,
      height: `${Math.max(0, endY - startY)}px`,
    });
  }
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
    document.querySelectorAll<HTMLElement>(`[${CONNECTOR_LAYER_ATTR}="true"]`).forEach((layer) => layer.remove());
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
