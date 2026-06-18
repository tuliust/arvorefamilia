import type { QaCategory } from '../../types/qa';

export function QACategorySidebar({
  categories,
  activeCategoryId,
  itemCounts,
  onSelectCategory,
}: {
  categories: QaCategory[];
  activeCategoryId: string;
  itemCounts: Record<string, number>;
  onSelectCategory: (categoryId: string) => void;
}) {
  return (
    <aside className="hidden lg:block lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="px-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Categorias</h2>
        <div className="mt-3 space-y-1">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
              activeCategoryId === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950'
            }`}
          >
            <span>Todas</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {Object.values(itemCounts).reduce((total, count) => total + count, 0)}
            </span>
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                activeCategoryId === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950'
              }`}
            >
              <span className="min-w-0 truncate">{category.title}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{itemCounts[category.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
