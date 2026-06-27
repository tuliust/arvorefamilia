import { useEffect } from 'react';
import { useLocation } from 'react-router';

const mobileGlobalTweaks = `
@media (max-width: 767px) {
  header {
    z-index: 10900 !important;
    overflow: visible !important;
  }

  header [role="menu"][aria-label="Últimas notificações"] {
    position: fixed !important;
    left: 0.75rem !important;
    right: 0.75rem !important;
    top: calc(env(safe-area-inset-top, 0px) + 4.75rem) !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(34rem, calc(100dvh - 6rem)) !important;
    transform: none !important;
    z-index: 11000 !important;
  }

  header div[class*="max-h-96"][class*="shadow-2xl"] {
    position: fixed !important;
    left: 0.75rem !important;
    right: 0.75rem !important;
    top: calc(env(safe-area-inset-top, 0px) + 4.75rem) !important;
    z-index: 11010 !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(28rem, calc(100dvh - 7rem)) !important;
  }

  html.mobile-user-menu-open button[aria-label="Fechar menu"]:not(.fixed) {
    position: relative !important;
    z-index: 11120 !important;
  }

  main form section:has(div[style*="width:"]) .border-t {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
  }

  main form section:has(div[style*="width:"]) .border-t button:has(svg) {
    width: 3rem !important;
    min-width: 3rem !important;
    max-width: 3rem !important;
    height: 3rem !important;
    min-height: 3rem !important;
    padding: 0 !important;
    flex: 0 0 3rem !important;
    overflow: hidden !important;
    border-radius: 9999px !important;
    color: transparent !important;
  }

  main form section:has(div[style*="width:"]) .border-t button:not(:has(svg)) {
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    height: 3rem !important;
    min-height: 3rem !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
    flex: 0 1 auto !important;
    color: inherit !important;
    border-radius: 0.75rem !important;
  }

  main form section:has(div[style*="width:"]) .border-t button svg {
    width: 1.25rem !important;
    height: 1.25rem !important;
    margin: 0 !important;
    color: rgb(37, 99, 235) !important;
    stroke: rgb(37, 99, 235) !important;
  }

  main form section:has(div[style*="width:"]) .border-t button[class*="bg-blue"] svg,
  main form section:has(div[style*="width:"]) .border-t button[class*="bg-blue-600"] svg {
    color: rgb(255, 255, 255) !important;
    stroke: rgb(255, 255, 255) !important;
  }

  html[data-mobile-route="curiosidades"] .curiosidades-top-sticky-nav,
  html[data-mobile-route="curiosidades"] .curiosidades-top-sticky-nav nav,
  html[data-mobile-route="curiosidades"] .curiosidades-top-sticky-nav .flex {
    overflow: visible !important;
  }

  html[data-mobile-route="curiosidades"] .curiosidades-section-links-wrapper {
    display: block !important;
    flex: 1 1 auto !important;
    width: 100% !important;
    min-width: 0 !important;
    overflow-x: auto !important;
    overflow-y: visible !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }

  html[data-mobile-route="curiosidades"] .curiosidades-section-links-wrapper::-webkit-scrollbar {
    display: none !important;
  }

  html[data-mobile-route="curiosidades"] .curiosidades-section-links {
    display: flex !important;
    width: max-content !important;
    min-width: max-content !important;
    flex-wrap: nowrap !important;
    justify-content: flex-start !important;
    transform: none !important;
  }

  html[data-mobile-route="curiosidades"] .curiosidades-section-link {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
  }

  html[data-mobile-route="person-profile"] main {
    padding-bottom: calc(9.5rem + env(safe-area-inset-bottom, 0px)) !important;
  }

  html[data-mobile-route="meus-vinculos"] article[data-relationship-group] {
    position: relative !important;
    padding-right: 3.75rem !important;
  }

  html[data-mobile-route="meus-vinculos"] article[data-relationship-group] button[aria-label="Solicitar remoção"],
  html[data-mobile-route="meus-vinculos"] article[data-relationship-group] button[aria-label="Cancelar adição"],
  html[data-mobile-route="meus-vinculos"] article[data-relationship-group] button[aria-label="Desfazer solicitação de remoção"] {
    position: absolute !important;
    right: 1rem !important;
    top: 1rem !important;
    z-index: 2 !important;
  }
}
`;

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMobileRoute(pathname: string) {
  if (pathname === '/meus-dados') return 'meus-dados';
  if (pathname === '/meus-vinculos') return 'meus-vinculos';
  if (pathname === '/curiosidades') return 'curiosidades';
  if (pathname.startsWith('/pessoa/') || pathname.startsWith('/pessoas/')) return 'person-profile';
  return '';
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function findExactTextElement(text: string) {
  const normalizedTarget = normalizeText(text);
  return Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3, h4, p, span, div'))
    .find((element) => normalizeText(element.textContent) === normalizedTarget) ?? null;
}

function setInlineBadgeStyle(element: HTMLElement | null) {
  if (!element) return;
  element.style.display = 'inline-flex';
  element.style.alignItems = 'center';
  element.style.borderRadius = '9999px';
  element.style.border = '1px solid rgb(229, 231, 235)';
  element.style.background = 'rgb(255, 255, 255)';
  element.style.padding = '0.25rem 0.625rem';
  element.style.fontSize = '0.75rem';
  element.style.fontWeight = '600';
  element.style.lineHeight = '1rem';
  element.style.color = 'rgb(55, 65, 81)';
}

function hideMeusDadosOtherAdjustments() {
  if (!isMobileViewport()) return;
  const heading = findExactTextElement('Outros ajustes');
  const card = heading?.closest('section, aside, article, .rounded-2xl, .rounded-xl') as HTMLElement | null;
  if (!card) return;

  card.style.display = 'none';
  card.dataset.mobileHiddenOtherAdjustments = 'true';
}

function rewriteMeusDadosPhotoButton() {
  if (!isMobileViewport()) return;

  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).forEach((button) => {
    if (normalizeText(button.textContent) !== 'cadastrar') return;

    const visibleLabel = Array.from(button.querySelectorAll<HTMLElement>('span'))
      .find((span) => normalizeText(span.textContent) === 'cadastrar');

    if (visibleLabel) {
      visibleLabel.textContent = 'Adicionar foto';
    } else {
      button.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && normalizeText(node.textContent) === 'cadastrar') {
          node.textContent = 'Adicionar foto';
        }
      });
    }
  });
}

function compactDeathStatusToggle() {
  if (!isMobileViewport()) return;

  const heading = findExactTextElement('Status da pessoa');
  const wrapper = heading?.closest('div')?.parentElement as HTMLElement | null;
  if (!wrapper) return;

  const toggle = Array.from(wrapper.querySelectorAll<HTMLElement>('div'))
    .find((element) => normalizeText(element.textContent).includes('vivo') && normalizeText(element.textContent).includes('falecido'));

  if (!toggle) return;

  toggle.style.width = 'fit-content';
  toggle.style.maxWidth = '100%';
  toggle.style.alignSelf = 'flex-start';

  toggle.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    button.style.minWidth = '4.35rem';
    button.style.paddingLeft = '0.75rem';
    button.style.paddingRight = '0.75rem';
  });
}

function fixQuestionnaireNavigationIcons() {
  if (!isMobileViewport()) return;

  const section = Array.from(document.querySelectorAll<HTMLElement>('section')).find((candidate) => {
    const text = normalizeText(candidate.textContent);
    return text.includes('sobre mim') && text.includes('etapa') && text.includes('voltar');
  });

  if (!section) return;

  Array.from(section.querySelectorAll<HTMLButtonElement>('button')).forEach((button) => {
    const text = normalizeText(button.textContent);
    const svg = button.querySelector<SVGElement>('svg');
    if (!svg) return;

    if (text.includes('voltar')) {
      button.style.opacity = '1';
      svg.style.opacity = '1';
      svg.style.color = 'rgb(37, 99, 235)';
      svg.style.stroke = 'rgb(37, 99, 235)';
      svg.setAttribute('aria-hidden', 'true');
    }

    if (text.includes('avancar') || text.includes('avançar')) {
      svg.style.opacity = '1';
      svg.style.color = 'rgb(255, 255, 255)';
      svg.style.stroke = 'rgb(255, 255, 255)';
      svg.setAttribute('aria-hidden', 'true');
    }
  });
}

function rewriteMobileTreeHeaderTitle() {
  if (!isMobileViewport()) return;

  document.querySelectorAll<HTMLElement>('header h1').forEach((title) => {
    if (normalizeText(title.textContent).startsWith('familia de ')) {
      title.textContent = 'Árvore Familiar';
      title.dataset.mobileTreeTitleNormalized = 'true';
    }
  });
}

function expandMobileUserMenu() {
  if (!isMobileViewport()) return;
  if (!document.documentElement.classList.contains('mobile-user-menu-open')) return;

  const closeButton = document.querySelector<HTMLButtonElement>('button[aria-label="Fechar menu"]:not(.fixed)');
  const panel = closeButton?.closest('div.fixed') as HTMLElement | null;
  if (!panel) return;

  panel.style.top = 'calc(env(safe-area-inset-top, 0px) + 1rem)';
  panel.style.maxHeight = 'calc(100dvh - 2rem - env(safe-area-inset-top, 0px))';
  panel.style.zIndex = '11110';
}

function preventMobileSpouseDialogAutoKeyboard() {
  if (!isMobileViewport()) return;

  const title = findExactTextElement('Adicionar cônjuge');
  const dialog = title?.closest('[data-slot="dialog-content"]') as HTMLElement | null;
  if (!dialog || dialog.dataset.mobileSpouseAutoblurred === 'true') return;

  dialog.dataset.mobileSpouseAutoblurred = 'true';
  dialog.setAttribute('tabindex', '-1');

  const blurInput = () => {
    const input = dialog.querySelector<HTMLInputElement>('#relative-search-name');
    if (!input) return;
    if (document.activeElement === input) input.blur();
    dialog.focus({ preventScroll: true });
  };

  window.requestAnimationFrame(blurInput);
  window.setTimeout(blurInput, 80);
  window.setTimeout(blurInput, 220);
}

function restoreRelationshipCardsForDesktop() {
  document.querySelectorAll<HTMLElement>('[data-mobile-review-badge="true"]').forEach((badge) => badge.remove());
  document.querySelectorAll<HTMLElement>('[data-mobile-original-review-badge="true"]').forEach((badge) => {
    badge.style.display = '';
    delete badge.dataset.mobileOriginalReviewBadge;
  });
  document.querySelectorAll<HTMLElement>('[data-mobile-life-badge="true"]').forEach((badge) => {
    badge.removeAttribute('style');
    delete badge.dataset.mobileLifeBadge;
  });
}

function enhanceMobileRelationshipCards() {
  if (!isMobileViewport()) {
    restoreRelationshipCardsForDesktop();
    return;
  }

  document.querySelectorAll<HTMLElement>('article[data-relationship-group]').forEach((card) => {
    const actionButton = card.querySelector<HTMLButtonElement>('button[aria-label="Solicitar remoção"], button[aria-label="Cancelar adição"], button[aria-label="Desfazer solicitação de remoção"]');
    const actionContainer = actionButton?.closest('div') as HTMLElement | null;
    const originalBadge = actionContainer?.querySelector<HTMLElement>('span');
    const lifeBadge = Array.from(card.querySelectorAll<HTMLElement>('span')).find((span) => {
      const text = normalizeText(span.textContent);
      return text === 'vivo' || text === 'falecido' || text === 'falecida';
    }) ?? null;

    if (!originalBadge || !lifeBadge) return;

    const badgesRow = lifeBadge.closest('div') as HTMLElement | null;
    if (!badgesRow) return;

    originalBadge.dataset.mobileOriginalReviewBadge = 'true';
    originalBadge.style.display = 'none';

    let mobileBadge = badgesRow.querySelector<HTMLElement>('[data-mobile-review-badge="true"]');
    if (!mobileBadge) {
      mobileBadge = document.createElement('span');
      mobileBadge.dataset.mobileReviewBadge = 'true';
      badgesRow.insertBefore(mobileBadge, badgesRow.firstChild);
    }

    mobileBadge.textContent = originalBadge.textContent ?? '';
    setInlineBadgeStyle(mobileBadge);
    setInlineBadgeStyle(lifeBadge);
    lifeBadge.dataset.mobileLifeBadge = 'true';

    badgesRow.style.display = 'flex';
    badgesRow.style.flexDirection = 'row';
    badgesRow.style.alignItems = 'center';
    badgesRow.style.gap = '0.5rem';
    badgesRow.style.flexWrap = 'wrap';
  });
}

function applyMobileDomTweaks(pathname: string) {
  const route = getMobileRoute(pathname);

  document.documentElement.dataset.mobileRoute = route;

  if (!isMobileViewport()) {
    restoreRelationshipCardsForDesktop();
    return;
  }

  rewriteMobileTreeHeaderTitle();
  expandMobileUserMenu();

  if (route === 'meus-dados') {
    hideMeusDadosOtherAdjustments();
    rewriteMeusDadosPhotoButton();
    compactDeathStatusToggle();
    fixQuestionnaireNavigationIcons();
  }

  if (route === 'meus-vinculos') {
    enhanceMobileRelationshipCards();
    preventMobileSpouseDialogAutoKeyboard();
  }
}

export function MobileGlobalTweaks() {
  const location = useLocation();

  useEffect(() => {
    const apply = () => applyMobileDomTweaks(location.pathname);

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    window.addEventListener('resize', apply);

    const timerIds = [
      window.setTimeout(apply, 80),
      window.setTimeout(apply, 250),
      window.setTimeout(apply, 700),
    ];

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', apply);
      timerIds.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [location.pathname]);

  return <style>{mobileGlobalTweaks}</style>;
}
