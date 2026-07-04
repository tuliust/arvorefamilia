import { describe, expect, it } from 'vitest';
import type { Pessoa, Relacionamento, TipoRelacionamento } from '../types';
import { calculateRelationshipDegree } from './relationshipDegree';
import { getRelationshipResultSentenceWithOverrides } from './relationshipSentenceOverrides';

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
}) {
  const result = calculateRelationshipDegree({
    originPersonId: params.origin,
    targetPersonId: params.target,
    people: params.people,
    relationships: params.relationships,
    includeInactiveSpouses: false,
  });

  return getRelationshipResultSentenceWithOverrides(result, params.people);
}

describe('getRelationshipResultSentenceWithOverrides', () => {
  it('describes nephews of a spouse even when the path goes through a shared child', () => {
    const people = [
      makePerson('condilenia', 'Condilênia Maria Tsangaropulos Souza', { genero: 'mulher', falecido: true }),
      makePerson('marcio', 'Márcio Ailton Barros Souza', { genero: 'homem' }),
      makePerson('tulius', 'Tulius Tsangaropulos Souza', { genero: 'homem' }),
      makePerson('mario', 'Mário Assis Barros Souza', { genero: 'homem' }),
      makePerson('caio', 'Caio Cavalcanti Souza', { genero: 'homem' }),
    ];

    const relationships = [
      makeRelationship('r1', 'tulius', 'condilenia', 'mae'),
      makeRelationship('r2', 'tulius', 'marcio', 'pai'),
      makeRelationship('r3', 'marcio', 'mario', 'irmao'),
      makeRelationship('r4', 'caio', 'mario', 'pai'),
    ];

    expect(calculateSentence({ origin: 'condilenia', target: 'caio', people, relationships }))
      .toBe('Caio Cavalcanti Souza é sobrinho de Márcio Ailton, que foi casado com Condilênia Souza.');
  });

  it('describes spouses of nieces through the same shared-child path', () => {
    const people = [
      makePerson('condilenia', 'Condilênia Maria Tsangaropulos Souza', { genero: 'mulher', falecido: true }),
      makePerson('marcio', 'Márcio Ailton Barros Souza', { genero: 'homem' }),
      makePerson('tulius', 'Tulius Tsangaropulos Souza', { genero: 'homem' }),
      makePerson('marcos', 'Marcos Alfredo Barros Souza', { genero: 'homem' }),
      makePerson('tatiane', 'Tatiane Barros', { genero: 'mulher' }),
      makePerson('adalberto', 'Adalberto Bezerra Neto', { genero: 'homem' }),
    ];

    const relationships = [
      makeRelationship('r1', 'tulius', 'condilenia', 'mae'),
      makeRelationship('r2', 'tulius', 'marcio', 'pai'),
      makeRelationship('r3', 'marcio', 'marcos', 'irmao'),
      makeRelationship('r4', 'tatiane', 'marcos', 'pai'),
      makeRelationship('r5', 'adalberto', 'tatiane', 'conjuge'),
    ];

    expect(calculateSentence({ origin: 'condilenia', target: 'adalberto', people, relationships }))
      .toBe('Adalberto Bezerra Neto é cônjuge de Tatiane Barros, sobrinha de Márcio Ailton, que foi casado com Condilênia Souza.');
  });
});
