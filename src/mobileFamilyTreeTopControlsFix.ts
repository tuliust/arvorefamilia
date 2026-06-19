const STYLE_ID = 'mobile-family-tree-top-controls-fix-style';

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      header,
      header * {
        pointer-events: auto !important;
      }

      header {
        position: relative !important;
        z-index: 10500 !important;
      }

      [data-mobile-family-map-toolbar="true"] {
        z-index: 10600 !important;
        pointer-events: auto !important;
        isolation: isolate !important;
      }

      [data-mobile-family-map-toolbar="true"] *,
      [data-mobile-family-map-toolbar="true"] button {
        pointer-events: auto !important;
        touch-action: manipulation !important;
      }

      [data-mobile-family-map-toolbar="true"] button {
        position: relative !important;
        z-index: 1 !important;
      }

      #mobile-family-tree-overview-mode,
      .tree-mobile-controls-modal {
        z-index: 12050 !important;
      }
    }
  `;

  document.head.appendChild(style);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  window.addEventListener('resize', ensureStyles, { passive: true });
  window.addEventListener('orientationchange', ensureStyles, { passive: true });
  window.addEventListener('focus', ensureStyles, { passive: true });
  [80, 300, 900].forEach((delay) => window.setTimeout(ensureStyles, delay));
}

export {};