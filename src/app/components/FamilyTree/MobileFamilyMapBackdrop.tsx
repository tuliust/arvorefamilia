import React from 'react';

type MobileFamilyMapBackdropMode = 'partial' | 'immersive';

interface MobileFamilyMapBackdropProps {
  mode: MobileFamilyMapBackdropMode;
  top?: number;
  onClick?: () => void;
}

export function MobileFamilyMapBackdrop({
  mode,
  top = 0,
  onClick,
}: MobileFamilyMapBackdropProps) {
  const className = mode === 'immersive'
    ? 'fixed inset-0 z-[11990] bg-slate-950/35 backdrop-blur-[5px] saturate-[0.86] md:hidden'
    : 'fixed inset-x-0 z-[9990] bg-slate-950/30 backdrop-blur-[5px] saturate-[0.86] pointer-events-none md:hidden';

  const style = mode === 'partial'
    ? {
        top: `${Math.max(0, Math.ceil(top))}px`,
        bottom: 'calc(env(safe-area-inset-bottom,0px) + 5.25rem)',
      }
    : undefined;

  if (mode === 'immersive' && onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        aria-label="Fechar camada de visualizacao"
        data-mobile-family-map-backdrop="immersive"
        data-tree-export-ignore="true"
      />
    );
  }

  return (
    <div
      className={className}
      style={style}
      aria-hidden="true"
      data-mobile-family-map-backdrop={mode}
      data-tree-export-ignore="true"
    />
  );
}
