import { Search } from 'lucide-react';

export function QASearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar uma dúvida..."
        className="h-13 w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 text-base text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-sm font-semibold text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Limpar busca"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
