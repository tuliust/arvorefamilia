import { HelpCircle } from 'lucide-react';
import { QASearchBox } from './QASearchBox';

export function QAHero({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (value: string) => void }) {
  return (
    <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-amber-50 p-6 shadow-sm sm:p-8 lg:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
          <HelpCircle className="h-6 w-6" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-blue-700">Central de ajuda</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">Como podemos ajudar?</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
          Encontre respostas sobre cadastro, árvore familiar, vínculos, arquivos, privacidade, notificações e navegação pelo site.
        </p>
        <div className="mt-7">
          <QASearchBox value={searchTerm} onChange={onSearchChange} />
        </div>
      </div>
    </section>
  );
}
