const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const STYLE_ID = 'mobile-family-tree-scroll-and-visibility-fix-style';
const MOBILE_CARD_SELECTOR = '[data-family-map-mobile-card="true"]';
const SCROLL_SELECTOR = [
  '.mobile-family-descendant-screen__scroll',
  '[data-mobile-family-tree-uncle-scroll="true"]',
  '[data-mobile-family-tree-screen="paternal-uncles"] > div',
  '[data-mobile-family-tree-screen="maternal-uncles"] > div',
].join(',');

let touchStart: { x: number; y: number; scrollArea: HTMLElement | null } | null = null;

function isMobileFamilyMap() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname === FAMILY_MAP_PATH;
}

function getScrollArea(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(SCROLL_SELECTOR);
}

function maxScrollTop(scrollArea: HTMLElement) {
  return Math.max(0, scrollArea.scrollHeight - scrollArea.clientHeight);
}

function canScrollVertically(scrollArea: HTMLElement, deltaY: number) {
  const maxTop = maxScrollTop(scrollArea);
  if (maxTop <= 1) return false;

  // deltaY < 0: dedo sobe, conteúdo deve descer.
  if (deltaY < 0) return scrollArea.scrollTop < maxTop - 1;
  // deltaY > 0: dedo desce, conteúdo deve subir.
  if (deltaY > 0) return scrollArea.scrollTop > 1;

  return false;
}

function isDescendantScroll(scrollArea: HTMLElement | null) {
  return Boolean(scrollArea?.classList.contains('mobile-family-descendant-screen__scroll'));
}

function keepNativeScroll(event: TouchEvent) {
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function ensureStyles() {
  const existing = document.getElementById(STYLE_ID);
  existing?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      .mobile-family-descendant-screen {
        overflow: hidden !important;
      }

      .mobile-family-descendant-screen__scroll {
        display: block !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior-y: contain !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
      }

      .mobile-family-descendant-screen__inner {
        min-height: 100% !important;
        overflow: visible !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"],
      [data-mobile-family-tree-screen="maternal-uncles"] {
        position: relative !important;
        overflow: hidden !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] > div,
      [data-mobile-family-tree-screen="maternal-uncles"] > div {
        display: block !important;
        height: 100% !important;
        max-height: 100% !important;
        width: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior-y: contain !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
        padding: 1rem 0.75rem calc(env(safe-area-inset-bottom, 0px) + 7.25rem) !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] > div > div[class*="z-10"],
      [data-mobile-family-tree-screen="maternal-uncles"] > div > div[class*="z-10"] {
        display: flex !important;
        min-height: 100% !important;
        height: auto !important;
        width: min(calc(100vw - 2rem), 354px) !important;
        max-width: min(calc(100vw - 2rem), 354px) !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 auto !important;
        padding: 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section,
      [data-mobile-family-tree-screen="maternal-uncles"] section {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        margin-inline: auto !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section > div,
      [data-mobile-family-tree-screen="maternal-uncles"] section > div {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
        background: #fff !important;
        opacity: 1 !important;
        visibility: visible !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section h2,
      [data-mobile-family-tree-screen="maternal-uncles"] section h2 {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        color: #0f172a !important;
        -webkit-text-fill-color: #0f172a !important;
        font-size: 0.75rem !important;
        line-height: 1.15 !important;
        margin: 0 0 0.625rem !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] ${MOBILE_CARD_SELECTOR},
      [data-mobile-family-tree-screen="maternal-uncles"] ${MOBILE_CARD_SELECTOR} {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 20 !important;
        pointer-events: auto !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function markScrollAreas() {
  document
    .querySelectorAll<HTMLElement>('[data-mobile-family-tree-screen="paternal-uncles"] > div, [data-mobile-family-tree-screen="maternal-uncles"] > div')
    .forEach((scrollArea) => {
      scrollArea.setAttribute('data-mobile-tree-scroll', 'true');
      scrollArea.setAttribute('data-mobile-family-tree-uncle-scroll', 'true');
    });
}

function applyFixes() {
  if (!isMobileFamilyMap()) return;
  ensureStyles();
  markScrollAreas();
}

function handleTouchStart(event: TouchEvent) {
  if (!isMobileFamilyMap()) return;
  const touch = event.touches[0];
  if (!touch) return;

  touchStart = {
    x: touch.clientX,
    y: touch.clientY,
    scrollArea: getScrollArea(event.target),
  };
}

function handleTouchMove(event: TouchEvent) {
  if (!touchStart || !isMobileFamilyMap()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const scrollArea = getScrollArea(event.target) ?? touchStart.scrollArea;
  if (!scrollArea) return;

  const deltaY = touch.clientY - touchStart.y;
  const absY = Math.abs(deltaY);
  const absX = Math.abs(touch.clientX - touchStart.x);
  if (absY <= absX * 1.2 || absY < 6) return;

  if (canScrollVertically(scrollArea, deltaY)) {
    keepNativeScroll(event);
    return;
  }

  // Na tela descendants, impedir que o swipe do stage capture a rolagem quando o usuário está rolando a lista.
  if (isDescendantScroll(scrollArea) && deltaY < 0) keepNativeScroll(event);
}

function handleTouchEnd(event: TouchEvent) {
  if (!touchStart || !isMobileFamilyMap()) {
    touchStart = null;
    return;
  }

  const touch = event.changedTouches[0];
  const start = touchStart;
  touchStart = null;
  if (!touch || !start.scrollArea) return;

  const deltaY = touch.clientY - start.y;
  if (canScrollVertically(start.scrollArea, deltaY) || (isDescendantScroll(start.scrollArea) && deltaY < 0)) {
    keepNativeScroll(event);
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyFixes();
  [120, 360, 900, 1600].forEach((delay) => window.setTimeout(applyFixes, delay));

  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', () => { touchStart = null; }, { capture: true, passive: true });

  window.addEventListener('resize', applyFixes, { passive: true });
  window.addEventListener('orientationchange', applyFixes, { passive: true });
  document.addEventListener('visibilitychange', applyFixes, { passive: true });
}

export {};
