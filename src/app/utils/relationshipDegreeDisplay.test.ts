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
      makePerson('marcio', 'Márcio Souza'),
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
      .toBe('Tulius e Bianca são primos de segundo grau. O pai de Bianca, Yuri, é primo de Tulius.');
  });


  it('uses the first name only when inferring the parent label for second-degree cousins', () => {
    const people = [
      makePerson('tulius', 'Tulius Souza'),
      makePerson('marcio', 'Marcio Souza'),
      makePerson('fabio', 'Fabio Tsangaropoulos'),
      makePerson('caio', 'Caio Souza'),
      makePerson('cecilia', 'Cecilia Viana Souza'),
    ];

    const relationships = [
      makeRelationship('r1', 'tulius', 'marcio', 'pai'),
      makeRelationship('r2', 'marcio', 'fabio', 'irmao'),
      makeRelationship('r3', 'caio', 'fabio', 'pai'),
      makeRelationship('r4', 'caio', 'cecilia', 'filho'),
    ];

    expect(calculateSentence({ origin: 'tulius', target: 'cecilia', people, relationships }))
      .toBe('Tulius e Cecilia são primos de segundo grau. O pai de Cecilia, Caio, é primo de Tulius.');
  });
  it('describes the spouse of a sibling path', () => {
    const people = [
      makePerson('tulius', 'Tulius Souza'),
      makePerson('tassius', 'Tassius Souza'),
      makePerson('layana', 'Layana Medeiros'),
    ];

    const relationships = [
      makeRelationship('r1', 'tulius', 'tassius', 'irmao'),
      makeRelationship('r2', 'tassius', 'layana', 'conjuge', { subtipo_relacionamento: 'casamento' }),
    ];

    expect(calculateSentence({ origin: 'tulius', target: 'layana', people, relationships }))
      .toBe('Tulius Souza é irmão de Tassius Souza, cônjuge de Layana Medeiros.');
  });


  it('describes the spouse of a male cousin', () => {
    const people = [
      makePerson('tulius', 'Tulius Souza'),
      makePerson('marcio', 'Marcio Souza'),
      makePerson('fabio', 'Fabio Tsangaropoulos'),
      makePerson('caio', 'Caio Souza'),
      makePerson('alexia', 'Alexia Lopes'),
    ];

    const relationships = [
      makeRelationship('r1', 'tulius', 'marcio', 'pai'),
      makeRelationship('r2', 'marcio', 'fabio', 'irmao'),
      makeRelationship('r3', 'caio', 'fabio', 'pai'),
      makeRelationship('r4', 'alexia', 'caio', 'conjuge', { subtipo_relacionamento: 'casamento' }),
    ];

    expect(calculateSentence({ origin: 'tulius', target: 'alexia', people, relationships }))
      .toBe('Alexia Lopes é cônjuge do primo de Tulius Souza, Caio Souza.');
  });
  it('describes the mother of the spouse of an uncle', () => {
    const people = [
      makePerson('tulius', 'Tulius Souza'),
      makePerson('marcio', 'Márcio Souza'),
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
    })).toBe('Lourdes Bezerra é mãe de Monika Bezerra, que foi casada com o tio de Tulius, Fabio Tsangaropoulos.');
  });

  it('uses past tense when the spouse in an aunt-or-uncle path is deceased', () => {
    const people = [
      makePerson('tulius', 'Tulius Souza'),
      makePerson('marcio', 'Márcio Souza'),
      makePerson('absalon', 'Absalon Jr.'),
      makePerson('roseli', 'Roseli Sá', { falecido: true }),
    ];

    const relationships = [
      makeRelationship('r1', 'tulius', 'marcio', 'pai'),
      makeRelationship('r2', 'marcio', 'absalon', 'irmao'),
      makeRelationship('r3', 'absalon', 'roseli', 'conjuge', { subtipo_relacionamento: 'casamento', ativo: true }),
    ];

    expect(calculateSentence({ origin: 'tulius', target: 'roseli', people, relationships }))
      .toBe('Tulius Souza é filho de Márcio Souza, que é irmão de Absalon Jr. Roseli Sá foi cônjuge de Absalon Jr.');
  });
});

