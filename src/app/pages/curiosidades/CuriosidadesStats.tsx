import { CalendarDays, Flower2, HeartPulse, PawPrint, Users } from 'lucide-react';
import {
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
      cardClassName: 'border-blue-100 bg-blue-50',
      iconClassName: 'bg-white text-blue-700',
      valueClassName: 'text-blue-900',
    },
    {
      label: 'Pessoas vivas',
      value: totalLiving,
      description: 'Perfis sem registro de falecimento.',
      icon: HeartPulse,
      cardClassName: 'border-emerald-100 bg-emerald-50',
      iconClassName: 'bg-white text-emerald-700',
      valueClassName: 'text-emerald-900',
    },
    {
      label: 'Memórias preservadas',
      value: totalDeceased,
      description: 'Familiares falecidos mantidos no acervo.',
      icon: Flower2,
      cardClassName: 'border-violet-100 bg-violet-50',
      iconClassName: 'bg-white text-violet-700',
      valueClassName: 'text-violet-900',
    },
    {
      label: 'Pets',
      value: totalPets,
      description: 'Animais de estimação cadastrados.',
      icon: PawPrint,
      cardClassName: 'border-orange-100 bg-orange-50',
      iconClassName: 'bg-white text-orange-700',
      valueClassName: 'text-orange-900',
    },
    {
      label: 'Datas de casamento',
      value: totalWeddings,
      description: 'Vínculos com data de união registrada.',
      icon: CalendarDays,
      cardClassName: 'border-rose-100 bg-rose-50',
      iconClassName: 'bg-white text-rose-700',
      valueClassName: 'text-rose-900',
    },
  ];

  return (
    <section aria-label="Big numbers" className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.label}
            className={`min-w-0 rounded-2xl border p-4 shadow-sm sm:p-5 ${stat.cardClassName}`}
          >
            <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <p className="break-words text-xs font-semibold leading-4 text-gray-700 sm:text-sm">{stat.label}</p>
                <p className={`mt-2 text-3xl font-bold sm:mt-3 sm:text-4xl ${stat.valueClassName}`}>
                  {loading ? '--' : stat.value}
                </p>
              </div>
              <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm sm:h-11 sm:w-11 ${stat.iconClassName}`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-600 sm:mt-4 sm:text-sm">
              {error ? 'Dados temporariamente indisponíveis.' : stat.description}
            </p>
          </article>
        );
      })}

      {error && (
        <article className="col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 xl:col-span-5">
          Não foi possível carregar todos os números da família agora. Tente novamente em instantes.
        </article>
      )}

      {!loading && !error && pessoas.length === 0 && (
        <article className="col-span-2 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 xl:col-span-5">
          Ainda não há pessoas cadastradas para gerar os indicadores da página.
        </article>
      )}
    </section>
  );
}
