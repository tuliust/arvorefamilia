const STYLE_ID = 'desktop-sidebar-filter-button-state-fix-style';
const HORIZONTAL_FAMILY_MAP_PATH = '/mapa-familiar-horizontal';

let syncFrame: number | null = null;

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getCurrentPath() {
  return window.location.pathname.replace(/\/$/, '');
}

function isSpouseScopeButton(button: HTMLButtonElement) {
  const label = normalizeText(button.textContent);
  const ariaLabel = normalizeText(button.getAttribute('aria-label'));

  return label.includes('conjuges de tios')
    || label.includes('conjuges de primos')
    || label.includes('todos os conjuges')
    || ariaLabel.includes('conjuges de tios')
    || ariaLabel.includes('conjuges de primos')
    || ariaLabel.includes('todos os conjuges');
}

function isFamilyScopeButton(button: HTMLButtonElement) {
  const label = normalizeText(button.textContent);
  const ariaLabel = normalizeText(button.getAttribute('aria-label'));

  return label.includes('apenas meus familiares')
    || label.includes('todas as pessoas')
    || ariaLabel.includes('apenas meus familiares')
    || ariaLabel.includes('todas as pessoas');
}

function setButtonText(button: HTMLButtonElement, value: string) {
  const label = button.querySelector('span');
  if (!label || label.textContent?.trim() === value) return;
  label.textContent = value;
}

function applySpouseButtonState(button: HTMLButtonElement) {
  const active = button.getAttribute('aria-pressed') === 'true'
    || button.dataset.active === 'true';

  button.dataset.sidebarFilterOption = 'extended-spouses';
  button.dataset.sidebarFilterVisualActive = active ? 'true' : 'false';
  setButtonText(button, 'Exibir todos os cônjuges');
  button.setAttribute('aria-label', 'Exibir todos os cônjuges');
  button.setAttribute('title', 'Exibir todos os cônjuges');
}

function applyFamilyScopeButtonState(button: HTMLButtonElement) {
  const isHorizontalMap = getCurrentPath() === HORIZONTAL_FAMILY_MAP_PATH;

  button.dataset.sidebarFilterOption = 'family-scope';
  setButtonText(button, 'Exibir apenas meus familiares');
  button.setAttribute('aria-label', 'Exibir apenas meus familiares');
  button.setAttribute('title', isHorizontalMap ? 'Exibir apenas meus familiares' : 'Disponível na Linha Geracional');

  if (!isHorizontalMap || button.disabled) {
    button.dataset.sidebarFilterVisualActive = 'false';
    return;
  }

  const directFamilyOnly = button.getAttribute('aria-pressed') === 'true'
    || button.dataset.active === 'true';

  button.dataset.sidebarFilterVisualActive = directFamilyOnly ? 'true' : 'false';
}

function applyButtonStates() {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.desktop-tree-final-filter-button')
  );

  buttons.forEach((button) => {
    if (isSpouseScopeButton(button)) {
      applySpouseButtonState(button);
      return;
    }

    if (isFamilyScopeButton(button)) {
      applyFamilyScopeButtonState(button);
    }
  });
}

function scheduleButtonStateSync() {
  if (syncFrame !== null) return;

  syncFrame = window.requestAnimationFrame(() => {
    syncFrame = null;
    applyButtonStates();
  });
}

function ensureStyles() {
  const css = `
    .desktop-tree-final-filter-button[data-sidebar-filter-option] {
      opacity: 1 !important;
      filter: none !important;
    }

    .desktop-tree-final-filter-button[data-sidebar-filter-visual-active='true'] {
      border-color: #2563eb !important;
      background: linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%) !important;
      color: #1d4ed8 !important;
      box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.58), 0 8px 18px rgba(37, 99, 235, 0.10) !important;
    }

    .desktop-tree-final-filter-button[data-sidebar-filter-visual-active='true'] > svg {
      color: #1d4ed8 !important;
    }

    .desktop-tree-final-filter-button[data-sidebar-filter-visual-active='true'] span {
      color: #0f2348 !important;
    }

    .desktop-tree-final-filter-button[data-sidebar-filter-visual-active='false'] {
      border-color: #d7e1ef !important;
      background: #f8fbff !important;
      color: #94a3b8 !important;
      box-shadow: none !important;
    }

    .desktop-tree-final-filter-button[data-sidebar-filter-visual-active='false'] > svg {
      color: #94a3b8 !important;
    }

    .desktop-tree-final-filter-button[data-sidebar-filter-visual-active='false'] span {
      color: #64748b !important;
    }

    .desktop-tree-final-filter-button[data-sidebar-filter-visual-active='false']:disabled {
      cursor: not-allowed !important;
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
  scheduleButtonStateSync();

  const observerTarget = document.body ?? document.documentElement;
  const observer = new MutationObserver(scheduleButtonStateSync);

  observer.observe(observerTarget, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-pressed', 'data-active', 'disabled'],
  });

  window.addEventListener('resize', scheduleButtonStateSync, { passive: true });
  window.addEventListener('orientationchange', scheduleButtonStateSync, { passive: true });
  window.addEventListener('popstate', scheduleButtonStateSync, { passive: true });
  window.addEventListener('arvorefamilia:mobile-spouse-filter-changed', scheduleButtonStateSync);

  [80, 240, 560, 1200].forEach((delay) => window.setTimeout(scheduleButtonStateSync, delay));
}

export {};
