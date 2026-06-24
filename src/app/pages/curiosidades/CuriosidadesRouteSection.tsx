import { Route } from 'lucide-react';

import {
  curiositySectionCardClassName,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

const ROAD_ROUTE_TOTAL_KM = 4231;

const ROAD_ROUTE_STOPS = [
  'Natal/RN',
  'Recife/PE',
  'Paulo Afonso/BA',
  'Aracaju/SE',
  'Belo Horizonte/MG',
  'Porto Alegre/RS',
];

const ROAD_ROUTE_SEGMENTS = [
  { from: 'Natal', to: 'Recife', distanceKm: 285 },
  { from: 'Recife', to: 'Paulo Afonso', distanceKm: 445 },
  { from: 'Paulo Afonso', to: 'Aracaju', distanceKm: 262 },
  { from: 'Aracaju', to: 'Belo Horizonte', distanceKm: 1533 },
  { from: 'Belo Horizonte', to: 'Porto Alegre', distanceKm: 1706 },
];

function formatRoadDistance(value: number) {
  return `${value.toLocaleString('pt-BR')} km`;
}

export function CuriosidadesRouteSection({
  loading,
  error,
}: CuriosidadesDataProps) {
  return (
    <section className={curiositySectionCardClassName}>
      <div className="min-w-0">
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
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">Distância aproximada</p>
            <p className="mt-2 text-3xl font-black leading-tight text-gray-950 sm:text-4xl">
              {formatRoadDistance(ROAD_ROUTE_TOTAL_KM)}
            </p>
            <p className="mt-2 text-sm font-semibold text-blue-900">Com transporte rodoviário</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.58fr)_minmax(16rem,0.42fr)] lg:items-start">
            <div className="grid gap-2">
              {ROAD_ROUTE_STOPS.map((city, index) => (
                <div key={city} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-700 shadow-sm">
                    {index + 1}
                  </span>
                  <span className="min-w-0 truncate text-sm font-semibold text-gray-800">
                    {city}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="text-sm font-bold text-gray-950">Distâncias entre cidades</p>
              <div className="mt-3 space-y-2">
                {ROAD_ROUTE_SEGMENTS.map((segment) => (
                  <div key={`${segment.from}-${segment.to}`} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 text-gray-700">{segment.from} → {segment.to}</span>
                      <span className="shrink-0 font-bold text-blue-700">{formatRoadDistance(segment.distanceKm)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
