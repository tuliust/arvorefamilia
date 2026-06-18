import { CircleHelp } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

export function CuriosidadesQuizSection() {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <CircleHelp className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Teste seus conhecimentos</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        Espaço preparado para quizzes familiares no futuro, sem perguntas geradas ou respostas fictícias nesta versão.
      </p>
      <span className={`${curiosityStatusClassName} mt-5`}>Em breve</span>
    </section>
  );
}

