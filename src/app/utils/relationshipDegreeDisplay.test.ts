import { describe, expect, it } from 'vitest';
import type { Pessoa, Relacionamento, TipoRelacionamento } from '../types';
import { calculateRelationshipDegree } from './relationshipDegree';
import { getRelationshipResultSentence } from './relationshipDegreeDisplay';

function makePerson(id: string, nome: string, overrides: Partial<Pessoa> = {}): Pessoa {
  return {
    id,
    nome_completo: nome,
    humano_ou_pet: 'Humano',
    ...overrides,
  };
}

function makeRelationship(
  id: string,
  origemId: string,
  destinoId: string,
  tipo: TipoRelacionamento,
  overrides: Partial<Relacionamento> = {}
): Relacionamento {
  return {
    id,
    pessoa_origem_id: origemId,
    pessoa_destino_id: destinoId,
    tipo_relacionamento: tipo,
    subtipo_relacionamento: 'sangue',
    ativo: true,
    ...overrides,
  };
}

function calculateSentence(params: {
  origin: string;
  target: string;
  people: Pessoa[];
  relationships: Relacionamento[];
  includeInactiveSpouses?: boolean;
}) {
  const result = calculateRelationshipDegree({
    originPersonId: params.origin,
    targetPersonId: params.target,
    people: params.people,
    relationships: params.relationships,
    includeInactiveSpouses: params.includeInactiveSpouses,
  });

  return getRelationshipResultSentence(result, params.people);
}

describe('getRelationshipResultSentence', () => {
  it('names the father in a second-degree cousin sentence', () => {
    const people = [
      makePerson('tulius', 'Tulius Souza'),
      makePerson('marcio', 'M\u00e1rcio Souza'),
      makePerson('fabio', 'Fabio Tsangaropoulos'),
      makePerson('yuri', 'Yuri Souza'),
      makePerson('bianca', 'Bianca Souza'),
    ];

    const relationships = [
      makeRelationship('r1', 'tulius', 'marcio', 'pai'),
      makeRelationship('r2', 'marcio', 'fabio', 'irmao'),
      makeRelationship('r3', 'yuri', 'fabio', 'pai'),
      makeRelationship('r4', 'bianca', 'yuri', 'pai'),
    ];

    expect(calculateSentence({ origin: 'tulius', target: 'bianca', people, relationships }))
      .toBe('Tulius e Bianca s\u00e3o primos de segundo grau. O pai de Bianca, Yuri, \u00e9 primo de Tulius.');
  });

  it('describes the mother of the spouse of an uncle', () => {
    const people = [
      makePerson('tulius', 'Tulius Souza'),
      makePerson('marcio', 'M\u00e1rcio Souza'),
      makePerson('fabio', 'Fabio Tsangaropoulos'),
      makePerson('monika', 'Monika Bezerra'),
      makePerson('lourdes', 'Lourdes Bezerra'),
    ];

    const relationships = [
      makeRelationship('r1', 'tulius', 'marcio', 'pai'),
      makeRelationship('r2', 'marcio', 'fabio', 'irmao'),
      makeRelationship('r3', 'fabio', 'monika', 'conjuge', { subtipo_relacionamento: 'casamento', ativo: false }),
      makeRelationship('r4', 'monika', 'lourdes', 'mae'),
    ];

    expect(calculateSentence({
      origin: 'tulius',
      target: 'lourdes',
      people,
      relationships,
      includeInactiveSpouses: true,
    })).toBe('Lourdes Bezerra \u00e9 m\u00e3e de Monika Bezerra, que foi casada com o tio de Tulius, Fabio Tsangaropoulos.');
  });

  it('uses past tense when the spouse in an aunt-or-uncle path is deceased', () => {
    const people = [
      makePerson('tulius', 'Tulius Souza'),
      makePerson('marcio', 'M\u00e1rcio Souza'),
      makePerson('absalon', 'Absalon Jr.'),
      makePerson('roseli', 'Roseli S\u00e1', { falecido: true }),
    ];

    const relationships = [
      makeRelationship('r1', 'tulius', 'marcio', 'pai'),
      makeRelationship('r2', 'marcio', 'absalon', 'irmao'),
      makeRelationship('r3', 'absalon', 'roseli', 'conjuge', { subtipo_relacionamento: 'casamento', ativo: true }),
    ];

    expect(calculateSentence({ origin: 'tulius', target: 'roseli', people, relationships }))
      .toBe('Tulius Souza \u00e9 filho de M\u00e1rcio Souza, que \u00e9 irm\u00e3o de Absalon Jr. Roseli S\u00e1 foi c\u00f4njuge de Absalon Jr.');
  });
});
