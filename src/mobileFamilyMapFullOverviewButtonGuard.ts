const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const FULL_MAP_ID = 'mobile-family-map-full-overview';
const FULL_MAP_BUTTON_SELECTOR = '[data-mobile-family-full-map-button="true"]';
const INLINE_OVERVIEW_SELECTOR = '[data-mobile-family-map-inline-overview="true"]';
const FULL_MAP_Z_INDEX = '900';

let lastHandledAt = 0;
let forwardingClick = false;

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

function consume(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function promoteFullMap() {
  const fullMap = document.getElementById(FULL_MAP_ID);
  if (!fullMap) return;
  if (fullMap.closest(INLINE_OVERVIEW_SELECTOR)) return;

  fullMap.style.setProperty('z-index', FULL_MAP_Z_INDEX, 'important');
  document.getElementById(OVERVIEW_ID)?.remove();
  document.body.style.setProperty('overflow', 'hidden');
}

function forwardToFullMapButton(button: HTMLButtonElement) {
  if (forwardingClick) return;

  forwardingClick = true;
  try {
    button.click();
  } finally {
    window.setTimeout(() => {
      forwardingClick = false;
    }, 80);
  }

  [0, 40, 120, 260].forEach((delay) => window.setTimeout(promoteFullMap, delay));
}

function handleFullMapButtonActivation(event: Event) {
  if (!isEnabled()) return;

  const target = getEventTarget(event);
  const button = target?.closest<HTMLButtonElement>(FULL_MAP_BUTTON_SELECTOR);
  if (!button) return;
  if (button.closest(INLINE_OVERVIEW_SELECTOR)) return;

  if (forwardingClick) return;

  consume(event);

  const now = Date.now();
  if (now - lastHandledAt < 320) return;
  lastHandledAt = now;

  forwardToFullMapButton(button);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('pointerup', handleFullMapButtonActivation, { capture: true });
  window.addEventListener('touchend', handleFullMapButtonActivation, { capture: true, passive: false });
  window.addEventListener('click', handleFullMapButtonActivation, { capture: true });
  window.addEventListener('resize', promoteFullMap, { passive: true });
  window.addEventListener('orientationchange', promoteFullMap, { passive: true });
  window.addEventListener('popstate', () => { lastHandledAt = 0; }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) promoteFullMap(); }, { passive: true });
}

export {};
