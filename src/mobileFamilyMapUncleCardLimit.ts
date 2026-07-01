const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const CARD_SELECTOR = '[data-family-map-mobile-card="true"]';
const NATIVE_TOGGLE_SELECTOR = 'button:not([data-family-map-mobile-card="true"]):not([data-mobile-family-tree-uncle-limit-toggle="true"])';
const STYLE_ID = 'mobile-family-map-uncle-card-limit-style';
const CARD_LIMIT = 8;
const UNCLE_SCREENS = ['paternal-uncles', 'maternal-uncles'] as const;
const UNCLE_SCREEN_SELECTOR = '[data-mobile-family-tree-screen="paternal-uncles"], [data-mobile-family-tree-screen="maternal-uncles"]';

type UncleScreenName = typeof UNCLE_SCREENS[number];

let scheduled = false;
let nativeExpansionClickAllowed = false;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isFamilyMapPath() {
  return typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function isEnabled() {
  return isMobileViewport() && isFamilyMapPath();
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getScreen(screenName: UncleScreenName, root = getRoot()) {
  return root?.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`) ?? null;
}

function getCards(screen: HTMLElement) {
  return Array.from(screen.querySelectorAll<HTMLElement>(CARD_SELECTOR));
}

function getNativeToggle(screen: HTMLElement) {
  return Array.from(screen.querySelectorAll<HTMLButtonElement>(NATIVE_TOGGLE_SELECTOR))
    .find((button) => {
      const text = (button.textContent ?? '').trim().toLowerCase();
      return text.includes('ver todos') || text.includes('mostrar menos');
    }) ?? null;
}

function isNativeUncleToggle(button: HTMLButtonElement) {
  if (button.hasAttribute('data-mobile-family-tree-uncle-limit-toggle')) return false;
  if (!button.closest(UNCLE_SCREEN_SELECTOR)) return false;

  const text = (button.textContent ?? '').trim().toLowerCase();
  return text.includes('ver todos') || text.includes('mostrar menos');
}

function getGroupPanel(screen: HTMLElement) {
  const firstCard = getCards(screen)[0];
  const grid = firstCard?.parentElement;
  const panel = grid?.parentElement;
  return panel instanceof HTMLElement ? panel : null;
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      [data-mobile-family-tree-screen="paternal-uncles"] [data-mobile-family-tree-uncle-hidden="true"],
      [data-mobile-family-tree-screen="maternal-uncles"] [data-mobile-family-tree-uncle-hidden="true"],
      [data-mobile-family-tree-native-uncle-toggle="true"] {
        display: none !important;
      }

      .mobile-family-uncle-limit-toggle {
        appearance: none !important;
        display: flex !important;
        width: 2.45rem !important;
        height: 2.45rem !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0.7rem auto 0 !important;
        border: 1px solid rgb(14, 116, 144) !important;
        border-radius: 9999px !important;
        background: rgb(14, 116, 144) !important;
        color: #fff !important;
        font: inherit !important;
        font-size: 1.35rem !important;
        font-weight: 900 !important;
        line-height: 1 !important;
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.16) !important;
        touch-action: manipulation !important;
      }

      .mobile-family-uncle-limit-toggle:active {
        transform: scale(0.97) !important;
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

function setAttributeIfChanged(element: HTMLElement, name: string, value: string) {
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function removeAttributeIfPresent(element: HTMLElement, name: string) {
  if (element.hasAttribute(name)) element.removeAttribute(name);
}

function ensureReactGroupIsExpanded(screen: HTMLElement) {
  const nativeToggle = getNativeToggle(screen);
  if (!nativeToggle) return false;

  setAttributeIfChanged(nativeToggle, 'data-mobile-family-tree-native-uncle-toggle', 'true');

  const text = (nativeToggle.textContent ?? '').trim().toLowerCase();
  if (!text.includes('ver todos')) return false;
  if (screen.dataset.mobileFamilyTreeUncleNativeExpanded === 'true') return false;

  screen.dataset.mobileFamilyTreeUncleNativeExpanded = 'true';
  nativeExpansionClickAllowed = true;
  try {
    nativeToggle.click();
  } finally {
    nativeExpansionClickAllowed = false;
  }
  return true;
}

function getOrCreateToggle(panel: HTMLElement) {
  let button = panel.querySelector<HTMLButtonElement>('[data-mobile-family-tree-uncle-limit-toggle="true"]');
  if (button) return button;

  button = document.createElement('button');
  button.type = 'button';
  button.className = 'mobile-family-uncle-limit-toggle';
  button.setAttribute('data-mobile-family-tree-uncle-limit-toggle', 'true');
  button.setAttribute('data-tree-export-ignore', 'true');
  panel.appendChild(button);
  return button;
}

function removeToggle(screen: HTMLElement) {
  screen.querySelector<HTMLButtonElement>('[data-mobile-family-tree-uncle-limit-toggle="true"]')?.remove();
}

function applyLimitToScreen(screenName: UncleScreenName, root: HTMLElement) {
  const screen = getScreen(screenName, root);
  if (!screen) return;

  setAttributeIfChanged(screen, 'data-mobile-family-tree-uncle-limit-managed', 'true');
  ensureReactGroupIsExpanded(screen);

  const cards = getCards(screen);
  if (cards.length <= CARD_LIMIT) {
    cards.forEach((card) => removeAttributeIfPresent(card, 'data-mobile-family-tree-uncle-hidden'));
    removeToggle(screen);
    return;
  }

  const expanded = screen.dataset.mobileFamilyTreeUncleLimitExpanded === 'true';
  cards.forEach((card, index) => {
    if (!expanded && index >= CARD_LIMIT) setAttributeIfChanged(card, 'data-mobile-family-tree-uncle-hidden', 'true');
    else removeAttributeIfPresent(card, 'data-mobile-family-tree-uncle-hidden');
  });

  const panel = getGroupPanel(screen);
  if (!panel) return;

  const button = getOrCreateToggle(panel);
  const text = expanded ? '−' : '+';
  if (button.textContent !== text) button.textContent = text;
  setAttributeIfChanged(
    button,
    'aria-label',
    expanded
      ? `Ocultar cards adicionais de ${screenName === 'paternal-uncles' ? 'tios paternos' : 'tios maternos'}`
      : `Exibir mais ${cards.length - CARD_LIMIT} cards de ${screenName === 'paternal-uncles' ? 'tios paternos' : 'tios maternos'}`,
  );
  button.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    screen.dataset.mobileFamilyTreeUncleLimitExpanded = expanded ? 'false' : 'true';
    applyLimitToScreen(screenName, root);
  };
}

function applyLimits() {
  if (!isEnabled()) return;
  const root = getRoot();
  if (!root) return;

  ensureStyles();
  UNCLE_SCREENS.forEach((screenName) => applyLimitToScreen(screenName, root));
}

function scheduleApplyLimits() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyLimits();
  });
}

function handleNativeUncleToggleClick(event: Event) {
  if (!isEnabled()) return;
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest<HTMLButtonElement>('button');
  if (!button || !isNativeUncleToggle(button)) return;
  if (nativeExpansionClickAllowed) return;

  event.preventDefault();
  event.stopPropagation();
  if ('stopImmediatePropagation' in event) event.stopImmediatePropagation();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('click', handleNativeUncleToggleClick, { capture: true });
  applyLimits();
  [80, 240, 520, 1000, 1800].forEach((delay) => window.setTimeout(applyLimits, delay));

  const observer = new MutationObserver(scheduleApplyLimits);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', applyLimits, { passive: true });
  window.addEventListener('orientationchange', applyLimits, { passive: true });
  document.addEventListener('visibilitychange', applyLimits, { passive: true });
}

export {};
