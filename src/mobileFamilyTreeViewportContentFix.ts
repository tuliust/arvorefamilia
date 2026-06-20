const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const STAGE_SELECTOR = '[data-mobile-family-tree-stage="true"]';
const STYLE_ID = 'mobile-family-tree-viewport-content-fix-style';
const NAVIGATION_THRESHOLD = 56;
const PREVIEW_THRESHOLD = 6;

type MobileTreeScreen =
  | 'paternal-ancestors'
  | 'ancestors'
  | 'maternal-ancestors'
  | 'paternal-uncles'
  | 'core'
  | 'maternal-uncles'
  | 'paternal-cousins'
  | 'descendants'
  | 'maternal-cousins';

type GestureStart = {
  x: number;
  y: number;
  screen: MobileTreeScreen | null;
  scrollArea: HTMLElement | null;
};

const SCREEN_POSITIONS: Record<MobileTreeScreen, { column: number; row: number }> = {
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

const UNCLE_TITLES: Partial<Record<MobileTreeScreen, string>> = {
  'paternal-uncles': 'Tios Paternos',
  'maternal-uncles': 'Tios Maternos',
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

function isEnabled() {
  return isMobileViewport() && isFamilyMapPath() && Boolean(getRoot());
}

function isMobileTreeScreen(value: string | null | undefined): value is MobileTreeScreen {
  return Boolean(value && value in SCREEN_POSITIONS);
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getStage(root = getRoot()) {
  return root?.querySelector<HTMLElement>(STAGE_SELECTOR) ?? null;
}

function getScreenElement(screenName: MobileTreeScreen, root = getRoot()) {
  return root?.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`) ?? null;
}

function getScrollArea(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  return target.closest<HTMLElement>([
    '.mobile-family-descendant-screen__scroll',
    '[data-mobile-family-tree-uncle-scroll="true"]',
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

function hasScrollableOverflow(scrollArea: HTMLElement | null) {
  return maxScrollTop(scrollArea) > 1;
}

function canScrollVertically(scrollArea: HTMLElement | null, deltaY: number) {
  const maxTop = maxScrollTop(scrollArea);
  if (!scrollArea || maxTop <= 1) return false;

  // deltaY < 0: dedo sobe, conteúdo deve descer.
  if (deltaY < 0) return scrollArea.scrollTop < maxTop - 1;
  // deltaY > 0: dedo desce, conteúdo deve subir.
  if (deltaY > 0) return scrollArea.scrollTop > 1;

  return false;
}

function isAtTop(scrollArea: HTMLElement | null) {
  return !scrollArea || scrollArea.scrollTop <= 1;
}

function isAtBottom(scrollArea: HTMLElement | null) {
  return !scrollArea || scrollArea.scrollTop >= maxScrollTop(scrollArea) - 1;
}

function parseTranslatePercent(value: string) {
  const match = value.match(/translate3d\(calc\((-?\d+(?:\.\d+)?)%[^,]*,\s*calc\((-?\d+(?:\.\d+)?)%/);
  if (!match) return null;

  const x = Number(match[1]);
  const y = Number(match[2]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const toIndex = (percent: number) => {
    const absolute = Math.abs(percent);
    if (absolute < 1) return 0;
    if (Math.abs(absolute - 100 / 3) < 2) return 1;
    if (Math.abs(absolute - 200 / 3) < 2) return 2;
    return null;
  };

  const column = toIndex(x);
  const row = toIndex(y);
  if (column === null || row === null) return null;
  return { column, row };
}

function getScreenFromStageTransform(root: HTMLElement): MobileTreeScreen | null {
  const transform = getStage(root)?.style.transform ?? '';
  const position = parseTranslatePercent(transform);
  if (!position) return null;

  return (Object.keys(SCREEN_POSITIONS) as MobileTreeScreen[]).find((screenName) => {
    const screenPosition = SCREEN_POSITIONS[screenName];
    return screenPosition.column === position.column && screenPosition.row === position.row;
  }) ?? null;
}

function getCurrentScreen(root = getRoot()): MobileTreeScreen | null {
  if (!root) return null;

  const explicitScreen = root.getAttribute('data-mobile-family-tree-active-screen');
  if (isMobileTreeScreen(explicitScreen)) return explicitScreen;

  return getScreenFromStageTransform(root);
}

function getTransformForScreen(screenName: MobileTreeScreen) {
  const { column, row } = SCREEN_POSITIONS[screenName];
  const x = column === 0 ? 0 : -(column * 100) / 3;
  const y = row === 0 ? 0 : -(row * 100) / 3;

  return `translate3d(calc(${x}% + 0px), calc(${y}% + 0px), 0)`;
}

function descendantSourceSelector() {
  return [
    'irmaos',
    'sobrinhos',
    'conjuge',
    'pets',
    'filhos',
    'netos',
  ].map((key) => `[data-family-map-color-key="${key}"]`).join(', ');
}

function screenHasContent(screenName: MobileTreeScreen, root = getRoot()) {
  if (!root) return false;
  if (screenName === 'core') return true;

  if (screenName === 'descendants') {
    return Boolean(
      getScreenElement('descendants', root)?.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key]')
      || getScreenElement('core', root)?.querySelector(descendantSourceSelector())
    );
  }

  return Boolean(
    getScreenElement(screenName, root)?.querySelector('[data-family-map-mobile-card="true"], button[data-family-map-color-key], .mobile-family-uncle-empty-state')
  );
}

function scrollScreenToTop(screenName: MobileTreeScreen, root = getRoot()) {
  getScreenElement(screenName, root)?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll], .mobile-family-descendant-screen__scroll')
    .forEach((scrollArea) => {
      scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
}

function applyScreen(screenName: MobileTreeScreen, animate = true) {
  const root = getRoot();
  const stage = getStage(root);
  if (!root || !stage || !screenHasContent(screenName, root)) return;

  stage.style.setProperty('transform', getTransformForScreen(screenName), 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');

  root.setAttribute('data-mobile-family-tree-active-screen', screenName);
  scrollScreenToTop(screenName, root);

  if (animate) {
    window.setTimeout(() => {
      getStage()?.style.removeProperty('transition');
    }, 340);
  }
}

function stopBeforeGlobalSwipe(event: TouchEvent) {
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function takeOverGesture(event: TouchEvent, screenName: MobileTreeScreen) {
  event.preventDefault();
  stopBeforeGlobalSwipe(event);
  applyScreen(screenName);
}

function ensureStyles() {
  if (typeof document === 'undefined') return;

  const css = `
    @media (max-width: 767px) {
      .mobile-family-descendant-screen {
        overflow: hidden !important;
      }

      .mobile-family-descendant-screen__scroll {
        display: block !important;
        height: 100% !important;
        max-height: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior-y: contain !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
        padding: 0.75rem 1rem calc(env(safe-area-inset-bottom, 0px) + 10rem) !important;
        scroll-padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 10rem) !important;
      }

      .mobile-family-descendant-screen__inner {
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        justify-content: flex-start !important;
        width: min(calc(100vw - 2rem), 430px) !important;
        max-width: min(calc(100vw - 2rem), 430px) !important;
        min-height: 0 !important;
        height: auto !important;
        margin: 0 auto !important;
        overflow: visible !important;
        padding: 0 0 2rem !important;
      }

      .mobile-family-descendant-screen__connector {
        flex: 0 0 auto !important;
        width: 100% !important;
        margin: 0 auto !important;
      }

      .mobile-family-descendant-screen__grid {
        flex: 0 0 auto !important;
        width: 100% !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"],
      [data-mobile-family-tree-screen="maternal-uncles"] {
        position: relative !important;
        overflow: hidden !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] > div,
      [data-mobile-family-tree-screen="maternal-uncles"] > div {
        box-sizing: border-box !important;
        position: absolute !important;
        inset: 0 !important;
        display: block !important;
        height: 100% !important;
        width: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior-y: contain !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
        padding: clamp(2.25rem, 7vh, 4.5rem) 0.75rem calc(env(safe-area-inset-bottom, 0px) + 8.5rem) !important;
        scroll-padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8.5rem) !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] > div > div[class*="z-10"],
      [data-mobile-family-tree-screen="maternal-uncles"] > div > div[class*="z-10"] {
        box-sizing: border-box !important;
        display: flex !important;
        width: min(calc(100vw - 2rem), 354px) !important;
        max-width: min(calc(100vw - 2rem), 354px) !important;
        min-height: 0 !important;
        height: auto !important;
        align-items: flex-start !important;
        justify-content: center !important;
        margin: 0 auto !important;
        padding: 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] > div > div[class*="z-10"] > div,
      [data-mobile-family-tree-screen="maternal-uncles"] > div > div[class*="z-10"] > div {
        width: 100% !important;
        min-width: 0 !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section,
      [data-mobile-family-tree-screen="maternal-uncles"] section {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        margin-inline: auto !important;
        padding: 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section[data-family-map-card-count="1"],
      [data-mobile-family-tree-screen="maternal-uncles"] section[data-family-map-card-count="1"] {
        width: min(100%, 178px) !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section[data-family-map-card-count="2"],
      [data-mobile-family-tree-screen="paternal-uncles"] section[data-family-map-card-count="3"],
      [data-mobile-family-tree-screen="maternal-uncles"] section[data-family-map-card-count="2"],
      [data-mobile-family-tree-screen="maternal-uncles"] section[data-family-map-card-count="3"] {
        width: min(100%, 354px) !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section > div,
      [data-mobile-family-tree-screen="maternal-uncles"] section > div {
        box-sizing: border-box !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
        border-radius: 1.25rem !important;
        padding: 0.65rem !important;
        opacity: 1 !important;
        visibility: visible !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section h2,
      [data-mobile-family-tree-screen="maternal-uncles"] section h2,
      .mobile-family-uncle-empty-title {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        margin: 0 0 0.625rem !important;
        overflow: visible !important;
        color: #0f172a !important;
        -webkit-text-fill-color: #0f172a !important;
        text-align: center !important;
        text-shadow: none !important;
        font-size: 0.75rem !important;
        line-height: 1.15 !important;
        font-weight: 800 !important;
        letter-spacing: 0.07em !important;
        text-transform: uppercase !important;
        white-space: nowrap !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section h2 + div,
      [data-mobile-family-tree-screen="maternal-uncles"] section h2 + div {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        align-items: stretch !important;
        align-content: start !important;
        gap: 0.625rem !important;
        min-height: 0 !important;
        overflow: visible !important;
      }

      [data-mobile-family-tree-screen="paternal-uncles"] section[data-family-map-card-count="1"] h2 + div,
      [data-mobile-family-tree-screen="maternal-uncles"] section[data-family-map-card-count="1"] h2 + div {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      .mobile-family-uncle-empty-section {
        box-sizing: border-box !important;
        width: 100% !important;
        border-radius: 1.25rem !important;
        border: 1px solid rgba(203, 213, 225, 0.9) !important;
        background: #ffffff !important;
        padding: 0.75rem !important;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08) !important;
      }

      .mobile-family-uncle-empty-state {
        box-sizing: border-box !important;
        width: 100% !important;
        border: 1px dashed #cbd5e1 !important;
        border-radius: 1rem !important;
        background: rgba(248, 250, 252, 0.96) !important;
        padding: 0.9rem !important;
        color: #64748b !important;
        font-size: 0.8125rem !important;
        font-weight: 700 !important;
        line-height: 1.35 !important;
        text-align: center !important;
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

function markUncleScreens() {
  if (!isEnabled()) return;

  (['paternal-uncles', 'maternal-uncles'] as MobileTreeScreen[]).forEach((screenName) => {
    const screen = getScreenElement(screenName);
    const title = UNCLE_TITLES[screenName];
    if (!screen || !title) return;

    const scrollArea = screen.querySelector<HTMLElement>(':scope > div');
    scrollArea?.setAttribute('data-mobile-tree-scroll', 'true');
    scrollArea?.setAttribute('data-mobile-family-tree-uncle-scroll', 'true');

    screen.querySelectorAll<HTMLElement>('section').forEach((section) => {
      const cardCount = section.querySelectorAll('[data-family-map-mobile-card="true"]').length;
      section.setAttribute('data-family-map-card-count', String(cardCount));

      const heading = section.querySelector<HTMLElement>('h2');
      if (heading && heading.textContent?.trim() !== title) heading.textContent = title;
      heading?.setAttribute('aria-label', title);
    });

    const hasCards = Boolean(screen.querySelector('[data-family-map-mobile-card="true"]'));
    const existingEmpty = screen.querySelector<HTMLElement>('.mobile-family-uncle-empty-state');
    if (hasCards) {
      existingEmpty?.remove();
      return;
    }

    const contentWrapper = screen.querySelector<HTMLElement>(':scope > div > div[class*="z-10"] > div');
    if (!contentWrapper || existingEmpty) return;

    let section = contentWrapper.querySelector<HTMLElement>('.mobile-family-uncle-empty-section');
    if (!section) {
      section = document.createElement('section');
      section.className = 'mobile-family-uncle-empty-section';
      section.setAttribute('data-family-map-card-count', '0');
      section.innerHTML = `
        <h2 class="mobile-family-uncle-empty-title">${title}</h2>
        <div class="mobile-family-uncle-empty-state">Nenhum registro visível em ${title}.</div>
      `;
      contentWrapper.appendChild(section);
    }
  });
}

function applyFixes() {
  if (!isMobileViewport()) return;
  ensureStyles();
  markUncleScreens();
}

function scheduleApplyFixes() {
  if (scheduled) return;
  scheduled = true;

  window.requestAnimationFrame(() => {
    scheduled = false;
    applyFixes();
  });
}

function handleTouchStart(event: TouchEvent) {
  if (!isEnabled()) return;
  const target = event.target instanceof Element ? event.target : null;
  const touch = event.touches[0];
  if (!target?.closest(ROOT_SELECTOR) || !touch) return;

  gestureStart = {
    x: touch.clientX,
    y: touch.clientY,
    screen: getCurrentScreen(),
    scrollArea: getScrollArea(event.target),
  };
}

function handleTouchMove(event: TouchEvent) {
  if (!gestureStart || !isEnabled()) return;
  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - gestureStart.x;
  const deltaY = touch.clientY - gestureStart.y;
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);

  if (absoluteY <= absoluteX * 1.2 || absoluteY < PREVIEW_THRESHOLD) return;

  const scrollArea = getScrollArea(event.target) ?? gestureStart.scrollArea;
  if (canScrollVertically(scrollArea, deltaY)) {
    stopBeforeGlobalSwipe(event);
    return;
  }

  if (gestureStart.screen === 'descendants' && deltaY > 0 && isAtTop(scrollArea)) {
    stopBeforeGlobalSwipe(event);
  }

  if (gestureStart.screen === 'core' && deltaY < 0 && isAtBottom(scrollArea) && screenHasContent('descendants')) {
    stopBeforeGlobalSwipe(event);
  }
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

  if (absoluteY < NAVIGATION_THRESHOLD || absoluteY <= absoluteX * 1.2) return;

  const scrollArea = getScrollArea(event.target) ?? start.scrollArea;
  if (canScrollVertically(scrollArea, deltaY)) {
    stopBeforeGlobalSwipe(event);
    return;
  }

  if (start.screen === 'descendants' && deltaY > 0 && isAtTop(scrollArea)) {
    takeOverGesture(event, 'core');
    return;
  }

  if (start.screen === 'core' && deltaY < 0 && isAtBottom(scrollArea) && screenHasContent('descendants')) {
    takeOverGesture(event, 'descendants');
    return;
  }

  if (hasScrollableOverflow(scrollArea)) {
    stopBeforeGlobalSwipe(event);
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applyFixes();
  [80, 240, 520, 1000, 1800].forEach((delay) => window.setTimeout(applyFixes, delay));

  document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
  document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
  document.addEventListener('touchcancel', () => { gestureStart = null; }, { capture: true, passive: true });

  const observer = new MutationObserver(scheduleApplyFixes);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

  window.addEventListener('resize', applyFixes, { passive: true });
  window.addEventListener('orientationchange', applyFixes, { passive: true });
  document.addEventListener('visibilitychange', applyFixes, { passive: true });
}

export {};
