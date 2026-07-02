const STYLE_ID = 'header-notifications-full-text-fix-style';

function ensureNotificationFullTextStyle() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    [role="menu"][aria-label="Últimas notificações"] .line-clamp-2 {
      display: block !important;
      -webkit-box-orient: initial !important;
      -webkit-line-clamp: unset !important;
      overflow: visible !important;
    }

    [role="menu"][aria-label="Últimas notificações"] h3.truncate {
      overflow: visible !important;
      text-overflow: clip !important;
      white-space: normal !important;
    }
  `;
  document.head.appendChild(style);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureNotificationFullTextStyle();
}

export {};
