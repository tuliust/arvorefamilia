export function QAResultCount({ count, searchTerm }: { count: number; searchTerm: string }) {
  const singular = count === 1;

  if (!searchTerm.trim()) {
    return <p className="text-sm text-gray-500">{count} {singular ? 'dúvida disponível' : 'dúvidas disponíveis'} nesta seleção.</p>;
  }

  return (
    <p className="text-sm text-gray-500">
      {count} {singular ? 'resultado encontrado' : 'resultados encontrados'} para "{searchTerm.trim()}".
    </p>
  );
}
