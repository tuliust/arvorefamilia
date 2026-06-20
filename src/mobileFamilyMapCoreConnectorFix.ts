const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const CORE_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="core"]';
const UNCLE_SCREEN_SELECTORS = [
  '[data-mobile-family-tree-screen="paternal-uncles"]',
  '[data-mobile-family-tree-screen="maternal-uncles"]',
];
const STYLE_ID = 'mobile-family-map-core-connector-fix-style';
let scheduled = false;

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function ensureStyles() {
  if (typeof document === 'undefined') return;

  const css = `
    @media (max-width: 767px) {
      [data-mobile-core-center-descendant-line="hidden"],
      [data-mobile-uncle-main-vertical-connector="hidden"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    }
  `;

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
  }

  if (style.textContent !== css) style.textContent = css;
  if (document.head.lastElementChild !== style) document.head.appendChild(style);
}

function markCoreCenterDescendantLine() {
  const coreScreen = document.querySelector<HTMLElement>(CORE_SCREEN_SELECTOR);
  if (!coreScreen) return;

  const connectorBlocks = Array.from(coreScreen.querySelectorAll<HTMLElement>('div.relative.mx-auto.h-9.w-full'));

  connectorBlocks.forEach((block) => {
    const firstChild = block.firstElementChild;
    if (!(firstChild instanceof HTMLElement)) return;

    const isCenterLine = firstChild.classList.contains('left-1/2')
      && firstChild.classList.contains('top-0')
      && firstChild.classList.contains('h-5')
      && firstChild.classList.contains('w-px')
      && firstChild.classList.contains('bg-cyan-600');

    if (isCenterLine) {
      firstChild.setAttribute('data-mobile-core-center-descendant-line', 'hidden');
      firstChild.setAttribute('aria-hidden', 'true');
    }
  });
}

function markUncleVerticalConnectors() {
  UNCLE_SCREEN_SELECTORS.forEach((selector) => {
    const screen = document.querySelector<HTMLElement>(selector);
    const screenBody = screen?.querySelector<HTMLElement>(':scope > div');
    if (!screenBody) return;

    Array.from(screenBody.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;

      const isMainVerticalConnector = child.classList.contains('left-1/2')
        && child.classList.contains('w-px')
        && child.classList.contains('bg-cyan-600')
        && child.classList.contains('absolute');

      if (isMainVerticalConnector) {
        child.setAttribute('data-mobile-uncle-main-vertical-connector', 'hidden');
        child.setAttribute('aria-hidden', 'true');
      }
    });
  });
}

function applyConnectorFixes() {
  if (!isEnabled()) return;
  ensureStyles();
  markCoreCenterDescendantLine();
  markUncleVerticalConnectors();
}

function scheduleMark() {
  if (scheduled) return;
  scheduled = true;

  window.requestAnimationFrame(() => {
    scheduled = false;
    applyConnectorFixes();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyConnectorFixes();
  [80, 240, 520, 1000].forEach((delay) => window.setTimeout(applyConnectorFixes, delay));

  const observer = new MutationObserver(scheduleMark);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

  window.addEventListener('resize', applyConnectorFixes, { passive: true });
  window.addEventListener('orientationchange', applyConnectorFixes, { passive: true });
  window.addEventListener('popstate', applyConnectorFixes, { passive: true });
  document.addEventListener('visibilitychange', applyConnectorFixes, { passive: true });
}

export {};
