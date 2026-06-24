import { BarChart3, BriefcaseBusiness, CalendarDays, UsersRound } from 'lucide-react';
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
  note?: string;
};

function getMaxValue(data: ChartDatum[]) {
  return Math.max(1, ...data.map((item) => item.value));
}

function ChartCard({
  title,
  description,
  data,
  emptyLabel,
  icon: Icon,
}: {
  title: string;
  description: string;
  data: ChartDatum[];
  emptyLabel: string;
  icon: typeof BarChart3;
}) {
  const maxValue = getMaxValue(data);

  return (
    <article className={curiositySectionCardClassName}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-blue-700" />
            <h3 className="text-base font-bold text-gray-950">{title}</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          {emptyLabel}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {data.map((item) => {
            const width = Math.max(8, Math.round((item.value / maxValue) * 100));

            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate font-semibold text-gray-700">{item.label}</span>
                  <span className="shrink-0 font-bold text-gray-950">{item.value}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${width}%` }}
                    aria-label={`${item.label}: ${item.value}`}
                  />
                </div>
                {item.note && (
                  <p className="text-xs leading-5 text-gray-500">{item.note}</p>
                )}
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
  const birthMonthData = getBirthMonthCounts(pessoas)
    .filter((month) => month.count > 0)
    .map((month) => ({
      label: month.label,
      value: month.count,
    }));

  const ageRangeData = getPeopleByAgeRange(pessoas)
    .filter((range) => range.people.length > 0)
    .map((range) => ({
      label: range.label,
      value: range.people.length,
      note: range.period,
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

      {loading && !error ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ChartCard
            title="Aniversários por mês"
            description="Distribuição dos nascimentos cadastrados ao longo do ano."
            data={birthMonthData}
            emptyLabel="Complete datas de nascimento para gerar este gráfico."
            icon={CalendarDays}
          />

          <ChartCard
            title="Faixa Etária"
            description="Distribuição dos familiares por faixa de idade."
            data={ageRangeData}
            emptyLabel="Complete datas de nascimento para comparar faixas etárias."
            icon={UsersRound}
          />

          <ChartCard
            title="Profissões mais comuns"
            description="Principais ocupações dos perfis."
            data={professionData}
            emptyLabel="Complete profissões nos perfis para gerar este gráfico."
            icon={BriefcaseBusiness}
          />
        </div>
      )}
    </section>
  );
}
