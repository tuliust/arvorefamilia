import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { HomeHeader } from '../home/HomeHeader';
import { HomeMobileNav } from '../home/HomeMobileNav';
import type { Pessoa } from '../../types';
import {
  MobileTreeChromeProvider,
  useMobileTreeChrome,
  type MobileTreeChromeConfig,
} from './MobileTreeChromeContext';

function TreeMapSharedLayoutContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { chromeConfig } = useMobileTreeChrome();
  const [legendOpen, setLegendOpen] = useState(false);
  const fallbackSearchInputRef = useRef<HTMLInputElement | null>(null);

  const navigateFromTree = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    setLegendOpen(false);
    window.dispatchEvent(new CustomEvent('arvorefamilia:tree-map-route-change', {
      detail: { pathname: location.pathname, search: location.search },
    }));
  }, [location.pathname, location.search]);

  const fallbackChromeConfig = useMemo<MobileTreeChromeConfig>(() => ({
    currentTreeViewLabel: 'Árvore Familiar',
    isSearchExpanded: false,
    searchExpanded: false,
    onSearchExpandedChange: () => undefined,
    searchTerm: '',
    onSearchTermChange: () => undefined,
    searchInputRef: fallbackSearchInputRef,
    pessoasFiltradas: [],
    handleSearchSelect: (_pessoa: Pessoa) => undefined,
    headerActionTextClassName: 'hidden sm:inline',
    onCuriosities: () => navigateFromTree('/curiosidades'),
    navigateFromHome: navigateFromTree,
  }), [navigateFromTree]);

  const activeChromeConfig = chromeConfig ?? fallbackChromeConfig;

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden overscroll-none bg-gray-50"
      data-tree-map-shared-layout="true"
    >
      <div className="contents md:hidden" data-tree-map-shared-mobile-header="true">
        <HomeHeader {...activeChromeConfig} />
      </div>

      <main
        className="relative flex min-h-0 flex-1 overflow-hidden overscroll-none"
        data-tree-map-shared-outlet="true"
      >
        <Outlet />
      </main>

      <div className="contents md:hidden" data-tree-map-shared-mobile-nav="true">
        <HomeMobileNav
          legendOpen={legendOpen}
          onToggleLegend={() => setLegendOpen((open) => !open)}
          navigateFromHome={activeChromeConfig.navigateFromHome}
        />
      </div>
    </div>
  );
}

export function TreeMapSharedLayout() {
  return (
    <MobileTreeChromeProvider>
      <TreeMapSharedLayoutContent />
    </MobileTreeChromeProvider>
  );
}
