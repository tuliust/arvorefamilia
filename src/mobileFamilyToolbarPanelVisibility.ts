const STYLE_ID = 'mobile-family-toolbar-panel-visibility-style';

function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      [data-mobile-family-map-toolbar="true"] {
        z-index: 10000 !important;
        pointer-events: auto !important;
        padding-bottom: 0.5rem !important;
      }

      [data-mobile-family-map-toolbar="true"] button,
      [data-mobile-family-map-toolbar="true"] * {
        pointer-events: auto !important;
        touch-action: manipulation !important;
      }

      [data-mobile-family-map-toolbar="true"] ~ [data-tree-export-ignore="true"].fixed:not([role="dialog"]) {
        top: calc(env(safe-area-inset-top, 0px) + 8.65rem) !important;
        z-index: 10002 !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        min-height: auto !important;
        max-height: calc(100dvh - 11rem) !important;
        overflow: visible !important;
        padding: 0.35rem !important;
        border-radius: 1rem !important;
        background: rgba(255, 255, 255, 0.98) !important;
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16) !important;
      }

      [data-mobile-family-map-toolbar="true"] ~ [data-tree-export-ignore="true"].fixed:not([role="dialog"]) *,
      [data-mobile-family-map-toolbar="true"] ~ [data-tree-export-ignore="true"].fixed:not([role="dialog"]) button,
      [data-mobile-family-map-toolbar="true"] ~ [data-tree-export-ignore="true"].fixed:not([role="dialog"]) select {
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        touch-action: manipulation !important;
      }
    }
  `;

  document.head.appendChild(style);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  window.addEventListener('resize', ensureStyles, { passive: true });
  window.addEventListener('orientationchange', ensureStyles, { passive: true });
}

export {};