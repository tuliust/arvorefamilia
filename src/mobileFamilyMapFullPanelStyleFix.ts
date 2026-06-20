const STYLE_ID = 'mobile-family-map-full-panel-style-fix';

function ensureStyles() {
  document.getElementById(STYLE_ID)?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      div[role="dialog"][aria-label="Painel de visualização"] {
        background: rgba(15, 23, 42, 0.56) !important;
      }

      div[role="dialog"][aria-label="Painel de visualização"] > button[aria-label="Fechar painel de visualização"] {
        background: rgba(15, 23, 42, 0.56) !important;
      }

      div[role="dialog"][aria-label="Painel de visualização"] > section {
        background: #ffffff !important;
        opacity: 1 !important;
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
