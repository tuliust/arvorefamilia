const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const SCREEN_SELECTOR = '[data-mobile-family-tree-screen]';
const SWIPE_PREVIEW_THRESHOLD = 10;
const SWIPE_NAVIGATION_THRESHOLD = 56;

type MobileTreeScreen =
  | 'paternal-ancestors'
  | 'ancestors'
  | 'maternal-ancestors'
  | 'paternal-uncles'
  | 'core'
  | 'maternal-uncles'
  | 'paternal-cousins'
  | 'descendants'
  | 'maternal-cousins';

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

type GestureStart = {
  x: number;
  y: number;
  screen: MobileTreeScreen | null;
};

const SCREEN_POSITIONS: Record<MobileTreeScreen, { column: number; row: number }> = {
  'paternal-ancestors': { column: 0, row: 0 },
  ancestors: { column: 1, row: 0 },
  'maternal-ancestors': { column: 2, row: 0 },
  'paternal-uncles': { column: 0, row: 1 },
  core: { column: 1, row: 1 },
  'maternal-uncles': { column: 2, row: 1 },
  'paternal-cousins': { column: 0, row: 2 },
  descendants: { column: 1, row: 2 },
  'maternal-cousins': { column: 2, row: 2 },
};

const DESTINATIONS: Record<MobileTreeScreen, Partial<Record<SwipeDirection, MobileTreeScreen>>> = {
  'paternal-ancestors': { right: 'ancestors' },
  ancestors: { left: 'paternal-ancestors', right: 'maternal-ancestors', down: 'core' },
  'maternal-ancestors': { left: 'ancestors' },
  core: { up: 'ancestors', left: 'paternal-uncles', right: 'maternal-uncles', down: 'descendants' },
  descendants: { up: 'core' },
  'paternal-uncles': { down: 'paternal-cousins', right: 'core' },
  'maternal-uncles': { down: 'maternal-cousins', left: 'core' },
  'paternal-cousins': { up: 'paternal-uncles' },
  'maternal-cousins': { up: 'maternal-uncles' },
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

function isEnabled() {
  return isMobileViewport() && isFamilyMapPath() && Boolean(getRoot());
}

function isMobileTreeScreen(value: string | null | undefined): value is MobileTreeScreen {
  return Boolean(value && value in SCREEN_POSITIONS);
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function getScreenElement(root: HTMLElement, screenName: MobileTreeScreen) {
  return root.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`);
}

function getDescendantSourceSelector() {
  return [
    'irmaos',
    'sobrinhos',
    'conjuge',
    'pets',
    'filhos',
    'netos',
  ].map((key) => `[data-family-map-color-key="${key}"]`).join(', ');
}

function screenHasContent(root: HTMLElement, screenName: MobileTreeScreen) {
  if (screenName === 'core') return true;

  if (screenName === 'descendants') {
    return Boolean(
      getScreenElement(root, screenName)?.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key]')
      || getScreenElement(root, 'core')?.querySelector(getDescendantSourceSelector())
    );
  }

  return Boolean(
    getScreenElement(root, screenName)?.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key]')
  );
}

function parseTranslatePercent(value: string) {
  const match = value.match(/translate3d\(calc\((-?\d+(?:\.\d+)?)%[^,]*,\s*calc\((-?\d+(?:\.\d+)?)%/);
  if (!match) return null;

  const x = Number(match[1]);
  const y = Number(match[2]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const toIndex = (percent: number) => {
    const absolute = Math.abs(percent);
    if (absolute < 1) return 0;
    if (Math.abs(absolute - 100 / 3) < 2) return 1;
    if (Math.abs(absolute - 200 / 3) < 2) return 2;
    return null;
  };

  const column = toIndex(x);
  const row = toIndex(y);
  if (column === null || row === null) return null;
  return { column, row };
}

function getScreenFromStageTransform(root: HTMLElement): MobileTreeScreen | null {
  const transform = getStage(root)?.style.transform ?? '';
  const position = parseTranslatePercent(transform);
  if (!position) return null;

  return (Object.keys(SCREEN_POSITIONS) as MobileTreeScreen[]).find((screenName) => {
    const screenPosition = SCREEN_POSITIONS[screenName];
    return screenPosition.column === position.column && screenPosition.row === position.row;
  }) ?? null;
}

function getScreenFromGeometry(root: HTMLElement): MobileTreeScreen | null {
  const rootRect = root.getBoundingClientRect();
  const centerX = rootRect.left + rootRect.width / 2;
  const centerY = rootRect.top + rootRect.height / 2;
  let nearest: { screenName: MobileTreeScreen; distance: number } | null = null;

  root.querySelectorAll<HTMLElement>(SCREEN_SELECTOR).forEach((screenElement) => {
    const screenName = screenElement.dataset.mobileFamilyTreeScreen;
    if (!isMobileTreeScreen(screenName)) return;

    const rect = screenElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const screenCenterX = rect.left + rect.width / 2;
    const screenCenterY = rect.top + rect.height / 2;
    const distance = Math.hypot(screenCenterX - centerX, screenCenterY - centerY);

    if (!nearest || distance < nearest.distance) nearest = { screenName, distance };
  });

  return nearest?.screenName ?? null;
}

function getCurrentScreen(root: HTMLElement): MobileTreeScreen | null {
  const transformScreen = getScreenFromStageTransform(root);
  if (transformScreen) return transformScreen;

  const explicitScreen = root.getAttribute('data-mobile-family-tree-active-screen');
  if (isMobileTreeScreen(explicitScreen)) return explicitScreen;

  return getScreenFromGeometry(root);
}

function getGestureDirection(deltaX: number, deltaY: number, threshold: number): SwipeDirection | null {
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);

  if (absoluteX >= threshold && absoluteX > absoluteY * 1.2) {
    return deltaX < 0 ? 'right' : 'left';
  }

  if (absoluteY >= threshold && absoluteY > absoluteX * 1.2) {
    return deltaY < 0 ? 'down' : 'up';
  }

  return null;
}

function getDestination(screenName: MobileTreeScreen, direction: SwipeDirection, root: HTMLElement) {
  const destination = DESTINATIONS[screenName][direction];
  if (!destination || !screenHasContent(root, destination)) return null;
  return destination;
}

function getTransformForScreen(screenName: MobileTreeScreen) {
  const { column, row } = SCREEN_POSITIONS[screenName];
  const x = column === 0 ? 0 : -(column * 100) / 3;
  const y = row === 0 ? 0 : -(row * 100) / 3;

  return `translate3d(calc(${x}% + 0px), calc(${y}% + 0px), 0)`;
}

function scrollScreenToTop(root: HTMLElement, screenName: MobileTreeScreen) {
  getScreenElement(root, screenName)?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll]').forEach((scrollArea) => {
    scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}

function applyScreen(screenName: MobileTreeScreen, animate = true) {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage || !screenHasContent(root, screenName)) return;

  stage.style.setProperty('transform', getTransformForScreen(screenName), 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');

  root.setAttribute('data-mobile-family-tree-active-screen', screenName);
  scrollScreenToTop(root, screenName);

  if (animate) {
    window.setTimeout(() => {
      getStage()?.style.removeProperty('transition');
    }, 340);
  }
}

function blockEvent(event: TouchEvent) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function handleTouchStart(event: TouchEvent) {
  if (!isEnabled()) return;
  const root = getRoot();
  const target = event.target instanceof Element ? event.target : null;
  const touch = event.touches[0];
  if (!root || !target?.closest(ROOT_SELECTOR) || !touch) return;

  gestureStart = {
    x: touch.clientX,
    y: touch.clientY,
    screen: getCurrentScreen(root),
  };
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart || !isEnabled()) return;
  const touch = event.touches[0];
  if (!touch || !gestureStart.screen) return;

  const direction = getGestureDirection(
    touch.clientX - gestureStart.x,
    touch.clientY - gestureStart.y,
    SWIPE_PREVIEW_THRESHOLD,
  );

  if (!direction) return;
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
  if (!touch || !start.screen) return;

  const root = getRoot();
  if (!root) return;

  const direction = getGestureDirection(
    touch.clientX - start.x,
    touch.clientY - start.y,
    SWIPE_NAVIGATION_THRESHOLD,
  );

  if (!direction) return;

  blockEvent(event);
  const destination = getDestination(start.screen, direction, root);
  if (!destination) return;

  applyScreen(destination);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });
}

export {};
