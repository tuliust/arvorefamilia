export type GeoPoint = {
  id?: string;
  label: string;
  latitude: number;
  longitude: number;
  count?: number;
};

export type GeoRouteStop = GeoPoint & {
  order: number;
  distanceFromPreviousKm: number;
};

export type GeoRouteSummary = {
  stops: GeoRouteStop[];
  routeLabel: string;
  totalDistanceKm: number;
  hasEnoughCoordinates: boolean;
};

function isFiniteCoordinate(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidGeoPoint(point: GeoPoint) {
  return (
    Boolean(String(point.label ?? '').trim()) &&
    isFiniteCoordinate(point.latitude) &&
    isFiniteCoordinate(point.longitude) &&
    Math.abs(point.latitude) <= 90 &&
    Math.abs(point.longitude) <= 180
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceKm(origin: GeoPoint, destination: GeoPoint) {
  if (!isValidGeoPoint(origin) || !isValidGeoPoint(destination)) return 0;

  const earthRadiusKm = 6371;
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);

  const originLat = toRadians(origin.latitude);
  const destinationLat = toRadians(destination.latitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function sortCitiesByNearestNeighbor(points: GeoPoint[]) {
  const remaining = points.filter(isValidGeoPoint);
  if (remaining.length <= 2) return remaining;

  const route: GeoPoint[] = [remaining.shift() as GeoPoint];

  while (remaining.length > 0) {
    const current = route[route.length - 1];

    let nearestIndex = 0;
    let nearestDistance = haversineDistanceKm(current, remaining[0]);

    for (let index = 1; index < remaining.length; index += 1) {
      const distance = haversineDistanceKm(current, remaining[index]);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }

    const [nearest] = remaining.splice(nearestIndex, 1);
    route.push(nearest);
  }

  return route;
}

export function buildApproximateFamilyRoute(points: GeoPoint[]): GeoRouteSummary {
  const orderedPoints = sortCitiesByNearestNeighbor(points);

  let totalDistanceKm = 0;

  const stops = orderedPoints.map((point, index) => {
    const previous = orderedPoints[index - 1] ?? null;
    const distanceFromPreviousKm = previous ? haversineDistanceKm(previous, point) : 0;

    totalDistanceKm += distanceFromPreviousKm;

    return {
      ...point,
      order: index + 1,
      distanceFromPreviousKm,
    };
  });

  return {
    stops,
    routeLabel: stops.map((stop) => stop.label).join(' -> '),
    totalDistanceKm,
    hasEnoughCoordinates: stops.length >= 2,
  };
}

export function formatDistanceKm(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0 km';

  if (value >= 100) {
    return `${Math.round(value).toLocaleString('pt-BR')} km`;
  }

  return `${value.toFixed(1).replace('.', ',')} km`;
}