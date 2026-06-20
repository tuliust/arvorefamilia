const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const INTERACTIVE_SELECTOR = 'header, [data-mobile-family-map-toolbar], [data-tree-export-ignore="true"], a, select, input, textarea';
const SWIPE_THRESHOLD = 42;

type ScreenName = 'ancestors' | 'paternal-uncles' | 'core' | 'maternal-uncles' | 'descendants';
type Direction = 'up' | 'down' | 'left' | 'right';

type GestureStart = {
  x: number;
  y: number;
  root: HTMLElement;
  screen: ScreenName;
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

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
}

function getCurrentScreen(root: HTMLElement): ScreenName {
  const activeScreen = root.getAttribute('data-mobile-family-tree-active-screen');
  if (
    activeScreen === 'ancestors'
    || activeScreen === 'paternal-uncles'
    || activeScreen === 'maternal-uncles'
    || activeScreen === 'descendants'
  ) return activeScreen;

  return 'core';
}

function getDestination(screenName: ScreenName, direction: Direction): ScreenName | null {
  if (screenName === 'core') {
    if (direction === 'up') return 'ancestors';
    if (direction === 'down') return 'descendants';
    if (direction === 'left') return 'paternal-uncles';
    if (direction === 'right') return 'maternal-uncles';
  }

  if (screenName === 'ancestors' && direction === 'down') return 'core';
  if (screenName === 'descendants' && direction === 'up') return 'core';
  if (screenName === 'paternal-uncles' && direction === 'right') return 'core';
  if (screenName === 'maternal-uncles' && direction === 'left') return 'core';

  return null;
}

function getDirection(deltaX: number, deltaY: number, threshold: number): Direction | null {
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);

  if (absoluteX >= threshold && absoluteX > absoluteY * 1.15) return deltaX < 0 ? 'left' : 'right';
  if (absoluteY >= threshold && absoluteY > absoluteX * 1.15) return deltaY < 0 ? 'up' : 'down';
  return null;
}

function getTransformForScreen(screenName: ScreenName) {
  if (screenName === 'ancestors') return 'translate3d(calc(-33.3333333333% + 0px), calc(0% + 0px), 0)';
  if (screenName === 'paternal-uncles') return 'translate3d(calc(0% + 0px), calc(-33.3333333333% + 0px), 0)';
  if (screenName === 'maternal-uncles') return 'translate3d(calc(-66.6666666667% + 0px), calc(-33.3333333333% + 0px), 0)';
  if (screenName === 'descendants') return 'translate3d(calc(-33.3333333333% + 0px), calc(-66.6666666667% + 0px), 0)';
  return 'translate3d(calc(-33.3333333333% + 0px), calc(-33.3333333333% + 0px), 0)';
}

function clickInternalTab(root: HTMLElement, screenName: ScreenName) {
  const tabLabel = screenName === 'paternal-uncles'
    ? 'paterno'
    : screenName === 'maternal-uncles'
      ? 'materno'
      : 'central';

  const button = Array.from(root.querySelectorAll<HTMLButtonElement>('nav[aria-label="Visualizações da árvore"] button'))
    .find((candidate) => (candidate.textContent ?? '').trim().toLowerCase().includes(tabLabel));

  button?.click();
}

function applyScreen(root: HTMLElement, screenName: ScreenName) {
  const stage = getStage(root);
  if (!stage) return;

  clickInternalTab(root, screenName);
  root.setAttribute('data-mobile-family-tree-active-screen', screenName);
  stage.style.setProperty('transform', getTransformForScreen(screenName), 'important');
  stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');

  window.setTimeout(() => {
    getStage(root)?.style.removeProperty('transition');
  }, 340);
}

function handleTouchStart(event: TouchEvent) {
  if (!isEnabled() || isInteractiveTarget(event.target)) {
    gestureStart = null;
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  const root = target?.closest<HTMLElement>(ROOT_SELECTOR);
  const touch = event.touches[0];
  if (!root || !touch) {
    gestureStart = null;
    return;
  }

  gestureStart = { x: touch.clientX, y: touch.clientY, root, screen: getCurrentScreen(root) };
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart || !isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const direction = getDirection(touch.clientX - gestureStart.x, touch.clientY - gestureStart.y, 12);
  if (!direction || !getDestination(gestureStart.screen, direction)) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
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

  const direction = getDirection(touch.clientX - start.x, touch.clientY - start.y, SWIPE_THRESHOLD);
  if (!direction) return;

  const destination = getDestination(start.screen, direction);
  if (!destination) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  applyScreen(start.root, destination);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });
}

export {};