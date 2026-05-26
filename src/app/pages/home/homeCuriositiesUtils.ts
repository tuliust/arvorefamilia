import type { Pessoa, Relacionamento } from '../../types';
import { isPersonDeceased } from '../../utils/personFields';

export const CURIOSITY_TOPIC_OPTIONS = [
  'Dados e Contato',
  'Biografia',
  'Curiosidades',
  'Fatos Históricos do Dia de Nascimento',
  'O que diz a Astrologia',
  'Árvore Genealógica',
] as const;

export type CuriosityTopic = typeof CURIOSITY_TOPIC_OPTIONS[number];

export type CityCuriosity = {
  city: string;
  count: number;
  people: string[];
};

function isPetFamilyMember(pessoa: Pessoa) {
  return pessoa.humano_ou_pet === 'Pet';
}

function isHumanFamilyMember(pessoa: Pessoa) {
  return !isPetFamilyMember(pessoa);
}

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

export function calculateCuriosities(pessoas: Pessoa[], relacionamentos: Relacionamento[]) {
  const humans = pessoas.filter(isHumanFamilyMember);
  const withBirth = humans
    .map((pessoa) => ({ pessoa, birth: getBirthValue(pessoa) }))
    .filter((item): item is { pessoa: Pessoa; birth: number } => typeof item.birth === 'number');
  const sortedByBirth = [...withBirth].sort((a, b) => a.birth - b.birth);

  const currentCities = countCityPeople(
    humans.filter((pessoa) => !isPersonDeceased(pessoa)),
    (pessoa) => pessoa.local_atual
  );
  const birthCities = countCityPeople(humans, (pessoa) => pessoa.local_nascimento);
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

  const mostChildren = Array.from(childrenByParent.entries())
    .map(([personId, children]) => ({
      name: pessoas.find((pessoa) => pessoa.id === personId)?.nome_completo || 'Sem nome',
      count: children.size,
    }))
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
