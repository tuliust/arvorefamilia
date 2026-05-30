import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, FileText, Search, UserRound } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { searchGlobal, type GlobalSearchResults } from '../services/globalSearchService';

export function BuscaResultados() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';
  const [term, setTerm] = useState(query);
  const [results, setResults] = useState<GlobalSearchResults>({ people: [], pages: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTerm(query);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      if (!query) {
        setResults({ people: [], pages: [] });
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const nextResults = await searchGlobal(query);
        if (!cancelled) {
          setResults(nextResults);
        }
      } catch (searchError) {
        if (!cancelled) {
          const message = searchError instanceof Error ? searchError.message : 'Não foi possível concluir a busca.';
          setError(message);
          setResults({ people: [], pages: [] });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const totalResults = results.people.length + results.pages.length;
  const trimmedTerm = term.trim();
  const title = useMemo(() => {
    if (!query) return 'Buscar na família';
    if (isLoading) return `Buscando por “${query}”`;
    return `${totalResults} resultado${totalResults === 1 ? '' : 's'} para “${query}”`;
  }, [isLoading, query, totalResults]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedTerm) {
      setSearchParams({});
      return;
    }

    setSearchParams({ q: trimmedTerm });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 bg-white"
            onClick={() => navigate('/minha-arvore')}
            aria-label="Voltar para Minha Árvore"
            title="Voltar para Minha Árvore"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Busca</p>
            <h1 className="truncate text-lg font-bold text-gray-950 sm:text-xl">{title}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <label htmlFor="global-search-page-input" className="text-sm font-medium text-gray-900">
            Buscar pessoas ou páginas
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              id="global-search-page-input"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Digite um nome, local ou página..."
              className="h-11"
            />
            <Button type="submit" className="h-11 shrink-0 gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
        </form>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="h-5 w-5 text-blue-700" />
              <h2 className="text-base font-semibold text-gray-950">Pessoas</h2>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {results.people.length}
              </span>
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-500">Carregando pessoas...</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : query && results.people.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma pessoa encontrada.</p>
            ) : !query ? (
              <p className="text-sm text-gray-500">Digite um termo para buscar pessoas da árvore.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {results.people.map((person) => (
                  <Link
                    key={person.id}
                    to={`/pessoa/${person.id}`}
                    className="flex gap-3 py-3 transition hover:bg-gray-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-700">
                      {person.foto_principal_url ? (
                        <img src={person.foto_principal_url} alt={person.nome_completo} className="h-full w-full object-cover" />
                      ) : (
                        <UserRound className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-950">{person.nome_completo}</p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {[person.local_nascimento, person.local_atual].filter(Boolean).join(' · ') || 'Pessoa da árvore familiar'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-700" />
              <h2 className="text-base font-semibold text-gray-950">Páginas</h2>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {results.pages.length}
              </span>
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-500">Carregando páginas...</p>
            ) : query && results.pages.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma página encontrada.</p>
            ) : !query ? (
              <p className="text-sm text-gray-500">Digite um termo para buscar páginas do site.</p>
            ) : (
              <div className="space-y-2">
                {results.pages.map((page) => (
                  <Link
                    key={page.id}
                    to={page.path}
                    className="block rounded-xl border border-gray-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/60"
                  >
                    <p className="font-medium text-gray-950">{page.title}</p>
                    <p className="mt-1 text-sm leading-5 text-gray-500">{page.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
