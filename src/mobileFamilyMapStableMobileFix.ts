const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const HORIZONTAL_MAP_PATH = '/mapa-familiar-horizontal';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const HORIZONTAL_ROOT_SELECTOR = '[data-family-map-horizontal-mobile-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const TOOLBAR_SELECTOR = '[data-mobile-family-map-toolbar="true"]';
const TOOLBAR_ACTION_SELECTOR = '[data-mobile-family-map-toolbar-action]';
const TOOLBAR_ZOOM_SELECTOR = '[data-mobile-family-map-toolbar-action="zoom"]';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-map-stable-mobile-fix-style';
const DESCENDANTS_SCREEN = 'descendants';
const CORE_SCREEN = 'core';
const NAVIGATION_THRESHOLD = 56;
const PREVIEW_THRESHOLD = 8;

const DESCENDANT_KEYS = ['irmaos', 'sobrinhos', 'conjuge', 'pets', 'filhos', 'netos'];

type ScreenName =
  | 'paternal-ancestors'
  | 'ancestors'
  | 'maternal-ancestors'
  | 'paternal-uncles'
  | 'core'
  | 'maternal-uncles'
  | 'paternal-cousins'
  | 'descendants'
  | 'maternal-cousins';

type RouteKind = 'direct' | 'horizontal';

type GestureStart = {
  x: number;
  y: number;
  screen: ScreenName | null;
  scrollArea: HTMLElement | null;
};

const SCREEN_POSITIONS: Record<ScreenName, { column: number; row: number; title: string; subtitle: string; horizontalGeneration: number }> = {
  'paternal-ancestors': { column: 0, row: 0, title: 'Bisavós paternos', subtitle: 'Bisavós e tataravós paternos', horizontalGeneration: 1 },
  ancestors: { column: 1, row: 0, title: 'Avós', subtitle: 'Avós paternos e maternos', horizontalGeneration: 3 },
  'maternal-ancestors': { column: 2, row: 0, title: 'Bisavós maternos', subtitle: 'Bisavós e tataravós maternos', horizontalGeneration: 1 },
  'paternal-uncles': { column: 0, row: 1, title: 'Tios paternos', subtitle: 'Ramo do pai', horizontalGeneration: 4 },
  core: { column: 1, row: 1, title: 'Núcleo central', subtitle: 'Pais, pessoa principal e descendentes', horizontalGeneration: 5 },
  'maternal-uncles': { column: 2, row: 1, title: 'Tios maternos', subtitle: 'Ramo da mãe', horizontalGeneration: 4 },
  'paternal-cousins': { column: 0, row: 2, title: 'Primos paternos', subtitle: 'Descendentes dos tios paternos', horizontalGeneration: 5 },
  descendants: { column: 1, row: 2, title: 'Descendentes', subtitle: 'Irmãos, cônjuge, pets, filhos e netos', horizontalGeneration: 6 },
  'maternal-cousins': { column: 2, row: 2, title: 'Primos maternos', subtitle: 'Descendentes dos tios maternos', horizontalGeneration: 5 },
};

const SCREEN_ORDER = Object.keys(SCREEN_POSITIONS) as ScreenName[];
const DYNAMIC_TAB_SCREENS = new Set<ScreenName>(['paternal-ancestors', 'maternal-ancestors', 'descendants']);

let gestureStart: GestureStart | null = null;
let scheduled = false;
let lastZoomActivation = 0;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function normalizePathname() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

function getRouteKind(): RouteKind | null {
  const path = normalizePathname();
  if (path === DIRECT_MAP_PATH) return 'direct';
  if (path === HORIZONTAL_MAP_PATH) return 'horizontal';
  return null;
}

function isEnabled() {
  return isMobileViewport() && Boolean(getRouteKind());
}

function isScreenName(value: string | null | undefined): value is ScreenName {
  return Boolean(value && value in SCREEN_POSITIONS);
}

function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getHorizontalRoot() {
  return document.querySelector<HTMLElement>(HORIZONTAL_ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function getScreenElement(screenName: ScreenName, root = getRoot()) {
  return root?.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`) ?? null;
}

function descendantCardSelector() {
  return DESCENDANT_KEYS.map((key) => `[data-family-map-color-key="${key}"]`).join(', ');
}

function elementHasClassNames(element: Element, classNames: string[]) {
  return classNames.every((className) => element.classList.contains(className));
}

function getSourceGrid(root = getRoot()) {
  const coreScreen = getScreenElement(CORE_SCREEN, root);
  if (!coreScreen) return null;

  const selector = descendantCardSelector();
  return Array.from(coreScreen.querySelectorAll<HTMLElement>('div.grid'))
    .find((grid) => (
      elementHasClassNames(grid, ['grid-cols-2', 'items-start', 'gap-3'])
      && Boolean(grid.querySelector(selector))
    )) ?? null;
}

function getSourceConnector(sourceGrid: HTMLElement | null) {
  const previous = sourceGrid?.previousElementSibling;
  if (!(previous instanceof HTMLElement)) return null;

  return previous.classList.contains('relative')
    && previous.classList.contains('mx-auto')
    && previous.classList.contains('h-9')
    && previous.classList.contains('w-full')
    ? previous
    : null;
}

function descendantCardCount(root = getRoot()) {
  return getSourceGrid(root)?.querySelectorAll(descendantCardSelector()).length ?? 0;
}

function hasDescendantContent(root = getRoot()) {
  return descendantCardCount(root) > 0;
}

function relayCloneClicks(clone: HTMLElement, original: HTMLElement) {
  const originalButtons = Array.from(original.querySelectorAll<HTMLButtonElement>('button'));
  const cloneButtons = Array.from(clone.querySelectorAll<HTMLButtonElement>('button'));

  cloneButtons.forEach((button, index) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      originalButtons[index]?.click();
    });
  });
}

function clearCloneMarkers(element: HTMLElement) {
  element.removeAttribute('data-mobile-family-tree-descendant-source');
  element.removeAttribute('data-mobile-family-tree-descendant-connector');
  element.querySelectorAll<HTMLElement>('[data-mobile-family-tree-descendant-source], [data-mobile-family-tree-descendant-connector]').forEach((node) => {
    node.removeAttribute('data-mobile-family-tree-descendant-source');
    node.removeAttribute('data-mobile-family-tree-descendant-connector');
  });
}

function ensureDescendantScreen(root: HTMLElement) {
  if (getRouteKind() !== 'direct') return;
  const stage = getStage(root);
  const sourceGrid = getSourceGrid(root);
  const sourceConnector = getSourceConnector(sourceGrid);
  if (!stage || !sourceGrid || !hasDescendantContent(root)) return;

  sourceGrid.setAttribute('data-mobile-family-tree-descendant-source', 'true');
  sourceConnector?.setAttribute('data-mobile-family-tree-descendant-connector', 'true');

  let screen = stage.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${DESCENDANTS_SCREEN}"]`);
  if (!screen) {
    screen = document.createElement('div');
    screen.dataset.mobileFamilyTreeScreen = DESCENDANTS_SCREEN;
    screen.className = 'mobile-family-descendant-screen';
    screen.style.gridColumnStart = '2';
    screen.style.gridRowStart = '3';
    screen.style.height = '100%';
    screen.style.width = '100%';
    stage.appendChild(screen);
  }

  const signature = `${sourceGrid.textContent ?? ''}:${descendantCardCount(root)}`;
  if (screen.dataset.mobileStableDescendantSignature === signature) return;
  screen.dataset.mobileStableDescendantSignature = signature;
  screen.innerHTML = '';

  const scroll = document.createElement('div');
  scroll.className = 'mobile-family-descendant-screen__scroll';
  scroll.setAttribute('data-mobile-tree-scroll', 'true');
  scroll.setAttribute('data-stable-mobile-scroll', 'descendants');

  const inner = document.createElement('div');
  inner.className = 'mobile-family-descendant-screen__inner';

  if (sourceConnector) {
    const connectorClone = sourceConnector.cloneNode(true) as HTMLElement;
    clearCloneMarkers(connectorClone);
    connectorClone.classList.add('mobile-family-descendant-screen__connector');
    inner.appendChild(connectorClone);
  }

  const gridClone = sourceGrid.cloneNode(true) as HTMLElement;
  clearCloneMarkers(gridClone);
  gridClone.classList.add('mobile-family-descendant-screen__grid');
  relayCloneClicks(gridClone, sourceGrid);
  inner.appendChild(gridClone);

  scroll.appendChild(inner);
  screen.appendChild(scroll);
}

function markToolbarActiveAction() {
  document.querySelectorAll<HTMLElement>(TOOLBAR_SELECTOR).forEach((toolbar) => {
    const activeButton = Array.from(toolbar.querySelectorAll<HTMLElement>(TOOLBAR_ACTION_SELECTOR))
      .find((button) => button.getAttribute('aria-pressed') === 'true');
    const action = activeButton?.getAttribute('data-mobile-family-map-toolbar-action') ?? '';

    if (action) toolbar.setAttribute('data-mobile-family-map-toolbar-active-action', action);
    else toolbar.removeAttribute('data-mobile-family-map-toolbar-active-action');
  });
}

function markRelativeConnectors(root = getRoot()) {
  if (!root) return;

  (['paternal-cousins', 'maternal-cousins'] as ScreenName[]).forEach((screenName) => {
    const screen = getScreenElement(screenName, root);
    if (!screen) return;

    Array.from(screen.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;
      const isVerticalConnector = child.classList.contains('left-1/2')
        && child.classList.contains('w-px')
        && child.classList.contains('bg-cyan-600');
      if (isVerticalConnector) child.setAttribute('data-stable-cousin-main-connector', 'true');
    });
  });

  (['paternal-uncles', 'maternal-uncles'] as ScreenName[]).forEach((screenName) => {
    const screen = getScreenElement(screenName, root);
    screen?.querySelector<HTMLElement>(':scope > div')?.setAttribute('data-mobile-tree-scroll', 'true');
  });
}

function ensureEmptyUncleStates(root = getRoot()) {
  if (!root) return;

  (['paternal-uncles', 'maternal-uncles'] as ScreenName[]).forEach((screenName) => {
    const screen = getScreenElement(screenName, root);
    if (!screen) return;

    const hasCards = Boolean(screen.querySelector('[data-family-map-mobile-card="true"]'));
    const title = SCREEN_POSITIONS[screenName].title.replace(/^./, (letter) => letter.toUpperCase());
    const existing = screen.querySelector<HTMLElement>('.mobile-family-stable-empty-uncle-state');
    if (hasCards) {
      existing?.remove();
      return;
    }

    const contentWrapper = screen.querySelector<HTMLElement>(':scope > div > div[class*="z-10"] > div');
    if (!contentWrapper || existing) return;

    const section = document.createElement('section');
    section.className = 'mobile-family-stable-empty-uncle-state';
    section.innerHTML = `
      <div>
        <h2>${title}</h2>
        <p>Nenhum card real encontrado para este ramo.</p>
      </div>
    `;
    contentWrapper.appendChild(section);
  });
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      ${TOOLBAR_SELECTOR}[data-mobile-family-map-toolbar-active="true"] {
        padding-bottom: 4.75rem !important;
      }

      ${TOOLBAR_SELECTOR}[data-mobile-family-map-toolbar-active-action="cor"] {
        padding-bottom: 4.05rem !important;
      }

      ${TOOLBAR_SELECTOR}[data-mobile-family-map-toolbar-active-action="grupos"] {
        padding-bottom: 4.75rem !important;
      }

      ${TOOLBAR_SELECTOR}[data-mobile-family-map-toolbar-active-action="formato"] {
        padding-bottom: 5.05rem !important;
      }

      .mobile-family-descendant-screen {
        position: relative !important;
        overflow: hidden !important;
      }

      .mobile-family-descendant-screen__scroll {
        display: block !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior-y: contain !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
        padding: 0.75rem 1rem calc(env(safe-area-inset-bottom, 0px) + 10rem) !important;
        scroll-padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 10rem) !important;
      }

      .mobile-family-descendant-screen__inner {
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        justify-content: flex-start !important;
        width: min(calc(100vw - 2rem), 430px) !important;
        max-width: min(calc(100vw - 2rem), 430px) !important;
        min-height: 0 !important;
        height: auto !important;
        margin: 0 auto !important;
        overflow: visible !important;
        padding: 0 0 2rem !important;
      }

      .mobile-family-descendant-screen__connector,
      .mobile-family-descendant-screen__grid {
        flex: 0 0 auto !important;
        width: 100% !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"],
      [data-mobile-family-tree-screen="maternal-uncles"],
      [data-mobile-family-tree-screen="paternal-cousins"],
      [data-mobile-family-tree-screen="maternal-cousins"] {
        position: relative !important;
        overflow: hidden !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] > div,
      [data-mobile-family-tree-screen="maternal-uncles"] > div {
        box-sizing: border-box !important;
        position: absolute !important;
        inset: 0 !important;
        display: block !important;
        height: 100% !important;
        width: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior-y: contain !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
        padding: clamp(0.9rem, 2.8vh, 1.6rem) 0.75rem calc(env(safe-area-inset-bottom, 0px) + 8rem) !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] > div > div[class*="z-10"],
      [data-mobile-family-tree-screen="maternal-uncles"] > div > div[class*="z-10"] {
        box-sizing: border-box !important;
        display: flex !important;
        width: min(calc(100vw - 2rem), 354px) !important;
        max-width: min(calc(100vw - 2rem), 354px) !important;
        min-height: 0 !important;
        height: auto !important;
        align-items: flex-start !important;
        justify-content: center !important;
        margin: 0 auto !important;
        padding: 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section,
      [data-mobile-family-tree-screen="maternal-uncles"] section {
        display: block !important;
        width: min(100%, 354px) !important;
        height: auto !important;
        min-height: 0 !important;
        margin-inline: auto !important;
        padding: 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section > div,
      [data-mobile-family-tree-screen="maternal-uncles"] section > div {
        box-sizing: border-box !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
        border-radius: 1.25rem !important;
        padding: 0.65rem !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section h2,
      [data-mobile-family-tree-screen="maternal-uncles"] section h2 {
        margin: 0 0 0.625rem !important;
        color: #0f172a !important;
        -webkit-text-fill-color: #0f172a !important;
        text-align: center !important;
        font-size: 0.75rem !important;
        line-height: 1.15 !important;
        font-weight: 800 !important;
        letter-spacing: 0.07em !important;
        text-transform: uppercase !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section h2 + div,
      [data-mobile-family-tree-screen="maternal-uncles"] section h2 + div {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        align-items: stretch !important;
        align-content: start !important;
        gap: 0.625rem !important;
        min-height: 0 !important;
        overflow: visible !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] [data-family-map-mobile-card="true"],
      [data-mobile-family-tree-screen="maternal-uncles"] [data-family-map-mobile-card="true"] {
        display: flex !important;
        height: 78px !important;
        min-height: 78px !important;
        width: 100% !important;
        min-width: 0 !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 0.5rem !important;
        border-radius: 1.05rem !important;
        padding: 0.5rem 0.55rem !important;
        text-align: left !important;
      }

      [data-mobile-family-tree-screen="paternal-cousins"] > div,
      [data-mobile-family-tree-screen="maternal-cousins"] > div {
        padding: 0 0.75rem calc(env(safe-area-inset-bottom, 0px) + 8rem) !important;
      }

      [data-mobile-family-tree-screen="paternal-cousins"] > div > div[class*="z-10"],
      [data-mobile-family-tree-screen="maternal-cousins"] > div > div[class*="z-10"] {
        min-height: 0 !important;
        height: auto !important;
        align-items: flex-start !important;
        justify-content: center !important;
        padding-top: 2.5rem !important;
        padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8rem) !important;
      }

      [data-stable-cousin-main-connector="true"] {
        top: 0 !important;
        bottom: auto !important;
        height: 2.5rem !important;
      }

      .mobile-family-stable-empty-uncle-state {
        box-sizing: border-box !important;
        width: min(100%, 354px) !important;
        margin-inline: auto !important;
        border-radius: 1.25rem !important;
        border: 1px solid rgba(203, 213, 225, 0.9) !important;
        background: #ffffff !important;
        padding: 0.75rem !important;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08) !important;
      }

      .mobile-family-stable-empty-uncle-state h2 {
        margin: 0 0 0.625rem !important;
        color: #0f172a !important;
        text-align: center !important;
        font-size: 0.75rem !important;
        font-weight: 800 !important;
        letter-spacing: 0.07em !important;
        text-transform: uppercase !important;
      }

      .mobile-family-stable-empty-uncle-state p {
        margin: 0 !important;
        border: 1px dashed #cbd5e1 !important;
        border-radius: 1rem !important;
        background: rgba(248, 250, 252, 0.96) !important;
        padding: 0.9rem !important;
        color: #64748b !important;
        font-size: 0.8125rem !important;
        font-weight: 700 !important;
        line-height: 1.35 !important;
        text-align: center !important;
      }

      #${OVERVIEW_ID} {
        position: fixed !important;
        inset: 0 !important;
        z-index: 12080 !important;
        display: flex !important;
        flex-direction: column !important;
        background: rgba(248, 250, 252, 0.97) !important;
        backdrop-filter: blur(7px) !important;
        padding: calc(env(safe-area-inset-top, 0px) + 0.75rem) 0.75rem calc(env(safe-area-inset-bottom, 0px) + 5.4rem) !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-header {
        display: flex !important;
        align-items: center !important;
        gap: 0.75rem !important;
        margin: 0 auto 0.75rem !important;
        width: min(100%, 28rem) !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 1.35rem !important;
        background: rgba(255, 255, 255, 0.96) !important;
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12) !important;
        padding: 0.75rem !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-title-wrap {
        min-width: 0 !important;
        flex: 1 1 auto !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-title {
        margin: 0 !important;
        color: rgb(15, 23, 42) !important;
        font-size: 1.15rem !important;
        font-weight: 900 !important;
        line-height: 1.08 !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-subtitle {
        margin: 0.15rem 0 0 !important;
        color: rgb(71, 85, 105) !important;
        font-size: 0.73rem !important;
        font-weight: 700 !important;
        line-height: 1.2 !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-close {
        display: inline-flex !important;
        width: 2.5rem !important;
        height: 2.5rem !important;
        flex: 0 0 auto !important;
        align-items: center !important;
        justify-content: center !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 999px !important;
        background: #fff !important;
        color: rgb(15, 23, 42) !important;
        font-size: 1.2rem !important;
        font-weight: 900 !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-map {
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        grid-auto-rows: minmax(5.6rem, 1fr) !important;
        gap: 0.55rem !important;
        margin: 0 auto !important;
        width: min(100%, 28rem) !important;
        min-height: min(64dvh, 38rem) !important;
        flex: 1 1 auto !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 1.5rem !important;
        background: rgba(255,255,255,0.95) !important;
        box-shadow: 0 18px 44px rgba(15, 23, 42, 0.12) !important;
        padding: 0.8rem !important;
        overflow: auto !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile {
        appearance: none !important;
        display: flex !important;
        min-width: 0 !important;
        min-height: 0 !important;
        flex-direction: column !important;
        justify-content: center !important;
        gap: 0.3rem !important;
        border: 1px solid rgb(203, 213, 225) !important;
        border-radius: 1rem !important;
        background: rgba(255, 255, 255, 0.96) !important;
        padding: 0.55rem !important;
        color: rgb(15, 23, 42) !important;
        font: inherit !important;
        text-align: left !important;
        box-shadow: 0 9px 22px rgba(15, 23, 42, 0.1) !important;
        touch-action: manipulation !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-title {
        color: rgb(15, 23, 42) !important;
        font-size: 0.78rem !important;
        font-weight: 950 !important;
        letter-spacing: 0.04em !important;
        line-height: 1.04 !important;
        text-transform: uppercase !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile-subtitle,
      #${OVERVIEW_ID} .mobile-family-overview-tile-count {
        color: rgb(71, 85, 105) !important;
        font-size: 0.64rem !important;
        font-weight: 700 !important;
        line-height: 1.1 !important;
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

function getTransformForScreen(screenName: ScreenName) {
  const { column, row } = SCREEN_POSITIONS[screenName];
  return `translate3d(calc(${-column * (100 / 3)}% + 0px), calc(${-row * (100 / 3)}% + 0px), 0)`;
}

function parseTranslatePercent(value: string) {
  const match = value.match(/translate3d\(calc\((-?\d+(?:\.\d+)?)%[^,]*,\s*calc\((-?\d+(?:\.\d+)?)%/);
  if (!match) return null;

  const x = Math.abs(Number(match[1]));
  const y = Math.abs(Number(match[2]));
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const toIndex = (percent: number) => {
    if (percent < 1) return 0;
    if (Math.abs(percent - 100 / 3) < 2) return 1;
    if (Math.abs(percent - 200 / 3) < 2) return 2;
    return null;
  };

  const column = toIndex(x);
  const row = toIndex(y);
  if (column === null || row === null) return null;

  return SCREEN_ORDER.find((screenName) => {
    const position = SCREEN_POSITIONS[screenName];
    return position.column === column && position.row === row;
  }) ?? null;
}

function getCurrentScreen(root = getRoot()): ScreenName | null {
  if (!root) return null;
  const explicit = root.getAttribute('data-mobile-family-tree-active-screen');
  if (isScreenName(explicit)) return explicit;
  return parseTranslatePercent(getStage(root)?.style.transform ?? '');
}

function screenHasContent(screenName: ScreenName, root = getRoot()) {
  if (!root) return false;
  if (screenName === 'core') return true;
  if (screenName === 'descendants') return hasDescendantContent(root);
  return Boolean(getScreenElement(screenName, root)?.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key], .mobile-family-stable-empty-uncle-state'));
}

function applyScreen(screenName: ScreenName, animate = true) {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage || !screenHasContent(screenName, root)) return;

  stage.style.setProperty('transform', getTransformForScreen(screenName), 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');
  root.setAttribute('data-mobile-family-tree-active-screen', screenName);

  getScreenElement(screenName, root)?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll], .mobile-family-descendant-screen__scroll').forEach((scrollArea) => {
    scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });

  if (animate) window.setTimeout(() => getStage()?.style.removeProperty('transition'), 340);
}

function getScrollArea(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>([
    '.mobile-family-descendant-screen__scroll',
    '[data-mobile-tree-scroll]',
    '[data-mobile-family-tree-screen="paternal-uncles"] > div',
    '[data-mobile-family-tree-screen="maternal-uncles"] > div',
    '[data-mobile-family-tree-screen="paternal-cousins"] > div',
    '[data-mobile-family-tree-screen="maternal-cousins"] > div',
  ].join(','));
}

function maxScrollTop(scrollArea: HTMLElement | null) {
  if (!scrollArea) return 0;
  return Math.max(0, scrollArea.scrollHeight - scrollArea.clientHeight);
}

function canScrollVertically(scrollArea: HTMLElement | null, deltaY: number) {
  const maxTop = maxScrollTop(scrollArea);
  if (!scrollArea || maxTop <= 1) return false;
  if (deltaY < 0) return scrollArea.scrollTop < maxTop - 1;
  if (deltaY > 0) return scrollArea.scrollTop > 1;
  return false;
}

function isAtTop(scrollArea: HTMLElement | null) {
  return !scrollArea || scrollArea.scrollTop <= 1;
}

function isAtBottom(scrollArea: HTMLElement | null) {
  return !scrollArea || scrollArea.scrollTop >= maxScrollTop(scrollArea) - 1;
}

function stopGesture(event: TouchEvent, preventDefault = false) {
  if (preventDefault) event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function handleTouchStart(event: TouchEvent) {
  if (getRouteKind() !== 'direct' || !isMobileViewport()) return;
  const target = event.target instanceof Element ? event.target : null;
  const touch = event.touches[0];
  if (!target?.closest(ROOT_SELECTOR) || !touch) return;

  gestureStart = {
    x: touch.clientX,
    y: touch.clientY,
    screen: getCurrentScreen(),
    scrollArea: getScrollArea(event.target),
  };
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart || getRouteKind() !== 'direct' || !isMobileViewport()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - gestureStart.x;
  const deltaY = touch.clientY - gestureStart.y;
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);
  if (absoluteY <= absoluteX * 1.2 || absoluteY < PREVIEW_THRESHOLD) return;

  const scrollArea = getScrollArea(event.target) ?? gestureStart.scrollArea;
  if (canScrollVertically(scrollArea, deltaY)) {
    stopGesture(event);
    return;
  }

  if (gestureStart.screen === 'core' && deltaY < 0 && isAtBottom(scrollArea) && hasDescendantContent()) {
    stopGesture(event, true);
    return;
  }

  if (gestureStart.screen === 'descendants' && deltaY > 0 && isAtTop(scrollArea)) {
    stopGesture(event, true);
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (!gestureStart || getRouteKind() !== 'direct' || !isMobileViewport()) {
    gestureStart = null;
    return;
  }

  const touch = event.changedTouches[0];
  const start = gestureStart;
  gestureStart = null;
  if (!touch) return;

  const deltaX = touch.clientX - start.x;
  const deltaY = touch.clientY - start.y;
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);
  if (absoluteY < NAVIGATION_THRESHOLD || absoluteY <= absoluteX * 1.2) return;

  const scrollArea = getScrollArea(event.target) ?? start.scrollArea;
  if (canScrollVertically(scrollArea, deltaY)) {
    stopGesture(event);
    return;
  }

  if (start.screen === 'core' && deltaY < 0 && isAtBottom(scrollArea) && hasDescendantContent()) {
    stopGesture(event, true);
    applyScreen('descendants');
    return;
  }

  if (start.screen === 'descendants' && deltaY > 0 && isAtTop(scrollArea)) {
    stopGesture(event, true);
    applyScreen('core');
  }
}

function escapeHtml(value: string) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function countDirectCards(screenName: ScreenName) {
  const root = getRoot();
  if (!root) return 0;
  if (screenName === 'descendants') return descendantCardCount(root);
  if (screenName === 'core') return getScreenElement('core', root)?.querySelectorAll('[data-family-map-mobile-card="true"]').length || 1;
  return getScreenElement(screenName, root)?.querySelectorAll('[data-family-map-mobile-card="true"]').length ?? 0;
}

function countHorizontalCards(screenName: ScreenName) {
  const generation = SCREEN_POSITIONS[screenName].horizontalGeneration;
  return getHorizontalRoot()?.querySelectorAll(`[data-mobile-horizontal-generation="${generation}"]`).length ?? 0;
}

function getVisibleHorizontalScreen() {
  const activeButton = Array.from(getHorizontalRoot()?.querySelectorAll<HTMLButtonElement>('nav[aria-label="Gerações do Mapa Genealógico"] button') ?? [])
    .find((button) => button.getAttribute('aria-current') === 'page');
  const generation = Number((activeButton?.textContent ?? '').match(/\d+/)?.[0]);
  return SCREEN_ORDER.find((screenName) => SCREEN_POSITIONS[screenName].horizontalGeneration === generation) ?? 'core';
}

function clickBaseTab(root: HTMLElement, screenName: ScreenName) {
  if (DYNAMIC_TAB_SCREENS.has(screenName)) return;
  const label = screenName.startsWith('paternal') ? 'paterno' : screenName.startsWith('maternal') ? 'materno' : 'central';
  const button = Array.from(root.querySelectorAll<HTMLButtonElement>('nav[aria-label="Visualizações da árvore"] button'))
    .find((candidate) => normalizeText(candidate.textContent ?? '').includes(label));
  button?.click();
}

function clickHorizontalGeneration(screenName: ScreenName) {
  const generation = SCREEN_POSITIONS[screenName].horizontalGeneration;
  const targetText = `ger ${generation}`;
  const button = Array.from(getHorizontalRoot()?.querySelectorAll<HTMLButtonElement>('nav[aria-label="Gerações do Mapa Genealógico"] button') ?? [])
    .find((candidate) => normalizeText(candidate.textContent ?? '') === targetText);
  button?.click();
}

function closeOverview(updateButton = true) {
  document.getElementById(OVERVIEW_ID)?.remove();
  document.body.style.removeProperty('overflow');
  if (updateButton) {
    document.querySelectorAll<HTMLButtonElement>(TOOLBAR_ZOOM_SELECTOR).forEach((button) => {
      button.removeAttribute('aria-pressed');
      button.removeAttribute('data-mobile-family-map-overview-active');
    });
  }
}

function navigateFromOverview(screenName: ScreenName) {
  const routeKind = getRouteKind();
  closeOverview();

  if (routeKind === 'horizontal') {
    clickHorizontalGeneration(screenName);
    [80, 220, 420].forEach((delay) => window.setTimeout(() => clickHorizontalGeneration(screenName), delay));
    return;
  }

  const root = getRoot();
  if (!root) return;
  clickBaseTab(root, screenName);
  applyScreen(screenName);
  [80, 220, 420].forEach((delay) => window.setTimeout(() => applyScreen(screenName, delay < 420), delay));
}

function buildOverviewTile(screenName: ScreenName, currentScreen: ScreenName, routeKind: RouteKind) {
  const config = SCREEN_POSITIONS[screenName];
  const count = routeKind === 'direct' ? countDirectCards(screenName) : countHorizontalCards(screenName);
  const tile = document.createElement('button');
  const current = currentScreen === screenName;

  tile.type = 'button';
  tile.className = 'mobile-family-overview-tile';
  tile.dataset.screen = screenName;
  tile.style.gridColumn = String(config.column + 1);
  tile.style.gridRow = String(config.row + 1);
  if (current) tile.setAttribute('aria-current', 'location');
  tile.innerHTML = `
    <span class="mobile-family-overview-tile-title">${escapeHtml(config.title)}</span>
    <span class="mobile-family-overview-tile-subtitle">${escapeHtml(config.subtitle)}</span>
    <span class="mobile-family-overview-tile-count">${count} pessoa${count === 1 ? '' : 's'}</span>
  `;
  tile.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigateFromOverview(screenName);
  });

  return tile;
}

function openOverview() {
  const routeKind = getRouteKind();
  if (!routeKind || !isMobileViewport()) return;
  const root = routeKind === 'direct' ? getRoot() : getHorizontalRoot();
  if (!root) return;

  closeOverview(false);
  ensureStyles();

  const currentScreen = routeKind === 'direct'
    ? getCurrentScreen(getRoot()) ?? 'core'
    : getVisibleHorizontalScreen();
  const overlay = document.createElement('div');
  overlay.id = OVERVIEW_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Visão geral da árvore familiar');
  overlay.setAttribute('data-tree-export-ignore', 'true');
  overlay.innerHTML = `
    <header class="mobile-family-overview-header">
      <div class="mobile-family-overview-title-wrap">
        <h2 class="mobile-family-overview-title">Visão geral</h2>
        <p class="mobile-family-overview-subtitle">Toque em um grupo para navegar.</p>
      </div>
      <button type="button" class="mobile-family-overview-close" aria-label="Fechar visão geral">×</button>
    </header>
    <div class="mobile-family-overview-map" aria-label="Resumo visual dos grupos da árvore"></div>
  `;

  const map = overlay.querySelector<HTMLElement>('.mobile-family-overview-map');
  if (map) {
    SCREEN_ORDER.forEach((screenName) => {
      const count = routeKind === 'direct' ? countDirectCards(screenName) : countHorizontalCards(screenName);
      if (screenName !== 'core' && count <= 0 && routeKind === 'direct') return;
      if (routeKind === 'horizontal' && count <= 0) return;
      map.appendChild(buildOverviewTile(screenName, currentScreen, routeKind));
    });
  }

  overlay.querySelector<HTMLButtonElement>('.mobile-family-overview-close')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeOverview();
  });

  document.body.appendChild(overlay);
  document.body.style.setProperty('overflow', 'hidden');
  document.querySelectorAll<HTMLButtonElement>(TOOLBAR_ZOOM_SELECTOR).forEach((button) => {
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('data-mobile-family-map-overview-active', 'true');
  });
}

function toggleOverview() {
  if (document.getElementById(OVERVIEW_ID)) closeOverview();
  else openOverview();
}

function consumeEvent(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();
}

function handleZoomActivation(event: Event) {
  if (!isEnabled()) return;
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest<HTMLButtonElement>(TOOLBAR_ZOOM_SELECTOR);
  if (!button) return;

  consumeEvent(event);
  const now = Date.now();
  if (now - lastZoomActivation < 650) return;
  lastZoomActivation = now;
  toggleOverview();
}

function handleOverviewActivation(event: Event) {
  const overlay = document.getElementById(OVERVIEW_ID);
  const target = event.target instanceof Element ? event.target : null;
  if (!overlay || !target || !overlay.contains(target)) return;

  const closeButton = target.closest<HTMLButtonElement>('.mobile-family-overview-close');
  if (closeButton) {
    consumeEvent(event);
    closeOverview();
    return;
  }

  const tile = target.closest<HTMLElement>('.mobile-family-overview-tile[data-screen]');
  const screenName = tile?.dataset.screen;
  if (!isScreenName(screenName)) return;

  consumeEvent(event);
  navigateFromOverview(screenName);
}

function applyFixes() {
  if (!isEnabled()) return;
  ensureStyles();
  markToolbarActiveAction();

  const root = getRoot();
  if (root) {
    ensureDescendantScreen(root);
    markRelativeConnectors(root);
    ensureEmptyUncleStates(root);
    root.setAttribute('data-mobile-family-tree-descendants-ready', hasDescendantContent(root) ? 'true' : 'false');
  }
}

function scheduleApplyFixes() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyFixes();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyFixes();
  [80, 240, 520, 1000, 1800].forEach((delay) => window.setTimeout(applyFixes, delay));

  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });

  window.addEventListener('pointerup', handleZoomActivation, { capture: true });
  window.addEventListener('touchend', handleZoomActivation, { capture: true, passive: false });
  window.addEventListener('click', handleZoomActivation, { capture: true });
  window.addEventListener('click', handleOverviewActivation, { capture: true });
  window.addEventListener('pointerup', handleOverviewActivation, { capture: true });
  window.addEventListener('touchend', handleOverviewActivation, { capture: true, passive: false });

  const observer = new MutationObserver(scheduleApplyFixes);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'data-mobile-family-map-toolbar-active'] });

  window.addEventListener('resize', applyFixes, { passive: true });
  window.addEventListener('orientationchange', applyFixes, { passive: true });
  window.addEventListener('popstate', () => { closeOverview(); applyFixes(); }, { passive: true });
  document.addEventListener('visibilitychange', applyFixes, { passive: true });
}

export {};
