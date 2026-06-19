const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const GRANDPARENTS_SCREEN = 'ancestors';
const PATERNAL_DEEP_SCREEN = 'paternal-ancestors';
const MATERNAL_DEEP_SCREEN = 'maternal-ancestors';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';
const STYLE_ID = 'mobile-family-tree-grandparent-screens-style';
const SWIPE_THRESHOLD = 56;

type MobileAncestorScreen = typeof GRANDPARENTS_SCREEN | typeof PATERNAL_DEEP_SCREEN | typeof MATERNAL_DEEP_SCREEN;
type AncestorSide = 'paternal' | 'maternal';
type GestureDestination = MobileAncestorScreen | 'core' | 'blocked' | null;

type GestureStart = {
  x: number;
  y: number;
  screen: MobileAncestorScreen | null;
};

let gestureStart: GestureStart | null = null;
let scheduled = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === FAMILY_MAP_PATH;
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

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getGroupTitle(section: HTMLElement) {
  return normalize(section.querySelector('h2, h3')?.textContent ?? '');
}

function isPaternalDeepGroup(section: HTMLElement) {
  const title = getGroupTitle(section);
  return title.includes('paternos') && (title.includes('bisavos') || title.includes('tataravos'));
}

function isMaternalDeepGroup(section: HTMLElement) {
  const title = getGroupTitle(section);
  return title.includes('maternos') && (title.includes('bisavos') || title.includes('tataravos'));
}

function isGrandparentGroup(section: HTMLElement) {
  const title = getGroupTitle(section);
  return title.includes('avos') && !title.includes('bisavos') && !title.includes('tataravos');
}

function getAncestorScreen(root = getRoot()) {
  return root?.querySelector<HTMLElement>('[data-mobile-family-tree-screen="ancestors"]') ?? null;
}

function getAncestorGroupSections(root = getRoot()) {
  const ancestorScreen = getAncestorScreen(root);
  if (!ancestorScreen) return [];

  return Array.from(ancestorScreen.querySelectorAll<HTMLElement>('section'))
    .filter((section) => section.querySelector('[data-family-map-mobile-card="true"]'));
}

function getDeepGroups(side: AncestorSide, root = getRoot()) {
  return getAncestorGroupSections(root).filter((section) => (
    side === 'paternal' ? isPaternalDeepGroup(section) : isMaternalDeepGroup(section)
  ));
}

function hasDeepGroups(side: AncestorSide, root = getRoot()) {
  return getDeepGroups(side, root).length > 0;
}

function getGroupsSignature(groups: HTMLElement[]) {
  return groups
    .map((group) => `${group.querySelector('h2, h3')?.textContent ?? ''}:${group.querySelectorAll('[data-family-map-mobile-card="true"]').length}:${group.textContent ?? ''}`)
    .join('|');
}

function ensureStyles() {
  const existing = document.getElementById(STYLE_ID);
  existing?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      [data-mobile-family-tree-grandparent-hidden="true"] {
        display: none !important;
      }

      [data-mobile-family-tree-screen="ancestors"] [data-mobile-tree-scroll] > div {
        padding-top: 18vh !important;
      }

      [data-mobile-family-tree-screen="ancestors"] .bg-cyan-600 {
        display: none !important;
      }

      [data-mobile-family-tree-grandparent-side] {
        overflow: visible !important;
      }

      [data-mobile-family-tree-grandparent-side]::before,
      [data-mobile-family-tree-grandparent-side]::after {
        content: '';
        position: absolute;
        z-index: 0;
        pointer-events: none;
        background: var(--tree-palette-edge-child, var(--tree-palette-line, #6B7A5E));
      }

      [data-mobile-family-tree-grandparent-side="paternal"]::before {
        top: 50%;
        right: 100%;
        height: var(--tree-palette-line-width, 3px);
        width: 50vw;
        transform: translateY(-50%);
      }

      [data-mobile-family-tree-grandparent-side="maternal"]::before {
        top: 50%;
        left: 100%;
        height: var(--tree-palette-line-width, 3px);
        width: 50vw;
        transform: translateY(-50%);
      }

      [data-mobile-family-tree-grandparent-side]::after {
        top: 100%;
        left: 50%;
        width: var(--tree-palette-line-width, 3px);
        height: 120vh;
        transform: translateX(-50%);
      }

      .mobile-family-deep-ancestor-screen {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: visible;
      }

      .mobile-family-deep-ancestor-screen__scroll {
        height: 100%;
        overflow-y: auto;
        overflow-x: visible;
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
        padding: 1.5rem 1rem calc(env(safe-area-inset-bottom, 0px) + 8rem);
      }

      .mobile-family-deep-ancestor-screen__inner {
        position: relative;
        z-index: 10;
        display: grid;
        min-height: 100%;
        width: min(60%, 234px);
        max-width: 234px;
        margin: 0 auto;
        grid-template-columns: 1fr;
        align-content: center;
        gap: 0.75rem;
      }

      .mobile-family-deep-ancestor-screen__inner > section {
        width: 100%;
        border-color: var(--tree-palette-border-avos, #E8A29B) !important;
      }

      .mobile-family-deep-ancestor-screen__inner [data-family-map-mobile-card="true"] {
        border-color: var(--tree-palette-border-avos, #E8A29B) !important;
      }

      .mobile-family-deep-ancestor-screen__inner::before,
      .mobile-family-deep-ancestor-screen__inner::after {
        content: '';
        position: absolute;
        top: 50%;
        z-index: 0;
        height: var(--tree-palette-line-width, 3px);
        width: 40vw;
        background: var(--tree-palette-edge-child, var(--tree-palette-line, #6B7A5E));
        transform: translateY(-50%);
        pointer-events: none;
      }

      .mobile-family-deep-ancestor-screen__inner::before,
      .mobile-family-deep-ancestor-screen__inner::after {
        display: none;
      }

      .mobile-family-deep-ancestor-screen--paternal .mobile-family-deep-ancestor-screen__inner::after {
        display: block;
        left: 100%;
      }

      .mobile-family-deep-ancestor-screen--maternal .mobile-family-deep-ancestor-screen__inner::before {
        display: block;
        right: 100%;
      }

      #${OVERVIEW_ID} .mobile-family-overview-tile[data-screen="paternal-ancestors"],
      #${OVERVIEW_ID} .mobile-family-overview-tile[data-screen="maternal-ancestors"] {
        border-color: color-mix(in srgb, var(--tree-palette-border-avos, #E8A29B) 76%, #fff);
        background: color-mix(in srgb, var(--tree-palette-card-avos, #E8A29B) 24%, #fff);
      }
    }
  `;
  document.head.appendChild(style);
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

function buildDeepScreenContent(groups: HTMLElement[], screen: HTMLElement) {
  screen.innerHTML = '';

  const scroll = document.createElement('div');
  scroll.className = 'mobile-family-deep-ancestor-screen__scroll';
  scroll.setAttribute('data-mobile-tree-scroll', 'true');

  const inner = document.createElement('div');
  inner.className = 'mobile-family-deep-ancestor-screen__inner';

  groups.forEach((group) => {
    const clone = group.cloneNode(true) as HTMLElement;
    clone.removeAttribute('data-mobile-family-tree-grandparent-hidden');
    clone.style.removeProperty('display');
    relayCloneClicks(clone, group);
    inner.appendChild(clone);
  });

  scroll.appendChild(inner);
  screen.appendChild(scroll);
}

function ensureDeepScreen(side: AncestorSide, root: HTMLElement) {
  const stage = getStage(root);
  if (!stage) return;

  const screenName = side === 'paternal' ? PATERNAL_DEEP_SCREEN : MATERNAL_DEEP_SCREEN;
  let screen = stage.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`);
  const groups = getDeepGroups(side, root);

  if (groups.length === 0) {
    screen?.remove();
    return;
  }

  if (!screen) {
    screen = document.createElement('div');
    screen.dataset.mobileFamilyTreeScreen = screenName;
    screen.className = 'mobile-family-deep-ancestor-screen';
    screen.style.gridColumnStart = side === 'paternal' ? '1' : '3';
    screen.style.gridRowStart = '1';
    screen.style.height = '100%';
    screen.style.width = '100%';
    screen.style.overflow = 'visible';
    stage.appendChild(screen);
  }

  screen.classList.toggle('mobile-family-deep-ancestor-screen--paternal', side === 'paternal');
  screen.classList.toggle('mobile-family-deep-ancestor-screen--maternal', side === 'maternal');

  const signature = getGroupsSignature(groups);
  if (screen.dataset.mobileAncestorSignature === signature) return;

  screen.dataset.mobileAncestorSignature = signature;
  buildDeepScreenContent(groups, screen);
}

function filterGrandparentScreen(root: HTMLElement) {
  getAncestorGroupSections(root).forEach((section) => {
    const title = getGroupTitle(section);

    if (isGrandparentGroup(section)) {
      section.removeAttribute('data-mobile-family-tree-grandparent-hidden');
      section.style.removeProperty('display');

      if (title.includes('paternos')) section.setAttribute('data-mobile-family-tree-grandparent-side', 'paternal');
      else if (title.includes('maternos')) section.setAttribute('data-mobile-family-tree-grandparent-side', 'maternal');
      else section.removeAttribute('data-mobile-family-tree-grandparent-side');
    } else if (isPaternalDeepGroup(section) || isMaternalDeepGroup(section)) {
      section.removeAttribute('data-mobile-family-tree-grandparent-side');
      if (section.getAttribute('data-mobile-family-tree-grandparent-hidden') !== 'true') {
        section.setAttribute('data-mobile-family-tree-grandparent-hidden', 'true');
      }
    } else {
      section.removeAttribute('data-mobile-family-tree-grandparent-side');
    }
  });
}

function transformForScreen(screen: MobileAncestorScreen) {
  if (screen === PATERNAL_DEEP_SCREEN) return 'translate3d(calc(0% + 0px), calc(0% + 0px), 0)';
  if (screen === MATERNAL_DEEP_SCREEN) return 'translate3d(calc(-66.6666666667% + 0px), calc(0% + 0px), 0)';
  return 'translate3d(calc(-33.3333333333% + 0px), calc(0% + 0px), 0)';
}

function applyCoreScreen(animate = true) {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) return;

  stage.style.setProperty('transform', 'translate3d(calc(-33.3333333333% + 0px), calc(-33.3333333333% + 0px), 0)', 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');

  root.setAttribute('data-mobile-family-tree-active-screen', 'core');

  if (animate) {
    window.setTimeout(() => {
      getStage()?.style.removeProperty('transition');
    }, 340);
  }
}

function applyAncestorScreen(screen: MobileAncestorScreen, animate = true) {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) return;

  if (screen === PATERNAL_DEEP_SCREEN && !hasDeepGroups('paternal', root)) return;
  if (screen === MATERNAL_DEEP_SCREEN && !hasDeepGroups('maternal', root)) return;

  stage.style.setProperty('transform', transformForScreen(screen), 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');

  root.setAttribute('data-mobile-family-tree-active-screen', screen);

  if (animate) {
    window.setTimeout(() => {
      getStage()?.style.removeProperty('transition');
    }, 340);
  }
}

function inferAncestorScreenFromTransform(root: HTMLElement): MobileAncestorScreen | null {
  const explicit = root.getAttribute('data-mobile-family-tree-active-screen');
  if (explicit === PATERNAL_DEEP_SCREEN || explicit === MATERNAL_DEEP_SCREEN || explicit === GRANDPARENTS_SCREEN) {
    return explicit;
  }

  const transform = getStage(root)?.style.transform ?? '';
  const rowLooksTop = transform.includes('calc(0%') || transform.includes('calc(-0%');
  if (!rowLooksTop) return null;

  if (transform.includes('calc(-66.666')) return MATERNAL_DEEP_SCREEN;
  if (transform.includes('calc(-33.333')) return GRANDPARENTS_SCREEN;
  if (transform.includes('calc(0%')) return PATERNAL_DEEP_SCREEN;

  return null;
}

function scheduleSync() {
  if (scheduled) return;
  scheduled = true;

  window.requestAnimationFrame(() => {
    scheduled = false;
    const root = getRoot();
    if (!root || !isEnabled()) return;

    ensureStyles();
    filterGrandparentScreen(root);
    ensureDeepScreen('paternal', root);
    ensureDeepScreen('maternal', root);
    patchOverview();
  });
}

function handleTouchStart(event: TouchEvent) {
  if (!isEnabled()) return;
  const root = getRoot();
  const target = event.target instanceof Element ? event.target : null;
  const touch = event.touches[0];

  if (!root || !target?.closest(ROOT_SELECTOR) || !touch) return;

  gestureStart = {
    x: touch.clientX,
    y: touch.clientY,
    screen: inferAncestorScreenFromTransform(root),
  };
}

function destinationForGesture(screen: MobileAncestorScreen | null, deltaX: number, deltaY: number): GestureDestination {
  if (!screen) return null;

  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX >= SWIPE_THRESHOLD && absX > absY * 1.2) {
    if (screen === GRANDPARENTS_SCREEN) return deltaX > 0 ? PATERNAL_DEEP_SCREEN : MATERNAL_DEEP_SCREEN;
    if (screen === PATERNAL_DEEP_SCREEN && deltaX < 0) return GRANDPARENTS_SCREEN;
    if (screen === MATERNAL_DEEP_SCREEN && deltaX > 0) return GRANDPARENTS_SCREEN;
  }

  if (absY >= SWIPE_THRESHOLD && absY > absX * 1.2) {
    if (screen === GRANDPARENTS_SCREEN && deltaY < 0) return 'core';
    if (screen === PATERNAL_DEEP_SCREEN || screen === MATERNAL_DEEP_SCREEN) return 'blocked';
  }

  return null;
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart || !isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const destination = destinationForGesture(
    gestureStart.screen,
    touch.clientX - gestureStart.x,
    touch.clientY - gestureStart.y,
  );

  if (!destination) return;
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

  const destination = destinationForGesture(start.screen, touch.clientX - start.x, touch.clientY - start.y);
  if (!destination) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (destination === 'blocked') return;
  if (destination === 'core') {
    applyCoreScreen();
    return;
  }

  applyAncestorScreen(destination);
}

function setText(selectorRoot: HTMLElement, selector: string, value: string) {
  const element = selectorRoot.querySelector<HTMLElement>(selector);
  if (element && element.textContent !== value) element.textContent = value;
}

function relabelGrandparentsOverviewTile(map: HTMLElement) {
  const tile = map.querySelector<HTMLElement>('[data-screen="ancestors"]');
  if (!tile) return;

  setText(tile, '.mobile-family-overview-tile-title', 'Avós');
  setText(tile, '.mobile-family-overview-tile-subtitle', 'Avós paternos e maternos');
  setText(tile, '.mobile-family-overview-tile-summary', 'Tela acima do núcleo central');
}

function buildOverviewTile(screenName: MobileAncestorScreen, title: string, subtitle: string, count: number, currentScreen: string | null) {
  if (count <= 0) return null;

  const tile = document.createElement('button');
  const current = currentScreen === screenName;
  tile.type = 'button';
  tile.className = 'mobile-family-overview-tile';
  tile.dataset.screen = screenName;
  tile.style.gridColumn = screenName === PATERNAL_DEEP_SCREEN ? '1' : '3';
  tile.style.gridRow = '1';
  tile.setAttribute('aria-label', current ? `Tela atual: ${title}` : `Abrir ${title}`);
  if (current) {
    tile.dataset.current = 'true';
    tile.setAttribute('aria-current', 'location');
  }

  tile.innerHTML = `
    ${current ? '<span class="mobile-family-overview-tile-current">Atual</span>' : ''}
    <span class="mobile-family-overview-tile-title">${title}</span>
    <span class="mobile-family-overview-tile-subtitle">${subtitle}</span>
    <span class="mobile-family-overview-tile-summary">Ancestrais profundos</span>
    <span class="mobile-family-overview-tile-count">${count} card${count === 1 ? '' : 's'}</span>
  `;

  tile.addEventListener('click', () => {
    document.getElementById(OVERVIEW_ID)?.remove();
    document.body.style.removeProperty('overflow');
    applyAncestorScreen(screenName);
  });

  return tile;
}

function patchOverview() {
  const root = getRoot();
  const overlay = document.getElementById(OVERVIEW_ID);
  const map = overlay?.querySelector<HTMLElement>('.mobile-family-overview-map');
  if (!root || !map) return;

  const currentScreen = root.getAttribute('data-mobile-family-tree-active-screen');
  const paternalCount = getDeepGroups('paternal', root).reduce((sum, group) => sum + group.querySelectorAll('[data-family-map-mobile-card="true"]').length, 0);
  const maternalCount = getDeepGroups('maternal', root).reduce((sum, group) => sum + group.querySelectorAll('[data-family-map-mobile-card="true"]').length, 0);
  const signature = `${currentScreen ?? ''}:${paternalCount}:${maternalCount}`;

  relabelGrandparentsOverviewTile(map);
  if (map.dataset.mobileGrandparentOverviewSignature === signature) return;
  map.dataset.mobileGrandparentOverviewSignature = signature;

  map.querySelectorAll<HTMLElement>('[data-screen="paternal-ancestors"], [data-screen="maternal-ancestors"]').forEach((tile) => tile.remove());

  if (currentScreen === PATERNAL_DEEP_SCREEN || currentScreen === MATERNAL_DEEP_SCREEN) {
    map.querySelectorAll<HTMLElement>('.mobile-family-overview-tile[data-current="true"]').forEach((tile) => {
      tile.removeAttribute('data-current');
      tile.removeAttribute('aria-current');
      tile.querySelector('.mobile-family-overview-tile-current')?.remove();
    });
  }

  const paternalTile = buildOverviewTile(
    PATERNAL_DEEP_SCREEN,
    'Bisavós paternos',
    'Bisavós e tataravós paternos',
    paternalCount,
    currentScreen,
  );
  const maternalTile = buildOverviewTile(
    MATERNAL_DEEP_SCREEN,
    'Bisavós maternos',
    'Bisavós e tataravós maternos',
    maternalCount,
    currentScreen,
  );

  const replaceOrAppend = (tile: HTMLElement | null) => {
    if (!tile) return;
    const emptyCell = Array.from(map.querySelectorAll<HTMLElement>('.mobile-family-overview-empty'))
      .find((cell) => cell.style.gridColumn === tile.style.gridColumn && cell.style.gridRow === tile.style.gridRow);
    if (emptyCell) emptyCell.replaceWith(tile);
    else map.appendChild(tile);
  };

  replaceOrAppend(paternalTile);
  replaceOrAppend(maternalTile);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();

  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

  window.addEventListener('resize', () => {
    ensureStyles();
    scheduleSync();
  }, { passive: true });
  window.addEventListener('orientationchange', scheduleSync, { passive: true });
  window.addEventListener('focus', scheduleSync, { passive: true });

  [80, 450, 1000].forEach((delay) => window.setTimeout(scheduleSync, delay));
}

export {};
