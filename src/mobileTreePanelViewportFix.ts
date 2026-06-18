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

function getCurrentNumericStyle(element: HTMLElement, property: 'left' | 'top') {
  const value = Number.parseFloat(element.style[property] || '0');
  return Number.isFinite(value) ? value : 0;
}

function offsetElementStyle(element: HTMLElement, deltaX: number, deltaY: number) {
  if (Math.abs(deltaX) >= 0.5) {
    element.style.left = `${getCurrentNumericStyle(element, 'left') + deltaX}px`;
  }

  if (Math.abs(deltaY) >= 0.5) {
    element.style.top = `${getCurrentNumericStyle(element, 'top') + deltaY}px`;
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

  Object.assign(dialog.style, {
    position: 'fixed',
    left: `${viewport.left}px`,
    top: `${viewport.top}px`,
    right: 'auto',
    bottom: 'auto',
    width: `${viewport.width}px`,
    height: `${viewport.height}px`,
    minWidth: `${viewport.width}px`,
    maxWidth: `${viewport.width}px`,
    minHeight: `${viewport.height}px`,
    maxHeight: `${viewport.height}px`,
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    transform: 'none',
  });

  // Em iOS/Safari, o mapa cria overflow horizontal. Quando o usuário arrasta a árvore,
  // elementos `fixed` dentro de ancestrais transformados podem ficar presos ao canvas em
  // vez da viewport visível. A correção abaixo mede o retângulo real e compensa o desvio.
  pinElementToVisibleViewport(dialog, viewport.left, viewport.top);

  Object.assign(section.style, {
    position: 'fixed',
    left: `${viewport.left + viewport.width / 2}px`,
    top: `${viewport.top + viewport.height / 2}px`,
    right: 'auto',
    bottom: 'auto',
    width: `${panelWidth}px`,
    maxWidth: `${panelWidth}px`,
    maxHeight: `${panelMaxHeight}px`,
    margin: '0',
    transform: 'translate3d(-50%, -50%, 0)',
  });

  centerElementInVisibleViewport(section);
  centerElementInVisibleViewport(section);

  if (overlayClose) {
    Object.assign(overlayClose.style, {
      position: 'fixed',
      left: `${viewport.left}px`,
      top: `${viewport.top}px`,
      right: 'auto',
      bottom: 'auto',
      width: `${viewport.width}px`,
      height: `${viewport.height}px`,
    });

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

  Object.assign(closeButton.style, {
    position: 'fixed',
    left: `${Math.max(viewport.left + 18, closeLeft)}px`,
    top: `${closeTop}px`,
    zIndex: '12005',
    display: 'flex',
    width: `${closeSize}px`,
    height: `${closeSize}px`,
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgb(226, 232, 240)',
    borderRadius: '9999px',
    background: 'rgb(255, 255, 255)',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.18)',
    color: 'rgb(15, 23, 42)',
    fontSize: '1.1rem',
    fontWeight: '800',
    lineHeight: '1',
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
