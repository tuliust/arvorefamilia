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

  it('describes the spouse of an aunt-or-uncle from the nephew perspective', () => {
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
      .toBe('Tulius Souza é sobrinho de Absalon Jr., que foi casado com Roseli Sá.');
  });

  it('describes the nephew of a spouse from the spouse perspective', () => {
    const people = [
      makePerson('condilenia', 'Condilênia Maria Tsangaropulos Souza', { genero: 'mulher', falecido: true }),
      makePerson('marcio', 'Márcio Ailton Barros Souza', { genero: 'homem' }),
      makePerson('mario', 'Mário Assis Barros Souza', { genero: 'homem' }),
      makePerson('caio', 'Caio Souza', { genero: 'homem' }),
    ];

    const relationships = [
      makeRelationship('r1', 'condilenia', 'marcio', 'conjuge', { subtipo_relacionamento: 'casamento' }),
      makeRelationship('r2', 'marcio', 'mario', 'irmao'),
      makeRelationship('r3', 'caio', 'mario', 'pai'),
    ];

    expect(calculateSentence({ origin: 'condilenia', target: 'caio', people, relationships }))
      .toBe('Caio Souza é sobrinho de Márcio Ailton, que foi casado com Condilênia Souza.');
  });

  it('describes the spouse of a niece through the spouse of an uncle', () => {
    const people = [
      makePerson('condilenia', 'Condilênia Maria Tsangaropulos Souza', { genero: 'mulher', falecido: true }),
      makePerson('marcio', 'Márcio Ailton Barros Souza', { genero: 'homem' }),
      makePerson('marcos', 'Marcos Alfredo Barros Souza', { genero: 'homem' }),
      makePerson('tatiane', 'Tatiane Barros', { genero: 'mulher' }),
      makePerson('adalberto', 'Adalberto Bezerra Neto', { genero: 'homem' }),
    ];

    const relationships = [
      makeRelationship('r1', 'condilenia', 'marcio', 'conjuge', { subtipo_relacionamento: 'casamento' }),
      makeRelationship('r2', 'marcio', 'marcos', 'irmao'),
      makeRelationship('r3', 'tatiane', 'marcos', 'pai'),
      makeRelationship('r4', 'adalberto', 'tatiane', 'conjuge', { subtipo_relacionamento: 'casamento' }),
    ];

    expect(calculateSentence({ origin: 'condilenia', target: 'adalberto', people, relationships }))
      .toBe('Adalberto Bezerra Neto é cônjuge de Tatiane Barros, sobrinha de Márcio Ailton, que foi casado com Condilênia Souza.');
  });

  it('uses the feminine grandparent label when the origin is a woman', () => {
    const people = [
      makePerson('condilenia', 'Condilênia Maria Tsangaropulos Souza', { genero: 'mulher' }),
      makePerson('tassius', 'Tassius Marcius Tsangaropulos Souza', { genero: 'homem' }),
      makePerson('heitor', 'Heitor de Albuquerque Tsangaropulos', { genero: 'homem' }),
    ];

    const relationships = [
      makeRelationship('r1', 'tassius', 'condilenia', 'mae'),
      makeRelationship('r2', 'heitor', 'tassius', 'pai'),
    ];

    expect(calculateSentence({ origin: 'condilenia', target: 'heitor', people, relationships }))
      .toBe('Condilênia Souza é avó de Heitor Tsangaropulos.');
  });
});
