import React from 'react';
import { CalendarDays, FileText, MessageCircle, Network, Search, Sparkles, UserRound } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../../components/ui/select';
import type { TreeViewMode } from '../../components/FamilyTree/treeViewMode';
import type { GlobalSearchPageResult } from '../../services/globalSearchService';
import type { Pessoa } from '../../types';

const DEFAULT_PAGE_SUGGESTIONS: GlobalSearchPageResult[] = [
  { id: 'minha-arvore', title: 'Minha Árvore', description: 'Visualização principal da árvore familiar.', path: '/minha-arvore', keywords: ['arvore', 'árvore', 'familia', 'família'] },
  { id: 'genealogia', title: 'Genealogia', description: 'Visualização por gerações e ramos familiares.', path: '/genealogia', keywords: ['genealogia', 'geracoes', 'gerações'] },
  { id: 'visao-completa', title: 'Visão Completa', description: 'Visualização ampliada da árvore.', path: '/visao-completa', keywords: ['visao', 'visão', 'completa'] },
  { id: 'meus-dados', title: 'Meus Dados', description: 'Revisão e atualização dos dados pessoais.', path: '/meus-dados', keywords: ['dados', 'perfil'] },
  { id: 'forum', title: 'Fórum', description: 'Discussões entre membros da família.', path: '/forum', keywords: ['forum', 'fórum', 'topicos', 'tópicos'] },
  { id: 'calendario', title: 'Calendário Familiar', description: 'Datas, aniversários e eventos familiares.', path: '/calendario-familiar', keywords: ['calendario', 'calendário', 'aniversarios', 'aniversários'] },
];

function normalizeSearchText(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

function filterDefaultPages(term: string) {
  const normalizedTerm = normalizeSearchText(term);
  if (!normalizedTerm) return [];

  return DEFAULT_PAGE_SUGGESTIONS.filter((page) => {
    const haystack = [page.title, page.description, ...page.keywords].map(normalizeSearchText).join(' ');
    return haystack.includes(normalizedTerm);
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
  userMenuSlot: React.ReactNode;
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
  userMenuSlot,
}: HomeHeaderProps) {
  const trimmedSearchTerm = searchTerm.trim();
  const effectivePageSuggestions = pageSuggestions ?? filterDefaultPages(searchTerm);
  const hasSearchSuggestions = searchExpanded && trimmedSearchTerm && (pessoasFiltradas.length > 0 || effectivePageSuggestions.length > 0);

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

  return (
    <header className="shrink-0 overflow-visible border-b border-gray-200 bg-white py-2 shadow-sm">
      <div className="flex min-h-14 w-full min-w-0 flex-nowrap items-center justify-between gap-1.5 overflow-visible px-4 sm:gap-2 sm:px-6 lg:h-14 lg:gap-4 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-visible">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
            <Network className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1 overflow-visible">
            <h1 className="whitespace-normal text-base font-bold leading-tight text-gray-900 sm:text-lg lg:truncate lg:whitespace-nowrap lg:text-xl">Família Barros Souza</h1>
            <p className="whitespace-normal text-xs leading-tight text-gray-500 lg:truncate lg:whitespace-nowrap lg:text-sm">{currentTreeViewLabel}</p>
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
            </SelectContent>
          </Select>

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

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5 overflow-visible sm:gap-2">
          <div className="pointer-events-none relative flex min-w-0 flex-row-reverse items-center overflow-visible">
            <Button variant="outline" size="icon" className="pointer-events-auto relative z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white" title="Buscar por nome, local ou página" aria-label={searchExpanded ? 'Busca expandida' : 'Abrir busca'} onClick={() => onSearchExpandedChange(true)}>
              <Search className="pointer-events-none h-4 w-4" />
            </Button>

            <div className={['pointer-events-auto relative z-10 min-w-0 overflow-visible transition-all duration-300 ease-out', searchExpanded ? 'w-[min(60vw,380px)] opacity-100 sm:w-[min(46vw,420px)]' : 'w-0 opacity-0'].join(' ')}>
              <div className="pr-2">
                <form onSubmit={(event) => { event.preventDefault(); submitSearch(); }}>
                  <Input ref={searchInputRef} type="text" placeholder="Buscar pessoa, local ou página..." value={searchTerm} onChange={(e) => onSearchTermChange(e.target.value)} onBlur={() => { window.setTimeout(() => { if (!searchTerm.trim()) onSearchExpandedChange(false); }, 160); }} className="h-10" tabIndex={searchExpanded ? 0 : -1} />
                </form>

                {hasSearchSuggestions && (
                  <div className="absolute left-0 right-2 top-full z-[200] mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                    {pessoasFiltradas.length > 0 && (
                      <div className="border-b border-gray-100 py-1">
                        <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">PESSOAS</p>
                        {pessoasFiltradas.slice(0, 6).map((pessoa) => (
                          <button key={pessoa.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => handleSearchSelect(pessoa)} className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50">
                            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-gray-900">{pessoa.nome_completo}</span>
                              {(pessoa.local_nascimento || pessoa.local_atual) && <span className="mt-1 block truncate text-xs text-gray-500">{[pessoa.local_nascimento, pessoa.local_atual].filter(Boolean).join(' · ')}</span>}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {effectivePageSuggestions.length > 0 && (
                      <div className="border-b border-gray-100 py-1 last:border-b-0">
                        <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">PÁGINAS</p>
                        {effectivePageSuggestions.slice(0, 5).map((page) => (
                          <button key={page.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectPageSuggestion(page)} className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-gray-900">{page.title}</span>
                              <span className="mt-1 block truncate text-xs text-gray-500">{page.description}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={submitSearch} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50">
                      <Search className="h-4 w-4" />
                      Ver todos os resultados
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {userMenuSlot}
        </div>
      </div>
    </header>
  );
}
