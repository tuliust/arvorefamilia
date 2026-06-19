const MOBILE_QUERY = '(max-width: 767px)';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const TRACKED_ATTRIBUTES = new Set([
  'data-mobile-family-tree-active-screen',
  'data-mobile-family-tree-descendants-ready',
]);

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

function isCoreTransform(transform: string) {
  return transform.includes('-33.3333333333%') && !transform.includes('-66.6666666667%');
}

function clearStaleCoreAttribute() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) return;

  if (root.getAttribute('data-mobile-family-tree-active-screen') !== 'core') return;
  if (!isCoreTransform(stage.style.transform || '')) {
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
    window.setTimeout(clearStaleCoreAttribute, 120);
  }, { capture: true });

  document.addEventListener('touchend', () => {
    window.setTimeout(clearStaleCoreAttribute, 360);
  }, { capture: true, passive: true });

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(clearStaleCoreAttribute);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
}

export {};
