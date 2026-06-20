const MOBILE_QUERY = '(max-width: 767px)';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const CORE_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="core"]';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-tree-descendant-screen-style';
const DESCENDANTS_SCREEN = 'descendants';
const CORE_SCREEN = 'core';
const SWIPE_THRESHOLD = 56;
const DESCENDANT_KEYS = ['irmaos', 'sobrinhos', 'conjuge', 'pets', 'filhos', 'netos'];

type TreeScreen = 'core' | 'descendants';

let gestureStart: { x: number; y: number; screen: TreeScreen } | null = null;
let scheduled = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === '/mapa-familiar';
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function getCoreScreen(root = getRoot()) {
  return root?.querySelector<HTMLElement>(CORE_SCREEN_SELECTOR) ?? null;
}

function isEnabled() {
  return isMobileViewport() && isFamilyMapPath() && Boolean(getRoot());
}

function setAttributeIfChanged(element: HTMLElement, name: string, value: string) {
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function getCurrentScreen(root = getRoot()): TreeScreen {
  return root?.getAttribute('data-mobile-family-tree-active-screen') === DESCENDANTS_SCREEN
    ? DESCENDANTS_SCREEN
    : CORE_SCREEN;
}

function descendantCardSelector() {
  return DESCENDANT_KEYS.map((key) => `[data-family-map-color-key="${key}"]`).join(', ');
}

function elementHasClassNames(element: Element, classNames: string[]) {
  return classNames.every((className) => element.classList.contains(className));
}

function getSourceGrid(root = getRoot()) {
  const coreScreen = getCoreScreen(root);
  if (!coreScreen) return null;

  const selector = descendantCardSelector();
  return Array.from(coreScreen.querySelectorAll<HTMLElement>('div.grid'))
    .find((grid) => (
      elementHasClassNames(grid, ['grid-cols-2', 'items-start', 'gap-3'])
      && Boolean(grid.querySelector(selector))
    )) ?? null;
}

function getSourceConnector(sourceGrid: HTMLElement | null) {
  const previous = sourceGrid?.previousElementSibling;
  if (!(previous instanceof HTMLElement)) return null;

  return previous.classList.contains('relative')
    && previous.classList.contains('mx-auto')
    && previous.classList.contains('h-9')
    && previous.classList.contains('w-full')
    ? previous
    : null;
}

function descendantCardCount(root = getRoot()) {
  const sourceGrid = getSourceGrid(root);
  if (!sourceGrid) return 0;
  return sourceGrid.querySelectorAll(descendantCardSelector()).length;
}

function hasDescendantContent(root = getRoot()) {
  return descendantCardCount(root) > 0;
}

function getTransformForScreen(screen: TreeScreen) {
  const row = screen === DESCENDANTS_SCREEN ? 2 : 1;
  return `translate3d(calc(-33.3333333333% + 0px), calc(${-row * (100 / 3)}% + 0px), 0)`;
}

function getDescendantScrollArea(target: EventTarget | null) {
  if (target instanceof Element) {
    return target.closest<HTMLElement>('.mobile-family-descendant-screen__scroll');
  }

  return getRoot()?.querySelector<HTMLElement>('.mobile-family-descendant-screen__scroll') ?? null;
}

function descendantScrollCanMove(target: EventTarget | null, deltaY: number) {
  const scrollArea = getDescendantScrollArea(target);
  if (!scrollArea) return false;

  const maxScrollTop = scrollArea.scrollHeight - scrollArea.clientHeight;
  if (maxScrollTop <= 1) return false;

  // deltaY < 0: dedo sobe, conteúdo deve rolar para baixo.
  if (deltaY < 0) return scrollArea.scrollTop < maxScrollTop - 1;
  // deltaY > 0: dedo desce, conteúdo deve rolar para cima.
  if (deltaY > 0) return scrollArea.scrollTop > 1;

  return false;
}

function descendantScrollIsAtTop(target: EventTarget | null) {
  const scrollArea = getDescendantScrollArea(target);
  return !scrollArea || scrollArea.scrollTop <= 1;
}

function relayCloneClicks(clone: HTMLElement, original: HTMLElement) {
  const originalButtons = Array.from(original.querySelectorAll<HTMLButtonElement>('button'));
  const cloneButtons = Array.from(clone.querySelectorAll<HTMLButtonElement>('button'));

  cloneButtons.forEach((button, index) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      originalButtons[index]?.click();
    });
  });
}

function clearClonedSourceAttributes(element: HTMLElement) {
  element.removeAttribute('data-mobile-family-tree-descendant-source');
  element.removeAttribute('data-mobile-family-tree-descendant-connector');
  element.querySelectorAll<HTMLElement>('[data-mobile-family-tree-descendant-source], [data-mobile-family-tree-descendant-connector]').forEach((node) => {
    node.removeAttribute('data-mobile-family-tree-descendant-source');
    node.removeAttribute('data-mobile-family-tree-descendant-connector');
  });
}

function buildDescendantScreenContent(screen: HTMLElement, root: HTMLElement) {
  const sourceGrid = getSourceGrid(root);
  const sourceConnector = getSourceConnector(sourceGrid);
  if (!sourceGrid) {
    screen.innerHTML = '';
    return;
  }

  setAttributeIfChanged(sourceGrid, 'data-mobile-family-tree-descendant-source', 'true');
  if (sourceConnector) setAttributeIfChanged(sourceConnector, 'data-mobile-family-tree-descendant-connector', 'true');

  const signature = `${sourceGrid.textContent ?? ''}:${descendantCardCount(root)}`;
  if (screen.dataset.mobileDescendantSignature === signature) return;
  screen.dataset.mobileDescendantSignature = signature;
  screen.innerHTML = '';

  const scroll = document.createElement('div');
  scroll.className = 'mobile-family-descendant-screen__scroll';
  scroll.setAttribute('data-mobile-tree-scroll', 'true');

  const inner = document.createElement('div');
  inner.className = 'mobile-family-descendant-screen__inner';

  if (sourceConnector) {
    const connectorClone = sourceConnector.cloneNode(true) as HTMLElement;
    clearClonedSourceAttributes(connectorClone);
    connectorClone.classList.add('mobile-family-descendant-screen__connector');
    inner.appendChild(connectorClone);
  }

  const gridClone = sourceGrid.cloneNode(true) as HTMLElement;
  clearClonedSourceAttributes(gridClone);
  gridClone.classList.add('mobile-family-descendant-screen__grid');
  relayCloneClicks(gridClone, sourceGrid);
  inner.appendChild(gridClone);

  scroll.appendChild(inner);
  screen.appendChild(scroll);
}

function ensureDescendantScreen(root: HTMLElement) {
  const stage = getStage(root);
  if (!stage) return;

  let screen = stage.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${DESCENDANTS_SCREEN}"]`);

  if (!hasDescendantContent(root)) {
    screen?.remove();
    return;
  }

  if (!screen) {
    screen = document.createElement('div');
    screen.dataset.mobileFamilyTreeScreen = DESCENDANTS_SCREEN;
    screen.className = 'mobile-family-descendant-screen';
    screen.style.gridColumnStart = '2';
    screen.style.gridRowStart = '3';
    screen.style.height = '100%';
    screen.style.width = '100%';
    screen.style.overflow = 'visible';
    stage.appendChild(screen);
  }

  buildDescendantScreenContent(screen, root);
}

function applyScreen(screen: TreeScreen, animate = true) {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) return;
  if (screen === DESCENDANTS_SCREEN && !hasDescendantContent(root)) return;

  stage.style.setProperty('transform', getTransformForScreen(screen), 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');

  setAttributeIfChanged(root, 'data-mobile-family-tree-active-screen', screen);
  setAttributeIfChanged(root, 'data-mobile-family-tree-descendants-ready', hasDescendantContent(root) ? 'true' : 'false');

  root.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll]').forEach((scrollArea) => {
    scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });

  if (animate) {
    window.setTimeout(() => {
      const currentStage = getStage();
      currentStage?.style.removeProperty('transition');
    }, 340);
  }
}

function scheduleApplyIfNeeded() {
  if (scheduled) return;
  scheduled = true;

  window.requestAnimationFrame(() => {
    scheduled = false;
    const root = getRoot();
    if (!root || !isEnabled()) return;

    ensureStyles();
    ensureDescendantScreen(root);

    const hasContent = hasDescendantContent(root);
    setAttributeIfChanged(root, 'data-mobile-family-tree-descendants-ready', hasContent ? 'true' : 'false');

    if (getCurrentScreen(root) === DESCENDANTS_SCREEN) {
      if (hasContent) applyScreen(DESCENDANTS_SCREEN, false);
      else applyScreen(CORE_SCREEN, false);
    }

    patchOverview();
  });
}

function ensureStyles() {
  const existing = document.getElementById(STYLE_ID);
  existing?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${ROOT_SELECTOR}[data-mobile-family-tree-descendants-ready="true"] [data-mobile-family-tree-descendant-source="true"],
      ${ROOT_SELECTOR}[data-mobile-family-tree-descendants-ready="true"] [data-mobile-family-tree-descendant-connector="true"] {
        display: none !important;
      }

      .mobile-family-descendant-screen {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: visible;
      }

      .mobile-family-descendant-screen__scroll {
        height: 100%;
        overflow-y: auto;
        overflow-x: visible;
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
        padding: 1.25rem 1rem calc(env(safe-area-inset-bottom, 0px) + 8rem);
      }

      .mobile-family-descendant-screen__inner {
        position: relative;
        z-index: 10;
        width: min(100%, 430px);
        min-height: 100%;
        margin: 0 auto;
      }

      .mobile-family-descendant-screen__connector {
        display: block !important;
        margin: 0 auto !important;
      }

      .mobile-family-descendant-screen__grid {
        display: grid !important;
        align-items: start !important;
      }

      ${ROOT_SELECTOR}[data-mobile-family-tree-active-screen="core"][data-mobile-family-tree-descendants-ready="true"] ${CORE_SCREEN_SELECTOR} [data-mobile-tree-scroll] {
        overscroll-behavior-y: contain !important;
      }

      ${ROOT_SELECTOR}[data-mobile-family-tree-active-screen="descendants"] .mobile-family-descendant-screen__scroll {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        touch-action: pan-y !important;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[data-screen="descendants"] {
        border-color: color-mix(in srgb, var(--tree-palette-border-filhos, #bbf7d0) 74%, #fff);
        background: color-mix(in srgb, var(--tree-palette-bg-filhos, #f0fdf4) 34%, #fff);
      }
    }
  `;
  document.head.appendChild(style);
}

function handleTouchStart(event: TouchEvent) {
  if (!isEnabled()) return;
  const root = getRoot();
  if (!root) return;
  const target = event.target instanceof Element ? event.target : null;
  if (!target?.closest(ROOT_SELECTOR)) return;

  const touch = event.touches[0];
  if (!touch) return;

  gestureStart = {
    x: touch.clientX,
    y: touch.clientY,
    screen: getCurrentScreen(root),
  };
}

function shouldHandleVerticalGesture(deltaX: number, deltaY: number, screen: TreeScreen, target: EventTarget | null) {
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);
  if (absoluteY <= absoluteX * 1.2 || absoluteY < 10) return false;

  // deltaY < 0 = dedo sobe, viewport vai para a tela abaixo.
  if (screen === CORE_SCREEN) return deltaY < 0 && hasDescendantContent();

  if (screen === DESCENDANTS_SCREEN) {
    if (descendantScrollCanMove(target, deltaY)) return false;
    return deltaY > 0 && descendantScrollIsAtTop(target);
  }

  return false;
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart || !isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - gestureStart.x;
  const deltaY = touch.clientY - gestureStart.y;

  if (!shouldHandleVerticalGesture(deltaX, deltaY, gestureStart.screen, event.target)) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function handleTouchEnd(event: TouchEvent) {
  if (!gestureStart || !isEnabled()) {
    gestureStart = null;
    return;
  }

  const touch = event.changedTouches[0];
  const start = gestureStart;
  gestureStart = null;
  if (!touch) return;

  const deltaX = touch.clientX - start.x;
  const deltaY = touch.clientY - start.y;
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);
  const vertical = absoluteY >= SWIPE_THRESHOLD && absoluteY > absoluteX * 1.2;

  if (!vertical) return;

  if (start.screen === CORE_SCREEN && deltaY < 0 && hasDescendantContent()) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    applyScreen(DESCENDANTS_SCREEN);
    return;
  }

  if (start.screen === DESCENDANTS_SCREEN && deltaY > 0 && descendantScrollIsAtTop(event.target)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    applyScreen(CORE_SCREEN);
  }
}

function handleTopTabClick(event: MouseEvent) {
  if (!isEnabled()) return;
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest('nav[aria-label="Visualizações da árvore"] button');
  if (!button) return;

  window.setTimeout(() => {
    const root = getRoot();
    const stage = getStage(root);
    if (!root || !stage) return;
    if (root.getAttribute('data-mobile-family-tree-active-screen') === DESCENDANTS_SCREEN) {
      root.removeAttribute('data-mobile-family-tree-active-screen');
    }
    stage.style.removeProperty('transition');
  }, 60);
}

function buildOverviewTile(root: HTMLElement, currentScreen: string | null) {
  const count = descendantCardCount(root);
  if (count <= 0) return null;

  const tile = document.createElement('button');
  const current = currentScreen === DESCENDANTS_SCREEN;
  tile.type = 'button';
  tile.className = 'mobile-family-overview-tile';
  tile.dataset.screen = DESCENDANTS_SCREEN;
  tile.style.gridColumn = '2';
  tile.style.gridRow = '3';
  tile.setAttribute('aria-label', current ? 'Tela atual: Descendentes e vínculos' : 'Abrir Descendentes e vínculos');
  if (current) {
    tile.dataset.current = 'true';
    tile.setAttribute('aria-current', 'location');
  }

  tile.innerHTML = `
    ${current ? '<span class="mobile-family-overview-tile-current">Atual</span>' : ''}
    <span class="mobile-family-overview-tile-title">Descendentes</span>
    <span class="mobile-family-overview-tile-subtitle">Irmãos, cônjuge, pets, filhos e netos</span>
    <span class="mobile-family-overview-tile-summary">Tela abaixo do núcleo central</span>
    <span class="mobile-family-overview-tile-count">${count} card${count === 1 ? '' : 's'}</span>
  `;

  tile.addEventListener('click', () => {
    document.getElementById(OVERVIEW_ID)?.remove();
    document.body.style.removeProperty('overflow');
    applyScreen(DESCENDANTS_SCREEN);
  });

  return tile;
}

function patchOverview() {
  if (!isEnabled()) return;
  const root = getRoot();
  const overlay = document.getElementById(OVERVIEW_ID);
  const map = overlay?.querySelector<HTMLElement>('.mobile-family-overview-map');
  if (!root || !map) return;

  const currentScreen = root.getAttribute('data-mobile-family-tree-active-screen');
  const existing = map.querySelector<HTMLElement>('[data-screen="descendants"]');
  existing?.remove();

  if (currentScreen === DESCENDANTS_SCREEN) {
    map.querySelectorAll<HTMLElement>('.mobile-family-overview-tile[data-current="true"]').forEach((tile) => {
      tile.removeAttribute('data-current');
      tile.removeAttribute('aria-current');
      tile.querySelector('.mobile-family-overview-tile-current')?.remove();
    });
  }

  const tile = buildOverviewTile(root, currentScreen);
  if (!tile) return;

  const emptyCenterBottom = Array.from(map.querySelectorAll<HTMLElement>('.mobile-family-overview-empty'))
    .find((cell) => cell.style.gridColumn === '2' && cell.style.gridRow === '3');

  if (emptyCenterBottom) emptyCenterBottom.replaceWith(tile);
  else map.appendChild(tile);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();

  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });
  document.addEventListener('click', handleTopTabClick, { capture: true });

  const observer = new MutationObserver(scheduleApplyIfNeeded);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

  window.addEventListener('resize', () => {
    ensureStyles();
    scheduleApplyIfNeeded();
  }, { passive: true });
  window.addEventListener('orientationchange', scheduleApplyIfNeeded, { passive: true });
  window.addEventListener('focus', scheduleApplyIfNeeded, { passive: true });

  [80, 450, 1000].forEach((delay) => window.setTimeout(scheduleApplyIfNeeded, delay));
}

export {};
