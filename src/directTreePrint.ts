const SIDEBAR_TREE_ACTION_EVENT = 'arvore-family-tree-action';
const STYLE_ID = 'direct-tree-print-style';
const TREE_MAP_PATHS = new Set(['/mapa-familiar', '/mapa-familiar-horizontal']);

function getCurrentPath() {
  return window.location.pathname.replace(/\/$/, '');
}

function isTreeMapRoute() {
  return TREE_MAP_PATHS.has(getCurrentPath());
}

function ensureDirectPrintStyle() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media print {
      @page {
        margin: 0;
        size: landscape;
      }

      html[data-tree-direct-print="true"],
      html[data-tree-direct-print="true"] body,
      html[data-tree-direct-print="true"] #root {
        width: 100% !important;
        min-width: 100% !important;
        height: auto !important;
        min-height: 100% !important;
        overflow: visible !important;
        background: #f7f1e8 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      html[data-tree-direct-print="true"] header,
      html[data-tree-direct-print="true"] aside,
      html[data-tree-direct-print="true"] nav,
      html[data-tree-direct-print="true"] .tree-canvas-zoom-controls,
      html[data-tree-direct-print="true"] [data-tree-export-ignore="true"],
      html[data-tree-direct-print="true"] a[href="/duvidas"].fixed.bottom-8.right-8 {
        display: none !important;
        visibility: hidden !important;
      }

      html[data-tree-direct-print="true"] main {
        position: static !important;
        display: block !important;
        width: 100vw !important;
        min-width: 100vw !important;
        height: auto !important;
        min-height: 100vh !important;
        overflow: visible !important;
        background: #f7f1e8 !important;
      }

      html[data-tree-direct-print="true"] main > section {
        position: static !important;
        display: block !important;
        width: 100vw !important;
        min-width: 100vw !important;
        max-width: 100vw !important;
        height: auto !important;
        min-height: 100vh !important;
        overflow: visible !important;
        background: #f7f1e8 !important;
        flex: none !important;
      }

      html[data-tree-direct-print="true"] [data-family-map-export-root="true"],
      html[data-tree-direct-print="true"] [data-family-map-horizontal-root="true"],
      html[data-tree-direct-print="true"] [data-export-root="family-tree"] {
        overflow: visible !important;
        background: #f7f1e8 !important;
        isolation: isolate !important;
      }

      html[data-tree-direct-print="true"] [data-export-root="family-tree"] > div.absolute.left-0.right-0 {
        top: 82px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function printCurrentTreePage() {
  ensureDirectPrintStyle();

  const root = document.documentElement;
  let fallbackCleanupTimer: number | undefined;

  const cleanup = () => {
    delete root.dataset.treeDirectPrint;
    window.removeEventListener('afterprint', cleanup);

    if (fallbackCleanupTimer !== undefined) {
      window.clearTimeout(fallbackCleanupTimer);
    }
  };

  root.dataset.treeDirectPrint = 'true';
  window.addEventListener('afterprint', cleanup, { once: true });

  window.setTimeout(() => {
    window.print();
    fallbackCleanupTimer = window.setTimeout(cleanup, 1600);
  }, 120);
}

function handleTreeAction(event: Event) {
  const action = (event as CustomEvent<string>).detail;

  if (action !== 'print' || !isTreeMapRoute()) return;

  event.stopImmediatePropagation();
  printCurrentTreePage();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureDirectPrintStyle();
  window.addEventListener(SIDEBAR_TREE_ACTION_EVENT, handleTreeAction, true);
}

export {};
