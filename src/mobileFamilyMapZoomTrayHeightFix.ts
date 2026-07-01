const MOBILE_QUERY = '(max-width: 767px)';
const STYLE_ID = 'mobile-family-map-zoom-tray-height-fix-style';

function isMobileMapRoute() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && ['/mapa-familiar', '/linha-geracional'].includes(window.location.pathname.replace(/\/$/, ''));
}

function ensureStyles() {
  if (!isMobileMapRoute()) return;

  const css = `
    @media (max-width: 767px) {
      [data-mobile-family-map-context-action="zoom"] {
        bottom: auto !important;
        height: auto !important;
        min-height: 0 !important;
        padding-bottom: 0.5rem !important;
      }

      [data-mobile-family-map-context-action="zoom"] [data-mobile-family-map-inline-overview="true"] {
        height: auto !important;
        max-height: min(25.75rem, calc(100dvh - 13.35rem)) !important;
      }
    }
  `;

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
  }

  if (style.textContent !== css) style.textContent = css;
  if (!style.parentElement) document.head.appendChild(style);
}

function scheduleEnsureStyles() {
  window.requestAnimationFrame(ensureStyles);
  window.setTimeout(ensureStyles, 120);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  [80, 240, 520].forEach((delay) => window.setTimeout(ensureStyles, delay));
  window.addEventListener('resize', ensureStyles, { passive: true });
  window.addEventListener('orientationchange', ensureStyles, { passive: true });
  window.addEventListener('popstate', scheduleEnsureStyles, { passive: true });
}

export {};
