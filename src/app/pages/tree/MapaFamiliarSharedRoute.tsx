import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { Home } from '../Home';
import type { Pessoa } from '../../types';
import { obterTodasPessoas } from '../../services/dataService';
import { getCachedTreeData } from '../../services/treeDataCache';
import {
  useRegisterMobileTreeChrome,
  type MobileTreeChromeConfig,
} from './MobileTreeChromeContext';

const STYLE_ID = 'mapa-familiar-shared-route-style';

function ensureSharedRouteStyles() {
  if (typeof document === 'undefined') return;

  const css = `
    @media (max-width: 767px) {
      [data-tree-map-shared-content="mapa-familiar"] > .fixed.inset-0 {
        position: relative !important;
        inset: auto !important;
        display: flex !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 0 !important;
        flex: 1 1 auto !important;
        overflow: hidden !important;
        background: transparent !important;
      }

      [data-tree-map-shared-content="mapa-familiar"] > .fixed.inset-0 > header,
      [data-tree-map-shared-content="mapa-familiar"] > .fixed.inset-0 > nav[data-mobile-family-map-toolbar="true"],
      [data-tree-map-shared-content="mapa-familiar"] > .fixed.inset-0 > nav.fixed.inset-x-0.bottom-0,
      [data-tree-map-shared-content="mapa-familiar"] > .fixed.inset-0 > [data-mobile-family-map-context-tray="true"],
      [data-tree-map-shared-content="mapa-familiar"] > .fixed.inset-0 > [data-mobile-family-map-backdrop] {
        display: none !important;
      }

      [data-tree-map-shared-content="mapa-familiar"] > .fixed.inset-0 > main {
        min-height: 0 !important;
        flex: 1 1 auto !important;
        overflow: hidden !important;
      }
    }
  `;

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
  }

  if (style.textContent !== css) style.textContent = css;
  if (!style.parentElement) document.head.appendChild(style);
}

export function MapaFamiliarSharedRoute() {
  const navigate = useNavigate();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [people, setPeople] = useState<Pessoa[]>([]);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ensureSharedRouteStyles();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPeople() {
      const cached = getCachedTreeData();
      if (cached?.pessoas?.length) {
        setPeople(cached.pessoas);
        return;
      }

      try {
        const loadedPeople = await obterTodasPessoas();
        if (!cancelled) setPeople(Array.isArray(loadedPeople) ? loadedPeople : []);
      } catch {
        if (!cancelled) setPeople([]);
      }
    }

    void loadPeople();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPeople = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase('pt-BR');
    if (!term) return [];

    return people
      .filter((person) => person.nome_completo.toLocaleLowerCase('pt-BR').includes(term))
      .slice(0, 8);
  }, [people, searchTerm]);

  const navigateFromHome = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleSearchSubmit = useCallback(() => {
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm) return;

    setSearchExpanded(false);
    navigate(`/busca?q=${encodeURIComponent(trimmedSearchTerm)}`);
  }, [navigate, searchTerm]);

  const handleSearchSelect = useCallback((person: Pessoa) => {
    if (!person.id) return;
    setSearchExpanded(false);
    setSearchTerm('');
    navigate(`/pessoa/${person.id}`);
  }, [navigate]);

  const chromeConfig = useMemo<MobileTreeChromeConfig>(() => ({
    currentTreeViewLabel: 'Mapa Familiar',
    isSearchExpanded: searchExpanded,
    searchExpanded,
    onSearchExpandedChange: setSearchExpanded,
    searchTerm,
    onSearchTermChange: setSearchTerm,
    onSearchSubmit: handleSearchSubmit,
    searchInputRef,
    pessoasFiltradas: filteredPeople,
    handleSearchSelect,
    headerActionTextClassName: 'hidden xl:inline-flex',
    onCuriosities: () => navigate('/curiosidades'),
    navigateFromHome,
  }), [
    filteredPeople,
    handleSearchSelect,
    handleSearchSubmit,
    navigate,
    navigateFromHome,
    searchExpanded,
    searchTerm,
  ]);

  useRegisterMobileTreeChrome(chromeConfig);

  return (
    <div className="contents" data-tree-map-shared-content="mapa-familiar">
      <Home />
    </div>
  );
}
