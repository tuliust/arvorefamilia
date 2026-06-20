const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const ANCESTORS_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="ancestors"]';
const SIDE_GROUP_SELECTOR = '[data-mobile-family-tree-grandparent-side]';
const MOBILE_CARD_SELECTOR = '[data-family-map-mobile-card="true"]';
const CONNECTOR_LAYER_ATTR = 'data-mobile-family-tree-ancestor-connectors';
const STYLE_ID = 'mobile-family-tree-ancestor-connectors-style';
const CONNECTOR_ELBOW_OFFSET = 44;

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
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${ANCESTORS_SCREEN_SELECTOR} {
        position: relative !important;
        overflow: visible !important;
        isolation: isolate;
      }

      ${ANCESTORS_SCREEN_SELECTOR} [${CONNECTOR_LAYER_ATTR}="true"] {
        position: absolute;
        inset: 0;
        z-index: 2;
        overflow: visible;
        pointer-events: none;
      }

      ${ANCESTORS_SCREEN_SELECTOR} ${SIDE_GROUP_SELECTOR} {
        position: relative !important;
        z-index: 10 !important;
        overflow: visible !important;
      }

      .mobile-family-tree-ancestor-connector-line {
        position: absolute;
        display: block;
        border-radius: 999px;
        background: var(--tree-palette-edge-child, var(--tree-palette-line, #6B7A5E));
        box-shadow: 0 0 0 0.5px rgba(42, 52, 39, 0.08);
        opacity: 0.98;
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

function getLineWidth() {
  const rootStyles = getComputedStyle(document.documentElement);
  const customWidth = rootStyles.getPropertyValue('--tree-palette-line-width').trim();
  const parsed = Number.parseFloat(customWidth);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 4;
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

  const lineWidth = getLineWidth();
  const halfLine = lineWidth / 2;

  groups.forEach((group) => {
    const side = getAncestorGroupSide(group);
    if (!side) return;

    const groupRect = group.getBoundingClientRect();
    if (groupRect.width <= 0 || groupRect.height <= 0) return;

    const groupLeft = groupRect.left - screenRect.left;
    const groupRight = groupRect.right - screenRect.left;
    const groupCenterX = groupLeft + groupRect.width / 2;
    const groupCenterY = groupRect.top - screenRect.top + groupRect.height / 2;
    const groupBottom = groupRect.bottom - screenRect.top;
    const targetX = screenRect.width * (side === 'paternal' ? 0.25 : 0.75);
    const elbowY = Math.min(screenRect.height - lineWidth, groupBottom + CONNECTOR_ELBOW_OFFSET);
    const horizontalLeft = Math.min(groupCenterX, targetX);
    const horizontalWidth = Math.abs(targetX - groupCenterX);

    if (side === 'paternal') {
      createLine(layer, {
        left: '0px',
        top: `${groupCenterY - halfLine}px`,
        width: `${Math.max(0, groupLeft)}px`,
        height: `${lineWidth}px`,
      });
    }

    if (side === 'maternal') {
      createLine(layer, {
        left: `${groupRight}px`,
        top: `${groupCenterY - halfLine}px`,
        width: `${Math.max(0, screenRect.width - groupRight)}px`,
        height: `${lineWidth}px`,
      });
    }

    createLine(layer, {
      left: `${groupCenterX - halfLine}px`,
      top: `${groupBottom}px`,
      width: `${lineWidth}px`,
      height: `${Math.max(0, elbowY - groupBottom)}px`,
    });

    if (horizontalWidth > lineWidth) {
      createLine(layer, {
        left: `${horizontalLeft}px`,
        top: `${elbowY - halfLine}px`,
        width: `${horizontalWidth}px`,
        height: `${lineWidth}px`,
      });
    }

    createLine(layer, {
      left: `${targetX - halfLine}px`,
      top: `${elbowY}px`,
      width: `${lineWidth}px`,
      height: `${Math.max(72, screenRect.height - elbowY)}px`,
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
