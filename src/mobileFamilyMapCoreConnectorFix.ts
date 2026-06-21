const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const CORE_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="core"]';
const MATERNAL_UNCLES_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="maternal-uncles"]';
const UNCLE_SCREEN_SELECTORS = [
  '[data-mobile-family-tree-screen="paternal-uncles"]',
  MATERNAL_UNCLES_SCREEN_SELECTOR,
];
const STYLE_ID = 'mobile-family-map-core-connector-fix-style';
let scheduled = false;

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function setAttributeIfNeeded(element: HTMLElement, name: string, value: string) {
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function ensureStyles() {
  if (typeof document === 'undefined') return;

  const css = `
    @media (max-width: 767px) {
      [data-mobile-core-center-descendant-line="hidden"],
      [data-mobile-uncle-main-vertical-connector="hidden"],
      ${CORE_SCREEN_SELECTOR} [data-mobile-family-tree-descendant-source="true"],
      ${CORE_SCREEN_SELECTOR} [data-mobile-family-tree-descendant-connector="true"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }

      [data-mobile-maternal-uncle-down-connector="true"] {
        display: block !important;
        width: 1px !important;
        height: clamp(4rem, 18vh, 9rem) !important;
        margin: 0 auto !important;
        background: rgb(8, 145, 178) !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: none !important;
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
      setAttributeIfNeeded(firstChild, 'data-mobile-core-center-descendant-line', 'hidden');
      setAttributeIfNeeded(firstChild, 'aria-hidden', 'true');
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
        setAttributeIfNeeded(child, 'data-mobile-uncle-main-vertical-connector', 'hidden');
        setAttributeIfNeeded(child, 'aria-hidden', 'true');
      }
    });
  });
}

function ensureMaternalUncleDownConnector() {
  const screen = document.querySelector<HTMLElement>(MATERNAL_UNCLES_SCREEN_SELECTOR);
  const contentWrapper = screen?.querySelector<HTMLElement>(':scope > div > div[class*="z-10"] > div');
  if (!contentWrapper) return;

  const hasGroup = Boolean(contentWrapper.querySelector('section'));
  const hasCards = Boolean(contentWrapper.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key]'));
  let connector = contentWrapper.querySelector<HTMLElement>('[data-mobile-maternal-uncle-down-connector="true"]');

  if (!hasGroup || !hasCards) {
    connector?.remove();
    return;
  }

  if (!connector) {
    connector = document.createElement('div');
    connector.setAttribute('data-mobile-maternal-uncle-down-connector', 'true');
    connector.setAttribute('aria-hidden', 'true');
  }

  const section = contentWrapper.querySelector('section');
  if (section?.nextElementSibling !== connector) {
    section?.insertAdjacentElement('afterend', connector);
  }
}

function applyConnectorFixes() {
  if (!isEnabled()) return;
  ensureStyles();
  markCoreCenterDescendantLine();
  markUncleVerticalConnectors();
  ensureMaternalUncleDownConnector();
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
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', applyConnectorFixes, { passive: true });
  window.addEventListener('orientationchange', applyConnectorFixes, { passive: true });
  window.addEventListener('popstate', applyConnectorFixes, { passive: true });
  document.addEventListener('visibilitychange', applyConnectorFixes, { passive: true });
}

export {};
