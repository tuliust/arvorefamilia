const MOBILE_QUERY = '(max-width: 767px)';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const SCROLL_AREA_SELECTOR = '[data-mobile-tree-scroll]';
const INTERACTIVE_CONTROL_SELECTOR = 'header, [data-mobile-family-map-toolbar], [data-tree-export-ignore="true"]';
const STYLE_ID = 'static-mobile-family-tree-screens-style';

let gestureStart: { x: number; y: number } | null = null;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === '/mapa-familiar';
}

function isInteractiveControlTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_CONTROL_SELECTOR));
}

function findRoot(target: EventTarget | null) {
  if (!(target instanceof Element) || isInteractiveControlTarget(target)) return null;
  return target.closest<HTMLElement>(ROOT_SELECTOR);
}

function findMobileTreeScrollArea(target: EventTarget | null) {
  if (!(target instanceof Element) || isInteractiveControlTarget(target)) return null;
  return target.closest<HTMLElement>(SCROLL_AREA_SELECTOR);
}

function shouldLockMobileTree(target: EventTarget | null) {
  return isMobileViewport() && isFamilyMapPath() && Boolean(findRoot(target));
}

function canScrollVertically(scrollElement: HTMLElement, deltaY: number) {
  const canScrollDown = scrollElement.scrollTop + scrollElement.clientHeight < scrollElement.scrollHeight - 1;
  const canScrollUp = scrollElement.scrollTop > 1;

  // deltaY < 0: dedo sobe, conteúdo desce. deltaY > 0: dedo desce, conteúdo sobe.
  if (deltaY < 0) return canScrollDown;
  if (deltaY > 0) return canScrollUp;
  return false;
}

function ensureStaticScreenStyles() {
  if (typeof document === 'undefined') return;

  const existingStyle = document.getElementById(STYLE_ID);
  existingStyle?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${ROOT_SELECTOR} {
        touch-action: pan-y pinch-zoom !important;
        overscroll-behavior: none !important;
      }

      ${ROOT_SELECTOR} ${STAGE_SELECTOR} {
        will-change: transform;
      }

      ${ROOT_SELECTOR} ${SCROLL_AREA_SELECTOR} {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior-y: contain !important;
        overscroll-behavior-x: none !important;
        touch-action: pan-y !important;
        -webkit-overflow-scrolling: touch !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function resetStageDragPreview() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;

  const stage = document.querySelector<HTMLElement>(`${ROOT_SELECTOR} ${STAGE_SELECTOR}`);
  if (!stage) return;

  const transform = stage.style.transform;
  if (!transform || !transform.includes('px')) return;

  stage.style.transform = transform
    .replace(/\s*\+\s*-?\d+(?:\.\d+)?px/g, '')
    .replace(/\s*-\s*-?\d+(?:\.\d+)?px/g, '');
}

function handleTouchStart(event: TouchEvent) {
  if (!shouldLockMobileTree(event.target)) return;

  const touch = event.touches[0];
  if (!touch) return;

  gestureStart = {
    x: touch.clientX,
    y: touch.clientY,
  };
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart || !shouldLockMobileTree(event.target)) return;

  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - gestureStart.x;
  const deltaY = touch.clientY - gestureStart.y;
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);

  if (absoluteX < 6 && absoluteY < 6) return;

  const scrollElement = findMobileTreeScrollArea(event.target);
  const isVerticalGesture = absoluteY > absoluteX * 1.15;

  if (scrollElement && isVerticalGesture && canScrollVertically(scrollElement, deltaY)) {
    resetStageDragPreview();
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  resetStageDragPreview();
}

function handleTouchEnd(event: TouchEvent) {
  if (shouldLockMobileTree(event.target)) {
    window.requestAnimationFrame(resetStageDragPreview);
  }
  gestureStart = null;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStaticScreenStyles();

  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: true });
  document.addEventListener('touchcancel', handleTouchEnd, { capture: true, passive: true });
  window.addEventListener('resize', ensureStaticScreenStyles, { passive: true });
}

export {};