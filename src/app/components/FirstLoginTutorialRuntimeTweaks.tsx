import { useEffect } from 'react';

const CONTROLS_BULLET_TO_REMOVE = 'Configure o zoom e a exibição de linhas, bordas, cards e grupos.';
const FAVORITES_BULLETS = [
  'Acesse páginas, arquivos e dados marcados como importantes.',
  'Use o botão de estrela nas páginas do site para guardar o conteúdo que desejar.',
];
const LINHA_GERACIONAL_MOBILE_STYLE_ID = 'linha-geracional-mobile-runtime-style';
const LINHA_GERACIONAL_MOBILE_CSS = `
@media (max-width: 767px) {
  [data-linha-geracional-mobile-root="true"] section[aria-label] {
    padding-top: 1.5rem !important;
  }

  [data-linha-geracional-mobile-root="true"] section[aria-label] div.relative.px-8 {
    margin-bottom: 0.65rem !important;
  }

  [data-linha-geracional-mobile-root="true"] section[aria-label]:not([aria-label="Núcleo"]) div.relative.px-8 > span,
  [data-linha-geracional-mobile-root="true"] section[aria-label]:not([aria-label="Núcleo"]) div.relative.flex.flex-1.flex-col > span {
    display: none !important;
  }

  [data-linha-geracional-mobile-root="true"] section[aria-label="Núcleo"] div.relative.flex.flex-1.flex-col {
    gap: 0.95rem !important;
  }

  [data-linha-geracional-mobile-root="true"] section[aria-label="Núcleo"] div.relative.px-8 > span:first-child {
    display: none !important;
  }
}
`;

type AncestorSide = 'paternal' | 'maternal';

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function ensureLinhaGeracionalMobileStyle() {
  if (document.getElementById(LINHA_GERACIONAL_MOBILE_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = LINHA_GERACIONAL_MOBILE_STYLE_ID;
  style.textContent = LINHA_GERACIONAL_MOBILE_CSS;
  document.head.appendChild(style);
}

function getTutorialRoot() {
  return document.querySelector<HTMLElement>('[data-first-login-tutorial="true"]');
}

function getCurrentStepTitle(root: HTMLElement) {
  return root.getAttribute('data-first-login-tutorial-step') ?? '';
}

function removeControlsBullet(root: HTMLElement) {
  if (getCurrentStepTitle(root) !== 'Modos de exibição e controles da árvore') return;

  Array.from(root.querySelectorAll<HTMLLIElement>('li')).forEach((item) => {
    if (item.textContent?.includes(CONTROLS_BULLET_TO_REMOVE)) {
      item.remove();
    }
  });
}

function rewriteFavoritesBullets(root: HTMLElement) {
  if (getCurrentStepTitle(root) !== 'Guarde os seus destaques') return;

  const items = Array.from(root.querySelectorAll<HTMLLIElement>('li'));
  if (items.length === 0) return;

  FAVORITES_BULLETS.forEach((text, index) => {
    const item = items[index];
    const content = item?.querySelector('span:last-child');
    if (content) content.textContent = text;
  });

  items.slice(FAVORITES_BULLETS.length).forEach((item) => item.remove());
}

function getRectWithPadding(element: HTMLElement, padding: number) {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left - padding,
    top: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function tuneFavoritesSpotlight(root: HTMLElement) {
  if (getCurrentStepTitle(root) !== 'Guarde os seus destaques') return;

  const favoritesTarget = document.querySelector<HTMLElement>('[data-tour-target="favorites"]');
  if (!favoritesTarget) return;

  const rect = getRectWithPadding(favoritesTarget, 10);
  const svgSpotlights = Array.from(root.querySelectorAll<SVGRectElement>('svg mask rect')).slice(1);
  const borderSpotlights = Array.from(root.querySelectorAll<HTMLElement>('div.pointer-events-none.fixed.z-\[12002\]'));

  svgSpotlights.forEach((spotlight, index) => {
    if (index > 0) {
      spotlight.setAttribute('width', '0');
      spotlight.setAttribute('height', '0');
      return;
    }

    spotlight.setAttribute('x', String(rect.left));
    spotlight.setAttribute('y', String(rect.top));
    spotlight.setAttribute('width', String(rect.width));
    spotlight.setAttribute('height', String(rect.height));
  });

  borderSpotlights.forEach((spotlight, index) => {
    if (index > 0) {
      spotlight.style.display = 'none';
      return;
    }

    spotlight.style.left = `${rect.left}px`;
    spotlight.style.top = `${rect.top}px`;
    spotlight.style.width = `${rect.width}px`;
    spotlight.style.height = `${rect.height}px`;
  });
}

function increaseProfileCardGap(root: HTMLElement) {
  if (getCurrentStepTitle(root) !== 'Perfis, vínculos e memórias') return;

  const highlightedCard = document.querySelector<HTMLElement>('[data-family-map-central-card="true"], [data-family-map-mobile-card="true"], [data-family-map-mobile-main-card="true"]');
  const panel = root.querySelector<HTMLElement>('section.fixed.z-\[12003\]');
  if (!highlightedCard || !panel) return;

  const cardRect = highlightedCard.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const minGap = 44;
  const currentVerticalGap = panelRect.bottom <= cardRect.top
    ? cardRect.top - panelRect.bottom
    : panelRect.top >= cardRect.bottom
      ? panelRect.top - cardRect.bottom
      : 0;

  if (currentVerticalGap >= minGap) return;

  const viewportMargin = 14;
  const preferredTopAbove = cardRect.top - panelRect.height - minGap;
  const preferredTopBelow = cardRect.bottom + minGap;
  const nextTop = preferredTopAbove >= viewportMargin
    ? preferredTopAbove
    : Math.min(preferredTopBelow, window.innerHeight - panelRect.height - viewportMargin);

  panel.style.top = `${Math.max(viewportMargin, nextTop)}px`;
}

function rewriteLinhaGeracionalHeaderTitle() {
  if (!isMobileViewport()) return;
  if (window.location.pathname !== '/linha-geracional') return;

  document.querySelectorAll<HTMLElement>('header h1').forEach((title) => {
    const normalized = normalizeText(title.textContent);
    if (normalized.startsWith('familia de ') || normalized === 'linha geracional') {
      if (title.textContent !== 'Árvore Familiar') title.textContent = 'Árvore Familiar';
    }
  });
}

function styleLinhaGeracionalGenerationTitle() {
  if (!isMobileViewport()) return;
  if (window.location.pathname !== '/linha-geracional') return;

  Array.from(document.querySelectorAll<HTMLElement>('[data-linha-geracional-mobile-root="true"] h1')).forEach((title) => {
    if (!normalizeText(title.textContent).startsWith('geracao ')) return;

    title.style.marginTop = '0.9rem';
    title.style.fontSize = '0.95rem';
    title.style.fontWeight = '650';
    title.style.letterSpacing = '0';
    title.style.lineHeight = '1.2';
  });
}

function skipEmptyFirstLinhaGeracionalScreen() {
  if (!isMobileViewport()) return;
  if (window.location.pathname !== '/linha-geracional') return;

  const root = document.querySelector<HTMLElement>('[data-linha-geracional-mobile-root="true"]');
  if (!root || root.dataset.emptyFirstGenerationSkipped === 'true') return;

  const heading = Array.from(root.querySelectorAll<HTMLElement>('h1')).find((element) => normalizeText(element.textContent) === 'geracao 1');
  if (!heading) return;

  const hasEmptyFirstGeneration = normalizeText(root.textContent).includes('nenhum tataravo encontrado neste recorte');
  if (!hasEmptyFirstGeneration) return;

  const nextButton = root.querySelector<HTMLButtonElement>('button[aria-label="Próxima geração"]');
  if (!nextButton || nextButton.disabled) return;

  root.dataset.emptyFirstGenerationSkipped = 'true';
  nextButton.click();
}

function getAncestorGroupRow(title: string) {
  const normalized = normalizeText(title);
  if (normalized.includes('tataravo')) return '1';
  if (normalized.includes('bisavo')) return '2';
  if (normalized.includes('avo')) return '3';
  return '';
}

function getAncestorGroupSide(title: string): AncestorSide | null {
  const normalized = normalizeText(title);
  if (normalized.includes('paterno')) return 'paternal';
  if (normalized.includes('materno')) return 'maternal';
  return null;
}

function fixMobileAncestorSides() {
  if (!isMobileViewport()) return;
  if (window.location.pathname !== '/mapa-familiar') return;

  const ancestorsScreen = document.querySelector<HTMLElement>('[data-mobile-family-tree-screen="ancestors"]');
  const grid = ancestorsScreen?.querySelector<HTMLElement>('.grid.grid-cols-2');
  if (!grid) return;

  Array.from(grid.querySelectorAll<HTMLElement>('section')).forEach((section) => {
    const heading = section.querySelector<HTMLElement>('h2, h3, h4');
    const title = heading?.textContent ?? '';
    const side = getAncestorGroupSide(title);
    const row = getAncestorGroupRow(title);

    if (!side || !row) return;

    section.style.gridColumn = side === 'paternal' ? '1' : '2';
    section.style.gridRow = row;
    section.style.order = '0';
  });
}

function hasCousinCards(side: AncestorSide) {
  const screenName = side === 'paternal' ? 'paternal-cousins' : 'maternal-cousins';
  const screen = document.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`);
  return Boolean(screen?.querySelector('[data-family-map-mobile-card="true"]'));
}

function hideMissingCousinVerticalConnectors() {
  if (!isMobileViewport()) return;
  if (window.location.pathname !== '/mapa-familiar') return;

  (['paternal', 'maternal'] as AncestorSide[]).forEach((side) => {
    const unclesScreenName = side === 'paternal' ? 'paternal-uncles' : 'maternal-uncles';
    const unclesScreen = document.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${unclesScreenName}"]`);
    if (!unclesScreen) return;

    const shouldHide = !hasCousinCards(side);
    Array.from(unclesScreen.querySelectorAll<HTMLElement>('div.pointer-events-none.absolute.left-1\/2.w-px, div.pointer-events-none.absolute.left-1\/2.z-0.w-px')).forEach((line) => {
      line.style.display = shouldHide ? 'none' : '';
    });
  });
}

function getActiveMobileFamilyTreeScreen() {
  const stage = document.querySelector<HTMLElement>('[data-mobile-family-tree-stage="true"]');
  const transform = stage?.style.transform ?? '';
  const match = transform.match(/calc\((-?\d+(?:\.\d+)?)%[^)]*\),\s*calc\((-?\d+(?:\.\d+)?)%/);
  if (!match) return null;

  const x = Number(match[1]);
  const y = Number(match[2]);
  const column = Math.round(Math.abs(x) / (100 / 3));
  const row = Math.round(Math.abs(y) / (100 / 3));

  if (row === 1 && column === 0) return 'paternal-uncles';
  if (row === 1 && column === 2) return 'maternal-uncles';
  return null;
}

function shouldBlockSwipeToMissingCousins(deltaY: number) {
  if (!isMobileViewport()) return false;
  if (window.location.pathname !== '/mapa-familiar') return false;
  if (deltaY >= -10) return false;

  const activeScreen = getActiveMobileFamilyTreeScreen();
  if (activeScreen === 'paternal-uncles') return !hasCousinCards('paternal');
  if (activeScreen === 'maternal-uncles') return !hasCousinCards('maternal');
  return false;
}

function applyTutorialTweaks() {
  ensureLinhaGeracionalMobileStyle();

  const root = getTutorialRoot();
  if (root) {
    removeControlsBullet(root);
    rewriteFavoritesBullets(root);
    tuneFavoritesSpotlight(root);
    increaseProfileCardGap(root);
  }

  rewriteLinhaGeracionalHeaderTitle();
  styleLinhaGeracionalGenerationTitle();
  skipEmptyFirstLinhaGeracionalScreen();
  fixMobileAncestorSides();
  hideMissingCousinVerticalConnectors();
}

export function FirstLoginTutorialRuntimeTweaks() {
  useEffect(() => {
    let frameId: number | null = null;
    let touchStartY: number | null = null;
    const apply = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        applyTutorialTweaks();
      });
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartY === null) return;
      const touch = event.touches[0];
      if (!touch) return;

      if (!shouldBlockSwipeToMissingCousins(touch.clientY - touchStartY)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchStartY === null) return;
      const touch = event.changedTouches[0];
      const deltaY = touch ? touch.clientY - touchStartY : 0;
      touchStartY = null;

      if (!shouldBlockSwipeToMissingCousins(deltaY)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('resize', apply);
    window.addEventListener('scroll', apply, true);
    document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
    document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });
    document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });

    const timerIds = [
      window.setTimeout(apply, 80),
      window.setTimeout(apply, 250),
      window.setTimeout(apply, 700),
    ];

    return () => {
      observer.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', apply);
      window.removeEventListener('scroll', apply, true);
      document.removeEventListener('touchstart', handleTouchStart, true);
      document.removeEventListener('touchmove', handleTouchMove, true);
      document.removeEventListener('touchend', handleTouchEnd, true);
      timerIds.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  return null;
}
