const MOBILE_QUERY = '(max-width: 767px)';
const STYLE_ID = 'mobile-map-toolbar-requested-behavior-fix-style';
const DESCENDANTS_STEADY_ATTR = 'data-af-mobile-descendants-steady';
const DIRECT_MAP_PATH = '/mapa-familiar';
const GENERATION_LINE_PATH = '/linha-geracional';
const DESCENDANTS_TRANSFORM = 'translate3d(calc(-33.333333333333336% + 0px), calc(-66.66666666666667% + 0px), 0)';

let syncFrame: number | null = null;
let descendantsSteadyUntil = 0;
let pendingProfileReturnPath: string | null = null;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function getPathname() {
  return window.location.pathname.replace(/\/$/, '');
}

function isMobileTreeRoute() {
  const pathname = getPathname();
  return isMobileViewport() && (pathname === DIRECT_MAP_PATH || pathname === GENERATION_LINE_PATH);
}

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getFamilyMapRoot() {
  return document.querySelector<HTMLElement>('[data-mobile-family-tree-root="true"]');
}

function getFamilyMapStage(root = getFamilyMapRoot()) {
  return root?.querySelector<HTMLElement>('[data-mobile-family-tree-stage="true"]') ?? null;
}

function getFullControlsDialog() {
  return document.querySelector<HTMLElement>('[role="dialog"][aria-label="Painel de visualização"]');
}

function isDescendantsTransform(value: string) {
  return value.includes('-33.333333333333336%') && value.includes('-66.66666666666667%');
}

function isDescendantsScreenActive() {
  if (getPathname() !== DIRECT_MAP_PATH || !isMobileViewport()) return false;

  const root = getFamilyMapRoot();
  const stage = getFamilyMapStage(root);

  return root?.getAttribute('data-mobile-family-tree-active-screen') === 'descendants'
    || root?.getAttribute('data-mobile-family-descendants-transform-lock') === 'true'
    || isDescendantsTransform(stage?.style.transform ?? '');
}

function syncDescendantsSteadyState() {
  if (isDescendantsScreenActive()) {
    descendantsSteadyUntil = Date.now() + 650;
    document.documentElement.setAttribute(DESCENDANTS_STEADY_ATTR, 'true');
    return;
  }

  if (Date.now() < descendantsSteadyUntil) {
    document.documentElement.setAttribute(DESCENDANTS_STEADY_ATTR, 'true');
    return;
  }

  document.documentElement.removeAttribute(DESCENDANTS_STEADY_ATTR);
}

function closeActiveColorTray() {
  document
    .querySelector<HTMLButtonElement>(
      'nav[data-mobile-family-map-toolbar="true"] button[aria-pressed="true"][data-mobile-family-map-toolbar-action="cor"]'
    )
    ?.click();
}

function setFirstLabel(button: HTMLButtonElement, label: string) {
  const span = button.querySelector<HTMLSpanElement>('span');
  if (span && span.textContent?.trim() !== label) span.textContent = label;
}

function syncMobileFilterLabels() {
  if (!isMobileTreeRoute()) return;

  document.querySelectorAll<HTMLButtonElement>('[data-mobile-family-map-context-action="grupos"] button, [role="dialog"][aria-label="Painel de visualização"] [data-mobile-family-filter-panel-toggle="true"]').forEach((button) => {
    const text = normalizeText(button.textContent);
    const active = button.getAttribute('aria-pressed') === 'true';

    if (text.includes('conjuge')) {
      setFirstLabel(button, 'Exibir todos os cônjuges');
      button.setAttribute('aria-label', 'Exibir todos os cônjuges');
      button.dataset.mobileFilterActive = active ? 'true' : 'false';
      return;
    }

    if (text.includes('familiares')) {
      setFirstLabel(button, 'Exibir apenas meus familiares');
      button.setAttribute('aria-label', 'Exibir apenas meus familiares');
      button.dataset.mobileFilterActive = active ? 'true' : 'false';
    }
  });
}

function syncCurrentFormatCardState() {
  if (!isMobileTreeRoute()) return;

  const tray = document.querySelector<HTMLElement>('[data-mobile-family-map-context-action="formato"]');
  if (!tray) return;

  tray.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    const isCurrent = button.getAttribute('aria-pressed') === 'true';

    if (isCurrent) {
      button.dataset.mobileFormatCurrent = 'true';
      button.setAttribute('aria-current', 'page');
      button.setAttribute('aria-disabled', 'true');
      button.setAttribute('disabled', '');
      return;
    }

    button.removeAttribute('data-mobile-format-current');
    button.removeAttribute('aria-current');
    button.removeAttribute('aria-disabled');
    button.removeAttribute('disabled');
  });
}

function looksLikeFullPanelPersonButton(button: HTMLButtonElement) {
  const dialog = getFullControlsDialog();
  if (!dialog || !dialog.contains(button)) return false;

  const text = normalizeText(button.textContent);
  if (!text || text.includes('exibir') || text.includes('geracao') || text.includes('arvore')) return false;

  const className = String(button.className);
  return className.includes('text-sm')
    && className.includes('font-bold')
    && className.includes('text-blue-950')
    && !button.querySelector('svg');
}

function redirectPendingProfileNavigation() {
  const returnPath = pendingProfileReturnPath;
  pendingProfileReturnPath = null;
  if (!returnPath || !isMobileTreeRoute()) return;

  const personId = new URLSearchParams(window.location.search).get('pessoa');
  if (!personId) return;

  window.location.href = `/pessoa/${encodeURIComponent(personId)}?voltar=${encodeURIComponent(returnPath)}`;
}

function handleDocumentClick(event: MouseEvent) {
  if (!isMobileTreeRoute()) return;

  const target = event.target;
  if (!(target instanceof Element)) return;

  const personButton = target.closest<HTMLButtonElement>('button');
  if (personButton && looksLikeFullPanelPersonButton(personButton)) {
    pendingProfileReturnPath = `${window.location.pathname}${window.location.search}`;
    window.setTimeout(redirectPendingProfileNavigation, 80);
    window.setTimeout(redirectPendingProfileNavigation, 180);
    return;
  }

  const colorButton = target.closest<HTMLButtonElement>('[data-mobile-family-map-context-action="cor"] button');
  if (!colorButton) return;

  window.setTimeout(closeActiveColorTray, 0);
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      html[${DESCENDANTS_STEADY_ATTR}="true"] [data-mobile-family-tree-root="true"] [data-mobile-family-tree-stage="true"] {
        transform: ${DESCENDANTS_TRANSFORM} !important;
        transition: none !important;
        animation: none !important;
        will-change: auto !important;
      }

      html[${DESCENDANTS_STEADY_ATTR}="true"] [data-mobile-family-tree-screen="descendants"] {
        contain: layout paint style !important;
        backface-visibility: hidden !important;
        -webkit-backface-visibility: hidden !important;
        transform: translateZ(0) !important;
      }

      html[${DESCENDANTS_STEADY_ATTR}="true"] .mobile-family-descendant-screen__scroll,
      html[${DESCENDANTS_STEADY_ATTR}="true"] [data-stable-mobile-scroll="descendants"],
      html[${DESCENDANTS_STEADY_ATTR}="true"] [data-mobile-family-tree-screen="descendants"] [data-mobile-tree-scroll] {
        overscroll-behavior: contain !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
      }

      [data-mobile-generation-map-compact-tray="true"] > div.grid {
        display: grid !important;
        grid-template-columns: repeat(6, minmax(4.95rem, 1fr)) !important;
        grid-auto-flow: column !important;
        grid-auto-columns: minmax(4.95rem, 1fr) !important;
        gap: 0.375rem !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        overscroll-behavior-x: contain !important;
        -webkit-overflow-scrolling: touch !important;
        scrollbar-width: none !important;
        padding-bottom: 0.125rem !important;
      }

      [data-mobile-generation-map-compact-tray="true"] > div.grid::-webkit-scrollbar {
        display: none !important;
      }

      [data-mobile-generation-map-compact-tray="true"] > div.grid > button {
        min-width: 4.95rem !important;
        min-height: 5.8rem !important;
        gap: 0.42rem !important;
        padding: 0.65rem 0.35rem !important;
      }

      [data-mobile-generation-map-compact-tray="true"] > div.grid > button > span:first-child {
        font-size: 0.56rem !important;
        letter-spacing: -0.02em !important;
      }

      [data-mobile-family-map-context-action="formato"] button[data-mobile-format-current="true"],
      [data-mobile-family-map-context-action="formato"] button[aria-current="page"] {
        border-color: #e2e8f0 !important;
        background: #f8fafc !important;
        color: #64748b !important;
        box-shadow: none !important;
        opacity: 0.76 !important;
        cursor: default !important;
        pointer-events: none !important;
      }

      [data-mobile-family-map-context-action="formato"] button[data-mobile-format-current="true"] svg,
      [data-mobile-family-map-context-action="formato"] button[aria-current="page"] svg {
        color: #94a3b8 !important;
        stroke: #94a3b8 !important;
      }

      [data-mobile-family-map-context-action="formato"] button[data-mobile-format-current="true"] span,
      [data-mobile-family-map-context-action="formato"] button[aria-current="page"] span {
        color: #64748b !important;
      }

      [data-mobile-filter-active="true"] {
        border-color: #2563eb !important;
        background: #eff6ff !important;
        color: #172554 !important;
        box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.52) !important;
        opacity: 1 !important;
      }

      [data-mobile-filter-active="true"] svg {
        color: #2563eb !important;
      }

      [data-mobile-filter-active="false"] {
        border-color: #e2e8f0 !important;
        background: #ffffff !important;
        color: #64748b !important;
        box-shadow: none !important;
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

function syncRequestedBehaviorFixes() {
  ensureStyles();
  syncDescendantsSteadyState();
  syncCurrentFormatCardState();
  syncMobileFilterLabels();
}

function scheduleSync() {
  if (syncFrame !== null) return;

  syncFrame = window.requestAnimationFrame(() => {
    syncFrame = null;
    syncRequestedBehaviorFixes();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  syncRequestedBehaviorFixes();

  document.addEventListener('click', handleDocumentClick, false);
  window.addEventListener('resize', scheduleSync, { passive: true });
  window.addEventListener('orientationchange', scheduleSync, { passive: true });
  window.addEventListener('popstate', scheduleSync, { passive: true });
  window.addEventListener('touchend', scheduleSync, { passive: true });
  window.addEventListener('touchcancel', scheduleSync, { passive: true });

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.body ?? document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      'aria-pressed',
      'aria-current',
      'class',
      'data-mobile-family-tree-active-screen',
      'data-mobile-family-descendants-transform-lock',
      'style',
    ],
  });

  [80, 220, 520, 1100].forEach((delay) => window.setTimeout(scheduleSync, delay));
}

export {};
