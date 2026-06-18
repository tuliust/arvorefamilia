import { Search } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

export function CuriosidadesDiscoverySection() {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Descubra mais sobre...</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        Um ponto de partida para explorar pessoas, histórias, datas e vínculos quando a lógica de descoberta for conectada.
      </p>
      <span className={`${curiosityStatusClassName} mt-5`}>Em breve</span>
    </section>
  );
}

