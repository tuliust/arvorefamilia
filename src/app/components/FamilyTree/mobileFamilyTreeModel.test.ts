import { describe, expect, it } from 'vitest';

import type { Pessoa, Relacionamento } from '../../types';
import { buildMobileFamilyTreeModel } from './mobileFamilyTreeModel';

function person(id: string, humano_ou_pet: Pessoa['humano_ou_pet'] = 'Humano'): Pessoa {
  return {
    id,
    nome_completo: id,
    humano_ou_pet,
  };
}

function relationship(
  id: string,
  origin: string,
  destination: string,
  type: Relacionamento['tipo_relacionamento'],
): Relacionamento {
  return {
    id,
    pessoa_origem_id: origin,
    pessoa_destino_id: destination,
    tipo_relacionamento: type,
    ativo: true,
  };
}

describe('buildMobileFamilyTreeModel', () => {
  it('separa o núcleo direto e descendências dos irmãos', () => {
    const pessoas = [
      person('central'),
      person('father'),
      person('mother'),
      person('sibling'),
      person('nephew'),
      person('spouse'),
      person('child'),
      person('pet', 'Pet'),
    ];
    const relationships = [
      relationship('1', 'central', 'father', 'pai'),
      relationship('2', 'central', 'mother', 'mae'),
      relationship('3', 'central', 'sibling', 'irmao'),
      relationship('4', 'sibling', 'nephew', 'filho'),
      relationship('5', 'central', 'spouse', 'conjuge'),
      relationship('6', 'central', 'child', 'filho'),
      relationship('7', 'central', 'pet', 'filho'),
    ];

    const model = buildMobileFamilyTreeModel(pessoas, relationships, 'central');

    expect(model.father?.id).toBe('father');
    expect(model.mother?.id).toBe('mother');
    expect(model.siblings.map(({ id }) => id)).toEqual(['sibling']);
    expect(model.nephews.map(({ id }) => id)).toEqual(['nephew']);
    expect(model.spouses.map(({ id }) => id)).toEqual(['spouse']);
    expect(model.children.map(({ id }) => id)).toEqual(['child']);
    expect(model.pets.map(({ id }) => id)).toEqual(['pet']);
  });

  it('monta ancestrais e colaterais em ramos paterno e materno', () => {
    const ids = [
      'central',
      'father',
      'mother',
      'paternal-grandfather',
      'paternal-great-grandfather',
      'paternal-great-great-grandfather',
      'paternal-uncle',
      'paternal-cousin',
      'maternal-grandmother',
      'maternal-great-grandmother',
      'maternal-aunt',
      'maternal-cousin',
    ];
    const pessoas = ids.map((id) => person(id));
    const relationships = [
      relationship('1', 'central', 'father', 'pai'),
      relationship('2', 'central', 'mother', 'mae'),
      relationship('3', 'father', 'paternal-grandfather', 'pai'),
      relationship('4', 'paternal-grandfather', 'paternal-great-grandfather', 'pai'),
      relationship('5', 'paternal-great-grandfather', 'paternal-great-great-grandfather', 'pai'),
      relationship('6', 'father', 'paternal-uncle', 'irmao'),
      relationship('7', 'paternal-uncle', 'paternal-cousin', 'filho'),
      relationship('8', 'mother', 'maternal-grandmother', 'mae'),
      relationship('9', 'maternal-grandmother', 'maternal-great-grandmother', 'mae'),
      relationship('10', 'mother', 'maternal-aunt', 'irmao'),
      relationship('11', 'maternal-aunt', 'maternal-cousin', 'filho'),
    ];

    const model = buildMobileFamilyTreeModel(pessoas, relationships, 'central');

    expect(model.paternal.grandparents.map(({ id }) => id)).toContain('paternal-grandfather');
    expect(model.paternal.greatGrandparents.map(({ id }) => id)).toContain('paternal-great-grandfather');
    expect(model.paternal.greatGreatGrandparents.map(({ id }) => id)).toContain('paternal-great-great-grandfather');
    expect(model.paternal.uncles.map(({ id }) => id)).toContain('paternal-uncle');
    expect(model.paternal.cousins.map(({ id }) => id)).toContain('paternal-cousin');
    expect(model.maternal.grandparents.map(({ id }) => id)).toContain('maternal-grandmother');
    expect(model.maternal.greatGrandparents.map(({ id }) => id)).toContain('maternal-great-grandmother');
    expect(model.maternal.uncles.map(({ id }) => id)).toContain('maternal-aunt');
    expect(model.maternal.cousins.map(({ id }) => id)).toContain('maternal-cousin');
  });
});
