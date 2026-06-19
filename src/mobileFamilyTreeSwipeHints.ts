const MOBILE_QUERY = '(max-width: 767px)';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const SCREEN_SELECTOR = '[data-mobile-family-tree-screen]';
const STYLE_ID = 'mobile-family-tree-swipe-hints-style';
const HINTS_CLASS = 'mobile-family-tree-swipe-hints';
const VISIBLE_CLASS = 'is-visible';
const HINT_DELAY_MS = 1000;
const HINT_DURATION_MS = 2000;

type MobileTreeScreen =
  | 'ancestors'
  | 'paternal-uncles'
  | 'core'
  | 'maternal-uncles'
  | 'paternal-cousins'
  | 'descendants'
  | 'maternal-cousins';

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

const DIRECTIONS: SwipeDirection[] = ['up', 'down', 'left', 'right'];

const DESTINATIONS: Record<MobileTreeScreen, Partial<Record<SwipeDirection, MobileTreeScreen>>> = {
  core: { up: 'ancestors', down: 'descendants', left: 'paternal-uncles', right: 'maternal-uncles' },
  descendants: { up: 'core' },
  'paternal-uncles': { up: 'ancestors', down: 'paternal-cousins', right: 'core' },
  'maternal-uncles': { up: 'ancestors', down: 'maternal-cousins', left: 'core' },
  'paternal-cousins': { up: 'paternal-uncles' },
  'maternal-cousins': { up: 'maternal-uncles' },
  ancestors: { down: 'core', left: 'paternal-uncles', right: 'maternal-uncles' },
};

const ARROW_CONTENT: Record<SwipeDirection, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

let activeScreen: MobileTreeScreen | null = null;
let showTimer: number | null = null;
let hideTimer: number | null = null;
let scheduled = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname === '/mapa-familiar';
}

function isMobileTreeScreen(value: string | undefined | null): value is MobileTreeScreen {
  return Boolean(value && value in DESTINATIONS);
}

function clearHintTimers() {
  if (showTimer !== null) {
    window.clearTimeout(showTimer);
    showTimer = null;
  }

  if (hideTimer !== null) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${ROOT_SELECTOR} .${HINTS_CLASS} {
        position: absolute;
        inset: 0;
        z-index: 90;
        pointer-events: none;
        opacity: 0;
        transition: opacity 220ms ease;
      }

      ${ROOT_SELECTOR} .${HINTS_CLASS}.${VISIBLE_CLASS} {
        opacity: 1;
      }

      ${ROOT_SELECTOR} .${HINTS_CLASS}__arrow {
        position: absolute;
        display: none;
        width: 2rem;
        height: 2rem;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        background: rgba(15, 23, 42, 0.72);
        color: #fff;
        font-size: 1.15rem;
        font-weight: 900;
        line-height: 1;
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.2);
        opacity: 0.88;
        will-change: transform, opacity;
      }

      ${ROOT_SELECTOR} .${HINTS_CLASS}.${VISIBLE_CLASS} .${HINTS_CLASS}__arrow {
        display: flex;
      }

      ${ROOT_SELECTOR} .${HINTS_CLASS}__arrow--up {
        top: 4.9rem;
        left: 50%;
        transform: translateX(-50%);
        animation: mobile-family-tree-hint-up 1050ms ease-in-out infinite;
      }

      ${ROOT_SELECTOR} .${HINTS_CLASS}__arrow--down {
        bottom: calc(env(safe-area-inset-bottom, 0px) + 6.75rem);
        left: 50%;
        transform: translateX(-50%);
        animation: mobile-family-tree-hint-down 1050ms ease-in-out infinite;
      }

      ${ROOT_SELECTOR} .${HINTS_CLASS}__arrow--left {
        top: 50%;
        left: 0.75rem;
        transform: translateY(-50%);
        animation: mobile-family-tree-hint-left 1050ms ease-in-out infinite;
      }

      ${ROOT_SELECTOR} .${HINTS_CLASS}__arrow--right {
        top: 50%;
        right: 0.75rem;
        transform: translateY(-50%);
        animation: mobile-family-tree-hint-right 1050ms ease-in-out infinite;
      }

      @keyframes mobile-family-tree-hint-up {
        0%, 100% { transform: translate(-50%, 0); opacity: 0.62; }
        50% { transform: translate(-50%, -0.45rem); opacity: 1; }
      }

      @keyframes mobile-family-tree-hint-down {
        0%, 100% { transform: translate(-50%, 0); opacity: 0.62; }
        50% { transform: translate(-50%, 0.45rem); opacity: 1; }
      }

      @keyframes mobile-family-tree-hint-left {
        0%, 100% { transform: translate(0, -50%); opacity: 0.62; }
        50% { transform: translate(-0.45rem, -50%); opacity: 1; }
      }

      @keyframes mobile-family-tree-hint-right {
        0%, 100% { transform: translate(0, -50%); opacity: 0.62; }
        50% { transform: translate(0.45rem, -50%); opacity: 1; }
      }
    }
  `;
  document.head.appendChild(style);
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getHintsElement(root: HTMLElement) {
  let hints = root.querySelector<HTMLElement>(`.${HINTS_CLASS}`);
  if (hints) return hints;

  hints = document.createElement('div');
  hints.className = HINTS_CLASS;
  hints.setAttribute('aria-hidden', 'true');
  hints.setAttribute('data-tree-export-ignore', 'true');
  root.appendChild(hints);
  return hints;
}

function hideHints(root = getRoot()) {
  root?.querySelector<HTMLElement>(`.${HINTS_CLASS}`)?.classList.remove(VISIBLE_CLASS);
}

function hasDescendantContent(root: HTMLElement) {
  return Boolean(root.querySelector(
    '[data-mobile-family-tree-screen="core"] [data-family-map-color-key="irmaos"], [data-mobile-family-tree-screen="core"] [data-family-map-color-key="sobrinhos"], [data-mobile-family-tree-screen="core"] [data-family-map-color-key="conjuge"], [data-mobile-family-tree-screen="core"] [data-family-map-color-key="pets"], [data-mobile-family-tree-screen="core"] [data-family-map-color-key="filhos"], [data-mobile-family-tree-screen="core"] [data-family-map-color-key="netos"]'
  ));
}

function getVisibleScreen(root: HTMLElement): MobileTreeScreen | null {
  const explicitScreen = root.getAttribute('data-mobile-family-tree-active-screen');
  if (isMobileTreeScreen(explicitScreen)) return explicitScreen;

  const rootRect = root.getBoundingClientRect();
  const centerX = rootRect.left + rootRect.width / 2;
  const centerY = rootRect.top + rootRect.height / 2;
  let nearest: { screen: MobileTreeScreen; distance: number } | null = null;

  root.querySelectorAll<HTMLElement>(SCREEN_SELECTOR).forEach((screenElement) => {
    const screenName = screenElement.dataset.mobileFamilyTreeScreen;
    if (!isMobileTreeScreen(screenName)) return;

    const rect = screenElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const screenCenterX = rect.left + rect.width / 2;
    const screenCenterY = rect.top + rect.height / 2;
    const distance = Math.hypot(screenCenterX - centerX, screenCenterY - centerY);

    if (!nearest || distance < nearest.distance) {
      nearest = { screen: screenName, distance };
    }
  });

  return nearest?.screen ?? null;
}

function screenHasContent(root: HTMLElement, screenName: MobileTreeScreen) {
  if (screenName === 'core') return true;
  if (screenName === 'descendants') return hasDescendantContent(root);

  const screenElement = root.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`);
  if (!screenElement) return false;

  return Boolean(
    screenElement.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key]')
  );
}

function getAvailableDirections(root: HTMLElement, screenName: MobileTreeScreen) {
  const destinations = DESTINATIONS[screenName];

  return DIRECTIONS.filter((direction) => {
    const destination = destinations[direction];
    return Boolean(destination && screenHasContent(root, destination));
  });
}

function renderHints(root: HTMLElement, directions: SwipeDirection[]) {
  const hints = getHintsElement(root);
  const directionSet = new Set(directions);

  hints.innerHTML = DIRECTIONS
    .filter((direction) => directionSet.has(direction))
    .map((direction) => `<span class="${HINTS_CLASS}__arrow ${HINTS_CLASS}__arrow--${direction}">${ARROW_CONTENT[direction]}</span>`)
    .join('');

  hints.classList.add(VISIBLE_CLASS);
}

function scheduleHintsForScreen(root: HTMLElement, screenName: MobileTreeScreen) {
  clearHintTimers();
  hideHints(root);

  const directions = getAvailableDirections(root, screenName);
  if (directions.length === 0) return;

  showTimer = window.setTimeout(() => {
    const currentRoot = getRoot();
    if (!currentRoot) return;

    const currentScreen = getVisibleScreen(currentRoot);
    if (currentScreen !== screenName) return;

    renderHints(currentRoot, getAvailableDirections(currentRoot, currentScreen));

    hideTimer = window.setTimeout(() => {
      hideHints(currentRoot);
    }, HINT_DURATION_MS);
  }, HINT_DELAY_MS);
}

function updateSwipeHints() {
  if (!isMobileViewport() || !isFamilyMapPath()) {
    clearHintTimers();
    hideHints();
    activeScreen = null;
    return;
  }

  ensureStyles();

  const root = getRoot();
  if (!root) {
    clearHintTimers();
    activeScreen = null;
    return;
  }

  const currentScreen = getVisibleScreen(root);
  if (!currentScreen) return;

  if (currentScreen !== activeScreen) {
    activeScreen = currentScreen;
    scheduleHintsForScreen(root, currentScreen);
  }
}

function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;

  window.requestAnimationFrame(() => {
    scheduled = false;
    updateSwipeHints();
  });
}

function resetAfterUserInteraction() {
  const root = getRoot();
  clearHintTimers();
  hideHints(root);

  window.setTimeout(() => {
    const currentRoot = getRoot();
    if (!currentRoot || !isMobileViewport() || !isFamilyMapPath()) return;

    const currentScreen = getVisibleScreen(currentRoot);
    if (!currentScreen) return;

    activeScreen = currentScreen;
    scheduleHintsForScreen(currentRoot, currentScreen);
  }, 360);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const observer = new MutationObserver(scheduleUpdate);

  observer.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  document.addEventListener('touchstart', resetAfterUserInteraction, { passive: true, capture: true });
  document.addEventListener('touchend', resetAfterUserInteraction, { passive: true, capture: true });
  document.addEventListener('scroll', scheduleUpdate, { passive: true, capture: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('orientationchange', scheduleUpdate, { passive: true });
  window.addEventListener('focus', scheduleUpdate, { passive: true });

  [80, 500, 1100].forEach((delay) => window.setTimeout(scheduleUpdate, delay));
}

export {};
