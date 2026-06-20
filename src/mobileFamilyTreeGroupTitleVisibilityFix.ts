const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const STYLE_ID = 'mobile-family-tree-group-title-visibility-fix-style';

const GROUP_TITLE_SELECTORS = [
  '[data-mobile-family-tree-screen="paternal-uncles"] section h2',
  '[data-mobile-family-tree-screen="maternal-uncles"] section h2',
  '[data-mobile-family-tree-screen="core"] section h2',
  '[data-mobile-family-tree-screen="descendants"] section h2',
  '.mobile-family-descendant-screen section h2',
  '[data-mobile-family-tree-screen="paternal-cousins"] section h2',
  '[data-mobile-family-tree-screen="maternal-cousins"] section h2',
].join(',');

const GROUP_TITLE_TEXTS = new Set([
  'tios paternos',
  'tios maternos',
  'irmaos',
  'irmãos',
  'sobrinhos',
  'pets',
  'filhos',
  'netos',
]);

function isMobileFamilyMap() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname === FAMILY_MAP_PATH;
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function ensureStyles() {
  const existing = document.getElementById(STYLE_ID);
  existing?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${GROUP_TITLE_SELECTORS} {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 30 !important;
        min-height: 1.05em !important;
        margin-block-start: 0 !important;
        margin-block-end: 0.625rem !important;
        overflow: visible !important;
        color: #0f172a !important;
        -webkit-text-fill-color: #0f172a !important;
        text-align: center !important;
        text-shadow: none !important;
        filter: none !important;
        mix-blend-mode: normal !important;
        font-size: 0.75rem !important;
        line-height: 1.15 !important;
        font-weight: 800 !important;
        letter-spacing: 0.07em !important;
        text-transform: uppercase !important;
        white-space: nowrap !important;
      }

      [data-mobile-family-tree-screen="core"] section > div,
      [data-mobile-family-tree-screen="descendants"] section > div,
      .mobile-family-descendant-screen section > div,
      [data-mobile-family-tree-screen="paternal-uncles"] section > div,
      [data-mobile-family-tree-screen="maternal-uncles"] section > div {
        color: inherit !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function normalizeKnownGroupTitles() {
  document.querySelectorAll<HTMLElement>(GROUP_TITLE_SELECTORS).forEach((heading) => {
    const normalized = normalize(heading.textContent ?? '');
    if (!GROUP_TITLE_TEXTS.has(normalized)) return;

    heading.style.setProperty('display', 'block', 'important');
    heading.style.setProperty('visibility', 'visible', 'important');
    heading.style.setProperty('opacity', '1', 'important');
    heading.style.setProperty('color', '#0f172a', 'important');
    heading.style.setProperty('-webkit-text-fill-color', '#0f172a', 'important');
    heading.style.setProperty('text-shadow', 'none', 'important');
    heading.style.setProperty('mix-blend-mode', 'normal', 'important');
    heading.style.setProperty('font-size', '0.75rem', 'important');
    heading.style.setProperty('line-height', '1.15', 'important');
  });
}

function applyGroupTitleVisibility() {
  if (!isMobileFamilyMap()) return;

  ensureStyles();
  normalizeKnownGroupTitles();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyGroupTitleVisibility();
  [120, 360, 900, 1600].forEach((delay) => window.setTimeout(applyGroupTitleVisibility, delay));

  window.addEventListener('resize', applyGroupTitleVisibility, { passive: true });
  window.addEventListener('orientationchange', applyGroupTitleVisibility, { passive: true });
  document.addEventListener('visibilitychange', applyGroupTitleVisibility, { passive: true });
  document.addEventListener('touchend', () => window.setTimeout(applyGroupTitleVisibility, 80), { capture: true, passive: true });
}

export {};
