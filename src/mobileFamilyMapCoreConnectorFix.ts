const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const CORE_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="core"]';
const PATERNAL_UNCLES_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="paternal-uncles"]';
const MATERNAL_UNCLES_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="maternal-uncles"]';
const UNCLE_SCREEN_SELECTORS = [
  PATERNAL_UNCLES_SCREEN_SELECTOR,
  MATERNAL_UNCLES_SCREEN_SELECTOR,
];
const STYLE_ID = 'mobile-family-map-core-connector-fix-style';
const CONNECTOR_WIDTH = 2;
const CONNECTOR_MIN_LENGTH = 36;
let scheduled = false;

type UncleBranchScreen = 'paternal-uncles' | 'maternal-uncles';
type UncleBranchConnectorKind = 'down' | 'horizontal';

type UncleBranchConfig = {
  screenName: UncleBranchScreen;
  selector: string;
  horizontalDirection: 'left' | 'right';
};

type RelativeRect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

const UNCLE_BRANCH_CONFIGS: UncleBranchConfig[] = [
  {
    screenName: 'paternal-uncles',
    selector: PATERNAL_UNCLES_SCREEN_SELECTOR,
    horizontalDirection: 'right',
  },
  {
    screenName: 'maternal-uncles',
    selector: MATERNAL_UNCLES_SCREEN_SELECTOR,
    horizontalDirection: 'left',
  },
];

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function setAttributeIfNeeded(element: HTMLElement, name: string, value: string) {
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function setStyleIfNeeded(element: HTMLElement, property: string, value: string) {
  if (element.style.getPropertyValue(property) !== value) {
    element.style.setProperty(property, value, 'important');
  }
}

function ensureStyles() {
  if (typeof document === 'undefined') return;

  const css = `
    @media (max-width: 767px) {
      [data-mobile-core-center-descendant-line="hidden"],
      [data-mobile-uncle-main-vertical-connector="hidden"],
      [data-mobile-uncle-native-connector="hidden"],
      ${CORE_SCREEN_SELECTOR} [data-mobile-family-tree-descendant-source="true"],
      ${CORE_SCREEN_SELECTOR} [data-mobile-family-tree-descendant-connector="true"],
      ${CORE_SCREEN_SELECTOR} [data-mobile-tree-scroll] > div > div.grid.grid-cols-2.items-start.gap-3 {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }

      [data-mobile-maternal-uncle-down-connector="true"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }

      [data-mobile-uncle-branch-connector] {
        display: block !important;
        position: absolute !important;
        z-index: 0 !important;
        margin: 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: none !important;
        border: 0 !important;
      }

      [data-mobile-uncle-branch-connector="down"] {
        width: ${CONNECTOR_WIDTH}px !important;
        min-width: ${CONNECTOR_WIDTH}px !important;
        transform: translateX(-50%) !important;
      }

      [data-mobile-uncle-branch-connector="horizontal"] {
        height: ${CONNECTOR_WIDTH}px !important;
        min-height: ${CONNECTOR_WIDTH}px !important;
        transform: translateY(-50%) !important;
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

function getStandardConnectorBackground(screen: HTMLElement) {
  const standardConnector = Array.from(screen.querySelectorAll<HTMLElement>('.bg-cyan-600'))
    .find((element) => (
      element.getAttribute('data-mobile-maternal-uncle-down-connector') !== 'true'
      && !element.hasAttribute('data-mobile-uncle-branch-connector')
      && element.getAttribute('data-mobile-uncle-native-connector') !== 'hidden'
    ));
  const color = standardConnector ? window.getComputedStyle(standardConnector).backgroundColor : '';
  return color && color !== 'rgba(0, 0, 0, 0)' ? color : '';
}

function markCoreCenterDescendantLine() {
  const coreScreen = document.querySelector<HTMLElement>(CORE_SCREEN_SELECTOR);
  if (!coreScreen) return;

  const connectorBlocks = Array.from(coreScreen.querySelectorAll<HTMLElement>('div.relative.mx-auto.h-9.w-full'));

  connectorBlocks.forEach((block) => {
    const firstChild = block.firstElementChild;
    if (!(firstChild instanceof HTMLElement)) return;

    const isCenterLine = firstChild.classList.contains('left-1/2')
      && firstChild.classList.contains('top-0')
      && firstChild.classList.contains('h-5')
      && firstChild.classList.contains('w-px')
      && firstChild.classList.contains('bg-cyan-600');

    if (isCenterLine) {
      setAttributeIfNeeded(firstChild, 'data-mobile-core-center-descendant-line', 'hidden');
      setAttributeIfNeeded(firstChild, 'aria-hidden', 'true');
    }
  });
}

function markUncleVerticalConnectors() {
  UNCLE_SCREEN_SELECTORS.forEach((selector) => {
    const screen = document.querySelector<HTMLElement>(selector);
    const screenBody = screen?.querySelector<HTMLElement>(':scope > div');
    if (!screenBody) return;

    Array.from(screenBody.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;

      const isMainVerticalConnector = child.classList.contains('left-1/2')
        && child.classList.contains('w-px')
        && child.classList.contains('bg-cyan-600')
        && child.classList.contains('absolute');
      const isNativeBranchConnector = child.classList.contains('pointer-events-none')
        && child.classList.contains('absolute')
        && (
          child.classList.contains('bg-cyan-600')
          || child.classList.contains('border-cyan-600')
          || child.classList.contains('border-t')
          || child.classList.contains('border-l')
          || child.classList.contains('border-r')
        );

      if (isMainVerticalConnector) {
        setAttributeIfNeeded(child, 'data-mobile-uncle-main-vertical-connector', 'hidden');
        setAttributeIfNeeded(child, 'aria-hidden', 'true');
      }

      if (isNativeBranchConnector) {
        setAttributeIfNeeded(child, 'data-mobile-uncle-native-connector', 'hidden');
        setAttributeIfNeeded(child, 'aria-hidden', 'true');
      }
    });
  });
}

function getUncleBranchGeometry(screen: HTMLElement) {
  const contentWrapper = screen.querySelector<HTMLElement>(':scope > div > div[class*="z-10"] > div');
  const section = contentWrapper?.querySelector<HTMLElement>('section') ?? null;
  const hasCards = Boolean(contentWrapper?.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key]'));

  return { section, hasCards };
}

function getRelativeRect(element: HTMLElement, root: HTMLElement): RelativeRect {
  const elementRect = element.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const top = Math.max(0, elementRect.top - rootRect.top);
  const left = Math.max(0, elementRect.left - rootRect.left);
  const width = Math.max(0, elementRect.width);
  const height = Math.max(0, elementRect.height);
  const right = left + width;
  const bottom = top + height;

  return {
    top,
    right,
    bottom,
    left,
    width,
    height,
    centerX: left + width / 2,
    centerY: top + height / 2,
  };
}

function getUncleConnector(
  screen: HTMLElement,
  screenName: UncleBranchScreen,
  kind: UncleBranchConnectorKind,
) {
  return screen.querySelector<HTMLElement>(
    `:scope > [data-mobile-uncle-branch-connector="${kind}"][data-mobile-uncle-branch-screen="${screenName}"]`,
  );
}

function ensureUncleConnector(
  screen: HTMLElement,
  screenName: UncleBranchScreen,
  kind: UncleBranchConnectorKind,
) {
  let connector = getUncleConnector(screen, screenName, kind);
  if (!connector) {
    connector = document.createElement('div');
    connector.className = 'bg-cyan-600';
    connector.setAttribute('data-mobile-uncle-branch-connector', kind);
    connector.setAttribute('data-mobile-uncle-branch-screen', screenName);
    connector.setAttribute('aria-hidden', 'true');
    screen.appendChild(connector);
  }

  return connector;
}

function removeUncleConnector(
  screen: HTMLElement,
  screenName: UncleBranchScreen,
  kind: UncleBranchConnectorKind,
) {
  getUncleConnector(screen, screenName, kind)?.remove();
}

function clearLegacyMaternalDownConnector(screen: HTMLElement) {
  screen.querySelector<HTMLElement>(':scope > [data-mobile-maternal-uncle-down-connector="true"]')?.remove();
}

function applyConnectorBackground(connector: HTMLElement, screen: HTMLElement) {
  const standardBackground = getStandardConnectorBackground(screen);
  if (standardBackground) connector.style.setProperty('background', standardBackground, 'important');
}

function applyDownConnector(
  connector: HTMLElement,
  screen: HTMLElement,
  sectionRect: RelativeRect,
) {
  const top = Math.max(0, sectionRect.bottom);
  const screenHeight = Math.max(screen.scrollHeight, screen.clientHeight);
  const height = Math.max(CONNECTOR_MIN_LENGTH, screenHeight - top);

  setStyleIfNeeded(connector, 'left', `${sectionRect.centerX}px`);
  setStyleIfNeeded(connector, 'top', `${top}px`);
  setStyleIfNeeded(connector, 'bottom', 'auto');
  setStyleIfNeeded(connector, 'width', `${CONNECTOR_WIDTH}px`);
  setStyleIfNeeded(connector, 'height', `${height}px`);
}

function applyHorizontalConnector(
  connector: HTMLElement,
  screen: HTMLElement,
  sectionRect: RelativeRect,
  direction: 'left' | 'right',
) {
  const top = Math.max(0, sectionRect.centerY);
  const screenWidth = Math.max(screen.scrollWidth, screen.clientWidth);

  setStyleIfNeeded(connector, 'top', `${top}px`);
  setStyleIfNeeded(connector, 'height', `${CONNECTOR_WIDTH}px`);

  if (direction === 'right') {
    const left = Math.max(0, sectionRect.right);
    const width = Math.max(CONNECTOR_MIN_LENGTH, screenWidth - left);

    setStyleIfNeeded(connector, 'left', `${left}px`);
    setStyleIfNeeded(connector, 'right', 'auto');
    setStyleIfNeeded(connector, 'width', `${width}px`);
    return;
  }

  const width = Math.max(CONNECTOR_MIN_LENGTH, sectionRect.left);

  setStyleIfNeeded(connector, 'left', '0px');
  setStyleIfNeeded(connector, 'right', 'auto');
  setStyleIfNeeded(connector, 'width', `${width}px`);
}

function ensureUncleBranchConnectors() {
  UNCLE_BRANCH_CONFIGS.forEach((config) => {
    const screen = document.querySelector<HTMLElement>(config.selector);
    if (!screen) return;

    clearLegacyMaternalDownConnector(screen);

    const { section, hasCards } = getUncleBranchGeometry(screen);
    if (!section || !hasCards) {
      removeUncleConnector(screen, config.screenName, 'down');
      removeUncleConnector(screen, config.screenName, 'horizontal');
      return;
    }

    const sectionRect = getRelativeRect(section, screen);

    const downConnector = ensureUncleConnector(screen, config.screenName, 'down');
    applyDownConnector(downConnector, screen, sectionRect);
    applyConnectorBackground(downConnector, screen);

    const horizontalConnector = ensureUncleConnector(screen, config.screenName, 'horizontal');
    applyHorizontalConnector(horizontalConnector, screen, sectionRect, config.horizontalDirection);
    applyConnectorBackground(horizontalConnector, screen);
  });
}

function applyConnectorFixes() {
  if (!isEnabled()) return;
  ensureStyles();
  markCoreCenterDescendantLine();
  markUncleVerticalConnectors();
  ensureUncleBranchConnectors();
}

function scheduleMark() {
  if (scheduled) return;
  scheduled = true;

  window.requestAnimationFrame(() => {
    scheduled = false;
    applyConnectorFixes();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyConnectorFixes();
  [80, 240, 520, 1000].forEach((delay) => window.setTimeout(applyConnectorFixes, delay));

  const observer = new MutationObserver(scheduleMark);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style'],
  });

  window.addEventListener('resize', applyConnectorFixes, { passive: true });
  window.addEventListener('orientationchange', applyConnectorFixes, { passive: true });
  window.addEventListener('popstate', applyConnectorFixes, { passive: true });
  document.addEventListener('visibilitychange', applyConnectorFixes, { passive: true });
}

export {};
