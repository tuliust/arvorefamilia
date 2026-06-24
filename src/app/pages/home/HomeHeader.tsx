import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, FileText, MessageCircle, Network, Search, Sparkles, Star, UserRound } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { HeaderNotificationsDropdown } from '../../components/layout/HeaderNotificationsDropdown';
import { UserProfileMenu } from '../../components/layout/UserProfileMenu';
import { FAVORITE_PAGES } from '../../constants/favoritePages';
import { useAuth } from '../../contexts/AuthContext';
import { getPrimaryLinkedPersonWithPessoa } from '../../services/memberProfileService';
import { contarNotificacoesNaoLidasSupabase } from '../../services/userEngagementService';
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

function getFirstName(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return '';

  const beforeEmail = clean.includes('@') ? clean.split('@')[0] : clean;
  return beforeEmail.split(/\s+/)[0] || '';
}

const headerToolbarButtonClassName = 'hidden h-9 shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';
const headerIconButtonClassName = 'h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

interface HomeHeaderProps {
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
  navigateFromHome: (path: string) => void;
  [legacyProp: string]: unknown;
}

export function HomeHeader({
  currentTreeViewLabel,
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
  const { user } = useAuth();
  const searchRootRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRootRef = useRef<HTMLDivElement | null>(null);
  const [searchSuggestionsDismissed, setSearchSuggestionsDismissed] = useState(false);
  const [mobileHeaderFirstName, setMobileHeaderFirstName] = useState('');
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
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
    let cancelled = false;

    async function loadHeaderName() {
      if (!user?.id) {
        setMobileHeaderFirstName('');
        return;
      }

      const metadataName = String(
        user.user_metadata?.nome_exibicao ||
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email ||
        ''
      );
      setMobileHeaderFirstName(getFirstName(metadataName));

      try {
        const linkedPersonResult = await getPrimaryLinkedPersonWithPessoa(user.id);
        if (cancelled) return;

        const linkedPersonName = linkedPersonResult.data?.pessoa?.nome_completo;
        setMobileHeaderFirstName(getFirstName(linkedPersonName) || getFirstName(metadataName));
      } catch {
        if (!cancelled) {
          setMobileHeaderFirstName(getFirstName(metadataName));
        }
      }
    }

    loadHeaderName();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const refreshUnreadNotificationsCount = async () => {
      if (!user?.id) {
        setUnreadNotificationsCount(0);
        return;
      }

      try {
        const count = await contarNotificacoesNaoLidasSupabase(user.id);
        if (!cancelled) setUnreadNotificationsCount(count);
      } catch {
        if (!cancelled) setUnreadNotificationsCount(0);
      }
    };

    void refreshUnreadNotificationsCount();

    window.addEventListener('arvorefamilia:notifications-updated', refreshUnreadNotificationsCount);
    window.addEventListener('focus', refreshUnreadNotificationsCount);

    return () => {
      cancelled = true;
      window.removeEventListener('arvorefamilia:notifications-updated', refreshUnreadNotificationsCount);
      window.removeEventListener('focus', refreshUnreadNotificationsCount);
    };
  }, [user]);

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

  const mobileTitle = mobileHeaderFirstName ? `Família de ${mobileHeaderFirstName}` : 'Família';

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
            <h1 className="whitespace-nowrap text-xl font-bold leading-tight text-gray-900 md:hidden">{mobileTitle}</h1>
            <h1 className="hidden whitespace-normal text-base font-bold leading-tight text-gray-900 sm:text-lg md:block lg:truncate lg:whitespace-nowrap lg:text-xl">Família Barros Souza</h1>
            <p className="hidden whitespace-normal text-xs leading-tight text-gray-500 md:block lg:truncate lg:whitespace-nowrap lg:text-sm">{currentTreeViewLabel}</p>
          </div>
        </div>

        <div className={['min-w-0 shrink-0 flex-nowrap items-center justify-center gap-2 overflow-visible', isSearchExpanded ? 'hidden lg:flex' : 'hidden md:flex'].join(' ')}>
          <Button variant="outline" className={`${headerToolbarButtonClassName} md:inline-flex`} title="Curiosidades" aria-label="Abrir Curiosidades" data-tour-target="curiosities" onClick={onCuriosities}>
            <Sparkles className="h-4 w-4" />
            <span className={headerActionTextClassName}>Curiosidades</span>
          </Button>
          <Button variant="outline" className={`${headerToolbarButtonClassName} lg:inline-flex`} title="Calendário familiar" aria-label="Abrir Calendário familiar" data-tour-target="calendar" onClick={() => navigateFromHome('/calendario-familiar')}>
            <CalendarDays className="h-4 w-4" />
            <span className={headerActionTextClassName}>Calendário</span>
          </Button>
          <Button variant="outline" className={`${headerToolbarButtonClassName} lg:inline-flex`} title="Meus favoritos" aria-label="Abrir Favoritos" data-tour-target="favorites" onClick={() => navigateFromHome('/meus-favoritos')}>
            <Star className="h-4 w-4" />
            <span className={headerActionTextClassName}>Favoritos</span>
          </Button>
          <Button variant="outline" className={`${headerToolbarButtonClassName} lg:inline-flex`} title="Fórum de Discussões" aria-label="Abrir Fórum de Discussões" data-tour-target="forum" onClick={() => navigateFromHome('/forum')}>
            <MessageCircle className="h-4 w-4" />
            <span className={headerActionTextClassName}>Fórum</span>
          </Button>
          <HeaderNotificationsDropdown buttonClassName={headerIconButtonClassName} />
        </div>

        <div className={[searchExpanded ? 'hidden md:flex' : 'flex', 'min-w-0 shrink-0 items-center justify-end gap-2 overflow-visible'].join(' ')}>
          <div ref={searchRootRef} className="relative z-[502] flex min-w-0 flex-row-reverse items-center overflow-visible">
            <Button
              variant="outline"
              size="icon"
              className={`relative z-[504] flex ${headerIconButtonClassName}`}
              title="Buscar por pessoa ou página"
              aria-label={searchExpanded ? 'Fechar busca' : 'Abrir busca'}
              data-tour-target="search"
              onClick={() => {
                if (searchExpanded) {
                  setSearchSuggestionsDismissed(true);
                  onSearchExpandedChange(false);
                  return;
                }

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

          <div className="md:hidden" data-tour-target="profile-menu">
            <UserProfileMenu notificationBadgeCount={unreadNotificationsCount} />
          </div>
          <div className="hidden min-w-0 items-center gap-2 md:flex" data-tour-target="profile-menu">
            <UserProfileMenu notificationBadgeCount={unreadNotificationsCount} />
          </div>
        </div>
      </div>
    </header>
  );
}
