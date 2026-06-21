const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const FULL_MAP_ID = 'mobile-family-map-full-overview';
const STYLE_ID = 'mobile-family-map-full-overview-style';
const FULL_MAP_BUTTON_ATTR = 'data-mobile-family-full-map-button';

const STAGE_WIDTH = 1160;
const STAGE_HEIGHT = 1480;

type GestureState =
  | { mode: 'pan'; x: number; y: number; translateX: number; translateY: number }
  | { mode: 'pinch'; startDistance: number; startScale: number; anchorX: number; anchorY: number };

type MosaicGroupKind = 'ancestor' | 'uncles' | 'cousins' | 'core-group' | 'person';

type MosaicGroupConfig = {
  id: string;
  kind: MosaicGroupKind;
  left: number;
  top: number;
  width: number;
  height?: number;
  source: () => HTMLElement | null;
  fallbackTitle?: string;
};

let gestureState: GestureState | null = null;
let scale = 1;
let translateX = 0;
let translateY = 0;
let scheduled = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && isMobileViewport()
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      #${OVERVIEW_ID} [${FULL_MAP_BUTTON_ATTR}="true"] {
        appearance: none !important;
        display: flex !important;
        width: min(100%, 28rem) !important;
        min-height: 3.1rem !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0.7rem auto 0 !important;
        border: 1px solid rgb(37, 99, 235) !important;
        border-radius: 1.15rem !important;
        background: rgb(37, 99, 235) !important;
        color: #fff !important;
        box-shadow: 0 14px 30px rgba(37, 99, 235, 0.22) !important;
        font: inherit !important;
        font-size: 0.9rem !important;
        font-weight: 900 !important;
        letter-spacing: -0.01em !important;
        line-height: 1 !important;
        text-align: center !important;
        touch-action: manipulation !important;
      }

      #${FULL_MAP_ID} {
        position: fixed !important;
        inset: 0 !important;
        z-index: 12140 !important;
        display: flex !important;
        flex-direction: column !important;
        background: rgba(248, 250, 252, 0.985) !important;
        backdrop-filter: blur(8px) !important;
        padding: calc(env(safe-area-inset-top, 0px) + 0.75rem) 0.75rem calc(env(safe-area-inset-bottom, 0px) + 5.4rem) !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-header {
        display: flex !important;
        align-items: center !important;
        gap: 0.75rem !important;
        width: min(100%, 28rem) !important;
        margin: 0 auto 0.75rem !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 1.35rem !important;
        background: rgba(255, 255, 255, 0.97) !important;
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12) !important;
        padding: 0.72rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-title-wrap {
        min-width: 0 !important;
        flex: 1 1 auto !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-title {
        margin: 0 !important;
        color: rgb(15, 23, 42) !important;
        font-size: 1.12rem !important;
        font-weight: 950 !important;
        line-height: 1.05 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-subtitle {
        margin: 0.2rem 0 0 !important;
        color: rgb(71, 85, 105) !important;
        font-size: 0.72rem !important;
        font-weight: 750 !important;
        line-height: 1.2 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-close,
      #${FULL_MAP_ID} .mobile-family-full-map-reset {
        appearance: none !important;
        display: inline-flex !important;
        flex: 0 0 auto !important;
        align-items: center !important;
        justify-content: center !important;
        border: 1px solid rgb(226, 232, 240) !important;
        background: #fff !important;
        color: rgb(15, 23, 42) !important;
        font: inherit !important;
        font-weight: 900 !important;
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08) !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-close {
        width: 2.45rem !important;
        height: 2.45rem !important;
        border-radius: 999px !important;
        font-size: 1.25rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-reset {
        min-height: 2.45rem !important;
        border-radius: 999px !important;
        padding: 0 0.72rem !important;
        font-size: 0.72rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-viewport {
        position: relative !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
        width: 100% !important;
        overflow: hidden !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 1.5rem !important;
        background: #ecfeff !important;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7), 0 20px 54px rgba(15,23,42,0.12) !important;
        touch-action: none !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-stage {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: ${STAGE_WIDTH}px !important;
        height: ${STAGE_HEIGHT}px !important;
        background: #ecfeff !important;
        transform-origin: 0 0 !important;
        will-change: transform !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-connectors {
        position: absolute !important;
        inset: 0 !important;
        z-index: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-connectors path {
        fill: none !important;
        stroke: var(--tree-palette-edge-child, #0e7490) !important;
        stroke-width: 3 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group {
        position: absolute !important;
        z-index: 2 !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="person"] {
        z-index: 3 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group-shell {
        width: 100% !important;
        height: auto !important;
        min-height: 100% !important;
        border: 2px solid rgba(14, 116, 144, 0.58) !important;
        border-radius: 1.1rem !important;
        background: rgba(255, 255, 255, 0.97) !important;
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.1) !important;
        padding: 0.55rem !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="person"] .mobile-family-full-map-group-shell {
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
        min-height: 0 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone,
      #${FULL_MAP_ID} .mobile-family-full-map-clone * {
        max-width: 100% !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone,
      #${FULL_MAP_ID} .mobile-family-full-map-clone > div,
      #${FULL_MAP_ID} .mobile-family-full-map-clone > div > div,
      #${FULL_MAP_ID} .mobile-family-full-map-clone [class*="z-10"] {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        min-height: 0 !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: none !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone .pointer-events-none.absolute,
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-uncle-branch-connector],
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-maternal-uncle-down-connector],
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-uncle-native-connector],
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-core-center-descendant-line],
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-family-tree-descendant-source],
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-mobile-family-tree-descendant-connector] {
        display: none !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone section {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        min-height: 0 !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone section > div:has(> h2),
      #${FULL_MAP_ID} .mobile-family-full-map-clone section > div:has(> h3),
      #${FULL_MAP_ID} .mobile-family-full-map-clone > div:has(> h2),
      #${FULL_MAP_ID} .mobile-family-full-map-clone > div:has(> h3) {
        width: 100% !important;
        min-height: 0 !important;
        height: auto !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone h2,
      #${FULL_MAP_ID} .mobile-family-full-map-clone h3,
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-family-map-group-title="true"] {
        display: block !important;
        margin: 0 0 0.45rem !important;
        color: rgb(15, 23, 42) !important;
        font-size: 0.58rem !important;
        font-weight: 950 !important;
        line-height: 1.05 !important;
        letter-spacing: 0.12em !important;
        text-align: center !important;
        text-transform: uppercase !important;
        white-space: normal !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone h2 + div,
      #${FULL_MAP_ID} .mobile-family-full-map-clone h3 + div,
      #${FULL_MAP_ID} .mobile-family-full-map-clone [data-family-map-group="true"] > div:last-child {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        align-items: stretch !important;
        gap: 0.32rem !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="ancestor"] .mobile-family-full-map-clone h2 + div,
      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="ancestor"] .mobile-family-full-map-clone h3 + div {
        grid-template-columns: 1fr !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="cousins"] .mobile-family-full-map-clone h2 + div,
      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="cousins"] .mobile-family-full-map-clone h3 + div {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-mobile-card="true"],
      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-color-key] {
        width: 100% !important;
        min-width: 0 !important;
        height: 58px !important;
        min-height: 58px !important;
        gap: 0.34rem !important;
        border-radius: 0.72rem !important;
        padding: 0.3rem 0.36rem !important;
        box-shadow: 0 5px 14px rgba(15,23,42,0.08) !important;
        transform: none !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="person"] .mobile-family-full-map-clone button[data-family-map-mobile-card="true"],
      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="person"] .mobile-family-full-map-clone button[data-family-map-color-key] {
        height: 148px !important;
        min-height: 148px !important;
        border-radius: 1rem !important;
        padding: 0.55rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-id="central"] .mobile-family-full-map-clone button[data-family-map-mobile-card="true"],
      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-id="central"] .mobile-family-full-map-clone button[data-family-map-color-key] {
        height: 170px !important;
        min-height: 170px !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-mobile-card="true"] > :first-child,
      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-color-key] [data-family-map-avatar="true"] {
        width: 36px !important;
        min-width: 36px !important;
        max-width: 36px !important;
        height: 36px !important;
        min-height: 36px !important;
        max-height: 36px !important;
        flex: 0 0 36px !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="person"] .mobile-family-full-map-clone button[data-family-map-mobile-card="true"] > :first-child,
      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="person"] .mobile-family-full-map-clone button[data-family-map-color-key] [data-family-map-avatar="true"] {
        width: 70px !important;
        min-width: 70px !important;
        max-width: 70px !important;
        height: 70px !important;
        min-height: 70px !important;
        max-height: 70px !important;
        flex: 0 0 70px !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-mobile-card="true"] > span,
      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-color-key] > span {
        min-width: 0 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-mobile-card="true"] > span > span:first-child,
      #${FULL_MAP_ID} .mobile-family-full-map-clone button[data-family-map-color-key] span.block {
        font-size: 0.46rem !important;
        line-height: 1.02 !important;
        letter-spacing: 0.02em !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="person"] .mobile-family-full-map-clone button[data-family-map-mobile-card="true"] > span > span:first-child,
      #${FULL_MAP_ID} .mobile-family-full-map-group[data-full-map-kind="person"] .mobile-family-full-map-clone button[data-family-map-color-key] span.block {
        font-size: 0.64rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-clone .family-map-status-icon {
        width: 0.48rem !important;
        height: 0.48rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-empty {
        display: flex !important;
        min-height: 5rem !important;
        align-items: center !important;
        justify-content: center !important;
        border: 1px dashed rgb(203, 213, 225) !important;
        border-radius: 1rem !important;
        color: rgb(100, 116, 139) !important;
        font-size: 0.72rem !important;
        font-weight: 800 !important;
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

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getScreen(screenName: string) {
  return getRoot()?.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`) ?? null;
}

function findSectionByTitle(screenName: string, terms: string[]) {
  const screen = getScreen(screenName);
  const normalizedTerms = terms.map(normalizeText);
  const sections = Array.from((screen ?? getRoot())?.querySelectorAll<HTMLElement>('section') ?? []);

  return sections.find((section) => {
    const title = normalizeText(section.querySelector('h2, h3')?.textContent ?? '');
    return normalizedTerms.every((term) => title.includes(term));
  }) ?? null;
}

function findCardButton(screenName: string, matcher: (button: HTMLButtonElement) => boolean) {
  const screen = getScreen(screenName);
  const buttons = Array.from((screen ?? getRoot())?.querySelectorAll<HTMLButtonElement>('button[data-family-map-mobile-card="true"]') ?? []);
  return buttons.find(matcher) ?? null;
}

function findCardByText(screenName: string, text: string) {
  const expected = normalizeText(text);
  return findCardButton(screenName, (button) => normalizeText(button.textContent ?? '').includes(expected));
}

function findCentralCard() {
  return findCardButton('core', (button) => button.getAttribute('data-family-map-color-key') === 'central');
}

function distance(first: Touch, second: Touch) {
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

function midpoint(first: Touch, second: Touch, viewport: HTMLElement) {
  const rect = viewport.getBoundingClientRect();
  return {
    x: ((first.clientX + second.clientX) / 2) - rect.left,
    y: ((first.clientY + second.clientY) / 2) - rect.top,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function applyTransform() {
  const stage = document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-family-full-map-stage`);
  if (!stage) return;
  stage.style.setProperty('transform', `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`, 'important');
}

function resetTransform() {
  const viewport = document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-family-full-map-viewport`);
  const stage = document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-family-full-map-stage`);
  if (!viewport || !stage) return;

  const viewportRect = viewport.getBoundingClientRect();
  const stageWidth = stage.offsetWidth || STAGE_WIDTH;
  const stageHeight = stage.offsetHeight || STAGE_HEIGHT;
  scale = clamp(Math.min((viewportRect.width - 20) / stageWidth, (viewportRect.height - 20) / stageHeight), 0.18, 0.9);
  translateX = Math.max(10, (viewportRect.width - (stageWidth * scale)) / 2);
  translateY = Math.max(10, (viewportRect.height - (stageHeight * scale)) / 2);
  applyTransform();
}

function cleanupClone(clone: HTMLElement) {
  clone.classList.add('mobile-family-full-map-clone');
  clone.querySelectorAll<HTMLElement>([
    '[data-tree-export-ignore="true"]',
    '.pointer-events-none.absolute',
    '[data-mobile-uncle-branch-connector]',
    '[data-mobile-maternal-uncle-down-connector]',
    '[data-mobile-uncle-native-connector]',
    '[data-mobile-core-center-descendant-line]',
    '[data-mobile-family-tree-descendant-source]',
    '[data-mobile-family-tree-descendant-connector]',
    '[data-mobile-family-overview-current-label="true"]',
  ].join(',')).forEach((element) => element.remove());

  clone.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    button.setAttribute('type', 'button');
    button.setAttribute('tabindex', '-1');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  });

  clone.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    element.style.removeProperty('transform');
    element.style.removeProperty('transition');
    element.style.removeProperty('top');
    element.style.removeProperty('left');
    element.style.removeProperty('right');
    element.style.removeProperty('bottom');
    element.style.removeProperty('height');
    element.style.removeProperty('width');
    element.style.removeProperty('max-height');
  });
}

function buildMosaicGroup(config: MosaicGroupConfig) {
  const group = document.createElement('article');
  group.className = 'mobile-family-full-map-group';
  group.dataset.fullMapId = config.id;
  group.dataset.fullMapKind = config.kind;
  group.style.setProperty('left', `${config.left}px`);
  group.style.setProperty('top', `${config.top}px`);
  group.style.setProperty('width', `${config.width}px`);
  if (config.height) group.style.setProperty('min-height', `${config.height}px`);

  const shell = document.createElement('div');
  shell.className = 'mobile-family-full-map-group-shell';
  const source = config.source();

  if (source) {
    const clone = source.cloneNode(true) as HTMLElement;
    cleanupClone(clone);
    shell.appendChild(clone);
  } else {
    shell.innerHTML = `<div class="mobile-family-full-map-empty">${config.fallbackTitle ?? 'Sem registros neste grupo.'}</div>`;
  }

  group.appendChild(shell);
  return group;
}

function buildConnectorSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'mobile-family-full-map-connectors');
  svg.setAttribute('viewBox', `0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`);
  svg.setAttribute('aria-hidden', 'true');

  const paths = [
    'M 305 205 L 405 205',
    'M 760 205 L 920 205',
    'M 520 320 L 520 505',
    'M 690 320 L 690 505',
    'M 470 610 L 405 610',
    'M 750 610 L 830 610',
    'M 515 665 L 515 745 L 600 745',
    'M 690 665 L 690 745 L 600 745',
    'M 600 745 L 600 805',
    'M 255 800 L 255 900',
    'M 990 760 L 990 900',
    'M 600 980 L 600 1060',
  ];

  paths.forEach((d) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  });

  return svg;
}

function buildFullMapStage() {
  const stage = document.createElement('div');
  stage.className = 'mobile-family-full-map-stage';
  stage.appendChild(buildConnectorSvg());

  const groups: MosaicGroupConfig[] = [
    {
      id: 'bisavos-paternos',
      kind: 'ancestor',
      left: 70,
      top: 50,
      width: 240,
      source: () => findSectionByTitle('ancestors', ['bisavos', 'paternos']),
      fallbackTitle: 'Bisavós paternos',
    },
    {
      id: 'avos-paternos',
      kind: 'ancestor',
      left: 405,
      top: 145,
      width: 210,
      source: () => findSectionByTitle('ancestors', ['avos', 'paternos']),
      fallbackTitle: 'Avós paternos',
    },
    {
      id: 'avos-maternos',
      kind: 'ancestor',
      left: 630,
      top: 145,
      width: 210,
      source: () => findSectionByTitle('ancestors', ['avos', 'maternos']),
      fallbackTitle: 'Avós maternos',
    },
    {
      id: 'bisavos-maternos',
      kind: 'ancestor',
      left: 920,
      top: 155,
      width: 230,
      source: () => findSectionByTitle('ancestors', ['bisavos', 'maternos']),
      fallbackTitle: 'Bisavós maternos',
    },
    {
      id: 'tios-paternos',
      kind: 'uncles',
      left: 40,
      top: 520,
      width: 390,
      source: () => findSectionByTitle('paternal-uncles', ['tios', 'paternos']),
      fallbackTitle: 'Tios paternos',
    },
    {
      id: 'pai',
      kind: 'person',
      left: 465,
      top: 520,
      width: 155,
      source: () => findCardByText('core', 'pai'),
      fallbackTitle: 'Pai',
    },
    {
      id: 'mae',
      kind: 'person',
      left: 650,
      top: 520,
      width: 155,
      source: () => findCardByText('core', 'mae'),
      fallbackTitle: 'Mãe',
    },
    {
      id: 'tios-maternos',
      kind: 'uncles',
      left: 830,
      top: 520,
      width: 310,
      source: () => findSectionByTitle('maternal-uncles', ['tios', 'maternos']),
      fallbackTitle: 'Tios maternos',
    },
    {
      id: 'central',
      kind: 'person',
      left: 510,
      top: 805,
      width: 220,
      source: findCentralCard,
      fallbackTitle: 'Pessoa central',
    },
    {
      id: 'primos-paternos',
      kind: 'cousins',
      left: 30,
      top: 900,
      width: 420,
      source: () => findSectionByTitle('paternal-cousins', ['primos', 'paternos']),
      fallbackTitle: 'Primos paternos',
    },
    {
      id: 'irmaos',
      kind: 'core-group',
      left: 470,
      top: 1060,
      width: 170,
      source: () => findSectionByTitle('core', ['irmaos']),
      fallbackTitle: 'Irmãos',
    },
    {
      id: 'conjuge',
      kind: 'core-group',
      left: 655,
      top: 1060,
      width: 170,
      source: () => findSectionByTitle('core', ['conjuge']),
      fallbackTitle: 'Cônjuge',
    },
    {
      id: 'sobrinhos',
      kind: 'core-group',
      left: 470,
      top: 1270,
      width: 170,
      source: () => findSectionByTitle('core', ['sobrinhos']),
      fallbackTitle: 'Sobrinhos',
    },
    {
      id: 'pets',
      kind: 'core-group',
      left: 655,
      top: 1270,
      width: 170,
      source: () => findSectionByTitle('core', ['pets']),
      fallbackTitle: 'Pets',
    },
    {
      id: 'primos-maternos',
      kind: 'cousins',
      left: 900,
      top: 900,
      width: 240,
      source: () => findSectionByTitle('maternal-cousins', ['primos', 'maternos']),
      fallbackTitle: 'Primos maternos',
    },
  ];

  groups.forEach((config) => stage.appendChild(buildMosaicGroup(config)));
  return stage;
}

function closeFullMap() {
  document.getElementById(FULL_MAP_ID)?.remove();
  if (!document.getElementById(OVERVIEW_ID)) document.body.style.removeProperty('overflow');
}

function handleTouchStart(event: TouchEvent) {
  const viewport = event.currentTarget as HTMLElement;
  if (!viewport || !document.getElementById(FULL_MAP_ID)) return;

  if (event.touches.length === 2) {
    const [first, second] = [event.touches[0], event.touches[1]];
    const mid = midpoint(first, second, viewport);
    gestureState = {
      mode: 'pinch',
      startDistance: distance(first, second),
      startScale: scale,
      anchorX: (mid.x - translateX) / scale,
      anchorY: (mid.y - translateY) / scale,
    };
    event.preventDefault();
    return;
  }

  if (event.touches.length === 1) {
    const touch = event.touches[0];
    gestureState = {
      mode: 'pan',
      x: touch.clientX,
      y: touch.clientY,
      translateX,
      translateY,
    };
  }
}

function handleTouchMove(event: TouchEvent) {
  const viewport = event.currentTarget as HTMLElement;
  if (!gestureState || !viewport || !document.getElementById(FULL_MAP_ID)) return;

  if (gestureState.mode === 'pinch' && event.touches.length >= 2) {
    const [first, second] = [event.touches[0], event.touches[1]];
    const mid = midpoint(first, second, viewport);
    const nextDistance = distance(first, second);
    scale = clamp(gestureState.startScale * (nextDistance / Math.max(1, gestureState.startDistance)), 0.16, 2.8);
    translateX = mid.x - (gestureState.anchorX * scale);
    translateY = mid.y - (gestureState.anchorY * scale);
    applyTransform();
    event.preventDefault();
    return;
  }

  if (gestureState.mode === 'pan' && event.touches.length === 1) {
    const touch = event.touches[0];
    translateX = gestureState.translateX + (touch.clientX - gestureState.x);
    translateY = gestureState.translateY + (touch.clientY - gestureState.y);
    applyTransform();
    event.preventDefault();
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (event.touches.length === 0) {
    gestureState = null;
    return;
  }

  if (event.touches.length === 1) {
    const touch = event.touches[0];
    gestureState = {
      mode: 'pan',
      x: touch.clientX,
      y: touch.clientY,
      translateX,
      translateY,
    };
  }
}

function openFullMap() {
  if (!isEnabled()) return;
  ensureStyles();
  document.getElementById(FULL_MAP_ID)?.remove();

  const overlay = document.createElement('div');
  overlay.id = FULL_MAP_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Mapa completo da família');
  overlay.setAttribute('data-tree-export-ignore', 'true');
  overlay.innerHTML = `
    <header class="mobile-family-full-map-header">
      <div class="mobile-family-full-map-title-wrap">
        <h2 class="mobile-family-full-map-title">Mapa completo</h2>
        <p class="mobile-family-full-map-subtitle">Tela única. Use dois dedos para ampliar, reduzir e arrastar.</p>
      </div>
      <button type="button" class="mobile-family-full-map-reset" aria-label="Reenquadrar mapa completo">Reenquadrar</button>
      <button type="button" class="mobile-family-full-map-close" aria-label="Fechar mapa completo">×</button>
    </header>
    <div class="mobile-family-full-map-viewport" aria-label="Mapa completo com zoom por pinça"></div>
  `;

  const viewport = overlay.querySelector<HTMLElement>('.mobile-family-full-map-viewport');
  viewport?.appendChild(buildFullMapStage());
  viewport?.addEventListener('touchstart', handleTouchStart, { passive: false });
  viewport?.addEventListener('touchmove', handleTouchMove, { passive: false });
  viewport?.addEventListener('touchend', handleTouchEnd, { passive: false });
  viewport?.addEventListener('touchcancel', handleTouchEnd, { passive: false });

  overlay.querySelector<HTMLButtonElement>('.mobile-family-full-map-close')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeFullMap();
  });

  overlay.querySelector<HTMLButtonElement>('.mobile-family-full-map-reset')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    resetTransform();
  });

  document.body.appendChild(overlay);
  document.body.style.setProperty('overflow', 'hidden');
  window.setTimeout(resetTransform, 40);
}

function ensureFullMapButton() {
  if (!isEnabled()) return;
  ensureStyles();
  const overview = document.getElementById(OVERVIEW_ID);
  const map = overview?.querySelector<HTMLElement>('.mobile-family-overview-map');
  if (!overview || !map) return;

  let button = overview.querySelector<HTMLButtonElement>(`[${FULL_MAP_BUTTON_ATTR}="true"]`);
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.setAttribute(FULL_MAP_BUTTON_ATTR, 'true');
    button.textContent = 'Exibir mapa completo';
    map.insertAdjacentElement('afterend', button);
  }

  if (button.dataset.mobileFamilyFullMapBound !== 'true') {
    button.dataset.mobileFamilyFullMapBound = 'true';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();
      openFullMap();
    });
  }
}

function scheduleEnsureButton() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    ensureFullMapButton();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  ensureFullMapButton();
  [80, 220, 520, 1000].forEach((delay) => window.setTimeout(ensureFullMapButton, delay));

  const observer = new MutationObserver(scheduleEnsureButton);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', () => {
    ensureFullMapButton();
    if (document.getElementById(FULL_MAP_ID)) resetTransform();
  }, { passive: true });
  window.addEventListener('orientationchange', () => {
    ensureFullMapButton();
    if (document.getElementById(FULL_MAP_ID)) window.setTimeout(resetTransform, 220);
  }, { passive: true });
  window.addEventListener('popstate', () => { closeFullMap(); }, { passive: true });
  document.addEventListener('visibilitychange', ensureFullMapButton, { passive: true });
}

export {};
