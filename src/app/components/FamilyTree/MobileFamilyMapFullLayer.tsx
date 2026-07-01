import React from 'react';

interface MobileFamilyMapFullLayerProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileFamilyMapFullLayer({
  title,
  children,
}: MobileFamilyMapFullLayerProps) {
  return (
    <section
      className="pointer-events-none fixed inset-0 z-[12010] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-mobile-family-map-full-layer="true"
      data-tree-export-ignore="true"
    >
      <h2 className="sr-only">{title}</h2>

      <div
        className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] top-[calc(env(safe-area-inset-top,0px)+8.15rem)] bg-white/95"
        aria-hidden="true"
        data-mobile-family-map-full-flat-base="true"
      />

      <div className="pointer-events-auto absolute inset-x-2 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] top-[calc(env(safe-area-inset-top,0px)+8.15rem)] overflow-hidden rounded-[1.5rem] border border-white/80 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.30)]">
        {children}
      </div>
    </section>
  );
}
