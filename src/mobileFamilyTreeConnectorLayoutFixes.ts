const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STYLE_ID = 'mobile-family-tree-connector-layout-fixes-style';
const RUNTIME_CONNECTOR_CLASS = 'mobile-family-tree-runtime-ancestor-connector';

let renderScheduled = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === FAMILY_MAP_PATH;
}

function shouldApply() {
  return isMobileViewport() && isFamilyMapPath();
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${ROOT_SELECTOR} {
        --mobile-family-tree-connector-color: var(--tree-palette-edge-child, var(--tree-palette-line, #6B7A5E));
        --mobile-family-tree-connector-width: var(--tree-palette-line-width, 3px);
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="paternal-uncles"],
      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="maternal-uncles"],
      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="ancestors"] {
        overflow: visible !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="ancestors"] {
        position: relative !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="ancestors"] > div > div[class*="absolute"][class*="bottom-0"][class*="bg-cyan-600"] {
        display: none !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="core"] [class*="w-screen"][class*="bg-cyan-600"] {
        display: none !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="paternal-uncles"] > div,
      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="maternal-uncles"] > div {
        overflow: visible !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="paternal-uncles"] > div > div.relative.z-10,
      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="maternal-uncles"] > div > div.relative.z-10 {
        max-width: min(84vw, 336px) !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="paternal-uncles"] section,
      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="maternal-uncles"] section {
        position: relative !important;
        overflow: visible !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="paternal-uncles"] section > div,
      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="maternal-uncles"] section > div {
        position: relative !important;
        z-index: 2 !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="paternal-uncles"] [data-family-map-mobile-card="true"],
      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="maternal-uncles"] [data-family-map-mobile-card="true"] {
        min-width: 0 !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="paternal-uncles"] > div > div[class*="h-px"][class*="bg-cyan-600"],
      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="maternal-uncles"] > div > div[class*="h-px"][class*="bg-cyan-600"] {
        display: none !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="paternal-uncles"] section::before,
      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="maternal-uncles"] section::before {
        content: '' !important;
        position: absolute !important;
        top: 50% !important;
        z-index: 0 !important;
        display: block !important;
        height: var(--mobile-family-tree-connector-width) !important;
        width: 52vw !important;
        background: var(--mobile-family-tree-connector-color) !important;
        border-radius: 0 !important;
        pointer-events: none !important;
        transform: translateY(-50%) !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="paternal-uncles"] section::before {
        left: calc(100% - 1px) !important;
        right: auto !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="maternal-uncles"] section::before {
        right: calc(100% - 1px) !important;
        left: auto !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-grandparent-side]::before,
      ${ROOT_SELECTOR} [data-mobile-family-tree-grandparent-side]::after {
        display: none !important;
      }

      .${RUNTIME_CONNECTOR_CLASS} {
        position: absolute !important;
        z-index: 1 !important;
        display: block !important;
        background: var(--mobile-family-tree-connector-color) !important;
        border-radius: 0 !important;
        pointer-events: none !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getAncestorScreen(root = getRoot()) {
  return root?.querySelector<HTMLElement>('[data-mobile-family-tree-screen="ancestors"]') ?? null;
}

function getGrandparentSections(screen: HTMLElement) {
  return Array.from(screen.querySelectorAll<HTMLElement>('[data-mobile-family-tree-grandparent-side]'));
}

function getConnectorSignature(screen: HTMLElement, groups: HTMLElement[]) {
  const screenRect = screen.getBoundingClientRect();

  return groups.map((group) => {
    const rect = group.getBoundingClientRect();
    return [
      group.getAttribute('data-mobile-family-tree-grandparent-side') ?? '',
      Math.round(rect.left - screenRect.left),
      Math.round(rect.top - screenRect.top),
      Math.round(rect.width),
      Math.round(rect.height),
    ].join(':');
  }).join('|');
}

function removeRuntimeConnectors(screen: HTMLElement) {
  screen.querySelectorAll<HTMLElement>(`.${RUNTIME_CONNECTOR_CLASS}`).forEach((connector) => connector.remove());
}

function buildConnector(className: string, styles: Partial<CSSStyleDeclaration>) {
  const connector = document.createElement('div');
  connector.className = `${RUNTIME_CONNECTOR_CLASS} ${className}`;
  connector.setAttribute('aria-hidden', 'true');
  connector.setAttribute('data-tree-export-ignore', 'true');

  Object.entries(styles).forEach(([property, value]) => {
    if (typeof value === 'string') connector.style.setProperty(property, value);
  });

  return connector;
}

function renderAncestorConnectors() {
  if (!shouldApply()) return;

  ensureStyles();

  const screen = getAncestorScreen();
  if (!screen) return;

  const groups = getGrandparentSections(screen);
  const signature = getConnectorSignature(screen, groups);
  if (screen.dataset.mobileAncestorRuntimeConnectorSignature === signature) return;
  screen.dataset.mobileAncestorRuntimeConnectorSignature = signature;

  removeRuntimeConnectors(screen);

  const screenRect = screen.getBoundingClientRect();
  groups.forEach((group) => {
    const side = group.getAttribute('data-mobile-family-tree-grandparent-side');
    if (side !== 'paternal' && side !== 'maternal') return;

    const rect = group.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const relativeLeft = rect.left - screenRect.left;
    const relativeRight = rect.right - screenRect.left;
    const relativeTop = rect.top - screenRect.top;
    const centerX = relativeLeft + rect.width / 2;
    const centerY = relativeTop + rect.height / 2;
    const bottom = relativeTop + rect.height;
    const verticalHeight = Math.max(0, screenRect.height - bottom + 1);

    if (side === 'paternal') {
      screen.appendChild(buildConnector('mobile-family-tree-runtime-ancestor-connector--paternal-horizontal', {
        left: '0px',
        top: `${centerY}px`,
        width: `${Math.max(0, relativeLeft + 1)}px`,
        height: 'var(--mobile-family-tree-connector-width)',
      }));
    } else {
      screen.appendChild(buildConnector('mobile-family-tree-runtime-ancestor-connector--maternal-horizontal', {
        left: `${relativeRight - 1}px`,
        top: `${centerY}px`,
        width: `${Math.max(0, screenRect.width - relativeRight + 1)}px`,
        height: 'var(--mobile-family-tree-connector-width)',
      }));
    }

    screen.appendChild(buildConnector(`mobile-family-tree-runtime-ancestor-connector--${side}-vertical`, {
      left: `${centerX}px`,
      top: `${bottom - 1}px`,
      width: 'var(--mobile-family-tree-connector-width)',
      height: `${verticalHeight}px`,
      transform: 'translateX(-50%)',
    }));
  });
}

function scheduleRenderAncestorConnectors() {
  if (renderScheduled) return;
  renderScheduled = true;

  window.requestAnimationFrame(() => {
    renderScheduled = false;
    renderAncestorConnectors();
  });
}

function handleViewportChange() {
  if (!shouldApply()) return;
  ensureStyles();
  scheduleRenderAncestorConnectors();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();

  const documentObserver = new MutationObserver(() => {
    if (!shouldApply()) return;
    scheduleRenderAncestorConnectors();
  });
  documentObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

  window.addEventListener('resize', handleViewportChange, { passive: true });
  window.addEventListener('orientationchange', handleViewportChange, { passive: true });
  window.addEventListener('focus', handleViewportChange, { passive: true });
  document.addEventListener('touchend', scheduleRenderAncestorConnectors, { passive: true, capture: true });
  [80, 450, 1000, 1800].forEach((delay) => window.setTimeout(handleViewportChange, delay));
}

export {};