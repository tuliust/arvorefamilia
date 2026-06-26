import { MapPin, Route } from 'lucide-react';

import { curiositySectionCardClassName, type CuriosidadesDataProps } from './curiosidadesUtils';

const routeMapIllustrationUrl = new URL('../../components/layout/mapa.png', import.meta.url).href;

type RoadRouteStop = {
  label: string;
  distanceToNextKm?: number;
};

const ROAD_ROUTE_TOTAL_KM = 4231;

const ROAD_ROUTE_STOPS: RoadRouteStop[] = [
  { label: 'Natal/RN', distanceToNextKm: 285 },
  { label: 'Recife/PE', distanceToNextKm: 445 },
  { label: 'Paulo Afonso/BA', distanceToNextKm: 262 },
  { label: 'Aracaju/SE', distanceToNextKm: 1533 },
  { label: 'Belo Horizonte/MG', distanceToNextKm: 1706 },
  { label: 'Porto Alegre/RS' },
];

function formatRoadDistance(value: number) {
  return `${value.toLocaleString('pt-BR')} km`;
}

type CuriosidadesRouteSectionProps = CuriosidadesDataProps & {
  className?: string;
};

export function CuriosidadesRouteSection({
  loading,
  error,
  className = '',
}: CuriosidadesRouteSectionProps) {
  return (
    <section className={`${curiositySectionCardClassName} ${className}`}>
      <div>
        <div className="flex items-center gap-3">
          <Route className="h-5 w-5 text-blue-700" />
          <h2 className="text-xl font-bold text-gray-950">Rota da família</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Uma rota pelas cidades onde familiares têm residência cadastrada.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar as cidades da família agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 h-44 animate-pulse rounded-xl bg-gray-100" />
      )}

      {!error && !loading && (
        <div className="mt-5 space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-transparent p-4 lg:min-h-[9rem] lg:overflow-visible">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:min-h-[9rem]">
              <div className="relative z-10 min-w-0 rounded-xl bg-blue-50/92 p-4 sm:p-0 sm:bg-transparent">
                <p className="text-sm font-semibold text-blue-900">Trajeto de carro</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                  {formatRoadDistance(ROAD_ROUTE_TOTAL_KM)}
                </p>
              </div>

              <div className="relative z-20 flex w-full justify-center bg-transparent sm:w-auto sm:justify-end lg:pointer-events-none lg:absolute lg:right-[-10rem] lg:top-1/2 lg:h-[327px] lg:w-[575px] lg:-translate-y-1/2">
                <img
                  src={routeMapIllustrationUrl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-auto w-full max-w-[16rem] object-contain sm:max-w-[18rem] lg:h-[327px] lg:w-[575px] lg:max-w-none lg:drop-shadow-xl"
                />
              </div>
            </div>
          </div>

          <div className="curiosidades-route-list relative z-10 space-y-3 overflow-visible">
            <div className="pointer-events-none absolute bottom-10 right-[4.35rem] top-10 hidden border-r-2 border-dotted border-slate-400 sm:block" />

            {ROAD_ROUTE_STOPS.map((city, index) => {
              const isLast = index === ROAD_ROUTE_STOPS.length - 1;

              return (
                <div
                  key={city.label}
                  className="curiosidades-route-card relative flex min-h-[4.8rem] items-center justify-between gap-3 overflow-visible rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-blue-700 shadow-sm">
                      {index + 1}
                    </span>
                    <span className="min-w-0 truncate text-base font-bold text-gray-900">
                      {city.label}
                    </span>
                  </div>

                  <div className="curiosidades-route-pin-track relative flex w-28 shrink-0 items-center justify-end">
                    <span className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-700 shadow-md ring-1 ring-blue-100">
                      <MapPin className="h-7 w-7 fill-blue-600 text-blue-700" />
                    </span>

                    {city.distanceToNextKm && (
                      <span className="curiosidades-route-distance-badge absolute right-8 top-full z-20 -translate-y-2 rounded-lg border border-blue-100 bg-white px-2.5 py-1 text-xs font-black text-blue-700 shadow-sm">
                        {formatRoadDistance(city.distanceToNextKm)}
                      </span>
                    )}

                    {isLast && (
                      <span className="curiosidades-route-arrival-badge absolute right-0 top-full z-20 -translate-y-2 rounded-lg border border-blue-100 bg-white px-2.5 py-1 text-xs font-black text-blue-700 shadow-sm">
                        Chegada
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
