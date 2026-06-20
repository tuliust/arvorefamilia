const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STYLE_ID = 'mobile-family-tree-uncle-sizing-fix-style';
const UNCLE_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="paternal-uncles"], [data-mobile-family-tree-screen="maternal-uncles"]';

const UNCLE_TITLES: Record<string, string> = {
  'paternal-uncles': 'Tios Paternos',
  'maternal-uncles': 'Tios Maternos',
};

function isMobileFamilyMap() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname === FAMILY_MAP_PATH;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${UNCLE_SCREEN_SELECTOR} {
        overflow: visible !important;
      }

      ${UNCLE_SCREEN_SELECTOR} > div {
        overflow: visible !important;
      }

      ${UNCLE_SCREEN_SELECTOR} > div > div[class*="z-10"] {
        align-items: center !important;
        max-width: 390px !important;
        min-height: 100% !important;
        height: 100% !important;
        padding-top: 1.5rem !important;
        padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8rem) !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section {
        display: block !important;
        height: auto !important;
        min-height: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section > div {
        display: block !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
        border-radius: 1.4rem !important;
        border-width: 1px !important;
        padding: 0.75rem !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section h2 {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        margin: 0 0 0.75rem !important;
        overflow: visible !important;
        color: #0f172a !important;
        text-align: center !important;
        font-size: 0.875rem !important;
        line-height: 1.2 !important;
        font-weight: 800 !important;
        letter-spacing: 0.08em !important;
        text-transform: uppercase !important;
        white-space: nowrap !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section h2 + div {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        align-items: start !important;
        align-content: start !important;
        gap: 0.625rem !important;
        min-height: 0 !important;
        overflow: visible !important;
      }

      ${UNCLE_SCREEN_SELECTOR} [data-family-map-mobile-card="true"] {
        height: 82px !important;
        min-height: 82px !important;
        width: 100% !important;
        border-radius: 1.1rem !important;
        padding: 0.5rem 0.625rem !important;
        gap: 0.5rem !important;
      }

      ${UNCLE_SCREEN_SELECTOR} [data-family-map-mobile-card="true"] > span:last-child > span:first-child {
        font-size: 0.6875rem !important;
        line-height: 1.05 !important;
        letter-spacing: 0 !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function normalizeTitle(screenName: string, screen: HTMLElement) {
  const title = UNCLE_TITLES[screenName];
  if (!title) return;

  const heading = screen.querySelector<HTMLElement>('section h2');
  if (!heading) return;

  if (heading.textContent?.trim() !== title) heading.textContent = title;
  heading.setAttribute('aria-label', title);
}

function applyUncleSizing() {
  if (!isMobileFamilyMap()) return;

  ensureStyles();

  document.querySelectorAll<HTMLElement>(UNCLE_SCREEN_SELECTOR).forEach((screen) => {
    const screenName = screen.getAttribute('data-mobile-family-tree-screen') ?? '';
    normalizeTitle(screenName, screen);
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyUncleSizing();
  [120, 360, 900].forEach((delay) => window.setTimeout(applyUncleSizing, delay));

  window.addEventListener('resize', applyUncleSizing, { passive: true });
  window.addEventListener('orientationchange', applyUncleSizing, { passive: true });
  document.addEventListener('visibilitychange', applyUncleSizing, { passive: true });
  document.addEventListener('touchend', () => window.setTimeout(applyUncleSizing, 80), { capture: true, passive: true });
}

export {};
