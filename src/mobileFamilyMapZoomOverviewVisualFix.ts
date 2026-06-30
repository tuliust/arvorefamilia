const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const DESCENDANTS_LOCK_ATTR = 'data-mobile-family-descendants-transform-lock';
const STYLE_ID = 'mobile-family-map-zoom-overview-visual-fix-style';

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function getEventTarget(event: Event) {
  return event.target instanceof Element ? event.target : null;
}

function unlockDescendantLockForOverviewNavigation() {
  const root = document.querySelector<HTMLElement>(ROOT_SELECTOR);
  const stage = root?.querySelector<HTMLElement>(STAGE_SELECTOR);
  root?.removeAttribute(DESCENDANTS_LOCK_ATTR);
  stage?.style.setProperty('transition', 'none', 'important');
}

function removeLegacyVisualFixStyle() {
  if (typeof document === 'undefined') return;
  document.getElementById(STYLE_ID)?.remove();
}

function handleOverviewTilePress(event: Event) {
  if (!isEnabled()) return;

  const target = getEventTarget(event);
  const overlay = document.getElementById(OVERVIEW_ID);
  if (!target || !overlay || !overlay.contains(target)) return;
  if (!target.closest('.mobile-family-overview-tile[data-screen]')) return;

  unlockDescendantLockForOverviewNavigation();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  removeLegacyVisualFixStyle();

  window.addEventListener('pointerdown', handleOverviewTilePress, { capture: true, passive: true });
  window.addEventListener('touchstart', handleOverviewTilePress, { capture: true, passive: true });
  window.addEventListener('resize', removeLegacyVisualFixStyle, { passive: true });
  window.addEventListener('orientationchange', removeLegacyVisualFixStyle, { passive: true });
  window.addEventListener('popstate', removeLegacyVisualFixStyle, { passive: true });
  document.addEventListener('visibilitychange', removeLegacyVisualFixStyle, { passive: true });
}

export {};
