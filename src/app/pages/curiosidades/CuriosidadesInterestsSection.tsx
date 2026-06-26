import { useEffect, useMemo, useState } from 'react';
import { GitCompareArrows, Sparkles } from 'lucide-react';
import {
  comparePeopleInterests,
  curiositySectionCardClassName,
  getInitials,
  getPersonDisplayName,
  getPersonInterestProfile,
  isPet,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

type CuriosidadesInterestsSectionProps = CuriosidadesDataProps & {
  embedded?: boolean;
};

function formatCommonPoints(count: number) {
  return `${count} ${count === 1 ? 'ponto em comum' : 'pontos em comum'}`;
}

export function CuriosidadesInterestsSection({
  pessoas,
  profileBadgesByPersonId,
  loading,
  error,
  embedded = false,
}: CuriosidadesInterestsSectionProps) {
  const selectablePeople = useMemo(
    () => pessoas.filter((pessoa) => !isPet(pessoa) && pessoa.nome_completo),
    [pessoas]
  );

  const [firstPersonId, setFirstPersonId] = useState('');
  const [secondPersonId, setSecondPersonId] = useState('');

  useEffect(() => {
    if (selectablePeople.length < 2) {
      if (firstPersonId || secondPersonId) {
        setFirstPersonId('');
        setSecondPersonId('');
      }
      return;
    }

    if (firstPersonId && !selectablePeople.some((pessoa) => pessoa.id === firstPersonId)) {
      setFirstPersonId('');
    }

    if (secondPersonId && !selectablePeople.some((pessoa) => pessoa.id === secondPersonId)) {
      setSecondPersonId('');
    }

    if (firstPersonId && secondPersonId && firstPersonId === secondPersonId) {
      setSecondPersonId('');
    }
  }, [firstPersonId, secondPersonId, selectablePeople]);

  const firstPerson = selectablePeople.find((pessoa) => pessoa.id === firstPersonId) ?? null;
  const secondPerson = selectablePeople.find((pessoa) => pessoa.id === secondPersonId) ?? null;
  const hasSelectedBoth = Boolean(firstPerson && secondPerson);

  const comparison = comparePeopleInterests(firstPerson, secondPerson, profileBadgesByPersonId);
  const firstProfile = firstPerson ? getPersonInterestProfile(firstPerson, profileBadgesByPersonId) : null;
  const secondProfile = secondPerson ? getPersonInterestProfile(secondPerson, profileBadgesByPersonId) : null;

  return (
    <section className={embedded ? 'min-w-0' : curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <GitCompareArrows className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Comparar interesses</h2>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        Compare duas pessoas pelas características, gostos e interesses preenchidos nos perfis.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar os perfis para comparação agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 h-56 animate-pulse rounded-xl bg-gray-100" />
      )}

      {!error && !loading && selectablePeople.length < 2 && (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Cadastre pelo menos duas pessoas para comparar afinidades.
        </div>
      )}

      {!error && !loading && selectablePeople.length >= 2 && (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">
              Pessoa 1
              <select
                value={firstPersonId}
                onChange={(event) => setFirstPersonId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Selecione</option>
                {selectablePeople.map((pessoa) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {getPersonDisplayName(pessoa)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Pessoa 2
              <select
                value={secondPersonId}
                onChange={(event) => setSecondPersonId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Selecione</option>
                {selectablePeople
                  .filter((pessoa) => pessoa.id !== firstPersonId)
                  .map((pessoa) => (
                    <option key={pessoa.id} value={pessoa.id}>
                      {getPersonDisplayName(pessoa)}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {!hasSelectedBoth && (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
              Selecione duas pessoas para comparar características, gostos e interesses.
            </div>
          )}

          {hasSelectedBoth && firstPerson && secondPerson && (
            <>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Afinidade estimada: {comparison.score}%</p>
                    <p className="mt-1 text-sm leading-6 text-blue-900">
                      {comparison.common.length > 0
                        ? `${getPersonDisplayName(firstPerson)} e ${getPersonDisplayName(secondPerson)} têm ${formatCommonPoints(comparison.common.length)}.`
                        : 'Ainda não foram encontradas características em comum nos dados cadastrados.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[firstProfile, secondProfile].map((profile) => (
                  profile && (
                    <article key={profile.pessoa.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        {profile.pessoa.foto_principal_url ? (
                          <img src={profile.pessoa.foto_principal_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                            {getInitials(profile.pessoa.nome_completo)}
                          </span>
                        )}
                        <p className="min-w-0 truncate font-bold text-gray-950">{getPersonDisplayName(profile.pessoa)}</p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {profile.interests.slice(0, 8).map((interest) => (
                          <span key={interest} className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {interest}
                          </span>
                        ))}

                        {profile.interests.length === 0 && (
                          <span className="text-sm text-gray-500">Sem características cadastradas.</span>
                        )}
                      </div>
                    </article>
                  )
                ))}
              </div>

              {comparison.common.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-bold text-gray-950">Pontos em comum</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {comparison.common.map((interest) => (
                      <span key={interest} className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
