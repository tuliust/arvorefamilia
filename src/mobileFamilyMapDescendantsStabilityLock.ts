const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const DESCENDANTS_SELECTOR = '[data-mobile-family-tree-screen="descendants"]';
const SCROLL_SELECTOR = '.mobile-family-descendant-screen__scroll, [data-stable-mobile-scroll="descendants"], [data-mobile-family-tree-screen="descendants"] [data-mobile-tree-scroll]';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-map-descendants-stability-lock-style';
const LOCK_ATTR = 'data-mobile-family-descendants-transform-lock';
const DESCENDANTS_TRANSFORM = 'translate3d(calc(-33.333333333333336% + 0px), calc(-66.66666666666667% + 0px), 0)';
const CORE_TRANSFORM = 'translate3d(calc(-33.333333333333336% + 0px), calc(-33.333333333333336% + 0px), 0)';
const NAVIGATION_THRESHOLD = 56;
const MOVEMENT_THRESHOLD = 1;

let scheduled = false;
let touchStart: { x: number; y: number; inDescendants: boolean; scrollArea: HTMLElement | null } | null = null;
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

function isOverviewOpen() {
  return Boolean(document.getElementById(OVERVIEW_ID));
}

function isDescendantTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(DESCENDANTS_SELECTOR));
}

function getScrollArea(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(SCROLL_SELECTOR);
}

function maxScrollTop(scrollArea: HTMLElement | null) {
  if (!scrollArea) return 0;
  return Math.max(0, scrollArea.scrollHeight - scrollArea.clientHeight);
}

function isAtTop(scrollArea: HTMLElement | null) {
  return !scrollArea || scrollArea.scrollTop <= 1;
}

function canScrollVertically(scrollArea: HTMLElement | null, deltaY: number) {
  const maxTop = maxScrollTop(scrollArea);
  if (!scrollArea || maxTop <= 1) return false;

  // deltaY < 0: dedo sobe; o conteúdo ainda pode rolar para baixo.
  if (deltaY < 0) return scrollArea.scrollTop < maxTop - 1;
  // deltaY > 0: dedo desce; o conteúdo ainda pode rolar para cima.
  if (deltaY > 0) return scrollArea.scrollTop > 1;

  return false;
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

function setImportantStyleIfNeeded(element: HTMLElement, property: string, value: string) {
  if (element.style.getPropertyValue(property) === value && element.style.getPropertyPriority(property) === 'important') return;
  element.style.setProperty(property, value, 'important');
}

function stopCompetingHandlers(event: TouchEvent, prevent = true) {
  if (prevent) event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      ${ROOT_SELECTOR}[${LOCK_ATTR}="true"] ${STAGE_SELECTOR} {
        transform: ${DESCENDANTS_TRANSFORM} !important;
        transition: none !important;
        will-change: auto !important;
      }

      ${ROOT_SELECTOR}[${LOCK_ATTR}="true"] ${DESCENDANTS_SELECTOR} {
        contain: layout paint style !important;
        backface-visibility: hidden !important;
        -webkit-backface-visibility: hidden !important;
        transform: translateZ(0) !important;
      }

      ${ROOT_SELECTOR}[${LOCK_ATTR}="true"] ${SCROLL_SELECTOR} {
        overscroll-behavior: none !important;
        -webkit-overflow-scrolling: auto !important;
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

function pauseLockForOverview() {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage || !isOverviewOpen()) return;

  removeAttributeIfPresent(root, LOCK_ATTR);
  setImportantStyleIfNeeded(stage, 'transition', 'none');
}

function lockDescendants() {
  if (!isEnabled() || Date.now() < unlockUntil || isOverviewOpen()) return;
  const root = getRoot();
  const stage = getStage(root);
  const descendants = getDescendantsScreen(root);
  if (!root || !stage || !descendants) return;

  setAttributeIfNeeded(root, LOCK_ATTR, 'true');
  setAttributeIfNeeded(root, 'data-mobile-family-tree-active-screen', 'descendants');
  setImportantStyleIfNeeded(stage, 'transform', DESCENDANTS_TRANSFORM);
  setImportantStyleIfNeeded(stage, 'transition', 'none');
}

function unlockToCore() {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) return;

  unlockUntil = Date.now() + 900;
  removeAttributeIfPresent(root, LOCK_ATTR);
  setAttributeIfNeeded(root, 'data-mobile-family-tree-active-screen', 'core');
  setImportantStyleIfNeeded(stage, 'transform', CORE_TRANSFORM);
  setImportantStyleIfNeeded(stage, 'transition', 'transform 300ms ease-out');
  window.setTimeout(() => getStage()?.style.removeProperty('transition'), 340);
}

function shouldLockFromCurrentState() {
  if (!isEnabled() || Date.now() < unlockUntil || isOverviewOpen()) return false;
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage || !getDescendantsScreen(root)) return false;

  return root.getAttribute(LOCK_ATTR) === 'true'
    || root.getAttribute('data-mobile-family-tree-active-screen') === 'descendants'
    || isDescendantsTransform(stage.style.transform || '');
}

function applyLockIfNeeded() {
  ensureStyles();
  if (isOverviewOpen()) {
    pauseLockForOverview();
    return;
  }
  if (shouldLockFromCurrentState()) lockDescendants();
}

function scheduleApplyLock() {
  if (scheduled || touchStart?.inDescendants) return;
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

  if (isOverviewOpen()) {
    pauseLockForOverview();
    touchStart = null;
    return;
  }

  const inDescendants = isDescendantTarget(event.target);
  touchStart = {
    x: touch.clientX,
    y: touch.clientY,
    inDescendants,
    scrollArea: getScrollArea(event.target),
  };

  if (inDescendants) {
    lockDescendants();
    // Bloqueia handlers concorrentes de navegação, mas preserva o scroll nativo do conteúdo.
    stopCompetingHandlers(event, false);
  }
}

function handleTouchMove(event: TouchEvent) {
  const start = touchStart;
  if (!start?.inDescendants || !isEnabled()) return;

  if (isOverviewOpen()) {
    pauseLockForOverview();
    return;
  }

  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - start.x;
  const deltaY = touch.clientY - start.y;
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);
  const scrollArea = getScrollArea(event.target) ?? start.scrollArea;
  const isVertical = absoluteY >= MOVEMENT_THRESHOLD && absoluteY > absoluteX * 1.2;
  const isHorizontal = absoluteX >= MOVEMENT_THRESHOLD && absoluteX > absoluteY * 1.2;

  if (!isVertical && !isHorizontal) {
    stopCompetingHandlers(event, false);
    return;
  }

  if (isVertical && canScrollVertically(scrollArea, deltaY)) {
    // Deixa somente o scroll interno acontecer. Não reaplica transform a cada frame para evitar microtremor.
    stopCompetingHandlers(event, false);
    return;
  }

  // No topo/fundo da rolagem ou em gestos horizontais, elimina bounce e deslocamento do stage.
  lockDescendants();
  stopCompetingHandlers(event);
}

function handleTouchEnd(event: TouchEvent) {
  const start = touchStart;
  touchStart = null;
  if (!start?.inDescendants || !isEnabled()) return;

  if (isOverviewOpen()) {
    pauseLockForOverview();
    return;
  }

  const touch = event.changedTouches[0];
  if (!touch) {
    lockDescendants();
    return;
  }

  const deltaX = touch.clientX - start.x;
  const deltaY = touch.clientY - start.y;
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);
  const scrollArea = getScrollArea(event.target) ?? start.scrollArea;

  if (deltaY > 0 && absoluteY >= NAVIGATION_THRESHOLD && absoluteY > absoluteX * 1.2 && isAtTop(scrollArea)) {
    stopCompetingHandlers(event);
    unlockToCore();
    return;
  }

  if (absoluteX >= MOVEMENT_THRESHOLD || absoluteY >= MOVEMENT_THRESHOLD) stopCompetingHandlers(event);
  lockDescendants();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  applyLockIfNeeded();
  [80, 240, 520, 1000].forEach((delay) => window.setTimeout(applyLockIfNeeded, delay));

  window.addEventListener('touchstart', handleTouchStart, { capture: true, passive: false });
  window.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  window.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  window.addEventListener('touchcancel', () => {
    touchStart = null;
    if (isOverviewOpen()) pauseLockForOverview();
    else lockDescendants();
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
