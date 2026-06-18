import { Sparkles } from 'lucide-react';
import type { QaItem } from '../../types/qa';

export function QAFeaturedQuestions({ items, onSelectItem }: { items: QaItem[]; onSelectItem: (itemId: string) => void }) {
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Dúvidas frequentes</h2>
          <p className="text-sm text-gray-600">Acesse rapidamente as perguntas mais importantes para começar.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.slice(0, 6).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item.id)}
            className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-left text-sm font-medium leading-6 text-gray-800 transition hover:border-amber-300 hover:shadow-sm"
          >
            {item.question}
          </button>
        ))}
      </div>
    </section>
  );
}
