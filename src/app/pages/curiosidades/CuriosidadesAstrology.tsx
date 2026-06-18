import { useEffect, useMemo, useState } from 'react';
import { MoonStar, Sparkles } from 'lucide-react';
import {
  curiositySectionCardClassName,
  getInitials,
  getPersonDisplayName,
  getZodiacCompatibility,
  getZodiacRanking,
  getZodiacSignFromDate,
  isPet,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

export function CuriosidadesAstrology({
  pessoas,
  loading,
  error,
}: CuriosidadesDataProps) {
  const selectablePeople = useMemo(
    () => pessoas.filter((pessoa) => !isPet(pessoa) && getZodiacSignFromDate(pessoa.data_nascimento)),
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

    const firstStillExists = selectablePeople.some((pessoa) => pessoa.id === firstPersonId);
    const nextFirstPersonId = firstStillExists ? firstPersonId : selectablePeople[0].id;

    const secondCandidates = selectablePeople.filter((pessoa) => pessoa.id !== nextFirstPersonId);
    const secondStillExists = secondCandidates.some((pessoa) => pessoa.id === secondPersonId);
    const nextSecondPersonId = secondStillExists ? secondPersonId : secondCandidates[0]?.id ?? '';

    if (nextFirstPersonId !== firstPersonId) {
      setFirstPersonId(nextFirstPersonId);
    }

    if (nextSecondPersonId !== secondPersonId) {
      setSecondPersonId(nextSecondPersonId);
    }
  }, [firstPersonId, secondPersonId, selectablePeople]);

  const firstPerson = selectablePeople.find((pessoa) => pessoa.id === firstPersonId) ?? selectablePeople[0] ?? null;
  const secondPerson = selectablePeople.find((pessoa) => pessoa.id === secondPersonId) ?? selectablePeople.find((pessoa) => pessoa.id !== firstPerson?.id) ?? null;

  const signA = getZodiacSignFromDate(firstPerson?.data_nascimento);
  const signB = getZodiacSignFromDate(secondPerson?.data_nascimento);
  const compatibility = getZodiacCompatibility(signA, signB);
  const ranking = getZodiacRanking(pessoas);

  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <MoonStar className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Astrologia da família</h2>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        Cruze signos e veja combinações de forma recreativa, a partir das datas de nascimento cadastradas.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar os dados astrológicos agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 h-56 animate-pulse rounded-xl bg-gray-100" />
      )}

      {!error && !loading && selectablePeople.length < 2 && (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Cadastre datas de nascimento completas em pelo menos duas pessoas para comparar signos.
        </div>
      )}

      {!error && !loading && selectablePeople.length >= 2 && firstPerson && secondPerson && (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">
              Pessoa 1
              <select
                value={firstPerson.id}
                onChange={(event) => setFirstPersonId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
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
                value={secondPerson.id}
                onChange={(event) => setSecondPersonId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
                {selectablePeople
                  .filter((pessoa) => pessoa.id !== firstPerson.id)
                  .map((pessoa) => (
                    <option key={pessoa.id} value={pessoa.id}>
                      {getPersonDisplayName(pessoa)}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[{ pessoa: firstPerson, sign: signA }, { pessoa: secondPerson, sign: signB }].map(({ pessoa, sign }) => (
              <article key={pessoa.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  {pessoa.foto_principal_url ? (
                    <img src={pessoa.foto_principal_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                      {getInitials(pessoa.nome_completo)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-950">{getPersonDisplayName(pessoa)}</p>
                    <p className="text-sm text-gray-600">{sign?.name} · elemento {sign?.element}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-purple-700" />
              <div>
                <p className="text-sm font-bold text-purple-900">
                  {compatibility.label}: {compatibility.score}%
                </p>
                <p className="mt-2 text-sm leading-6 text-purple-900">
                  {compatibility.description}
                </p>
                <p className="mt-2 text-xs leading-5 text-purple-800">
                  Conteúdo recreativo. Não deve ser tratado como análise definitiva de relacionamento.
                </p>
              </div>
            </div>
          </div>

          {ranking.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-bold text-gray-950">Signos mais comuns na família</p>
              <div className="mt-3 grid gap-2">
                {ranking.slice(0, 5).map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                    <span className="font-semibold text-gray-700">{item.label}</span>
                    <span className="font-bold text-gray-950">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
