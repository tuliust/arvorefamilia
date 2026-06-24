import { useEffect, useState } from 'react';
import { ChevronDown, GitBranch } from 'lucide-react';
import {
  curiositySectionCardClassName,
  getInitials,
  getPeopleBySocialGeneration,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

function PersonBadge({ pessoa }: { pessoa: CuriosidadesDataProps['pessoas'][number] }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700">
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
  );
}

function GenerationPeopleBadges({ people }: { people: CuriosidadesDataProps['pessoas'] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {people.map((pessoa) => (
        <PersonBadge key={pessoa.id} pessoa={pessoa} />
      ))}
    </div>
  );
}

type CuriosidadesGenerationsProps = CuriosidadesDataProps & {
  className?: string;
};

export function CuriosidadesGenerations({
  pessoas,
  loading,
  error,
  className = '',
}: CuriosidadesGenerationsProps) {
  const generations = getPeopleBySocialGeneration(pessoas);
  const generationsWithPeople = generations.filter((generation) => generation.people.length > 0);
  const [expandedGenerationKey, setExpandedGenerationKey] = useState<string>('');

  useEffect(() => {
    if (!expandedGenerationKey) return;

    if (!generationsWithPeople.some((generation) => generation.key === expandedGenerationKey)) {
      setExpandedGenerationKey('');
    }
  }, [expandedGenerationKey, generationsWithPeople]);

  return (
    <section className={`${curiositySectionCardClassName} ${className}`}>
      <div>
        <div className="flex items-center gap-3">
          <GitBranch className="h-5 w-5 text-blue-700" />
          <h2 className="text-xl font-bold text-gray-950">Gerações da família</h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
          Veja quem faz parte de cada geração social a partir do ano de nascimento cadastrado.
        </p>
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
          {generationsWithPeople.map((generation) => {
            const expanded = expandedGenerationKey === generation.key;

            return (
              <article key={generation.key} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 text-left"
                  onClick={() => setExpandedGenerationKey((current) => current === generation.key ? '' : generation.key)}
                  aria-expanded={expanded}
                >
                  <span className="min-w-0">
                    <span className="block text-base font-bold text-gray-950">{generation.label}</span>
                    <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-blue-700">{generation.period}</span>
                  </span>

                  <span className="inline-flex shrink-0 items-center gap-2">
                    <span className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700">
                      {generation.people.length} {generation.people.length === 1 ? 'pessoa' : 'pessoas'}
                    </span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-blue-700 shadow-sm">
                      <ChevronDown
                        className={[
                          'h-4 w-4 transition-transform',
                          expanded ? 'rotate-180' : '',
                        ].join(' ')}
                      />
                    </span>
                  </span>
                </button>

                <p className="mt-3 text-sm leading-6 text-gray-600">{generation.description}</p>
                {generation.note && (
                  <p className="mt-2 text-xs leading-5 text-gray-500">{generation.note}</p>
                )}

                {expanded && <GenerationPeopleBadges people={generation.people} />}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
