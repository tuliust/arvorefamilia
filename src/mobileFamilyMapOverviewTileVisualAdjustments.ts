const STYLE_ID = 'mobile-family-map-overview-tile-visual-adjustments-style';
const OVERVIEW_ID = 'mobile-family-tree-overview-mode';

function isDirectMapOverviewStable() {
  if (typeof document === 'undefined') return false;
  const overview = document.getElementById(OVERVIEW_ID);
  return overview?.getAttribute('data-mobile-family-map-overview-source') === 'direct-map'
    && overview?.getAttribute('data-mobile-family-map-overview-stable') === 'true';
}

function removeLegacyTileAdjustmentStyle() {
  if (typeof document === 'undefined') return;
  if (isDirectMapOverviewStable()) return;
  document.getElementById(STYLE_ID)?.remove();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  removeLegacyTileAdjustmentStyle();
}

export {};
