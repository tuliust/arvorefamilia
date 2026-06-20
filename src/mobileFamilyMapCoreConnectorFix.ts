const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const CORE_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="core"]';
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
      [data-mobile-core-center-descendant-line="hidden"] {
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
  if (!isEnabled()) return;
  ensureStyles();

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

function scheduleMark() {
  if (scheduled) return;
  scheduled = true;

  window.requestAnimationFrame(() => {
    scheduled = false;
    markCoreCenterDescendantLine();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  markCoreCenterDescendantLine();
  [80, 240, 520, 1000].forEach((delay) => window.setTimeout(markCoreCenterDescendantLine, delay));

  const observer = new MutationObserver(scheduleMark);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

  window.addEventListener('resize', markCoreCenterDescendantLine, { passive: true });
  window.addEventListener('orientationchange', markCoreCenterDescendantLine, { passive: true });
  window.addEventListener('popstate', markCoreCenterDescendantLine, { passive: true });
  document.addEventListener('visibilitychange', markCoreCenterDescendantLine, { passive: true });
}

export {};
