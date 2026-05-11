import { Edge, Node } from 'reactflow';
import { Pessoa } from '../../../types';
import {
  DirectRelationVariant,
  TreeLayoutParams,
  TreeLayoutResult,
  getSortableBirthValue,
} from '../types';
import { DIRECT_FAMILY_TOKENS } from '../visualTokens';

type GenerationKey = number | null;

interface GenerationGroup {
  key: GenerationKey;
  label: string;
  people: GenealogyPersonPlacement[];
}

interface RelationshipIndex {
  spousesByPerson: Map<string, Set<string>>;
  spousePairKeys: Set<string>;
  siblingsByPerson: Map<string, Set<string>>;
}

interface GenealogyPersonPlacement {
  pessoa: Pessoa;
  directRelation: DirectRelationVariant;
}

const CARD_WIDTH = DIRECT_FAMILY_TOKENS.CARD_WIDTH;
const CARD_HEIGHT = DIRECT_FAMILY_TOKENS.CARD_HEIGHT;
const TITLE_WIDTH = 1180;
const TITLE_TOP = 40;
const TITLE_CENTER_X = 0;
const COLUMN_TOP = 205;
const COLUMN_LABEL_HEIGHT = 30;
const LABEL_TO_CARD_GAP = 16;
const COLUMN_GAP = 82;
const ROW_GAP = 18;
const SPOUSE_ROW_EXTRA_GAP = 36;

const GENERATION_RELATION_VARIANTS: Record<number, {
  base: DirectRelationVariant;
  spouseAlternate?: DirectRelationVariant;
}> = {
  1: { base: 'greatGreatGrandparent' },
  2: { base: 'greatGrandparent' },
  3: { base: 'grandparent', spouseAlternate: 'uncleAunt' },
  4: { base: 'cousin', spouseAlternate: 'spouse' },
  5: { base: 'sibling', spouseAlternate: 'nephewNiece' },
  6: { base: 'child' },
};

function getGenerationKey(pessoa: Pessoa): GenerationKey {
  const generation = pessoa.manual_generation;

  if (typeof generation === 'number' && Number.isFinite(generation)) {
    return generation;
  }

  return null;
}

function getGenerationLabel(key: GenerationKey) {
  return key === null ? 'Sem geração' : `Geração ${key}`;
}

function comparePeopleByBirthAndName(pessoaA: Pessoa, pessoaB: Pessoa) {
  const birthA = getSortableBirthValue(pessoaA.data_nascimento);
  const birthB = getSortableBirthValue(pessoaB.data_nascimento);

  if (birthA !== birthB) {
    return birthA - birthB;
  }

  return (pessoaA.nome_completo || '').localeCompare(pessoaB.nome_completo || '');
}

function buildRelationshipIndex(graph: TreeLayoutParams): RelationshipIndex {
  const spousesByPerson = new Map<string, Set<string>>();
  const spousePairKeys = new Set<string>();
  const siblingsByPerson = new Map<string, Set<string>>();

  const addBidirectional = (map: Map<string, Set<string>>, personAId: string, personBId: string) => {
    if (!personAId || !personBId || personAId === personBId) return;

    if (!map.has(personAId)) map.set(personAId, new Set());
    if (!map.has(personBId)) map.set(personBId, new Set());

    map.get(personAId)!.add(personBId);
    map.get(personBId)!.add(personAId);
  };

  graph.relacionamentos.forEach((relacionamento) => {
    if (relacionamento.tipo_relacionamento !== 'conjuge') return;
    if (!relacionamento.pessoa_origem_id || !relacionamento.pessoa_destino_id) return;

    addBidirectional(spousesByPerson, relacionamento.pessoa_origem_id, relacionamento.pessoa_destino_id);
    spousePairKeys.add(getSpousePairKey(relacionamento.pessoa_origem_id, relacionamento.pessoa_destino_id));
  });

  const childrenByParent = new Map<string, string[]>();

  graph.childParentsMap.forEach((parentIds, childId) => {
    parentIds.forEach((parentId) => {
      if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
      childrenByParent.get(parentId)!.push(childId);
    });
  });

  childrenByParent.forEach((childrenIds) => {
    if (childrenIds.length < 2) return;

    childrenIds.forEach((childAId, index) => {
      childrenIds.slice(index + 1).forEach((childBId) => {
        addBidirectional(siblingsByPerson, childAId, childBId);
      });
    });
  });

  return { spousesByPerson, spousePairKeys, siblingsByPerson };
}

function getSpousePairKey(personAId: string, personBId: string) {
  return [personAId, personBId].sort().join('__');
}

function areSpouses(personAId: string | undefined, personBId: string | undefined, relationshipIndex: RelationshipIndex) {
  if (!personAId || !personBId) return false;
  return relationshipIndex.spousePairKeys.has(getSpousePairKey(personAId, personBId));
}

function sortRelatedPeople(
  personIds: Iterable<string>,
  peopleById: Map<string, Pessoa>,
  baseIndexById: Map<string, number>,
  sameGenerationIds: Set<string>,
  visitedIds: Set<string>
) {
  return Array.from(personIds)
    .filter((personId) => sameGenerationIds.has(personId) && !visitedIds.has(personId))
    .map((personId) => peopleById.get(personId))
    .filter((pessoa): pessoa is Pessoa => Boolean(pessoa))
    .sort((pessoaA, pessoaB) => {
      const indexA = baseIndexById.get(pessoaA.id) ?? Number.POSITIVE_INFINITY;
      const indexB = baseIndexById.get(pessoaB.id) ?? Number.POSITIVE_INFINITY;

      if (indexA !== indexB) return indexA - indexB;
      return comparePeopleByBirthAndName(pessoaA, pessoaB);
    });
}

function getGenerationRelationVariants(key: GenerationKey) {
  if (key === null) {
    return { base: 'central' as DirectRelationVariant };
  }

  return GENERATION_RELATION_VARIANTS[key] || { base: 'central' as DirectRelationVariant };
}

function sortPeopleWithinGeneration(
  pessoas: Pessoa[],
  generationKey: GenerationKey,
  relationshipIndex: RelationshipIndex
): GenealogyPersonPlacement[] {
  const peopleById = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const sameGenerationIds = new Set(pessoas.map((pessoa) => pessoa.id));
  const baseSortedPeople = [...pessoas].sort(comparePeopleByBirthAndName);
  const baseIndexById = new Map(baseSortedPeople.map((pessoa, index) => [pessoa.id, index]));
  const visitedIds = new Set<string>();
  const orderedPeople: GenealogyPersonPlacement[] = [];
  const relationVariants = getGenerationRelationVariants(generationKey);

  const appendPersonWithSpouses = (pessoa: Pessoa) => {
    if (visitedIds.has(pessoa.id)) return [];

    const block = [pessoa];
    visitedIds.add(pessoa.id);
    orderedPeople.push({
      pessoa,
      directRelation: relationVariants.base,
    });

    const spouses = sortRelatedPeople(
      relationshipIndex.spousesByPerson.get(pessoa.id) || [],
      peopleById,
      baseIndexById,
      sameGenerationIds,
      visitedIds
    );

    spouses.forEach((spouse) => {
      visitedIds.add(spouse.id);
      block.push(spouse);
      orderedPeople.push({
        pessoa: spouse,
        directRelation: relationVariants.spouseAlternate || relationVariants.base,
      });
    });

    return block;
  };

  baseSortedPeople.forEach((pessoa) => {
    const block = appendPersonWithSpouses(pessoa);
    if (block.length === 0) return;

    const siblingCandidates = new Set<string>();
    block.forEach((blockPerson) => {
      relationshipIndex.siblingsByPerson.get(blockPerson.id)?.forEach((siblingId) => {
        siblingCandidates.add(siblingId);
      });
    });

    const siblings = sortRelatedPeople(
      siblingCandidates,
      peopleById,
      baseIndexById,
      sameGenerationIds,
      visitedIds
    );

    siblings.forEach((sibling) => appendPersonWithSpouses(sibling));
  });

  return orderedPeople;
}

function groupPeopleByGeneration(
  graph: TreeLayoutParams,
  relationshipIndex: RelationshipIndex
): GenerationGroup[] {
  const groupsByKey = new Map<GenerationKey, Pessoa[]>();

  graph.pessoas.forEach((pessoa) => {
    const key = getGenerationKey(pessoa);
    if (!groupsByKey.has(key)) groupsByKey.set(key, []);
    groupsByKey.get(key)!.push(pessoa);
  });

  const keys = Array.from(groupsByKey.keys()).sort((keyA, keyB) => {
    if (keyA === null && keyB === null) return 0;
    if (keyA === null) return 1;
    if (keyB === null) return -1;
    return keyA - keyB;
  });

  return keys.map((key) => ({
    key,
    label: getGenerationLabel(key),
    people: sortPeopleWithinGeneration(groupsByKey.get(key) || [], key, relationshipIndex),
  }));
}

function addLabelNode(
  nodes: Node[],
  id: string,
  label: string,
  x: number,
  y: number,
  width: number,
  variant: 'group' | 'title',
  subtitle?: string
) {
  nodes.push({
    id,
    type: 'directFamilyLabelNode',
    data: { label, subtitle, width, variant },
    position: { x, y },
    draggable: false,
    selectable: false,
  });
}

function clonePersonNode(node: Node, x: number, y: number, directRelation: DirectRelationVariant): Node {
  return {
    ...node,
    position: { x, y },
    draggable: false,
    selectable: false,
    data: {
      ...node.data,
      directRelation,
      useDirectRelationStyleForPet: true,
      useCentralDirectLayout: false,
      isCentralPerson: false,
      isSelected: false,
    },
  };
}

export function genealogyColumnsLayout(graph: TreeLayoutParams): TreeLayoutResult {
  const relationshipIndex = buildRelationshipIndex(graph);
  const groups = groupPeopleByGeneration(graph, relationshipIndex);
  const personNodeById = new Map(graph.personNodes.map((node) => [node.id, node]));
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (groups.length === 0) {
    addLabelNode(
      nodes,
      'genealogy-title',
      'Árvore Genealógica',
      TITLE_CENTER_X - TITLE_WIDTH / 2,
      TITLE_TOP,
      TITLE_WIDTH,
      'title',
      'Use o zoom, arraste a árvore e clique na pessoa para abrir detalhes.'
    );

    return { nodes, edges: [] };
  }

  const totalWidth = groups.length * CARD_WIDTH + Math.max(0, groups.length - 1) * COLUMN_GAP;
  const startX = -totalWidth / 2;

  addLabelNode(
    nodes,
    'genealogy-title',
    'Árvore Genealógica',
    TITLE_CENTER_X - TITLE_WIDTH / 2,
    TITLE_TOP,
    TITLE_WIDTH,
    'title',
    'Use o zoom, arraste a árvore e clique na pessoa para abrir detalhes.'
  );

  groups.forEach((group, columnIndex) => {
    const x = startX + columnIndex * (CARD_WIDTH + COLUMN_GAP);
    const labelId = group.key === null ? 'genealogy-generation-empty' : `genealogy-generation-${group.key}`;

    addLabelNode(nodes, labelId, group.label, x, COLUMN_TOP, CARD_WIDTH, 'group');

    let currentY = COLUMN_TOP + COLUMN_LABEL_HEIGHT + LABEL_TO_CARD_GAP;

    group.people.forEach(({ pessoa, directRelation }, personIndex) => {
      const node = personNodeById.get(pessoa.id);
      if (!node) return;

      if (personIndex > 0) {
        const previousPlacement = group.people[personIndex - 1];
        const isSpousePair = areSpouses(previousPlacement?.pessoa.id, pessoa.id, relationshipIndex);
        currentY += CARD_HEIGHT + ROW_GAP + (isSpousePair ? SPOUSE_ROW_EXTRA_GAP : 0);

        if (isSpousePair) {
          const pairKey = getSpousePairKey(previousPlacement.pessoa.id, pessoa.id);

          edges.push({
            id: `genealogy-spouse-${pairKey}`,
            source: previousPlacement.pessoa.id,
            sourceHandle: 'bottom',
            target: pessoa.id,
            targetHandle: 'top',
            type: 'genealogySpouseEdge',
            animated: false,
            style: {
              stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
              strokeWidth: DIRECT_FAMILY_TOKENS.SPOUSE_EDGE_STROKE_WIDTH,
              opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
            },
          });
        }
      }

      nodes.push(clonePersonNode(
        node,
        x,
        currentY,
        directRelation
      ));
    });
  });

  return { nodes, edges };
}
