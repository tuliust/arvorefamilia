import { CalendarHeart, Flower2, Gift, Heart } from 'lucide-react';
import {
  buildTodayFamilyEvents,
  curiositySectionCardClassName,
  type CuriosidadesDataProps,
  type TodayFamilyEvent,
} from './curiosidadesUtils';

const eventIconByType: Record<TodayFamilyEvent['type'], typeof Gift> = {
  birthday: Gift,
  death: Flower2,
  wedding: Heart,
};

export function CuriosidadesToday({
  pessoas,
  relacionamentos,
  loading,
  error,
}: CuriosidadesDataProps) {
  const events = buildTodayFamilyEvents(pessoas, relacionamentos).slice(0, 6);

  return (
    <section className={curiositySectionCardClassName}>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <CalendarHeart className="h-5 w-5 text-blue-700" />
          <h2 className="text-xl font-bold text-gray-950">Hoje na família</h2>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Aniversários, memórias, casamentos e acontecimentos cadastrados para a data de hoje.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar as datas familiares agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {!error && !loading && events.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Nenhuma data importante cadastrada para hoje. Complete datas de nascimento, casamento, falecimento e memórias para enriquecer esta área.
        </div>
      )}

      {!error && !loading && events.length > 0 && (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const Icon = eventIconByType[event.type];

            return (
              <article key={event.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-5 text-gray-950">{event.title}</p>
                    <p className="mt-2 text-xs text-gray-500">{event.subtitle}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
