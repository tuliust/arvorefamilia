import type { Pessoa } from '../types';
import type { RelationshipDegreeResult } from './relationshipDegree';
import { getRelationshipResultSentence } from './relationshipDegreeDisplay';
import { isPersonDeceased } from './personFields';

type InferredGender = 'male' | 'female' | 'unknown';

const FEMALE_FIRST_NAMES = new Set([
  'condilênia',
  'condilenia',
  'tatiane',
  'tathiane',
  'thatiane',
  'teca',
  'rose',
  'sandra',
  'layana',
  'maria',
  'hilda',
  'enildes',
]);

const MALE_FIRST_NAMES = new Set([
  'absalon',
  'adalberto',
  'caio',
  'heitor',
  'márcio',
  'marcio',
  'mário',
  'mario',
  'marcos',
  'tassius',
  'titus',
  'tulius',
  'yuri',
]);

function getFirstName(value?: string | null) {
  return value?.trim().split(/\s+/)[0] || '';
}

function getFirstNameToken(value?: string | null) {
  return getFirstName(value).toLocaleLowerCase('pt-BR');
}

function getPessoaById(peopleById: Map<string, Pessoa>, personId?: string | null) {
  if (!personId) return undefined;
  return peopleById.get(personId);
}

function inferGender(person?: Pessoa): InferredGender {
  if (person?.genero === 'mulher') return 'female';
  if (person?.genero === 'homem') return 'male';

  const firstName = getFirstNameToken(person?.nome_completo);
  if (!firstName) return 'unknown';
  if (FEMALE_FIRST_NAMES.has(firstName)) return 'female';
  if (MALE_FIRST_NAMES.has(firstName)) return 'male';
  if (['a', 'ia', 'na', 'ne', 'la', 'da'].some((ending) => firstName.endsWith(ending))) return 'female';

  return 'male';
}

function getNarrativeName(person?: Pessoa) {
  const cleanName = person?.nome_completo?.trim() || 'Pessoa';
  if (/^márcio\s+ailton\b/i.test(cleanName)) return 'Márcio Ailton';
  if (/^condil[êe]nia\b/i.test(cleanName) && /souza$/i.test(cleanName)) return 'Condilênia Souza';

  const parts = cleanName.split(/\s+/);
  const suffix = parts[parts.length - 1]?.toLocaleLowerCase('pt-BR');
  if (parts.length <= 3 || ['neto', 'junior', 'júnior', 'filho'].includes(suffix)) return cleanName;

  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function getNephewLabel(person?: Pessoa) {
  return inferGender(person) === 'female' ? 'sobrinha' : 'sobrinho';
}

function getSpouseLabel(active?: boolean) {
  return active === false ? 'ex-cônjuge' : 'cônjuge';
}

function getMarriageVerb(subject?: Pessoa, partner?: Pessoa) {
  const isCurrentRelationship = !isPersonDeceased(subject) && !isPersonDeceased(partner);
  const agreement = inferGender(subject) === 'female' ? 'casada' : 'casado';
  return `${isCurrentRelationship ? 'é' : 'foi'} ${agreement}`;
}

function getPattern(result: RelationshipDegreeResult) {
  return result.path.map((step) => step.edge.normalizedType).join('>');
}

function getViaSharedChildSpouseSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const origin = getPessoaById(peopleById, result.originPersonId);
  const target = getPessoaById(peopleById, result.targetPersonId);
  const spouse = getPessoaById(peopleById, result.path[1]?.to);

  return `${getNarrativeName(target)} é ${getNephewLabel(target)} de ${getNarrativeName(spouse)}, que ${getMarriageVerb(spouse, origin)} com ${getNarrativeName(origin)}.`;
}

function getViaSharedChildSpouseOfNephewSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const origin = getPessoaById(peopleById, result.originPersonId);
  const target = getPessoaById(peopleById, result.targetPersonId);
  const spouse = getPessoaById(peopleById, result.path[1]?.to);
  const nephew = getPessoaById(peopleById, result.path[3]?.to);
  const lastStep = result.path[result.path.length - 1];

  return `${getNarrativeName(target)} é ${getSpouseLabel(lastStep?.edge.active)} de ${getNarrativeName(nephew)}, ${getNephewLabel(nephew)} de ${getNarrativeName(spouse)}, que ${getMarriageVerb(spouse, origin)} com ${getNarrativeName(origin)}.`;
}

export function getRelationshipResultSentenceWithOverrides(result: RelationshipDegreeResult, people: Pessoa[]) {
  const pattern = getPattern(result);

  if (result.found && pattern === 'parent>child>sibling>parent') {
    return getViaSharedChildSpouseSentence(result, people);
  }

  if (result.found && pattern === 'parent>child>sibling>parent>spouse') {
    return getViaSharedChildSpouseOfNephewSentence(result, people);
  }

  return getRelationshipResultSentence(result, people);
}
