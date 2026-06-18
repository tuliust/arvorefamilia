import { CalendarHeart } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

export function CuriosidadesToday() {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <CalendarHeart className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-bold text-gray-950">Hoje na família</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Espaço reservado para aniversários, memórias, casamentos e acontecimentos familiares do dia.
          </p>
        </div>
        <span className={curiosityStatusClassName}>Aguardando dados familiares</span>
      </div>
    </section>
  );
}

