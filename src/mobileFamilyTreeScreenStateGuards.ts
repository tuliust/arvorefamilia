const MOBILE_QUERY = '(max-width: 767px)';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const TRACKED_ATTRIBUTES = new Set([
  'data-mobile-family-tree-active-screen',
  'data-mobile-family-tree-descendants-ready',
]);

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

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === '/mapa-familiar';
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

function getTransformForScreen(screen: MobileTreeScreen) {
  const position = SCREEN_POSITIONS[screen];
  return `translate3d(calc(${-position.column * (100 / 3)}% + 0px), calc(${-position.row * (100 / 3)}% + 0px), 0)`;
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

function isScreenCurrent(screen: MobileTreeScreen, transform: string) {
  const currentPosition = parseTranslatePercent(transform);
  if (!currentPosition) return true;

  const expectedPosition = SCREEN_POSITIONS[screen];
  return expectedPosition.column === currentPosition.column && expectedPosition.row === currentPosition.row;
}

function hasReadyDescendantScreen(root: HTMLElement) {
  if (root.getAttribute('data-mobile-family-tree-descendants-ready') === 'true') return true;

  const descendantScreen = root.querySelector<HTMLElement>('[data-mobile-family-tree-screen="descendants"]');
  return Boolean(
    descendantScreen?.querySelector('[data-stable-mobile-scroll="descendants"], .mobile-family-descendant-screen__scroll'),
  );
}

function lockDescendantTransform(root: HTMLElement, stage: HTMLElement) {
  if (!hasReadyDescendantScreen(root)) return false;

  stage.style.setProperty('transform', getTransformForScreen('descendants'), 'important');
  stage.style.setProperty('transition', 'none', 'important');
  stage.style.setProperty('will-change', 'auto', 'important');
  return true;
}

function clearStaleScreenAttribute() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) return;

  const screen = root.getAttribute('data-mobile-family-tree-active-screen');
  if (!screen || !isMobileTreeScreen(screen)) return;

  if (screen === 'descendants' && lockDescendantTransform(root, stage)) return;

  const transform = stage.style.transform || '';
  if (!isScreenCurrent(screen, transform)) {
    root.removeAttribute('data-mobile-family-tree-active-screen');
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof Element !== 'undefined') {
  const nativeSetAttribute = Element.prototype.setAttribute;

  Element.prototype.setAttribute = function guardedSetAttribute(this: Element, name: string, value: string) {
    const nextValue = String(value);
    if (TRACKED_ATTRIBUTES.has(name) && this.getAttribute(name) === nextValue) return;
    nativeSetAttribute.call(this, name, nextValue);
  };

  document.addEventListener('click', () => {
    window.setTimeout(clearStaleScreenAttribute, 120);
  }, { capture: true });

  document.addEventListener('touchend', () => {
    window.setTimeout(clearStaleScreenAttribute, 360);
  }, { capture: true, passive: true });

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(clearStaleScreenAttribute);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
}

export {};
