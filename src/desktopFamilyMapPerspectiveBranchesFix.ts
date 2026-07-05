const DESKTOP_QUERY = '(min-width: 768px)';
const MAP_PATH = '/mapa-familiar';
const STYLE_ID = 'desktop-family-map-perspective-branches-fix-style';
const OVERLAY_SELECTOR = '[data-family-map-perspective-connector-overlay="true"]';
const GROUP_SELECTOR = '[data-family-map-group="true"]';
const GROUP_TITLE_SELECTOR = '[data-family-map-group-title="true"]';
const CARD_WIDTH = 166;
const GROUP_HORIZONTAL_PADDING = 24;
const GRID_GAP = 8;
const LEFT_BRANCH_X = 72;
const MAX_COLUMNS = 4;
const MAX_VISIBLE_WITHOUT_MANUAL_EXPAND = 12;
const BRANCH_VERTICAL_GAP = 56;
const CONNECTOR_COLOR = '#a5eef6';
const CONNECTOR_WIDTH = 2;
const TARGET_WIDTH = GROUP_HORIZONTAL_PADDING + MAX_COLUMNS * CARD_WIDTH + (MAX_COLUMNS - 1) * GRID_GAP;

let scheduled = false;

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
  branch: BranchSide;
  title: TargetTitle;
  cardCount: number;
  visibleCount: number;
  width: number;
  columns: 1 | 2 | 3 | 4;
};

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
  const position = window.getComputedStyle(container).position;
  return position === 'absolute' ? container : null;
}

function getLayer(container: HTMLElement) {
  const layer = container.parentElement;
  return layer instanceof HTMLElement ? layer : null;
}

function setStyleIfNeeded(element: HTMLElement, property: string, value: string) {
  if (element.style.getPropertyValue(property) !== value) element.style.setProperty(property, value);
}

function setAttributeIfNeeded(element: HTMLElement, name: string, value: string) {
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function ensureStyles() {
  const css = `
    @media (min-width: 768px) {
      [data-family-map-perspective-branch="left"],
      [data-family-map-perspective-branch="right"] {
        width: var(--family-map-perspective-width, ${TARGET_WIDTH}px) !important;
      }

      [data-family-map-perspective-branch="left"] ${GROUP_SELECTOR},
      [data-family-map-perspective-branch="right"] ${GROUP_SELECTOR} {
        width: 100% !important;
      }

      ${GROUP_SELECTOR}[data-family-map-perspective-columns="1"] > .grid {
        grid-template-columns: minmax(0, ${CARD_WIDTH}px) !important;
        justify-content: center !important;
      }

      ${GROUP_SELECTOR}[data-family-map-perspective-columns="2"] > .grid {
        grid-template-columns: repeat(2, minmax(0, ${CARD_WIDTH}px)) !important;
        justify-content: center !important;
      }

      ${GROUP_SELECTOR}[data-family-map-perspective-columns="3"] > .grid {
        grid-template-columns: repeat(3, minmax(0, ${CARD_WIDTH}px)) !important;
        justify-content: center !important;
      }

      ${GROUP_SELECTOR}[data-family-map-perspective-columns="4"] > .grid {
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
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

      ${GROUP_SELECTOR} > .grid > [data-family-map-perspective-spacer="true"] {
        min-width: 0 !important;
        pointer-events: none !important;
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

function countVisibleCards(section: HTMLElement) {
  const grid = section.querySelector<HTMLElement>(':scope > .grid');
  if (!grid) return 0;
  return Array.from(grid.children).filter((child) => (
    child instanceof HTMLElement
    && !child.hasAttribute('data-family-map-perspective-overflow')
    && Boolean(child.querySelector('[data-family-map-color-key]'))
  )).length;
}

function countCards(section: HTMLElement) {
  const grid = section.querySelector<HTMLElement>(':scope > .grid');
  if (!grid) return 0;
  return Array.from(grid.children).filter((child) => (
    child instanceof HTMLElement
    && Boolean(child.querySelector('[data-family-map-color-key]'))
  )).length;
}

function desiredColumns(visibleCount: number): 1 | 2 | 3 | 4 {
  if (visibleCount <= 1) return 1;
  if (visibleCount === 2) return 2;
  if (visibleCount === 3) return 3;
  return 4;
}

function desiredWidth(columns: 1 | 2 | 3 | 4) {
  return GROUP_HORIZONTAL_PADDING + columns * CARD_WIDTH + Math.max(0, columns - 1) * GRID_GAP;
}

function limitVisibleCards(section: HTMLElement) {
  const grid = section.querySelector<HTMLElement>(':scope > .grid');
  if (!grid) return;

  let renderedCards = 0;
  Array.from(grid.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) return;
    if (!child.hasAttribute('data-family-map-perspective-spacer')) {
      child.removeAttribute('data-family-map-perspective-overflow');
    }
    if (!child.querySelector('[data-family-map-color-key]')) return;

    renderedCards += 1;
    if (renderedCards > MAX_VISIBLE_WITHOUT_MANUAL_EXPAND) {
      child.setAttribute('data-family-map-perspective-overflow', 'true');
    }
  });
}

function hasLateralSpouseConnector(wrapper: HTMLElement) {
  return Array.from(wrapper.querySelectorAll<HTMLElement>('span[aria-hidden="true"]'))
    .some((span) => span.className.includes('border-cyan-500'));
}

function arrangeSpousePairs(section: HTMLElement, columns: 1 | 2 | 3 | 4) {
  const grid = section.querySelector<HTMLElement>(':scope > .grid');
  if (!grid || columns < 2) return;

  grid.querySelectorAll<HTMLElement>('[data-family-map-perspective-spacer="true"]').forEach((spacer) => spacer.remove());

  const wrappers = Array.from(grid.children).filter((child): child is HTMLElement => (
    child instanceof HTMLElement
    && !child.hasAttribute('data-family-map-perspective-overflow')
    && Boolean(child.querySelector('[data-family-map-color-key]'))
  ));

  wrappers.forEach((wrapper) => {
    if (!hasLateralSpouseConnector(wrapper)) return;

    const currentChildren = Array.from(grid.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
    const index = currentChildren.indexOf(wrapper);
    const previous = currentChildren[index - 1];
    if (!(previous instanceof HTMLElement) || !previous.querySelector('[data-family-map-color-key]')) return;

    const startsNewRow = index >= 0 && index % columns === 0;
    if (!startsNewRow) return;

    const spacer = document.createElement('div');
    spacer.className = 'min-w-0';
    spacer.setAttribute('data-family-map-perspective-spacer', 'true');
    spacer.setAttribute('aria-hidden', 'true');
    grid.insertBefore(spacer, previous);
  });
}

function storeOriginalGeometry(container: HTMLElement) {
  if (!container.dataset.familyMapPerspectiveOriginalLeft) {
    container.dataset.familyMapPerspectiveOriginalLeft = String(parsePixelValue(container.style.left) ?? container.offsetLeft);
  }
  if (!container.dataset.familyMapPerspectiveOriginalWidth) {
    container.dataset.familyMapPerspectiveOriginalWidth = String(parsePixelValue(container.style.width) ?? container.getBoundingClientRect().width);
  }
  if (!container.dataset.familyMapPerspectiveOriginalTop) {
    container.dataset.familyMapPerspectiveOriginalTop = String(parsePixelValue(container.style.top) ?? container.offsetTop);
  }
}

function getOriginalLeft(container: HTMLElement) {
  return parsePixelValue(container.dataset.familyMapPerspectiveOriginalLeft) ?? parsePixelValue(container.style.left) ?? 0;
}

function getOriginalWidth(container: HTMLElement) {
  return parsePixelValue(container.dataset.familyMapPerspectiveOriginalWidth) ?? parsePixelValue(container.style.width) ?? container.getBoundingClientRect().width;
}

function positionContainer(container: HTMLElement, branch: BranchSide, width: number) {
  storeOriginalGeometry(container);

  const originalLeft = getOriginalLeft(container);
  const originalWidth = getOriginalWidth(container);
  const originalCenter = originalLeft + originalWidth / 2;
  const nextLeft = branch === 'left'
    ? LEFT_BRANCH_X
    : originalCenter - width / 2;

  setStyleIfNeeded(container, 'width', `${width}px`);
  setStyleIfNeeded(container, 'left', `${nextLeft}px`);
  setStyleIfNeeded(container, '--family-map-perspective-width', `${width}px`);
  setAttributeIfNeeded(container, 'data-family-map-perspective-branch', branch);
}

function configureGroup(section: HTMLElement): TargetGroup | null {
  const targetTitle = getTargetTitle(getGroupTitle(section));
  const container = getAbsoluteContainer(section);
  if (!targetTitle || !container) return null;

  const branch = getTargetBranch(targetTitle);
  expandGroupIfNeeded(section);
  limitVisibleCards(section);

  const cardCount = countCards(section);
  const visibleCount = Math.min(MAX_VISIBLE_WITHOUT_MANUAL_EXPAND, countVisibleCards(section) || cardCount);
  const columns = desiredColumns(visibleCount);
  const width = desiredWidth(columns);

  setAttributeIfNeeded(section, 'data-family-map-perspective-branch-section', branch);
  setAttributeIfNeeded(section, 'data-family-map-perspective-columns', String(columns));
  positionContainer(container, branch, width);
  arrangeSpousePairs(section, columns);

  return { section, container, branch, title: targetTitle, cardCount, visibleCount, width, columns };
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

  if (currentLowerTop < expectedLowerTop) {
    setContainerTop(lower.container, expectedLowerTop);
  }
}

function stackDependentGroups(groups: TargetGroup[]) {
  const layer = groups[0]?.container ? getLayer(groups[0].container) : null;
  const scale = parseScale(layer?.style.transform || '');
  const groupsByTitle = new Map<TargetTitle, TargetGroup>();
  groups.forEach((group) => groupsByTitle.set(group.title, group));

  stackPair(groupsByTitle, 'tios paternos', 'primos paternos', scale);
  stackPair(groupsByTitle, 'irmaos', 'sobrinhos', scale);
  stackPair(groupsByTitle, 'tios maternos', 'primos maternos', scale);
  stackPair(groupsByTitle, 'filhos', 'netos', scale);
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

function appendPath(svg: SVGSVGElement, d: string) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', CONNECTOR_COLOR);
  path.setAttribute('stroke-width', String(CONNECTOR_WIDTH));
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);
}

function renderConnectorOverlay(groups: TargetGroup[]) {
  const firstContainer = groups[0]?.container;
  const layer = firstContainer ? getLayer(firstContainer) : null;
  if (!layer) return;

  layer.querySelector(OVERLAY_SELECTOR)?.remove();

  const scale = parseScale(layer.style.transform || '');
  const width = parsePixelValue(layer.style.width) ?? layer.getBoundingClientRect().width / scale;
  const height = parsePixelValue(layer.style.height) ?? layer.getBoundingClientRect().height / scale;
  const byTitle = new Map(groups.map((group) => [group.title, group]));
  const central = document.querySelector<HTMLElement>('[data-family-map-central-card="true"]');
  const spouse = Array.from(document.querySelectorAll<HTMLElement>('[data-family-map-spouse-tone="true"]'))
    .map((element) => element.closest<HTMLElement>('.absolute'))
    .find((element) => element?.parentElement === layer) ?? null;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('data-family-map-perspective-connector-overlay', 'true');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.pointerEvents = 'none';
  svg.style.zIndex = '5';

  const centralBox = central ? getBox(central, scale) : null;
  const spouseBox = spouse ? getBox(spouse, scale) : null;
  const boxes = new Map<TargetTitle, ReturnType<typeof getBox>>();
  groups.forEach((group) => boxes.set(group.title, getBox(group.container, scale)));

  const appendDirect = (upperTitle: TargetTitle, lowerTitle: TargetTitle) => {
    const upper = boxes.get(upperTitle);
    const lower = boxes.get(lowerTitle);
    if (upper && lower) appendPath(svg, pathBetween(upper.bottomCenter, lower.topCenter, 'vertical'));
  };

  if (centralBox && boxes.get('irmaos')) appendPath(svg, pathBetween(centralBox.bottomCenter, boxes.get('irmaos')!.topCenter, 'branch'));
  appendDirect('tios paternos', 'primos paternos');
  appendDirect('irmaos', 'sobrinhos');
  appendDirect('tios maternos', 'primos maternos');
  if (spouseBox && boxes.get('filhos')) appendPath(svg, pathBetween(spouseBox.bottomCenter, boxes.get('filhos')!.topCenter, 'branch'));
  appendDirect('filhos', 'netos');

  layer.appendChild(svg);
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
  [120, 360, 800].forEach((delay) => window.setTimeout(applyPerspectiveBranchFixes, delay));
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyPerspectiveBranchFixes();
  [80, 240, 520, 1000].forEach((delay) => window.setTimeout(applyPerspectiveBranchFixes, delay));

  const observer = new MutationObserver(scheduleApplyPerspectiveBranchFixes);
  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'aria-label', 'title'],
  });

  window.addEventListener('resize', applyPerspectiveBranchFixes, { passive: true });
  window.addEventListener('popstate', applyPerspectiveBranchFixes, { passive: true });
  document.addEventListener('click', scheduleAfterInteraction, { capture: true, passive: true });
  document.addEventListener('visibilitychange', applyPerspectiveBranchFixes, { passive: true });
}

export {};
