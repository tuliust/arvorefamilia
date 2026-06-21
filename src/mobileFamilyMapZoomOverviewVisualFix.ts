const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-map-zoom-overview-visual-fix-style';
let scheduled = false;

const TITLE_OVERRIDES: Record<string, string> = {
  'paternal-ancestors': 'Ancestrais paternos',
  'maternal-ancestors': 'Ancestrais maternos',
};

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function ensureStyles() {
  if (typeof document === 'undefined') return;

  const css = `
    @media (max-width: 767px) {
      #${OVERVIEW_ID} .mobile-family-overview-tile {
        justify-content: space-between !important;
        gap: 0.45rem !important;
        border: 1px solid rgb(203, 213, 225) !important;
        box-shadow: 0 9px 22px rgba(15, 23, 42, 0.08) !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[aria-current="location"],
      #${OVERVIEW_ID} .mobile-family-overview-tile[data-mobile-family-overview-current="true"] {
        border-color: rgb(37, 99, 235) !important;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.10), 0 9px 22px rgba(15, 23, 42, 0.08) !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-subtitle,
      #${OVERVIEW_ID} .mobile-family-overview-current-label,
      #${OVERVIEW_ID} [data-mobile-family-overview-current-label="true"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-count {
        display: inline-flex !important;
        width: fit-content !important;
        max-width: 100% !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 999px !important;
        background: rgb(239, 246, 255) !important;
        color: rgb(30, 64, 175) !important;
        border: 1px solid rgb(191, 219, 254) !important;
        padding: 0.18rem 0.42rem !important;
        font-size: 0.62rem !important;
        font-weight: 850 !important;
        line-height: 1.05 !important;
        white-space: nowrap !important;
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

function removeCurrentTextNodes(tile: HTMLElement) {
  const walker = document.createTreeWalker(tile, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node.textContent?.trim().toLowerCase() === 'atual') textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const parent = node.parentElement;
    if (parent && parent.textContent?.trim().toLowerCase() === 'atual') {
      parent.setAttribute('data-mobile-family-overview-current-label', 'true');
      parent.setAttribute('aria-hidden', 'true');
      parent.remove();
    } else {
      node.textContent = '';
    }
  });
}

function patchOverview() {
  if (!isEnabled()) return;
  ensureStyles();

  const overlay = document.getElementById(OVERVIEW_ID);
  if (!overlay) return;

  overlay.querySelectorAll<HTMLElement>('.mobile-family-overview-tile[data-screen]').forEach((tile) => {
    const screenName = tile.dataset.screen;
    const titleOverride = screenName ? TITLE_OVERRIDES[screenName] : undefined;
    const title = tile.querySelector<HTMLElement>('.mobile-family-overview-tile-title');
    const subtitle = tile.querySelector<HTMLElement>('.mobile-family-overview-tile-subtitle');
    const count = tile.querySelector<HTMLElement>('.mobile-family-overview-tile-count');

    if (titleOverride && title && title.textContent !== titleOverride) title.textContent = titleOverride;
    subtitle?.remove();

    if (count) {
      count.setAttribute('data-mobile-family-overview-count-badge', 'true');
      count.textContent = count.textContent?.replace(/\bcards?\b/i, (match) => match.toLowerCase().startsWith('card') ? 'pessoas' : match) ?? '';
    }

    if (tile.getAttribute('aria-current') === 'location') {
      tile.setAttribute('data-mobile-family-overview-current', 'true');
    } else {
      tile.removeAttribute('data-mobile-family-overview-current');
    }

    removeCurrentTextNodes(tile);
  });
}

function schedulePatch() {
  if (scheduled) return;
  scheduled = true;

  window.requestAnimationFrame(() => {
    scheduled = false;
    patchOverview();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  patchOverview();
  [80, 180, 360, 720].forEach((delay) => window.setTimeout(patchOverview, delay));

  const observer = new MutationObserver(schedulePatch);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current', 'data-screen'] });

  window.addEventListener('resize', patchOverview, { passive: true });
  window.addEventListener('orientationchange', patchOverview, { passive: true });
  window.addEventListener('popstate', patchOverview, { passive: true });
  document.addEventListener('visibilitychange', patchOverview, { passive: true });
}

export {};
