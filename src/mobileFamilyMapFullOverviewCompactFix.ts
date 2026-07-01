const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const FULL_MAP_SELECTOR = '#mobile-family-map-full-overview, [data-mobile-family-map-full-inline="true"]';
const FULL_MAP_STAGE_SELECTOR = '.mobile-family-full-map-stage';
const FULL_MAP_CONNECTORS_SELECTOR = '.mobile-family-full-map-connectors';
const STYLE_ID = 'mobile-family-map-full-overview-compact-fix-style';

const EDGE_DEFINITIONS = [
  ['tataravos-paternos', 'bisavos-paternos', 'bottom', 'top', 'vertical'],
  ['bisavos-paternos', 'avos-paternos', 'right', 'left', 'horizontal'],
  ['tataravos-maternos', 'bisavos-maternos', 'bottom', 'top', 'vertical'],
  ['bisavos-maternos', 'avos-maternos', 'left', 'right', 'horizontal'],
  ['avos-paternos', 'pai', 'bottom', 'top', 'vertical'],
  ['avos-maternos', 'mae', 'bottom', 'top', 'vertical'],
  ['pai', 'central', 'bottom', 'top', 'vertical'],
  ['mae', 'central', 'bottom', 'top', 'vertical'],
  ['tios-paternos', 'primos-paternos', 'bottom', 'top', 'vertical'],
  ['tios-maternos', 'primos-maternos', 'bottom', 'top', 'vertical'],
  ['pai', 'tios-paternos', 'left', 'right', 'horizontal'],
  ['mae', 'tios-maternos', 'right', 'left', 'horizontal'],
  ['central', 'irmaos', 'bottom', 'top', 'vertical'],
  ['central', 'conjuge', 'right', 'left', 'horizontal'],
  ['central', 'filhos', 'bottom', 'top', 'vertical'],
  ['irmaos', 'sobrinhos', 'bottom', 'top', 'vertical'],
  ['conjuge', 'pets', 'bottom', 'top', 'vertical'],
  ['central', 'pets', 'bottom', 'top', 'vertical'],
  ['filhos', 'netos', 'right', 'left', 'horizontal'],
] as const;

type Anchor = 'top' | 'right' | 'bottom' | 'left';
type Via = 'vertical' | 'horizontal' | 'elbow';

type NodeBox = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

let scheduled = false;

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      ${FULL_MAP_SELECTOR} .mobile-family-full-map-name,
      ${FULL_MAP_SELECTOR} [data-family-map-mobile-card="true"] span:first-of-type {
        line-height: 1 !important;
        letter-spacing: 0.01em !important;
      }

      ${FULL_MAP_SELECTOR} .mobile-family-full-map-vitals,
      ${FULL_MAP_SELECTOR} [data-family-map-mobile-card="true"] .family-map-status-icon,
      ${FULL_MAP_SELECTOR} [data-family-map-mobile-card="true"] span:has(.family-map-status-icon) {
        display: none !important;
      }

      ${FULL_MAP_SELECTOR} .mobile-family-full-map-node[data-full-map-id="tios-maternos"] .mobile-family-full-map-group-shell {
        padding-bottom: 0.55rem !important;
      }
    }
  `;

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
  }

  if (style.textContent !== css) style.textContent = css;
  if (!style.parentElement) document.head.appendChild(style);
}

function parsePixelValue(value: string | null | undefined) {
  const number = Number.parseFloat(String(value ?? '').replace('px', ''));
  return Number.isFinite(number) ? number : 0;
}

function getNode(stage: HTMLElement, id: string) {
  return stage.querySelector<HTMLElement>(`.mobile-family-full-map-node[data-full-map-id="${id}"]`);
}

function getNodeBox(node: HTMLElement): NodeBox | null {
  const id = node.dataset.fullMapId;
  if (!id) return null;

  const left = parsePixelValue(node.style.left);
  const top = parsePixelValue(node.style.top);
  const width = parsePixelValue(node.style.width) || node.offsetWidth;
  const height = parsePixelValue(node.style.height) || node.offsetHeight;

  return { id, left, top, width, height };
}

function anchorPoint(node: NodeBox, anchor: Anchor) {
  if (anchor === 'top') return { x: node.left + node.width / 2, y: node.top };
  if (anchor === 'right') return { x: node.left + node.width, y: node.top + node.height / 2 };
  if (anchor === 'bottom') return { x: node.left + node.width / 2, y: node.top + node.height };
  return { x: node.left, y: node.top + node.height / 2 };
}

function edgePath(from: { x: number; y: number }, to: { x: number; y: number }, via: Via) {
  if (via === 'horizontal') {
    const midX = (from.x + to.x) / 2;
    return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
  }

  if (via === 'elbow') return `M ${from.x} ${from.y} L ${to.x} ${from.y} L ${to.x} ${to.y}`;

  if (Math.abs(from.x - to.x) < 0.5) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

  const midY = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
}

function compactFullMapName(value: string) {
  const cleaned = value
    .replace(/[★✚+]/g, ' ')
    .replace(/\b(18|19|20|21)\d{2}\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).join(' ') || cleaned || value.trim();
}

function normalizeFullMapNames(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.mobile-family-full-map-name').forEach((nameElement) => {
    const nextText = compactFullMapName(nameElement.textContent ?? '');
    if (nextText && nameElement.textContent !== nextText) nameElement.textContent = nextText;
  });

  root.querySelectorAll<HTMLElement>('[data-family-map-mobile-card="true"]').forEach((card) => {
    Array.from(card.querySelectorAll<HTMLElement>('span')).forEach((span) => {
      const text = String(span.textContent ?? '').trim();
      if (/^[★✚+\s\d]+$/.test(text) || /\b(18|19|20|21)\d{2}\b/.test(text)) {
        span.style.setProperty('display', 'none', 'important');
      }
    });

    const nameCandidate = Array.from(card.querySelectorAll<HTMLElement>('span'))
      .find((span) => {
        const text = String(span.textContent ?? '').trim();
        return text.length >= 3
          && /[A-Za-zÀ-ÿ]{3,}/.test(text)
          && !/\b(18|19|20|21)\d{2}\b/.test(text);
      });

    if (nameCandidate) {
      const nextText = compactFullMapName(nameCandidate.textContent ?? '');
      if (nextText && nameCandidate.textContent !== nextText) nameCandidate.textContent = nextText;
    }
  });
}

function estimateCompactMaternalUncleHeight(node: HTMLElement) {
  const cards = Array.from(node.querySelectorAll<HTMLElement>('.mobile-family-full-map-card, [data-family-map-mobile-card="true"]'));
  const columns = 2;
  const rows = Math.max(1, Math.ceil(Math.max(1, cards.length) / columns));
  const cardHeight = 70;
  const shellPadding = 20;
  const titleHeight = 20;
  const gridGap = 6;
  const bottomBreathingRoom = 10;
  const estimated = shellPadding + titleHeight + (rows * cardHeight) + ((rows - 1) * gridGap) + bottomBreathingRoom;
  return Math.max(126, estimated);
}

function compactMaternalUncles(stage: HTMLElement) {
  const tiosMaternos = getNode(stage, 'tios-maternos');
  if (!tiosMaternos) return;

  const oldHeight = parsePixelValue(tiosMaternos.style.height) || tiosMaternos.offsetHeight;
  const nextHeight = estimateCompactMaternalUncleHeight(tiosMaternos);
  if (oldHeight <= nextHeight + 2) return;

  tiosMaternos.style.setProperty('height', `${nextHeight}px`);
  tiosMaternos.style.setProperty('min-height', `${nextHeight}px`);
  tiosMaternos.setAttribute('data-mobile-family-full-map-compacted', 'true');

  const primosMaternos = getNode(stage, 'primos-maternos');
  if (primosMaternos) {
    const nextTop = parsePixelValue(tiosMaternos.style.top) + nextHeight + 22;
    primosMaternos.style.setProperty('top', `${nextTop}px`);
  }
}

function rebuildConnectors(stage: HTMLElement) {
  const svg = stage.querySelector<SVGSVGElement>(FULL_MAP_CONNECTORS_SELECTOR);
  if (!svg) return;

  const boxes = new Map<string, NodeBox>();
  stage.querySelectorAll<HTMLElement>('.mobile-family-full-map-node[data-full-map-id]').forEach((node) => {
    const box = getNodeBox(node);
    if (box) boxes.set(box.id, box);
  });

  while (svg.firstChild) svg.firstChild.remove();

  EDGE_DEFINITIONS.forEach(([fromId, toId, fromAnchor, toAnchor, via]) => {
    const fromNode = boxes.get(fromId);
    const toNode = boxes.get(toId);
    if (!fromNode || !toNode) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', edgePath(
      anchorPoint(fromNode, fromAnchor as Anchor),
      anchorPoint(toNode, toAnchor as Anchor),
      via as Via,
    ));
    svg.appendChild(path);
  });
}

function applyCompactFix() {
  if (!isEnabled()) return;
  ensureStyles();

  document.querySelectorAll<HTMLElement>(FULL_MAP_SELECTOR).forEach((root) => {
    normalizeFullMapNames(root);
    const stage = root.querySelector<HTMLElement>(FULL_MAP_STAGE_SELECTOR);
    if (!stage) return;
    compactMaternalUncles(stage);
    rebuildConnectors(stage);
  });
}

function scheduleApplyCompactFix() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyCompactFix();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyCompactFix();
  [80, 220, 520, 1000].forEach((delay) => window.setTimeout(applyCompactFix, delay));

  const observer = new MutationObserver(scheduleApplyCompactFix);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', applyCompactFix, { passive: true });
  window.addEventListener('orientationchange', applyCompactFix, { passive: true });
  window.addEventListener('popstate', scheduleApplyCompactFix, { passive: true });
}

export {};
