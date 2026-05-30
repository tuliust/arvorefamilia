import type { Pessoa } from '../types';
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

function getShortPersonName(name: string) {
  const cleanName = name.trim();
  if (!cleanName) return 'Pessoa';

  return formatShortName(cleanName) || 'Pessoa';
}

function getRelationshipPeople(result: RelationshipDegreeResult, people: Pessoa[]) {
  const peopleById = new Map(people.map((person) => [person.id, person]));

  return {
    originName: formatShortName(getPersonName(peopleById, result.originPersonId)) || 'Pessoa',
    targetName: formatShortName(getPersonName(peopleById, result.targetPersonId)) || 'Pessoa',
    originFirstName: getFirstName(getPersonName(peopleById, result.originPersonId)),
    targetFirstName: getFirstName(getPersonName(peopleById, result.targetPersonId)),
  };
}

function getRelationshipPattern(result: RelationshipDegreeResult) {
  return result.path.map((step) => step.edge.normalizedType).join('>');
}

function getDirectParentPresentationLabel(result: RelationshipDegreeResult) {
  const edge = result.path[0]?.edge;
  if (!edge) return 'pai/mãe';
  if (edge.type === 'pai') return 'pai';
  if (edge.type === 'mae') return 'mãe';
  return 'pai/mãe';
}

function getParentPersonNameFromSecondDegreeCousinPath(result: RelationshipDegreeResult, people: Pessoa[]) {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const targetParentId = result.path[2]?.to || result.path[3]?.from;
  return targetParentId ? getPersonName(peopleById, targetParentId) : '';
}

export function getRelationshipResultSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const { originName, targetName, originFirstName, targetFirstName } = getRelationshipPeople(result, people);

  if (!result.found) {
    return `Não foi encontrado vínculo familiar entre ${originName} e ${targetName}.`;
  }

  if (result.samePerson) {
    return `${originName} e ${targetName} são a mesma pessoa.`;
  }

  const pattern = getRelationshipPattern(result);

  if (pattern === 'child>sibling>parent>parent') {
    const targetParentName = getFirstName(getParentPersonNameFromSecondDegreeCousinPath(result, people));
    return `${originFirstName} e ${targetFirstName} são primos de segundo grau. A mãe de ${targetFirstName}, ${targetParentName}, é prima de ${originFirstName}.`;
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
    return `${originName} é ${getDirectParentPresentationLabel(result)} de ${targetName}.`;
  }

  if (pattern === 'child') {
    return `${originName} é filho de ${targetName}.`;
  }

  if (pattern === 'parent>parent') {
    return `${originName} é avô/avó de ${targetName}.`;
  }

  if (pattern === 'child>child') {
    return `${originName} é neto de ${targetName}.`;
  }

  if (pattern === 'sibling>parent') {
    return `${originName} é tio/tia de ${targetName}.`;
  }

  if (pattern === 'child>sibling') {
    return `${originName} é sobrinho de ${targetName}.`;
  }

  if (pattern === 'spouse>child>sibling>parent') {
    return `${originName} é cônjuge da prima de ${targetName}.`;
  }

  if (pattern === 'child>sibling>parent>spouse') {
    return `${targetName} é cônjuge da prima de ${originName}.`;
  }

  return `Há uma ligação familiar entre ${originName} e ${targetName}.`;
}

function getPossessiveParentLabel(stepLabel: string) {
  if (stepLabel === 'mae' || stepLabel === 'mãe') return 'mãe';
  if (stepLabel === 'pai') return 'pai';
  return 'pai/mãe';
}

function getSiblingLabelByPersonName(name: string) {
  const firstName = getShortPersonName(name).toLowerCase();

  const likelyFemaleEndings = ['a', 'ia', 'na', 'ne', 'la', 'da'];
  const isLikelyFemale = likelyFemaleEndings.some((ending) => firstName.endsWith(ending));

  return isLikelyFemale ? 'irmã' : 'irmão';
}

function getParentLabelFromIncomingStep(result: RelationshipDegreeResult, stepIndex: number) {
  const step = result.path[stepIndex];
  if (!step) return 'pai/mãe';

  const rawLabel = getStepLabel(step.edge);
  return getPossessiveParentLabel(rawLabel);
}

function buildCousinNarrative(result: RelationshipDegreeResult, people: Pessoa[]) {
  if (!result.found || result.path.length !== 3 || result.label !== 'primo(a)') return null;

  const relationPattern = result.path.map((step) => step.edge.normalizedType).join('>');
  if (relationPattern !== 'child>sibling>parent') return null;

  const peopleById = new Map(people.map((person) => [person.id, person]));
  const originFullName = getPersonName(peopleById, result.originPersonId);
  const targetFullName = getPersonName(peopleById, result.targetPersonId);

  const originShortName = getShortPersonName(originFullName);
  const targetShortName = getShortPersonName(targetFullName);

  const originParentId = result.path[0].to;
  const targetParentId = result.path[1].to;

  const originParentName = getPersonName(peopleById, originParentId);
  const targetParentName = getPersonName(peopleById, targetParentId);

  const originParentShortName = getShortPersonName(originParentName);
  const targetParentShortName = getShortPersonName(targetParentName);

  const originParentLabel = getParentLabelFromIncomingStep(result, 0);
  const targetParentLabel = getParentLabelFromIncomingStep(result, 2);
  const siblingLabel = getSiblingLabelByPersonName(targetParentName);

  return {
    title: `${originShortName} e ${targetShortName} são primos`,
    summary: `A ${originParentLabel} de ${originShortName}, ${originParentShortName}, é ${siblingLabel} de ${targetParentShortName}, que é ${targetParentLabel} de ${targetShortName}.`,
  };
}

export function getRelationshipNarrative(result: RelationshipDegreeResult, people: Pessoa[]) {
  const cousinNarrative = buildCousinNarrative(result, people);
  if (cousinNarrative) return cousinNarrative;

  if (result.found) {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const originName = getShortPersonName(getPersonName(peopleById, result.originPersonId));
    const targetName = getShortPersonName(getPersonName(peopleById, result.targetPersonId));
    const label = result.label === 'a própria pessoa' ? 'a mesma pessoa' : result.label;

    return {
      title: `${originName} e ${targetName}: ${label}`,
      summary: getRelationshipResultMessage(result),
    };
  }

  return {
    title: 'Sem vínculo encontrado',
    summary: getRelationshipResultMessage(result),
  };
}
