const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const STYLE_ID = 'mobile-family-tree-uncle-screen-guards-style';
const SWIPE_THRESHOLD = 10;

type UncleScreen = 'paternal-uncles' | 'maternal-uncles';
type GestureDirection = 'up' | 'down' | 'left' | 'right';

type GestureStart = {
  x: number;
  y: number;
  screen: UncleScreen | null;
};

let gestureStart: GestureStart | null = null;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === FAMILY_MAP_PATH;
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function isEnabled() {
  return isMobileViewport() && isFamilyMapPath() && Boolean(getRoot());
}

function transformHasCenterRow(transform: string) {
  return transform.includes('calc(-33.3333333333%') || transform.includes('calc(-33.333333333333336%');
}

function getActiveUncleScreen(root = getRoot()): UncleScreen | null {
  const explicit = root?.getAttribute('data-mobile-family-tree-active-screen');
  if (explicit === 'paternal-uncles' || explicit === 'maternal-uncles') return explicit;

  const transform = getStage(root)?.style.transform ?? '';
  if (!transformHasCenterRow(transform)) return null;

  if (transform.includes('translate3d(calc(0%') || transform.includes('translate3d(calc(-0%')) {
    return 'paternal-uncles';
  }

  if (transform.includes('translate3d(calc(-66.6666666667%') || transform.includes('translate3d(calc(-66.66666666666667%')) {
    return 'maternal-uncles';
  }

  return null;
}

function getGestureDirection(deltaX: number, deltaY: number): GestureDirection | null {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX >= SWIPE_THRESHOLD && absX > absY * 1.2) {
    return deltaX < 0 ? 'right' : 'left';
  }

  if (absY >= SWIPE_THRESHOLD && absY > absX * 1.2) {
    return deltaY < 0 ? 'down' : 'up';
  }

  return null;
}

function isBlockedDirection(screen: UncleScreen | null, direction: GestureDirection | null) {
  if (!screen || !direction) return false;

  if (screen === 'paternal-uncles') {
    return direction === 'up' || direction === 'left';
  }

  return direction === 'up' || direction === 'right';
}

function blockEvent(event: TouchEvent) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function ensureStyles() {
  const existing = document.getElementById(STYLE_ID);
  existing?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      [data-mobile-family-tree-screen="paternal-uncles"] > div > div[class*="left-1/2"][class*="w-px"][class*="bg-cyan-600"],
      [data-mobile-family-tree-screen="maternal-uncles"] > div > div[class*="left-1/2"][class*="w-px"][class*="bg-cyan-600"] {
        top: auto !important;
        bottom: 0 !important;
        height: 34vh !important;
        inset-block: auto 0 !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] > div > div[class*="border-t"][class*="border-cyan-600"],
      [data-mobile-family-tree-screen="maternal-uncles"] > div > div[class*="border-t"][class*="border-cyan-600"] {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function handleTouchStart(event: TouchEvent) {
  if (!isEnabled()) return;
  const target = event.target instanceof Element ? event.target : null;
  const touch = event.touches[0];
  if (!target?.closest(ROOT_SELECTOR) || !touch) return;

  gestureStart = {
    x: touch.clientX,
    y: touch.clientY,
    screen: getActiveUncleScreen(),
  };
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart || !isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const direction = getGestureDirection(touch.clientX - gestureStart.x, touch.clientY - gestureStart.y);
  if (!isBlockedDirection(gestureStart.screen, direction)) return;

  blockEvent(event);
}

function handleTouchEnd(event: TouchEvent) {
  if (!gestureStart || !isEnabled()) {
    gestureStart = null;
    return;
  }

  const touch = event.changedTouches[0];
  const start = gestureStart;
  gestureStart = null;
  if (!touch) return;

  const direction = getGestureDirection(touch.clientX - start.x, touch.clientY - start.y);
  if (!isBlockedDirection(start.screen, direction)) return;

  blockEvent(event);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();

  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });

  window.addEventListener('resize', ensureStyles, { passive: true });
  window.addEventListener('orientationchange', ensureStyles, { passive: true });
  window.setTimeout(ensureStyles, 500);
}

export {};
