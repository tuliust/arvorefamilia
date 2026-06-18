import { GitBranch } from 'lucide-react';
import {
  curiositySectionCardClassName,
  curiosityStatusClassName,
  getInitials,
  getPeopleBySocialGeneration,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

export function CuriosidadesGenerations({
  pessoas,
  loading,
  error,
}: CuriosidadesDataProps) {
  const generations = getPeopleBySocialGeneration(pessoas);
  const generationsWithPeople = generations.filter((generation) => generation.people.length > 0);
  const peopleWithBirthGeneration = generationsWithPeople.reduce((total, generation) => total + generation.people.length, 0);

  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-bold text-gray-950">Gerações da família</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
            Veja quem faz parte de cada geração social a partir do ano de nascimento cadastrado.
          </p>
        </div>
        <span className={curiosityStatusClassName}>
          {loading ? 'Carregando' : `${peopleWithBirthGeneration} classificados`}
        </span>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar as gerações familiares agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {!error && !loading && generationsWithPeople.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Ainda não há datas de nascimento suficientes para classificar familiares por geração.
        </div>
      )}

      {!error && !loading && generationsWithPeople.length > 0 && (
        <div className="mt-5 space-y-4">
          {generationsWithPeople.map((generation) => (
            <article key={generation.key} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-base font-bold text-gray-950">{generation.label}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-700">{generation.period}</p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700">
                  {generation.people.length} {generation.people.length === 1 ? 'pessoa' : 'pessoas'}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-600">{generation.description}</p>
              {generation.note && (
                <p className="mt-2 text-xs leading-5 text-gray-500">{generation.note}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {generation.people.slice(0, 8).map((pessoa) => (
                  <span key={pessoa.id} className="inline-flex max-w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700">
                    {pessoa.foto_principal_url ? (
                      <img
                        src={pessoa.foto_principal_url}
                        alt=""
                        className="h-6 w-6 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-700">
                        {getInitials(pessoa.nome_completo)}
                      </span>
                    )}
                    <span className="truncate">{pessoa.nome_completo}</span>
                  </span>
                ))}

                {generation.people.length > 8 && (
                  <span className="inline-flex items-center rounded-full border border-dashed border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500">
                    +{generation.people.length - 8}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
