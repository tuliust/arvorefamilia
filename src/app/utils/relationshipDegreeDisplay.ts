import type { Pessoa } from '../types';
import { isPetFamilyMember } from './personEntity';
import { isPersonDeceased } from './personFields';
import type {
  RelationshipConfidence,
  RelationshipDegreeResult,
  RelationshipGraphEdge,
} from './relationshipDegree';

const WARNING_MATCHERS: Array<[RegExp, string]> = [
  [/conjugal inativo .*ignorado|conjugais inativos foram ignorados/i, 'Vínculos conjugais inativos foram ignorados no cálculo.'],
  [/Caminho usa relacionamento conjugal inativo/i, 'O caminho usa vínculo conjugal inativo.'],
  [/pessoa inexistente/i, 'Alguns relacionamentos apontam para pessoas fora do conjunto visível.'],
  [/autoaresta/i, 'Relacionamentos inconsistentes foram ignorados.'],
  [/duplicado/i, 'Relacionamentos duplicados foram consolidados.'],
  [/Origem nao encontrada|Destino nao encontrado/i, 'Dados insuficientes para uma das pessoas selecionadas.'],
  [/Nenhum caminho encontrado|profundidade maxima/i, 'Pode haver dados incompletos de relacionamento.'],
  [/classificacao especifica/i, 'O caminho foi encontrado, mas a classificação específica ainda pode ser refinada.'],
  [/Irmandade derivada/i, 'Irmandade derivada por parental compartilhado.'],
];

const GLOBAL_WARNING_WHEN_FOUND_MATCHERS = [
  /conjugal inativo .*ignorado|conjugais inativos foram ignorados/i,
  /pessoa inexistente/i,
  /autoaresta/i,
  /duplicado/i,
];

type InferredGender = 'male' | 'female' | 'unknown';

const KNOWN_FEMALE_NAMES = new Set([
  'alexia',
  'allexya',
  'bianca',
  'camilla',
  'cecilia',
  'cecília',
  'condilênia',
  'condilenia',
  'enildes',
  'glauce',
  'hilda',
  'ivania',
  'ivânia',
  'ivanira',
  'kondilenia',
  'layana',
  'lourdes',
  'márcia',
  'marcia',
  'maria',
  'monika',
  'monica',
  'nanalva',
  'núbia',
  'nubia',
  'priscilla',
  'rafaela',
  'renata',
  'rose',
  'roseli',
  'rosely',
  'sandra',
  'sofia',
  'tatiane',
  'tathiane',
  'thatiane',
  'teca',
]);

const KNOWN_MALE_NAMES = new Set([
  'absalon',
  'adalberto',
  'athanase',
  'beto',
  'caio',
  'charalambos',
  'constantino',
  'demétrius',
  'demetrius',
  'eike',
  'fabio',
  'fábio',
  'heitor',
  'ildo',
  'inácio',
  'inacio',
  'leonardo',
  'lorenzo',
  'marcos',
  'márcio',
  'marcio',
  'mário',
  'mario',
  'mauro',
  'peu',
  'tassius',
  'titus',
  'tomás',
  'tomas',
  'tulius',
  'yuri',
]);

function getPersonName(peopleById: Map<string, Pessoa>, personId: string) {
  return peopleById.get(personId)?.nome_completo?.trim() || 'Pessoa';
}

export function formatShortName(fullName?: string | null) {
  if (!fullName) return '';

  const cleanName = fullName.trim();
  const parts = cleanName.split(/\s+/);

  if (parts.length <= 2) {
    return cleanName;
  }

  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function getFirstName(fullName?: string | null) {
  const cleanName = fullName?.trim();
  if (!cleanName) return 'Pessoa';
  return cleanName.split(/\s+/)[0] || 'Pessoa';
}

function getFirstNameToken(name?: string | null) {
  return (name?.trim().split(/\s+/)[0] || '').toLocaleLowerCase('pt-BR');
}

function getStepLabel(edge: RelationshipGraphEdge) {
  if (edge.normalizedType === 'parent') {
    if (edge.type === 'pai') return 'pai';
    if (edge.type === 'mae') return 'mae';
    return 'pai/mãe';
  }

  if (edge.normalizedType === 'child') return 'filho(a)';
  if (edge.normalizedType === 'sibling') return 'irmão(ã)';
  return edge.active ? 'cônjuge' : 'ex-cônjuge';
}

function inferGender(person?: Pessoa, fallbackName?: string | null): InferredGender {
  if (person?.genero === 'mulher') return 'female';
  if (person?.genero === 'homem') return 'male';
  if (person?.genero === 'pet') return 'unknown';

  const firstName = getFirstNameToken(person?.nome_completo || fallbackName);
  if (!firstName) return 'unknown';
  if (KNOWN_FEMALE_NAMES.has(firstName)) return 'female';
  if (KNOWN_MALE_NAMES.has(firstName)) return 'male';

  const likelyFemaleEndings = ['a', 'ia', 'na', 'ne', 'la', 'da', 'eli'];
  if (likelyFemaleEndings.some((ending) => firstName.endsWith(ending))) return 'female';

  return 'male';
}

function getNarrativeName(person?: Pessoa, fallbackName?: string | null) {
  const cleanName = (person?.nome_completo || fallbackName || '').trim();
  if (!cleanName) return 'Pessoa';

  if (/^márcio\s+ailton\b/i.test(cleanName)) return 'Márcio Ailton';
  if (/^condil[êe]nia\b/i.test(cleanName) && /souza$/i.test(cleanName)) return 'Condilênia Souza';

  const parts = cleanName.split(/\s+/);
  const suffix = parts[parts.length - 1]?.toLocaleLowerCase('pt-BR');
  if (parts.length <= 3) return cleanName;
  if (['neto', 'junior', 'júnior', 'filho'].includes(suffix)) return cleanName;

  return formatShortName(cleanName) || cleanName;
}

function getFullOrFallbackName(person?: Pessoa, fallbackName?: string | null) {
  return person?.nome_completo?.trim() || fallbackName?.trim() || 'Pessoa';
}

function getSiblingLabel(person?: Pessoa, fallbackName?: string | null) {
  return inferGender(person, fallbackName) === 'female' ? 'irmã' : 'irmão';
}

function getNephewOrNieceLabel(person?: Pessoa, fallbackName?: string | null) {
  return inferGender(person, fallbackName) === 'female' ? 'sobrinha' : 'sobrinho';
}

function getGrandparentLabel(person?: Pessoa, fallbackName?: string | null) {
  const gender = inferGender(person, fallbackName);
  if (gender === 'female') return 'avó';
  if (gender === 'male') return 'avô';
  return 'avô/avó';
}

function getGrandchildLabel(person?: Pessoa, fallbackName?: string | null) {
  const gender = inferGender(person, fallbackName);
  if (gender === 'female') return 'neta';
  if (gender === 'male') return 'neto';
  return 'neto(a)';
}

function getAuntOrUncleLabel(person?: Pessoa, fallbackName?: string | null) {
  return inferGender(person, fallbackName) === 'female' ? 'tia' : 'tio';
}

function getMarriedAgreement(person?: Pessoa, fallbackName?: string | null) {
  return inferGender(person, fallbackName) === 'female' ? 'casada' : 'casado';
}

function getMarriageVerb(subject?: Pessoa, partner?: Pessoa, edge?: RelationshipGraphEdge) {
  const isCurrentRelationship = edge?.active !== false && !isPersonDeceased(subject) && !isPersonDeceased(partner);
  return `${isCurrentRelationship ? 'é' : 'foi'} ${getMarriedAgreement(subject)}`;
}

function getSpouseLabel(edge?: RelationshipGraphEdge) {
  return edge?.active === false ? 'ex-cônjuge' : 'cônjuge';
}

function getDirectParentPresentationLabel(result: RelationshipDegreeResult) {
  const edge = result.path[0]?.edge;
  if (!edge) return 'pai/mãe';
  if (edge.type === 'pai') return 'pai';
  if (edge.type === 'mae') return 'mãe';
  return 'pai/mãe';
}

function withFinalPeriod(sentence: string) {
  const trimmed = sentence.trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function getRelationshipConfidenceLabel(confidence: RelationshipConfidence) {
  const labels: Record<RelationshipConfidence, string> = {
    high: 'alta',
    medium: 'média',
    low: 'baixa',
    unknown: 'desconhecida',
    none: 'nenhuma',
  };

  return labels[confidence];
}

export function formatRelationshipPersonPath(result: RelationshipDegreeResult, people: Pessoa[]) {
  if (!result.found && result.path.length === 0) return '';

  const peopleById = new Map(people.map((person) => [person.id, person]));
  const pathIds = [result.originPersonId, ...result.path.map((step) => step.to)];

  return pathIds.map((personId) => getPersonName(peopleById, personId)).join(' → ');
}

export function formatRelationshipStepPath(result: RelationshipDegreeResult) {
  return result.path.map((step) => getStepLabel(step.edge)).join(' → ');
}

export function getFriendlyRelationshipWarnings(result: RelationshipDegreeResult) {
  const warnings = new Set<string>();

  result.warnings.forEach((warning) => {
    if (result.found && GLOBAL_WARNING_WHEN_FOUND_MATCHERS.some((pattern) => pattern.test(warning))) {
      return;
    }

    const match = WARNING_MATCHERS.find(([pattern]) => pattern.test(warning));
    if (match) {
      warnings.add(match[1]);
    }
  });

  return Array.from(warnings);
}

function humanizeRelationshipDescription(description: string) {
  return description
    .replace(/ e mae de /g, ' é mãe de ')
    .replace(/ e pai de /g, ' é pai de ')
    .replace(/ e pai\/mãe de /g, ' é pai/mãe de ')
    .replace(/ e filho\(a\) de /g, ' é filho(a) de ')
    .replace(/ e irmão\(ã\) de /g, ' é irmão(ã) de ')
    .replace(/ e cônjuge de /g, ' é cônjuge de ')
    .replace(/ e ex-cônjuge de /g, ' é ex-cônjuge de ')
    .replace(/ e avô\/avó de /g, ' é avô/avó de ')
    .replace(/ e neto\(a\) de /g, ' é neto(a) de ')
    .replace(/ e tio\(a\) de /g, ' é tio(a) de ')
    .replace(/ e sobrinho\(a\) de /g, ' é sobrinho(a) de ')
    .replace(/ e primo\(a\) de /g, ' é primo(a) de ')
    .replace(/\bHa\b/g, 'Há')
    .replace(/\bNao\b/g, 'Não')
    .replace(/\bvinculo\b/g, 'vínculo')
    .replace(/\bVinculo\b/g, 'Vínculo')
    .replace(/\bclassificacao\b/g, 'classificação')
    .replace(/\bespecifica\b/g, 'específica')
    .replace(/\bversao\b/g, 'versão');
}

export function getRelationshipResultMessage(result: RelationshipDegreeResult) {
  if (result.found) return humanizeRelationshipDescription(result.description);

  if (result.confidence === 'unknown') {
    return 'Dados insuficientes para calcular o vínculo com segurança.';
  }

  return 'Nenhum vínculo familiar foi encontrado com os dados disponíveis.';
}

export function getRelationshipMetricLabels(result: RelationshipDegreeResult) {
  const labels = [`Conexões: ${result.distance}`];

  if (typeof result.degree === 'number') {
    labels.push(`Grau: ${result.degree}`);
  }

  labels.push(`Confiança: ${getRelationshipConfidenceLabel(result.confidence)}`);

  return labels;
}

function getRelationshipPeople(result: RelationshipDegreeResult, people: Pessoa[]) {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const originPerson = peopleById.get(result.originPersonId);
  const targetPerson = peopleById.get(result.targetPersonId);
  const originFullName = getFullOrFallbackName(originPerson, getPersonName(peopleById, result.originPersonId));
  const targetFullName = getFullOrFallbackName(targetPerson, getPersonName(peopleById, result.targetPersonId));

  return {
    peopleById,
    originPerson,
    targetPerson,
    originName: getNarrativeName(originPerson, originFullName),
    targetName: getNarrativeName(targetPerson, targetFullName),
    originFirstName: getFirstName(originFullName),
    targetFirstName: getFirstName(targetFullName),
  };
}

function getRelationshipPattern(result: RelationshipDegreeResult) {
  return result.path.map((step) => step.edge.normalizedType).join('>');
}

function getSiblingSpouseSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const { peopleById, originName, targetName } = getRelationshipPeople(result, people);
  const siblingPerson = peopleById.get(result.path[0]?.to);
  const siblingName = getNarrativeName(siblingPerson, getPersonName(peopleById, result.path[0]?.to));
  const siblingLabel = getSiblingLabel(siblingPerson);
  const spouseLabel = getSpouseLabel(result.path[1]?.edge);

  return `${originName} é ${siblingLabel} de ${siblingName}, ${spouseLabel} de ${targetName}.`;
}

function getSpouseOfAuntOrUncleSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const { peopleById, originPerson, targetPerson, originName, targetName } = getRelationshipPeople(result, people);
  const auntOrUnclePerson = peopleById.get(result.path[1]?.to);
  const auntOrUncleName = getNarrativeName(auntOrUnclePerson, getPersonName(peopleById, result.path[1]?.to));
  const nephewLabel = getNephewOrNieceLabel(originPerson);
  const marriageVerb = getMarriageVerb(auntOrUnclePerson, targetPerson, result.path[2]?.edge);

  return `${originName} é ${nephewLabel} de ${auntOrUncleName}, que ${marriageVerb} com ${targetName}.`;
}

function getSpouseToNephewOrNieceSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const { peopleById, originPerson, targetPerson, originName, targetName } = getRelationshipPeople(result, people);
  const spousePerson = peopleById.get(result.path[0]?.to);
  const spouseName = getNarrativeName(spousePerson, getPersonName(peopleById, result.path[0]?.to));
  const nephewLabel = getNephewOrNieceLabel(targetPerson);
  const marriageVerb = getMarriageVerb(spousePerson, originPerson, result.path[0]?.edge);

  return `${targetName} é ${nephewLabel} de ${spouseName}, que ${marriageVerb} com ${originName}.`;
}

function getSpouseToNephewOrNieceSpouseSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const { peopleById, originPerson, targetName, originName } = getRelationshipPeople(result, people);
  const auntOrUnclePerson = peopleById.get(result.path[0]?.to);
  const nieceOrNephewPerson = peopleById.get(result.path[2]?.to);
  const auntOrUncleName = getNarrativeName(auntOrUnclePerson, getPersonName(peopleById, result.path[0]?.to));
  const nieceOrNephewName = getNarrativeName(nieceOrNephewPerson, getPersonName(peopleById, result.path[2]?.to));
  const nieceOrNephewLabel = getNephewOrNieceLabel(nieceOrNephewPerson);
  const spouseLabel = getSpouseLabel(result.path[3]?.edge);
  const marriageVerb = getMarriageVerb(auntOrUnclePerson, originPerson, result.path[0]?.edge);

  return `${targetName} é ${spouseLabel} de ${nieceOrNephewName}, ${nieceOrNephewLabel} de ${auntOrUncleName}, que ${marriageVerb} com ${originName}.`;
}

function getNephewOrNieceSpouseToSpouseOfAuntOrUncleSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const { peopleById, originName, targetPerson, targetName } = getRelationshipPeople(result, people);
  const nieceOrNephewPerson = peopleById.get(result.path[0]?.to);
  const auntOrUnclePerson = peopleById.get(result.path[2]?.to);
  const nieceOrNephewName = getNarrativeName(nieceOrNephewPerson, getPersonName(peopleById, result.path[0]?.to));
  const auntOrUncleName = getNarrativeName(auntOrUnclePerson, getPersonName(peopleById, result.path[2]?.to));
  const nieceOrNephewLabel = getNephewOrNieceLabel(nieceOrNephewPerson);
  const spouseLabel = getSpouseLabel(result.path[0]?.edge);
  const marriageVerb = getMarriageVerb(auntOrUnclePerson, targetPerson, result.path[3]?.edge);

  return `${originName} é ${spouseLabel} de ${nieceOrNephewName}, ${nieceOrNephewLabel} de ${auntOrUncleName}, que ${marriageVerb} com ${targetName}.`;
}

function getSpouseParentOfAuntOrUncleSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const { peopleById, originFirstName, targetName } = getRelationshipPeople(result, people);
  const spousePerson = peopleById.get(result.path[2]?.to);
  const auntOrUnclePerson = peopleById.get(result.path[1]?.to);
  const spouseName = getNarrativeName(spousePerson, getPersonName(peopleById, result.path[2]?.to));
  const auntOrUncleName = getNarrativeName(auntOrUnclePerson, getPersonName(peopleById, result.path[1]?.to));
  const parentLabel = inferGender(peopleById.get(result.targetPersonId)) === 'female' ? 'mãe' : 'pai';
  const auntOrUncleLabel = getAuntOrUncleLabel(auntOrUnclePerson);
  const article = auntOrUncleLabel === 'tia' ? 'a' : 'o';
  const marriageVerb = getMarriageVerb(spousePerson, auntOrUnclePerson, result.path[2]?.edge);

  return `${targetName} é ${parentLabel} de ${spouseName}, que ${marriageVerb} com ${article} ${auntOrUncleLabel} de ${originFirstName}, ${auntOrUncleName}.`;
}

function getCousinSpouseSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const { peopleById, originName, targetName } = getRelationshipPeople(result, people);
  const spouseStep = result.path.find((step) => step.edge.normalizedType === 'spouse');
  const cousinPersonId = spouseStep?.from === result.targetPersonId ? spouseStep.to : spouseStep?.from;
  const cousinPerson = cousinPersonId ? peopleById.get(cousinPersonId) : undefined;
  const cousinName = getNarrativeName(cousinPerson, cousinPersonId ? getPersonName(peopleById, cousinPersonId) : 'Pessoa');
  const cousinLabel = inferGender(cousinPerson) === 'female' ? 'prima' : 'primo';
  const article = cousinLabel === 'prima' ? 'da' : 'do';
  const spouseLabel = getSpouseLabel(spouseStep?.edge);

  return `${targetName} é ${spouseLabel} ${article} ${cousinLabel} de ${originName}, ${cousinName}.`;
}

function getParentPersonNameFromSecondDegreeCousinPath(result: RelationshipDegreeResult, people: Pessoa[]) {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const targetParentId = result.path[2]?.to || result.path[3]?.from;
  return targetParentId ? getPersonName(peopleById, targetParentId) : '';
}

function getSecondDegreeCousinParentLabels(result: RelationshipDegreeResult, people: Pessoa[]) {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const targetParentId = result.path[2]?.to || result.path[3]?.from;
  const targetParent = targetParentId ? peopleById.get(targetParentId) : undefined;
  const targetParentLabel = inferGender(targetParent, getParentPersonNameFromSecondDegreeCousinPath(result, people)) === 'female' ? 'mãe' : 'pai';

  if (targetParentLabel === 'mãe') {
    return { article: 'A', parentLabel: 'mãe', cousinLabel: 'prima' };
  }

  return { article: 'O', parentLabel: 'pai', cousinLabel: 'primo' };
}

function buildSecondDegreeCousinNarrative(result: RelationshipDegreeResult, people: Pessoa[]) {
  if (!result.found || result.path.length !== 4) return null;
  if (getRelationshipPattern(result) !== 'child>sibling>parent>parent') return null;

  const { originFirstName, targetFirstName } = getRelationshipPeople(result, people);
  const targetParentName = getFirstName(getParentPersonNameFromSecondDegreeCousinPath(result, people));
  const { article, parentLabel, cousinLabel } = getSecondDegreeCousinParentLabels(result, people);

  return {
    title: `${originFirstName} e ${targetFirstName} são primos de segundo grau`,
    summary: `${article} ${parentLabel} de ${targetFirstName}, ${targetParentName}, é ${cousinLabel} de ${originFirstName}.`,
  };
}

function buildCousinNarrative(result: RelationshipDegreeResult, people: Pessoa[]) {
  if (!result.found || result.path.length !== 3 || result.label !== 'primo(a)') return null;
  if (getRelationshipPattern(result) !== 'child>sibling>parent') return null;

  const { peopleById } = getRelationshipPeople(result, people);
  const originPerson = peopleById.get(result.originPersonId);
  const targetPerson = peopleById.get(result.targetPersonId);
  const originShortName = getNarrativeName(originPerson, getPersonName(peopleById, result.originPersonId));
  const targetShortName = getNarrativeName(targetPerson, getPersonName(peopleById, result.targetPersonId));
  const originParent = peopleById.get(result.path[0].to);
  const targetParent = peopleById.get(result.path[1].to);
  const originParentShortName = getNarrativeName(originParent, getPersonName(peopleById, result.path[0].to));
  const targetParentShortName = getNarrativeName(targetParent, getPersonName(peopleById, result.path[1].to));
  const originParentLabel = inferGender(originParent) === 'female' ? 'mãe' : 'pai';
  const targetParentLabel = inferGender(targetParent) === 'female' ? 'mãe' : 'pai';
  const siblingLabel = getSiblingLabel(targetParent);
  const targetParentArticle = targetParentLabel === 'mãe' ? 'A' : 'O';

  return {
    title: `${originShortName} e ${targetShortName} são primos`,
    summary: `${targetParentArticle} ${targetParentLabel} de ${targetShortName}, ${targetParentShortName}, é ${siblingLabel} de ${originParentShortName}, ${originParentLabel} de ${originShortName}.`,
  };
}

export function getRelationshipResultSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const { peopleById, originPerson, targetPerson, originName, targetName, originFirstName, targetFirstName } = getRelationshipPeople(result, people);

  if (!result.found) {
    return `Não foi encontrado vínculo familiar entre ${originName} e ${targetName}.`;
  }

  if (result.samePerson) {
    return `${originName} e ${targetName} são a mesma pessoa.`;
  }

  const pattern = getRelationshipPattern(result);

  if (pattern === 'child>sibling>spouse') {
    return getSpouseOfAuntOrUncleSentence(result, people);
  }

  if (pattern === 'spouse>sibling>parent') {
    return getSpouseToNephewOrNieceSentence(result, people);
  }

  if (pattern === 'spouse>sibling>parent>spouse') {
    return getSpouseToNephewOrNieceSpouseSentence(result, people);
  }

  if (pattern === 'spouse>child>sibling>spouse') {
    return getNephewOrNieceSpouseToSpouseOfAuntOrUncleSentence(result, people);
  }

  if (pattern === 'child>sibling>spouse>child') {
    return getSpouseParentOfAuntOrUncleSentence(result, people);
  }

  if (pattern === 'sibling>spouse') {
    return getSiblingSpouseSentence(result, people);
  }

  if (pattern === 'child>sibling>parent>parent') {
    const narrative = buildSecondDegreeCousinNarrative(result, people);
    if (narrative?.summary) {
      return `${withFinalPeriod(narrative.title)} ${withFinalPeriod(narrative.summary)}`;
    }

    return `${originFirstName} e ${targetFirstName} são primos de segundo grau.`;
  }

  if (pattern === 'child>sibling>parent' && result.label === 'primo(a)') {
    return `${originName} e ${targetName} são primos.`;
  }

  if (pattern === 'sibling') {
    return `${originName} e ${targetName} são irmãos.`;
  }

  if (pattern === 'spouse') {
    const label = result.path[0]?.edge.active ? 'cônjuges' : 'ex-cônjuges';
    return `${originName} e ${targetName} são ${label}.`;
  }

  if (pattern === 'parent') {
    if (isPetFamilyMember(targetPerson)) {
      return `${originName} é tutor de ${targetName}.`;
    }

    return `${originName} é ${getDirectParentPresentationLabel(result)} de ${targetName}.`;
  }

  if (pattern === 'child') {
    return `${originName} é filho de ${targetName}.`;
  }

  if (pattern === 'parent>parent') {
    return `${originName} é ${getGrandparentLabel(originPerson)} de ${targetName}.`;
  }

  if (pattern === 'child>child') {
    return `${originName} é ${getGrandchildLabel(originPerson)} de ${targetName}.`;
  }

  if (pattern === 'sibling>parent') {
    return `${originName} é ${getAuntOrUncleLabel(originPerson)} de ${targetName}.`;
  }

  if (pattern === 'child>sibling') {
    return `${originName} é ${getNephewOrNieceLabel(originPerson)} de ${targetName}.`;
  }

  if (pattern === 'spouse>child>sibling>parent' || pattern === 'child>sibling>parent>spouse') {
    return getCousinSpouseSentence(result, people);
  }

  return `Há uma ligação familiar entre ${originName} e ${targetName}.`;
}

export function getRelationshipNarrative(result: RelationshipDegreeResult, people: Pessoa[]) {
  const cousinNarrative = buildCousinNarrative(result, people);
  if (cousinNarrative) return cousinNarrative;

  const secondDegreeCousinNarrative = buildSecondDegreeCousinNarrative(result, people);
  if (secondDegreeCousinNarrative) return secondDegreeCousinNarrative;

  if (result.found) {
    const resultSentence = getRelationshipResultSentence(result, people);
    return {
      title: resultSentence,
      summary: '',
    };
  }

  return {
    title: 'Sem vínculo encontrado',
    summary: getRelationshipResultMessage(result),
  };
}
