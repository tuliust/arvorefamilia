import { Route } from 'lucide-react';

import { curiositySectionCardClassName, type CuriosidadesDataProps } from './curiosidadesUtils';

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
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">Distância aproximada</p>
            <p className="mt-2 text-4xl font-black tracking-tight text-gray-950">
              {formatRoadDistance(ROAD_ROUTE_TOTAL_KM)}
            </p>
            <p className="mt-3 text-sm font-bold text-blue-900">
              Com transporte rodoviário
            </p>
          </div>

          <div className="grid gap-2">
            {ROAD_ROUTE_STOPS.map((city, index) => (
              <div key={city.label} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-700 shadow-sm">
                    {index + 1}
                  </span>
                  <span className="min-w-0 truncate text-sm font-semibold text-gray-800">
                    {city.label}
                  </span>
                </div>

                {city.distanceToNextKm ? (
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 shadow-sm">
                    {formatRoadDistance(city.distanceToNextKm)}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500 shadow-sm">
                    chegada
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
