const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const DESCENDANTS_SCREEN_SELECTOR = '.mobile-family-descendant-screen, [data-mobile-family-tree-screen="descendants"]';
const DESCENDANTS_INNER_SELECTOR = '.mobile-family-descendant-screen__inner';
const DESCENDANTS_GRID_SELECTOR = '.mobile-family-descendant-screen__grid';
const MOBILE_CARD_SELECTOR = '[data-family-map-mobile-card="true"]';
const CONNECTOR_LAYER_ATTR = 'data-mobile-family-tree-descendant-connectors';
const STYLE_ID = 'mobile-family-tree-descendant-connectors-style';
const DESCENDANT_BRANCH_GAP = 56;
const DESCENDANT_BRANCH_MIN_Y = 72;
const SPOUSE_BRANCH_GAP = 32;

let scheduledFrame = 0;
let observer: MutationObserver | null = null;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === FAMILY_MAP_PATH;
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getDescendantsScreen(root = getRoot()) {
  return root?.querySelector<HTMLElement>(DESCENDANTS_SCREEN_SELECTOR) ?? null;
}

function getConnectorHost(screen: HTMLElement) {
  return screen.querySelector<HTMLElement>(DESCENDANTS_INNER_SELECTOR) ?? screen;
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getSearchScope(screen: HTMLElement) {
  return screen.querySelector<HTMLElement>(DESCENDANTS_GRID_SELECTOR) ?? screen;
}

function getGroupTitle(section: HTMLElement) {
  return normalize(section.querySelector('h2, h3')?.textContent ?? '');
}

function findGroup(screen: HTMLElement, titlePart: string) {
  const normalizedTitlePart = normalize(titlePart);
  const scope = getSearchScope(screen);

  return Array.from(scope.querySelectorAll<HTMLElement>('section'))
    .find((section) => (
      section.querySelector(MOBILE_CARD_SELECTOR)
      && getGroupTitle(section).includes(normalizedTitlePart)
    )) ?? null;
}

function getVisibleGroupBox(section: HTMLElement) {
  return Array.from(section.children)
    .find((child): child is HTMLElement => (
      child instanceof HTMLElement
      && child.querySelector('h2, h3') !== null
      && child.querySelector(MOBILE_CARD_SELECTOR) !== null
    )) ?? section;
}

function ensureStyles() {
  const existing = document.getElementById(STYLE_ID);
  existing?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${ROOT_SELECTOR} {
        --mobile-family-tree-connector-color: var(--tree-palette-edge-child, var(--tree-palette-line, #6B7A5E));
        --mobile-family-tree-connector-width: var(--tree-palette-line-width, 3px);
      }

      .mobile-family-descendant-screen,
      [data-mobile-family-tree-screen="descendants"] {
        overflow: visible !important;
        isolation: isolate;
      }

      .mobile-family-descendant-screen__scroll {
        padding-top: 0 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }

      .mobile-family-descendant-screen__inner {
        position: relative !important;
        padding-top: 0 !important;
        overflow: visible !important;
      }

      .mobile-family-descendant-screen__connector,
      .mobile-family-descendant-screen__connector *,
      .mobile-family-descendant-screen section > div[class*="absolute"][class*="bg-cyan-600"],
      [data-mobile-family-tree-screen="descendants"] section > div[class*="absolute"][class*="bg-cyan-600"] {
        display: none !important;
      }

      [data-mobile-family-tree-spouse-branch-count="1"] {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      [data-mobile-family-tree-spouse-branch-count="2"] {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      [${CONNECTOR_LAYER_ATTR}="true"] {
        position: absolute;
        inset: 0;
        z-index: 8;
        overflow: visible;
        pointer-events: none;
      }

      .mobile-family-descendant-connector-line {
        position: absolute;
        z-index: 8;
        display: block;
        border-radius: 0;
        background: var(--mobile-family-tree-connector-color);
        opacity: 1;
        pointer-events: none;
      }

      .mobile-family-descendant-screen section,
      [data-mobile-family-tree-screen="descendants"] section {
        position: relative !important;
        z-index: 10 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function getConnectorLayer(host: HTMLElement) {
  let layer = host.querySelector<HTMLElement>(`:scope > [${CONNECTOR_LAYER_ATTR}="true"]`);

  if (!layer) {
    layer = document.createElement('div');
    layer.setAttribute(CONNECTOR_LAYER_ATTR, 'true');
    host.prepend(layer);
  }

  return layer;
}

function getLineWidth(root: HTMLElement) {
  const rootStyles = getComputedStyle(root);
  const customWidth = rootStyles.getPropertyValue('--mobile-family-tree-connector-width').trim()
    || rootStyles.getPropertyValue('--tree-palette-line-width').trim();
  const parsed = Number.parseFloat(customWidth);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
}

function createLine(layer: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  const line = document.createElement('span');
  line.className = 'mobile-family-descendant-connector-line';
  Object.assign(line.style, styles);
  layer.appendChild(line);
}

function getRelativeRect(element: HTMLElement, hostRect: DOMRect) {
  const rect = element.getBoundingClientRect();

  return {
    left: rect.left - hostRect.left,
    right: rect.right - hostRect.left,
    top: rect.top - hostRect.top,
    bottom: rect.bottom - hostRect.top,
    width: rect.width,
    height: rect.height,
    centerX: rect.left - hostRect.left + rect.width / 2,
  };
}

function getBranchY(groupTop: number, lineWidth: number) {
  const preferredY = groupTop - DESCENDANT_BRANCH_GAP;
  const visibleY = Math.max(DESCENDANT_BRANCH_MIN_Y, preferredY);
  return Math.max(lineWidth, Math.min(visibleY, groupTop - lineWidth));
}

function prepareSpouseBranchLayout(pets: HTMLElement | null, children: HTMLElement | null) {
  const branchGroups = [pets, children].filter((group): group is HTMLElement => Boolean(group));
  const branchParent = branchGroups[0]?.parentElement;
  if (!branchParent) return;

  branchParent.setAttribute('data-mobile-family-tree-spouse-branch-count', String(branchGroups.length));
  branchGroups.forEach((group) => group.removeAttribute('data-mobile-family-tree-single-spouse-branch'));

  if (branchGroups.length === 1) {
    branchGroups[0].setAttribute('data-mobile-family-tree-single-spouse-branch', 'true');
  }
}

function renderConnectorToChildGroups(
  layer: HTMLElement,
  parentRect: ReturnType<typeof getRelativeRect>,
  childRects: Array<ReturnType<typeof getRelativeRect>>,
  lineWidth: number,
) {
  if (childRects.length === 0) return;

  const halfLine = lineWidth / 2;
  const overlap = Math.max(2, lineWidth);

  if (childRects.length === 1) {
    const childRect = childRects[0];
    const startY = parentRect.bottom - overlap;
    const endY = childRect.top + overlap;

    createLine(layer, {
      left: `${parentRect.centerX - halfLine}px`,
      top: `${startY}px`,
      width: `${lineWidth}px`,
      height: `${Math.max(0, endY - startY)}px`,
    });
    return;
  }

  const groupTop = Math.min(...childRects.map((rect) => rect.top));
  const branchY = Math.max(parentRect.bottom + lineWidth, Math.min(groupTop - lineWidth, groupTop - SPOUSE_BRANCH_GAP));
  const branchLeft = Math.min(...childRects.map((rect) => rect.centerX));
  const branchRight = Math.max(...childRects.map((rect) => rect.centerX));

  createLine(layer, {
    left: `${parentRect.centerX - halfLine}px`,
    top: `${parentRect.bottom - overlap}px`,
    width: `${lineWidth}px`,
    height: `${Math.max(0, branchY - parentRect.bottom + overlap + halfLine)}px`,
  });

  createLine(layer, {
    left: `${branchLeft}px`,
    top: `${branchY - halfLine}px`,
    width: `${Math.max(0, branchRight - branchLeft)}px`,
    height: `${lineWidth}px`,
  });

  childRects.forEach((childRect) => {
    createLine(layer, {
      left: `${childRect.centerX - halfLine}px`,
      top: `${branchY}px`,
      width: `${lineWidth}px`,
      height: `${Math.max(0, childRect.top - branchY + overlap)}px`,
    });
  });
}

function renderConnectors() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;

  const root = getRoot();
  const screen = getDescendantsScreen(root);
  if (!root || !screen) return;

  ensureStyles();

  const host = getConnectorHost(screen);
  const hostRect = host.getBoundingClientRect();
  if (hostRect.width <= 0 || hostRect.height <= 0) return;

  const siblings = findGroup(screen, 'irmãos');
  const spouses = findGroup(screen, 'cônjuge');
  const nephews = findGroup(screen, 'sobrinhos');
  const pets = findGroup(screen, 'pets');
  const children = findGroup(screen, 'filhos');
  prepareSpouseBranchLayout(pets, children);

  const layer = getConnectorLayer(host);
  layer.replaceChildren();

  const lineWidth = getLineWidth(root);
  const halfLine = lineWidth / 2;
  const overlap = Math.max(2, lineWidth);

  if (siblings && spouses) {
    const siblingsBoxRect = getRelativeRect(getVisibleGroupBox(siblings), hostRect);
    const spousesBoxRect = getRelativeRect(getVisibleGroupBox(spouses), hostRect);
    const groupTop = Math.min(siblingsBoxRect.top, spousesBoxRect.top);
    const branchY = getBranchY(groupTop, lineWidth);
    const trunkX = (siblingsBoxRect.centerX + spousesBoxRect.centerX) / 2;
    const branchLeft = Math.min(siblingsBoxRect.centerX, spousesBoxRect.centerX);
    const branchRight = Math.max(siblingsBoxRect.centerX, spousesBoxRect.centerX);

    createLine(layer, {
      left: `${trunkX - halfLine}px`,
      top: '0px',
      width: `${lineWidth}px`,
      height: `${Math.max(0, branchY + halfLine)}px`,
    });

    createLine(layer, {
      left: `${branchLeft}px`,
      top: `${branchY - halfLine}px`,
      width: `${Math.max(0, branchRight - branchLeft)}px`,
      height: `${lineWidth}px`,
    });

    createLine(layer, {
      left: `${siblingsBoxRect.centerX - halfLine}px`,
      top: `${branchY}px`,
      width: `${lineWidth}px`,
      height: `${Math.max(0, siblingsBoxRect.top - branchY + overlap)}px`,
    });

    createLine(layer, {
      left: `${spousesBoxRect.centerX - halfLine}px`,
      top: `${branchY}px`,
      width: `${lineWidth}px`,
      height: `${Math.max(0, spousesBoxRect.top - branchY + overlap)}px`,
    });
  }

  if (siblings && nephews) {
    const siblingsBoxRect = getRelativeRect(getVisibleGroupBox(siblings), hostRect);
    const nephewsBoxRect = getRelativeRect(getVisibleGroupBox(nephews), hostRect);
    const startY = siblingsBoxRect.bottom - overlap;
    const endY = nephewsBoxRect.top + overlap;

    createLine(layer, {
      left: `${siblingsBoxRect.centerX - halfLine}px`,
      top: `${startY}px`,
      width: `${lineWidth}px`,
      height: `${Math.max(0, endY - startY)}px`,
    });
  }

  if (spouses && (pets || children)) {
    const spousesBoxRect = getRelativeRect(getVisibleGroupBox(spouses), hostRect);
    const branchRects = [pets, children]
      .filter((group): group is HTMLElement => Boolean(group))
      .map((group) => getRelativeRect(getVisibleGroupBox(group), hostRect));

    renderConnectorToChildGroups(layer, spousesBoxRect, branchRects, lineWidth);
  }
}

function scheduleRender() {
  if (!isMobileViewport() || !isFamilyMapPath()) return;
  if (scheduledFrame) window.cancelAnimationFrame(scheduledFrame);

  scheduledFrame = window.requestAnimationFrame(() => {
    scheduledFrame = 0;
    renderConnectors();
  });
}

function observeTree() {
  const root = getRoot();
  if (!root || observer) return;

  observer = new MutationObserver(() => scheduleRender());
  observer.observe(root, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function handleRouteOrViewportChange() {
  if (!isMobileViewport() || !isFamilyMapPath()) {
    document.querySelectorAll<HTMLElement>(`[${CONNECTOR_LAYER_ATTR}="true"]`).forEach((layer) => layer.remove());
    return;
  }

  observeTree();
  scheduleRender();
  window.setTimeout(scheduleRender, 120);
  window.setTimeout(scheduleRender, 360);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  handleRouteOrViewportChange();
  window.addEventListener('resize', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('orientationchange', handleRouteOrViewportChange, { passive: true });
  window.addEventListener('popstate', handleRouteOrViewportChange, { passive: true });
  document.addEventListener('visibilitychange', handleRouteOrViewportChange, { passive: true });
  document.addEventListener('click', () => window.setTimeout(scheduleRender, 80), { capture: true, passive: true });
  document.addEventListener('scroll', () => scheduleRender(), { capture: true, passive: true });
  document.addEventListener('touchend', () => window.setTimeout(scheduleRender, 80), { capture: true, passive: true });
  window.setTimeout(handleRouteOrViewportChange, 240);
  window.setTimeout(handleRouteOrViewportChange, 700);
}

export {};
