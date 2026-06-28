import { useEffect } from 'react';
import { useLocation } from 'react-router';

const MOBILE_TOP_LAYER_Z = '2147483600';
const MOBILE_USER_MENU_Z = '2147483620';
const MOBILE_USER_MENU_BACKDROP_Z = '2147483610';
const MOBILE_PANEL_Z = '2147483550';

const mobileTopLayerStyles = `
@media (max-width: 767px) {
  header {
    z-index: 2147481000 !important;
    overflow: visible !important;
  }

  header [role="menu"][aria-label="Últimas notificações"],
  body [role="menu"][aria-label="Últimas notificações"] {
    position: fixed !important;
    left: 0.75rem !important;
    right: 0.75rem !important;
    top: calc(env(safe-area-inset-top, 0px) + 0.75rem) !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(38rem, calc(100dvh - 1.5rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))) !important;
    z-index: 2147483600 !important;
    transform: none !important;
  }

  [role="dialog"][aria-label="Painel de visualização"] {
    z-index: 2147483550 !important;
  }

  [role="dialog"][aria-label="Painel de visualização"] section {
    z-index: 2147483551 !important;
  }

  html.mobile-user-menu-open button.fixed.inset-0 {
    z-index: 2147483610 !important;
  }

  html.mobile-user-menu-open button[aria-label="Fechar menu"]:not(.fixed) {
    position: relative !important;
    z-index: 2147483630 !important;
  }

  html.mobile-user-menu-open div.fixed[class*="rounded-3xl"][class*="shadow-2xl"] {
    top: calc(env(safe-area-inset-top, 0px) + 0.75rem) !important;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 0.75rem) !important;
    max-height: none !important;
    z-index: 2147483620 !important;
    overflow-y: auto !important;
    overscroll-behavior: contain !important;
    -webkit-overflow-scrolling: touch !important;
  }

  [data-mobile-family-tree-screen="paternal-cousins"],
  [data-mobile-family-tree-screen="maternal-cousins"] {
    overflow: hidden !important;
  }

  [data-mobile-family-tree-screen="paternal-cousins"] [data-mobile-tree-scroll],
  [data-mobile-family-tree-screen="maternal-cousins"] [data-mobile-tree-scroll] {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    overscroll-behavior-y: contain !important;
    touch-action: pan-y !important;
    -webkit-overflow-scrolling: touch !important;
  }
}
`;

function isMobileViewport() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getEventElement(target: EventTarget | null) {
  if (target instanceof Element) return target;
  if (target instanceof Node) return target.parentElement;
  return null;
}

function setStyle(element: HTMLElement | null, property: string, value: string) {
  if (!element) return;
  if (element.style.getPropertyValue(property) === value) return;
  element.style.setProperty(property, value);
}

function applyTopLayerInlineStyles() {
  document.querySelectorAll<HTMLElement>('[role="menu"][aria-label="Últimas notificações"]').forEach((panel) => {
    setStyle(panel, 'position', 'fixed');
    setStyle(panel, 'left', '0.75rem');
    setStyle(panel, 'right', '0.75rem');
    setStyle(panel, 'top', 'calc(env(safe-area-inset-top, 0px) + 0.75rem)');
    setStyle(panel, 'width', 'auto');
    setStyle(panel, 'max-width', 'none');
    setStyle(panel, 'max-height', 'min(38rem, calc(100dvh - 1.5rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)))');
    setStyle(panel, 'z-index', MOBILE_TOP_LAYER_Z);
    setStyle(panel, 'transform', 'none');
  });

  document.querySelectorAll<HTMLElement>('[role="dialog"][aria-label="Painel de visualização"]').forEach((panel) => {
    setStyle(panel, 'z-index', MOBILE_PANEL_Z);
  });

  const avatarBackdrop = document.querySelector<HTMLElement>('html.mobile-user-menu-open button.fixed.inset-0');
  setStyle(avatarBackdrop, 'z-index', MOBILE_USER_MENU_BACKDROP_Z);

  const avatarPanel = document.querySelector<HTMLElement>('html.mobile-user-menu-open div.fixed[class*="rounded-3xl"][class*="shadow-2xl"]');
  if (!avatarPanel) return;

  setStyle(avatarPanel, 'top', 'calc(env(safe-area-inset-top, 0px) + 0.75rem)');
  setStyle(avatarPanel, 'bottom', 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)');
  setStyle(avatarPanel, 'max-height', 'none');
  setStyle(avatarPanel, 'z-index', MOBILE_USER_MENU_Z);
  setStyle(avatarPanel, 'overflow-y', 'auto');
  setStyle(avatarPanel, 'overscroll-behavior', 'contain');
  setStyle(avatarPanel, '-webkit-overflow-scrolling', 'touch');
}

function rewriteAdminSummaryLabels(pathname: string) {
  if (pathname !== '/admin') return;

  const compact = isMobileViewport();
  const replacements = [
    {
      ariaNeedle: 'solicitacoes',
      shortLabel: 'Solicitações',
      longLabel: 'Solicitações de Aprovações',
    },
    {
      ariaNeedle: 'responsaveis',
      shortLabel: 'Responsáveis',
      longLabel: 'Responsáveis por Usuários',
    },
  ];

  replacements.forEach(({ ariaNeedle, shortLabel, longLabel }) => {
    const button = Array.from(document.querySelectorAll<HTMLButtonElement>('button[aria-label]'))
      .find((candidate) => normalizeText(candidate.getAttribute('aria-label')).includes(ariaNeedle));

    if (!button) return;

    const label = Array.from(button.querySelectorAll<HTMLElement>('span'))
      .find((candidate) => {
        const text = normalizeText(candidate.textContent);
        return text === normalizeText(shortLabel) || text === normalizeText(longLabel);
      });

    if (!label) return;
    const nextText = compact ? shortLabel : longLabel;
    if (label.textContent !== nextText) label.textContent = nextText;
  });
}

function applyMobileTopLayerTweaks(pathname: string) {
  if (!isMobileViewport()) {
    rewriteAdminSummaryLabels(pathname);
    return;
  }

  applyTopLayerInlineStyles();
  rewriteAdminSummaryLabels(pathname);
}

export function MobileTopLayerTweaks() {
  const location = useLocation();

  useEffect(() => {
    let frameId: number | null = null;

    const apply = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;

        try {
          applyMobileTopLayerTweaks(location.pathname);
        } catch (error) {
          console.warn('[MobileTopLayerTweaks] Ajustes mobile ignorados para evitar bloqueio da página:', error);
        }
      });
    };

    apply();

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('resize', apply);

    const timers = [
      window.setTimeout(apply, 80),
      window.setTimeout(apply, 240),
      window.setTimeout(apply, 700),
    ];

    return () => {
      observer.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', apply);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/mapa-familiar') return undefined;

    let start: {
      x: number;
      y: number;
      scrollable: boolean;
    } | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      if (!isMobileViewport()) {
        start = null;
        return;
      }

      const target = getEventElement(event.target);
      const cousinsScreen = target?.closest<HTMLElement>(
        '[data-mobile-family-tree-screen="paternal-cousins"], [data-mobile-family-tree-screen="maternal-cousins"]'
      );
      const scrollElement = target?.closest<HTMLElement>('[data-mobile-tree-scroll]');
      const touch = event.touches[0];

      if (!cousinsScreen || !scrollElement || !touch) {
        start = null;
        return;
      }

      start = {
        x: touch.clientX,
        y: touch.clientY,
        scrollable: scrollElement.scrollHeight > scrollElement.clientHeight + 1,
      };
    };

    const keepCousinsVerticalScrollInsideScreen = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!start || !touch || !start.scrollable) return;

      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      const absoluteX = Math.abs(deltaX);
      const absoluteY = Math.abs(deltaY);

      if (absoluteY < 10 || absoluteY <= absoluteX * 1.2) return;

      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const clearTouchStart = () => {
      start = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
    document.addEventListener('touchmove', keepCousinsVerticalScrollInsideScreen, { capture: true, passive: true });
    document.addEventListener('touchend', clearTouchStart, { capture: true, passive: true });
    document.addEventListener('touchcancel', clearTouchStart, { capture: true, passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchmove', keepCousinsVerticalScrollInsideScreen, { capture: true });
      document.removeEventListener('touchend', clearTouchStart, { capture: true });
      document.removeEventListener('touchcancel', clearTouchStart, { capture: true });
    };
  }, [location.pathname]);

  return <style>{mobileTopLayerStyles}</style>;
}
