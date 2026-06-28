const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-map-overview-tile-visual-adjustments-style';

const ICONS_BY_SCREEN: Record<string, string> = {
  'paternal-ancestors': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <path d="M16 5v6" />
      <path d="M9 15h14" />
      <path d="M9 15v5" />
      <path d="M23 15v5" />
      <circle cx="16" cy="5" r="3" />
      <rect x="5.75" y="20" width="6.5" height="6" rx="2" />
      <rect x="19.75" y="20" width="6.5" height="6" rx="2" />
      <path d="M9 26h14" />
    </svg>
  `,
  ancestors: `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <circle cx="11" cy="9" r="3.4" />
      <circle cx="21" cy="9" r="3.4" />
      <path d="M8.5 18c1.4-2 3.3-3 5.5-3" />
      <path d="M23.5 18c-1.4-2-3.3-3-5.5-3" />
      <path d="M16 15v8" />
      <path d="M10 23h12" />
      <circle cx="10" cy="25" r="2.4" />
      <circle cx="22" cy="25" r="2.4" />
    </svg>
  `,
  'maternal-ancestors': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <path d="M16 5v5" />
      <circle cx="16" cy="5" r="3" />
      <path d="M16 10c-5 3-8 6.5-8 11" />
      <path d="M16 10c5 3 8 6.5 8 11" />
      <circle cx="8" cy="23" r="3" />
      <circle cx="24" cy="23" r="3" />
      <path d="M11 23h10" />
    </svg>
  `,
  'paternal-uncles': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <circle cx="11" cy="10" r="4" />
      <circle cx="21" cy="10" r="4" />
      <path d="M5.5 25c.8-4.4 3-6.7 6.5-6.7" />
      <path d="M26.5 25c-.8-4.4-3-6.7-6.5-6.7" />
      <path d="M13 20h6" />
    </svg>
  `,
  core: `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <path d="M7 16l9-8 9 8" />
      <path d="M10 15v10h12V15" />
      <circle cx="16" cy="17" r="2.5" />
      <path d="M11.5 24c.8-3 2.3-4.5 4.5-4.5s3.7 1.5 4.5 4.5" />
    </svg>
  `,
  'maternal-uncles': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <circle cx="16" cy="9" r="3.5" />
      <path d="M10.5 21.5c.8-4.2 2.7-6.4 5.5-6.4s4.7 2.2 5.5 6.4" />
      <path d="M7 24h18" />
      <path d="M8.5 14.5l-3-3" />
      <path d="M23.5 14.5l3-3" />
      <circle cx="5" cy="10" r="2" />
      <circle cx="27" cy="10" r="2" />
    </svg>
  `,
  'paternal-cousins': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <circle cx="9" cy="10" r="3" />
      <circle cx="23" cy="10" r="3" />
      <circle cx="9" cy="23" r="3" />
      <circle cx="23" cy="23" r="3" />
      <path d="M12 10h8" />
      <path d="M9 13v7" />
      <path d="M23 13v7" />
      <path d="M12 23h8" />
    </svg>
  `,
  descendants: `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <circle cx="16" cy="6" r="3" />
      <path d="M16 9v5" />
      <path d="M9 16h14" />
      <path d="M9 16v4" />
      <path d="M16 16v4" />
      <path d="M23 16v4" />
      <circle cx="9" cy="24" r="3" />
      <circle cx="16" cy="24" r="3" />
      <circle cx="23" cy="24" r="3" />
    </svg>
  `,
  'maternal-cousins': `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <path d="M16 7v18" />
      <path d="M7 16h18" />
      <path d="M10 10l12 12" />
      <path d="M22 10L10 22" />
      <circle cx="16" cy="16" r="3.2" />
      <circle cx="16" cy="7" r="2.2" />
      <circle cx="25" cy="16" r="2.2" />
      <circle cx="16" cy="25" r="2.2" />
      <circle cx="7" cy="16" r="2.2" />
    </svg>
  `,
};

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      #${OVERVIEW_ID} .mobile-family-overview-tile {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.16rem !important;
        padding: 8px !important;
        text-align: center !important;
        letter-spacing: 0 !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-title {
        display: flex !important;
        width: 100% !important;
        min-height: 1.1rem !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        letter-spacing: -0.035em !important;
        line-height: 0.92 !important;
      }

      #${OVERVIEW_ID} .mobile-family-map-overview-tile-icon,
      #${OVERVIEW_ID} .mobile-family-overview-tile-icon {
        display: flex !important;
        width: 100% !important;
        flex: 0 0 auto !important;
        min-height: 3.6rem !important;
        align-items: center !important;
        justify-content: center !important;
        margin: auto 0 !important;
        color: rgb(37, 99, 235) !important;
        letter-spacing: 0 !important;
      }

      #${OVERVIEW_ID} .mobile-family-map-overview-tile-icon svg,
      #${OVERVIEW_ID} .mobile-family-overview-tile-icon svg {
        display: block !important;
        width: clamp(2.8rem, 13.8vw, 4.1rem) !important;
        height: clamp(2.8rem, 13.8vw, 4.1rem) !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 1.55 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-icon:not([data-mobile-family-map-unique-icon]) {
        display: none !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-count {
        margin: 0 auto !important;
        letter-spacing: 0 !important;
        text-align: center !important;
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

function makeIconElement(screenName: string, iconMarkup: string) {
  const icon = document.createElement('span');
  icon.className = 'mobile-family-overview-tile-icon mobile-family-map-overview-tile-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.dataset.mobileFamilyMapUniqueIcon = screenName;
  icon.innerHTML = iconMarkup.trim();
  return icon;
}

function ensureSingleUniqueIcon(tile: HTMLElement, screenName: string, iconMarkup: string) {
  const title = tile.querySelector<HTMLElement>('.mobile-family-overview-tile-title');
  const count = tile.querySelector<HTMLElement>('.mobile-family-overview-tile-count');
  const icons = Array.from(tile.querySelectorAll<HTMLElement>('.mobile-family-map-overview-tile-icon, .mobile-family-overview-tile-icon'));
  const retainedIcon = icons.find((icon) => icon.dataset.mobileFamilyMapUniqueIcon === screenName) ?? icons[0] ?? makeIconElement(screenName, iconMarkup);

  retainedIcon.className = 'mobile-family-overview-tile-icon mobile-family-map-overview-tile-icon';
  retainedIcon.setAttribute('aria-hidden', 'true');
  retainedIcon.dataset.mobileFamilyMapUniqueIcon = screenName;
  if (retainedIcon.innerHTML.trim() !== iconMarkup.trim()) retainedIcon.innerHTML = iconMarkup.trim();

  icons.forEach((icon) => {
    if (icon !== retainedIcon) icon.remove();
  });

  if (count) tile.insertBefore(retainedIcon, count);
  else if (title?.nextSibling) tile.insertBefore(retainedIcon, title.nextSibling);
  else tile.appendChild(retainedIcon);
}

function patchTileIcons() {
  if (!isEnabled()) return;
  ensureStyles();

  const overlay = document.getElementById(OVERVIEW_ID);
  if (!overlay) return;

  overlay.querySelectorAll<HTMLElement>('.mobile-family-overview-tile[data-screen]').forEach((tile) => {
    const screenName = tile.dataset.screen || '';
    const iconMarkup = ICONS_BY_SCREEN[screenName];
    if (!iconMarkup) return;

    ensureSingleUniqueIcon(tile, screenName, iconMarkup);
  });
}

function schedulePatch() {
  window.requestAnimationFrame(patchTileIcons);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  patchTileIcons();
  [80, 220, 520, 1000].forEach((delay) => window.setTimeout(patchTileIcons, delay));

  const observer = new MutationObserver(schedulePatch);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-screen', 'class'] });

  window.addEventListener('resize', patchTileIcons, { passive: true });
  window.addEventListener('orientationchange', patchTileIcons, { passive: true });
  window.addEventListener('popstate', patchTileIcons, { passive: true });
  document.addEventListener('visibilitychange', patchTileIcons, { passive: true });
}

export {};
