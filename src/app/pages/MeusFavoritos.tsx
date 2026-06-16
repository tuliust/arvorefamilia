import React, { KeyboardEvent, MouseEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { HEADER_ACTION_ICONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../components/layout/MemberPageHeader';
import {
  Check,
  Filter,
  Search,
  Trash2,
} from 'lucide-react';
import { FavoriteEntityType, UserFavorite } from '../types';
import { listFavorites, removeFavoriteById } from '../services/favoritesService';

const FAVORITE_TYPE_LABELS: Record<FavoriteEntityType, string> = {
  person: 'Pessoa',
  historical_file: 'Arquivo histórico',
  relationship: 'Relacionamento',
  forum_topic: 'Fórum',
  family_event: 'Evento familiar',
  person_event: 'Evento pessoal',
  page: 'Página',
  timeline_item: 'Timeline',
  story: 'História',
};

const FAVORITE_BADGE_CLASSES: Record<FavoriteEntityType, string> = {
  person: 'bg-blue-50 text-blue-700 ring-blue-100',
  historical_file: 'bg-amber-50 text-amber-700 ring-amber-100',
  relationship: 'bg-violet-50 text-violet-700 ring-violet-100',
  forum_topic: 'bg-pink-50 text-pink-700 ring-pink-100',
  family_event: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  person_event: 'bg-teal-50 text-teal-700 ring-teal-100',
  page: 'bg-sky-50 text-sky-700 ring-sky-100',
  timeline_item: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  story: 'bg-rose-50 text-rose-700 ring-rose-100',
};

const FILTERS: Array<{ value: 'all' | FavoriteEntityType; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'person', label: 'Pessoas' },
  { value: 'historical_file', label: 'Arquivos históricos' },
  { value: 'forum_topic', label: 'Fórum' },
  { value: 'person_event', label: 'Eventos pessoais' },
  { value: 'page', label: 'Páginas' },
];

function formatDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function isInternalHref(href?: string | null) {
  return Boolean(href && href.startsWith('/'));
}

export function MeusFavoritos() {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState<UserFavorite[]>([]);
  const [filtro, setFiltro] = useState<'all' | FavoriteEntityType>('all');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const recarregar = async () => {
    setLoading(true);
    setErro(null);

    try {
      const dados = await listFavorites();
      setFavoritos(dados);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setErro('Não foi possível carregar seus favoritos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recarregar();
  }, []);

  const favoritosFiltrados = useMemo(() => {
    const search = busca.trim().toLowerCase();

    return favoritos.filter((item) => {
      const matchesType = filtro === 'all' || item.entity_type === filtro;
      const matchesSearch =
        !search ||
        [item.label, item.description ?? '', FAVORITE_TYPE_LABELS[item.entity_type]]
          .join(' ')
          .toLowerCase()
          .includes(search);

      return matchesType && matchesSearch;
    });
  }, [busca, favoritos, filtro]);

  const activeFilterLabel = FILTERS.find((filter) => filter.value === filtro)?.label ?? 'Todos';

  const openFavorite = (favorito: UserFavorite) => {
    if (!favorito.href) return;

    if (isInternalHref(favorito.href)) {
      navigate(favorito.href);
      return;
    }

    window.open(favorito.href, '_blank', 'noopener,noreferrer');
  };

  const handleFavoriteKeyDown = (event: KeyboardEvent<HTMLDivElement>, favorito: UserFavorite) => {
    if (!favorito.href) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    openFavorite(favorito);
  };

  const handleRemove = async (event: MouseEvent<HTMLButtonElement>, favorito: UserFavorite) => {
    event.stopPropagation();
    setRemovingId(favorito.id);

    try {
      await removeFavoriteById(favorito.id);
      setFavoritos((current) => current.filter((item) => item.id !== favorito.id));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      setErro('Não foi possível remover o favorito.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Meus Favoritos"
        subtitle="Conteúdos salvos para consultar depois"
        hideFavoriteButton
        actions={[
          { label: 'Árvore geral', to: '/', icon: HEADER_ACTION_ICONS.ArrowLeft },
          { label: 'Mapa Familiar', to: '/mapa-familiar', icon: HEADER_ACTION_ICONS.Home },
          { label: 'Calendário', to: '/calendario-familiar', icon: HEADER_ACTION_ICONS.CalendarDays },
          { label: 'Notificações', to: '/notificacoes', icon: HEADER_ACTION_ICONS.Bell },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} space-y-6 py-6 pb-40 md:pb-6`}>
        <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:max-w-md lg:max-w-lg">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar favoritos..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setFilterMenuOpen((current) => !current)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                aria-expanded={filterMenuOpen}
                aria-haspopup="menu"
              >
                <Filter className="h-4 w-4" />
                Filtros
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {activeFilterLabel}
                </span>
              </button>

              {filterMenuOpen && (
                <div
                  className="absolute right-0 z-20 mt-2 w-full min-w-64 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg sm:w-72"
                  role="menu"
                >
                  {FILTERS.map((filter) => {
                    const isActive = filtro === filter.value;

                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => {
                          setFiltro(filter.value);
                          setFilterMenuOpen(false);
                        }}
                        className={[
                          'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition',
                          isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50',
                        ].join(' ')}
                        role="menuitemradio"
                        aria-checked={isActive}
                      >
                        <span>{filter.label}</span>
                        {isActive && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {erro && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            Carregando favoritos...
          </div>
        ) : favoritosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Nenhum favorito encontrado.</p>
            <p className="mt-2 text-sm text-gray-500">Salve pessoas, arquivos, tópicos ou páginas para acessar depois.</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {favoritosFiltrados.map((favorito) => {
              const href = favorito.href;
              const canOpen = Boolean(href);
              const date = formatDate(favorito.created_at);

              return (
                <div
                  key={favorito.id}
                  role={canOpen ? 'button' : undefined}
                  tabIndex={canOpen ? 0 : undefined}
                  onClick={() => openFavorite(favorito)}
                  onKeyDown={(event) => handleFavoriteKeyDown(event, favorito)}
                  className={[
                    'min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition',
                    canOpen ? 'cursor-pointer hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : '',
                  ].join(' ')}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${FAVORITE_BADGE_CLASSES[favorito.entity_type]}`}>
                        <span className="truncate">{FAVORITE_TYPE_LABELS[favorito.entity_type]}</span>
                      </span>
                      <h2 className="mt-3 break-words text-base font-bold leading-snug text-gray-900">{favorito.label}</h2>
                      {favorito.description && (
                        <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-gray-600">{favorito.description}</p>
                      )}
                      {date && <p className="mt-3 text-xs text-gray-400">Salvo em {date}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={(event) => handleRemove(event, favorito)}
                      disabled={removingId === favorito.id}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      aria-label="Remover favorito"
                      title="Remover favorito"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
