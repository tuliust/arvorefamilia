import { Lightbulb, Medal, Star } from 'lucide-react';
import { curiositySectionCardClassName, curiosityStatusClassName } from './curiosidadesUtils';

const cards = [
  {
    title: 'Você Sabia?',
    description: 'Fatos curiosos da árvore familiar aparecerão aqui quando houver dados suficientes.',
    icon: Lightbulb,
  },
  {
    title: 'Destaques familiares',
    description: 'Rankings e recortes especiais serão exibidos sem tratar placeholders como resultados reais.',
    icon: Medal,
  },
  {
    title: 'Histórias em evidência',
    description: 'Um espaço futuro para destacar registros marcantes, lembranças e conexões relevantes.',
    icon: Star,
  },
];

export function CuriosidadesRankings() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-950">Você Sabia?</h2>
        <p className="mt-2 text-sm text-gray-600">Cards iniciais para curiosidades calculadas em fases futuras.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.title} className={curiositySectionCardClassName}>
              <Icon className="h-5 w-5 text-blue-700" />
              <h3 className="mt-4 text-base font-semibold text-gray-950">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{card.description}</p>
              <span className={`${curiosityStatusClassName} mt-4`}>Em breve</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

