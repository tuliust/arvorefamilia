import type { QaCategory } from '../../types/qa';

function getChipClass(active: boolean) {
  return active
    ? 'rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition'
    : 'rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300';
}

export function QACategoryChips({
  categories,
  activeCategoryId,
  onSelectCategory,
}: {
  categories: QaCategory[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:hidden">
      <div className="flex gap-2 whitespace-nowrap">
        <button type="button" onClick={() => onSelectCategory('all')} className={getChipClass(activeCategoryId === 'all')}>
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className={getChipClass(activeCategoryId === category.id)}
          >
            {category.short_title || category.title}
          </button>
        ))}
      </div>
    </div>
  );
}
