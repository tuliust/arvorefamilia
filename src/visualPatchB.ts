const STYLE_ID = 'family-map-filtered-group-width-style';

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (min-width: 768px) {
      [data-family-map-export-root="true"] [data-family-map-group="true"] > div.grid {
        justify-content: center;
      }

      [data-family-map-export-root="true"] [data-family-map-group="true"] > div.grid.grid-cols-1 {
        grid-template-columns: minmax(0, min(100%, 12.5rem));
      }
    }
  `;
  document.head.appendChild(style);
}

if (typeof document !== 'undefined') {
  ensureStyles();
}

export {};
