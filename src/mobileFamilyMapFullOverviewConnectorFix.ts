const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const FULL_MAP_ID = 'mobile-family-map-full-overview';
const STYLE_ID = 'mobile-family-map-full-overview-connector-fix-style';

const SVG_NS = 'http://www.w3.org/2000/svg';

type Anchor = 'top' | 'right' | 'bottom' | 'left';

type NodeBox = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

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

function numericStyle(element: HTMLElement, property: string, fallback = 0) {
  const inline = element.style.getPropertyValue(property);
  const computed = window.getComputedStyle(element).getPropertyValue(property);
  const parsed = Number.parseFloat(inline || computed);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function collectNodeBoxes(stage: HTMLElement) {
  const boxes = new Map<string, NodeBox>();

  stage.querySelectorAll<HTMLElement>('[data-full-map-id]').forEach((node) => {
    const id = node.dataset.fullMapId;
    if (!id) return;

    const left = numericStyle(node, 'left');
    const top = numericStyle(node, 'top');
    const width = numericStyle(node, 'width', node.offsetWidth);
    const height = Math.max(
      numericStyle(node, 'min-height', node.offsetHeight),
      numericStyle(node, 'height', node.offsetHeight),
      node.offsetHeight,
    );

    boxes.set(id, { id, left, top, width, height });
  });

  return boxes;
}

function centerX(box: NodeBox) {
  return box.left + box.width / 2;
}

function centerY(box: NodeBox) {
  return box.top + box.height / 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function point(box: NodeBox, anchor: Anchor, preferred?: { x?: number; y?: number }) {
  if (anchor === 'top') {
    return {
      x: clamp(preferred?.x ?? centerX(box), box.left, box.left + box.width),
      y: box.top,
    };
  }

  if (anchor === 'bottom') {
    return {
      x: clamp(preferred?.x ?? centerX(box), box.left, box.left + box.width),
      y: box.top + box.height,
    };
  }

  if (anchor === 'right') {
    return {
      x: box.left + box.width,
      y: clamp(preferred?.y ?? centerY(box), box.top, box.top + box.height),
    };
  }

  return {
    x: box.left,
    y: clamp(preferred?.y ?? centerY(box), box.top, box.top + box.height),
  };
}

function addPath(svg: SVGSVGElement, d: string, id: string) {
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('data-full-map-connector-fix', id);
  svg.appendChild(path);
}

function addDirectPath(svg: SVGSVGElement, boxes: Map<string, NodeBox>, fromId: string, toId: string, fromAnchor: Anchor, toAnchor: Anchor, id: string, preferred?: { x?: number; y?: number }) {
  const from = boxes.get(fromId);
  const to = boxes.get(toId);
  if (!from || !to) return;

  const start = point(from, fromAnchor, preferred);
  const end = point(to, toAnchor, preferred);
  addPath(svg, `M ${start.x} ${start.y} L ${end.x} ${end.y}`, id);
}

function addVerticalPath(svg: SVGSVGElement, boxes: Map<string, NodeBox>, fromId: string, toId: string, id: string) {
  const from = boxes.get(fromId);
  const to = boxes.get(toId);
  if (!from || !to) return;

  const start = point(from, 'bottom', { x: centerX(from) });
  const end = point(to, 'top', { x: centerX(to) });
  const midY = (start.y + end.y) / 2;
  addPath(svg, `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`, id);
}

function addParentBranch(svg: SVGSVGElement, boxes: Map<string, NodeBox>) {
  const central = boxes.get('central');
  const pai = boxes.get('pai');
  const mae = boxes.get('mae');
  if (!central || !pai || !mae) return;

  const start = point(central, 'top', { x: centerX(central) });
  const paiEnd = point(pai, 'bottom', { x: centerX(pai) });
  const maeEnd = point(mae, 'bottom', { x: centerX(mae) });
  const branchY = Math.round((start.y + Math.max(paiEnd.y, maeEnd.y)) / 2);

  addPath(
    svg,
    [
      `M ${start.x} ${start.y}`,
      `L ${start.x} ${branchY}`,
      `L ${paiEnd.x} ${branchY}`,
      `L ${paiEnd.x} ${paiEnd.y}`,
      `M ${start.x} ${branchY}`,
      `L ${maeEnd.x} ${branchY}`,
      `L ${maeEnd.x} ${maeEnd.y}`,
    ].join(' '),
    'central-parent-branch',
  );
}

function addCentralBottomBranch(svg: SVGSVGElement, boxes: Map<string, NodeBox>) {
  const central = boxes.get('central');
  const irmaos = boxes.get('irmaos');
  const conjuge = boxes.get('conjuge');
  if (!central || !irmaos || !conjuge) return;

  const start = point(central, 'bottom', { x: centerX(central) });
  const irmaosEnd = point(irmaos, 'top', { x: centerX(irmaos) });
  const conjugeEnd = point(conjuge, 'top', { x: centerX(conjuge) });
  const branchY = Math.round((start.y + Math.min(irmaosEnd.y, conjugeEnd.y)) / 2);

  addPath(
    svg,
    [
      `M ${start.x} ${start.y}`,
      `L ${start.x} ${branchY}`,
      `L ${irmaosEnd.x} ${branchY}`,
      `L ${irmaosEnd.x} ${irmaosEnd.y}`,
      `M ${start.x} ${branchY}`,
      `L ${conjugeEnd.x} ${branchY}`,
      `L ${conjugeEnd.x} ${conjugeEnd.y}`,
    ].join(' '),
    'central-bottom-branch',
  );
}

function rewriteConnectors() {
  if (!isEnabled()) return;
  const stage = document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-family-full-map-stage`);
  const svg = stage?.querySelector<SVGSVGElement>('.mobile-family-full-map-connectors');
  if (!stage || !svg) return;

  const boxes = collectNodeBoxes(stage);
  svg.replaceChildren();

  const avosPaternos = boxes.get('avos-paternos');
  const avosMaternos = boxes.get('avos-maternos');
  const pai = boxes.get('pai');
  const mae = boxes.get('mae');

  addDirectPath(svg, boxes, 'bisavos-paternos', 'avos-paternos', 'right', 'left', 'bisavos-paternos-to-avos-paternos', { y: avosPaternos ? centerY(avosPaternos) : undefined });
  addDirectPath(svg, boxes, 'bisavos-maternos', 'avos-maternos', 'left', 'right', 'bisavos-maternos-to-avos-maternos', { y: avosMaternos ? centerY(avosMaternos) : undefined });

  addVerticalPath(svg, boxes, 'avos-paternos', 'pai', 'avos-paternos-to-pai');
  addVerticalPath(svg, boxes, 'avos-maternos', 'mae', 'avos-maternos-to-mae');

  addDirectPath(svg, boxes, 'tios-paternos', 'pai', 'right', 'left', 'tios-paternos-to-pai', { y: pai ? centerY(pai) : undefined });
  addDirectPath(svg, boxes, 'tios-maternos', 'mae', 'left', 'right', 'tios-maternos-to-mae', { y: mae ? centerY(mae) : undefined });

  addVerticalPath(svg, boxes, 'tios-paternos', 'primos-paternos', 'tios-paternos-to-primos-paternos');
  addVerticalPath(svg, boxes, 'tios-maternos', 'primos-maternos', 'tios-maternos-to-primos-maternos');

  addParentBranch(svg, boxes);
  addCentralBottomBranch(svg, boxes);

  addDirectPath(svg, boxes, 'conjuge', 'filhos', 'right', 'left', 'conjuge-to-filhos', { y: boxes.get('filhos') ? centerY(boxes.get('filhos') as NodeBox) : undefined });
  addVerticalPath(svg, boxes, 'irmaos', 'sobrinhos', 'irmaos-to-sobrinhos');
  addVerticalPath(svg, boxes, 'conjuge', 'pets', 'conjuge-to-pets');
  addVerticalPath(svg, boxes, 'filhos', 'netos', 'filhos-to-netos');
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="parent"] {
        overflow: visible !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-card[data-variant="parent"] .mobile-family-full-map-card-label {
        top: -0.82rem !important;
        z-index: 5 !important;
        min-height: 1.34rem !important;
        overflow: visible !important;
        white-space: nowrap !important;
      }

      #${FULL_MAP_ID} .mobile-family-full-map-node[data-full-map-kind="person"],
      #${FULL_MAP_ID} .mobile-family-full-map-node[data-full-map-kind="person"] .mobile-family-full-map-group-shell,
      #${FULL_MAP_ID} .mobile-family-full-map-node[data-full-map-id="pai"],
      #${FULL_MAP_ID} .mobile-family-full-map-node[data-full-map-id="mae"] {
        overflow: visible !important;
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

function applyConnectorFix() {
  if (!isEnabled()) return;
  ensureStyles();
  rewriteConnectors();
}

function scheduleApply() {
  window.requestAnimationFrame(() => {
    applyConnectorFix();
    window.setTimeout(applyConnectorFix, 80);
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  scheduleApply();
  [120, 360, 720, 1200].forEach((delay) => window.setTimeout(applyConnectorFix, delay));

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

  window.addEventListener('resize', applyConnectorFix, { passive: true });
  window.addEventListener('orientationchange', applyConnectorFix, { passive: true });
  window.addEventListener('popstate', applyConnectorFix, { passive: true });
  document.addEventListener('visibilitychange', applyConnectorFix, { passive: true });
}

export {};
