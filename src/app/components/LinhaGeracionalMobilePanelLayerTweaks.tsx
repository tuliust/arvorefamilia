import { useEffect } from 'react';
import { useLocation } from 'react-router';

const LINE_PANEL_OPEN_CLASS = 'linha-geracional-controls-panel-open';
const LINE_PANEL_CLOSE_BUTTON_CLASS = 'linha-geracional-controls-panel-close-button';
const LINE_PANEL_Z_INDEX = '2147483700';
const LINE_PANEL_CONTENT_Z_INDEX = '2147483701';
const LINE_PANEL_CLOSE_Z_INDEX = '2147483702';

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

  html.${LINE_PANEL_OPEN_CLASS} [role="dialog"][aria-label="Painel de visualização"] button[class*="border-blue-100"][class*="w-full"] {
    min-height: 3.25rem !important;
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
    text-align: center !important;
  }

  html.${LINE_PANEL_OPEN_CLASS} [role="dialog"][aria-label="Painel de visualização"] button[class*="border-blue-100"][class*="w-full"] > span {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    overflow: visible !important;
    text-align: center !important;
    text-overflow: clip !important;
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
    line-height: 1.15 !important;
    font-size: clamp(0.82rem, 3.35vw, 0.95rem) !important;
    letter-spacing: -0.02em !important;
  }

  html.${LINE_PANEL_OPEN_CLASS} .${LINE_PANEL_CLOSE_BUTTON_CLASS} {
    position: absolute !important;
    top: 0.75rem !important;
    right: 0.75rem !important;
    z-index: ${LINE_PANEL_CLOSE_Z_INDEX} !important;
    display: inline-flex !important;
    height: 2.75rem !important;
    width: 2.75rem !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 9999px !important;
    border: 1px solid rgb(226 232 240) !important;
    background: rgba(255, 255, 255, 0.96) !important;
    color: rgb(15 23 42) !important;
    font-size: 2rem !important;
    font-weight: 500 !important;
    line-height: 1 !important;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18) !important;
    -webkit-tap-highlight-color: transparent !important;
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

function getFirstTwoNames(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
}

function normalizeFamilyGroupPersonLabels(panel: HTMLElement) {
  panel
    .querySelectorAll<HTMLSpanElement>('button[class*="border-blue-100"][class*="w-full"] > span')
    .forEach((label) => {
      const sourceLabel = label.dataset.fullPersonName || label.textContent || '';
      const nextLabel = getFirstTwoNames(sourceLabel);

      if (!nextLabel) return;
      label.dataset.fullPersonName = sourceLabel;
      if (label.textContent !== nextLabel) label.textContent = nextLabel;
    });
}

function closeLineGenerationControlsPanel(panel: HTMLElement) {
  const closeBackdropButton = panel.querySelector<HTMLButtonElement>('button[aria-label="Fechar painel de visualização"]');
  closeBackdropButton?.click();
}

function ensureLineGenerationCloseButton(panel: HTMLElement) {
  const surface = panel.querySelector<HTMLElement>('section');
  if (!surface) return;

  const existingButton = surface.querySelector<HTMLButtonElement>(`.${LINE_PANEL_CLOSE_BUTTON_CLASS}`);
  if (existingButton) return;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = LINE_PANEL_CLOSE_BUTTON_CLASS;
  closeButton.setAttribute('aria-label', 'Fechar painel de visualização');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeLineGenerationControlsPanel(panel);
  });

  surface.appendChild(closeButton);
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

  normalizeFamilyGroupPersonLabels(panel);
  ensureLineGenerationCloseButton(panel);
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
