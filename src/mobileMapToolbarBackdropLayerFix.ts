const MOBILE_QUERY = '(max-width: 767px)';
const BACKDROP_ID = 'mobile-map-toolbar-panel-backdrop';
const STYLE_ID = 'mobile-map-toolbar-backdrop-layer-fix-style';
const BACKDROP_BOTTOM_VAR = '--mobile-map-toolbar-backdrop-bottom';
const BACKDROP_TOP_VAR = '--mobile-map-toolbar-backdrop-top';
const TOOLBAR_SELECTOR = '[data-mobile-family-map-toolbar="true"]';

let scheduled = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      #${BACKDROP_ID} {
        z-index: 9990 !important;
        top: var(${BACKDROP_TOP_VAR}, 0px) !important;
        bottom: var(${BACKDROP_BOTTOM_VAR}, calc(env(safe-area-inset-bottom,0px) + 5.35rem)) !important;
        pointer-events: none !important;
      }

      html[data-mobile-map-toolbar-backdrop="true"] ${TOOLBAR_SELECTOR} {
        position: fixed !important;
        z-index: 10000 !important;
      }

      html[data-mobile-map-toolbar-backdrop="true"] [role="dialog"][aria-label="Filtros do mapa familiar"],
      html[data-mobile-map-toolbar-backdrop="true"] [data-mobile-family-map-inline-overview="true"],
      html[data-mobile-map-toolbar-backdrop="true"] #mobile-family-map-full-overview,
      html[data-mobile-map-toolbar-backdrop="true"] #mobile-generation-line-full-overview {
        position: relative !important;
        z-index: 10001 !important;
      }

      html[data-mobile-map-toolbar-backdrop="true"] #mobile-generation-safe-overview-overlay {
        z-index: 10002 !important;
      }
    }
  `;

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
  }

  if (style.textContent !== css) style.textContent = css;
  if (!style.parentElement) document.head.appendChild(style);
}

function getBottomNavigationOffset() {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('nav, [role="navigation"], footer'));
  const bottomNav = candidates
    .map((element) => ({ element, text: (element.textContent ?? '').replace(/\s+/g, ' ').trim(), rect: element.getBoundingClientRect() }))
    .filter(({ text, rect }) => (
      rect.height >= 48
      && rect.top > window.innerHeight * 0.45
      && /Home/i.test(text)
      && /Calend/i.test(text)
      && /F[oó]rum/i.test(text)
    ))
    .sort((a, b) => b.rect.top - a.rect.top)[0];

  if (!bottomNav) return 86;
  return Math.max(72, Math.ceil(window.innerHeight - bottomNav.rect.top));
}

function getToolbarBottom() {
  const toolbar = document.querySelector<HTMLElement>(`${TOOLBAR_SELECTOR}[data-mobile-family-map-toolbar-active="true"]`)
    ?? document.querySelector<HTMLElement>(TOOLBAR_SELECTOR);
  const rect = toolbar?.getBoundingClientRect();
  return rect ? Math.max(0, Math.ceil(rect.bottom)) : 0;
}

function syncBackdropLayer() {
  ensureStyles();

  if (!isMobileViewport()) return;

  const backdrop = document.getElementById(BACKDROP_ID);
  if (!backdrop) return;

  document.documentElement.dataset.mobileMapToolbarBackdrop = 'true';
  document.documentElement.style.setProperty(BACKDROP_TOP_VAR, `${getToolbarBottom()}px`);
  document.documentElement.style.setProperty(BACKDROP_BOTTOM_VAR, `${getBottomNavigationOffset()}px`);
}

function scheduleSync() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    syncBackdropLayer();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  scheduleSync();
  [40, 120, 280, 600, 1200].forEach((delay) => window.setTimeout(scheduleSync, delay));

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      'data-mobile-map-toolbar-backdrop',
      'data-mobile-family-map-toolbar-active',
      'data-mobile-family-map-toolbar-action',
      'class',
      'style',
    ],
  });

  window.addEventListener('resize', scheduleSync, { passive: true });
  window.addEventListener('orientationchange', () => window.setTimeout(scheduleSync, 180), { passive: true });
  window.addEventListener('scroll', scheduleSync, { passive: true });
}

export {};
