const MOBILE_QUERY = '(max-width: 767px)';
const GENERATION_LINE_PATH = '/linha-geracional';
const FULL_MAP_ID = 'mobile-generation-line-full-overview';
const INLINE_SELECTOR = '[data-mobile-generation-line-full-inline="true"]';
const STYLE_ID = 'mobile-generation-line-full-overview-style';
const FULL_MAP_OPEN_EVENT = 'arvorefamilia:mobile-generation-full-map-open';
const HORIZONTAL_ROOT_SELECTOR = '[data-family-map-horizontal-mobile-root="true"]';

type GestureState =
  | { mode: 'pan'; x: number; y: number; translateX: number; translateY: number }
  | { mode: 'pinch'; startDistance: number; startScale: number; anchorX: number; anchorY: number };

type GenerationPerson = {
  id: string;
  name: string;
  photoSrc?: string;
  colorKey: string;
  central: boolean;
};

type GenerationGroup = {
  generation: number;
  label: string;
  people: GenerationPerson[];
};

let gestureState: GestureState | null = null;
let scale = 1;
let translateX = 0;
let translateY = 0;
let scheduled = false;

const GENERATION_LABELS: Record<number, string> = {
  1: 'Tataravós',
  2: 'Bisavós',
  3: 'Avós',
  4: 'Pais',
  5: 'Pessoa principal',
  6: 'Filhos',
  7: 'Netos',
  8: 'Pets',
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
    && window.location.pathname.replace(/\/$/, '') === GENERATION_LINE_PATH;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).join(' ') || 'Pessoa';
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      #${FULL_MAP_ID} {
        position: relative !important;
        display: flex !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 0 !important;
        flex: 1 1 auto !important;
        overflow: hidden !important;
        background: var(--tree-palette-canvas-bg, #ecfeff) !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-viewport {
        position: relative !important;
        flex: 1 1 auto !important;
        width: 100% !important;
        height: 100% !important;
        min-height: min(72vh, 32rem) !important;
        overflow: hidden !important;
        border: 0 !important;
        border-radius: 0.85rem !important;
        background: var(--tree-palette-canvas-bg, #ecfeff) !important;
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tree-palette-group-border, #0891b2) 28%, transparent) !important;
        overscroll-behavior: contain !important;
        touch-action: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-stage {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        transform-origin: 0 0 !important;
        will-change: transform !important;
        overflow: visible !important;
        touch-action: none !important;
        overscroll-behavior: contain !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-connectors {
        position: absolute !important;
        inset: 0 !important;
        z-index: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-connectors path {
        fill: none !important;
        stroke: var(--tree-palette-edge-child, #0e7490) !important;
        stroke-width: 4 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-column {
        position: absolute !important;
        z-index: 1 !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 0.5rem !important;
        border: var(--tree-palette-group-border-width, 2px) solid var(--tree-palette-group-border, #0891b2) !important;
        border-radius: 1.05rem !important;
        background: var(--tree-palette-group-bg, rgba(255,255,255,0.96)) !important;
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.1) !important;
        padding: 0.6rem !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-title {
        color: var(--tree-palette-text-primary, #0f172a) !important;
        font-size: 0.66rem !important;
        font-weight: 950 !important;
        letter-spacing: 0.08em !important;
        line-height: 1.05 !important;
        text-align: center !important;
        text-transform: uppercase !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-grid {
        display: grid !important;
        grid-template-columns: repeat(var(--generation-columns, 1), minmax(0, 1fr)) !important;
        gap: 0.4rem !important;
        width: 100% !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-card {
        box-sizing: border-box !important;
        display: flex !important;
        min-height: 82px !important;
        min-width: 0 !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.18rem !important;
        border: 1px solid var(--generation-card-border, var(--tree-palette-group-border, #0891b2)) !important;
        border-radius: 0.82rem !important;
        background: var(--generation-card-bg, var(--tree-palette-card-central, #38bdf8)) !important;
        color: var(--tree-palette-text-primary, #0f172a) !important;
        padding: 0.36rem !important;
        text-align: center !important;
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.1) !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-card[data-central="true"] {
        min-height: 112px !important;
        border-radius: 1.1rem !important;
        background: var(--tree-palette-card-central, #38bdf8) !important;
        border-color: var(--tree-palette-border-central, #0369a1) !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-avatar {
        display: flex !important;
        width: 34px !important;
        height: 34px !important;
        align-items: center !important;
        justify-content: center !important;
        overflow: hidden !important;
        border: 3px solid rgba(255, 255, 255, 0.78) !important;
        border-radius: 999px !important;
        background: rgba(255, 255, 255, 0.22) !important;
        color: var(--tree-palette-text-primary, #0f172a) !important;
        font-size: 0.72rem !important;
        font-weight: 950 !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-card[data-central="true"] .mobile-generation-line-full-map-avatar {
        width: 54px !important;
        height: 54px !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-avatar img {
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-name {
        display: block !important;
        width: 100% !important;
        color: var(--tree-palette-text-primary, #0f172a) !important;
        font-size: 0.56rem !important;
        font-weight: 950 !important;
        letter-spacing: 0.01em !important;
        line-height: 1.05 !important;
        overflow: visible !important;
        overflow-wrap: anywhere !important;
        text-align: center !important;
        text-overflow: clip !important;
        text-transform: uppercase !important;
        white-space: normal !important;
      }

      #${FULL_MAP_ID} .mobile-generation-line-full-map-card[data-central="true"] .mobile-generation-line-full-map-name {
        font-size: 0.72rem !important;
        white-space: nowrap !important;
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

function getInlineFullMap() {
  const fullMap = document.querySelector<HTMLElement>(
    `#${FULL_MAP_ID}[data-mobile-generation-line-full-inline="true"], ${INLINE_SELECTOR} #${FULL_MAP_ID}`
  );
  if (!fullMap) return null;

  return fullMap.matches('[data-mobile-generation-line-full-inline="true"]') || fullMap.closest(INLINE_SELECTOR)
    ? fullMap
    : null;
}

function getColorKeyForGeneration(generation: number) {
  if (generation === 1) return 'tataravos';
  if (generation === 2) return 'bisavos';
  if (generation === 3) return 'avos';
  if (generation === 4) return 'pais';
  if (generation === 5) return 'central';
  if (generation === 6) return 'netos';
  if (generation === 8) return 'pets';
  return 'irmaos';
}

function getCardPaletteStyle(colorKey: string) {
  return [
    `--generation-card-bg: var(--tree-palette-card-${colorKey}, var(--tree-palette-card-central, #38bdf8))`,
    `--generation-card-border: var(--tree-palette-border-${colorKey}, var(--tree-palette-group-border, #0891b2))`,
  ].join(';');
}

function extractGroups() {
  const root = document.querySelector<HTMLElement>(HORIZONTAL_ROOT_SELECTOR);
  const groups = new Map<number, GenerationPerson[]>();

  root?.querySelectorAll<HTMLElement>('[data-mobile-horizontal-generation][data-mobile-horizontal-card="true"]').forEach((wrapper, index) => {
    const generation = Number(wrapper.getAttribute('data-mobile-horizontal-generation'));
    if (!Number.isFinite(generation)) return;

    const card = wrapper.querySelector<HTMLElement>('[data-family-map-color-key]');
    const name = formatName(card?.querySelector<HTMLElement>('[data-family-map-person-name="true"]')?.textContent ?? '');
    const photoSrc = card?.querySelector<HTMLImageElement>('img')?.src;
    const colorKey = card?.getAttribute('data-family-map-color-key') || getColorKeyForGeneration(generation);
    const central = colorKey === 'central' || generation === 5;
    const people = groups.get(generation) ?? [];

    people.push({
      id: `${generation}-${index}-${name}`,
      name,
      photoSrc,
      colorKey,
      central,
    });
    groups.set(generation, people);
  });

  return Array.from(groups.entries())
    .sort(([left], [right]) => left - right)
    .map(([generation, people]) => ({
      generation,
      label: GENERATION_LABELS[generation] ?? `Geração ${generation}`,
      people,
    }))
    .filter((group) => group.people.length > 0);
}

function buildAvatar(person: GenerationPerson) {
  if (person.photoSrc) {
    return `<span class="mobile-generation-line-full-map-avatar"><img src="${escapeHtml(person.photoSrc)}" alt="" loading="lazy" /></span>`;
  }

  const initials = person.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return `<span class="mobile-generation-line-full-map-avatar">${escapeHtml(initials || 'P')}</span>`;
}

function estimateColumnHeight(group: GenerationGroup, columns: number) {
  const rows = Math.max(1, Math.ceil(group.people.length / columns));
  const cardHeight = group.people.some((person) => person.central) ? 112 : 82;
  return 18 + 18 + (rows * cardHeight) + ((rows - 1) * 7) + 20;
}

function buildStage() {
  const groups = extractGroups();
  const columnWidth = 154;
  const columnGap = 34;
  const top = 38;
  const sidePadding = 42;
  const stageWidth = Math.max(360, sidePadding * 2 + (groups.length * columnWidth) + (Math.max(0, groups.length - 1) * columnGap));
  const stageHeight = Math.max(520, top + Math.max(...groups.map((group) => estimateColumnHeight(group, group.people.length <= 1 ? 1 : 2)), 220) + 80);
  const stage = document.createElement('div');
  stage.className = 'mobile-generation-line-full-map-stage';
  stage.style.setProperty('width', `${stageWidth}px`, 'important');
  stage.style.setProperty('height', `${stageHeight}px`, 'important');
  stage.dataset.signature = groups.map((group) => `${group.generation}:${group.people.length}`).join('|');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'mobile-generation-line-full-map-connectors');
  svg.setAttribute('viewBox', `0 0 ${stageWidth} ${stageHeight}`);
  svg.setAttribute('aria-hidden', 'true');

  groups.forEach((group, index) => {
    const left = sidePadding + index * (columnWidth + columnGap);
    const columns = group.people.length <= 1 ? 1 : 2;
    const height = estimateColumnHeight(group, columns);
    const column = document.createElement('section');
    column.className = 'mobile-generation-line-full-map-column';
    column.style.setProperty('left', `${left}px`, 'important');
    column.style.setProperty('top', `${top}px`, 'important');
    column.style.setProperty('width', `${columnWidth}px`, 'important');
    column.style.setProperty('min-height', `${height}px`, 'important');
    column.setAttribute('aria-label', group.label);
    column.innerHTML = `
      <span class="mobile-generation-line-full-map-title">${escapeHtml(group.label)}</span>
      <div class="mobile-generation-line-full-map-grid" style="--generation-columns: ${columns}">
        ${group.people.map((person) => `
          <article class="mobile-generation-line-full-map-card" data-central="${person.central ? 'true' : 'false'}" style="${getCardPaletteStyle(person.colorKey)}">
            ${buildAvatar(person)}
            <span class="mobile-generation-line-full-map-name">${escapeHtml(person.name)}</span>
          </article>
        `).join('')}
      </div>
    `;
    stage.appendChild(column);

    const nextLeft = sidePadding + (index + 1) * (columnWidth + columnGap);
    if (index < groups.length - 1) {
      const y = top + Math.min(height, estimateColumnHeight(groups[index + 1], groups[index + 1].people.length <= 1 ? 1 : 2)) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${left + columnWidth} ${y} L ${nextLeft} ${y}`);
      svg.appendChild(path);
    }
  });

  stage.prepend(svg);
  return stage;
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

function getStage() {
  return document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-generation-line-full-map-stage`);
}

function applyTransform() {
  getStage()?.style.setProperty('transform', `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`, 'important');
}

function resetTransform() {
  const viewport = document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-generation-line-full-map-viewport`);
  const stage = getStage();
  if (!viewport || !stage) return;

  const viewportRect = viewport.getBoundingClientRect();
  if (viewportRect.width < 120 || viewportRect.height < 220) {
    window.setTimeout(resetTransform, 80);
    return;
  }

  const stageWidth = stage.offsetWidth || 900;
  const stageHeight = stage.offsetHeight || 560;
  const fitScale = Math.min((viewportRect.width - 12) / stageWidth, (viewportRect.height - 12) / stageHeight);
  scale = clamp(fitScale * 1.08, 0.22, 0.95);
  translateX = (viewportRect.width - (stageWidth * scale)) / 2;
  translateY = (viewportRect.height - (stageHeight * scale)) / 2;
  applyTransform();
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
    event.preventDefault();
  }
}

function handleTouchMove(event: TouchEvent) {
  const viewport = event.currentTarget as HTMLElement;
  if (!gestureState || !viewport || !document.getElementById(FULL_MAP_ID)) return;

  if (gestureState.mode === 'pinch' && event.touches.length >= 2) {
    const [first, second] = [event.touches[0], event.touches[1]];
    const mid = midpoint(first, second, viewport);
    const nextDistance = distance(first, second);
    scale = clamp(gestureState.startScale * (nextDistance / Math.max(1, gestureState.startDistance)), 0.18, 2.8);
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
  const fullMap = getInlineFullMap();
  const viewport = fullMap?.querySelector<HTMLElement>('.mobile-generation-line-full-map-viewport');
  if (!viewport) return;

  const nextStage = buildStage();
  const currentStage = viewport.querySelector<HTMLElement>('.mobile-generation-line-full-map-stage');
  const needsStage = viewport.dataset.mobileGenerationLineFullMapHydrated !== 'true'
    || !currentStage
    || currentStage.dataset.signature !== nextStage.dataset.signature;

  if (needsStage) {
    viewport.replaceChildren(nextStage);
    viewport.dataset.mobileGenerationLineFullMapHydrated = 'true';
    if (viewport.dataset.mobileGenerationLineFullMapGestures !== 'true') {
      viewport.addEventListener('touchstart', handleTouchStart, { passive: false });
      viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
      viewport.addEventListener('touchend', handleTouchEnd, { passive: false });
      viewport.addEventListener('touchcancel', handleTouchEnd, { passive: false });
      viewport.dataset.mobileGenerationLineFullMapGestures = 'true';
    }
  }

  window.requestAnimationFrame(resetTransform);
  window.setTimeout(resetTransform, 40);
}

function scheduleHydrateFullMap() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    hydrateFullMap();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  window.addEventListener(FULL_MAP_OPEN_EVENT, scheduleHydrateFullMap);
  window.addEventListener('resize', scheduleHydrateFullMap, { passive: true });
  window.addEventListener('orientationchange', () => window.setTimeout(scheduleHydrateFullMap, 220), { passive: true });
  window.addEventListener('popstate', () => { gestureState = null; }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleHydrateFullMap(); }, { passive: true });

  const observer = new MutationObserver(scheduleHydrateFullMap);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

export {};
