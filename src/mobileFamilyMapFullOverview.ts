const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const FULL_MAP_ID = 'mobile-family-map-full-overview';
const STYLE_ID = 'mobile-family-map-full-overview-style';
const FULL_MAP_BUTTON_ATTR = 'data-mobile-family-full-map-button';
const INLINE_OVERVIEW_SELECTOR = '[data-mobile-family-map-inline-overview="true"]';
const FULL_MAP_OPEN_EVENT = 'arvorefamilia:mobile-full-map-open';

const STAGE_WIDTH = 1240;
const STAGE_HEIGHT = 1480;

type GestureState =
  | { mode: 'pan'; x: number; y: number; translateX: number; translateY: number }
  | { mode: 'pinch'; startDistance: number; startScale: number; anchorX: number; anchorY: number };

type FullMapCardVariant = 'ancestor' | 'mini' | 'parent' | 'central' | 'core' | 'empty';
type FullMapGroupKind = 'ancestor' | 'uncles' | 'cousins' | 'core-group' | 'person' | 'empty';
type Anchor = 'top' | 'right' | 'bottom' | 'left';

type FullMapPerson = {
  id: string;
  name: string;
  birthYear?: string;
  deathYear?: string;
  photoSrc?: string;
  colorKey?: string;
  pet?: boolean;
};

type FullMapNode = {
  id: string;
  kind: FullMapGroupKind;
  label: string;
  left: number;
  top: number;
  width: number;
  minHeight: number;
  columns: number;
  variant: FullMapCardVariant;
  people: FullMapPerson[];
};

type FullMapEdge = {
  from: string;
  to: string;
  fromAnchor: Anchor;
  toAnchor: Anchor;
  via?: 'vertical' | 'horizontal' | 'elbow';
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      [${FULL_MAP_BUTTON_ATTR}="true"] {
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
        position: relative !important;
        z-index: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 0 !important;
        background: transparent !important;
        padding: 0 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-viewport {
        position: relative !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
        width: 100% !important;
        overflow: hidden !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 1.25rem !important;
        background: #ecfeff !important;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7), 0 12px 26px rgba(15,23,42,0.1) !important;
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
        stroke: #d19006 !important;
        stroke-width: 4 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-node {
        position: absolute !important;
        z-index: 2 !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-node[data-full-map-kind="person"] {
        z-index: 3 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group-shell {
        width: 100% !important;
        min-height: 100% !important;
        border: 2px solid rgba(14, 116, 144, 0.58) !important;
        border-radius: 1.1rem !important;
        background: rgba(255, 255, 255, 0.98) !important;
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.1) !important;
        padding: 0.55rem !important;
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-node[data-full-map-kind="person"] .mobile-family-full-map-group-shell {
        min-height: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-group-title {
        display: block !important;
        margin: 0 0 0.45rem !important;
        color: rgb(15, 23, 42) !important;
        font-size: 0.66rem !important;
        font-weight: 950 !important;
        line-height: 1.05 !important;
        letter-spacing: 0.12em !important;
        text-align: center !important;
        text-transform: uppercase !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card-grid {
        display: grid !important;
        grid-template-columns: repeat(var(--full-map-columns, 2), minmax(0, 1fr)) !important;
        align-items: stretch !important;
        gap: 0.36rem !important;
        width: 100% !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card {
        appearance: none !important;
        position: relative !important;
        display: flex !important;
        min-width: 0 !important;
        width: 100% !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 0.42rem !important;
        border: 1px solid rgba(103, 232, 249, 0.8) !important;
        border-radius: 0.78rem !important;
        background: linear-gradient(180deg, #10bca8 0%, #0789a2 100%) !important;
        color: #fff !important;
        box-shadow: 0 6px 16px rgba(15,23,42,0.1) !important;
        padding: 0.34rem 0.42rem !important;
        text-align: left !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="ancestor"] {
        min-height: 62px !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="mini"] {
        min-height: 76px !important;
        flex-direction: column !important;
        justify-content: center !important;
        gap: 0.24rem !important;
        padding: 0.34rem !important;
        text-align: center !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="core"] {
        min-height: 84px !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="parent"] {
        min-height: 134px !important;
        flex-direction: column !important;
        justify-content: center !important;
        gap: 0.42rem !important;
        border-radius: 1rem !important;
        padding: 0.58rem !important;
        text-align: center !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="central"] {
        min-height: 176px !important;
        flex-direction: column !important;
        justify-content: center !important;
        gap: 0.55rem !important;
        border-color: rgba(103, 232, 249, 0.9) !important;
        border-radius: 1.3rem !important;
        background: linear-gradient(180deg, #0bbce1 0%, #1155e8 100%) !important;
        box-shadow: 0 16px 34px rgba(37, 99, 235, 0.2) !important;
        padding: 0.7rem !important;
        text-align: center !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card-label {
        position: absolute !important;
        left: 0.4rem !important;
        right: 0.4rem !important;
        top: -0.72rem !important;
        display: flex !important;
        min-height: 1.28rem !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 999px !important;
        background: #081225 !important;
        color: #fff !important;
        font-size: 0.62rem !important;
        font-weight: 950 !important;
        letter-spacing: 0.14em !important;
        text-transform: uppercase !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-avatar {
        display: flex !important;
        flex: 0 0 auto !important;
        width: 34px !important;
        height: 34px !important;
        align-items: center !important;
        justify-content: center !important;
        overflow: hidden !important;
        border: 3px solid rgba(255,255,255,0.78) !important;
        border-radius: 999px !important;
        background: rgba(255,255,255,0.2) !important;
        color: rgba(255,255,255,0.86) !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="mini"] .mobile-family-full-map-avatar {
        width: 36px !important;
        height: 36px !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="parent"] .mobile-family-full-map-avatar {
        width: 66px !important;
        height: 66px !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="central"] .mobile-family-full-map-avatar {
        width: 86px !important;
        height: 86px !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-avatar img,
      #${FULL_MAP_ID} .mobile-family-full-map-avatar svg {
        display: block !important;
        width: 100% !important;
        height: 100% !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-avatar img {
        object-fit: cover !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-avatar svg {
        width: 56% !important;
        height: 56% !important;
        fill: none !important;
        stroke: currentColor !important;
        stroke-width: 2 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card-body {
        display: flex !important;
        min-width: 0 !important;
        flex: 1 1 auto !important;
        flex-direction: column !important;
        justify-content: center !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="mini"] .mobile-family-full-map-card-body,
      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="parent"] .mobile-family-full-map-card-body,
      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="central"] .mobile-family-full-map-card-body {
        width: 100% !important;
        align-items: center !important;
        text-align: center !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-name {
        display: block !important;
        width: 100% !important;
        overflow: hidden !important;
        color: #fff !important;
        font-size: 0.58rem !important;
        font-weight: 950 !important;
        line-height: 1.08 !important;
        letter-spacing: 0.06em !important;
        text-transform: uppercase !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="mini"] .mobile-family-full-map-name {
        font-size: 0.55rem !important;
        text-align: center !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="parent"] .mobile-family-full-map-name {
        font-size: 0.78rem !important;
        text-align: center !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="central"] .mobile-family-full-map-name {
        font-size: 0.95rem !important;
        text-align: center !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-vitals {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 0.18rem 0.34rem !important;
        color: rgba(236, 254, 255, 0.95) !important;
        font-size: 0.54rem !important;
        font-weight: 800 !important;
        line-height: 1 !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="mini"] .mobile-family-full-map-vitals,
      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="parent"] .mobile-family-full-map-vitals,
      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="central"] .mobile-family-full-map-vitals {
        justify-content: center !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="central"] .mobile-family-full-map-vitals {
        font-size: 0.7rem !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-empty {
        display: flex !important;
        min-height: 4.4rem !important;
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

function getText(element: Element | null | undefined) {
  return String(element?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function findSectionByTitle(screenName: string, terms: string[]) {
  const screen = getScreen(screenName);
  const normalizedTerms = terms.map(normalizeText);
  const sections = Array.from((screen ?? getRoot())?.querySelectorAll<HTMLElement>('section') ?? []);

  return sections.find((section) => {
    const title = normalizeText(section.querySelector('h2, h3, [data-family-map-group-title="true"]')?.textContent ?? '');
    return normalizedTerms.every((term) => title.includes(term));
  }) ?? null;
}

function findButtonsInSection(section: HTMLElement | null) {
  return Array.from(section?.querySelectorAll<HTMLButtonElement>('button[data-family-map-mobile-card="true"], button[data-family-map-color-key]') ?? []);
}

function findCoreCardByColor(colorKey: string) {
  return getScreen('core')?.querySelector<HTMLButtonElement>(`button[data-family-map-color-key="${colorKey}"]`) ?? null;
}

function findCoreCardByText(text: string) {
  const expected = normalizeText(text);
  const buttons = Array.from(getScreen('core')?.querySelectorAll<HTMLButtonElement>('button[data-family-map-mobile-card="true"], button[data-family-map-color-key]') ?? []);
  return buttons.find((button) => normalizeText(button.textContent).includes(expected)) ?? null;
}

function findLikelyName(button: HTMLButtonElement) {
  const ignored = new Set(['pai', 'mae', 'mãe', 'conjuge', 'cônjuge', 'filhos', 'netos', 'pets', 'irmaos', 'irmãos', 'sobrinhos']);
  const spans = Array.from(button.querySelectorAll<HTMLElement>('span'));
  const candidates = spans
    .map((span) => getText(span))
    .filter((text) => {
      const normalized = normalizeText(text);
      if (!text || text.length < 3) return false;
      if (ignored.has(normalized)) return false;
      if (/^[★✚+\s\d]+$/.test(text)) return false;
      if (/\b(18|19|20|21)\d{2}\b/.test(text) && text.replace(/\b(18|19|20|21)\d{2}\b/g, '').trim().length < 3) return false;
      return /[A-Za-zÀ-ÿ]{3,}/.test(text);
    })
    .sort((left, right) => {
      const leftWords = left.split(/\s+/).length;
      const rightWords = right.split(/\s+/).length;
      return rightWords - leftWords || right.length - left.length;
    });

  if (candidates[0]) return candidates[0];

  return getText(button)
    .replace(/\b(PAI|MÃE|MAE|CÔNJUGE|CONJUGE|FILHOS|NETOS|PETS|IRMÃOS|IRMAOS|SOBRINHOS)\b/gi, ' ')
    .replace(/[★✚+]/g, ' ')
    .replace(/\b(18|19|20|21)\d{2}\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPersonFromButton(button: HTMLButtonElement | null, fallbackName: string, index = 0): FullMapPerson | null {
  if (!button) return fallbackName ? { id: `${normalizeText(fallbackName)}-${index}`, name: fallbackName } : null;

  const rawText = getText(button);
  const years = Array.from(rawText.matchAll(/\b(18|19|20|21)\d{2}\b/g)).map((match) => match[0]);
  const name = findLikelyName(button) || fallbackName;
  if (!name) return null;

  const photo = button.querySelector<HTMLImageElement>('img[data-family-map-photo-avatar="true"], img');
  const pet = Boolean(button.querySelector('.family-map-pet-icon')) || normalizeText(rawText).includes(' pet');

  return {
    id: `${normalizeText(name)}-${years[0] ?? index}-${index}`,
    name,
    birthYear: years[0],
    deathYear: years.length > 1 ? years[1] : undefined,
    photoSrc: photo?.src,
    colorKey: button.getAttribute('data-family-map-color-key') ?? undefined,
    pet,
  };
}

function extractPeopleFromSection(section: HTMLElement | null, fallbackTitle: string) {
  const buttons = findButtonsInSection(section);
  return buttons
    .map((button, index) => extractPersonFromButton(button, `${fallbackTitle} ${index + 1}`, index))
    .filter(Boolean) as FullMapPerson[];
}

function extractSinglePerson(button: HTMLButtonElement | null, fallbackName: string) {
  const person = extractPersonFromButton(button, fallbackName, 0);
  return person ? [person] : [];
}

function personIconSvg(pet?: boolean) {
  if (pet) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="8" cy="8" r="2" />
        <circle cx="16" cy="8" r="2" />
        <circle cx="6.5" cy="13" r="1.8" />
        <circle cx="17.5" cy="13" r="1.8" />
        <path d="M9 15.5c1.2-1.4 4.8-1.4 6 0 1.5 1.8.2 4-3 4s-4.5-2.2-3-4Z" />
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.8 19c1-4 3.1-6 6.2-6s5.2 2 6.2 6" />
    </svg>
  `;
}

function renderPersonCard(person: FullMapPerson, variant: FullMapCardVariant, label?: string) {
  const card = document.createElement('article');
  card.className = 'mobile-family-full-map-card';
  card.dataset.variant = variant;
  card.dataset.colorKey = person.colorKey ?? '';

  const labelMarkup = label ? `<span class="mobile-family-full-map-card-label">${escapeHtml(label)}</span>` : '';
  const avatarMarkup = person.photoSrc
    ? `<img src="${escapeHtml(person.photoSrc)}" alt="" />`
    : personIconSvg(person.pet);
  const birthMarkup = person.birthYear ? `<span>★ ${escapeHtml(person.birthYear)}</span>` : '';
  const deathMarkup = person.deathYear ? `<span>✚ ${escapeHtml(person.deathYear)}</span>` : '';

  card.innerHTML = `
    ${labelMarkup}
    <span class="mobile-family-full-map-avatar">${avatarMarkup}</span>
    <span class="mobile-family-full-map-card-body">
      <span class="mobile-family-full-map-name">${escapeHtml(person.name)}</span>
      <span class="mobile-family-full-map-vitals">${birthMarkup}${deathMarkup}</span>
    </span>
  `;

  return card;
}

function buildGroupNode(node: FullMapNode) {
  const group = document.createElement('article');
  group.className = 'mobile-family-full-map-node';
  group.dataset.fullMapId = node.id;
  group.dataset.fullMapKind = node.kind;
  group.style.setProperty('left', `${node.left}px`);
  group.style.setProperty('top', `${node.top}px`);
  group.style.setProperty('width', `${node.width}px`);
  group.style.setProperty('min-height', `${node.minHeight}px`);

  const shell = document.createElement('div');
  shell.className = 'mobile-family-full-map-group-shell';

  if (node.kind !== 'person') {
    const title = document.createElement('h3');
    title.className = 'mobile-family-full-map-group-title';
    title.textContent = node.label;
    shell.appendChild(title);
  }

  if (node.people.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'mobile-family-full-map-card-grid';
    grid.style.setProperty('--full-map-columns', String(node.columns));
    node.people.forEach((person) => grid.appendChild(renderPersonCard(
      person,
      node.variant,
      node.variant === 'parent' ? node.label : undefined,
    )));
    shell.appendChild(grid);
  } else {
    const empty = document.createElement('div');
    empty.className = 'mobile-family-full-map-empty';
    empty.textContent = node.label;
    shell.appendChild(empty);
  }

  group.appendChild(shell);
  return group;
}

function anchorPoint(node: FullMapNode, anchor: Anchor) {
  const x = node.left;
  const y = node.top;
  const w = node.width;
  const h = node.minHeight;

  if (anchor === 'top') return { x: x + w / 2, y };
  if (anchor === 'right') return { x: x + w, y: y + h / 2 };
  if (anchor === 'bottom') return { x: x + w / 2, y: y + h };
  return { x, y: y + h / 2 };
}

function edgePath(from: { x: number; y: number }, to: { x: number; y: number }, via: FullMapEdge['via']) {
  if (via === 'horizontal') {
    const midX = (from.x + to.x) / 2;
    return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
  }

  if (via === 'elbow') {
    return `M ${from.x} ${from.y} L ${to.x} ${from.y} L ${to.x} ${to.y}`;
  }

  const midY = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
}

function buildConnectorSvg(nodes: FullMapNode[], edges: FullMapEdge[]) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'mobile-family-full-map-connectors');
  svg.setAttribute('viewBox', `0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`);
  svg.setAttribute('aria-hidden', 'true');

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  edges.forEach((edge) => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', edgePath(anchorPoint(fromNode, edge.fromAnchor), anchorPoint(toNode, edge.toAnchor), edge.via));
    svg.appendChild(path);
  });

  return svg;
}

function buildFullMapModel() {
  const avosPaternos = extractPeopleFromSection(findSectionByTitle('ancestors', ['avos', 'paternos']), 'Avós paternos');
  const avosMaternos = extractPeopleFromSection(findSectionByTitle('ancestors', ['avos', 'maternos']), 'Avós maternos');
  const bisavosPaternos = extractPeopleFromSection(findSectionByTitle('ancestors', ['bisavos', 'paternos']), 'Bisavós paternos');
  const bisavosMaternos = extractPeopleFromSection(findSectionByTitle('ancestors', ['bisavos', 'maternos']), 'Bisavós maternos');
  const tiosPaternos = extractPeopleFromSection(findSectionByTitle('paternal-uncles', ['tios', 'paternos']), 'Tios paternos');
  const tiosMaternos = extractPeopleFromSection(findSectionByTitle('maternal-uncles', ['tios', 'maternos']), 'Tios maternos');
  const primosPaternos = extractPeopleFromSection(findSectionByTitle('paternal-cousins', ['primos', 'paternos']), 'Primos paternos');
  const primosMaternos = extractPeopleFromSection(findSectionByTitle('maternal-cousins', ['primos', 'maternos']), 'Primos maternos');
  const irmaos = extractPeopleFromSection(findSectionByTitle('core', ['irmaos']), 'Irmãos');
  const conjuge = extractPeopleFromSection(findSectionByTitle('core', ['conjuge']), 'Cônjuge');
  const filhos = extractPeopleFromSection(findSectionByTitle('core', ['filhos']), 'Filhos');
  const sobrinhos = extractPeopleFromSection(findSectionByTitle('core', ['sobrinhos']), 'Sobrinhos');
  const pets = extractPeopleFromSection(findSectionByTitle('core', ['pets']), 'Pets');
  const netos = extractPeopleFromSection(findSectionByTitle('core', ['netos']), 'Netos');

  const nodes: FullMapNode[] = [
    { id: 'bisavos-paternos', kind: 'ancestor', label: 'Bisavós paternos', left: 58, top: 42, width: 250, minHeight: 170, columns: 1, variant: 'ancestor', people: bisavosPaternos },
    { id: 'avos-paternos', kind: 'ancestor', label: 'Avós paternos', left: 405, top: 112, width: 230, minHeight: 190, columns: 1, variant: 'ancestor', people: avosPaternos },
    { id: 'avos-maternos', kind: 'ancestor', label: 'Avós maternos', left: 650, top: 112, width: 230, minHeight: 190, columns: 1, variant: 'ancestor', people: avosMaternos },
    { id: 'bisavos-maternos', kind: 'ancestor', label: 'Bisavós maternos', left: 940, top: 42, width: 250, minHeight: 170, columns: 1, variant: 'ancestor', people: bisavosMaternos },
    { id: 'tios-paternos', kind: 'uncles', label: 'Tios paternos', left: 40, top: 420, width: 390, minHeight: 440, columns: 2, variant: 'ancestor', people: tiosPaternos },
    { id: 'pai', kind: 'person', label: 'Pai', left: 488, top: 455, width: 170, minHeight: 156, columns: 1, variant: 'parent', people: extractSinglePerson(findCoreCardByText('pai'), 'Pai') },
    { id: 'mae', kind: 'person', label: 'Mãe', left: 710, top: 455, width: 170, minHeight: 156, columns: 1, variant: 'parent', people: extractSinglePerson(findCoreCardByText('mae'), 'Mãe') },
    { id: 'tios-maternos', kind: 'uncles', label: 'Tios maternos', left: 845, top: 420, width: 355, minHeight: 330, columns: 2, variant: 'ancestor', people: tiosMaternos },
    { id: 'central', kind: 'person', label: 'Pessoa central', left: 550, top: 735, width: 250, minHeight: 200, columns: 1, variant: 'central', people: extractSinglePerson(findCoreCardByColor('central'), 'Pessoa central') },
    { id: 'primos-paternos', kind: 'cousins', label: 'Primos paternos', left: 40, top: 875, width: 410, minHeight: 430, columns: 3, variant: 'mini', people: primosPaternos },
    { id: 'irmaos', kind: 'core-group', label: 'Irmãos', left: 468, top: 1010, width: 190, minHeight: 210, columns: 1, variant: 'core', people: irmaos },
    { id: 'conjuge', kind: 'core-group', label: 'Cônjuge', left: 710, top: 1010, width: 190, minHeight: 145, columns: 1, variant: 'core', people: conjuge },
    { id: 'filhos', kind: 'core-group', label: 'Filhos', left: 930, top: 1010, width: 180, minHeight: 145, columns: 1, variant: 'core', people: filhos },
    { id: 'sobrinhos', kind: 'core-group', label: 'Sobrinhos', left: 468, top: 1280, width: 190, minHeight: 145, columns: 1, variant: 'core', people: sobrinhos },
    { id: 'pets', kind: 'core-group', label: 'Pets', left: 710, top: 1280, width: 190, minHeight: 145, columns: 1, variant: 'core', people: pets },
    { id: 'netos', kind: 'core-group', label: 'Netos', left: 930, top: 1280, width: 180, minHeight: 145, columns: 1, variant: 'core', people: netos },
    { id: 'primos-maternos', kind: 'cousins', label: 'Primos maternos', left: 900, top: 795, width: 260, minHeight: 190, columns: 1, variant: 'mini', people: primosMaternos },
  ];

  const edges: FullMapEdge[] = [
    { from: 'bisavos-paternos', to: 'avos-paternos', fromAnchor: 'right', toAnchor: 'left', via: 'horizontal' },
    { from: 'bisavos-maternos', to: 'avos-maternos', fromAnchor: 'left', toAnchor: 'right', via: 'horizontal' },
    { from: 'avos-paternos', to: 'pai', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'avos-maternos', to: 'mae', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'pai', to: 'central', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'mae', to: 'central', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'tios-paternos', to: 'primos-paternos', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'tios-maternos', to: 'primos-maternos', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'pai', to: 'tios-paternos', fromAnchor: 'left', toAnchor: 'right', via: 'horizontal' },
    { from: 'mae', to: 'tios-maternos', fromAnchor: 'right', toAnchor: 'left', via: 'horizontal' },
    { from: 'central', to: 'irmaos', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'central', to: 'conjuge', fromAnchor: 'right', toAnchor: 'left', via: 'horizontal' },
    { from: 'central', to: 'filhos', fromAnchor: 'right', toAnchor: 'left', via: 'horizontal' },
    { from: 'irmaos', to: 'sobrinhos', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'central', to: 'pets', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'filhos', to: 'netos', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
  ];

  return { nodes, edges };
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

function buildFullMapStage() {
  const { nodes, edges } = buildFullMapModel();
  const stage = document.createElement('div');
  stage.className = 'mobile-family-full-map-stage';
  stage.appendChild(buildConnectorSvg(nodes, edges));
  nodes.forEach((node) => stage.appendChild(buildGroupNode(node)));
  return stage;
}

function closeFullMap() {
  document.getElementById(FULL_MAP_ID)?.remove();
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

function hydrateFullMap() {
  if (!isEnabled()) return;

  ensureStyles();
  const fullMap = document.getElementById(FULL_MAP_ID);
  if (!fullMap?.closest(INLINE_OVERVIEW_SELECTOR)) return;

  const viewport = fullMap.querySelector<HTMLElement>('.mobile-family-full-map-viewport');
  if (!viewport) return;

  const needsStage = viewport.dataset.mobileFamilyFullMapHydrated !== 'true'
    || !viewport.querySelector('.mobile-family-full-map-stage');

  if (needsStage) {
    viewport.replaceChildren(buildFullMapStage());
    viewport.dataset.mobileFamilyFullMapHydrated = 'true';
    viewport.addEventListener('touchstart', handleTouchStart, { passive: false });
    viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewport.addEventListener('touchend', handleTouchEnd, { passive: false });
    viewport.addEventListener('touchcancel', handleTouchEnd, { passive: false });
  }

  window.requestAnimationFrame(resetTransform);
  window.setTimeout(resetTransform, 40);
}

function ensureFullMapButton() {
  if (!isEnabled()) return;
  ensureStyles();
  hydrateFullMap();
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
  window.addEventListener(FULL_MAP_OPEN_EVENT, hydrateFullMap);
  window.addEventListener('popstate', () => { closeFullMap(); }, { passive: true });
  document.addEventListener('visibilitychange', ensureFullMapButton, { passive: true });
}

export {};
