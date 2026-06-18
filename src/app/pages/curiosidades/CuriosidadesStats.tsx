import { CalendarDays, Flower2, HeartPulse, Network, PawPrint, Users } from 'lucide-react';
import {
  curiositySectionCardClassName,
  isDeceased,
  isLivingPerson,
  isPet,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

export function CuriosidadesStats({
  pessoas,
  relacionamentos,
  loading,
  error,
}: CuriosidadesDataProps) {
  const totalHumans = pessoas.filter((pessoa) => !isPet(pessoa)).length;
  const totalPets = pessoas.filter(isPet).length;
  const totalLiving = pessoas.filter(isLivingPerson).length;
  const totalDeceased = pessoas.filter((pessoa) => !isPet(pessoa) && isDeceased(pessoa)).length;
  const totalWeddings = relacionamentos.filter((relacionamento) => Boolean(relacionamento.data_casamento)).length;

  const stats = [
    {
      label: 'Pessoas cadastradas',
      value: totalHumans,
      description: 'Familiares humanos registrados na árvore.',
      icon: Users,
    },
    {
      label: 'Pessoas vivas',
      value: totalLiving,
      description: 'Perfis sem registro de falecimento.',
      icon: HeartPulse,
    },
    {
      label: 'Memórias preservadas',
      value: totalDeceased,
      description: 'Familiares falecidos mantidos no acervo.',
      icon: Flower2,
    },
    {
      label: 'Pets',
      value: totalPets,
      description: 'Animais de estimação cadastrados.',
      icon: PawPrint,
    },
    {
      label: 'Datas de casamento',
      value: totalWeddings,
      description: 'Vínculos com data de união registrada.',
      icon: CalendarDays,
    },
  ];

  return (
    <section aria-label="Big numbers" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article key={stat.label} className={curiositySectionCardClassName}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-3 text-4xl font-bold text-gray-950">
                  {loading ? '--' : stat.value}
                </p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              {error ? 'Dados temporariamente indisponíveis.' : stat.description}
            </p>
          </article>
        );
      })}

      {error && (
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 md:col-span-2 xl:col-span-5">
          Não foi possível carregar todos os números da família agora. Tente novamente em instantes.
        </article>
      )}

      {!loading && !error && pessoas.length === 0 && (
        <article className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 md:col-span-2 xl:col-span-5">
          Ainda não há pessoas cadastradas para gerar os indicadores da página.
        </article>
      )}
    </section>
  );
}
