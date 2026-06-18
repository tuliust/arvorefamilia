import { describe, expect, it } from 'vitest';
import {
  buildApproximateFamilyRoute,
  formatDistanceKm,
  haversineDistanceKm,
  sortCitiesByNearestNeighbor,
  type GeoPoint,
} from './geoDistance';

const portoAlegre: GeoPoint = {
  label: 'Porto Alegre',
  latitude: -30.0346,
  longitude: -51.2177,
};

const florianopolis: GeoPoint = {
  label: 'Florianopolis',
  latitude: -27.5949,
  longitude: -48.5482,
};

const saoPaulo: GeoPoint = {
  label: 'Sao Paulo',
  latitude: -23.5505,
  longitude: -46.6333,
};

describe('geoDistance', () => {
  it('calcula distancia aproximada por Haversine', () => {
    const distance = haversineDistanceKm(portoAlegre, saoPaulo);

    expect(distance).toBeGreaterThan(800);
    expect(distance).toBeLessThan(900);
  });

  it('ordena cidades pelo vizinho mais proximo', () => {
    const route = sortCitiesByNearestNeighbor([portoAlegre, saoPaulo, florianopolis]);

    expect(route.map((point) => point.label)).toEqual([
      'Porto Alegre',
      'Florianopolis',
      'Sao Paulo',
    ]);
  });

  it('monta resumo de rota com distancia total', () => {
    const summary = buildApproximateFamilyRoute([portoAlegre, saoPaulo, florianopolis]);

    expect(summary.hasEnoughCoordinates).toBe(true);
    expect(summary.stops).toHaveLength(3);
    expect(summary.totalDistanceKm).toBeGreaterThan(800);
    expect(summary.totalDistanceKm).toBeLessThan(950);
    expect(summary.routeLabel).toContain('Porto Alegre');
  });

  it('formata distancia em km', () => {
    expect(formatDistanceKm(0)).toBe('0 km');
    expect(formatDistanceKm(12.34)).toBe('12,3 km');
    expect(formatDistanceKm(1234.56)).toBe('1.235 km');
  });
});