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
      className="fixed inset-x-2 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] top-[calc(env(safe-area-inset-top,0px)+0.75rem)] z-[12010] flex flex-col overflow-hidden rounded-[1.5rem] border border-white/80 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.30)] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-mobile-family-map-full-layer="true"
      data-tree-export-ignore="true"
    >
      <div className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur">
        <h2 className="min-w-0 truncate text-sm font-black leading-none text-slate-950">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-blue-700 shadow-sm active:scale-95"
        >
          Fechar
        </button>
      </div>
      <div className="min-h-0 flex-1">
        {children}
      </div>
    </section>
  );
}
