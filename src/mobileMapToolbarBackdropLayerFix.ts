const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATHS = new Set(['/mapa-familiar', '/linha-geracional']);
const BACKDROP_ID = 'mobile-map-toolbar-panel-backdrop';
const STYLE_ID = 'mobile-map-toolbar-backdrop-layer-fix-style';
const TOOLBAR_SELECTOR = '[data-mobile-family-map-toolbar="true"]';
const ACTIVE_TOOLBAR_SELECTOR = `${TOOLBAR_SELECTOR}[data-mobile-family-map-toolbar-active="true"]`;
const INLINE_OVERVIEW_SELECTOR = '[data-mobile-family-map-inline-overview="true"]';
const FULL_PANEL_SELECTOR = `${INLINE_OVERVIEW_SELECTOR}[data-mobile-family-map-panel-mode="full"]`;
const OVERVIEW_PANEL_SELECTOR = `${INLINE_OVERVIEW_SELECTOR}[data-mobile-family-map-panel-mode="overview"]`;
const GENERATION_OVERLAY_SELECTOR = '#mobile-generation-safe-overview-overlay';
const CONTEXT_PANEL_WRAPPER_SELECTOR = 'div[data-tree-export-ignore="true"]';
const BOTTOM_NAV_FALLBACK = 86;
const PARTIAL_BACKDROP_Z_INDEX = '9000';
const IMMERSIVE_BACKDROP_Z_INDEX = '12000';
const IMMERSIVE_PANEL_Z_INDEX = '12010';

let scheduled = false;
let delayedSyncTimer: number | null = null;
let lastPathname = '';

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function getPathname() {
  return typeof window === 'undefined' ? '' : window.location.pathname.replace(/\/$/, '');
}

function isFamilyMapPath() {
  return FAMILY_MAP_PATHS.has(getPathname());
}

function getActiveToolbar() {
  return document.querySelector<HTMLElement>(ACTIVE_TOOLBAR_SELECTOR);
}

function getActiveToolbarAction() {
  return getActiveToolbar()?.dataset.mobileFamilyMapToolbarAction ?? '';
}

function isVisibleRect(rect: DOMRect) {
  return rect.width >= 20
    && rect.height >= 20
    && rect.bottom > 0
    && rect.top < window.innerHeight;
}

function isVisibleElement(element: HTMLElement | null | undefined) {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
  return isVisibleRect(element.getBoundingClientRect());
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      #${BACKDROP_ID} {
        position: fixed !important;
        left: 0 !important;
        right: 0 !important;
        display: block !important;
        pointer-events: none !important;
        -webkit-backdrop-filter: blur(5px) saturate(0.86) !important;
        backdrop-filter: blur(5px) saturate(0.86) !important;
        transition: none !important;
        transform: translateZ(0) !important;
        will-change: opacity, transform !important;
      }

      html[data-mobile-map-toolbar-backdrop="partial"] ${TOOLBAR_SELECTOR},
      html[data-mobile-map-toolbar-backdrop="partial"] ${GENERATION_OVERLAY_SELECTOR},
      html[data-mobile-map-toolbar-backdrop="partial"] ${OVERVIEW_PANEL_SELECTOR},
      html[data-mobile-map-toolbar-backdrop="partial"] [role="dialog"][aria-label="Filtros do mapa familiar"],
      html[data-mobile-map-toolbar-backdrop="partial"] [role="dialog"][aria-label="Exportar mapa familiar"],
      html[data-mobile-map-toolbar-backdrop="partial"] [aria-label="Paletas de cores da árvore"] {
        position: relative !important;
        z-index: 10001 !important;
      }

      html[data-mobile-map-toolbar-backdrop="immersive"] ${TOOLBAR_SELECTOR} {
        z-index: 10000 !important;
      }

      html[data-mobile-map-toolbar-backdrop="immersive"] ${FULL_PANEL_SELECTOR},
      html[data-mobile-map-toolbar-backdrop="immersive"] #mobile-family-map-full-overview,
      html[data-mobile-map-toolbar-backdrop="immersive"] #mobile-generation-line-full-overview {
        position: relative !important;
        z-index: ${IMMERSIVE_PANEL_Z_INDEX} !important;
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

function setImportantStyle(element: HTMLElement, property: string, value: string) {
  element.style.setProperty(property, value, 'important');
}

function clearImportantStyle(element: HTMLElement, property: string) {
  element.style.removeProperty(property);
}

function getOrCreateBackdrop() {
  let backdrop = document.getElementById(BACKDROP_ID) as HTMLDivElement | null;
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = BACKDROP_ID;
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  return backdrop;
}

function removeBackdrop() {
  document.getElementById(BACKDROP_ID)?.remove();
  delete document.documentElement.dataset.mobileMapToolbarBackdrop;
  document.documentElement.style.removeProperty('--mobile-map-toolbar-backdrop-top');
  document.documentElement.style.removeProperty('--mobile-map-toolbar-backdrop-bottom');
  resetImmersivePanelLayer();
}

function getToolbarBottom() {
  const rect = getActiveToolbar()?.getBoundingClientRect();
  return rect && isVisibleRect(rect) ? Math.max(0, Math.ceil(rect.bottom)) : 0;
}

function getBottomNavigationOffset() {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('nav, [role="navigation"], footer'));
  const bottomNav = candidates
    .map((element) => ({
      element,
      text: (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
      rect: element.getBoundingClientRect(),
    }))
    .filter(({ text, rect }) => (
      rect.height >= 48
      && rect.top > window.innerHeight * 0.45
      && /Home/i.test(text)
      && /Calend/i.test(text)
      && /F[oó]rum/i.test(text)
    ))
    .sort((a, b) => b.rect.top - a.rect.top)[0];

  if (!bottomNav) return BOTTOM_NAV_FALLBACK;
  return Math.max(72, Math.ceil(window.innerHeight - bottomNav.rect.top));
}

function getBottomNavigationTop() {
  return window.innerHeight - getBottomNavigationOffset();
}

function getVisibleFullPanel() {
  const panel = document.querySelector<HTMLElement>(FULL_PANEL_SELECTOR);
  return isVisibleElement(panel) ? panel : null;
}

function getContextPanelCandidates(action: string) {
  const candidates: HTMLElement[] = [];

  if (action === 'zoom') {
    candidates.push(
      ...Array.from(document.querySelectorAll<HTMLElement>(OVERVIEW_PANEL_SELECTOR)),
      ...Array.from(document.querySelectorAll<HTMLElement>(GENERATION_OVERLAY_SELECTOR))
    );
  }

  if (action === 'grupos') {
    candidates.push(...Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-label="Filtros do mapa familiar"]')));
  }

  if (action === 'exportar') {
    candidates.push(...Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-label="Exportar mapa familiar"]')));
  }

  if (action === 'cor') {
    candidates.push(...Array.from(document.querySelectorAll<HTMLElement>('[aria-label="Paletas de cores da árvore"]')));
  }

  if (action === 'visualizacao') {
    candidates.push(...Array.from(document.querySelectorAll<HTMLElement>(`${CONTEXT_PANEL_WRAPPER_SELECTOR} label`)));
  }

  if (action === 'formato') {
    Array.from(document.querySelectorAll<HTMLElement>(CONTEXT_PANEL_WRAPPER_SELECTOR)).forEach((element) => {
      const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (/Linha Geracional/i.test(text) && /Árvore Familiar/i.test(text)) candidates.push(element);
    });
  }

  return Array.from(new Set(candidates)).filter(isVisibleElement);
}

function getContextPanelBottom(action: string, toolbarBottom: number) {
  const bottomLimit = getBottomNavigationTop();
  const candidates = getContextPanelCandidates(action)
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => (
      isVisibleRect(rect)
      && rect.bottom > toolbarBottom + 4
      && rect.top < bottomLimit - 8
    ));

  if (candidates.length === 0) return toolbarBottom;

  const panelBottom = Math.max(...candidates.map((rect) => Math.ceil(rect.bottom)));
  return Math.min(bottomLimit, Math.max(toolbarBottom, panelBottom));
}

function getImmersivePanelWrapper(panel: HTMLElement) {
  const wrapper = panel.closest<HTMLElement>(CONTEXT_PANEL_WRAPPER_SELECTOR);
  return wrapper ?? panel;
}

function promoteImmersivePanelLayer(panel: HTMLElement) {
  const wrapper = getImmersivePanelWrapper(panel);

  [wrapper, panel].forEach((element) => {
    setImportantStyle(element, 'z-index', IMMERSIVE_PANEL_Z_INDEX);
    setImportantStyle(element, 'pointer-events', 'auto');
  });

  setImportantStyle(wrapper, 'isolation', 'isolate');
}

function resetImmersivePanelLayer() {
  document.querySelectorAll<HTMLElement>(`${CONTEXT_PANEL_WRAPPER_SELECTOR}, ${INLINE_OVERVIEW_SELECTOR}`).forEach((element) => {
    if (element.matches(FULL_PANEL_SELECTOR) || element.querySelector(FULL_PANEL_SELECTOR)) return;
    clearImportantStyle(element, 'z-index');
    clearImportantStyle(element, 'pointer-events');
    clearImportantStyle(element, 'isolation');
  });
}

function applyPartialBackdrop(backdrop: HTMLElement, action: string, toolbarBottom: number) {
  const top = getContextPanelBottom(action, toolbarBottom);
  const bottom = getBottomNavigationOffset();

  document.documentElement.dataset.mobileMapToolbarBackdrop = 'partial';
  document.documentElement.style.setProperty('--mobile-map-toolbar-backdrop-top', `${top}px`);
  document.documentElement.style.setProperty('--mobile-map-toolbar-backdrop-bottom', `${bottom}px`);

  setImportantStyle(backdrop, 'top', `${top}px`);
  setImportantStyle(backdrop, 'bottom', `${bottom}px`);
  setImportantStyle(backdrop, 'z-index', PARTIAL_BACKDROP_Z_INDEX);
  setImportantStyle(backdrop, 'background', 'rgba(15, 23, 42, 0.38)');
  setImportantStyle(backdrop, 'opacity', '1');
  setImportantStyle(backdrop, '-webkit-backdrop-filter', 'blur(5px) saturate(0.86)');
  setImportantStyle(backdrop, 'backdrop-filter', 'blur(5px) saturate(0.86)');

  resetImmersivePanelLayer();
}

function applyImmersiveBackdrop(backdrop: HTMLElement, panel: HTMLElement) {
  document.documentElement.dataset.mobileMapToolbarBackdrop = 'immersive';
  document.documentElement.style.setProperty('--mobile-map-toolbar-backdrop-top', '0px');
  document.documentElement.style.setProperty('--mobile-map-toolbar-backdrop-bottom', '0px');

  setImportantStyle(backdrop, 'top', '0px');
  setImportantStyle(backdrop, 'bottom', '0px');
  setImportantStyle(backdrop, 'z-index', IMMERSIVE_BACKDROP_Z_INDEX);
  setImportantStyle(backdrop, 'background', 'rgba(15, 23, 42, 0.46)');
  setImportantStyle(backdrop, 'opacity', '1');
  setImportantStyle(backdrop, '-webkit-backdrop-filter', 'blur(6px) saturate(0.84)');
  setImportantStyle(backdrop, 'backdrop-filter', 'blur(6px) saturate(0.84)');

  promoteImmersivePanelLayer(panel);
}

function syncBackdropLayer() {
  ensureStyles();

  if (!isMobileViewport() || !isFamilyMapPath()) {
    removeBackdrop();
    return;
  }

  const action = getActiveToolbarAction();
  if (!action) {
    removeBackdrop();
    return;
  }

  const toolbarBottom = getToolbarBottom();
  if (toolbarBottom <= 0) {
    removeBackdrop();
    return;
  }

  const fullPanel = action === 'zoom' ? getVisibleFullPanel() : null;
  const backdrop = getOrCreateBackdrop();

  if (fullPanel) {
    applyImmersiveBackdrop(backdrop, fullPanel);
    return;
  }

  if (['visualizacao', 'formato', 'cor', 'grupos', 'zoom', 'exportar'].includes(action)) {
    applyPartialBackdrop(backdrop, action, toolbarBottom);
    return;
  }

  removeBackdrop();
}

function scheduleDelayedSync() {
  if (delayedSyncTimer !== null) window.clearTimeout(delayedSyncTimer);
  delayedSyncTimer = window.setTimeout(() => {
    delayedSyncTimer = null;
    scheduleSync();
  }, 64);
}

function scheduleSync() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    syncBackdropLayer();

    const pathname = getPathname();
    if (pathname !== lastPathname) {
      lastPathname = pathname;
      scheduleDelayedSync();
    }
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  lastPathname = getPathname();
  scheduleSync();
  [40, 120, 260, 520, 900].forEach((delay) => window.setTimeout(scheduleSync, delay));

  const observer = new MutationObserver(() => {
    scheduleSync();
    scheduleDelayedSync();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      'data-mobile-family-map-toolbar-active',
      'data-mobile-family-map-toolbar-action',
      'data-mobile-family-map-panel-mode',
      'data-mobile-generation-line-full-inline',
      'data-mobile-family-map-full-inline',
      'aria-current',
      'aria-pressed',
      'style',
    ],
  });

  window.addEventListener('resize', scheduleSync, { passive: true });
  window.addEventListener('orientationchange', () => window.setTimeout(scheduleSync, 180), { passive: true });
  window.addEventListener('scroll', scheduleSync, { passive: true });
  window.addEventListener('popstate', scheduleSync, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleSync(); }, { passive: true });
}

export {};
