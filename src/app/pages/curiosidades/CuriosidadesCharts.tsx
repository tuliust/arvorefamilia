import { BarChart3, BriefcaseBusiness, CalendarDays, HeartHandshake, UsersRound } from 'lucide-react';
import type { Pessoa, Relacionamento } from '../../types';
import {
  calculateFullYearsSince,
  curiositySectionCardClassName,
  getBirthMonthCounts,
  getPeopleBySocialGeneration,
  getProfessionRanking,
  parseFamilyDate,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

type ChartDatum = {
  label: string;
  value: number;
  note?: string;
};

type WeddingAgeStats = {
  average: number;
  min: number;
  max: number;
  count: number;
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

function buildWeddingAgeStats(pessoas: Pessoa[], relacionamentos: Relacionamento[]): WeddingAgeStats | null {
  const pessoasMap = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const ages: number[] = [];

  relacionamentos.forEach((relacionamento) => {
    const weddingDate = parseFamilyDate(relacionamento.data_casamento);
    if (!weddingDate) return;

    const pessoaA = pessoasMap.get(relacionamento.pessoa_origem_id);
    const pessoaB = pessoasMap.get(relacionamento.pessoa_destino_id);

    [pessoaA, pessoaB].forEach((pessoa) => {
      if (!pessoa?.data_nascimento) return;

      const age = calculateFullYearsSince(pessoa.data_nascimento, weddingDate);

      if (age >= 12 && age <= 100) {
        ages.push(age);
      }
    });
  });

  if (ages.length === 0) return null;

  const total = ages.reduce((sum, age) => sum + age, 0);

  return {
    average: Math.round(total / ages.length),
    min: Math.min(...ages),
    max: Math.max(...ages),
    count: ages.length,
  };
}

export function CuriosidadesCharts({
  pessoas,
  relacionamentos,
  loading,
  error,
}: CuriosidadesDataProps) {
  const birthMonthData = getBirthMonthCounts(pessoas)
    .filter((month) => month.count > 0)
    .map((month) => ({
      label: month.label,
      value: month.count,
    }));

  const generationData = getPeopleBySocialGeneration(pessoas)
    .filter((generation) => generation.people.length > 0)
    .map((generation) => ({
      label: generation.label,
      value: generation.people.length,
      note: generation.period,
    }));

  const professionData = getProfessionRanking(pessoas, 6).map((profession) => ({
    label: profession.label,
    value: profession.count,
  }));

  const weddingAgeStats = buildWeddingAgeStats(pessoas, relacionamentos);

  return (
    <section>
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-blue-700" />
          <h2 className="text-xl font-bold text-gray-950">Gráficos da família</h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Visualizações simples baseadas nos dados reais cadastrados nos perfis e vínculos.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar os gráficos familiares agora.
        </div>
      )}

      {loading && !error ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard
            title="Aniversários por mês"
            description="Distribuição dos nascimentos cadastrados ao longo do ano."
            data={birthMonthData}
            emptyLabel="Complete datas de nascimento para gerar este gráfico."
            icon={CalendarDays}
          />

          <ChartCard
            title="Pessoas por geração"
            description="Classificação sociológica calculada pelo ano de nascimento."
            data={generationData}
            emptyLabel="Complete anos de nascimento para comparar gerações."
            icon={UsersRound}
          />

          <ChartCard
            title="Profissões mais comuns"
            description="Profissões mais recorrentes nos perfis familiares."
            data={professionData}
            emptyLabel="Complete profissões nos perfis para gerar este gráfico."
            icon={BriefcaseBusiness}
          />

          <article className={curiositySectionCardClassName}>
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-blue-700" />
              <h3 className="text-base font-bold text-gray-950">Idade média ao casar</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Estimativa calculada com data de casamento e data de nascimento dos cônjuges.
            </p>

            {!weddingAgeStats ? (
              <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
                Cadastre datas de casamento e nascimento para calcular este indicador.
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-semibold text-blue-700">Média</p>
                  <p className="mt-2 text-2xl font-bold text-gray-950">{weddingAgeStats.average} anos</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-600">Faixa</p>
                  <p className="mt-2 text-2xl font-bold text-gray-950">
                    {weddingAgeStats.min}-{weddingAgeStats.max}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-600">Registros</p>
                  <p className="mt-2 text-2xl font-bold text-gray-950">{weddingAgeStats.count}</p>
                </div>
              </div>
            )}
          </article>
        </div>
      )}
    </section>
  );
}