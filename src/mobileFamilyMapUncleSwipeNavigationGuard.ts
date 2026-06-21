const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const NAVIGATION_THRESHOLD = 56;
const PREVIEW_THRESHOLD = 8;

type UncleScreen = 'paternal-uncles' | 'maternal-uncles';
type CousinScreen = 'paternal-cousins' | 'maternal-cousins';

type GestureStart = {
  x: number;
  y: number;
  screen: UncleScreen | null;
};

const DESTINATIONS: Record<UncleScreen, CousinScreen> = {
  'paternal-uncles': 'paternal-cousins',
  'maternal-uncles': 'maternal-cousins',
};

const SCREEN_POSITIONS: Record<CousinScreen, { column: number; row: number }> = {
  'paternal-cousins': { column: 0, row: 2 },
  'maternal-cousins': { column: 2, row: 2 },
};

let gestureStart: GestureStart | null = null;

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

function isUncleScreen(value: string | null | undefined): value is UncleScreen {
  return value === 'paternal-uncles' || value === 'maternal-uncles';
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage() {
  return getRoot()?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function getScreenFromTarget(target: EventTarget | null): UncleScreen | null {
  if (!(target instanceof Element)) return null;
  const screen = target.closest<HTMLElement>('[data-mobile-family-tree-screen]');
  const screenName = screen?.getAttribute('data-mobile-family-tree-screen');
  return isUncleScreen(screenName) ? screenName : null;
}

function getTransformForScreen(screenName: CousinScreen) {
  const { column, row } = SCREEN_POSITIONS[screenName];
  return `translate3d(calc(${-column * (100 / 3)}% + 0px), calc(${-row * (100 / 3)}% + 0px), 0)`;
}

function consume(event: TouchEvent) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function isUpwardNavigationGesture(deltaX: number, deltaY: number, threshold: number) {
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);
  return deltaY < 0 && absoluteY >= threshold && absoluteY > absoluteX * 1.2;
}

function applyScreen(screenName: CousinScreen) {
  const root = getRoot();
  const stage = getStage();
  if (!root || !stage) return;

  stage.style.setProperty('transform', getTransformForScreen(screenName), 'important');
  stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  root.setAttribute('data-mobile-family-tree-active-screen', screenName);

  root.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`)
    ?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll]')
    .forEach((scrollArea) => scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' }));

  window.setTimeout(() => getStage()?.style.removeProperty('transition'), 340);
}

function handleTouchStart(event: TouchEvent) {
  if (!isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  gestureStart = {
    x: touch.clientX,
    y: touch.clientY,
    screen: getScreenFromTarget(event.target),
  };
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart?.screen || !isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - gestureStart.x;
  const deltaY = touch.clientY - gestureStart.y;
  if (!isUpwardNavigationGesture(deltaX, deltaY, PREVIEW_THRESHOLD)) return;

  consume(event);
}

function handleTouchEnd(event: TouchEvent) {
  if (!gestureStart?.screen || !isEnabled()) {
    gestureStart = null;
    return;
  }

  const touch = event.changedTouches[0];
  const start = gestureStart;
  gestureStart = null;
  if (!touch) return;

  const deltaX = touch.clientX - start.x;
  const deltaY = touch.clientY - start.y;
  if (!isUpwardNavigationGesture(deltaX, deltaY, NAVIGATION_THRESHOLD)) return;

  consume(event);
  applyScreen(DESTINATIONS[start.screen]);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });
}

export {};
