const STYLE_ID = 'mobile-family-tree-top-controls-fix-style';
const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATHS = new Set(['/mapa-familiar', '/mapa-familiar-horizontal']);
const HIT_TARGET_SELECTOR = 'header button, header a, [data-mobile-family-map-toolbar="true"] button';
const ACTIVATION_DEBOUNCE_MS = 280;

let lastActivationAt = 0;
let lastActivatedElement: HTMLElement | null = null;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && FAMILY_MAP_PATHS.has(window.location.pathname);
}

function shouldHandleTopControls() {
  return isMobileViewport() && isFamilyMapPath();
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      header,
      header * {
        pointer-events: auto !important;
      }

      header {
        position: relative !important;
        z-index: 10500 !important;
      }

      [data-mobile-family-map-toolbar="true"] {
        z-index: 10600 !important;
        pointer-events: auto !important;
        isolation: isolate !important;
        padding-bottom: 0.5rem !important;
      }

      [data-mobile-family-map-toolbar="true"] *,
      [data-mobile-family-map-toolbar="true"] button {
        pointer-events: auto !important;
        touch-action: manipulation !important;
      }

      [data-mobile-family-map-toolbar="true"] button,
      header button,
      header a {
        position: relative !important;
        z-index: 2 !important;
        pointer-events: auto !important;
        touch-action: manipulation !important;
      }

      [data-mobile-family-map-toolbar="true"] ~ [data-tree-export-ignore="true"].fixed {
        z-index: 12060 !important;
        top: calc(env(safe-area-inset-top, 0px) + 8.65rem) !important;
        pointer-events: auto !important;
      }

      [data-mobile-family-map-toolbar="true"] ~ [data-tree-export-ignore="true"].fixed *,
      [data-mobile-family-map-toolbar="true"] ~ [data-tree-export-ignore="true"].fixed button,
      [data-mobile-family-map-toolbar="true"] ~ [data-tree-export-ignore="true"].fixed select {
        pointer-events: auto !important;
        touch-action: manipulation !important;
      }

      [data-tree-export-ignore="true"] {
        pointer-events: auto !important;
      }

      #mobile-family-tree-overview-mode,
      .tree-mobile-controls-modal {
        z-index: 12050 !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function getEventPoint(event: Event) {
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    const touch = event.changedTouches[0] || event.touches[0];
    if (!touch) return null;
    return { x: touch.clientX, y: touch.clientY };
  }

  if (
    (typeof PointerEvent !== 'undefined' && event instanceof PointerEvent)
    || event instanceof MouseEvent
  ) {
    return { x: event.clientX, y: event.clientY };
  }

  return null;
}

function findHitTarget(point: { x: number; y: number }) {
  const directTarget = document.elementFromPoint(point.x, point.y);
  const directButton = directTarget instanceof Element
    ? directTarget.closest<HTMLElement>(HIT_TARGET_SELECTOR)
    : null;

  if (directButton) return { element: directButton, direct: true };

  const fallbackButton = Array.from(document.querySelectorAll<HTMLElement>(HIT_TARGET_SELECTOR)).find((candidate) => {
    const rect = candidate.getBoundingClientRect();
    return point.x >= rect.left
      && point.x <= rect.right
      && point.y >= rect.top
      && point.y <= rect.bottom;
  }) ?? null;

  return fallbackButton ? { element: fallbackButton, direct: false } : null;
}

function triggerElement(element: HTMLElement) {
  window.setTimeout(() => {
    element.click();
  }, 0);
}

function handleTopControlActivation(event: Event) {
  if (!shouldHandleTopControls()) return;

  const point = getEventPoint(event);
  if (!point) return;

  const target = findHitTarget(point);
  if (!target) return;

  if (target.direct) return;

  const now = Date.now();
  if (target.element === lastActivatedElement && now - lastActivationAt < ACTIVATION_DEBOUNCE_MS) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return;
  }

  lastActivatedElement = target.element;
  lastActivationAt = now;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  triggerElement(target.element);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  document.addEventListener('touchend', handleTopControlActivation, { capture: true, passive: false });
  document.addEventListener('pointerup', handleTopControlActivation, { capture: true });
  window.addEventListener('resize', ensureStyles, { passive: true });
  window.addEventListener('orientationchange', ensureStyles, { passive: true });
  window.addEventListener('focus', ensureStyles, { passive: true });
  [80, 300, 900].forEach((delay) => window.setTimeout(ensureStyles, delay));
}

export {};