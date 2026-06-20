const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATHS = new Set(['/mapa-familiar', '/mapa-familiar-horizontal']);
const STYLE_ID = 'mobile-family-map-micro-layout-fix-style';
const TOOLBAR_SELECTOR = '[data-mobile-family-map-toolbar="true"]';
const TOOLBAR_ACTION_SELECTOR = '[data-mobile-family-map-toolbar-action]';

function isMobileFamilyMapRoute() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && FAMILY_MAP_PATHS.has(window.location.pathname.replace(/\/$/, '') || '/');
}

function ensureStyles() {
  if (typeof document === 'undefined') return;

  const css = `
    @media (max-width: 767px) {
      ${TOOLBAR_SELECTOR}[data-mobile-family-map-toolbar-active="true"] {
        padding-bottom: 4.75rem !important;
      }

      ${TOOLBAR_SELECTOR}[data-mobile-family-map-toolbar-active-action="cor"] {
        padding-bottom: 4.15rem !important;
      }

      ${TOOLBAR_SELECTOR}[data-mobile-family-map-toolbar-active-action="grupos"] {
        padding-bottom: 4.85rem !important;
      }

      ${TOOLBAR_SELECTOR}[data-mobile-family-map-toolbar-active-action="formato"] {
        padding-bottom: 5.2rem !important;
      }

      [data-mobile-family-tree-screen="paternal-cousins"] > div > div[class*="z-10"],
      [data-mobile-family-tree-screen="maternal-cousins"] > div > div[class*="z-10"] {
        min-height: 0 !important;
        height: auto !important;
        align-items: flex-start !important;
        justify-content: center !important;
        padding-top: clamp(2.25rem, 7vh, 4rem) !important;
        padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8rem) !important;
      }

      [data-mobile-family-tree-screen="paternal-cousins"] > div > div[class*="left-1/2"][class*="w-px"],
      [data-mobile-family-tree-screen="maternal-cousins"] > div > div[class*="left-1/2"][class*="w-px"] {
        top: 0 !important;
        bottom: auto !important;
        height: clamp(2.25rem, 7vh, 4rem) !important;
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

function markToolbarActiveAction() {
  if (!isMobileFamilyMapRoute()) return;

  document.querySelectorAll<HTMLElement>(TOOLBAR_SELECTOR).forEach((toolbar) => {
    const activeButton = Array.from(toolbar.querySelectorAll<HTMLElement>(TOOLBAR_ACTION_SELECTOR))
      .find((button) => button.getAttribute('aria-pressed') === 'true');
    const action = activeButton?.getAttribute('data-mobile-family-map-toolbar-action') ?? '';

    if (action) toolbar.setAttribute('data-mobile-family-map-toolbar-active-action', action);
    else toolbar.removeAttribute('data-mobile-family-map-toolbar-active-action');
  });
}

function applyFixes() {
  if (!isMobileFamilyMapRoute()) return;
  ensureStyles();
  markToolbarActiveAction();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyFixes();
  [80, 240, 520, 1000].forEach((delay) => window.setTimeout(applyFixes, delay));

  const observer = new MutationObserver(applyFixes);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'data-mobile-family-map-toolbar-active'] });

  window.addEventListener('resize', applyFixes, { passive: true });
  window.addEventListener('orientationchange', applyFixes, { passive: true });
  window.addEventListener('popstate', applyFixes, { passive: true });
  document.addEventListener('visibilitychange', applyFixes, { passive: true });
}

export {};
