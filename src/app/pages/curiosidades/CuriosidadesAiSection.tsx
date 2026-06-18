import { Bot } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

export function CuriosidadesAiSection() {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <Bot className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Pergunte à IA</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        Área reservada para perguntas assistidas sobre a árvore. Nenhuma nova integração de IA foi adicionada nesta fase.
      </p>
      <span className={`${curiosityStatusClassName} mt-5`}>Em breve</span>
    </section>
  );
}

