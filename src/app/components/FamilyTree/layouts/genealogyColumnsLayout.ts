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
  parentsByChild: Map<string, Set<string>>;
  childrenByParent: Map<string, Set<string>>;
  childrenByCouple: Map<string, Set<string>>;
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
const FAMILY_UNIT_GAP = 48;

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
  const parentsByChild = new Map<string, Set<string>>();
  const childrenByParent = new Map<string, Set<string>>();
  const childrenByCouple = new Map<string, Set<string>>();
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

  graph.childParentsMap.forEach((parentIds, childId) => {
    parentsByChild.set(childId, new Set(parentIds));

    parentIds.forEach((parentId) => {
      if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, new Set());
      childrenByParent.get(parentId)!.add(childId);
    });

    const parentIdList = Array.from(parentIds).filter(Boolean).sort();

    parentIdList.forEach((parentAId, parentIndex) => {
      parentIdList.slice(parentIndex + 1).forEach((parentBId) => {
        const coupleKey = getSpousePairKey(parentAId, parentBId);

        if (!childrenByCouple.has(coupleKey)) childrenByCouple.set(coupleKey, new Set());
        childrenByCouple.get(coupleKey)!.add(childId);
      });
    });
  });

  childrenByParent.forEach((childrenIds) => {
    const childIdList = Array.from(childrenIds);
    if (childIdList.length < 2) return;

    childIdList.forEach((childAId, index) => {
      childIdList.slice(index + 1).forEach((childBId) => {
        addBidirectional(siblingsByPerson, childAId, childBId);
      });
    });
  });

  return {
    parentsByChild,
    childrenByParent,
    childrenByCouple,
    spousesByPerson,
    spousePairKeys,
    siblingsByPerson,
  };
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

function getGapBetweenPeople(
  previousPersonId: string | undefined,
  nextPersonId: string | undefined,
  relationshipIndex: RelationshipIndex
) {
  return ROW_GAP + (areSpouses(previousPersonId, nextPersonId, relationshipIndex) ? SPOUSE_ROW_EXTRA_GAP : 0);
}

function getPlacementBlockHeight(placements: GenealogyPersonPlacement[], relationshipIndex: RelationshipIndex) {
  if (placements.length === 0) return 0;

  return placements.reduce((height, placement, index) => {
    if (index === 0) return CARD_HEIGHT;

    const previousPlacement = placements[index - 1];
    return height + getGapBetweenPeople(previousPlacement?.pessoa.id, placement.pessoa.id, relationshipIndex) + CARD_HEIGHT;
  }, 0);
}

function addGenealogySpouseEdge(
  edges: Edge[],
  sourcePersonId: string,
  targetPersonId: string
) {
  const pairKey = getSpousePairKey(sourcePersonId, targetPersonId);

  if (edges.some((edge) => edge.id === `genealogy-spouse-${pairKey}`)) {
    return;
  }

  edges.push({
    id: `genealogy-spouse-${pairKey}`,
    source: sourcePersonId,
    sourceHandle: 'bottom',
    target: targetPersonId,
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

function appendPlacementNodes(
  placements: GenealogyPersonPlacement[],
  x: number,
  startY: number,
  relationshipIndex: RelationshipIndex,
  personNodeById: Map<string, Node>,
  nodes: Node[],
  edges: Edge[]
) {
  let currentY = startY;

  placements.forEach(({ pessoa, directRelation }, index) => {
    const node = personNodeById.get(pessoa.id);
    if (!node) return;

    if (index > 0) {
      const previousPlacement = placements[index - 1];
      const gap = getGapBetweenPeople(previousPlacement?.pessoa.id, pessoa.id, relationshipIndex);
      currentY += CARD_HEIGHT + gap;

      if (areSpouses(previousPlacement?.pessoa.id, pessoa.id, relationshipIndex)) {
        addGenealogySpouseEdge(edges, previousPlacement.pessoa.id, pessoa.id);
      }
    }

    nodes.push(clonePersonNode(node, x, currentY, directRelation));
  });

  return currentY + CARD_HEIGHT;
}

function getSpousesForPlacement(
  pessoa: Pessoa,
  peopleById: Map<string, Pessoa>,
  baseIndexById: Map<string, number>,
  sameGenerationIds: Set<string>,
  visitedIds: Set<string>,
  relationshipIndex: RelationshipIndex
) {
  return sortRelatedPeople(
    relationshipIndex.spousesByPerson.get(pessoa.id) || [],
    peopleById,
    baseIndexById,
    sameGenerationIds,
    visitedIds
  );
}

function buildChildFamilyBlock(
  childIds: Iterable<string>,
  group: GenerationGroup,
  relationshipIndex: RelationshipIndex,
  visitedIds: Set<string>
) {
  const peopleById = new Map(group.people.map((placement) => [placement.pessoa.id, placement.pessoa]));
  const baseIndexById = new Map(group.people.map((placement, index) => [placement.pessoa.id, index]));
  const sameGenerationIds = new Set(group.people.map((placement) => placement.pessoa.id));
  const relationVariants = getGenerationRelationVariants(group.key);
  const placements: GenealogyPersonPlacement[] = [];

  Array.from(childIds)
    .map((childId) => peopleById.get(childId))
    .filter((pessoa): pessoa is Pessoa => Boolean(pessoa) && !visitedIds.has(pessoa.id))
    .sort(comparePeopleByBirthAndName)
    .forEach((child) => {
      if (visitedIds.has(child.id)) return;

      visitedIds.add(child.id);
      placements.push({
        pessoa: child,
        directRelation: relationVariants.base,
      });

      const spouses = getSpousesForPlacement(
        child,
        peopleById,
        baseIndexById,
        sameGenerationIds,
        visitedIds,
        relationshipIndex
      );

      spouses.forEach((spouse) => {
        visitedIds.add(spouse.id);
        placements.push({
          pessoa: spouse,
          directRelation: relationVariants.spouseAlternate || relationVariants.base,
        });
      });
    });

  return placements;
}

function buildGeneration4ParentUnits(
  generation4Group: GenerationGroup,
  generation5Group: GenerationGroup | undefined,
  relationshipIndex: RelationshipIndex,
  visitedGeneration5Ids: Set<string>
) {
  const units: Array<{
    parentPlacements: GenealogyPersonPlacement[];
    childPlacements: GenealogyPersonPlacement[];
    parentHeight: number;
    childrenHeight: number;
    unitHeight: number;
  }> = [];

  for (let index = 0; index < generation4Group.people.length; index++) {
    const currentPlacement = generation4Group.people[index];
    const nextPlacement = generation4Group.people[index + 1];
    const parentPlacements = [currentPlacement];
    const childIds = new Set<string>();

    if (nextPlacement && areSpouses(currentPlacement.pessoa.id, nextPlacement.pessoa.id, relationshipIndex)) {
      parentPlacements.push(nextPlacement);
      relationshipIndex.childrenByCouple.get(
        getSpousePairKey(currentPlacement.pessoa.id, nextPlacement.pessoa.id)
      )?.forEach((childId) => childIds.add(childId));

      parentPlacements.forEach((parentPlacement) => {
        relationshipIndex.childrenByParent.get(parentPlacement.pessoa.id)?.forEach((childId) => {
          const parentIds = relationshipIndex.parentsByChild.get(childId);
          if (parentIds?.size === 1) {
            childIds.add(childId);
          }
        });
      });

      index++;
    } else {
      relationshipIndex.childrenByParent.get(currentPlacement.pessoa.id)?.forEach((childId) => {
        childIds.add(childId);
      });
    }

    const childPlacements = generation5Group
      ? buildChildFamilyBlock(childIds, generation5Group, relationshipIndex, visitedGeneration5Ids)
      : [];
    const parentHeight = getPlacementBlockHeight(parentPlacements, relationshipIndex);
    const childrenHeight = getPlacementBlockHeight(childPlacements, relationshipIndex);

    units.push({
      parentPlacements,
      childPlacements,
      parentHeight,
      childrenHeight,
      unitHeight: Math.max(parentHeight, childrenHeight),
    });
  }

  return units;
}

function layoutGeneration4And5FamilyUnits(
  generation4Group: GenerationGroup,
  generation5Group: GenerationGroup | undefined,
  generation4X: number,
  generation5X: number | undefined,
  baseY: number,
  relationshipIndex: RelationshipIndex,
  personNodeById: Map<string, Node>,
  nodes: Node[],
  edges: Edge[]
) {
  const visitedGeneration5Ids = new Set<string>();
  const units = buildGeneration4ParentUnits(
    generation4Group,
    generation5Group,
    relationshipIndex,
    visitedGeneration5Ids
  );
  let currentUnitTopY = baseY;

  units.forEach((unit) => {
    const unitCenterY = currentUnitTopY + unit.unitHeight / 2;
    const parentBlockTopY = unitCenterY - unit.parentHeight / 2;
    const childrenBlockTopY = unitCenterY - unit.childrenHeight / 2;

    appendPlacementNodes(
      unit.parentPlacements,
      generation4X,
      parentBlockTopY,
      relationshipIndex,
      personNodeById,
      nodes,
      edges
    );

    if (generation5Group && generation5X !== undefined && unit.childPlacements.length > 0) {
      appendPlacementNodes(
        unit.childPlacements,
        generation5X,
        childrenBlockTopY,
        relationshipIndex,
        personNodeById,
        nodes,
        edges
      );
    }

    currentUnitTopY += unit.unitHeight + FAMILY_UNIT_GAP;
  });

  if (!generation5Group || generation5X === undefined) return;

  const remainingPlacements = generation5Group.people.filter((placement) => !visitedGeneration5Ids.has(placement.pessoa.id));
  if (remainingPlacements.length === 0) return;

  appendPlacementNodes(
    remainingPlacements,
    generation5X,
    Math.max(baseY, currentUnitTopY),
    relationshipIndex,
    personNodeById,
    nodes,
    edges
  );
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
  const getColumnX = (columnIndex: number) => startX + columnIndex * (CARD_WIDTH + COLUMN_GAP);
  const generation4GroupIndex = groups.findIndex((group) => group.key === 4);
  const generation5GroupIndex = groups.findIndex((group) => group.key === 5);
  const generation4Group = generation4GroupIndex >= 0 ? groups[generation4GroupIndex] : undefined;
  const generation5Group = generation5GroupIndex >= 0 ? groups[generation5GroupIndex] : undefined;
  const shouldLayoutGeneration4And5Together = Boolean(generation4Group);

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
    const x = getColumnX(columnIndex);
    const labelId = group.key === null ? 'genealogy-generation-empty' : `genealogy-generation-${group.key}`;

    addLabelNode(nodes, labelId, group.label, x, COLUMN_TOP, CARD_WIDTH, 'group');

    const firstCardY = COLUMN_TOP + COLUMN_LABEL_HEIGHT + LABEL_TO_CARD_GAP;

    if (group.key === 4 && generation4Group) {
      layoutGeneration4And5FamilyUnits(
        generation4Group,
        generation5Group,
        x,
        generation5GroupIndex >= 0 ? getColumnX(generation5GroupIndex) : undefined,
        firstCardY,
        relationshipIndex,
        personNodeById,
        nodes,
        edges
      );

      return;
    }

    if (group.key === 5 && shouldLayoutGeneration4And5Together) {
      return;
    }

    let currentY = firstCardY;

    group.people.forEach(({ pessoa, directRelation }, personIndex) => {
      const node = personNodeById.get(pessoa.id);
      if (!node) return;

      if (personIndex > 0) {
        const previousPlacement = group.people[personIndex - 1];
        const gap = getGapBetweenPeople(previousPlacement?.pessoa.id, pessoa.id, relationshipIndex);
        currentY += CARD_HEIGHT + gap;

        if (areSpouses(previousPlacement?.pessoa.id, pessoa.id, relationshipIndex)) {
          addGenealogySpouseEdge(edges, previousPlacement.pessoa.id, pessoa.id);
        }
      }

      nodes.push(clonePersonNode(node, x, currentY, directRelation));
    });
  });

  return { nodes, edges };
}
