import { useEffect } from 'react';
import { useLocation } from 'react-router';

const mobileGlobalTweaks = `
@media (max-width: 767px) {
  header {
    z-index: 2147482000 !important;
    overflow: visible !important;
    isolation: isolate !important;
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
    z-index: 2147483000 !important;
  }

  header div[class*="shadow-2xl"][class*="bg-white"][class*="overflow-y-auto"],
  header div[class*="shadow-2xl"][class*="bg-white"][class*="overflow-hidden"] {
    position: fixed !important;
    left: 0.75rem !important;
    right: 0.75rem !important;
    top: calc(env(safe-area-inset-top, 0px) + 4.75rem) !important;
    z-index: 2147483000 !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(34rem, calc(100dvh - 6rem)) !important;
    transform: none !important;
  }

  header div[class*="max-h-96"][class*="shadow-2xl"] {
    position: fixed !important;
    left: 0.75rem !important;
    right: 0.75rem !important;
    top: calc(env(safe-area-inset-top, 0px) + 4.75rem) !important;
    z-index: 2147483000 !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(28rem, calc(100dvh - 7rem)) !important;
  }

  html.mobile-user-menu-open button[aria-label="Fechar menu"]:not(.fixed) {
    position: relative !important;
    z-index: 11120 !important;
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
  if (pathname === '/arquivos-historicos') return 'arquivos-historicos';
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

function setStyleValue(element: HTMLElement, property: keyof CSSStyleDeclaration, value: string) {
  if (element.style[property] === value) return;
  element.style[property] = value as never;
}

function setInlineBadgeStyle(element: HTMLElement | null) {
  if (!element) return;
  setStyleValue(element, 'display', 'inline-flex');
  setStyleValue(element, 'alignItems', 'center');
  setStyleValue(element, 'borderRadius', '9999px');
  setStyleValue(element, 'border', '1px solid rgb(229, 231, 235)');
  setStyleValue(element, 'background', 'rgb(255, 255, 255)');
  setStyleValue(element, 'padding', '0.25rem 0.625rem');
  setStyleValue(element, 'fontSize', '0.75rem');
  setStyleValue(element, 'fontWeight', '600');
  setStyleValue(element, 'lineHeight', '1rem');
  setStyleValue(element, 'color', 'rgb(55, 65, 81)');
}

function hideMeusDadosOtherAdjustments() {
  const heading = findExactTextElement('Outros ajustes');
  const card = heading?.closest('section, aside, article, .rounded-2xl, .rounded-xl') as HTMLElement | null;
  if (!card) return;

  setStyleValue(card, 'display', 'none');
}

function rewriteMeusDadosPhotoButton() {
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).forEach((button) => {
    const text = normalizeText(button.textContent);
    if (!text.includes('cadastrar')) return;
    if (!button.querySelector('svg') && !button.textContent?.includes('foto')) return;

    const visibleLabel = Array.from(button.querySelectorAll<HTMLElement>('span'))
      .find((span) => normalizeText(span.textContent) === 'cadastrar');

    if (visibleLabel) {
      if (visibleLabel.textContent !== 'Adicionar foto') visibleLabel.textContent = 'Adicionar foto';
      return;
    }

    button.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && normalizeText(node.textContent) === 'cadastrar') {
        node.textContent = 'Adicionar foto';
      }
    });
  });
}

function compactDeathStatusToggle() {
  const heading = findExactTextElement('Status da pessoa');
  const wrapper = heading?.closest('div')?.parentElement as HTMLElement | null;
  if (!wrapper) return;

  const toggle = Array.from(wrapper.querySelectorAll<HTMLElement>('div'))
    .find((element) => normalizeText(element.textContent).includes('vivo') && normalizeText(element.textContent).includes('falecido'));

  if (!toggle) return;

  setStyleValue(toggle, 'width', 'fit-content');
  setStyleValue(toggle, 'maxWidth', '100%');
  setStyleValue(toggle, 'alignSelf', 'flex-start');

  toggle.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    setStyleValue(button, 'minWidth', '4.35rem');
    setStyleValue(button, 'paddingLeft', '0.75rem');
    setStyleValue(button, 'paddingRight', '0.75rem');
  });
}

function clearButtonTextNodes(button: HTMLButtonElement) {
  Array.from(button.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && normalizeText(node.textContent)) {
      node.textContent = '';
    }
  });

  Array.from(button.children).forEach((child) => {
    if (child.tagName.toLowerCase() === 'svg') return;
    if (child instanceof HTMLElement && normalizeText(child.textContent)) {
      setStyleValue(child, 'display', 'none');
    }
  });
}

function styleIconOnlyQuestionnaireButton(button: HTMLButtonElement, label: string, iconColor: string) {
  button.setAttribute('aria-label', label);
  button.title = label;
  setStyleValue(button, 'width', '3.25rem');
  setStyleValue(button, 'minWidth', '3.25rem');
  setStyleValue(button, 'maxWidth', '3.25rem');
  setStyleValue(button, 'height', '3rem');
  setStyleValue(button, 'flex', '0 0 3.25rem');
  setStyleValue(button, 'justifyContent', 'center');
  setStyleValue(button, 'gap', '0');
  clearButtonTextNodes(button);

  const svg = button.querySelector<SVGElement>('svg');
  if (!svg) return;

  svg.style.opacity = '1';
  svg.style.color = iconColor;
  svg.style.stroke = iconColor;
  svg.setAttribute('aria-hidden', 'true');
}

function fixQuestionnaireNavigationIcons() {
  const section = Array.from(document.querySelectorAll<HTMLElement>('section')).find((candidate) => {
    const text = normalizeText(candidate.textContent);
    return text.includes('sobre mim') && text.includes('etapa') && text.includes('voltar');
  });

  if (!section) return;

  const actionBar = Array.from(section.querySelectorAll<HTMLElement>('div'))
    .reverse()
    .find((node) => {
      const text = normalizeText(node.textContent);
      return text.includes('voltar') && (text.includes('pular tudo') || text.includes('avancar') || text.includes('avançar'));
    }) ?? null;

  if (!actionBar) return;

  setStyleValue(actionBar, 'display', 'flex');
  setStyleValue(actionBar, 'flexDirection', 'row');
  setStyleValue(actionBar, 'alignItems', 'center');
  setStyleValue(actionBar, 'gap', '0.5rem');
  setStyleValue(actionBar, 'justifyContent', 'space-between');

  const portalHost = actionBar.querySelector<HTMLElement>('#meus-dados-profile-bio-actions-host');
  if (portalHost) {
    setStyleValue(portalHost, 'display', 'contents');
    const portalContainer = portalHost.firstElementChild;
    if (portalContainer instanceof HTMLElement) setStyleValue(portalContainer, 'display', 'contents');
  }

  const buttons = Array.from(actionBar.querySelectorAll<HTMLButtonElement>('button'));
  const backButton = buttons.find((button) => normalizeText(button.textContent).includes('voltar'));
  const skipButton = buttons.find((button) => normalizeText(button.textContent).includes('pular tudo'));
  const nextButton = buttons.find((button) => {
    const text = normalizeText(button.textContent);
    return text.includes('avancar') || text.includes('avançar') || text.includes('salvando');
  });

  if (backButton) {
    styleIconOnlyQuestionnaireButton(backButton, 'Voltar', 'rgb(37, 99, 235)');
    setStyleValue(backButton, 'order', '1');
  }

  if (skipButton) {
    setStyleValue(skipButton, 'order', '2');
    setStyleValue(skipButton, 'height', '3rem');
    setStyleValue(skipButton, 'flex', '1 1 auto');
    setStyleValue(skipButton, 'minWidth', '0');
    setStyleValue(skipButton, 'width', 'auto');
    setStyleValue(skipButton, 'justifyContent', 'center');
  }

  if (nextButton) {
    styleIconOnlyQuestionnaireButton(nextButton, 'Avançar', 'rgb(255, 255, 255)');
    setStyleValue(nextButton, 'order', '3');
  }
}

function rewriteMobileTreeHeaderTitle() {
  document.querySelectorAll<HTMLElement>('header h1').forEach((title) => {
    if (normalizeText(title.textContent).startsWith('familia de ')) {
      if (title.textContent !== 'Árvore Familiar') title.textContent = 'Árvore Familiar';
    }
  });
}

function expandMobileUserMenu() {
  if (!document.documentElement.classList.contains('mobile-user-menu-open')) return;

  const closeButton = document.querySelector<HTMLButtonElement>('button[aria-label="Fechar menu"]:not(.fixed)');
  const panel = closeButton?.closest('div.fixed') as HTMLElement | null;
  if (!panel) return;

  setStyleValue(panel, 'top', 'calc(env(safe-area-inset-top, 0px) + 1rem)');
  setStyleValue(panel, 'maxHeight', 'calc(100dvh - 2rem - env(safe-area-inset-top, 0px))');
  setStyleValue(panel, 'zIndex', '11110');
}

function preventMobileAddRelativeDialogAutoKeyboard() {
  const title = Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3, [data-slot="dialog-title"]'))
    .find((element) => normalizeText(element.textContent).startsWith('adicionar '));
  const dialog = title?.closest('[data-slot="dialog-content"]') as HTMLElement | null;
  if (!dialog || dialog.dataset.mobileAddRelativeAutoblurred === 'true') return;

  const input = dialog.querySelector<HTMLInputElement>('#relative-search-name');
  if (!input) return;

  dialog.dataset.mobileAddRelativeAutoblurred = 'true';
  dialog.setAttribute('tabindex', '-1');

  const blurInput = () => {
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
    setStyleValue(badge, 'display', '');
    delete badge.dataset.mobileOriginalReviewBadge;
  });
  document.querySelectorAll<HTMLElement>('[data-mobile-life-badge="true"]').forEach((badge) => {
    badge.removeAttribute('style');
    delete badge.dataset.mobileLifeBadge;
  });
}

function enhanceMobileRelationshipCards() {
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

    if (originalBadge.style.display !== 'none') {
      originalBadge.dataset.mobileOriginalReviewBadge = 'true';
      setStyleValue(originalBadge, 'display', 'none');
    }

    let mobileBadge = badgesRow.querySelector<HTMLElement>('[data-mobile-review-badge="true"]');
    if (!mobileBadge) {
      mobileBadge = document.createElement('span');
      mobileBadge.dataset.mobileReviewBadge = 'true';
      badgesRow.insertBefore(mobileBadge, badgesRow.firstChild);
    }

    if (mobileBadge.textContent !== originalBadge.textContent) {
      mobileBadge.textContent = originalBadge.textContent ?? '';
    }

    setInlineBadgeStyle(mobileBadge);
    setInlineBadgeStyle(lifeBadge);
    lifeBadge.dataset.mobileLifeBadge = 'true';

    setStyleValue(badgesRow, 'display', 'flex');
    setStyleValue(badgesRow, 'flexDirection', 'row');
    setStyleValue(badgesRow, 'alignItems', 'center');
    setStyleValue(badgesRow, 'gap', '0.5rem');
    setStyleValue(badgesRow, 'flexWrap', 'wrap');
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
    preventMobileAddRelativeDialogAutoKeyboard();
  }
}

export function MobileGlobalTweaks() {
  const location = useLocation();

  useEffect(() => {
    let frameId: number | null = null;
    const apply = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        try {
          applyMobileDomTweaks(location.pathname);
        } catch (error) {
          console.warn('[MobileGlobalTweaks] Ajustes mobile ignorados para evitar bloqueio da página:', error);
        }
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('resize', apply);

    const timerIds = [
      window.setTimeout(apply, 80),
      window.setTimeout(apply, 250),
      window.setTimeout(apply, 700),
    ];

    return () => {
      observer.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', apply);
      timerIds.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [location.pathname]);

  return <style>{mobileGlobalTweaks}</style>;
}
