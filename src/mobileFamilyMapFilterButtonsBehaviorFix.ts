const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATHS = new Set(['/mapa-familiar', '/mapa-familiar-horizontal', '/linha-geracional']);
const GENERATION_LINE_PATH = '/linha-geracional';
const STORAGE_KEY = 'arvorefamilia:mobile-family-map:show-extended-spouses';
const STYLE_ID = 'mobile-family-map-filter-buttons-behavior-fix-style';

let stateSyncFrame: number | null = null;
let buttonStateFrame: number | null = null;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function getCurrentPath() {
  return window.location.pathname.replace(/\/$/, '');
}

function isFamilyMapMobile() {
  return isMobileViewport() && FAMILY_MAP_PATHS.has(getCurrentPath());
}

function isGenerationLineMobile() {
  return isMobileViewport() && getCurrentPath() === GENERATION_LINE_PATH;
}

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function readExtendedSpouseState() {
  if (isGenerationLineMobile()) return true;

  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeExtendedSpouseState(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // noop
  }
}

function writeSpouseScopeDataset(value: boolean) {
  const nextScope = value ? 'extended' : 'direct';

  if (document.documentElement.dataset.mobileFamilySpouseScope !== nextScope) {
    document.documentElement.dataset.mobileFamilySpouseScope = nextScope;
  }
}

function scheduleButtonStateSync() {
  if (!isFamilyMapMobile()) return;
  if (buttonStateFrame !== null) return;

  buttonStateFrame = window.requestAnimationFrame(() => {
    buttonStateFrame = null;
    applyButtonState();
  });
}

function syncStoredSpouseState() {
  if (!isFamilyMapMobile()) return;

  const forcedGenerationLineState = isGenerationLineMobile();
  const showExtended = forcedGenerationLineState ? true : readExtendedSpouseState();

  if (forcedGenerationLineState) writeExtendedSpouseState(true);
  writeSpouseScopeDataset(showExtended);
  scheduleButtonStateSync();
}

function scheduleStoredSpouseStateSync() {
  if (!isFamilyMapMobile()) return;
  if (stateSyncFrame !== null) return;

  stateSyncFrame = window.requestAnimationFrame(() => {
    stateSyncFrame = null;
    syncStoredSpouseState();
  });
}

function setExtendedSpouseState(value: boolean) {
  const nextValue = isGenerationLineMobile() ? true : value;

  writeExtendedSpouseState(nextValue);
  writeSpouseScopeDataset(nextValue);
  scheduleButtonStateSync();

  window.dispatchEvent(new CustomEvent('arvorefamilia:mobile-spouse-filter-changed', {
    detail: { showExtended: nextValue },
  }));
}

function isExtendedButton(button: HTMLElement) {
  const label = normalizeText(button.textContent);
  const ariaLabel = normalizeText(button.getAttribute('aria-label'));
  return label.includes('exibir conjuges') || label.includes('ocultar conjuges') || ariaLabel.includes('exibir conjuges') || ariaLabel.includes('ocultar conjuges');
}

function isFamilyOnlyButton(button: HTMLElement) {
  const label = normalizeText(button.textContent);
  const ariaLabel = normalizeText(button.getAttribute('aria-label'));
  return label.includes('apenas meus familiares') || ariaLabel.includes('apenas meus familiares');
}

function getFilterButtons() {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>('button'));
  return {
    extendedButtons: buttons.filter(isExtendedButton),
    familyOnlyButtons: buttons.filter(isFamilyOnlyButton),
  };
}

function applyButtonState() {
  if (!isFamilyMapMobile()) return;

  const showExtended = isGenerationLineMobile()
    ? true
    : document.documentElement.dataset.mobileFamilySpouseScope === 'extended';
  const { extendedButtons, familyOnlyButtons } = getFilterButtons();

  extendedButtons.forEach((button) => {
    button.dataset.mobileFamilyFilterOption = 'extended-spouses';
    button.dataset.mobileFamilyFilterActive = String(showExtended);
    button.setAttribute('aria-pressed', String(showExtended));

    if (isGenerationLineMobile()) {
      button.setAttribute('aria-disabled', 'true');
      button.setAttribute('disabled', '');
    } else {
      button.removeAttribute('aria-disabled');
      button.removeAttribute('disabled');
    }
  });

  familyOnlyButtons.forEach((button) => {
    button.dataset.mobileFamilyFilterOption = 'family-only';
    button.dataset.mobileFamilyFilterActive = 'false';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-disabled', 'true');
  });
}

function handleFilterClick(event: Event) {
  if (!isFamilyMapMobile()) return;

  const target = event.target as HTMLElement | null;
  const button = target?.closest?.('button') as HTMLElement | null;
  if (!button) return;

  if (isFamilyOnlyButton(button)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    setExtendedSpouseState(true);
    return;
  }

  if (isExtendedButton(button)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    setExtendedSpouseState(isGenerationLineMobile() ? true : !readExtendedSpouseState());
  }
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      button[data-mobile-family-filter-option="family-only"] {
        border-color: rgb(226 232 240) !important;
        background: rgb(255 255 255) !important;
        color: rgb(100 116 139) !important;
        box-shadow: 0 1px 2px rgb(15 23 42 / 0.08) !important;
        cursor: default !important;
        opacity: 0.82 !important;
      }

      button[data-mobile-family-filter-option="family-only"] svg {
        color: rgb(148 163 184) !important;
      }

      button[data-mobile-family-filter-option="extended-spouses"] {
        background: rgb(255 255 255) !important;
      }

      button[data-mobile-family-filter-option="extended-spouses"][data-mobile-family-filter-active="true"] {
        border-color: rgb(59 130 246) !important;
        color: rgb(23 37 84) !important;
        box-shadow: 0 1px 2px rgb(15 23 42 / 0.08), 0 0 0 1px rgb(59 130 246) !important;
      }

      button[data-mobile-family-filter-option="extended-spouses"][data-mobile-family-filter-active="true"] svg {
        color: rgb(29 78 216) !important;
      }

      button[data-mobile-family-filter-option="extended-spouses"][data-mobile-family-filter-active="false"] {
        border-color: rgb(226 232 240) !important;
        color: rgb(100 116 139) !important;
        box-shadow: 0 1px 2px rgb(15 23 42 / 0.08) !important;
      }

      button[data-mobile-family-filter-option="extended-spouses"][data-mobile-family-filter-active="false"] svg {
        color: rgb(148 163 184) !important;
      }

      html[data-mobile-family-spouse-scope="extended"] button[data-mobile-family-filter-option="extended-spouses"][disabled] {
        cursor: default !important;
        opacity: 1 !important;
      }

      button[data-mobile-family-filter-panel-toggle="true"] {
        border-color: rgb(226 232 240) !important;
        box-shadow: none !important;
      }

      button[data-mobile-family-filter-panel-toggle="true"][data-mobile-family-filter-active="true"] {
        color: rgb(23 37 84) !important;
        box-shadow: none !important;
      }

      html[data-mobile-family-spouse-scope="direct"] [data-mobile-family-tree-root="true"] [data-family-map-extended-spouse-card="true"],
      html[data-mobile-family-spouse-scope="direct"] [data-family-map-horizontal-mobile-root="true"] [data-mobile-horizontal-card="true"]:has(button[data-family-map-spouse-tone="true"]),
      html[data-mobile-family-spouse-scope="direct"] [data-mobile-family-horizontal-root="true"] [data-mobile-horizontal-card="true"]:has(button[data-family-map-spouse-tone="true"]) {
        display: none !important;
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

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  scheduleStoredSpouseStateSync();

  document.addEventListener('click', handleFilterClick, true);

  const observerTarget = document.body ?? document.documentElement;
  const observer = new MutationObserver(() => {
    scheduleStoredSpouseStateSync();
  });

  observer.observe(observerTarget, {
    childList: true,
    subtree: true,
  });

  window.addEventListener('resize', scheduleStoredSpouseStateSync, { passive: true });
  window.addEventListener('orientationchange', scheduleStoredSpouseStateSync, { passive: true });
  window.addEventListener('popstate', scheduleStoredSpouseStateSync, { passive: true });
  window.addEventListener('arvorefamilia:mobile-spouse-filter-changed', scheduleButtonStateSync);
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      scheduleStoredSpouseStateSync();
    }
  });

  [120, 320, 720, 1400].forEach((delay) => window.setTimeout(scheduleStoredSpouseStateSync, delay));
}

export {};
