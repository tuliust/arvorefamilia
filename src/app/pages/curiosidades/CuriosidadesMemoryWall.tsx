import { Images } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

export function CuriosidadesMemoryWall() {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <Images className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Mural da família</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        Placeholder para reunir lembranças, arquivos históricos e registros afetivos em uma apresentação própria.
      </p>
      <span className={`${curiosityStatusClassName} mt-5`}>Aguardando dados familiares</span>
    </section>
  );
}

