const DESKTOP_QUERY = '(min-width: 768px)';
const MAP_PATH = '/mapa-familiar';
const STYLE_ID = 'desktop-family-map-perspective-branches-fix-style';
const OVERLAY_SELECTOR = '[data-family-map-perspective-connector-overlay="true"]';
const OVERLAY_SIGNATURE_ATTR = 'data-family-map-perspective-connector-signature';
const GROUP_SELECTOR = '[data-family-map-group="true"]';
const GROUP_TITLE_SELECTOR = '[data-family-map-group-title="true"]';
const PERSON_CARD_SELECTOR = ':scope > .grid > *:has([data-family-map-color-key])';
const CARD_WIDTH = 166;
const GROUP_HORIZONTAL_PADDING = 24;
const GRID_GAP = 8;
const MAX_VISIBLE_WITHOUT_MANUAL_EXPAND = 12;
const BRANCH_VERTICAL_GAP = 56;
const CONNECTOR_COLOR = '#a5eef6';
const CONNECTOR_WIDTH = 2;

type BranchSide = 'left' | 'right';
type TargetTitle =
  | 'tios paternos'
  | 'primos paternos'
  | 'irmaos'
  | 'sobrinhos'
  | 'tios maternos'
  | 'primos maternos'
  | 'filhos'
  | 'netos'
  | 'pets';

type TargetGroup = {
  section: HTMLElement;
  container: HTMLElement;
  title: TargetTitle;
  branch: BranchSide;
  columns: 1 | 2 | 3 | 4;
  width: number;
};

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

function getTargetTitle(title: string): TargetTitle | null {
  if (title === 'tios paternos') return 'tios paternos';
  if (title === 'primos paternos') return 'primos paternos';
  if (title === 'irmaos') return 'irmaos';
  if (title === 'sobrinhos') return 'sobrinhos';
  if (title === 'tios maternos') return 'tios maternos';
  if (title === 'primos maternos') return 'primos maternos';
  if (title === 'filhos' || title.startsWith('filhos com ')) return 'filhos';
  if (title === 'netos') return 'netos';
  if (title === 'pets') return 'pets';
  return null;
}

function getTargetBranch(title: TargetTitle): BranchSide {
  if (title === 'tios paternos' || title === 'primos paternos' || title === 'irmaos' || title === 'sobrinhos') {
    return 'left';
  }
  return 'right';
}

function parsePixelValue(value: string | null | undefined) {
  const parsed = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseScale(value: string) {
  const match = value.match(/scale\(([^)]+)\)/);
  const parsed = match ? Number.parseFloat(match[1]) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getAbsoluteContainer(section: HTMLElement) {
  const container = section.parentElement;
  if (!(container instanceof HTMLElement)) return null;
  return window.getComputedStyle(container).position === 'absolute' ? container : null;
}

function getLayer(container: HTMLElement) {
  const layer = container.parentElement;
  return layer instanceof HTMLElement ? layer : null;
}

function setStyleIfNeeded(element: HTMLElement, property: string, value: string, priority = '') {
  if (
    element.style.getPropertyValue(property) !== value
    || element.style.getPropertyPriority(property) !== priority
  ) {
    element.style.setProperty(property, value, priority);
  }
}

function setAttributeIfNeeded(element: HTMLElement, name: string, value: string) {
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function ensureStyles() {
  const css = `
    @media (min-width: 768px) {
      [data-family-map-perspective-normalized="true"] {
        overflow: visible !important;
      }

      [data-family-map-perspective-normalized="true"] ${GROUP_SELECTOR} {
        width: 100% !important;
      }

      [data-family-map-perspective-normalized="true"] ${GROUP_SELECTOR} > .grid > .col-span-2 {
        grid-column: auto / span 1 !important;
        width: auto !important;
        margin-inline: 0 !important;
      }

      [data-family-map-perspective-normalized="true"] ${GROUP_SELECTOR} > .grid > [data-family-map-perspective-overflow="true"] {
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
      const label = normalizeText(`${button.getAttribute('aria-label') ?? ''} ${button.getAttribute('title') ?? ''}`);
      return label.startsWith(`expandir ${normalizeText(title)}`);
    });

  if (expandButton) expandButton.click();
}

function getCardWrappers(section: HTMLElement) {
  return Array.from(section.querySelectorAll<HTMLElement>(PERSON_CARD_SELECTOR));
}

function limitVisibleCards(section: HTMLElement) {
  getCardWrappers(section).forEach((wrapper, index) => {
    if (index >= MAX_VISIBLE_WITHOUT_MANUAL_EXPAND) {
      setAttributeIfNeeded(wrapper, 'data-family-map-perspective-overflow', 'true');
    } else if (wrapper.hasAttribute('data-family-map-perspective-overflow')) {
      wrapper.removeAttribute('data-family-map-perspective-overflow');
    }
  });
}

function getVisibleCardCount(section: HTMLElement) {
  return getCardWrappers(section).filter((wrapper) => !wrapper.hasAttribute('data-family-map-perspective-overflow')).length;
}

function getColumns(visibleCards: number): 1 | 2 | 3 | 4 {
  if (visibleCards <= 1) return 1;
  if (visibleCards === 2) return 2;
  if (visibleCards === 3) return 3;
  return 4;
}

function getGroupWidth(columns: 1 | 2 | 3 | 4) {
  return GROUP_HORIZONTAL_PADDING + columns * CARD_WIDTH + Math.max(0, columns - 1) * GRID_GAP;
}

function storeOriginalGeometry(container: HTMLElement) {
  if (!container.dataset.familyMapPerspectiveOriginalLeft) {
    container.dataset.familyMapPerspectiveOriginalLeft = String(parsePixelValue(container.style.left) ?? container.offsetLeft);
  }
  if (!container.dataset.familyMapPerspectiveOriginalWidth) {
    container.dataset.familyMapPerspectiveOriginalWidth = String(parsePixelValue(container.style.width) ?? container.getBoundingClientRect().width);
  }
}

function getOriginalLeft(container: HTMLElement) {
  return parsePixelValue(container.dataset.familyMapPerspectiveOriginalLeft) ?? parsePixelValue(container.style.left) ?? container.offsetLeft;
}

function getOriginalWidth(container: HTMLElement) {
  return parsePixelValue(container.dataset.familyMapPerspectiveOriginalWidth) ?? parsePixelValue(container.style.width) ?? container.getBoundingClientRect().width;
}

function positionContainer(container: HTMLElement, branch: BranchSide, width: number) {
  storeOriginalGeometry(container);
  const originalLeft = getOriginalLeft(container);
  const originalWidth = getOriginalWidth(container);
  const originalCenter = originalLeft + originalWidth / 2;
  const left = branch === 'left' ? Math.min(originalLeft, 72) : originalCenter - width / 2;

  setStyleIfNeeded(container, 'left', `${left}px`);
  setStyleIfNeeded(container, 'width', `${width}px`);
  setAttributeIfNeeded(container, 'data-family-map-perspective-normalized', 'true');
}

function forceGrid(section: HTMLElement, columns: 1 | 2 | 3 | 4) {
  const grid = section.querySelector<HTMLElement>(':scope > .grid');
  if (!grid) return;

  setStyleIfNeeded(grid, 'grid-template-columns', `repeat(${columns}, minmax(0, ${columns === 4 ? '1fr' : `${CARD_WIDTH}px`}))`, 'important');
  setStyleIfNeeded(grid, 'justify-content', columns < 4 ? 'center' : 'stretch', 'important');
  setAttributeIfNeeded(section, 'data-family-map-perspective-columns', String(columns));
}

function configureGroup(section: HTMLElement): TargetGroup | null {
  const title = getTargetTitle(getGroupTitle(section));
  const container = getAbsoluteContainer(section);
  if (!title || !container) return null;

  expandGroupIfNeeded(section);
  limitVisibleCards(section);

  const visibleCards = getVisibleCardCount(section);
  if (visibleCards === 0) return null;

  const columns = getColumns(visibleCards);
  const width = getGroupWidth(columns);
  const branch = getTargetBranch(title);

  positionContainer(container, branch, width);
  forceGrid(section, columns);

  return { section, container, title, branch, columns, width };
}

function getBox(element: HTMLElement, scale: number) {
  const left = parsePixelValue(element.style.left) ?? element.offsetLeft;
  const top = parsePixelValue(element.style.top) ?? element.offsetTop;
  const width = parsePixelValue(element.style.width) ?? element.getBoundingClientRect().width / scale;
  const height = element.getBoundingClientRect().height / scale;
  return {
    left,
    top,
    width,
    height,
    topCenter: [left + width / 2, top] as [number, number],
    bottomCenter: [left + width / 2, top + height] as [number, number],
  };
}

function setContainerTop(container: HTMLElement, top: number) {
  setStyleIfNeeded(container, 'top', `${top}px`);
}

function stackPair(groupsByTitle: Map<TargetTitle, TargetGroup>, upperTitle: TargetTitle, lowerTitle: TargetTitle, scale: number) {
  const upper = groupsByTitle.get(upperTitle);
  const lower = groupsByTitle.get(lowerTitle);
  if (!upper || !lower) return;

  const upperBox = getBox(upper.container, scale);
  const expectedLowerTop = upperBox.top + upperBox.height + BRANCH_VERTICAL_GAP;
  const currentLowerTop = parsePixelValue(lower.container.style.top) ?? lower.container.offsetTop;
  if (currentLowerTop < expectedLowerTop) setContainerTop(lower.container, expectedLowerTop);
}

function stackDependentGroups(groups: TargetGroup[]) {
  const layer = groups[0]?.container ? getLayer(groups[0].container) : null;
  const scale = parseScale(layer?.style.transform || '');
  const byTitle = new Map<TargetTitle, TargetGroup>();
  groups.forEach((group) => byTitle.set(group.title, group));

  stackPair(byTitle, 'tios paternos', 'primos paternos', scale);
  stackPair(byTitle, 'irmaos', 'sobrinhos', scale);
  stackPair(byTitle, 'tios maternos', 'primos maternos', scale);
  stackPair(byTitle, 'filhos', 'netos', scale);
}

function pathBetween(from: [number, number], to: [number, number], mode: 'vertical' | 'branch') {
  if (mode === 'vertical') {
    if (Math.abs(from[0] - to[0]) < 1) return `M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`;
    const midY = from[1] + (to[1] - from[1]) / 2;
    return `M ${from[0]} ${from[1]} L ${from[0]} ${midY} L ${to[0]} ${midY} L ${to[0]} ${to[1]}`;
  }

  const junctionY = to[1] - 18;
  return `M ${from[0]} ${from[1]} L ${from[0]} ${junctionY} L ${to[0]} ${junctionY} L ${to[0]} ${to[1]}`;
}

function createPath(d: string) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', CONNECTOR_COLOR);
  path.setAttribute('stroke-width', String(CONNECTOR_WIDTH));
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  return path;
}

function renderConnectorOverlay(groups: TargetGroup[]) {
  const firstContainer = groups[0]?.container;
  const layer = firstContainer ? getLayer(firstContainer) : null;
  if (!layer) return;

  const scale = parseScale(layer.style.transform || '');
  const width = parsePixelValue(layer.style.width) ?? layer.getBoundingClientRect().width / scale;
  const height = parsePixelValue(layer.style.height) ?? layer.getBoundingClientRect().height / scale;
  const central = document.querySelector<HTMLElement>('[data-family-map-central-card="true"]');
  const spouse = Array.from(document.querySelectorAll<HTMLElement>('[data-family-map-spouse-tone="true"]'))
    .map((element) => element.closest<HTMLElement>('.absolute'))
    .find((element) => element?.parentElement === layer) ?? null;

  const boxes = new Map<TargetTitle, ReturnType<typeof getBox>>();
  groups.forEach((group) => boxes.set(group.title, getBox(group.container, scale)));

  const paths: string[] = [];
  const centralBox = central ? getBox(central, scale) : null;
  const spouseBox = spouse ? getBox(spouse, scale) : null;
  const appendDirect = (upperTitle: TargetTitle, lowerTitle: TargetTitle) => {
    const upper = boxes.get(upperTitle);
    const lower = boxes.get(lowerTitle);
    if (upper && lower) paths.push(pathBetween(upper.bottomCenter, lower.topCenter, 'vertical'));
  };

  if (centralBox && boxes.get('irmaos')) paths.push(pathBetween(centralBox.bottomCenter, boxes.get('irmaos')!.topCenter, 'branch'));
  appendDirect('tios paternos', 'primos paternos');
  appendDirect('irmaos', 'sobrinhos');
  appendDirect('tios maternos', 'primos maternos');
  if (spouseBox && boxes.get('filhos')) paths.push(pathBetween(spouseBox.bottomCenter, boxes.get('filhos')!.topCenter, 'branch'));
  appendDirect('filhos', 'netos');

  const signature = JSON.stringify({ width, height, paths });
  const existing = layer.querySelector<SVGSVGElement>(OVERLAY_SELECTOR);
  if (existing?.getAttribute(OVERLAY_SIGNATURE_ATTR) === signature) return;

  if (paths.length === 0) {
    existing?.remove();
    return;
  }

  const svg = existing ?? document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('data-family-map-perspective-connector-overlay', 'true');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute(OVERLAY_SIGNATURE_ATTR, signature);
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.pointerEvents = 'none';
  svg.style.zIndex = '5';
  svg.replaceChildren(...paths.map(createPath));
  if (!existing) layer.appendChild(svg);
}

function applyPerspectiveBranchFixes() {
  if (!isEnabled()) return;
  ensureStyles();
  const groups = Array.from(document.querySelectorAll<HTMLElement>(GROUP_SELECTOR))
    .map(configureGroup)
    .filter((group): group is TargetGroup => Boolean(group));
  stackDependentGroups(groups);
  renderConnectorOverlay(groups);
}

function scheduleApplyPerspectiveBranchFixes() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyPerspectiveBranchFixes();
  });
}

function scheduleAfterInteraction() {
  [0, 100, 240, 520, 1000].forEach((delay) => window.setTimeout(applyPerspectiveBranchFixes, delay));
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyPerspectiveBranchFixes();
  [80, 240, 520, 1000, 1800, 3200].forEach((delay) => window.setTimeout(applyPerspectiveBranchFixes, delay));

  const observer = new MutationObserver(scheduleApplyPerspectiveBranchFixes);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'aria-label', 'title', 'style'],
  });

  window.addEventListener('resize', scheduleAfterInteraction, { passive: true });
  window.addEventListener('popstate', scheduleAfterInteraction, { passive: true });
  document.addEventListener('click', scheduleAfterInteraction, { capture: true, passive: true });
  document.addEventListener('visibilitychange', scheduleAfterInteraction, { passive: true });
}

export {};
