const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const GENERATION_LINE_PATH = '/linha-geracional';
const FAMILY_FULL_MAP_ID = 'mobile-family-map-full-overview';
const REFINEMENT_STYLE_ID = 'mobile-map-panel-refinements-style';

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function getPathname() {
  return typeof window === 'undefined' ? '' : window.location.pathname.replace(/\/$/, '');
}

function ensureRefinementStyles() {
  const css = `
    @media (max-width: 767px) {
      [data-mobile-family-tree-screen="paternal-uncles"],
      [data-mobile-family-tree-screen="maternal-uncles"] {
        overflow: hidden !important;
        overscroll-behavior: contain !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] > div,
      [data-mobile-family-tree-screen="maternal-uncles"] > div {
        box-sizing: border-box !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        overscroll-behavior-y: contain !important;
        -webkit-overflow-scrolling: touch !important;
        padding-bottom: calc(env(safe-area-inset-bottom,0px) + 7rem) !important;
      }

      #${FAMILY_FULL_MAP_ID} .mobile-family-full-map-viewport,
      #${FAMILY_FULL_MAP_ID} .mobile-family-full-map-stage,
      #mobile-generation-line-full-overview .mobile-generation-line-full-map-viewport,
      #mobile-generation-line-full-overview .mobile-generation-line-full-map-stage {
        touch-action: none !important;
        overscroll-behavior: contain !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }

      [data-mobile-generation-overview-grid="true"] {
        display: grid !important;
        grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
        grid-template-rows: 1fr !important;
        gap: 0.38rem !important;
        min-height: 9.2rem !important;
        overflow: visible !important;
      }

      [data-mobile-generation-column-card="true"] {
        appearance: none !important;
        display: flex !important;
        min-width: 0 !important;
        min-height: 9.2rem !important;
        height: 100% !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.7rem !important;
        border: 1px solid rgba(8, 145, 178, 0.26) !important;
        border-radius: 1.15rem !important;
        background: #fff !important;
        color: rgb(15, 23, 42) !important;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1) !important;
        padding: 0.55rem 0.2rem !important;
        text-align: center !important;
        transition: transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease !important;
      }

      [data-mobile-generation-column-card="true"][aria-current="location"] {
        border-color: rgb(8, 145, 178) !important;
        box-shadow: inset 0 0 0 2px rgba(8, 145, 178, 0.45), 0 12px 28px rgba(8, 145, 178, 0.18) !important;
      }

      [data-mobile-generation-column-card="true"]:active {
        transform: scale(0.985) !important;
      }

      [data-mobile-generation-column-icon="true"] {
        display: flex !important;
        width: 2.35rem !important;
        height: 2.35rem !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 0.9rem !important;
        background: var(--tree-palette-card-central, #38bdf8) !important;
        color: var(--tree-palette-text-primary, #0f172a) !important;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14) !important;
      }

      [data-mobile-generation-column-title="true"] {
        display: block !important;
        max-width: 100% !important;
        font-size: 0.56rem !important;
        font-weight: 950 !important;
        letter-spacing: 0.01em !important;
        line-height: 1.05 !important;
        text-transform: uppercase !important;
        white-space: normal !important;
      }
    }
  `;

  let style = document.getElementById(REFINEMENT_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = REFINEMENT_STYLE_ID;
  }

  if (style.textContent !== css) style.textContent = css;
  if (!style.parentElement) document.head.appendChild(style);
}

function numericStyle(element: HTMLElement, property: 'left' | 'top' | 'width' | 'height' | 'minHeight') {
  const raw = element.style[property] || window.getComputedStyle(element).getPropertyValue(property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`));
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 0;
}

function getFamilyNode(stage: HTMLElement, id: string) {
  return stage.querySelector<HTMLElement>(`[data-full-map-id="${id}"]`);
}

function nodeBox(node: HTMLElement) {
  const left = numericStyle(node, 'left');
  const top = numericStyle(node, 'top');
  const width = numericStyle(node, 'width') || node.offsetWidth;
  const height = numericStyle(node, 'height') || numericStyle(node, 'minHeight') || node.offsetHeight;

  return { left, top, width, height };
}

function setNodeBox(node: HTMLElement, next: Partial<ReturnType<typeof nodeBox>>) {
  if (typeof next.left === 'number') node.style.setProperty('left', `${Math.round(next.left)}px`);
  if (typeof next.top === 'number') node.style.setProperty('top', `${Math.round(next.top)}px`);
  if (typeof next.width === 'number') node.style.setProperty('width', `${Math.round(next.width)}px`);
  if (typeof next.height === 'number') {
    const height = Math.round(next.height);
    node.style.setProperty('height', `${height}px`);
    node.style.setProperty('min-height', `${height}px`);
  }
}

function desiredGroupHeight(node: HTMLElement, minimum = 0, extra = 18) {
  const title = node.querySelector<HTMLElement>('.mobile-family-full-map-group-title');
  const grid = node.querySelector<HTMLElement>('.mobile-family-full-map-card-grid');
  if (!grid) return Math.max(minimum, nodeBox(node).height);

  const titleHeight = title ? title.offsetHeight : 0;
  const titleMargin = title ? 8 : 0;
  const gridHeight = grid.scrollHeight || grid.offsetHeight;
  const shellPadding = 18;
  return Math.max(minimum, Math.ceil(titleHeight + titleMargin + gridHeight + shellPadding + extra));
}

function anchor(box: ReturnType<typeof nodeBox>, point: 'top' | 'right' | 'bottom' | 'left') {
  if (point === 'top') return { x: box.left + box.width / 2, y: box.top };
  if (point === 'right') return { x: box.left + box.width, y: box.top + box.height / 2 };
  if (point === 'bottom') return { x: box.left + box.width / 2, y: box.top + box.height };
  return { x: box.left, y: box.top + box.height / 2 };
}

function connectorPath(from: { x: number; y: number }, to: { x: number; y: number }, via: 'vertical' | 'horizontal' | 'elbow' = 'vertical') {
  if (via === 'horizontal') {
    const midX = (from.x + to.x) / 2;
    return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
  }

  if (via === 'elbow') return `M ${from.x} ${from.y} L ${to.x} ${from.y} L ${to.x} ${to.y}`;
  if (Math.abs(from.x - to.x) < 0.5) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

  const midY = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
}

function rebuildFamilyConnectors(stage: HTMLElement) {
  const svg = stage.querySelector<SVGSVGElement>('.mobile-family-full-map-connectors');
  if (!svg) return;

  const edges: Array<{ from: string; to: string; fromAnchor: 'top' | 'right' | 'bottom' | 'left'; toAnchor: 'top' | 'right' | 'bottom' | 'left'; via?: 'vertical' | 'horizontal' | 'elbow' }> = [
    { from: 'tataravos-paternos', to: 'bisavos-paternos', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'bisavos-paternos', to: 'avos-paternos', fromAnchor: 'right', toAnchor: 'left', via: 'horizontal' },
    { from: 'tataravos-maternos', to: 'bisavos-maternos', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
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
    { from: 'central', to: 'conjuge', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'irmaos', to: 'sobrinhos', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'conjuge', to: 'pets', fromAnchor: 'bottom', toAnchor: 'top', via: 'vertical' },
    { from: 'filhos', to: 'netos', fromAnchor: 'right', toAnchor: 'left', via: 'horizontal' },
  ];

  svg.querySelectorAll('path').forEach((path) => path.remove());
  edges.forEach((edge) => {
    const fromNode = getFamilyNode(stage, edge.from);
    const toNode = getFamilyNode(stage, edge.to);
    if (!fromNode || !toNode) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', connectorPath(anchor(nodeBox(fromNode), edge.fromAnchor), anchor(nodeBox(toNode), edge.toAnchor), edge.via));
    svg.appendChild(path);
  });
}

function refineFamilyFullMap() {
  if (getPathname() !== FAMILY_MAP_PATH || !isMobileViewport()) return;

  const stage = document.querySelector<HTMLElement>(`#${FAMILY_FULL_MAP_ID} .mobile-family-full-map-stage`);
  if (!stage) return;

  const tuneHeight = (id: string, min = 0, extra = 18) => {
    const node = getFamilyNode(stage, id);
    if (!node) return;
    setNodeBox(node, { height: desiredGroupHeight(node, min, extra) });
  };

  tuneHeight('bisavos-paternos', 178, 24);
  tuneHeight('avos-paternos', 176, 24);
  tuneHeight('tios-paternos', 368, 26);
  tuneHeight('primos-maternos', 118, 22);
  tuneHeight('avos-maternos', 118, 14);
  tuneHeight('bisavos-maternos', 118, 14);
  tuneHeight('tios-maternos', 190, 14);
  tuneHeight('conjuge', 0, 16);
  tuneHeight('sobrinhos', 0, 16);
  tuneHeight('pets', 0, 16);

  const bisavosPaternos = getFamilyNode(stage, 'bisavos-paternos');
  const tiosPaternos = getFamilyNode(stage, 'tios-paternos');
  const primosPaternos = getFamilyNode(stage, 'primos-paternos');
  if (bisavosPaternos && tiosPaternos) {
    const nextTop = nodeBox(bisavosPaternos).top + nodeBox(bisavosPaternos).height + 72;
    setNodeBox(tiosPaternos, { top: nextTop });
  }
  if (tiosPaternos && primosPaternos) {
    const nextTop = nodeBox(tiosPaternos).top + nodeBox(tiosPaternos).height + 22;
    setNodeBox(primosPaternos, { top: nextTop });
  }

  const tiosMaternos = getFamilyNode(stage, 'tios-maternos');
  const primosMaternos = getFamilyNode(stage, 'primos-maternos');
  if (tiosMaternos && primosMaternos) {
    const tiosBox = nodeBox(tiosMaternos);
    const primosBox = nodeBox(primosMaternos);
    setNodeBox(primosMaternos, {
      left: tiosBox.left + (tiosBox.width - primosBox.width) / 2,
      top: tiosBox.top + tiosBox.height + 22,
    });
  }

  const central = getFamilyNode(stage, 'central');
  const irmaos = getFamilyNode(stage, 'irmaos');
  const conjuge = getFamilyNode(stage, 'conjuge');
  const sobrinhos = getFamilyNode(stage, 'sobrinhos');
  const pets = getFamilyNode(stage, 'pets');
  if (central && (irmaos || conjuge)) {
    const centralBox = nodeBox(central);
    const centerX = centralBox.left + centralBox.width / 2;
    const lowerTop = centralBox.top + centralBox.height + 96;
    const offset = 132;

    if (irmaos) {
      const box = nodeBox(irmaos);
      setNodeBox(irmaos, { left: centerX - offset - box.width / 2, top: lowerTop });
    }

    if (conjuge) {
      const box = nodeBox(conjuge);
      setNodeBox(conjuge, { left: centerX + offset - box.width / 2, top: lowerTop });
    }
  }

  if (irmaos && sobrinhos) {
    const parent = nodeBox(irmaos);
    const child = nodeBox(sobrinhos);
    setNodeBox(sobrinhos, {
      left: parent.left + (parent.width - child.width) / 2,
      top: parent.top + parent.height + 44,
    });
  }

  if (conjuge && pets) {
    const parent = nodeBox(conjuge);
    const child = nodeBox(pets);
    setNodeBox(pets, {
      left: parent.left + (parent.width - child.width) / 2,
      top: parent.top + parent.height + 44,
    });
  }

  rebuildFamilyConnectors(stage);
}

function generationIconSvg() {
  return `
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="3" width="6" height="6" rx="1" />
      <rect x="4" y="15" width="6" height="6" rx="1" />
      <rect x="14" y="15" width="6" height="6" rx="1" />
      <path d="M12 9v3M7 15v-3h10v3" />
    </svg>
  `;
}

function clickGenerationButton(generation: number) {
  const navButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-family-map-horizontal-mobile-root="true"] nav[aria-label^="Gera"] button'));
  const target = navButtons.find((button) => Number((button.textContent ?? '').match(/\d+/)?.[0]) === generation);
  target?.click();

  const activeMapButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => button.getAttribute('aria-pressed') === 'true' && /\bMapa\b/i.test(button.textContent ?? ''));
  window.setTimeout(() => activeMapButton?.click(), 20);
}

function refineGenerationOverview() {
  if (getPathname() !== GENERATION_LINE_PATH || !isMobileViewport()) return;

  const panel = document.querySelector<HTMLElement>('[data-mobile-family-map-inline-overview="true"][data-mobile-family-map-panel-mode="overview"]');
  if (!panel) return;

  const grid = panel.querySelector<HTMLElement>(':scope > div');
  const cta = panel.querySelector<HTMLButtonElement>(':scope > button');
  if (!grid || !cta) return;

  const activeGeneration = Number(
    Array.from(document.querySelectorAll<HTMLButtonElement>('[data-family-map-horizontal-mobile-root="true"] nav[aria-label^="Gera"] button'))
      .find((button) => button.getAttribute('aria-current') === 'page' || button.getAttribute('aria-pressed') === 'true')
      ?.textContent?.match(/\d+/)?.[0]
  ) || 0;

  const signature = `generation-columns-v2:${activeGeneration}`;
  if (grid.dataset.mobileGenerationColumnsSignature !== signature) {
    grid.replaceChildren(...[1, 2, 3, 4, 5, 6].map((generation) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.mobileGenerationColumnCard = 'true';
      button.setAttribute('aria-label', `Abrir Geração ${generation}`);
      if (activeGeneration === generation) button.setAttribute('aria-current', 'location');
      button.innerHTML = `
        <span data-mobile-generation-column-icon="true">${generationIconSvg()}</span>
        <span data-mobile-generation-column-title="true">Geração ${generation}</span>
      `;
      button.addEventListener('click', () => clickGenerationButton(generation));
      return button;
    }));
    grid.dataset.mobileGenerationColumnsSignature = signature;
  }

  grid.dataset.mobileGenerationOverviewGrid = 'true';
  cta.textContent = 'Exibir visualização completa';
}

let scheduled = false;
function scheduleRefinement() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    ensureRefinementStyles();
    refineFamilyFullMap();
    refineGenerationOverview();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureRefinementStyles();
  scheduleRefinement();
  [80, 180, 420, 900].forEach((delay) => window.setTimeout(scheduleRefinement, delay));

  const observer = new MutationObserver(scheduleRefinement);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-mobile-family-map-panel-mode', 'style', 'aria-current', 'aria-pressed'] });

  window.addEventListener('resize', scheduleRefinement, { passive: true });
  window.addEventListener('orientationchange', () => window.setTimeout(scheduleRefinement, 180), { passive: true });
  window.addEventListener('popstate', scheduleRefinement, { passive: true });
  window.addEventListener('arvorefamilia:mobile-full-map-open', scheduleRefinement);
  window.addEventListener('arvorefamilia:mobile-generation-full-map-open', scheduleRefinement);
}

export {};
