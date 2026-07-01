const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const STYLE_ID = 'mobile-family-map-descendant-connector-height-fix-style';

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function ensureStyles() {
  if (!isEnabled()) return;

  const css = `
    @media (max-width: 767px) {
      .mobile-family-descendant-screen__connector {
        box-sizing: border-box !important;
        height: 3.15rem !important;
        min-height: 3.15rem !important;
        margin-bottom: 0.35rem !important;
      }

      .mobile-family-descendant-screen__connector[class~="h-9"],
      .mobile-family-descendant-screen__connector [class~="h-9"] {
        height: 3.15rem !important;
        min-height: 3.15rem !important;
      }

      .mobile-family-descendant-screen__connector [class~="h-full"] {
        height: 100% !important;
        min-height: 100% !important;
      }

      .mobile-family-descendant-screen__connector [class~="top-0"][class~="bottom-0"] {
        top: 0 !important;
        bottom: 0 !important;
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

function scheduleEnsureStyles() {
  window.requestAnimationFrame(ensureStyles);
  window.setTimeout(ensureStyles, 160);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  [80, 240, 520].forEach((delay) => window.setTimeout(ensureStyles, delay));
  window.addEventListener('resize', ensureStyles, { passive: true });
  window.addEventListener('orientationchange', ensureStyles, { passive: true });
  window.addEventListener('popstate', scheduleEnsureStyles, { passive: true });
}

export {};
