import { HeartHandshake, Medal } from 'lucide-react';
import type { Pessoa, Relacionamento } from '../../types';
import {
  buildCoupleAnniversaries,
  calculateFullYearsSince,
  curiositySectionCardClassName,
  parseFamilyDate,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

type WeddingAgeStats = {
  average: number;
  min: number;
  max: number;
  count: number;
};

function getRelationshipPairKey(relacionamento: CuriosidadesDataProps['relacionamentos'][number]) {
  const ids = [relacionamento.pessoa_origem_id, relacionamento.pessoa_destino_id]
    .filter(Boolean)
    .sort();

  return ids.length === 2 ? ids.join('|') : relacionamento.id;
}

function countActiveUnions(relacionamentos: CuriosidadesDataProps['relacionamentos']) {
  const activeUnionKeys = new Set<string>();

  relacionamentos.forEach((relacionamento) => {
    if (relacionamento.ativo === false) return;
    if (relacionamento.tipo_relacionamento !== 'conjuge') return;
    if (relacionamento.data_separacao || relacionamento.subtipo_relacionamento === 'separado') return;

    activeUnionKeys.add(getRelationshipPairKey(relacionamento));
  });

  return activeUnionKeys.size;
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

type CuriosidadesCouplesProps = CuriosidadesDataProps & {
  className?: string;
};

export function CuriosidadesCouples({
  pessoas,
  relacionamentos,
  loading,
  error,
  className = '',
}: CuriosidadesCouplesProps) {
  const couples = buildCoupleAnniversaries(pessoas, relacionamentos);
  const completedCouples = couples.filter((couple) => couple.years >= 1).slice(0, 6);
  const activeUnionCount = countActiveUnions(relacionamentos);
  const weddingAgeStats = buildWeddingAgeStats(pessoas, relacionamentos);

  return (
    <section className={`${curiositySectionCardClassName} ${className}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <HeartHandshake className="h-5 w-5 text-blue-700" />
          <h2 className="text-xl font-bold text-gray-950">Relacionamentos</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Casamentos, uniões ativas, bodas e indicadores calculados a partir dos vínculos familiares.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar os vínculos matrimoniais agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {!error && !loading && (
        <div className="mt-5 space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-950">Idade média ao casar</h3>
            {!weddingAgeStats ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600 sm:col-span-2">
                  Cadastre datas de casamento e nascimento para calcular este indicador.
                </div>
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-semibold text-blue-700">Uniões</p>
                  <p className="mt-2 text-2xl font-bold text-gray-950">
                    {activeUnionCount}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5">
            {completedCouples.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
                Ainda não há casais ativos com bodas de 1, 5, 10, 15, 20, 25, 30, 40, 45, 50, 60 ou 75 anos.
              </div>
            ) : (
              <div className="mt-4">
                <h3 className="text-base font-bold text-gray-950">Casais que já completaram bodas</h3>
                <div className="mt-3 space-y-3">
                  {completedCouples.map((couple) => (
                    <article key={couple.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                          <Medal className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold leading-6 text-gray-950">{couple.coupleName}</p>
                          <p className="mt-1 text-sm text-gray-600">
                            {couple.durationLabel}
                          </p>
                          {couple.milestone && (
                            <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
                              {couple.milestone.label}: {couple.milestone.description}.
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
