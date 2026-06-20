const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATHS = new Set(['/mapa-familiar', '/mapa-familiar-horizontal']);
const PANEL_ID = 'mobile-family-toolbar-actions-fix-panel';
const STYLE_ID = 'mobile-family-toolbar-actions-fix-style';
const TOOLBAR_ACTION_SELECTOR = '[data-mobile-family-map-toolbar-action]';

type ToolbarAction = 'formato' | 'cor' | 'grupos' | 'zoom';

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && FAMILY_MAP_PATHS.has(window.location.pathname);
}

function isEnabled() {
  return isMobileViewport() && isFamilyMapPath();
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      #${PANEL_ID} {
        position: fixed !important;
        left: 0.75rem !important;
        right: 0.75rem !important;
        top: calc(env(safe-area-inset-top, 0px) + 8.75rem) !important;
        z-index: 2147483000 !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        border: 1px solid rgb(226, 232, 240) !important;
        border-radius: 1rem !important;
        background: rgba(255, 255, 255, 0.98) !important;
        box-shadow: 0 18px 48px rgba(15, 23, 42, 0.20) !important;
        padding: 0.5rem !important;
      }

      #${PANEL_ID} * {
        pointer-events: auto !important;
        touch-action: manipulation !important;
      }

      #${PANEL_ID} .mobile-family-toolbar-actions-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 0.5rem !important;
      }

      #${PANEL_ID} button {
        min-height: 2.75rem !important;
        border: 1px solid rgb(203, 213, 225) !important;
        border-radius: 0.85rem !important;
        background: white !important;
        color: rgb(15, 23, 42) !important;
        font-size: 0.78rem !important;
        font-weight: 800 !important;
        line-height: 1.1 !important;
        padding: 0.55rem 0.6rem !important;
        text-align: center !important;
      }

      #${PANEL_ID} button:active {
        transform: scale(0.98) !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function closePanel() {
  document.getElementById(PANEL_ID)?.remove();
  document.querySelectorAll<HTMLElement>(TOOLBAR_ACTION_SELECTOR).forEach((button) => {
    button.removeAttribute('data-toolbar-actions-fix-active');
    button.style.removeProperty('background');
    button.style.removeProperty('color');
  });
}

function markActive(action: ToolbarAction) {
  document.querySelectorAll<HTMLElement>(TOOLBAR_ACTION_SELECTOR).forEach((button) => {
    const isActive = button.getAttribute('data-mobile-family-map-toolbar-action') === action;
    button.toggleAttribute('data-toolbar-actions-fix-active', isActive);
    if (isActive) {
      button.style.setProperty('background', '#0E7490', 'important');
      button.style.setProperty('color', '#FFFFFF', 'important');
    } else {
      button.style.removeProperty('background');
      button.style.removeProperty('color');
    }
  });
}

function navigateTo(path: string) {
  const query = window.location.search || '';
  window.location.assign(`${path}${query}`);
}

function setPalette(value: string) {
  window.localStorage.setItem('arvorefamilia.treeColorPalette', value);
  document.documentElement.dataset.treeColorPalette = value;
  window.location.reload();
}

function setSpouseScope(value: 'extended' | 'direct') {
  document.documentElement.dataset.mobileFamilySpouseScope = value;
  closePanel();
}

function buildButton(label: string, onClick: () => void) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });
  return button;
}

function renderPanel(action: ToolbarAction) {
  ensureStyles();

  const existingPanel = document.getElementById(PANEL_ID);
  const wasSameAction = existingPanel?.getAttribute('data-toolbar-action') === action;
  closePanel();
  if (wasSameAction) return;

  markActive(action);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.setAttribute('data-toolbar-action', action);
  panel.setAttribute('data-tree-export-ignore', 'true');

  const grid = document.createElement('div');
  grid.className = 'mobile-family-toolbar-actions-grid';

  if (action === 'formato') {
    grid.appendChild(buildButton('Linha Geracional', () => navigateTo('/mapa-familiar')));
    grid.appendChild(buildButton('Árvore Familiar', () => navigateTo('/mapa-familiar-horizontal')));
  }

  if (action === 'cor') {
    grid.appendChild(buildButton('Padrão', () => setPalette('white')));
    grid.appendChild(buildButton('Visual', () => setPalette('visual')));
    grid.appendChild(buildButton('Laranja', () => setPalette('orange')));
    grid.appendChild(buildButton('Marrom', () => setPalette('brown')));
  }

  if (action === 'grupos') {
    grid.appendChild(buildButton('Exibir cônjuges', () => setSpouseScope('extended')));
    grid.appendChild(buildButton('Apenas familiares', () => setSpouseScope('direct')));
  }

  if (action === 'zoom') {
    grid.appendChild(buildButton('Fechar', closePanel));
    grid.appendChild(buildButton('Restaurar visão', () => {
      window.dispatchEvent(new CustomEvent('arvorefamilia:tree-action', { detail: 'restore-view' }));
      closePanel();
    }));
  }

  panel.appendChild(grid);
  document.body.appendChild(panel);
}

function getToolbarAction(target: EventTarget | null): ToolbarAction | null {
  if (!(target instanceof Element)) return null;
  const button = target.closest<HTMLElement>(TOOLBAR_ACTION_SELECTOR);
  const action = button?.getAttribute('data-mobile-family-map-toolbar-action');
  if (action === 'formato' || action === 'cor' || action === 'grupos' || action === 'zoom') return action;
  return null;
}

function handleToolbarClick(event: Event) {
  if (!isEnabled()) return;

  const action = getToolbarAction(event.target);
  if (!action) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  renderPanel(action);
}

function handleOutsideClick(event: Event) {
  const panel = document.getElementById(PANEL_ID);
  if (!panel || !(event.target instanceof Element)) return;
  if (panel.contains(event.target)) return;
  if (event.target.closest(TOOLBAR_ACTION_SELECTOR)) return;
  closePanel();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  document.addEventListener('click', handleToolbarClick, { capture: true });
  document.addEventListener('click', handleOutsideClick, { capture: false });
}

export {};