import React, { useLayoutEffect, useState } from 'react';

type MobileFamilyMapBackdropMode = 'partial' | 'immersive';

interface MobileFamilyMapBackdropProps {
  mode: MobileFamilyMapBackdropMode;
  top?: number;
  onClick?: () => void;
}

function getBottomNavigationOffset() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  if (!viewportHeight) return 0;

  const bottomNavigation = Array.from(document.querySelectorAll<HTMLElement>('nav[data-tree-export-ignore="true"]'))
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top > viewportHeight / 2 &&
      Math.abs(rect.bottom - viewportHeight) <= 8
    ))
    .sort((a, b) => b.height - a.height)[0];

  if (!bottomNavigation) return 0;

  return Math.max(0, Math.ceil(viewportHeight - bottomNavigation.top));
}

export function MobileFamilyMapBackdrop({
  mode,
  top = 0,
  onClick,
}: MobileFamilyMapBackdropProps) {
  const [bottomOffset, setBottomOffset] = useState(0);

  useLayoutEffect(() => {
    if (mode !== 'partial' || typeof window === 'undefined') {
      setBottomOffset(0);
      return;
    }

    let animationFrameId = 0;
    const timeoutIds: number[] = [];

    const updateBottomOffset = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        setBottomOffset(getBottomNavigationOffset());
      });
    };

    updateBottomOffset();
    [60, 180, 420].forEach((delay) => {
      timeoutIds.push(window.setTimeout(updateBottomOffset, delay));
    });

    window.addEventListener('resize', updateBottomOffset, { passive: true });
    window.addEventListener('orientationchange', updateBottomOffset, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      window.removeEventListener('resize', updateBottomOffset);
      window.removeEventListener('orientationchange', updateBottomOffset);
    };
  }, [mode]);

  const className = mode === 'immersive'
    ? 'fixed inset-0 z-[9990] bg-slate-950/35 backdrop-blur-[5px] saturate-[0.86] md:hidden'
    : 'fixed inset-x-0 z-[9990] bg-slate-950/30 backdrop-blur-[5px] saturate-[0.86] pointer-events-none md:hidden';

  const style = mode === 'partial'
    ? {
        top: `${Math.max(0, Math.ceil(top))}px`,
        bottom: bottomOffset > 0
          ? `${bottomOffset}px`
          : 'calc(env(safe-area-inset-bottom,0px) + 4.5rem)',
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
