import type { Pessoa, Relacionamento } from '../types';
import { isPersonDeceased } from './personFields';
import { isHumanFamilyMember, isPetFamilyMember } from './personEntity';

export const CURIOSITY_TOPIC_OPTIONS = [
  'Dados e Contato',
  'Biografia',
  'Curiosidades',
  'Fatos Hist\u00f3ricos do Dia de Nascimento',
  'O que diz a Astrologia',
  '\u00c1rvore Geneal\u00f3gica',
] as const;

export type CuriosityTopic = typeof CURIOSITY_TOPIC_OPTIONS[number];

export type CityCuriosity = {
  city: string;
  count: number;
  people: string[];
};

export function getBirthValue(pessoa?: Pessoa | null) {
  if (!pessoa?.data_nascimento) return null;
  const value = Number(pessoa.data_nascimento);
  if (Number.isFinite(value)) return value;

  const year = String(pessoa.data_nascimento).match(/\d{4}/)?.[0];
  return year ? Number(year) : null;
}

export function formatYear(value?: string | number | null) {
  if (!value) return undefined;
  const year = String(value).match(/\d{4}/)?.[0];
  return year || String(value);
}

export function countCityPeople(people: Pessoa[], getLocation: (pessoa: Pessoa) => string | undefined | null): CityCuriosity[] {
  const counts = new Map<string, string[]>();
  people.forEach((pessoa) => {
    const normalized = getLocation(pessoa)?.trim();
    if (!normalized) return;
    const names = counts.get(normalized) || [];
    counts.set(normalized, [...names, pessoa.nome_completo]);
  });

  return Array.from(counts.entries())
    .map(([city, people]) => ({ city, count: people.length, people: people.sort((a, b) => a.localeCompare(b)) }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export type ChildrenCount = {
  personId: string;
  count: number;
  childIds: string[];
};

export function countChildrenByPerson(relacionamentos: Relacionamento[]): ChildrenCount[] {
  const childrenByParent = new Map<string, Set<string>>();

  const addChild = (parentId: string, childId: string) => {
    if (!parentId || !childId || parentId === childId) return;
    if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, new Set());
    childrenByParent.get(parentId)!.add(childId);
  };

  relacionamentos.forEach((rel) => {
    if (rel.tipo_relacionamento === 'filho') {
      addChild(rel.pessoa_origem_id, rel.pessoa_destino_id);
      return;
    }

    if (rel.tipo_relacionamento === 'pai' || rel.tipo_relacionamento === 'mae') {
      addChild(rel.pessoa_destino_id, rel.pessoa_origem_id);
    }
  });

  return Array.from(childrenByParent.entries())
    .map(([personId, children]) => ({
      personId,
      count: children.size,
      childIds: Array.from(children),
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateCuriosities(pessoas: Pessoa[], relacionamentos: Relacionamento[]) {
  const humans = pessoas.filter(isHumanFamilyMember);
  const pessoasById = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const withBirth = humans
    .map((pessoa) => ({ pessoa, birth: getBirthValue(pessoa) }))
    .filter((item): item is { pessoa: Pessoa; birth: number } => typeof item.birth === 'number');
  const sortedByBirth = [...withBirth].sort((a, b) => a.birth - b.birth);

  const currentCities = countCityPeople(
    humans.filter((pessoa) => !isPersonDeceased(pessoa)),
    (pessoa) => pessoa.local_atual
  );
  const birthCities = countCityPeople(humans, (pessoa) => pessoa.local_nascimento);
  const mostChildren = countChildrenByPerson(relacionamentos)
    .map(({ personId, childIds }) => {
      const humanChildren = childIds.filter((childId) =>
        isHumanFamilyMember(pessoasById.get(childId))
      );
      const petChildren = childIds.filter((childId) =>
        isPetFamilyMember(pessoasById.get(childId))
      );

      return {
        name: pessoasById.get(personId)?.nome_completo || 'Sem nome',
        count: humanChildren.length,
        petCount: petChildren.length,
      };
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)[0];

  return {
    oldest: sortedByBirth[0]?.pessoa,
    youngest: sortedByBirth[sortedByBirth.length - 1]?.pessoa,
    mostChildren,
    topCurrentCities: currentCities.slice(0, 5),
    topBirthCities: birthCities.slice(0, 5),
    topBirthCity: birthCities[0],
  };
}
