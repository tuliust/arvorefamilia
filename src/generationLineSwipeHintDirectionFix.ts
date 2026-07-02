const MOBILE_QUERY = '(max-width: 767px)';
const GENERATION_LINE_PATH = '/linha-geracional';
const ROOT_SELECTOR = '[data-family-map-horizontal-mobile-root="true"]';
const STAGE_SELECTOR = '[data-mobile-horizontal-stage="true"]';
const HINTS_CLASS = 'mobile-generation-line-swipe-hints';
const VISIBLE_CLASS = 'is-visible';
const STYLE_ID = 'generation-line-swipe-hint-direction-fix-style';

type Direction = 'left' | 'right' | 'down';

const ARROWS: Record<Direction, string> = {
  left: '←',
  right: '→',
  down: '↓',
};

let scheduled = false;

function isMobileGenerationLine() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname.replace(/\/$/, '') === GENERATION_LINE_PATH;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      ${ROOT_SELECTOR} .${HINTS_CLASS}__arrow--down {
        bottom: calc(env(safe-area-inset-bottom, 0px) + 6.85rem);
        left: 50%;
        transform: translateX(-50%);
        animation: generation-line-hint-down 1050ms ease-in-out infinite;
      }

      @keyframes generation-line-hint-down {
        0%, 100% { transform: translate(-50%, 0); opacity: 0.62; }
        50% { transform: translate(-50%, 0.45rem); opacity: 1; }
      }
    }
  `;
  document.head.appendChild(style);
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getActiveGenerationIndex(root: HTMLElement) {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('nav[aria-label^="Gera"] button'));
  if (buttons.length === 0) return { activeIndex: 0, total: 0 };

  const activeIndex = buttons.findIndex((button) => (
    button.getAttribute('aria-current') === 'page'
    || button.getAttribute('aria-pressed') === 'true'
  ));

  return {
    activeIndex: Math.max(0, activeIndex),
    total: buttons.length,
  };
}

function hasBelowContent(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>(STAGE_SELECTOR);
  if (!stage) return false;

  return stage.scrollHeight - stage.scrollTop - stage.clientHeight > 24;
}

function getAvailableDirections(root: HTMLElement): Direction[] {
  const { activeIndex, total } = getActiveGenerationIndex(root);
  const directions: Direction[] = [];

  if (activeIndex > 0) directions.push('left');
  if (total === 0 || activeIndex < total - 1) directions.push('right');
  if (hasBelowContent(root)) directions.push('down');

  return directions;
}

function renderGenerationLineHints(root: HTMLElement) {
  const hints = root.querySelector<HTMLElement>(`.${HINTS_CLASS}`);
  if (!hints || !hints.classList.contains(VISIBLE_CLASS)) return;

  const directions = getAvailableDirections(root);
  hints.innerHTML = directions
    .map((direction) => `<span class="${HINTS_CLASS}__arrow ${HINTS_CLASS}__arrow--${direction}">${ARROWS[direction]}</span>`)
    .join('');
}

function applyFix() {
  if (!isMobileGenerationLine()) return;
  ensureStyles();
  const root = getRoot();
  if (!root) return;
  renderGenerationLineHints(root);
}

function scheduleFix() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyFix();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const observer = new MutationObserver(scheduleFix);
  observer.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  });

  document.addEventListener('scroll', scheduleFix, { passive: true, capture: true });
  document.addEventListener('touchend', scheduleFix, { passive: true, capture: true });
  window.addEventListener('resize', scheduleFix, { passive: true });
  window.addEventListener('orientationchange', scheduleFix, { passive: true });
  window.addEventListener('popstate', scheduleFix, { passive: true });

  [80, 500, 1100, 1700].forEach((delay) => window.setTimeout(scheduleFix, delay));
}

export {};
