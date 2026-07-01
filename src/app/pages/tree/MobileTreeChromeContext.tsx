import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Pessoa } from '../../types';
import type { GlobalSearchPageResult } from '../../services/globalSearchService';

type NavigateFromTree = (path: string) => void;

export type MobileTreeChromeConfig = {
  currentTreeViewLabel: string;
  isSearchExpanded: boolean;
  searchExpanded: boolean;
  onSearchExpandedChange: (value: boolean) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearchSubmit?: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  pessoasFiltradas: Pessoa[];
  pageSuggestions?: GlobalSearchPageResult[];
  handleSearchSelect: (pessoa: Pessoa) => void;
  handlePageSuggestionSelect?: (page: GlobalSearchPageResult) => void;
  headerActionTextClassName: string;
  onCuriosities: () => void;
  navigateFromHome: NavigateFromTree;
  showViewAsSelector?: boolean;
  viewAsPersonValue?: string;
  viewAsPersonOptions?: Array<{ id: string; label: string }>;
  onViewAsPersonChange?: (personId: string) => void;
};

type MobileTreeChromeContextValue = {
  chromeConfig: MobileTreeChromeConfig | null;
  registerChrome: (config: MobileTreeChromeConfig) => void;
  clearChrome: (config: MobileTreeChromeConfig) => void;
};

const MobileTreeChromeContext = createContext<MobileTreeChromeContextValue | null>(null);

export function MobileTreeChromeProvider({ children }: { children: React.ReactNode }) {
  const [chromeConfig, setChromeConfig] = useState<MobileTreeChromeConfig | null>(null);

  const value = useMemo<MobileTreeChromeContextValue>(() => ({
    chromeConfig,
    registerChrome: (config) => setChromeConfig(config),
    clearChrome: (config) => {
      setChromeConfig((current) => (current === config ? null : current));
    },
  }), [chromeConfig]);

  return (
    <MobileTreeChromeContext.Provider value={value}>
      {children}
    </MobileTreeChromeContext.Provider>
  );
}

export function useMobileTreeChrome() {
  const context = useContext(MobileTreeChromeContext);
  if (!context) {
    throw new Error('useMobileTreeChrome deve ser usado dentro de MobileTreeChromeProvider.');
  }
  return context;
}

export function useRegisterMobileTreeChrome(config: MobileTreeChromeConfig | null) {
  const { registerChrome, clearChrome } = useMobileTreeChrome();

  useEffect(() => {
    if (!config) return undefined;

    registerChrome(config);
    return () => clearChrome(config);
  }, [clearChrome, config, registerChrome]);
}
