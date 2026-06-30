const STYLE_ID = 'mobile-family-map-overview-tile-visual-adjustments-style';

function removeLegacyTileAdjustmentStyle() {
  if (typeof document === 'undefined') return;
  document.getElementById(STYLE_ID)?.remove();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  removeLegacyTileAdjustmentStyle();

  window.addEventListener('resize', removeLegacyTileAdjustmentStyle, { passive: true });
  window.addEventListener('orientationchange', removeLegacyTileAdjustmentStyle, { passive: true });
  window.addEventListener('popstate', removeLegacyTileAdjustmentStyle, { passive: true });
  document.addEventListener('visibilitychange', removeLegacyTileAdjustmentStyle, { passive: true });
}

export {};
