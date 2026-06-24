import { CalendarDays, Flower2, MapPin, PawPrint, Users } from 'lucide-react';
import {
  countDistinctCurrentCities,
  isDeceased,
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
  const totalCurrentCities = countDistinctCurrentCities(pessoas);
  const totalDeceased = pessoas.filter((pessoa) => !isPet(pessoa) && isDeceased(pessoa)).length;
  const totalWeddings = relacionamentos.filter((relacionamento) => Boolean(relacionamento.data_casamento)).length;

  const stats = [
    {
      label: 'Pessoas',
      value: totalHumans,
      description: 'Familiares cadastrados no site',
      icon: Users,
    },
    {
      label: 'Localização',
      value: totalCurrentCities,
      description: 'Cidades onde vivem',
      icon: MapPin,
    },
    {
      label: 'In memoriam',
      value: totalDeceased,
      description: 'Familiares falecidos na árvore genealógica',
      icon: Flower2,
    },
    {
      label: 'Pets',
      value: totalPets,
      description: 'Animais de estimação cadastrados.',
      icon: PawPrint,
    },
    {
      label: 'Casais',
      value: totalWeddings,
      description: 'Relações de união ativas',
      icon: CalendarDays,
    },
  ];

  return (
    <section aria-label="Big numbers" className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.label}
            className="flex min-h-[10.5rem] min-w-0 flex-col justify-between rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm sm:p-5"
          >
            <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <p className="break-words text-xs font-semibold leading-4 text-gray-700 sm:text-sm">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-blue-900 sm:mt-3 sm:text-4xl">
                  {loading ? '--' : stat.value}
                </p>
              </div>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm sm:h-11 sm:w-11">
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
