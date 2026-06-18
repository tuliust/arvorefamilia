import { CalendarDays, Network, Users } from 'lucide-react';
import { curiositySectionCardClassName } from './curiosidadesUtils';

const stats = [
  {
    label: 'Pessoas na família',
    value: '--',
    description: 'Aguardando dados familiares',
    icon: Users,
  },
  {
    label: 'Vínculos registrados',
    value: '--',
    description: 'Aguardando dados familiares',
    icon: Network,
  },
  {
    label: 'Datas importantes',
    value: '--',
    description: 'Aguardando dados familiares',
    icon: CalendarDays,
  },
];

export function CuriosidadesStats() {
  return (
    <section aria-label="Big numbers" className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article key={stat.label} className={curiositySectionCardClassName}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-3 text-4xl font-bold text-gray-950">{stat.value}</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-600">{stat.description}</p>
          </article>
        );
      })}
    </section>
  );
}

