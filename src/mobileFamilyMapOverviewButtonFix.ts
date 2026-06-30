const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const TOOLBAR_MAP_SELECTOR = '[data-mobile-family-map-toolbar-action="zoom"]';
const LEGACY_OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-map-overview-button-fix-style';
const DESCENDANTS_LOCK_ATTR = 'data-mobile-family-descendants-transform-lock';

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isDirectMapRoute() {
  return typeof window !== 'undefined'
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && isMobileViewport()
    && isDirectMapRoute();
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function ensureStyles() {
  if (typeof document === 'undefined') return;

  const css = `
    @media (max-width: 767px) {
      ${TOOLBAR_MAP_SELECTOR} {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.2rem !important;
      }

      ${TOOLBAR_MAP_SELECTOR}::before {
        content: '▦';
        display: inline-block;
        font-size: 0.72rem;
        line-height: 1;
        transform: translateY(-0.02rem);
      }

      #${LEGACY_OVERVIEW_ID}[data-mobile-family-map-overview-source="direct-map"] {
        display: none !important;
        pointer-events: none !important;
        visibility: hidden !important;
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

function syncToolbarMapButtonAttributes() {
  if (!isEnabled()) return;

  document.querySelectorAll<HTMLButtonElement>(TOOLBAR_MAP_SELECTOR).forEach((button) => {
    button.setAttribute('aria-label', 'Abrir visão geral do mapa familiar');
    button.setAttribute('title', 'Visão geral');
  });
}

function removeLegacyDirectMapOverview() {
  if (typeof document === 'undefined') return;

  const legacyOverview = document.getElementById(LEGACY_OVERVIEW_ID);
  if (legacyOverview?.getAttribute('data-mobile-family-map-overview-source') !== 'direct-map') return;

  legacyOverview.remove();
  document.body.style.removeProperty('overflow');

  document.querySelectorAll<HTMLButtonElement>(TOOLBAR_MAP_SELECTOR).forEach((button) => {
    button.removeAttribute('data-mobile-family-map-overview-active');
  });
}

function unlockDescendantLockForOverviewNavigation() {
  if (!isEnabled()) return;

  const root = getRoot();
  const stage = getStage(root);
  root?.removeAttribute(DESCENDANTS_LOCK_ATTR);
  stage?.style.setProperty('transition', 'none', 'important');
}

function getEventTarget(event: Event) {
  return event.target instanceof Element ? event.target : null;
}

function handleOverviewTilePointerDown(event: Event) {
  if (!isEnabled()) return;

  const target = getEventTarget(event);
  if (!target?.closest('[data-mobile-family-map-inline-overview="true"] [data-screen]')) return;

  unlockDescendantLockForOverviewNavigation();
}

function applyFixes() {
  if (!isEnabled()) {
    removeLegacyDirectMapOverview();
    return;
  }

  ensureStyles();
  removeLegacyDirectMapOverview();
  syncToolbarMapButtonAttributes();
}

function scheduleApplyFixes() {
  window.requestAnimationFrame(applyFixes);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyFixes();
  [80, 240, 520, 1000, 1800].forEach((delay) => window.setTimeout(applyFixes, delay));

  window.addEventListener('pointerdown', handleOverviewTilePointerDown, { capture: true, passive: true });
  window.addEventListener('touchstart', handleOverviewTilePointerDown, { capture: true, passive: true });
  window.addEventListener('resize', applyFixes, { passive: true });
  window.addEventListener('orientationchange', applyFixes, { passive: true });
  window.addEventListener('popstate', applyFixes, { passive: true });
  document.addEventListener('visibilitychange', applyFixes, { passive: true });

  const observer = new MutationObserver(scheduleApplyFixes);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

export {};
