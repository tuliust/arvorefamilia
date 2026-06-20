const MOBILE_QUERY = '(max-width: 767px)';
const HORIZONTAL_MAP_PATH = '/mapa-familiar-horizontal';
const HORIZONTAL_ROOT_SELECTOR = '[data-family-map-horizontal-mobile-root="true"]';
const TOOLBAR_ZOOM_SELECTOR = '[data-mobile-family-map-toolbar-action="zoom"]';
const OVERLAY_ID = 'mobile-family-horizontal-generation-overview';
const STYLE_ID = 'mobile-family-horizontal-generation-overview-style';

const GENERATION_LABELS: Record<number, string> = {
  1: 'Tataravós',
  2: 'Bisavós',
  3: 'Avós',
  4: 'Pais',
  5: 'Núcleo',
  6: 'Descendentes',
};

let lastActivation = 0;
let lastOverlayAction = 0;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isEnabled() {
  return isMobileViewport()
    && window.location.pathname.replace(/\/$/, '') === HORIZONTAL_MAP_PATH;
}

function getRoot() {
  return document.querySelector<HTMLElement>(HORIZONTAL_ROOT_SELECTOR);
}

function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

function getGenerationButtons() {
  const root = getRoot();
  return Array.from(root?.querySelectorAll<HTMLButtonElement>('nav[aria-label="Gerações do Mapa Genealógico"] button') ?? [])
    .map((button) => {
      const generation = Number((button.textContent ?? '').match(/\d+/)?.[0]);
      return Number.isFinite(generation) ? { button, generation } : null;
    })
    .filter((entry): entry is { button: HTMLButtonElement; generation: number } => Boolean(entry));
}

function getAvailableGenerations() {
  const buttonGenerations = getGenerationButtons().map((entry) => entry.generation);
  if (buttonGenerations.length > 0) return Array.from(new Set(buttonGenerations)).sort((a, b) => a - b);

  const root = getRoot();
  const cardGenerations = Array.from(root?.querySelectorAll<HTMLElement>('[data-mobile-horizontal-generation]') ?? [])
    .map((element) => Number(element.getAttribute('data-mobile-horizontal-generation')))
    .filter((generation) => Number.isFinite(generation));

  return Array.from(new Set(cardGenerations)).sort((a, b) => a - b);
}

function getActiveGeneration() {
  const activeButton = getGenerationButtons().find((entry) => entry.button.getAttribute('aria-current') === 'page');
  if (activeButton) return activeButton.generation;

  const root = getRoot();
  const visibleHeaderText = Array.from(root?.querySelectorAll<HTMLElement>('div') ?? [])
    .map((element) => element.textContent ?? '')
    .find((text) => normalizeText(text).startsWith('geracao '));
  const visibleGeneration = Number(visibleHeaderText?.match(/\d+/)?.[0]);

  return Number.isFinite(visibleGeneration) ? visibleGeneration : getAvailableGenerations()[0];
}

function countGenerationCards(generation: number) {
  return getRoot()?.querySelectorAll(`[data-mobile-horizontal-generation="${generation}"][data-mobile-horizontal-card="true"]`).length ?? 0;
}

function getGenerationButton(generation: number) {
  return getGenerationButtons().find((entry) => entry.generation === generation)?.button ?? null;
}

function escapeHtml(value: string) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      #${OVERLAY_ID} {
        position: fixed !important;
        inset: 0 !important;
        z-index: 13080 !important;
        display: flex !important;
        flex-direction: column !important;
        background: rgba(248, 250, 252, 0.97) !important;
        backdrop-filter: blur(8px) !important;
        padding: calc(env(safe-area-inset-top, 0px) + 0.75rem) 0.75rem calc(env(safe-area-inset-bottom, 0px) + 5.5rem) !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-header {
        box-sizing: border-box !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.75rem !important;
        width: min(100%, 28rem) !important;
        margin: 0 auto 0.75rem !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 1.35rem !important;
        background: rgba(255, 255, 255, 0.98) !important;
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12) !important;
        padding: 0.8rem !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-title-wrap {
        min-width: 0 !important;
        flex: 1 1 auto !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-title {
        margin: 0 !important;
        color: rgb(15, 23, 42) !important;
        font-size: 1.16rem !important;
        font-weight: 900 !important;
        line-height: 1.08 !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-subtitle {
        margin: 0.18rem 0 0 !important;
        color: rgb(71, 85, 105) !important;
        font-size: 0.74rem !important;
        font-weight: 700 !important;
        line-height: 1.22 !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-close {
        appearance: none !important;
        display: inline-flex !important;
        width: 2.55rem !important;
        height: 2.55rem !important;
        flex: 0 0 auto !important;
        align-items: center !important;
        justify-content: center !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 999px !important;
        background: #fff !important;
        color: rgb(15, 23, 42) !important;
        font-size: 1.25rem !important;
        font-weight: 900 !important;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1) !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-list {
        box-sizing: border-box !important;
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 0.65rem !important;
        width: min(100%, 28rem) !important;
        margin: 0 auto !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
        overscroll-behavior: contain !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 1.5rem !important;
        background: rgba(255, 255, 255, 0.96) !important;
        box-shadow: 0 18px 44px rgba(15, 23, 42, 0.12) !important;
        padding: 0.85rem !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-tile {
        appearance: none !important;
        box-sizing: border-box !important;
        display: grid !important;
        grid-template-columns: auto 1fr auto !important;
        align-items: center !important;
        gap: 0.75rem !important;
        width: 100% !important;
        min-height: 4.75rem !important;
        border: 1px solid rgb(203, 213, 225) !important;
        border-radius: 1.15rem !important;
        background: rgba(255,255,255,0.98) !important;
        color: rgb(15, 23, 42) !important;
        padding: 0.75rem !important;
        text-align: left !important;
        box-shadow: 0 9px 22px rgba(15, 23, 42, 0.08) !important;
        touch-action: manipulation !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-tile[aria-current="page"] {
        border-color: rgb(8, 145, 178) !important;
        box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.16), 0 12px 28px rgba(15, 23, 42, 0.1) !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-index {
        display: inline-flex !important;
        width: 2.5rem !important;
        height: 2.5rem !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 999px !important;
        background: rgb(15, 118, 110) !important;
        color: #fff !important;
        font-size: 0.9rem !important;
        font-weight: 900 !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-generation {
        display: block !important;
        color: rgb(15, 23, 42) !important;
        font-size: 0.92rem !important;
        font-weight: 950 !important;
        letter-spacing: 0.04em !important;
        line-height: 1.05 !important;
        text-transform: uppercase !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-label {
        display: block !important;
        margin-top: 0.18rem !important;
        color: rgb(71, 85, 105) !important;
        font-size: 0.76rem !important;
        font-weight: 800 !important;
      }

      #${OVERLAY_ID} .mobile-horizontal-overview-count {
        color: rgb(71, 85, 105) !important;
        font-size: 0.72rem !important;
        font-weight: 800 !important;
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

function setZoomButtonActive(active: boolean) {
  document.querySelectorAll<HTMLButtonElement>(TOOLBAR_ZOOM_SELECTOR).forEach((button) => {
    if (active) {
      button.setAttribute('aria-pressed', 'true');
      button.setAttribute('data-mobile-family-horizontal-overview-active', 'true');
    } else {
      button.removeAttribute('aria-pressed');
      button.removeAttribute('data-mobile-family-horizontal-overview-active');
    }
  });
}

function closeOverview() {
  document.getElementById(OVERLAY_ID)?.remove();
  setZoomButtonActive(false);
}

function navigateToGeneration(generation: number) {
  closeOverview();
  const button = getGenerationButton(generation);
  button?.click();
  [80, 220, 420].forEach((delay) => window.setTimeout(() => getGenerationButton(generation)?.click(), delay));
}

function buildGenerationTile(generation: number, activeGeneration?: number) {
  const count = countGenerationCards(generation);
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'mobile-horizontal-overview-tile';
  tile.dataset.generation = String(generation);
  if (generation === activeGeneration) tile.setAttribute('aria-current', 'page');
  tile.setAttribute('aria-label', `Abrir geração ${generation}: ${GENERATION_LABELS[generation] ?? 'Geração'}`);
  tile.innerHTML = `
    <span class="mobile-horizontal-overview-index">${generation}</span>
    <span>
      <span class="mobile-horizontal-overview-generation">Geração ${generation}</span>
      <span class="mobile-horizontal-overview-label">${escapeHtml(GENERATION_LABELS[generation] ?? 'Geração')}</span>
    </span>
    <span class="mobile-horizontal-overview-count">${count} pessoa${count === 1 ? '' : 's'}</span>
  `;
  return tile;
}

function openOverview() {
  if (!isEnabled() || !getRoot()) return;
  ensureStyles();
  closeOverview();

  const generations = getAvailableGenerations();
  const activeGeneration = getActiveGeneration();
  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Visão geral das gerações');
  overlay.setAttribute('data-tree-export-ignore', 'true');
  overlay.innerHTML = `
    <header class="mobile-horizontal-overview-header">
      <div class="mobile-horizontal-overview-title-wrap">
        <h2 class="mobile-horizontal-overview-title">Visão por gerações</h2>
        <p class="mobile-horizontal-overview-subtitle">Toque em uma geração para navegar no mapa horizontal.</p>
      </div>
      <button type="button" class="mobile-horizontal-overview-close" aria-label="Fechar visão por gerações">×</button>
    </header>
    <div class="mobile-horizontal-overview-list" aria-label="Gerações disponíveis"></div>
  `;

  const list = overlay.querySelector<HTMLElement>('.mobile-horizontal-overview-list');
  if (list) {
    generations.forEach((generation) => list.appendChild(buildGenerationTile(generation, activeGeneration)));
  }

  document.body.appendChild(overlay);
  setZoomButtonActive(true);
}

function toggleOverview() {
  if (document.getElementById(OVERLAY_ID)) closeOverview();
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
  if (now - lastActivation < 650) return;
  lastActivation = now;
  toggleOverview();
}

function handleOverlayActivation(event: Event) {
  if (!isEnabled()) return;
  const overlay = document.getElementById(OVERLAY_ID);
  const target = event.target instanceof Element ? event.target : null;
  if (!overlay || !target || !overlay.contains(target)) return;

  consumeEvent(event);
  const now = Date.now();
  if (now - lastOverlayAction < 250) return;
  lastOverlayAction = now;

  const closeButton = target.closest<HTMLButtonElement>('.mobile-horizontal-overview-close');
  if (closeButton) {
    closeOverview();
    return;
  }

  const tile = target.closest<HTMLElement>('.mobile-horizontal-overview-tile[data-generation]');
  const generation = Number(tile?.dataset.generation);
  if (!Number.isFinite(generation)) return;
  navigateToGeneration(generation);
}

function handleRouteChange() {
  if (!isEnabled()) closeOverview();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  window.addEventListener('pointerup', handleZoomActivation, { capture: true });
  window.addEventListener('touchend', handleZoomActivation, { capture: true, passive: false });
  window.addEventListener('click', handleZoomActivation, { capture: true });

  window.addEventListener('pointerup', handleOverlayActivation, { capture: true });
  window.addEventListener('touchend', handleOverlayActivation, { capture: true, passive: false });
  window.addEventListener('click', handleOverlayActivation, { capture: true });

  window.addEventListener('resize', handleRouteChange, { passive: true });
  window.addEventListener('orientationchange', handleRouteChange, { passive: true });
  window.addEventListener('popstate', handleRouteChange, { passive: true });
  document.addEventListener('visibilitychange', handleRouteChange, { passive: true });
}

export {};
