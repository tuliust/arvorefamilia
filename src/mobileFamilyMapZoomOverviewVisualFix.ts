const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const DESCENDANTS_LOCK_ATTR = 'data-mobile-family-descendants-transform-lock';
const STYLE_ID = 'mobile-family-map-zoom-overview-visual-fix-style';
let scheduled = false;

const TITLE_OVERRIDES: Record<string, string> = {
  'paternal-ancestors': 'Ancestrais paternos',
  'maternal-ancestors': 'Ancestrais maternos',
};

const OVERVIEW_ICON_HTML = `
  <span class="mobile-family-overview-tile-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 4.5v4.25" />
      <path d="M7.5 13.25h9" />
      <path d="M7.5 13.25v2.25" />
      <path d="M16.5 13.25v2.25" />
      <path d="M12 8.75v6.75" />
      <circle cx="12" cy="4.5" r="2.25" />
      <circle cx="7.5" cy="18" r="2.25" />
      <circle cx="12" cy="18" r="2.25" />
      <circle cx="16.5" cy="18" r="2.25" />
    </svg>
  </span>
`;

const SUBTITLE_TEXTS = new Set([
  'ancestrais profundos',
  'avos paternos e maternos',
  'ramo do pai',
  'pais pessoa principal e descendentes',
  'ramo da mae',
  'descendentes dos tios paternos',
  'irmaos conjuge pets filhos e netos',
  'descendentes dos tios maternos',
]);

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function unlockDescendantLockForOverviewNavigation() {
  const root = document.querySelector<HTMLElement>(ROOT_SELECTOR);
  const stage = root?.querySelector<HTMLElement>(STAGE_SELECTOR);
  root?.removeAttribute(DESCENDANTS_LOCK_ATTR);
  stage?.style.setProperty('transition', 'none', 'important');
}

function ensureStyles() {
  if (typeof document === 'undefined') return;

  const css = `
    @media (max-width: 767px) {
      #${OVERVIEW_ID} .mobile-family-overview-map {
        column-gap: 0.3rem !important;
        row-gap: 0.45rem !important;
        padding: 0.55rem !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile {
        justify-content: space-between !important;
        align-items: flex-start !important;
        gap: 0.28rem !important;
        border: 1px solid rgb(203, 213, 225) !important;
        box-shadow: 0 9px 22px rgba(15, 23, 42, 0.08) !important;
        padding: 0.46rem 0.36rem !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[aria-current="location"],
      #${OVERVIEW_ID} .mobile-family-overview-tile[data-mobile-family-overview-current="true"] {
        border-color: rgb(37, 99, 235) !important;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.10), 0 9px 22px rgba(15, 23, 42, 0.08) !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-title {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        color: rgb(15, 23, 42) !important;
        font-size: clamp(0.48rem, 2.25vw, 0.58rem) !important;
        font-weight: 950 !important;
        letter-spacing: 0.035em !important;
        line-height: 0.98 !important;
        text-transform: uppercase !important;
        overflow-wrap: normal !important;
        word-break: keep-all !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[data-screen="descendants"] .mobile-family-overview-tile-title {
        font-size: clamp(0.45rem, 2.05vw, 0.52rem) !important;
        letter-spacing: 0.01em !important;
        white-space: nowrap !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-subtitle,
      #${OVERVIEW_ID} .mobile-family-overview-current-label,
      #${OVERVIEW_ID} [data-mobile-family-overview-current-label="true"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-icon {
        display: flex !important;
        width: 100% !important;
        flex: 1 1 auto !important;
        min-height: 1.65rem !important;
        align-items: center !important;
        justify-content: center !important;
        color: rgb(37, 99, 235) !important;
        opacity: 0.86 !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-icon svg {
        display: block !important;
        width: clamp(1.35rem, 6.8vw, 2rem) !important;
        height: clamp(1.35rem, 6.8vw, 2rem) !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 1.85 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
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
        padding: 0.18rem 0.38rem !important;
        font-size: 0.6rem !important;
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

function removeSubtitleTextNodes(tile: HTMLElement) {
  const walker = document.createTreeWalker(tile, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (!parent) continue;
    if (parent.closest('.mobile-family-overview-tile-title, .mobile-family-overview-tile-count, .mobile-family-overview-tile-icon')) continue;

    const normalized = normalizeText(node.textContent ?? '');
    if (SUBTITLE_TEXTS.has(normalized)) textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const parent = node.parentElement;
    if (parent && normalizeText(parent.textContent ?? '') === normalizeText(node.textContent ?? '')) parent.remove();
    else node.textContent = '';
  });
}

function ensureTileIcon(tile: HTMLElement) {
  if (tile.querySelector('.mobile-family-overview-tile-icon')) return;

  const title = tile.querySelector<HTMLElement>('.mobile-family-overview-tile-title');
  const count = tile.querySelector<HTMLElement>('.mobile-family-overview-tile-count');
  const template = document.createElement('template');
  template.innerHTML = OVERVIEW_ICON_HTML.trim();
  const icon = template.content.firstElementChild;
  if (!(icon instanceof HTMLElement)) return;

  if (count) tile.insertBefore(icon, count);
  else if (title?.nextSibling) tile.insertBefore(icon, title.nextSibling);
  else tile.appendChild(icon);
}

function bindTileUnlock(tile: HTMLElement) {
  if (tile.dataset.mobileFamilyOverviewUnlockBound === 'true') return;
  tile.dataset.mobileFamilyOverviewUnlockBound = 'true';

  ['touchstart', 'pointerdown', 'mousedown'].forEach((eventName) => {
    tile.addEventListener(eventName, unlockDescendantLockForOverviewNavigation, { passive: true });
  });
}

function patchOverview() {
  if (!isEnabled()) return;
  ensureStyles();

  const overlay = document.getElementById(OVERVIEW_ID);
  if (!overlay) return;

  unlockDescendantLockForOverviewNavigation();

  overlay.querySelectorAll<HTMLElement>('.mobile-family-overview-tile[data-screen]').forEach((tile) => {
    const screenName = tile.dataset.screen;
    const titleOverride = screenName ? TITLE_OVERRIDES[screenName] : undefined;
    const title = tile.querySelector<HTMLElement>('.mobile-family-overview-tile-title');
    const subtitle = tile.querySelector<HTMLElement>('.mobile-family-overview-tile-subtitle');
    const count = tile.querySelector<HTMLElement>('.mobile-family-overview-tile-count');

    if (titleOverride && title && title.textContent !== titleOverride) title.textContent = titleOverride;
    subtitle?.remove();
    removeSubtitleTextNodes(tile);
    ensureTileIcon(tile);
    bindTileUnlock(tile);

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
