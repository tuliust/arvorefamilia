import React from 'react';
import type { MobileFamilyMapToolbarAction } from './MobileFamilyMapToolbar';

interface MobileFamilyMapContextTrayProps {
  action: MobileFamilyMapToolbarAction;
  children: React.ReactNode;
  className?: string;
}

export const MobileFamilyMapContextTray = React.forwardRef<HTMLDivElement, MobileFamilyMapContextTrayProps>(
  function MobileFamilyMapContextTray({ action, children, className = '' }, ref) {
    return (
      <div
        ref={ref}
        className={[
          'fixed z-[10001] md:hidden',
          action === 'cor' ? 'inset-x-3' : 'inset-x-2',
          'top-[calc(env(safe-area-inset-top,0px)+8.15rem)]',
          className,
        ].filter(Boolean).join(' ')}
        data-mobile-family-map-context-tray="true"
        data-mobile-family-map-context-action={action}
        data-tree-export-ignore="true"
      >
        {children}
      </div>
    );
  }
);
