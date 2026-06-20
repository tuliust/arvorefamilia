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
  const existing = document.getElementById(STYLE_ID);
  existing?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${UNCLE_SCREEN_SELECTOR} {
        position: relative !important;
        overflow: hidden !important;
      }

      ${UNCLE_SCREEN_SELECTOR} > div {
        box-sizing: border-box !important;
        position: absolute !important;
        inset: 0 !important;
        display: block !important;
        height: 100% !important;
        width: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior-y: contain !important;
        -webkit-overflow-scrolling: touch !important;
        padding: 1rem 0.75rem calc(env(safe-area-inset-bottom, 0px) + 7.25rem) !important;
      }

      ${UNCLE_SCREEN_SELECTOR} > div > div[class*="z-10"] {
        box-sizing: border-box !important;
        display: flex !important;
        width: min(calc(100vw - 2rem), 354px) !important;
        max-width: min(calc(100vw - 2rem), 354px) !important;
        height: auto !important;
        min-height: 100% !important;
        max-height: none !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 auto !important;
        padding: 0 !important;
      }

      ${UNCLE_SCREEN_SELECTOR} > div > div[class*="z-10"] > div {
        width: 100% !important;
        min-width: 0 !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        margin-inline: auto !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section[data-family-map-card-count="1"] {
        width: min(100%, 178px) !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section[data-family-map-card-count="2"] {
        width: min(100%, 354px) !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section[data-family-map-card-count="3"] {
        width: min(100%, 354px) !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section > div {
        box-sizing: border-box !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
        border-radius: 1.35rem !important;
        border-width: 1px !important;
        padding: 0.75rem !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section h2 {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        margin: 0 0 0.625rem !important;
        overflow: visible !important;
        color: #0f172a !important;
        -webkit-text-fill-color: #0f172a !important;
        text-align: center !important;
        text-shadow: none !important;
        font-size: 0.75rem !important;
        line-height: 1.15 !important;
        font-weight: 800 !important;
        letter-spacing: 0.07em !important;
        text-transform: uppercase !important;
        white-space: nowrap !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section h2 + div {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        align-items: stretch !important;
        align-content: start !important;
        gap: 0.625rem !important;
        min-height: 0 !important;
        overflow: visible !important;
      }

      ${UNCLE_SCREEN_SELECTOR} section[data-family-map-card-count="1"] h2 + div {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      ${UNCLE_SCREEN_SELECTOR} [data-family-map-mobile-card="true"] {
        display: flex !important;
        height: 78px !important;
        min-height: 78px !important;
        width: 100% !important;
        min-width: 0 !important;
        align-items: center !important;
        justify-content: flex-start !important;
        border-radius: 1.05rem !important;
        padding: 0.5rem 0.55rem !important;
        gap: 0.5rem !important;
        text-align: left !important;
      }

      ${UNCLE_SCREEN_SELECTOR} [data-family-map-mobile-card="true"] [data-family-map-avatar="true"] {
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        flex: 0 0 44px !important;
      }

      ${UNCLE_SCREEN_SELECTOR} [data-family-map-mobile-card="true"] > span:last-child {
        display: flex !important;
        min-width: 0 !important;
        flex: 1 1 auto !important;
        flex-direction: column !important;
        justify-content: center !important;
        overflow: hidden !important;
      }

      ${UNCLE_SCREEN_SELECTOR} [data-family-map-mobile-card="true"] > span:last-child > span:first-child {
        display: -webkit-box !important;
        width: 100% !important;
        overflow: hidden !important;
        color: currentColor !important;
        font-size: 0.6875rem !important;
        line-height: 1.05 !important;
        font-weight: 800 !important;
        letter-spacing: 0.01em !important;
        text-transform: uppercase !important;
        -webkit-box-orient: vertical !important;
        -webkit-line-clamp: 2 !important;
      }

      ${UNCLE_SCREEN_SELECTOR} [data-family-map-mobile-card="true"] .family-map-status-icon {
        width: 0.6875rem !important;
        height: 0.6875rem !important;
      }

      ${UNCLE_SCREEN_SELECTOR} [data-family-map-mobile-card="true"] > span:last-child > span:not(:first-child) {
        justify-content: flex-start !important;
        font-size: 0.6875rem !important;
        line-height: 1.1 !important;
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

function markUncleScreen(screen: HTMLElement) {
  const scrollArea = screen.querySelector<HTMLElement>(':scope > div');
  scrollArea?.setAttribute('data-mobile-tree-scroll', 'true');
  scrollArea?.setAttribute('data-mobile-family-tree-uncle-scroll', 'true');

  screen.querySelectorAll<HTMLElement>('section').forEach((section) => {
    const cardCount = section.querySelectorAll('[data-family-map-mobile-card="true"]').length;
    if (cardCount > 0) section.setAttribute('data-family-map-card-count', String(cardCount));
  });
}

function applyUncleSizing() {
  if (!isMobileFamilyMap()) return;

  ensureStyles();

  document.querySelectorAll<HTMLElement>(UNCLE_SCREEN_SELECTOR).forEach((screen) => {
    const screenName = screen.getAttribute('data-mobile-family-tree-screen') ?? '';
    normalizeTitle(screenName, screen);
    markUncleScreen(screen);
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
