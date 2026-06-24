import { BriefcaseBusiness, CalendarDays, UsersRound } from 'lucide-react';
import {
  curiositySectionCardClassName,
  getBirthMonthCounts,
  getPeopleByAgeRange,
  getProfessionRanking,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

type ChartDatum = {
  label: string;
  value: number;
};

const MONTH_ABBREVIATIONS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getMaxValue(data: ChartDatum[]) {
  return Math.max(1, ...data.map((item) => item.value));
}

function BirthdayMonthChartCard({
  data,
  loading,
}: {
  data: ChartDatum[];
  loading: boolean;
}) {
  const maxValue = getMaxValue(data);
  const hasValues = data.some((item) => item.value > 0);

  return (
    <article className={`${curiositySectionCardClassName} lg:flex-[1.15]`}>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-blue-700" />
        <h3 className="text-base font-bold text-gray-950">Aniversários por mês</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        Distribuição dos nascimentos cadastrados ao longo do ano.
      </p>

      {loading ? (
        <div className="mt-5 h-44 animate-pulse rounded-xl bg-gray-100" />
      ) : !hasValues ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Complete datas de nascimento para gerar este gráfico.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <div className="grid min-w-[34rem] grid-cols-12 gap-1 rounded-xl bg-gray-50 px-3 pb-3 pt-5">
            {data.map((item) => {
              const height = item.value > 0
                ? Math.max(10, Math.round((item.value / maxValue) * 100))
                : 2;

              return (
                <div key={item.label} className="flex min-w-0 flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end justify-center border-l border-gray-200">
                    <div
                      className="w-5 rounded-t-lg bg-blue-600"
                      style={{ height: `${height}%` }}
                      aria-label={`${item.label}: ${item.value}`}
                      title={`${item.label}: ${item.value}`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

function ProfessionRankingCard({
  data,
  loading,
}: {
  data: ChartDatum[];
  loading: boolean;
}) {
  const visibleProfessions = data.slice(0, 5);

  return (
    <article className={`${curiositySectionCardClassName} lg:flex-1`}>
      <div className="flex items-center gap-2">
        <BriefcaseBusiness className="h-4 w-4 text-blue-700" />
        <h3 className="text-base font-bold text-gray-950">Profissões mais comuns</h3>
      </div>

      {loading ? (
        <div className="mt-5 h-32 animate-pulse rounded-xl bg-gray-100" />
      ) : visibleProfessions.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Complete profissões nos perfis para gerar este gráfico.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {visibleProfessions.map((item) => (
            <div
              key={item.label}
              className="aspect-square min-h-24 rounded-full bg-blue-600 p-3 text-white shadow-sm shadow-blue-900/10"
            >
              <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
                <BriefcaseBusiness className="h-5 w-5 shrink-0" />
                <span className="text-2xl font-black leading-none">{item.value}</span>
                <span className="max-w-full text-[11px] font-bold leading-tight">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function AgeRangeChartCard({
  data,
  loading,
}: {
  data: ChartDatum[];
  loading: boolean;
}) {
  const maxValue = getMaxValue(data);

  return (
    <article className={`${curiositySectionCardClassName} flex h-full min-h-[34rem] flex-col`}>
      <div className="flex items-center gap-2">
        <UsersRound className="h-4 w-4 text-blue-700" />
        <h3 className="text-base font-bold text-gray-950">Faixa Etária</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        Distribuição dos familiares por faixa de idade.
      </p>

      {loading ? (
        <div className="mt-5 h-full min-h-80 animate-pulse rounded-xl bg-gray-100" />
      ) : data.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Complete datas de nascimento para comparar faixas etárias.
        </div>
      ) : (
        <div className="mt-6 flex flex-1 flex-col justify-between gap-5">
          {data.map((item) => {
            const width = Math.max(8, Math.round((item.value / maxValue) * 100));

            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-bold text-gray-800">{item.label}</span>
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-sm">
                    {item.value}
                  </span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${width}%` }}
                    aria-label={`${item.label}: ${item.value}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function CuriosidadesCharts({
  pessoas,
  loading,
  error,
}: CuriosidadesDataProps) {
  const birthMonthData = getBirthMonthCounts(pessoas).map((month, index) => ({
    label: MONTH_ABBREVIATIONS[index] ?? month.label.slice(0, 3),
    value: month.count,
  }));

  const ageRangeData = getPeopleByAgeRange(pessoas)
    .filter((range) => range.people.length > 0)
    .map((range) => ({
      label: range.label,
      value: range.people.length,
    }));

  const professionData = getProfessionRanking(pessoas, 6).map((profession) => ({
    label: profession.label,
    value: profession.count,
  }));

  return (
    <section>
      <div className="mb-4 rounded-2xl bg-slate-100 px-4 py-3">
        <h2 className="text-xl font-bold text-gray-950">Gráficos da família</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar os gráficos familiares agora.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <div className="flex min-w-0 flex-col gap-4 lg:h-full lg:min-h-[34rem]">
          <BirthdayMonthChartCard data={birthMonthData} loading={loading && !error} />
          <ProfessionRankingCard data={professionData} loading={loading && !error} />
        </div>

        <AgeRangeChartCard data={ageRangeData} loading={loading && !error} />
      </div>
    </section>
  );
}
