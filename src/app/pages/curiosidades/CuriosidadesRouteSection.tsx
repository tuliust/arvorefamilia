import { MapPinned } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

export function CuriosidadesRouteSection() {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <MapPinned className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Rota da família</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        Área inicial para uma leitura territorial da família, aguardando dados de origem, moradia e deslocamentos.
      </p>
      <span className={`${curiosityStatusClassName} mt-5`}>Aguardando dados familiares</span>
    </section>
  );
}

