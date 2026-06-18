import { MoonStar } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

export function CuriosidadesAstrology() {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <MoonStar className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Astrologia da família</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        Espaço reservado para leituras leves por signos e datas de nascimento, sem cálculos ativos nesta etapa.
      </p>
      <span className={`${curiosityStatusClassName} mt-5`}>Em breve</span>
    </section>
  );
}

