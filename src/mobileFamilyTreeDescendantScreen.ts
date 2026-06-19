const MOBILE_QUERY = '(max-width: 767px)';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const CORE_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="core"]';
const CORE_SCROLL_SELECTOR = `${CORE_SCREEN_SELECTOR} [data-mobile-tree-scroll]`;
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-tree-descendant-screen-style';
const DESCENDANTS_SCREEN = 'descendants';
const CORE_SCREEN = 'core';
const SWIPE_THRESHOLD = 56;

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

function isEnabled() {
  return isMobileViewport() && isFamilyMapPath() && Boolean(getRoot());
}

function getCurrentScreen(root = getRoot()): TreeScreen {
  return root?.getAttribute('data-mobile-family-tree-active-screen') === DESCENDANTS_SCREEN
    ? DESCENDANTS_SCREEN
    : CORE_SCREEN;
}

function descendantCardCount(root = getRoot()) {
  if (!root) return 0;
  return root.querySelectorAll(
    `${CORE_SCREEN_SELECTOR} [data-family-map-color-key="irmaos"], ${CORE_SCREEN_SELECTOR} [data-family-map-color-key="sobrinhos"], ${CORE_SCREEN_SELECTOR} [data-family-map-color-key="conjuge"], ${CORE_SCREEN_SELECTOR} [data-family-map-color-key="pets"], ${CORE_SCREEN_SELECTOR} [data-family-map-color-key="filhos"], ${CORE_SCREEN_SELECTOR} [data-family-map-color-key="netos"]`,
  ).length;
}

function hasDescendantContent(root = getRoot()) {
  return descendantCardCount(root) > 0;
}

function getTransformForScreen(screen: TreeScreen) {
  const row = screen === DESCENDANTS_SCREEN ? 2 : 1;
  return `translate3d(calc(-33.3333333333% + 0px), calc(${-row * (100 / 3)}% + 0px), 0)`;
}

function applyScreen(screen: TreeScreen, animate = true) {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) return;
  if (screen === DESCENDANTS_SCREEN && !hasDescendantContent(root)) return;

  stage.style.setProperty('transform', getTransformForScreen(screen), 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');

  root.setAttribute('data-mobile-family-tree-active-screen', screen);
  root.setAttribute('data-mobile-family-tree-descendants-ready', hasDescendantContent(root) ? 'true' : 'false');

  root.querySelectorAll<HTMLElement>(CORE_SCROLL_SELECTOR).forEach((scrollArea) => {
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

    const hasContent = hasDescendantContent(root);
    root.setAttribute('data-mobile-family-tree-descendants-ready', hasContent ? 'true' : 'false');

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
      ${ROOT_SELECTOR}[data-mobile-family-tree-descendants-ready="true"] ${CORE_SCROLL_SELECTOR} > div {
        position: relative !important;
        min-height: 100% !important;
        overflow: visible !important;
      }

      ${ROOT_SELECTOR}[data-mobile-family-tree-descendants-ready="true"] ${CORE_SCROLL_SELECTOR} > div > div.relative.mx-auto.h-9.w-full {
        position: absolute !important;
        top: calc(100% + 0.35rem) !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 5 !important;
        margin: 0 auto !important;
      }

      ${ROOT_SELECTOR}[data-mobile-family-tree-descendants-ready="true"] ${CORE_SCROLL_SELECTOR} > div > div.grid.grid-cols-2.items-start.gap-3 {
        position: absolute !important;
        top: calc(100% + 2.75rem) !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 10 !important;
        min-height: calc(100dvh - 10rem) !important;
        padding: 0 1rem calc(env(safe-area-inset-bottom, 0px) + 10rem) !important;
        align-items: start !important;
      }

      ${ROOT_SELECTOR}[data-mobile-family-tree-active-screen="core"][data-mobile-family-tree-descendants-ready="true"] ${CORE_SCROLL_SELECTOR} {
        overscroll-behavior-y: contain !important;
      }

      ${ROOT_SELECTOR}[data-mobile-family-tree-active-screen="descendants"] ${CORE_SCROLL_SELECTOR} {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
      }

      ${ROOT_SELECTOR}[data-mobile-family-tree-active-screen="descendants"] ${CORE_SCREEN_SELECTOR} {
        overflow: visible !important;
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

function shouldHandleVerticalGesture(deltaX: number, deltaY: number, screen: TreeScreen) {
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);
  if (absoluteY <= absoluteX * 1.2 || absoluteY < 10) return false;

  // deltaY < 0 = dedo sobe, viewport vai para a tela abaixo.
  if (screen === CORE_SCREEN) return deltaY < 0 && hasDescendantContent();
  if (screen === DESCENDANTS_SCREEN) return true;
  return false;
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart || !isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - gestureStart.x;
  const deltaY = touch.clientY - gestureStart.y;

  if (!shouldHandleVerticalGesture(deltaX, deltaY, gestureStart.screen)) return;

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

  if (start.screen === DESCENDANTS_SCREEN) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (deltaY > 0) applyScreen(CORE_SCREEN);
  }
}

function handleTopTabClick(event: MouseEvent) {
  if (!isEnabled()) return;
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest('nav[aria-label="Visualizações da árvore"] button');
  if (!button) return;

  window.setTimeout(() => {
    const root = getRoot();
    if (!root) return;
    root.setAttribute('data-mobile-family-tree-active-screen', CORE_SCREEN);
  }, 40);
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
