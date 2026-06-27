import { useEffect } from 'react';

const CONTROLS_BULLET_TO_REMOVE = 'Configure o zoom e a exibição de linhas, bordas, cards e grupos.';
const FAVORITES_BULLETS = [
  'Acesse páginas, arquivos e dados marcados como importantes.',
  'Use o botão de estrela nas páginas do site para guardar o conteúdo que desejar.',
];

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

function applyTutorialTweaks() {
  const root = getTutorialRoot();
  if (!root) return;

  removeControlsBullet(root);
  rewriteFavoritesBullets(root);
  tuneFavoritesSpotlight(root);
  increaseProfileCardGap(root);
}

export function FirstLoginTutorialRuntimeTweaks() {
  useEffect(() => {
    const apply = () => window.requestAnimationFrame(applyTutorialTweaks);

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    window.addEventListener('resize', apply);
    window.addEventListener('scroll', apply, true);

    const timerIds = [
      window.setTimeout(apply, 80),
      window.setTimeout(apply, 250),
      window.setTimeout(apply, 700),
    ];

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', apply);
      window.removeEventListener('scroll', apply, true);
      timerIds.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  return null;
}
