import { HeartHandshake, Medal } from 'lucide-react';
import {
  buildCoupleAnniversaries,
  curiositySectionCardClassName,
  curiosityStatusClassName,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

export function CuriosidadesCouples({
  pessoas,
  relacionamentos,
  loading,
  error,
}: CuriosidadesDataProps) {
  const couples = buildCoupleAnniversaries(pessoas, relacionamentos);
  const displayCouples = couples.filter((couple) => couple.milestone).slice(0, 4);
  const unionCountLabel = `${displayCouples.length} ${displayCouples.length === 1 ? 'uni?o' : 'uni?es'}`;

  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <HeartHandshake className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-bold text-gray-950">Bodas</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Casais ativos com datas de casamento registradas e marcos importantes da hist?ria familiar.
          </p>
        </div>
        <span className={curiosityStatusClassName}>
          {loading ? 'Carregando' : unionCountLabel}
        </span>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          N?o foi poss?vel carregar os v?nculos matrimoniais agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {!error && !loading && displayCouples.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Ainda n?o h? casais ativos com bodas de 1, 5, 10, 15, 20, 25, 30, 40, 45, 50, 60 ou 75 anos.
        </div>
      )}

      {!error && !loading && displayCouples.length > 0 && (
        <div className="mt-5 space-y-3">
          {displayCouples.map((couple) => (
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
      )}
    </section>
  );
}
