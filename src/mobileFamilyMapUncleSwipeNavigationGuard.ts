const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const NAVIGATION_THRESHOLD = 56;
const PREVIEW_THRESHOLD = 8;

type UncleScreen = 'paternal-uncles' | 'maternal-uncles';
type TargetScreen = 'core' | 'paternal-cousins' | 'maternal-cousins';
type PhysicalSwipeDirection = 'left' | 'right' | 'up' | 'down';

type GestureStart = {
  x: number;
  y: number;
  screen: UncleScreen | null;
};

const SCREEN_POSITIONS: Record<TargetScreen | UncleScreen, { column: number; row: number }> = {
  'paternal-uncles': { column: 0, row: 1 },
  'maternal-uncles': { column: 2, row: 1 },
  core: { column: 1, row: 1 },
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

function getScreenFromElement(element: Element | null): UncleScreen | null {
  const screen = element?.closest<HTMLElement>('[data-mobile-family-tree-screen]');
  const screenName = screen?.getAttribute('data-mobile-family-tree-screen');
  return isUncleScreen(screenName) ? screenName : null;
}

function getScreenFromTarget(target: EventTarget | null): UncleScreen | null {
  return target instanceof Element ? getScreenFromElement(target) : null;
}

function getScreenFromPoint(x: number, y: number): UncleScreen | null {
  return getScreenFromElement(document.elementFromPoint(x, y));
}

function parseTranslatePercent(value: string) {
  const match = value.match(/translate3d\(calc\((-?\d+(?:\.\d+)?)%[^,]*,\s*calc\((-?\d+(?:\.\d+)?)%/);
  if (!match) return null;

  const x = Math.abs(Number(match[1]));
  const y = Math.abs(Number(match[2]));
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const toIndex = (percent: number) => {
    if (percent < 1) return 0;
    if (Math.abs(percent - 100 / 3) < 2) return 1;
    if (Math.abs(percent - 200 / 3) < 2) return 2;
    return null;
  };

  const column = toIndex(x);
  const row = toIndex(y);
  if (column === null || row === null) return null;

  if (column === 0 && row === 1) return 'paternal-uncles';
  if (column === 2 && row === 1) return 'maternal-uncles';
  return null;
}

function getActiveUncleScreen() {
  const root = getRoot();
  const explicit = root?.getAttribute('data-mobile-family-tree-active-screen');
  if (isUncleScreen(explicit)) return explicit;
  return parseTranslatePercent(getStage()?.style.transform ?? '');
}

function getTransformForScreen(screenName: TargetScreen) {
  const { column, row } = SCREEN_POSITIONS[screenName];
  return `translate3d(calc(${-column * (100 / 3)}% + 0px), calc(${-row * (100 / 3)}% + 0px), 0)`;
}

function blockEvent(event: TouchEvent, prevent = true) {
  if (prevent) event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function getPhysicalDirection(deltaX: number, deltaY: number, threshold: number): PhysicalSwipeDirection | null {
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);

  if (absoluteX >= threshold && absoluteX > absoluteY * 1.2) return deltaX < 0 ? 'left' : 'right';
  if (absoluteY >= threshold && absoluteY > absoluteX * 1.2) return deltaY < 0 ? 'up' : 'down';

  return null;
}

function getDestination(screen: UncleScreen, direction: PhysicalSwipeDirection): TargetScreen | null {
  if (screen === 'paternal-uncles') {
    if (direction === 'left') return 'core';
    if (direction === 'right') return null;
    if (direction === 'up') return 'paternal-cousins';
    if (direction === 'down') return null;
  }

  if (screen === 'maternal-uncles') {
    if (direction === 'right') return null;
    if (direction === 'left') return 'core';
    if (direction === 'down' || direction === 'up') return 'maternal-cousins';
  }

  return null;
}

function applyScreen(screenName: TargetScreen) {
  const root = getRoot();
  const stage = getStage();
  if (!root || !stage) return;

  stage.style.setProperty('transform', getTransformForScreen(screenName), 'important');
  stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  root.setAttribute('data-mobile-family-tree-active-screen', screenName);

  root.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`)
    ?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll], .mobile-family-descendant-screen__scroll')
    .forEach((scrollArea) => scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' }));

  window.setTimeout(() => getStage()?.style.removeProperty('transition'), 340);
}

function handleTouchStart(event: TouchEvent) {
  if (!isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const screen = getScreenFromTarget(event.target)
    ?? getScreenFromPoint(touch.clientX, touch.clientY)
    ?? getActiveUncleScreen();

  gestureStart = {
    x: touch.clientX,
    y: touch.clientY,
    screen,
  };

  // Garante que handlers document/root do React não inicializem uma navegação concorrente.
  if (screen) blockEvent(event, false);
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart?.screen || !isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - gestureStart.x;
  const deltaY = touch.clientY - gestureStart.y;
  const direction = getPhysicalDirection(deltaX, deltaY, PREVIEW_THRESHOLD);
  if (!direction) return;

  // Captura tanto direções permitidas quanto bloqueadas antes dos handlers document/root.
  blockEvent(event);
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
  const direction = getPhysicalDirection(deltaX, deltaY, NAVIGATION_THRESHOLD);
  if (!direction) return;

  blockEvent(event);
  const destination = getDestination(start.screen, direction);
  if (!destination) return;

  applyScreen(destination);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Window capture roda antes dos listeners em document/root, mesmo quando estes foram registrados antes.
  window.addEventListener('touchstart', handleTouchStart, { capture: true, passive: false });
  window.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  window.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  window.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });
}

export {};
