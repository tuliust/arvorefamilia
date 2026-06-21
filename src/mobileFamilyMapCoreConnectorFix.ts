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
let scheduled = false;

type UncleBranchScreen = 'paternal-uncles' | 'maternal-uncles';
type UncleBranchConnectorKind = 'down' | 'horizontal';

type UncleBranchConfig = {
  screenName: UncleBranchScreen;
  selector: string;
  horizontalDirection?: 'left' | 'right';
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
      }

      [data-mobile-uncle-branch-connector="down"] {
        left: 50% !important;
        bottom: 0 !important;
        width: 2px !important;
        height: auto !important;
        min-height: 2.25rem !important;
        transform: translateX(-50%) !important;
      }

      [data-mobile-uncle-branch-connector="horizontal"] {
        height: 2px !important;
        min-height: 2px !important;
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

    const screenRect = screen.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();

    const downConnector = ensureUncleConnector(screen, config.screenName, 'down');
    downConnector.style.setProperty('top', `${Math.max(0, sectionRect.bottom - screenRect.top)}px`, 'important');
    downConnector.style.setProperty('bottom', '0px', 'important');
    downConnector.style.setProperty('height', 'auto', 'important');
    applyConnectorBackground(downConnector, screen);

    const horizontalConnector = ensureUncleConnector(screen, config.screenName, 'horizontal');
    horizontalConnector.style.setProperty('top', `${Math.max(0, sectionRect.top + (sectionRect.height / 2) - screenRect.top)}px`, 'important');

    if (config.horizontalDirection === 'right') {
      horizontalConnector.style.setProperty('left', `${Math.max(0, sectionRect.right - screenRect.left)}px`, 'important');
      horizontalConnector.style.setProperty('right', '0px', 'important');
    } else {
      horizontalConnector.style.setProperty('left', '0px', 'important');
      horizontalConnector.style.setProperty('right', `${Math.max(0, screenRect.right - sectionRect.left)}px`, 'important');
    }

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
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', applyConnectorFixes, { passive: true });
  window.addEventListener('orientationchange', applyConnectorFixes, { passive: true });
  window.addEventListener('popstate', applyConnectorFixes, { passive: true });
  document.addEventListener('visibilitychange', applyConnectorFixes, { passive: true });
}

export {};
