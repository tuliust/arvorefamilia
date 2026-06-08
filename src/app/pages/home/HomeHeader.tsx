import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { CalendarDays, FileText, MessageCircle, Network, Search, Sparkles, UserRound } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../../components/ui/select';
import { UserProfileMenu } from '../../components/layout/UserProfileMenu';
import { PageFavoriteButton } from '../../components/favorites/PageFavoriteButton';
import type { TreeViewMode } from '../../components/FamilyTree/treeViewMode';
import {
  TREE_COLOR_PALETTE_CSS_VARIABLES,
  TREE_COLOR_PALETTE_STORAGE_KEY,
  TREE_COLOR_PALETTES,
  isTreeColorPalette,
  type TreeColorPalette,
} from '../../components/FamilyTree/treeColorPalettes';
import { FAVORITE_PAGES } from '../../constants/favoritePages';
import type { GlobalSearchPageResult } from '../../services/globalSearchService';
import type { Pessoa } from '../../types';

function normalizeSearchText(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

function filterDefaultPages(term: string) {
  const normalizedTerm = normalizeSearchText(term);
  if (!normalizedTerm) return [];

  return FAVORITE_PAGES.filter((page) => {
    const haystack = [page.title, page.description, ...page.keywords].map(normalizeSearchText).join(' ');
    return haystack.includes(normalizedTerm);
  });
}

function formatSuggestionBirthDate(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return `${slashMatch[1].padStart(2, '0')}/${slashMatch[2].padStart(2, '0')}/${slashMatch[3]}`;
  }

  return raw;
}

function getPersonSuggestionDetail(pessoa: Pessoa) {
  const birthPlace = String(pessoa.local_nascimento ?? '').trim();
  const birthDate = formatSuggestionBirthDate(pessoa.data_nascimento);
  return [birthPlace, birthDate].filter(Boolean).join(' – ');
}

const paletteOptions: TreeColorPalette[] = ['white', 'orange', 'brown'];

function getStoredPalette(): TreeColorPalette {
  if (typeof window === 'undefined') return 'white';

  const stored = window.localStorage.getItem(TREE_COLOR_PALETTE_STORAGE_KEY);
  return isTreeColorPalette(stored) ? stored : 'white';
}

function applyTreePalette(value: TreeColorPalette) {
  if (typeof document === 'undefined') return;

  const palette = TREE_COLOR_PALETTES[value];
  const root = document.documentElement;

  root.dataset.treeColorPalette = value;

  TREE_COLOR_PALETTE_CSS_VARIABLES.forEach((variableName) => {
    root.style.setProperty(variableName, palette.cssVariables[variableName]);
  });
}

interface HomeHeaderProps {
  currentTreeViewLabel: string;
  treeViewMode: TreeViewMode;
  onTreeViewModeChange: (value: TreeViewMode) => void;
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
  navigateFromHome: (path: string) => void;
}

export function HomeHeader({
  currentTreeViewLabel,
  treeViewMode,
  onTreeViewModeChange,
  isSearchExpanded,
  searchExpanded,
  onSearchExpandedChange,
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
  searchInputRef,
  pessoasFiltradas,
  pageSuggestions,
  handleSearchSelect,
  handlePageSuggestionSelect,
  headerActionTextClassName,
  onCuriosities,
  navigateFromHome,
}: HomeHeaderProps) {
  const location = useLocation();
  const searchRootRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRootRef = useRef<HTMLDivElement | null>(null);
  const [searchSuggestionsDismissed, setSearchSuggestionsDismissed] = useState(false);
  const [treeColorPalette, setTreeColorPalette] = useState<TreeColorPalette>(getStoredPalette);
  const trimmedSearchTerm = searchTerm.trim();
  const effectivePageSuggestions = pageSuggestions ?? filterDefaultPages(searchTerm);
  const hasSearchSuggestions = Boolean(
    searchExpanded &&
    trimmedSearchTerm &&
    !searchSuggestionsDismissed &&
    (pessoasFiltradas.length > 0 || effectivePageSuggestions.length > 0)
  );

  useEffect(() => {
    setSearchSuggestionsDismissed(false);
  }, [searchTerm]);

  useEffect(() => {
    applyTreePalette(treeColorPalette);
    window.localStorage.setItem(TREE_COLOR_PALETTE_STORAGE_KEY, treeColorPalette);
  }, [treeColorPalette]);

  useEffect(() => {
    if (!searchExpanded) {
      setSearchSuggestionsDismissed(false);
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (searchRootRef.current?.contains(target)) return;
      if (mobileSearchRootRef.current?.contains(target)) return;
      setSearchSuggestionsDismissed(true);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchSuggestionsDismissed(true);
        onSearchExpandedChange(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchExpanded, onSearchExpandedChange]);

  const handleSearchTermChange = (value: string) => {
    setSearchSuggestionsDismissed(false);
    onSearchTermChange(value);
  };

  const submitSearch = () => {
    if (!trimmedSearchTerm) return;
    if (onSearchSubmit) {
      onSearchSubmit();
      return;
    }
    onSearchExpandedChange(false);
    navigateFromHome('/busca?q=' + encodeURIComponent(trimmedSearchTerm));
  };

  const selectPageSuggestion = (page: GlobalSearchPageResult) => {
    onSearchExpandedChange(false);
    onSearchTermChange('');
    if (handlePageSuggestionSelect) {
      handlePageSuggestionSelect(page);
      return;
    }
    navigateFromHome(page.path);
  };

  const renderSearchSuggestions = (className: string) => (
    hasSearchSuggestions && (
      <div className={className}>
        {pessoasFiltradas.length > 0 && (
          <div className="border-b border-gray-100 bg-white py-1">
            <p className="bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">PESSOAS</p>
            {pessoasFiltradas.slice(0, 6).map((pessoa) => {
              const suggestionDetail = getPersonSuggestionDetail(pessoa);

              return (
                <button key={pessoa.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => handleSearchSelect(pessoa)} className="flex w-full gap-3 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-900">{pessoa.nome_completo}</span>
                    {suggestionDetail && <span className="mt-1 block truncate text-xs text-gray-500">{suggestionDetail}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {effectivePageSuggestions.length > 0 && (
          <div className="border-b border-gray-100 bg-white py-1 last:border-b-0">
            <p className="bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">PÁGINAS</p>
            {effectivePageSuggestions.slice(0, 5).map((page) => (
              <button key={page.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectPageSuggestion(page)} className="flex w-full gap-3 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900">{page.title}</span>
                  <span className="mt-1 block truncate text-xs text-gray-500">{page.description}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={submitSearch} className="flex w-full items-center gap-2 bg-white px-4 py-3 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50">
          <Search className="h-4 w-4" />
          Ver todos os resultados
        </button>
      </div>
    )
  );

  return (
    <header className="relative z-[500] shrink-0 overflow-visible border-b border-gray-200 bg-white py-2 shadow-sm">
      <div className="relative z-[501] flex min-h-14 w-full min-w-0 flex-nowrap items-center justify-between gap-1.5 overflow-visible px-4 sm:gap-2 sm:px-6 lg:h-14 lg:gap-4 lg:px-8">
        {searchExpanded && (
          <div ref={mobileSearchRootRef} className="relative z-[505] flex w-full min-w-0 items-center gap-2 md:hidden">
            <form className="min-w-0 flex-1" onSubmit={(event) => { event.preventDefault(); submitSearch(); }}>
              <label className="relative block min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar pessoa ou página..."
                  value={searchTerm}
                  onChange={(event) => handleSearchTermChange(event.target.value)}
                  onFocus={() => setSearchSuggestionsDismissed(false)}
                  className="h-10 rounded-xl bg-white pl-9 pr-3 text-base"
                  autoFocus
                />
              </label>
            </form>
            <button
              type="button"
              className="shrink-0 rounded-lg px-2 py-2 text-sm font-semibold text-blue-700"
              onClick={() => {
                setSearchSuggestionsDismissed(false);
                onSearchExpandedChange(false);
              }}
            >
              Cancelar
            </button>
            {renderSearchSuggestions('absolute left-0 right-0 top-full z-[999] mt-2 max-h-[min(70dvh,28rem)] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl')}
          </div>
        )}

        <div className={[searchExpanded ? 'hidden md:flex' : 'flex', 'min-w-0 flex-1 items-center gap-3 overflow-visible'].join(' ')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
            <Network className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1 overflow-visible">
            <h1 className="whitespace-nowrap text-xl font-bold leading-tight text-gray-900 md:hidden">Barros Souza</h1>
            <h1 className="hidden whitespace-normal text-base font-bold leading-tight text-gray-900 sm:text-lg md:block lg:truncate lg:whitespace-nowrap lg:text-xl">Família Barros Souza</h1>
            <p className="hidden whitespace-normal text-xs leading-tight text-gray-500 md:block lg:truncate lg:whitespace-nowrap lg:text-sm">{currentTreeViewLabel}</p>
          </div>
        </div>

        <div className={['min-w-0 shrink-0 flex-nowrap items-center justify-center gap-1.5 overflow-visible sm:gap-2', isSearchExpanded ? 'hidden lg:flex' : 'hidden md:flex'].join(' ')}>
          <Select value={treeViewMode} onValueChange={(value) => onTreeViewModeChange(value as TreeViewMode)}>
            <SelectTrigger className="relative z-20 h-9 w-[9.5rem] max-w-[48vw] min-w-[8.25rem] shrink-0 gap-1.5 overflow-visible rounded-xl border-blue-300 bg-blue-50 px-2.5 text-sm font-semibold text-blue-900 shadow-md transition hover:border-blue-400 hover:bg-blue-100 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 sm:min-w-[10.5rem] sm:px-3 lg:min-w-[13rem]" aria-label={`Visualização atual: ${currentTreeViewLabel}`} title={currentTreeViewLabel}>
              <Network className="h-4 w-4 shrink-0 text-blue-700" />
              <span className="min-w-0 truncate">{currentTreeViewLabel}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minha-arvore">Minha Árvore</SelectItem>
              <SelectItem value="genealogia">Genealogia</SelectItem>
              <SelectItem value="visao-completa">Visão Completa</SelectItem>

              <div className="mx-2 my-1 border-t border-gray-200 pt-2">
                <div className="flex items-center gap-2 px-1 pb-1" aria-label="Paleta de cores da árvore">
                  {paletteOptions.map((paletteKey) => {
                    const palette = TREE_COLOR_PALETTES[paletteKey];
                    const isActive = paletteKey === treeColorPalette;

                    return (
                      <button
                        key={paletteKey}
                        type="button"
                        aria-label={palette.ariaLabel}
                        aria-pressed={isActive}
                        title={palette.label}
                        className={[
                          'h-5 w-5 rounded-full border transition',
                          isActive
                            ? 'scale-110 ring-2 ring-slate-900 ring-offset-2'
                            : 'hover:scale-105 hover:ring-2 hover:ring-slate-300 hover:ring-offset-1',
                        ].join(' ')}
                        style={{
                          backgroundColor: palette.swatch,
                          borderColor: palette.swatchBorder,
                        }}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setTreeColorPalette(paletteKey);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </SelectContent>
          </Select>

          <PageFavoriteButton path={location.pathname} className="h-9 w-9 rounded-xl border-gray-200 shadow-sm" />
          <Button variant="outline" className="hidden h-9 shrink-0 gap-2 px-2 md:inline-flex lg:px-3" title="Curiosidades" aria-label="Abrir Curiosidades" onClick={onCuriosities}>
            <Sparkles className="h-4 w-4" />
            <span className={headerActionTextClassName}>Curiosidades</span>
          </Button>
          <Button variant="outline" className="hidden h-9 shrink-0 gap-2 px-2 lg:inline-flex lg:px-3" title="Fórum de Discussões" aria-label="Abrir Fórum de Discussões" onClick={() => navigateFromHome('/forum')}>
            <MessageCircle className="h-4 w-4" />
            <span className={headerActionTextClassName}>Fórum</span>
          </Button>
          <Button variant="outline" className="hidden h-9 shrink-0 gap-2 px-2 xl:inline-flex lg:px-3" title="Calendário familiar" aria-label="Abrir Calendário familiar" onClick={() => navigateFromHome('/calendario-familiar')}>
            <CalendarDays className="h-4 w-4" />
            <span className={headerActionTextClassName}>Calendário</span>
          </Button>
        </div>

        <div className={[searchExpanded ? 'hidden md:flex' : 'flex', 'min-w-0 shrink-0 items-center justify-end gap-1.5 overflow-visible sm:gap-2'].join(' ')}>
          <div ref={searchRootRef} className="relative z-[502] flex min-w-0 flex-row-reverse items-center overflow-visible">
            <Button
              variant="outline"
              size="icon"
              className="relative z-[504] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white"
              title="Buscar por pessoa ou página"
              aria-label={searchExpanded ? 'Busca expandida' : 'Abrir busca'}
              onClick={() => {
                setSearchSuggestionsDismissed(false);
                onSearchExpandedChange(true);
              }}
            >
              <Search className="pointer-events-none h-4 w-4" />
            </Button>

            <div className={['relative z-[503] min-w-0 overflow-visible transition-all duration-300 ease-out', searchExpanded ? 'pointer-events-auto w-[min(60vw,380px)] opacity-100 sm:w-[min(46vw,420px)]' : 'pointer-events-none w-0 opacity-0'].join(' ')}>
              <div className="pr-2">
                <form onSubmit={(event) => { event.preventDefault(); submitSearch(); }}>
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar pessoa ou página..."
                    value={searchTerm}
                    onChange={(e) => handleSearchTermChange(e.target.value)}
                    onFocus={() => setSearchSuggestionsDismissed(false)}
                    onBlur={() => { window.setTimeout(() => { if (!searchTerm.trim()) onSearchExpandedChange(false); }, 160); }}
                    className="h-10 bg-white"
                    tabIndex={searchExpanded ? 0 : -1}
                  />
                </form>

                {renderSearchSuggestions('absolute left-0 right-2 top-full z-[999] mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl')}
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <PageFavoriteButton path={location.pathname} className="h-10 w-10 rounded-xl border-gray-200 shadow-sm" />
          </div>
          <div className="md:hidden">
            <UserProfileMenu />
          </div>
          <div className="hidden md:block">
            <UserProfileMenu variant="home-header" />
          </div>
        </div>
      </div>
    </header>
  );
}
