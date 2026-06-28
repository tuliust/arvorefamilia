import { useEffect } from 'react';
import { useLocation } from 'react-router';

const LINE_PANEL_OPEN_CLASS = 'linha-geracional-controls-panel-open';
const LINE_PANEL_Z_INDEX = '2147483700';
const LINE_PANEL_CONTENT_Z_INDEX = '2147483701';

const styles = `
@media (max-width: 767px) {
  html.${LINE_PANEL_OPEN_CLASS} header {
    z-index: 0 !important;
  }

  html.${LINE_PANEL_OPEN_CLASS} [data-linha-geracional-mobile-root="true"] {
    overflow: visible !important;
  }

  html.${LINE_PANEL_OPEN_CLASS} [role="dialog"][aria-label="Painel de visualização"] {
    position: fixed !important;
    inset: 0 !important;
    z-index: ${LINE_PANEL_Z_INDEX} !important;
  }

  html.${LINE_PANEL_OPEN_CLASS} [role="dialog"][aria-label="Painel de visualização"] > section,
  html.${LINE_PANEL_OPEN_CLASS} [role="dialog"][aria-label="Painel de visualização"] section {
    z-index: ${LINE_PANEL_CONTENT_Z_INDEX} !important;
  }
}
`;

function isMobileViewport() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function setStyle(element: HTMLElement | null, property: string, value: string) {
  if (!element) return;
  if (element.style.getPropertyValue(property) === value) return;
  element.style.setProperty(property, value);
}

function findLineGenerationControlsPanel() {
  return document.querySelector<HTMLElement>(
    '[data-linha-geracional-mobile-root="true"] [role="dialog"][aria-label="Painel de visualização"]'
  );
}

function applyLineGenerationPanelLayer() {
  const root = document.documentElement;

  if (!isMobileViewport()) {
    root.classList.remove(LINE_PANEL_OPEN_CLASS);
    return;
  }

  const panel = findLineGenerationControlsPanel();
  const isOpen = Boolean(panel);
  root.classList.toggle(LINE_PANEL_OPEN_CLASS, isOpen);

  if (!panel) return;

  setStyle(panel, 'position', 'fixed');
  setStyle(panel, 'inset', '0');
  setStyle(panel, 'z-index', LINE_PANEL_Z_INDEX);

  panel.querySelectorAll<HTMLElement>('section').forEach((section) => {
    setStyle(section, 'z-index', LINE_PANEL_CONTENT_Z_INDEX);
  });
}

export function LinhaGeracionalMobilePanelLayerTweaks() {
  const location = useLocation();
  const enabled = location.pathname === '/linha-geracional';

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove(LINE_PANEL_OPEN_CLASS);
      return undefined;
    }

    let frameId: number | null = null;

    const apply = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        applyLineGenerationPanelLayer();
      });
    };

    apply();

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    window.addEventListener('resize', apply);

    return () => {
      observer.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', apply);
      document.documentElement.classList.remove(LINE_PANEL_OPEN_CLASS);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <style>{styles}</style>;
}
