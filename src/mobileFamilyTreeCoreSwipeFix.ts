const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const INTERACTIVE_SELECTOR = 'header, [data-mobile-family-map-toolbar], [data-tree-export-ignore="true"], a, select, input, textarea';
const SWIPE_THRESHOLD = 44;

type ScreenName = 'paternal-uncles' | 'core' | 'maternal-uncles';

type GestureStart = {
  x: number;
  y: number;
  root: HTMLElement;
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

function parseTranslatePercent(value: string) {
  const match = value.match(/translate3d\(calc\((-?\d+(?:\.\d+)?)%[^,]*,\s*calc\((-?\d+(?:\.\d+)?)%/);
  if (!match) return null;

  const x = Number(match[1]);
  const y = Number(match[2]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  return { x, y };
}

function isCoreVisible(root: HTMLElement) {
  const activeScreen = root.getAttribute('data-mobile-family-tree-active-screen');
  if (activeScreen === 'core') return true;
  if (activeScreen && activeScreen !== 'core') return false;

  const transform = getStage(root)?.style.transform ?? '';
  const translated = parseTranslatePercent(transform);
  if (!translated) return true;

  return Math.abs(Math.abs(translated.x) - 100 / 3) < 2
    && Math.abs(Math.abs(translated.y) - 100 / 3) < 2;
}

function getTransformForScreen(screenName: ScreenName) {
  if (screenName === 'paternal-uncles') return 'translate3d(calc(0% + 0px), calc(-33.3333333333% + 0px), 0)';
  if (screenName === 'maternal-uncles') return 'translate3d(calc(-66.6666666667% + 0px), calc(-33.3333333333% + 0px), 0)';
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
    const currentStage = getStage(root);
    currentStage?.style.removeProperty('transition');
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
  if (!root || !touch || !isCoreVisible(root)) {
    gestureStart = null;
    return;
  }

  gestureStart = { x: touch.clientX, y: touch.clientY, root };
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart || !isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - gestureStart.x;
  const deltaY = touch.clientY - gestureStart.y;
  if (Math.abs(deltaX) < 12 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) return;

  event.preventDefault();
  event.stopPropagation();
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

  const deltaX = touch.clientX - start.x;
  const deltaY = touch.clientY - start.y;
  if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  // Requisito do produto: dedo para a esquerda abre o ramo paterno;
  // dedo para a direita abre o ramo materno.
  applyScreen(start.root, deltaX < 0 ? 'paternal-uncles' : 'maternal-uncles');
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });
}

export {};