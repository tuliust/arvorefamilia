import { GitBranch } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

export function CuriosidadesGenerations() {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <GitBranch className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Gerações da família</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        Esta área poderá resumir gerações identificadas, diferenças de idade e caminhos entre ramos da família.
      </p>
      <span className={`${curiosityStatusClassName} mt-5`}>Aguardando dados familiares</span>
    </section>
  );
}

