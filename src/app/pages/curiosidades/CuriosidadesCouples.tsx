import { HeartHandshake } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

export function CuriosidadesCouples() {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <HeartHandshake className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Bodas e vínculos</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        Futuramente, esta seção poderá apresentar aniversários de casamento, vínculos registrados e marcos afetivos.
      </p>
      <span className={`${curiosityStatusClassName} mt-5`}>Em breve</span>
    </section>
  );
}

