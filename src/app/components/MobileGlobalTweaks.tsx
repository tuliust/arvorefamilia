import React from 'react';

const mobileGlobalTweaks = `
@media (max-width: 767px) {
  header [aria-label="Últimas notificações"] {
    position: fixed !important;
    left: 0.75rem !important;
    right: 0.75rem !important;
    top: calc(env(safe-area-inset-top, 0px) + 4.75rem) !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(32rem, calc(100vh - 7rem)) !important;
    transform: none !important;
    z-index: 900 !important;
  }

  main form section:has(div[style*="width:"]) .border-t {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
  }

  main form section:has(div[style*="width:"]) .border-t button {
    width: 3rem !important;
    min-width: 3rem !important;
    max-width: 3rem !important;
    height: 3rem !important;
    min-height: 3rem !important;
    padding: 0 !important;
    flex: 0 0 3rem !important;
    overflow: hidden !important;
    border-radius: 9999px !important;
  }

  main form section:has(div[style*="width:"]) .border-t button svg {
    width: 1.25rem !important;
    height: 1.25rem !important;
    margin: 0 !important;
  }

  main form section:has(div[style*="width:"]) .border-t button {
    color: transparent !important;
  }

  main form section:has(div[style*="width:"]) .border-t button svg {
    color: currentColor;
    color: initial !important;
    stroke: rgb(37, 99, 235) !important;
  }
}
`;

export function MobileGlobalTweaks() {
  return <style>{mobileGlobalTweaks}</style>;
}
