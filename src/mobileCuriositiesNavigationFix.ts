const MOBILE_QUERY = '(max-width: 767px)';
const EXPORT_IGNORE_NAV_SELECTOR = 'nav[data-tree-export-ignore="true"]';
const USER_MENU_SELECTOR = 'div[role="menu"], div.fixed.left-4.right-4.top-20, div[class*="fixed"][class*="top-20"][class*="rounded-3xl"]';
const CURIOSITIES_ROUTE = '/curiosidades';

function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
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

function getMobileBottomNav() {
  const navs = Array.from(document.querySelectorAll<HTMLElement>(EXPORT_IGNORE_NAV_SELECTOR))
    .filter(isVisibleElement);

  return navs.find((nav) => {
    const text = normalizeText(nav.textContent ?? '');
    const rect = nav.getBoundingClientRect();

    return (
      rect.top > window.innerHeight * 0.55 &&
      text.includes('home') &&
      text.includes('calendario') &&
      text.includes('forum') &&
      text.includes('favoritos') &&
      (text.includes('alertas') || text.includes('curiosidades'))
    );
  }) ?? null;
}

function findBottomNavItem(label: string) {
  const bottomNav = getMobileBottomNav();
  if (!bottomNav) return null;

  const normalizedLabel = normalizeText(label);
  return Array.from(bottomNav.querySelectorAll<HTMLElement>('button, a')).find((element) => {
    const text = normalizeText(element.textContent ?? '');
    const ariaLabel = normalizeText(element.getAttribute('aria-label') ?? '');
    return text.includes(normalizedLabel) || ariaLabel.includes(normalizedLabel);
  }) ?? null;
}

function buildSparklesIcon() {
  return `
    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3z"></path>
      <path d="M5 3v4"></path>
      <path d="M3 5h4"></path>
      <path d="M19 17v4"></path>
      <path d="M17 19h4"></path>
    </svg>
  `;
}

function installCuriositiesClick(button: HTMLElement) {
  if (button.dataset.mobileCuriositiesClickInstalled === 'true') return;

  button.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.location.assign(CURIOSITIES_ROUTE);
    },
    { capture: true }
  );

  button.dataset.mobileCuriositiesClickInstalled = 'true';
}

function swapBottomAlertsForCuriosities() {
  const bottomNav = getMobileBottomNav();
  if (!bottomNav) return false;

  const grid = bottomNav.firstElementChild instanceof HTMLElement ? bottomNav.firstElementChild : null;
  if (grid) {
    grid.style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))';
    grid.style.maxWidth = '28rem';
    grid.style.gap = '';
  }

  const button = findBottomNavItem('Curiosidades') ?? findBottomNavItem('Alertas');
  if (!button) return false;

  button.setAttribute('aria-label', 'Abrir curiosidades');
  button.setAttribute('title', 'Curiosidades');
  button.setAttribute('data-tour-target', 'curiosities');
  button.setAttribute('data-mobile-curiosities-nav', 'true');

  const spans = Array.from(button.querySelectorAll<HTMLElement>('span'));
  const labelSpan = spans.reverse().find((span) => normalizeText(span.textContent ?? '').includes('alertas') || normalizeText(span.textContent ?? '').includes('curiosidades'));
  if (labelSpan && labelSpan.textContent !== 'Curiosidades') {
    labelSpan.textContent = 'Curiosidades';
  }

  const iconWrapper = Array.from(button.children).find((child) => child instanceof HTMLElement && child.querySelector('svg')) as HTMLElement | undefined;
  if (iconWrapper) {
    iconWrapper.classList.remove('relative');
    iconWrapper.innerHTML = buildSparklesIcon();
  } else {
    const firstSvg = button.querySelector('svg');
    if (firstSvg) firstSvg.outerHTML = buildSparklesIcon();
  }

  installCuriositiesClick(button);
  return true;
}

function removeRuntimeCuriositiesHeaderButton() {
  const bottomNav = getMobileBottomNav();
  let changed = false;

  document.querySelectorAll<HTMLElement>('[data-first-login-mobile-curiosities-button="true"]').forEach((button) => {
    if (bottomNav?.contains(button)) return;
    button.remove();
    changed = true;
  });

  document.querySelectorAll<HTMLElement>('[data-tour-target="curiosities"]').forEach((element) => {
    if (bottomNav?.contains(element)) return;
    if (element.closest('[data-first-login-tutorial="true"]')) return;
    if (normalizeText(element.textContent ?? '').includes('curiosidades')) {
      const nav = element.closest('nav[data-tree-export-ignore="true"]');
      if (nav && nav !== bottomNav) {
        element.remove();
        changed = true;
      }
    }
  });

  return changed;
}

function exposeCuriositiesInUserMenu() {
  const menus = Array.from(document.querySelectorAll<HTMLElement>(USER_MENU_SELECTOR))
    .filter(isVisibleElement);
  let changed = false;

  menus.forEach((menu) => {
    const curiosityButton = Array.from(menu.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => normalizeText(button.textContent ?? '').includes('curiosidades'));

    if (!curiosityButton) return;

    if (curiosityButton.classList.contains('hidden')) {
      curiosityButton.classList.remove('hidden');
      changed = true;
    }
    curiosityButton.classList.remove('md:flex');
    if (!curiosityButton.classList.contains('flex')) {
      curiosityButton.classList.add('flex');
      changed = true;
    }
    curiosityButton.style.display = 'flex';
  });

  return changed;
}

function applyMobileCuriositiesNavigation() {
  if (!isMobileViewport()) return;

  removeRuntimeCuriositiesHeaderButton();
  swapBottomAlertsForCuriosities();
  exposeCuriositiesInUserMenu();
}

function installMobileCuriositiesNavigationFix() {
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyMobileCuriositiesNavigation();
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

  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  window.addEventListener('focus', schedule, { passive: true });
  document.addEventListener('visibilitychange', schedule, { passive: true });

  [80, 250, 600, 1200].forEach((delay) => window.setTimeout(schedule, delay));
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  installMobileCuriositiesNavigationFix();
}

export {};
