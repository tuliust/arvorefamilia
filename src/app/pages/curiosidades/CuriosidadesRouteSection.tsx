import { MapPinned, Route } from 'lucide-react';

import { formatDistanceKm } from '../../utils/geoDistance';
import {
  buildFamilyRouteSummary,
  curiositySectionCardClassName,
  curiosityStatusClassName,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

export function CuriosidadesRouteSection({
  pessoas,
  loading,
  error,
}: CuriosidadesDataProps) {
  const summary = buildFamilyRouteSummary(pessoas);
  const hasGeoRoute = summary.geoRoute.hasEnoughCoordinates;
  const routeItems = hasGeoRoute ? summary.geoRoute.stops : summary.cities.slice(0, 6);

  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Route className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-bold text-gray-950">Rota da família</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Uma rota pelas cidades onde familiares têm residência cadastrada.
          </p>
        </div>
        <span className={curiosityStatusClassName}>
          {loading ? 'Carregando' : `${summary.cities.length} cidades`}
        </span>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar as cidades da família agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 h-44 animate-pulse rounded-xl bg-gray-100" />
      )}

      {!error && !loading && summary.cities.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Ainda não há cidades de residência suficientes para montar uma rota familiar.
        </div>
      )}

      {!error && !loading && summary.cities.length > 0 && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">
              {hasGeoRoute
                ? `Distância aproximada: ${formatDistanceKm(summary.geoRoute.totalDistanceKm)}`
                : 'Uma viagem para passar pelos principais locais cadastrados passaria por:'}
            </p>
            <p className="mt-3 text-lg font-bold leading-7 text-gray-950">
              {summary.routeLabel}
            </p>
            <p className="mt-3 text-xs leading-5 text-blue-900">
              {hasGeoRoute
                ? `Cálculo por Haversine usando ${summary.coordinateCities} cidades com coordenadas cadastradas.`
                : 'Cadastre coordenadas nas cidades dos perfis para calcular distância em quilômetros. Por enquanto, a rota é textual.'}
            </p>
          </div>

          <div className="grid gap-2">
            {routeItems.map((city, index) => (
              <div key={city.label} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-700 shadow-sm">
                    {index + 1}
                  </span>
                  <span className="min-w-0 truncate text-sm font-semibold text-gray-800">
                    {city.label}
                  </span>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-gray-600">
                  <MapPinned className="h-3.5 w-3.5" />
                  {'distanceFromPreviousKm' in city && city.distanceFromPreviousKm > 0
                    ? formatDistanceKm(city.distanceFromPreviousKm)
                    : city.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
