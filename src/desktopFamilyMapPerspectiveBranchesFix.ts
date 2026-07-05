const DESKTOP_QUERY = '(min-width: 768px)';
const MAP_PATH = '/mapa-familiar';
const STYLE_ID = 'desktop-family-map-perspective-branches-fix-style';
const GROUP_SELECTOR = '[data-family-map-group="true"]';
const GROUP_TITLE_SELECTOR = '[data-family-map-group-title="true"]';
const TARGET_WIDTH = 540;
const MAX_VISIBLE_WITHOUT_MANUAL_EXPAND = 9;

let scheduled = false;

function isDesktopViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(DESKTOP_QUERY).matches;
}

function isEnabled() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const url = new URL(window.location.href);
  return isDesktopViewport()
    && url.pathname.replace(/\/$/, '') === MAP_PATH
    && Boolean(url.searchParams.get('pessoa'));
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getGroupTitle(section: HTMLElement) {
  return normalizeText(section.querySelector<HTMLElement>(GROUP_TITLE_SELECTOR)?.textContent ?? '');
}

type BranchSide = 'left' | 'right';

function getTargetBranch(title: string): BranchSide | null {
  if (title === 'irmaos' || title === 'sobrinhos') return 'left';
  if (
    title === 'filhos'
    || title.startsWith('filhos com ')
    || title === 'netos'
    || title === 'tios maternos'
    || title === 'primos maternos'
  ) {
    return 'right';
  }
  return null;
}

function parsePixelValue(value: string | null | undefined) {
  const parsed = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function getAbsoluteContainer(section: HTMLElement) {
  const container = section.parentElement;
  if (!(container instanceof HTMLElement)) return null;
  const position = window.getComputedStyle(container).position;
  return position === 'absolute' ? container : null;
}

function ensureStyles() {
  const css = `
    @media (min-width: 768px) {
      [data-family-map-perspective-branch="left"],
      [data-family-map-perspective-branch="right"] {
        width: ${TARGET_WIDTH}px !important;
      }

      [data-family-map-perspective-branch="left"] ${GROUP_SELECTOR},
      [data-family-map-perspective-branch="right"] ${GROUP_SELECTOR} {
        width: 100% !important;
      }

      ${GROUP_SELECTOR}[data-family-map-perspective-branch-section="left"] > .grid,
      ${GROUP_SELECTOR}[data-family-map-perspective-branch-section="right"] > .grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      ${GROUP_SELECTOR}[data-family-map-perspective-branch-section="left"] > .grid > .col-span-2,
      ${GROUP_SELECTOR}[data-family-map-perspective-branch-section="right"] > .grid > .col-span-2 {
        grid-column: auto / span 1 !important;
        width: auto !important;
        margin-inline: 0 !important;
      }

      ${GROUP_SELECTOR}[data-family-map-perspective-branch-section="left"] > .grid > [data-family-map-perspective-overflow="true"],
      ${GROUP_SELECTOR}[data-family-map-perspective-branch-section="right"] > .grid > [data-family-map-perspective-overflow="true"] {
        display: none !important;
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

function expandGroupIfNeeded(section: HTMLElement) {
  const title = section.querySelector<HTMLElement>(GROUP_TITLE_SELECTOR)?.textContent?.trim() ?? '';
  const expandButton = Array.from(section.querySelectorAll<HTMLButtonElement>('button[aria-label], button[title]'))
    .find((button) => {
      const label = `${button.getAttribute('aria-label') ?? ''} ${button.getAttribute('title') ?? ''}`;
      return normalizeText(label).startsWith(`expandir ${normalizeText(title)}`);
    });

  if (expandButton) expandButton.click();
}

function limitVisibleCards(section: HTMLElement) {
  const grid = section.querySelector<HTMLElement>(':scope > .grid');
  if (!grid) return;

  let renderedCards = 0;
  Array.from(grid.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) return;
    child.removeAttribute('data-family-map-perspective-overflow');
    if (!child.querySelector('[data-family-map-color-key]')) return;

    renderedCards += 1;
    if (renderedCards > MAX_VISIBLE_WITHOUT_MANUAL_EXPAND) {
      child.setAttribute('data-family-map-perspective-overflow', 'true');
    }
  });
}

function widenContainer(section: HTMLElement, branch: BranchSide) {
  const container = getAbsoluteContainer(section);
  if (!container) return;

  const currentWidth = parsePixelValue(container.style.width) ?? container.getBoundingClientRect().width;
  const currentLeft = parsePixelValue(container.style.left);
  if (currentLeft === null || currentWidth <= 0) return;

  const nextLeft = currentLeft - (TARGET_WIDTH - currentWidth) / 2;
  container.style.setProperty('width', `${TARGET_WIDTH}px`);
  container.style.setProperty('left', `${nextLeft}px`);
  container.setAttribute('data-family-map-perspective-branch', branch);
  section.setAttribute('data-family-map-perspective-branch-section', branch);
}

function applyPerspectiveBranchFixes() {
  if (!isEnabled()) return;
  ensureStyles();

  Array.from(document.querySelectorAll<HTMLElement>(GROUP_SELECTOR)).forEach((section) => {
    const branch = getTargetBranch(getGroupTitle(section));
    if (!branch) return;

    widenContainer(section, branch);
    expandGroupIfNeeded(section);
    limitVisibleCards(section);
  });
}

function scheduleApplyPerspectiveBranchFixes() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyPerspectiveBranchFixes();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyPerspectiveBranchFixes();
  [80, 240, 520, 1000].forEach((delay) => window.setTimeout(applyPerspectiveBranchFixes, delay));

  const observer = new MutationObserver(scheduleApplyPerspectiveBranchFixes);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'aria-label', 'title'],
  });

  window.addEventListener('resize', applyPerspectiveBranchFixes, { passive: true });
  window.addEventListener('popstate', applyPerspectiveBranchFixes, { passive: true });
  document.addEventListener('visibilitychange', applyPerspectiveBranchFixes, { passive: true });
}

export {};
