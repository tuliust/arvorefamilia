import { Route } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

export function CuriosidadesConnectionSection() {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <Route className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Conexões familiares</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        Placeholder para comparar duas pessoas e explicar caminhos familiares quando a lógica for reutilizada ou criada.
      </p>
      <span className={`${curiosityStatusClassName} mt-5`}>Aguardando dados familiares</span>
    </section>
  );
}

