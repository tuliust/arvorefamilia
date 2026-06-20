const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STYLE_ID = 'mobile-family-tree-connector-layout-fixes-style';

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

      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="paternal-uncles"],
      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="maternal-uncles"],
      ${ROOT_SELECTOR} [data-mobile-family-tree-screen="ancestors"] {
        overflow: visible !important;
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

      ${ROOT_SELECTOR} [data-mobile-family-tree-grandparent-side] {
        position: relative !important;
        overflow: visible !important;
        z-index: 10 !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-grandparent-side] > * {
        position: relative !important;
        z-index: 2 !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-grandparent-side]::before,
      ${ROOT_SELECTOR} [data-mobile-family-tree-grandparent-side]::after {
        content: '' !important;
        position: absolute !important;
        z-index: 1 !important;
        display: block !important;
        background: var(--mobile-family-tree-connector-color) !important;
        border-radius: 0 !important;
        pointer-events: none !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-grandparent-side="paternal"]::before {
        top: 50% !important;
        right: calc(100% - 1px) !important;
        left: auto !important;
        width: 46vw !important;
        height: var(--mobile-family-tree-connector-width) !important;
        transform: translateY(-50%) !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-grandparent-side="maternal"]::before {
        top: 50% !important;
        left: calc(100% - 1px) !important;
        right: auto !important;
        width: 46vw !important;
        height: var(--mobile-family-tree-connector-width) !important;
        transform: translateY(-50%) !important;
      }

      ${ROOT_SELECTOR} [data-mobile-family-tree-grandparent-side]::after {
        top: calc(100% - 1px) !important;
        left: 50% !important;
        width: var(--mobile-family-tree-connector-width) !important;
        height: 120vh !important;
        transform: translateX(-50%) !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function handleViewportChange() {
  if (!shouldApply()) return;
  ensureStyles();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();

  const observer = new MutationObserver(() => {
    if (!shouldApply()) return;
    window.requestAnimationFrame(ensureStyles);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
  window.addEventListener('resize', handleViewportChange, { passive: true });
  window.addEventListener('orientationchange', handleViewportChange, { passive: true });
  window.addEventListener('focus', handleViewportChange, { passive: true });
  [80, 450, 1000].forEach((delay) => window.setTimeout(handleViewportChange, delay));
}

export {};