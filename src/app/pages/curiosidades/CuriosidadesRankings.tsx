import { BriefcaseBusiness, CalendarDays, Lightbulb, MapPin, Signature } from 'lucide-react';
import {
  curiositySectionCardClassName,
  curiosityStatusClassName,
  getBirthCityRanking,
  getMostRepeatedFirstNames,
  getProfessionRanking,
  getTopBirthMonth,
  type CuriosidadesDataProps,
  type TopCount,
} from './curiosidadesUtils';

type RankingCard = {
  title: string;
  headline: string;
  description: string;
  items: TopCount[];
  icon: typeof Lightbulb;
};

function formatRankingList(items: TopCount[]) {
  return items.slice(0, 5);
}

export function CuriosidadesRankings({
  pessoas,
  loading,
  error,
}: CuriosidadesDataProps) {
  const names = getMostRepeatedFirstNames(pessoas, 5);
  const professions = getProfessionRanking(pessoas, 5);
  const cities = getBirthCityRanking(pessoas, 5);
  const topBirthMonth = getTopBirthMonth(pessoas);

  const cards: RankingCard[] = [
    {
      title: 'Nome mais repetido',
      headline: names[0]
        ? `O nome mais repetido na família é ${names[0].label}.`
        : 'Ainda não há nomes suficientes para calcular este ranking.',
      description: names[0]
        ? `Ele aparece em ${names[0].count} ${names[0].count === 1 ? 'pessoa cadastrada' : 'pessoas cadastradas'}.`
        : 'Cadastre mais familiares para identificar padrões de nomes.',
      items: names,
      icon: Signature,
    },
    {
      title: 'Mês com mais aniversários',
      headline: topBirthMonth
        ? `O mês com mais aniversários é ${topBirthMonth.label}.`
        : 'Ainda não há aniversários suficientes para comparar os meses.',
      description: topBirthMonth
        ? `${topBirthMonth.count} ${topBirthMonth.count === 1 ? 'pessoa faz' : 'pessoas fazem'} aniversário nesse mês.`
        : 'Complete datas de nascimento para gerar este indicador.',
      items: topBirthMonth ? [{ label: topBirthMonth.label, count: topBirthMonth.count }] : [],
      icon: CalendarDays,
    },
    {
      title: 'Profissão mais repetida',
      headline: professions[0]
        ? `A profissão mais repetida é ${professions[0].label}.`
        : 'Ainda não há profissões suficientes para calcular este ranking.',
      description: professions[0]
        ? `${professions[0].count} ${professions[0].count === 1 ? 'pessoa tem' : 'pessoas têm'} essa profissão cadastrada.`
        : 'Preencha profissões nos perfis para revelar padrões entre gerações.',
      items: professions,
      icon: BriefcaseBusiness,
    },
    {
      title: 'Cidade de nascimento mais comum',
      headline: cities[0]
        ? `${cities[0].label} aparece como cidade de nascimento principal.`
        : 'Ainda não há cidades suficientes para comparar os locais de nascimento.',
      description: cities[0]
        ? `${cities[0].count} ${cities[0].count === 1 ? 'pessoa nasceu' : 'pessoas nasceram'} nesse local.`
        : 'Complete locais de nascimento para gerar este ranking.',
      items: cities,
      icon: MapPin,
    },
  ];

  return (
    <section>
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-blue-700" />
          <h2 className="text-xl font-bold text-gray-950">Você Sabia?</h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Curiosidades calculadas a partir dos dados cadastrados na árvore familiar.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar rankings familiares agora.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const ranking = formatRankingList(card.items);

          return (
            <article key={card.title} className={curiositySectionCardClassName}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-700">{card.title}</p>
                  <h3 className="mt-3 text-base font-bold leading-6 text-gray-950">
                    {loading ? 'Carregando dados familiares...' : card.headline}
                  </h3>
                </div>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {loading ? 'Aguarde enquanto os dados são organizados.' : card.description}
              </p>

              {!loading && ranking.length > 1 && (
                <ol className="mt-4 space-y-2">
                  {ranking.map((item, index) => (
                    <li key={`${card.title}-${item.label}`} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                      <span className="min-w-0 truncate text-gray-700">
                        {index + 1}. {item.label}
                      </span>
                      <span className="shrink-0 font-bold text-gray-950">{item.count}</span>
                    </li>
                  ))}
                </ol>
              )}

              {!loading && ranking.length === 0 && (
                <span className={`${curiosityStatusClassName} mt-4`}>
                  Aguardando dados familiares
                </span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
