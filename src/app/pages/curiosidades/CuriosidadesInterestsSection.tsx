import { ScanSearch } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

export function CuriosidadesInterestsSection() {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <ScanSearch className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Comparar interesses</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        Futuro espaço para aproximar familiares por interesses, histórias e informações preenchidas voluntariamente.
      </p>
      <span className={`${curiosityStatusClassName} mt-5`}>Em breve</span>
    </section>
  );
}

