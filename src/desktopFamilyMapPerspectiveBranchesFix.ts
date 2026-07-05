const DESKTOP_QUERY = '(min-width: 768px)';
const MAP_PATH = '/mapa-familiar';
const STYLE_ID = 'desktop-family-map-auto-expand-groups-style';
const GROUP_SELECTOR = '[data-family-map-group="true"]';
const GROUP_TITLE_SELECTOR = '[data-family-map-group-title="true"]';
const MAX_VISIBLE_WITHOUT_TOGGLE = 12;
const PERSPECTIVE_SIBLINGS_WIDTH = 560;
const PERSPECTIVE_SIBLINGS_COLUMNS = 4;

const AUTO_EXPAND_GROUP_TITLES = new Set([
  'tios paternos',
  'primos paternos',
  'irmaos',
  'sobrinhos',
  'tios maternos',
  'primos maternos',
]);

let scheduled = false;

function isDesktopViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(DESKTOP_QUERY).matches;
}

function getCurrentUrl() {
  return typeof window === 'undefined' ? null : new URL(window.location.href);
}

function isEnabled() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  return isDesktopViewport() && window.location.pathname.replace(/\/$/, '') === MAP_PATH;
}

function isPerspectivePersonRoute() {
  const url = getCurrentUrl();
  return Boolean(url?.searchParams.has('pessoa'));
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePixelValue(value: string | null | undefined) {
  const parsed = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function getGroupTitle(section: HTMLElement) {
  return normalizeText(section.querySelector<HTMLElement>(GROUP_TITLE_SELECTOR)?.textContent ?? '');
}

function getNumericAttribute(section: HTMLElement, attributeName: string) {
  const value = Number.parseInt(section.getAttribute(attributeName) ?? '', 10);
  return Number.isFinite(value) ? value : 0;
}

function getExpandToggle(section: HTMLElement) {
  const buttons = Array.from(section.querySelectorAll<HTMLButtonElement>('button[aria-label], button[title]'));
  return buttons.find((button) => {
    const label = normalizeText(`${button.getAttribute('aria-label') ?? ''} ${button.getAttribute('title') ?? ''}`);
    return label.startsWith('expandir ') || label.startsWith('recolher ');
  }) ?? null;
}

function getGrid(section: HTMLElement) {
  return section.querySelector<HTMLElement>(':scope > .grid');
}

function getAbsoluteContainer(section: HTMLElement) {
  const container = section.parentElement;
  if (!(container instanceof HTMLElement)) return null;
  return window.getComputedStyle(container).position === 'absolute' ? container : null;
}

function toggleIsCollapsed(toggle: HTMLButtonElement) {
  const label = normalizeText(`${toggle.getAttribute('aria-label') ?? ''} ${toggle.getAttribute('title') ?? ''}`);
  return label.startsWith('expandir ');
}

function setAutoHiddenToggle(toggle: HTMLButtonElement, hidden: boolean) {
  if (hidden) {
    toggle.setAttribute('data-family-map-auto-hidden-toggle', 'true');
    toggle.setAttribute('aria-hidden', 'true');
    toggle.tabIndex = -1;
    return;
  }

  toggle.removeAttribute('data-family-map-auto-hidden-toggle');
  toggle.removeAttribute('aria-hidden');
  toggle.removeAttribute('tabindex');
}

function setStyleIfNeeded(element: HTMLElement, property: string, value: string, priority = '') {
  if (
    element.style.getPropertyValue(property) !== value
    || element.style.getPropertyPriority(property) !== priority
  ) {
    element.style.setProperty(property, value, priority);
  }
}

function ensureStyles() {
  const css = `
    @media (min-width: 768px) {
      [data-family-map-auto-hidden-toggle="true"] {
        display: none !important;
      }

      [data-family-map-perspective-siblings-quad="true"] {
        overflow: visible !important;
      }

      [data-family-map-perspective-siblings-quad="true"] > .grid {
        grid-template-columns: repeat(${PERSPECTIVE_SIBLINGS_COLUMNS}, minmax(0, 1fr)) !important;
        justify-content: stretch !important;
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

function normalizeExpandableGroup(section: HTMLElement) {
  const title = getGroupTitle(section);
  if (!AUTO_EXPAND_GROUP_TITLES.has(title)) return false;

  const totalCount = getNumericAttribute(section, 'data-family-map-total-person-count');
  const visibleCount = getNumericAttribute(section, 'data-family-map-visible-person-count');
  const toggle = getExpandToggle(section);
  if (!toggle) return false;

  const shouldShowAll = totalCount > 0 && totalCount <= MAX_VISIBLE_WITHOUT_TOGGLE;
  setAutoHiddenToggle(toggle, shouldShowAll);

  if (shouldShowAll && visibleCount < totalCount && toggleIsCollapsed(toggle)) {
    toggle.click();
    return true;
  }

  return false;
}

function applyPerspectiveSiblingsLayout(section: HTMLElement) {
  if (!isPerspectivePersonRoute()) return;
  if (getGroupTitle(section) !== 'irmaos') return;

  const container = getAbsoluteContainer(section);
  const grid = getGrid(section);
  if (!container || !grid) return;

  const currentLeft = parsePixelValue(container.style.left) ?? container.offsetLeft;
  const currentWidth = parsePixelValue(container.style.width) ?? container.getBoundingClientRect().width;
  const rightEdge = currentLeft + currentWidth;
  const nextWidth = Math.max(PERSPECTIVE_SIBLINGS_WIDTH, currentWidth);
  const nextLeft = Math.min(currentLeft, rightEdge - nextWidth);

  setStyleIfNeeded(container, 'left', `${nextLeft}px`);
  setStyleIfNeeded(container, 'width', `${nextWidth}px`);
  setStyleIfNeeded(grid, 'grid-template-columns', `repeat(${PERSPECTIVE_SIBLINGS_COLUMNS}, minmax(0, 1fr))`, 'important');
  setStyleIfNeeded(grid, 'justify-content', 'stretch', 'important');
  section.setAttribute('data-family-map-perspective-siblings-quad', 'true');
  section.setAttribute('data-family-map-perspective-columns', String(PERSPECTIVE_SIBLINGS_COLUMNS));
}

function applyAutoExpandGroups() {
  if (!isEnabled()) return;

  ensureStyles();

  let clickedToggle = false;
  document.querySelectorAll<HTMLElement>(GROUP_SELECTOR).forEach((section) => {
    clickedToggle = normalizeExpandableGroup(section) || clickedToggle;
    applyPerspectiveSiblingsLayout(section);
  });

  if (clickedToggle) {
    window.setTimeout(scheduleApplyAutoExpandGroups, 0);
    window.setTimeout(scheduleApplyAutoExpandGroups, 120);
  }
}

function scheduleApplyAutoExpandGroups() {
  if (scheduled) return;

  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyAutoExpandGroups();
  });
}

function scheduleAfterInteraction() {
  [0, 80, 180, 420].forEach((delay) => window.setTimeout(scheduleApplyAutoExpandGroups, delay));
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  scheduleAfterInteraction();

  const observer = new MutationObserver(scheduleApplyAutoExpandGroups);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      'aria-label',
      'title',
      'style',
      'data-family-map-total-person-count',
      'data-family-map-visible-person-count',
    ],
  });

  window.addEventListener('resize', scheduleAfterInteraction, { passive: true });
  window.addEventListener('popstate', scheduleAfterInteraction, { passive: true });
  document.addEventListener('click', scheduleAfterInteraction, { capture: true, passive: true });
  document.addEventListener('visibilitychange', scheduleAfterInteraction, { passive: true });
}

export {};
