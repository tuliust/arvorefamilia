const MOBILE_QUERY = '(max-width: 767px)';
const MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const DESCENDANTS_SELECTOR = '[data-mobile-family-tree-screen="descendants"]';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-map-mobile-loop-and-line-fix-style';
const SETTLED_ATTR = 'data-mobile-family-descendants-settled';
const DESCENDANTS_TRANSFORM = 'translate3d(calc(-33.333333333333336% + 0px), calc(-66.66666666666667% + 0px), 0)';
const CORE_TRANSFORM = 'translate3d(calc(-33.333333333333336% + 0px), calc(-33.333333333333336% + 0px), 0)';
const NAVIGATION_THRESHOLD = 56;

let gestureStart: { x: number; y: number; screen: string | null } | null = null;
let descendantsSettleUntil = 0;
let scheduled = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && isMobileViewport()
    && window.location.pathname.replace(/\/$/, '') === MAP_PATH;
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function hasDescendantsScreen(root = getRoot()) {
  return Boolean(root?.querySelector(DESCENDANTS_SELECTOR));
}

function isOverviewOpen() {
  return Boolean(document.getElementById(OVERVIEW_ID));
}

function currentScreen(root = getRoot()) {
  return root?.getAttribute('data-mobile-family-tree-active-screen') ?? null;
}

function transformLooksLikeDescendants(value: string) {
  return value.includes('-33.333') && value.includes('-66.666');
}

function setImportantStyleIfNeeded(element: HTMLElement, property: string, value: string) {
  if (element.style.getPropertyValue(property) === value && element.style.getPropertyPriority(property) === 'important') return;
  element.style.setProperty(property, value, 'important');
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      .mobile-family-deep-ancestor-screen--maternal,
      .mobile-family-deep-ancestor-screen--maternal .mobile-family-deep-ancestor-screen__scroll,
      .mobile-family-deep-ancestor-screen--maternal .mobile-family-deep-ancestor-screen__inner {
        overflow: visible !important;
      }

      .mobile-family-deep-ancestor-screen--maternal .mobile-family-deep-ancestor-screen__inner::before {
        right: 100% !important;
        width: 120vw !important;
      }

      .mobile-family-deep-ancestor-screen--paternal .mobile-family-deep-ancestor-screen__inner::after {
        left: 100% !important;
        width: 120vw !important;
      }

      ${ROOT_SELECTOR}[${SETTLED_ATTR}="true"] ${STAGE_SELECTOR} {
        transform: ${DESCENDANTS_TRANSFORM} !important;
        transition: none !important;
        will-change: auto !important;
      }

      ${ROOT_SELECTOR}[${SETTLED_ATTR}="true"] ${DESCENDANTS_SELECTOR} {
        contain: layout paint style !important;
        transform: translateZ(0) !important;
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

function lockPageBounce() {
  document.documentElement.style.setProperty('overscroll-behavior', 'none');
  document.body.style.setProperty('overscroll-behavior', 'none');
}

function releasePageBounce() {
  document.documentElement.style.removeProperty('overscroll-behavior');
  document.body.style.removeProperty('overscroll-behavior');
}

function releaseDescendantsSettlement(root = getRoot()) {
  root?.removeAttribute(SETTLED_ATTR);
  releasePageBounce();
}

function settleDescendants() {
  if (!isEnabled() || isOverviewOpen()) return;
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage || !hasDescendantsScreen(root)) return;

  root.setAttribute(SETTLED_ATTR, 'true');
  root.setAttribute('data-mobile-family-tree-active-screen', 'descendants');
  setImportantStyleIfNeeded(stage, 'transform', DESCENDANTS_TRANSFORM);
  setImportantStyleIfNeeded(stage, 'transition', 'none');
  lockPageBounce();
}

function scheduleDescendantsSettlement(duration = 1100) {
  descendantsSettleUntil = Math.max(descendantsSettleUntil, Date.now() + duration);
  [0, 40, 120, 260, 520, 900].forEach((delay) => window.setTimeout(settleDescendants, delay));
}

function reconcileState() {
  ensureStyles();

  if (!isEnabled() || isOverviewOpen()) {
    releaseDescendantsSettlement();
    return;
  }

  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) {
    releasePageBounce();
    return;
  }

  const screen = currentScreen(root);
  const isDescendants = screen === 'descendants' || transformLooksLikeDescendants(stage.style.transform || '');
  const isCore = screen === 'core' || stage.style.transform === CORE_TRANSFORM;

  if (isDescendants && hasDescendantsScreen(root)) {
    if (Date.now() < descendantsSettleUntil || root.getAttribute(SETTLED_ATTR) === 'true') {
      settleDescendants();
    }
    return;
  }

  if (isCore || screen !== 'descendants') {
    releaseDescendantsSettlement(root);
  }
}

function scheduleReconcile() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    reconcileState();
  });
}

function handleTouchStart(event: TouchEvent) {
  if (!isEnabled()) return;
  const target = event.target instanceof Element ? event.target : null;
  const touch = event.touches[0];
  if (!touch || !target?.closest(ROOT_SELECTOR)) return;

  gestureStart = {
    x: touch.clientX,
    y: touch.clientY,
    screen: currentScreen(),
  };
}

function handleTouchEnd(event: TouchEvent) {
  const start = gestureStart;
  gestureStart = null;
  if (!start || !isEnabled()) return;

  const touch = event.changedTouches[0];
  if (!touch) return;

  const deltaX = touch.clientX - start.x;
  const deltaY = touch.clientY - start.y;
  const isVertical = Math.abs(deltaY) >= NAVIGATION_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX) * 1.2;

  if (start.screen === 'core' && deltaY < 0 && isVertical) {
    scheduleDescendantsSettlement();
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  reconcileState();
  [80, 240, 520, 1000].forEach((delay) => window.setTimeout(reconcileState, delay));

  window.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  window.addEventListener('touchend', handleTouchEnd, { capture: true, passive: true });
  window.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });
  window.addEventListener('resize', reconcileState, { passive: true });
  window.addEventListener('orientationchange', reconcileState, { passive: true });
  window.addEventListener('popstate', reconcileState, { passive: true });

  const observer = new MutationObserver(scheduleReconcile);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'data-mobile-family-tree-active-screen', SETTLED_ATTR],
  });
}

export {};
