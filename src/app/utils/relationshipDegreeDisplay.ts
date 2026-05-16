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

function getPersonName(peopleById: Map<string, Pessoa>, personId: string) {
  return peopleById.get(personId)?.nome_completo?.trim() || 'Pessoa';
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
    const match = WARNING_MATCHERS.find(([pattern]) => pattern.test(warning));
    if (match) {
      warnings.add(match[1]);
    }
  });

  return Array.from(warnings);
}

export function getRelationshipResultMessage(result: RelationshipDegreeResult) {
  if (result.found) return result.description;

  if (result.confidence === 'unknown') {
    return 'Dados insuficientes para calcular o vínculo com segurança.';
  }

  return 'Nenhum vínculo familiar foi encontrado com os dados disponíveis.';
}
