import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router';
import type { QaItem } from '../../types/qa';

type QAAccordionProps = {
  items: QaItem[];
  openItemIds: string[];
  onToggleItem: (itemId: string) => void;
};

function renderAnswer(answer: string) {
  return answer
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={`${paragraph}-${index}`} className="leading-7 text-gray-600">
        {paragraph}
      </p>
    ));
}

export function QAAccordion({ items, openItemIds, onToggleItem }: QAAccordionProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openItemIds.includes(item.id);

        return (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => onToggleItem(item.id)}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-gray-50 sm:px-6"
              aria-expanded={isOpen}
            >
              <span className="text-base font-semibold leading-6 text-gray-950">{item.question}</span>
              <ChevronDown className={`mt-0.5 h-5 w-5 flex-none text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen ? (
              <div className="border-t border-gray-100 px-5 py-5 sm:px-6">
                <div className="space-y-3">{renderAnswer(item.answer)}</div>
                {item.related_page_label && item.related_page_path ? (
                  <Link
                    to={item.related_page_path}
                    className="mt-5 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    Acessar {item.related_page_label}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
