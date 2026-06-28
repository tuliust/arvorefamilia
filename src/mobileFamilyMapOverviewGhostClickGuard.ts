const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const TILE_SELECTOR = '.mobile-family-overview-tile[data-screen]';
const SUPPRESSION_MS = 900;

let suppressUntil = 0;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && isMobileViewport()
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function getEventTarget(event: Event) {
  return event.target instanceof Element ? event.target : null;
}

function getOverview() {
  return document.getElementById(OVERVIEW_ID);
}

function consume(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function armSuppressionForOverviewTile(event: Event) {
  if (!isEnabled()) return;

  const target = getEventTarget(event);
  const overlay = getOverview();
  if (!target || !overlay || !overlay.contains(target)) return;
  if (!target.closest(TILE_SELECTOR)) return;

  suppressUntil = Date.now() + SUPPRESSION_MS;
}

function blockGhostEvent(event: Event) {
  if (!isEnabled()) {
    suppressUntil = 0;
    return;
  }

  if (Date.now() > suppressUntil) return;

  const target = getEventTarget(event);
  const overlay = getOverview();

  if (target && overlay?.contains(target)) return;
  consume(event);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('pointerdown', armSuppressionForOverviewTile, { capture: true });
  window.addEventListener('touchstart', armSuppressionForOverviewTile, { capture: true, passive: true });

  window.addEventListener('pointerup', blockGhostEvent, { capture: true });
  window.addEventListener('touchend', blockGhostEvent, { capture: true, passive: false });
  window.addEventListener('click', blockGhostEvent, { capture: true });

  window.addEventListener('popstate', () => { suppressUntil = 0; }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) suppressUntil = 0; }, { passive: true });
}

export {};
