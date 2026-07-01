import React from 'react';

interface MobileFamilyMapFullLayerProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileFamilyMapFullLayer({
  title,
  onClose,
  children,
}: MobileFamilyMapFullLayerProps) {
  return (
    <section
      className="fixed inset-0 z-[12010] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-mobile-family-map-full-layer="true"
      data-tree-export-ignore="true"
    >
      <h2 className="sr-only">{title}</h2>

      <div className="absolute inset-x-2 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] top-[calc(env(safe-area-inset-top,0px)+0.75rem)] overflow-hidden rounded-[1.5rem] border border-white/80 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.30)]">
        {children}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="fixed right-[calc(env(safe-area-inset-right,0px)+1rem)] top-[calc(env(safe-area-inset-top,0px)+1rem)] z-[12030] flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-black leading-none text-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.22)] transition active:scale-95"
        aria-label="Fechar"
      >
        X
      </button>
    </section>
  );
}
