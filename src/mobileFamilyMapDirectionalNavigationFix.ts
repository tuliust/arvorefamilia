const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const NAVIGATION_THRESHOLD = 56;
const PREVIEW_THRESHOLD = 10;

type ScreenName =
  | 'paternal-ancestors'
  | 'ancestors'
  | 'maternal-ancestors'
  | 'paternal-uncles'
  | 'core'
  | 'maternal-uncles'
  | 'paternal-cousins'
  | 'descendants'
  | 'maternal-cousins';

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

type GestureStart = {
  x: number;
  y: number;
  lastY: number;
  screen: ScreenName | null;
  scrollArea: HTMLElement | null;
  handledScroll: boolean;
};

const SCREEN_POSITIONS: Record<ScreenName, { column: number; row: number }> = {
  'paternal-ancestors': { column: 0, row: 0 },
  ancestors: { column: 1, row: 0 },
  'maternal-ancestors': { column: 2, row: 0 },
  'paternal-uncles': { column: 0, row: 1 },
  core: { column: 1, row: 1 },
  'maternal-uncles': { column: 2, row: 1 },
  'paternal-cousins': { column: 0, row: 2 },
  descendants: { column: 1, row: 2 },
  'maternal-cousins': { column: 2, row: 2 },
};

const DESTINATIONS: Record<ScreenName, Partial<Record<SwipeDirection, ScreenName>>> = {
  'paternal-ancestors': { right: 'ancestors' },
  ancestors: { left: 'paternal-ancestors', right: 'maternal-ancestors', down: 'core' },
  'maternal-ancestors': { left: 'ancestors' },
  core: { up: 'ancestors', down: 'descendants', left: 'paternal-uncles', right: 'maternal-uncles' },
  'maternal-uncles': { left: 'core', down: 'maternal-cousins' },
  'paternal-uncles': { right: 'core', down: 'paternal-cousins' },
  descendants: { up: 'core' },
  'maternal-cousins': { up: 'maternal-uncles' },
  'paternal-cousins': { up: 'paternal-uncles' },
};

const DESCENDANT_KEYS = ['irmaos', 'sobrinhos', 'conjuge', 'pets', 'filhos', 'netos'];
let gestureStart: GestureStart | null = null;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isEnabled() {
  return isMobileViewport() && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH && Boolean(getRoot());
}

function isScreenName(value: string | null | undefined): value is ScreenName {
  return Boolean(value && value in SCREEN_POSITIONS);
}

function isCousinScreen(screenName: ScreenName | null) {
  return screenName === 'paternal-cousins' || screenName === 'maternal-cousins';
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function getScreenElement(screenName: ScreenName, root = getRoot()) {
  return root?.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`) ?? null;
}

function getTransformForScreen(screenName: ScreenName) {
  const { column, row } = SCREEN_POSITIONS[screenName];
  return `translate3d(calc(${-column * (100 / 3)}% + 0px), calc(${-row * (100 / 3)}% + 0px), 0)`;
}

function parseTranslatePercent(value: string) {
  const match = value.match(/translate3d\(calc\((-?\d+(?:\.\d+)?)%[^,]*,\s*calc\((-?\d+(?:\.\d+)?)%/);
  if (!match) return null;

  const x = Math.abs(Number(match[1]));
  const y = Math.abs(Number(match[2]));
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const toIndex = (percent: number) => {
    if (percent < 1) return 0;
    if (Math.abs(percent - 100 / 3) < 2) return 1;
    if (Math.abs(percent - 200 / 3) < 2) return 2;
    return null;
  };

  const column = toIndex(x);
  const row = toIndex(y);
  if (column === null || row === null) return null;

  return (Object.keys(SCREEN_POSITIONS) as ScreenName[]).find((screenName) => {
    const position = SCREEN_POSITIONS[screenName];
    return position.column === column && position.row === row;
  }) ?? null;
}

function getScreenFromGeometry(root: HTMLElement): ScreenName | null {
  const rootRect = root.getBoundingClientRect();
  const centerX = rootRect.left + rootRect.width / 2;
  const centerY = rootRect.top + rootRect.height / 2;
  let nearest: { screenName: ScreenName; distance: number } | null = null;

  (Object.keys(SCREEN_POSITIONS) as ScreenName[]).forEach((screenName) => {
    const screen = getScreenElement(screenName, root);
    if (!screen) return;

    const rect = screen.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const distance = Math.hypot(
      rect.left + rect.width / 2 - centerX,
      rect.top + rect.height / 2 - centerY,
    );
    if (!nearest || distance < nearest.distance) nearest = { screenName, distance };
  });

  return nearest?.screenName ?? null;
}

function getScreenFromTarget(target: EventTarget | null): ScreenName | null {
  if (!(target instanceof Element)) return null;

  const screenElement = target.closest<HTMLElement>('[data-mobile-family-tree-screen]');
  const screenName = screenElement?.getAttribute('data-mobile-family-tree-screen');
  return isScreenName(screenName) ? screenName : null;
}

function getCurrentScreen(root = getRoot()): ScreenName | null {
  if (!root) return null;

  // Geometry is the most reliable source after DOM-based transforms because the React
  // active screen can remain stale when navigation is handled by mobile fix scripts.
  return getScreenFromGeometry(root)
    ?? parseTranslatePercent(getStage(root)?.style.transform ?? '')
    ?? (isScreenName(root.getAttribute('data-mobile-family-tree-active-screen'))
      ? root.getAttribute('data-mobile-family-tree-active-screen') as ScreenName
      : null);
}

function descendantCardSelector() {
  return DESCENDANT_KEYS.map((key) => `[data-family-map-color-key="${key}"]`).join(', ');
}

function screenHasContent(screenName: ScreenName, root = getRoot()) {
  if (!root) return false;
  if (screenName === 'core') return true;

  if (screenName === 'descendants') {
    return Boolean(
      getScreenElement('descendants', root)?.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key]')
      || getScreenElement('core', root)?.querySelector(descendantCardSelector())
    );
  }

  return Boolean(
    getScreenElement(screenName, root)?.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key], .mobile-family-stable-empty-uncle-state, .mobile-family-uncle-empty-state')
  );
}

function applyScreen(screenName: ScreenName) {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage) return;

  stage.style.setProperty('transform', getTransformForScreen(screenName), 'important');
  stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  root.setAttribute('data-mobile-family-tree-active-screen', screenName);

  if (screenHasContent(screenName, root)) {
    getScreenElement(screenName, root)
      ?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll], .mobile-family-descendant-screen__scroll')
      .forEach((scrollArea) => scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  }

  window.setTimeout(() => getStage()?.style.removeProperty('transition'), 340);
}

function getScrollArea(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  return target.closest<HTMLElement>([
    '.mobile-family-descendant-screen__scroll',
    '[data-mobile-tree-scroll]',
    '[data-mobile-family-tree-screen="paternal-uncles"] > div',
    '[data-mobile-family-tree-screen="maternal-uncles"] > div',
    '[data-mobile-family-tree-screen="paternal-cousins"] > div',
    '[data-mobile-family-tree-screen="maternal-cousins"] > div',
  ].join(','));
}

function maxScrollTop(scrollArea: HTMLElement | null) {
  if (!scrollArea) return 0;
  return Math.max(0, scrollArea.scrollHeight - scrollArea.clientHeight);
}

function canScrollVertically(scrollArea: HTMLElement | null, deltaY: number) {
  const maxTop = maxScrollTop(scrollArea);
  if (!scrollArea || maxTop <= 1) return false;

  // deltaY < 0: dedo sobe, conteúdo desce.
  if (deltaY < 0) return scrollArea.scrollTop < maxTop - 1;
  // deltaY > 0: dedo desce, conteúdo sobe.
  if (deltaY > 0) return scrollArea.scrollTop > 1;

  return false;
}

function clampScrollTop(value: number, scrollArea: HTMLElement) {
  return Math.min(maxScrollTop(scrollArea), Math.max(0, value));
}

function scrollWithOneFinger(scrollArea: HTMLElement | null, touchDeltaY: number) {
  if (!scrollArea || maxScrollTop(scrollArea) <= 1 || touchDeltaY === 0) return false;

  const nextTop = clampScrollTop(scrollArea.scrollTop - touchDeltaY, scrollArea);
  if (Math.abs(nextTop - scrollArea.scrollTop) < 0.5) return false;

  scrollArea.scrollTop = nextTop;
  return true;
}

function getGestureDirection(deltaX: number, deltaY: number, threshold: number): SwipeDirection | null {
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);

  if (absoluteX >= threshold && absoluteX > absoluteY * 1.2) {
    // Direção do destino na grade: arrastar o dedo para a esquerda abre a tela à direita.
    return deltaX < 0 ? 'right' : 'left';
  }

  if (absoluteY >= threshold && absoluteY > absoluteX * 1.2) {
    // Direção do destino na grade: arrastar o dedo para cima abre a tela abaixo.
    return deltaY < 0 ? 'down' : 'up';
  }

  return null;
}

function getDestination(screenName: ScreenName | null, direction: SwipeDirection) {
  if (!screenName) return null;
  return DESTINATIONS[screenName][direction] ?? null;
}

function consumeGesture(event: TouchEvent) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function keepNativeScroll(event: TouchEvent) {
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function handleTouchStart(event: TouchEvent) {
  if (!isEnabled()) return;
  const target = event.target instanceof Element ? event.target : null;
  const touch = event.touches[0];
  if (!touch || !target?.closest(ROOT_SELECTOR)) return;

  gestureStart = {
    x: touch.clientX,
    y: touch.clientY,
    lastY: touch.clientY,
    screen: getScreenFromTarget(event.target) ?? getCurrentScreen(),
    scrollArea: getScrollArea(event.target),
    handledScroll: false,
  };
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart || !isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - gestureStart.x;
  const deltaY = touch.clientY - gestureStart.y;
  const stepY = touch.clientY - gestureStart.lastY;
  const direction = getGestureDirection(deltaX, deltaY, PREVIEW_THRESHOLD);
  if (!direction) {
    gestureStart.lastY = touch.clientY;
    return;
  }

  const scrollArea = getScrollArea(event.target) ?? gestureStart.scrollArea;
  const destination = getDestination(gestureStart.screen, direction);

  if ((direction === 'up' || direction === 'down') && canScrollVertically(scrollArea, deltaY)) {
    // Em iOS, o scroll nativo em telas transformadas pode exigir dois dedos.
    // Nas telas de primos, fazemos o scroll vertical manualmente com um dedo.
    if (isCousinScreen(gestureStart.screen)) {
      gestureStart.handledScroll = scrollWithOneFinger(scrollArea, stepY) || gestureStart.handledScroll;
      gestureStart.lastY = touch.clientY;
      consumeGesture(event);
      return;
    }

    // Scroll interno ainda tem prioridade. A navegação só assume nos limites.
    keepNativeScroll(event);
    return;
  }

  gestureStart.lastY = touch.clientY;

  // Captura direções permitidas e bloqueadas para impedir fallback do React/script antigo.
  consumeGesture(event);

  // Se não há destino, a direção está bloqueada. Nenhuma prévia visual deve ocorrer.
  if (!destination) return;
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

  if (start.handledScroll) {
    consumeGesture(event);
    return;
  }

  const deltaX = touch.clientX - start.x;
  const deltaY = touch.clientY - start.y;
  const direction = getGestureDirection(deltaX, deltaY, NAVIGATION_THRESHOLD);
  if (!direction) return;

  const scrollArea = getScrollArea(event.target) ?? start.scrollArea;
  if ((direction === 'up' || direction === 'down') && canScrollVertically(scrollArea, deltaY)) {
    keepNativeScroll(event);
    return;
  }

  consumeGesture(event);
  const destination = getDestination(start.screen, direction);
  if (!destination) return;
  applyScreen(destination);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });
}

export {};
