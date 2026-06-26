import React, { useEffect, useRef, useState } from 'react';
import { FileText, Search, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router';
import { searchGlobal, type GlobalSearchPageResult } from '../../services/globalSearchService';
import type { Pessoa } from '../../types';

function formatSuggestionBirthDate(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) return `${slashMatch[1].padStart(2, '0')}/${slashMatch[2].padStart(2, '0')}/${slashMatch[3]}`;

  return raw;
}

function getPersonSuggestionDetail(pessoa: Pessoa) {
  const birthPlace = String(pessoa.local_nascimento ?? '').trim();
  const birthDate = formatSuggestionBirthDate(pessoa.data_nascimento);
  return [birthPlace, birthDate].filter(Boolean).join(' – ');
}

type HeaderGlobalSearchProps = {
  searchExpanded: boolean;
  onSearchExpandedChange: (value: boolean) => void;
  buttonClassName: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  rootClassName?: string;
  expandedPanelClassName?: string;
  collapsedPanelClassName?: string;
  inputClassName?: string;
  suggestionsClassName?: string;
  placeholder?: string;
};

export function HeaderGlobalSearch({
  searchExpanded,
  onSearchExpandedChange,
  buttonClassName,
  inputRef,
  rootClassName = 'relative z-[502] flex min-w-0 flex-row-reverse items-center overflow-visible',
  expandedPanelClassName = 'pointer-events-auto w-[min(50vw,380px)] opacity-100',
  collapsedPanelClassName = 'pointer-events-none w-0 opacity-0',
  inputClassName = 'h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
  suggestionsClassName = 'absolute left-0 right-2 top-full z-[999] mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl',
  placeholder = 'Buscar pessoa ou página...',
}: HeaderGlobalSearchProps) {
  const navigate = useNavigate();
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const searchRootRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [peopleResults, setPeopleResults] = useState<Pessoa[]>([]);
  const [pageResults, setPageResults] = useState<GlobalSearchPageResult[]>([]);
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);
  const trimmedSearchTerm = searchTerm.trim();
  const effectiveInputRef = inputRef ?? internalInputRef;
  const hasSearchSuggestions = Boolean(
    searchExpanded &&
    trimmedSearchTerm &&
    !suggestionsDismissed &&
    (peopleResults.length > 0 || pageResults.length > 0),
  );

  useEffect(() => {
    setSuggestionsDismissed(false);
  }, [searchTerm]);

  useEffect(() => {
    if (!searchExpanded) {
      setSuggestionsDismissed(false);
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (searchRootRef.current?.contains(target)) return;
      setSuggestionsDismissed(true);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSuggestionsDismissed(true);
        onSearchExpandedChange(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => effectiveInputRef.current?.focus());

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [effectiveInputRef, onSearchExpandedChange, searchExpanded]);

  useEffect(() => {
    if (!searchExpanded || !trimmedSearchTerm) {
      setPeopleResults([]);
      setPageResults([]);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      searchGlobal(trimmedSearchTerm)
        .then((results) => {
          if (cancelled) return;
          setPeopleResults(Array.isArray(results.people) ? results.people : []);
          setPageResults(Array.isArray(results.pages) ? results.pages : []);
        })
        .catch((error) => {
          if (cancelled) return;
          console.error('Erro ao buscar pessoas e páginas:', error);
          setPeopleResults([]);
          setPageResults([]);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchExpanded, trimmedSearchTerm]);

  const submitSearch = () => {
    if (!trimmedSearchTerm) {
      onSearchExpandedChange(false);
      return;
    }

    setSuggestionsDismissed(true);
    onSearchExpandedChange(false);
    navigate('/busca?q=' + encodeURIComponent(trimmedSearchTerm));
  };

  const selectPerson = (pessoa: Pessoa) => {
    setSuggestionsDismissed(true);
    setSearchTerm('');
    setPeopleResults([]);
    setPageResults([]);
    onSearchExpandedChange(false);
    navigate(`/pessoa/${pessoa.id}`);
  };

  const selectPage = (page: GlobalSearchPageResult) => {
    setSuggestionsDismissed(true);
    setSearchTerm('');
    setPeopleResults([]);
    setPageResults([]);
    onSearchExpandedChange(false);
    navigate(page.path);
  };

  return (
    <div ref={searchRootRef} className={rootClassName}>
      <button
        type="button"
        className={`relative z-[504] flex ${buttonClassName}`}
        title="Buscar por pessoa ou página"
        aria-label={searchExpanded ? 'Fechar busca' : 'Abrir busca'}
        data-tour-target="search"
        onClick={() => {
          if (searchExpanded) {
            setSuggestionsDismissed(true);
            onSearchExpandedChange(false);
            return;
          }

          setSuggestionsDismissed(false);
          onSearchExpandedChange(true);
        }}
      >
        <Search className="pointer-events-none h-4 w-4" />
      </button>

      <div className={[
        'relative z-[503] min-w-0 overflow-visible transition-all duration-300 ease-out',
        searchExpanded ? expandedPanelClassName : collapsedPanelClassName,
      ].join(' ')}>
        <div className="pr-2">
          <form onSubmit={(event) => { event.preventDefault(); submitSearch(); }}>
            <input
              ref={effectiveInputRef}
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(event) => {
                setSuggestionsDismissed(false);
                setSearchTerm(event.target.value);
              }}
              onFocus={() => setSuggestionsDismissed(false)}
              className={inputClassName}
              tabIndex={searchExpanded ? 0 : -1}
            />
          </form>

          {hasSearchSuggestions && (
            <div className={suggestionsClassName}>
              {peopleResults.length > 0 && (
                <div className="border-b border-gray-100 bg-white py-1">
                  <p className="bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">PESSOAS</p>
                  {peopleResults.slice(0, 6).map((pessoa) => {
                    const suggestionDetail = getPersonSuggestionDetail(pessoa);

                    return (
                      <button
                        key={pessoa.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectPerson(pessoa)}
                        className="flex w-full gap-3 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                      >
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

              {pageResults.length > 0 && (
                <div className="border-b border-gray-100 bg-white py-1 last:border-b-0">
                  <p className="bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">PÁGINAS</p>
                  {pageResults.slice(0, 5).map((page) => (
                    <button
                      key={page.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectPage(page)}
                      className="flex w-full gap-3 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-900">{page.title}</span>
                        <span className="mt-1 block truncate text-xs text-gray-500">{page.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={submitSearch}
                className="flex w-full items-center gap-2 bg-white px-4 py-3 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
              >
                <Search className="h-4 w-4" />
                Ver todos os resultados
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
