const MOBILE_BREAKPOINT_QUERY = '(max-width: 767px)';
const FIRST_LOGIN_TUTORIAL_SELECTOR = '[data-first-login-tutorial="true"]';
const FIRST_LOGIN_TUTORIAL_TITLE_SELECTOR = '#first-login-tutorial-title';
const FIRST_LOGIN_TUTORIAL_PANEL_SELECTOR = `${FIRST_LOGIN_TUTORIAL_SELECTOR} > section`;
const MOBILE_MAIN_CARD_SELECTOR = '[data-mobile-family-tree-root="true"] [data-family-map-mobile-card="true"][data-family-map-color-key="central"]';
const MOBILE_BOTTOM_NAV_SELECTOR = 'nav[data-tree-export-ignore="true"]';
const MOBILE_BOTTOM_NAV_GRID_SELECTOR = `${MOBILE_BOTTOM_NAV_SELECTOR} > div`;
const MOBILE_BOTTOM_NAV_ITEM_SELECTOR = `${MOBILE_BOTTOM_NAV_SELECTOR} button, ${MOBILE_BOTTOM_NAV_SELECTOR} a`;
const RUNTIME_CURIOSITIES_BUTTON_SELECTOR = '[data-first-login-mobile-curiosities-button="true"]';

function isMobileViewport() {
  return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isVisibleElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
}

function getTutorialTitle() {
  return document
    .querySelector<HTMLElement>(FIRST_LOGIN_TUTORIAL_TITLE_SELECTOR)
    ?.textContent
    ?.trim() ?? '';
}

function getTutorialPanel() {
  return document.querySelector<HTMLElement>(FIRST_LOGIN_TUTORIAL_PANEL_SELECTOR);
}

function getMainMobilePersonCard() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>(MOBILE_MAIN_CARD_SELECTOR))
    .filter(isVisibleElement)
    .sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      return rectB.width * rectB.height - rectA.width * rectA.height;
    });

  return cards[0] ?? null;
}

function syncMainMobilePersonCardTarget() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>(MOBILE_MAIN_CARD_SELECTOR));
  const targetCard = getMainMobilePersonCard();
  let changed = false;

  cards.forEach((card) => {
    const shouldMark = card === targetCard;
    const currentCentral = card.getAttribute('data-family-map-central-card');
    const currentMain = card.getAttribute('data-family-map-mobile-main-card');

    if (shouldMark) {
      if (currentCentral !== 'true') {
        card.setAttribute('data-family-map-central-card', 'true');
        changed = true;
      }
      if (currentMain !== 'true') {
        card.setAttribute('data-family-map-mobile-main-card', 'true');
        changed = true;
      }
      return;
    }

    if (currentMain === 'true') {
      card.removeAttribute('data-family-map-mobile-main-card');
      changed = true;
    }
  });

  return changed;
}

function findBottomNavItemByText(label: string) {
  const normalizedLabel = normalizeText(label);

  return Array.from(document.querySelectorAll<HTMLElement>(MOBILE_BOTTOM_NAV_ITEM_SELECTOR))
    .filter(isVisibleElement)
    .find((element) => {
      const text = normalizeText(element.textContent ?? '');
      const ariaLabel = normalizeText(element.getAttribute('aria-label') ?? '');
      return text === normalizedLabel || ariaLabel.includes(normalizedLabel);
    }) ?? null;
}

function createCuriositiesButton(referenceButton: HTMLElement | null) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = referenceButton?.className || 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition active:bg-gray-100';
  button.setAttribute('aria-label', 'Abrir curiosidades');
  button.setAttribute('data-tour-target', 'curiosities');
  button.setAttribute('data-first-login-mobile-curiosities-button', 'true');
  button.innerHTML = `
    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3z"></path>
      <path d="M5 3v4"></path>
      <path d="M3 5h4"></path>
      <path d="M19 17v4"></path>
      <path d="M17 19h4"></path>
    </svg>
    <span>Curiosidades</span>
  `;
  button.addEventListener('click', () => {
    window.location.assign('/curiosidades');
  });

  return button;
}

function ensureCuriositiesBottomNavButton() {
  const grid = document.querySelector<HTMLElement>(MOBILE_BOTTOM_NAV_GRID_SELECTOR);
  if (!grid || !isVisibleElement(grid)) return false;

  grid.style.gridTemplateColumns = 'repeat(6, minmax(0, 1fr))';
  grid.style.maxWidth = 'min(100%, 28rem)';
  grid.style.gap = '0.18rem';

  const existing = document.querySelector<HTMLElement>(RUNTIME_CURIOSITIES_BUTTON_SELECTOR);
  const forumButton = findBottomNavItemByText('Fórum');
  const referenceButton = forumButton || findBottomNavItemByText('Calendário');

  if (existing) {
    if (existing.getAttribute('data-tour-target') !== 'curiosities') {
      existing.setAttribute('data-tour-target', 'curiosities');
      return true;
    }
    return false;
  }

  const button = createCuriositiesButton(referenceButton);
  if (forumButton?.parentElement === grid) {
    grid.insertBefore(button, forumButton);
  } else {
    grid.appendChild(button);
  }

  return true;
}

function syncForumBottomNavTarget() {
  const target = findBottomNavItemByText('Fórum');
  let changed = false;

  document.querySelectorAll<HTMLElement>('[data-first-login-mobile-forum-target="true"]').forEach((element) => {
    if (element === target) return;
    element.removeAttribute('data-first-login-mobile-forum-target');
    if (element.getAttribute('data-tour-target') === 'forum') {
      element.removeAttribute('data-tour-target');
    }
    changed = true;
  });

  if (target) {
    if (target.getAttribute('data-tour-target') !== 'forum') {
      target.setAttribute('data-tour-target', 'forum');
      changed = true;
    }
    if (target.getAttribute('data-first-login-mobile-forum-target') !== 'true') {
      target.setAttribute('data-first-login-mobile-forum-target', 'true');
      changed = true;
    }
  }

  return changed;
}

function scrollMainMobilePersonCardIntoView() {
  const card = getMainMobilePersonCard();
  if (!card) return false;

  const rect = card.getBoundingClientRect();
  const shouldScroll = rect.top < 150 || rect.bottom > window.innerHeight - 160;

  if (!shouldScroll) return false;

  card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
  return true;
}

function centerTutorialPanel() {
  const panel = getTutorialPanel();
  if (!panel) return;

  const viewportMargin = 14;
  const width = Math.min(330, window.innerWidth - viewportMargin * 2);
  panel.style.width = `${width}px`;

  const rect = panel.getBoundingClientRect();
  const height = Math.min(rect.height || 228, window.innerHeight - viewportMargin * 2);
  const left = clamp((window.innerWidth - width) / 2, viewportMargin, window.innerWidth - width - viewportMargin);
  const top = clamp((window.innerHeight - height) / 2, viewportMargin, window.innerHeight - height - viewportMargin);

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

function requestTutorialLayoutRefresh() {
  window.requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
  });
}

function syncFirstLoginMobileTutorial() {
  if (!isMobileViewport()) return;

  const changedTargets =
    syncMainMobilePersonCardTarget() ||
    ensureCuriositiesBottomNavButton() ||
    syncForumBottomNavTarget();
  const title = getTutorialTitle();
  const normalizedTitle = normalizeText(title);

  if (changedTargets) {
    requestTutorialLayoutRefresh();
  }

  if (normalizedTitle.includes('cards de pessoas') || normalizedTitle.includes('perfis')) {
    if (scrollMainMobilePersonCardIntoView()) {
      requestTutorialLayoutRefresh();
    }
  }

  if (normalizedTitle.includes('curiosidades') || normalizedTitle.includes('forum da familia')) {
    centerTutorialPanel();
  }
}

function installFirstLoginMobileTutorialFixes() {
  let scheduled = false;

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      syncFirstLoginMobileTutorial();
    });
  };

  schedule();

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  });

  window.addEventListener('resize', schedule);
  window.addEventListener('scroll', schedule, true);

  [80, 250, 600, 1200].forEach((delay) => window.setTimeout(schedule, delay));
}

if (typeof window !== 'undefined') {
  installFirstLoginMobileTutorialFixes();
}

export {};
