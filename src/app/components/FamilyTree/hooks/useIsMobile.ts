import { useEffect, useState } from 'react';

const DEFAULT_BREAKPOINT = 1024;
const DESKTOP_UNSUPPORTED_TREE_PATHS = new Set(['/minha-arvore', '/genealogia']);

function normalizeDesktopTreePath(isMobile: boolean) {
  if (typeof window === 'undefined' || isMobile) return;
  if (!DESKTOP_UNSUPPORTED_TREE_PATHS.has(window.location.pathname)) return;

  const nextUrl = `/mapa-familiar${window.location.search}`;
  window.history.replaceState(window.history.state, '', nextUrl);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useIsMobile(breakpoint: number = DEFAULT_BREAKPOINT) {
  const getValue = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  };

  const [isMobile, setIsMobile] = useState<boolean>(getValue);

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = getValue();
      normalizeDesktopTreePath(nextIsMobile);
      setIsMobile(nextIsMobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}
