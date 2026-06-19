const MOBILE_QUERY = '(max-width: 767px)';
const PANEL_DIALOG_SELECTOR = 'div[role="dialog"][aria-label="Painel de visualização"]';
const PANEL_SECTION_SELECTOR = ':scope > section';
const OVERLAY_CLOSE_SELECTOR = ':scope > button[aria-label="Fechar painel de visualização"]';
const GENERATED_CLOSE_CLASS = 'mobile-tree-panel-viewport-close';

function isMobileViewport() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getVisualViewportRect() {
  const visualViewport = window.visualViewport;

  return {
    left: visualViewport?.offsetLeft ?? 0,
    top: visualViewport?.offsetTop ?? 0,
    width: visualViewport?.width ?? window.innerWidth,
    height: visualViewport?.height ?? window.innerHeight,
  };
}

function getVisibleViewportCenter() {
  const viewport = getVisualViewportRect();

  return {
    x: viewport.left + viewport.width / 2,
    y: viewport.top + viewport.height / 2,
  };
}

function setImportantStyle(element: HTMLElement, property: string, value: string) {
  element.style.setProperty(property, value, 'important');
}

function setImportantStyles(element: HTMLElement, styles: Record<string, string>) {
  Object.entries(styles).forEach(([property, value]) => {
    setImportantStyle(element, property, value);
  });
}

function getCurrentNumericStyle(element: HTMLElement, property: 'left' | 'top') {
  const value = Number.parseFloat(element.style.getPropertyValue(property) || '0');
  return Number.isFinite(value) ? value : 0;
}

function offsetElementStyle(element: HTMLElement, deltaX: number, deltaY: number) {
  if (Math.abs(deltaX) >= 0.5) {
    setImportantStyle(element, 'left', `${getCurrentNumericStyle(element, 'left') + deltaX}px`);
  }

  if (Math.abs(deltaY) >= 0.5) {
    setImportantStyle(element, 'top', `${getCurrentNumericStyle(element, 'top') + deltaY}px`);
  }
}

function pinElementToVisibleViewport(element: HTMLElement, targetLeft: number, targetTop: number) {
  const rect = element.getBoundingClientRect();
  offsetElementStyle(element, targetLeft - rect.left, targetTop - rect.top);
}

function centerElementInVisibleViewport(element: HTMLElement) {
  const { x, y } = getVisibleViewportCenter();
  const rect = element.getBoundingClientRect();

  offsetElementStyle(
    element,
    x - (rect.left + rect.width / 2),
    y - (rect.top + rect.height / 2)
  );
}

function getOrCreateCloseButton(dialog: HTMLElement, overlayClose: HTMLButtonElement | null) {
  let closeButton = dialog.querySelector<HTMLButtonElement>(`.${GENERATED_CLOSE_CLASS}`);

  if (!closeButton) {
    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = GENERATED_CLOSE_CLASS;
    closeButton.setAttribute('aria-label', 'Fechar painel');
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      overlayClose?.click();
    });
    dialog.appendChild(closeButton);
  }

  return closeButton;
}

function centerMobileTreePanel() {
  if (!isMobileViewport()) return;

  const dialog = document.querySelector<HTMLElement>(PANEL_DIALOG_SELECTOR);
  if (!dialog) return;

  const section = dialog.querySelector<HTMLElement>(PANEL_SECTION_SELECTOR);
  const overlayClose = dialog.querySelector<HTMLButtonElement>(OVERLAY_CLOSE_SELECTOR);
  if (!section) return;

  const viewport = getVisualViewportRect();
  const safePadding = 12;
  const panelWidth = Math.min(viewport.width - safePadding * 2, 400);
  const panelMaxHeight = Math.max(320, viewport.height - safePadding * 2);

  // CSS mobile antigo usa !important para o modal. Por isso este patch também aplica
  // estilos inline com prioridade important, evitando que o painel continue preso ao
  // canvas transformado da árvore no iOS/Safari.
  setImportantStyles(dialog, {
    position: 'fixed',
    left: `${viewport.left}px`,
    top: `${viewport.top}px`,
    right: 'auto',
    bottom: 'auto',
    width: `${viewport.width}px`,
    height: `${viewport.height}px`,
    'min-width': `${viewport.width}px`,
    'max-width': `${viewport.width}px`,
    'min-height': `${viewport.height}px`,
    'max-height': `${viewport.height}px`,
    display: 'grid',
    'place-items': 'center',
    overflow: 'hidden',
    transform: 'none',
    'z-index': '12000',
  });

  // Em iOS/Safari, `position: fixed` dentro de elementos transformados pode ser medido
  // relativo ao canvas da árvore. Compensamos pelo retângulo real renderizado.
  pinElementToVisibleViewport(dialog, viewport.left, viewport.top);
  pinElementToVisibleViewport(dialog, viewport.left, viewport.top);

  setImportantStyles(section, {
    position: 'fixed',
    left: `${viewport.left + viewport.width / 2}px`,
    top: `${viewport.top + viewport.height / 2}px`,
    right: 'auto',
    bottom: 'auto',
    width: `${panelWidth}px`,
    'max-width': `${panelWidth}px`,
    'max-height': `${panelMaxHeight}px`,
    margin: '0',
    transform: 'translate3d(-50%, -50%, 0)',
    'z-index': '12002',
  });

  centerElementInVisibleViewport(section);
  centerElementInVisibleViewport(section);
  centerElementInVisibleViewport(section);

  if (overlayClose) {
    setImportantStyles(overlayClose, {
      position: 'fixed',
      left: `${viewport.left}px`,
      top: `${viewport.top}px`,
      right: 'auto',
      bottom: 'auto',
      width: `${viewport.width}px`,
      height: `${viewport.height}px`,
      'z-index': '12001',
    });

    pinElementToVisibleViewport(overlayClose, viewport.left, viewport.top);
    pinElementToVisibleViewport(overlayClose, viewport.left, viewport.top);
  }

  const closeButton = getOrCreateCloseButton(dialog, overlayClose);
  const sectionRect = section.getBoundingClientRect();
  const closeSize = 44;
  const closeTop = Math.max(viewport.top + 16, sectionRect.top + 18);
  const closeLeft = Math.min(
    viewport.left + viewport.width - closeSize - 18,
    sectionRect.right - closeSize - 18
  );

  setImportantStyles(closeButton, {
    position: 'fixed',
    left: `${Math.max(viewport.left + 18, closeLeft)}px`,
    top: `${closeTop}px`,
    'z-index': '12005',
    display: 'flex',
    width: `${closeSize}px`,
    height: `${closeSize}px`,
    'align-items': 'center',
    'justify-content': 'center',
    border: '1px solid rgb(226, 232, 240)',
    'border-radius': '9999px',
    background: 'rgb(255, 255, 255)',
    'box-shadow': '0 10px 24px rgba(15, 23, 42, 0.18)',
    color: 'rgb(15, 23, 42)',
    'font-size': '1.1rem',
    'font-weight': '800',
    'line-height': '1',
  });
}

function scheduleCentering() {
  window.requestAnimationFrame(() => {
    centerMobileTreePanel();
    window.requestAnimationFrame(centerMobileTreePanel);
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const observer = new MutationObserver(scheduleCentering);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener('resize', scheduleCentering, { passive: true });
  window.addEventListener('orientationchange', scheduleCentering, { passive: true });
  window.visualViewport?.addEventListener('resize', scheduleCentering, { passive: true });
  window.visualViewport?.addEventListener('scroll', scheduleCentering, { passive: true });
  document.addEventListener('scroll', scheduleCentering, { passive: true, capture: true });

  scheduleCentering();
}

export {};
