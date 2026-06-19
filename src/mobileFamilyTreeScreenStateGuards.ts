const MOBILE_QUERY = '(max-width: 767px)';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const TRACKED_ATTRIBUTES = new Set([
  'data-mobile-family-tree-active-screen',
  'data-mobile-family-tree-descendants-ready',
]);

const TOP_SCREENS = new Set(['ancestors', 'paternal-ancestors', 'maternal-ancestors']);

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === '/mapa-familiar';
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function transformHasRow(transform: string, row: 0 | 1 | 2) {
  if (row === 0) return transform.includes('calc(0%') || transform.includes('calc(-0%');
  if (row === 1) return transform.includes('calc(-33.3333333333%') || transform.includes('calc(-33.333333333333336%');
  return transform.includes('calc(-66.6666666667%') || transform.includes('calc(-66.66666666666667%');
}

function transformHasColumn(transform: string, column: 1) {
  if (column === 1) return transform.includes('translate3d(calc(-33.3333333333%') || transform.includes('translate3d(calc(-33.333333333333336%');
  return false;
}

function clearStaleScreenAttribute() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) return;

  const screen = root.getAttribute('data-mobile-family-tree-active-screen');
  if (!screen) return;

  const transform = stage.style.transform || '';
  const isTopScreenCurrent = TOP_SCREENS.has(screen) && transformHasRow(transform, 0);
  const isCoreCurrent = screen === 'core' && transformHasColumn(transform, 1) && transformHasRow(transform, 1);
  const isDescendantsCurrent = screen === 'descendants' && transformHasColumn(transform, 1) && transformHasRow(transform, 2);

  if (!isTopScreenCurrent && !isCoreCurrent && !isDescendantsCurrent) {
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
