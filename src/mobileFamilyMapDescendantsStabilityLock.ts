const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const DESCENDANTS_SELECTOR = '[data-mobile-family-tree-screen="descendants"]';
const SCROLL_SELECTOR = '.mobile-family-descendant-screen__scroll, [data-stable-mobile-scroll="descendants"]';
const STYLE_ID = 'mobile-family-map-descendants-stability-lock-style';
const LOCK_ATTR = 'data-mobile-family-descendants-transform-lock';
const DESCENDANTS_TRANSFORM = 'translate3d(calc(-33.333333333333336% + 0px), calc(-66.66666666666667% + 0px), 0)';
const CORE_TRANSFORM = 'translate3d(calc(-33.333333333333336% + 0px), calc(-33.333333333333336% + 0px), 0)';
const NAVIGATION_THRESHOLD = 56;

let scheduled = false;
let touchStart: { x: number; y: number; inDescendants: boolean; scrollTop: number } | null = null;
let unlockUntil = 0;

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

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function getDescendantsScreen(root = getRoot()) {
  return root?.querySelector<HTMLElement>(DESCENDANTS_SELECTOR) ?? null;
}

function isDescendantTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(DESCENDANTS_SELECTOR));
}

function getScrollArea(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(SCROLL_SELECTOR);
}

function isDescendantsTransform(value: string) {
  return value.includes('-33.333333333333336%') && value.includes('-66.66666666666667%');
}

function setAttributeIfNeeded(element: HTMLElement, name: string, value: string) {
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function removeAttributeIfPresent(element: HTMLElement, name: string) {
  if (element.hasAttribute(name)) element.removeAttribute(name);
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      ${ROOT_SELECTOR}[${LOCK_ATTR}="true"] ${STAGE_SELECTOR} {
        transform: ${DESCENDANTS_TRANSFORM} !important;
        transition: none !important;
        will-change: transform !important;
      }

      ${ROOT_SELECTOR}[${LOCK_ATTR}="true"] ${DESCENDANTS_SELECTOR} {
        contain: layout paint style !important;
        backface-visibility: hidden !important;
        -webkit-backface-visibility: hidden !important;
        transform: translateZ(0) !important;
      }

      ${ROOT_SELECTOR}[${LOCK_ATTR}="true"] ${SCROLL_SELECTOR} {
        overscroll-behavior: contain !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
      }
    }
  `;

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
  }

  if (style.textContent !== css) style.textContent = css;
  if (document.head.lastElementChild !== style) document.head.appendChild(style);
}

function lockDescendants() {
  if (!isEnabled() || Date.now() < unlockUntil) return;
  const root = getRoot();
  const stage = getStage(root);
  const descendants = getDescendantsScreen(root);
  if (!root || !stage || !descendants) return;

  setAttributeIfNeeded(root, LOCK_ATTR, 'true');
  setAttributeIfNeeded(root, 'data-mobile-family-tree-active-screen', 'descendants');
  stage.style.setProperty('transform', DESCENDANTS_TRANSFORM, 'important');
  stage.style.setProperty('transition', 'none', 'important');
}

function unlockToCore() {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) return;

  unlockUntil = Date.now() + 700;
  removeAttributeIfPresent(root, LOCK_ATTR);
  setAttributeIfNeeded(root, 'data-mobile-family-tree-active-screen', 'core');
  stage.style.setProperty('transform', CORE_TRANSFORM, 'important');
  stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  window.setTimeout(() => getStage()?.style.removeProperty('transition'), 340);
}

function shouldLockFromCurrentState() {
  if (!isEnabled() || Date.now() < unlockUntil) return false;
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage || !getDescendantsScreen(root)) return false;

  return root.getAttribute(LOCK_ATTR) === 'true'
    || root.getAttribute('data-mobile-family-tree-active-screen') === 'descendants'
    || isDescendantsTransform(stage.style.transform || '');
}

function applyLockIfNeeded() {
  ensureStyles();
  if (shouldLockFromCurrentState()) lockDescendants();
}

function scheduleApplyLock() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyLockIfNeeded();
  });
}

function handleTouchStart(event: TouchEvent) {
  if (!isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const scrollArea = getScrollArea(event.target);
  touchStart = {
    x: touch.clientX,
    y: touch.clientY,
    inDescendants: isDescendantTarget(event.target),
    scrollTop: scrollArea?.scrollTop ?? 0,
  };

  if (touchStart.inDescendants) lockDescendants();
}

function handleTouchEnd(event: TouchEvent) {
  const start = touchStart;
  touchStart = null;
  if (!start?.inDescendants || !isEnabled()) return;

  const touch = event.changedTouches[0];
  if (!touch) {
    lockDescendants();
    return;
  }

  const deltaX = touch.clientX - start.x;
  const deltaY = touch.clientY - start.y;
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);

  // Dedo para baixo, partindo do topo: volta para core. Qualquer outro gesto mantém a tela travada em descendants.
  if (deltaY > 0 && absoluteY >= NAVIGATION_THRESHOLD && absoluteY > absoluteX * 1.2 && start.scrollTop <= 1) {
    unlockToCore();
    return;
  }

  lockDescendants();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  applyLockIfNeeded();
  [80, 240, 520, 1000].forEach((delay) => window.setTimeout(applyLockIfNeeded, delay));

  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: true });
  document.addEventListener('touchcancel', () => {
    touchStart = null;
    lockDescendants();
  }, { capture: true, passive: true });

  const observer = new MutationObserver(scheduleApplyLock);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'data-mobile-family-tree-active-screen', LOCK_ATTR],
  });

  window.addEventListener('resize', applyLockIfNeeded, { passive: true });
  window.addEventListener('orientationchange', applyLockIfNeeded, { passive: true });
  window.addEventListener('popstate', applyLockIfNeeded, { passive: true });
  document.addEventListener('visibilitychange', applyLockIfNeeded, { passive: true });
}

export {};
