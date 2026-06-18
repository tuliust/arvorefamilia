import { SearchX } from 'lucide-react';

export function QAEmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
        <SearchX className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-950">Nenhuma dúvida encontrada</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
        {searchTerm.trim()
          ? 'Tente buscar por cadastro, árvore, vínculos, notificações, privacidade ou favoritos.'
          : 'Ainda não há perguntas publicadas nesta categoria.'}
      </p>
    </div>
  );
}
