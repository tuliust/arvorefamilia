const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_FAMILY_MAP_PATH = '/mapa-familiar';
const BACKDROP_ID = 'mobile-map-toolbar-panel-backdrop';
const STYLE_ID = 'mobile-map-toolbar-backdrop-layer-fix-style';
const BACKDROP_BOTTOM_VAR = '--mobile-map-toolbar-backdrop-bottom';
const BACKDROP_TOP_VAR = '--mobile-map-toolbar-backdrop-top';
const TOOLBAR_SELECTOR = '[data-mobile-family-map-toolbar="true"]';
const GENERATION_OVERLAY_ID = 'mobile-generation-safe-overview-overlay';
const PANEL_SELECTORS = [
  `#${GENERATION_OVERLAY_ID}`,
  '[data-mobile-family-map-inline-overview="true"]',
  '[role="dialog"][aria-label="Filtros do mapa familiar"]',
  '[data-tree-export-ignore="true"]',
].join(',');

let scheduled = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function getPathname() {
  return typeof window === 'undefined' ? '' : window.location.pathname.replace(/\/$/, '');
}

function isDirectFamilyMapPath() {
  return getPathname() === DIRECT_FAMILY_MAP_PATH;
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
        z-index: 10001 !important;
      }

      html[data-mobile-map-toolbar-backdrop="true"] #${GENERATION_OVERLAY_ID} {
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

function getBottomNavigationTop() {
  return window.innerHeight - getBottomNavigationOffset();
}

function getToolbar() {
  return document.querySelector<HTMLElement>(`${TOOLBAR_SELECTOR}[data-mobile-family-map-toolbar-active="true"]`)
    ?? document.querySelector<HTMLElement>(TOOLBAR_SELECTOR);
}

function getToolbarBottom() {
  const rect = getToolbar()?.getBoundingClientRect();
  return rect ? Math.max(0, Math.ceil(rect.bottom)) : 0;
}

function isVisibleRect(rect: DOMRect) {
  return rect.width >= 80
    && rect.height >= 24
    && rect.bottom > 0
    && rect.top < window.innerHeight;
}

function isFullscreenMapPanel(element: HTMLElement) {
  return element.matches('[data-mobile-family-map-inline-overview="true"][data-mobile-family-map-panel-mode="full"]')
    || Boolean(element.querySelector('[data-mobile-family-map-inline-overview="true"][data-mobile-family-map-panel-mode="full"]'))
    || element.id === 'mobile-family-map-full-overview'
    || element.id === 'mobile-generation-line-full-overview';
}

function getActivePanelBottom(toolbarBottom: number) {
  const bottomLimit = getBottomNavigationTop();
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(PANEL_SELECTORS))
    .filter((element) => element.id !== BACKDROP_ID)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return { element, rect };
    })
    .filter(({ element, rect }) => (
      isVisibleRect(rect)
      && rect.bottom > toolbarBottom + 4
      && rect.top < bottomLimit - 8
      && !element.matches(TOOLBAR_SELECTOR)
    ));

  const fullscreen = candidates.find(({ element }) => isFullscreenMapPanel(element));
  if (fullscreen) return bottomLimit;

  const relevant = candidates
    .filter(({ rect }) => rect.top <= toolbarBottom + 210)
    .sort((a, b) => b.rect.bottom - a.rect.bottom)[0];

  if (!relevant) return toolbarBottom;
  return Math.min(bottomLimit, Math.max(toolbarBottom, Math.ceil(relevant.rect.bottom)));
}

function getBackdropTop(toolbarBottom: number) {
  if (isDirectFamilyMapPath()) return toolbarBottom;
  return getActivePanelBottom(toolbarBottom);
}

function syncBackdropLayer() {
  ensureStyles();

  if (!isMobileViewport()) return;

  const backdrop = document.getElementById(BACKDROP_ID);
  if (!backdrop) return;

  const toolbarBottom = getToolbarBottom();
  const backdropTop = getBackdropTop(toolbarBottom);

  document.documentElement.dataset.mobileMapToolbarBackdrop = 'true';
  document.documentElement.style.setProperty(BACKDROP_TOP_VAR, `${backdropTop}px`);
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
      'data-mobile-family-map-toolbar-active',
      'data-mobile-family-map-toolbar-action',
      'data-mobile-family-map-panel-mode',
      'aria-current',
      'aria-pressed',
    ],
  });

  window.addEventListener('resize', scheduleSync, { passive: true });
  window.addEventListener('orientationchange', () => window.setTimeout(scheduleSync, 180), { passive: true });
  window.addEventListener('scroll', scheduleSync, { passive: true });
}

export {};
