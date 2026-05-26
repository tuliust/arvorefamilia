import type { Pessoa } from '../types';

export function isPetFamilyMember(
  pessoa?: Pick<Pessoa, 'humano_ou_pet'> | null
) {
  return pessoa?.humano_ou_pet === 'Pet';
}

export function isHumanFamilyMember(
  pessoa?: Pick<Pessoa, 'humano_ou_pet'> | null
) {
  return !isPetFamilyMember(pessoa);
}
