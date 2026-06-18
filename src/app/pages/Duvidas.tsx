import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { listPublishedQaContent } from '../services/qaService';
import type { QaCategory, QaItem } from '../types/qa';
import { includesNormalizedText } from '../utils/searchText';
import { QAHero } from './duvidas/QAHero';
import { QACategoryChips } from './duvidas/QACategoryChips';
import { QACategorySidebar } from './duvidas/QACategorySidebar';
import { QAAccordion } from './duvidas/QAAccordion';
import { QAEmptyState } from './duvidas/QAEmptyState';
import { QAFeaturedQuestions } from './duvidas/QAFeaturedQuestions';
import { QAResultCount } from './duvidas/QAResultCount';

function itemMatchesSearch(item: QaItem, category: QaCategory | undefined, searchTerm: string) {
  if (!searchTerm.trim()) return true;

  return (
    includesNormalizedText(item.question, searchTerm) ||
    includesNormalizedText(item.answer, searchTerm) ||
    includesNormalizedText(item.related_page_label, searchTerm) ||
    item.keywords.some((keyword) => includesNormalizedText(keyword, searchTerm)) ||
    includesNormalizedText(category?.title, searchTerm) ||
    includesNormalizedText(category?.short_title, searchTerm)
  );
}

export function Duvidas() {
  const [categories, setCategories] = useState<QaCategory[]>([]);
  const [items, setItems] = useState<QaItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openItemIds, setOpenItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listPublishedQaContent()
      .then((content) => {
        if (cancelled) return;
        setCategories(content.categories);
        setItems(content.items);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as dúvidas.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categoriesById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const itemCounts = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.category_id] = (acc[item.category_id] ?? 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const category = categoriesById.get(item.category_id);
      const inActiveCategory = activeCategoryId === 'all' || item.category_id === activeCategoryId;
      return inActiveCategory && itemMatchesSearch(item, category, searchTerm);
    });
  }, [activeCategoryId, categoriesById, items, searchTerm]);

  const featuredItems = useMemo(() => items.filter((item) => item.is_featured).slice(0, 6), [items]);
  const activeCategory = activeCategoryId === 'all' ? null : categoriesById.get(activeCategoryId);

  function handleToggleItem(itemId: string) {
    setOpenItemIds((current) => (current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]));
  }

  function handleSelectFeaturedItem(itemId: string) {
    const item = items.find((currentItem) => currentItem.id === itemId);
    if (item) setActiveCategoryId(item.category_id);
    setOpenItemIds([itemId]);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/entrar" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Voltar para entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-10">
        <QAHero searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <div className="mt-6 lg:mt-8">
          <QACategoryChips categories={categories} activeCategoryId={activeCategoryId} onSelectCategory={setActiveCategoryId} />
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 text-sm font-medium text-gray-600">Carregando dúvidas...</p>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{error}</div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            <QACategorySidebar categories={categories} activeCategoryId={activeCategoryId} itemCounts={itemCounts} onSelectCategory={setActiveCategoryId} />

            <div className="min-w-0 space-y-6">
              {!searchTerm.trim() && activeCategoryId === 'all' ? <QAFeaturedQuestions items={featuredItems} onSelectItem={handleSelectFeaturedItem} /> : null}

              <section className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Perguntas e respostas</p>
                    <h2 className="mt-1 text-2xl font-bold text-gray-950">{activeCategory?.title || 'Todas as dúvidas'}</h2>
                    {activeCategory?.description ? <p className="mt-2 text-sm leading-6 text-gray-600">{activeCategory.description}</p> : null}
                  </div>
                  <QAResultCount count={filteredItems.length} searchTerm={searchTerm} />
                </div>

                {filteredItems.length ? <QAAccordion items={filteredItems} openItemIds={openItemIds} onToggleItem={handleToggleItem} /> : <QAEmptyState searchTerm={searchTerm} />}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
