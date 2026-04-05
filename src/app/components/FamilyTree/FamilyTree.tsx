import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Pessoa, Relacionamento } from '../../types';
import { nodeTypes } from './nodeTypes';

interface FamilyTreeProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  onPersonClick?: (pessoa: Pessoa) => void;
  selectedPersonId?: string;
  edgeFilters?: {
    conjugal: boolean;
    filiacao_sangue: boolean;
    filiacao_adotiva: boolean;
    irmaos: boolean;
  };
}

// Função para posicionar nodes manualmente sem dagre
function getManualLayout(
  personNodes: Node[],
  marriageNodes: Node[],
  edges: Edge[],
  marriageMap: Map<string, string>,
  childrenByMarriage: Map<string, string[]>,
  pessoas: Pessoa[],
  childParentsMap: Map<string, Set<string>>
): { nodes: Node[]; edges: Edge[] } {
  const nodeWidth = 280;
  const nodeHeight = 120;
  const marriageNodeWidth = 32;
  const verticalGapBetweenSpouses = 40; // Gap VERTICAL entre cônjuges (um em cima do outro)
  const horizontalGapToChildren = 100; // Gap horizontal entre pais e filhos
  const verticalGapBetweenSiblings = 30; // Gap vertical entre irmãos
  const horizontalGapBetweenGenerations = 350; // Gap horizontal entre gerações

  // Mapear pessoas por ID para fácil acesso
  const pessoaMap = new Map(pessoas.map(p => [p.id, p]));

  // Criar mapa reverso: parent_id -> [child_ids] para otimizar busca
  const parentToChildrenMap = new Map<string, string[]>();
  childParentsMap.forEach((parentIds, childId) => {
    parentIds.forEach(parentId => {
      if (!parentToChildrenMap.has(parentId)) {
        parentToChildrenMap.set(parentId, []);
      }
      parentToChildrenMap.get(parentId)!.push(childId);
    });
  });

  // Identificar gerações (nível hierárquico)
  const generations = new Map<string, number>(); // pessoa_id -> nível de geração
  const visited = new Set<string>();

  // Função recursiva para calcular gerações - OTIMIZADA
  function calculateGeneration(personId: string, level: number = 0) {
    if (visited.has(personId)) return;
    visited.add(personId);
    
    const currentLevel = generations.get(personId);
    if (currentLevel === undefined || level > currentLevel) {
      generations.set(personId, level);
    }

    // Encontrar filhos desta pessoa através de childrenByMarriage
    childrenByMarriage.forEach((children, marriageNodeId) => {
      const marriageKey = marriageNodeId.replace('marriage-', '');
      const [parent1Id, parent2Id] = marriageKey.split('::');
      
      if (parent1Id === personId || parent2Id === personId) {
        children.forEach(childId => {
          calculateGeneration(childId, level + 1);
        });
      }
    });
    
    // Também encontrar filhos através do mapa reverso (OTIMIZADO)
    const children = parentToChildrenMap.get(personId);
    if (children) {
      children.forEach(childId => {
        // Só processar se não foi processado via marriage node
        if (!visited.has(childId)) {
          calculateGeneration(childId, level + 1);
        }
      });
    }
  }

  // Identificar roots (pessoas sem pais) e calcular gerações a partir delas
  const allChildren = new Set<string>();
  childrenByMarriage.forEach(children => {
    children.forEach(childId => allChildren.add(childId));
  });
  // Adicionar também filhos de pais não casados
  childParentsMap.forEach((parentIds, childId) => {
    allChildren.add(childId);
  });

  // Criar set com IDs de person nodes disponíveis para otimização
  const availablePersonIds = new Set(personNodes.map(n => n.id));

  personNodes.forEach(node => {
    if (!allChildren.has(node.id)) {
      calculateGeneration(node.id, 0);
    }
  });

  // Agrupar pessoas por geração (apenas pessoas que existem nos personNodes)
  const peopleByGeneration = new Map<number, string[]>();
  generations.forEach((level, personId) => {
    // Só adicionar se a pessoa existe nos nodes disponíveis
    if (availablePersonIds.has(personId)) {
      if (!peopleByGeneration.has(level)) {
        peopleByGeneration.set(level, []);
      }
      peopleByGeneration.get(level)!.push(personId);
    }
  });

  // AJUSTAR gerações para cônjuges: cônjuges devem estar na MESMA geração
  // Para cada casamento, colocar ambos cônjuges na geração MAIOR (mais recente)
  marriageMap.forEach((marriageNodeId, marriageKey) => {
    const [person1Id, person2Id] = marriageKey.split('::');
    const gen1 = generations.get(person1Id);
    const gen2 = generations.get(person2Id);
    
    if (gen1 !== undefined && gen2 !== undefined && gen1 !== gen2) {
      // Mover ambos para a geração MAIOR (mais recente)
      const maxGen = Math.max(gen1, gen2);
      
      // Remover da geração antiga
      if (gen1 < maxGen && peopleByGeneration.has(gen1)) {
        const people = peopleByGeneration.get(gen1)!;
        const index = people.indexOf(person1Id);
        if (index > -1) people.splice(index, 1);
      }
      if (gen2 < maxGen && peopleByGeneration.has(gen2)) {
        const people = peopleByGeneration.get(gen2)!;
        const index = people.indexOf(person2Id);
        if (index > -1) people.splice(index, 1);
      }
      
      // Adicionar ambos na geração maior
      if (!peopleByGeneration.has(maxGen)) {
        peopleByGeneration.set(maxGen, []);
      }
      const peopleInMaxGen = peopleByGeneration.get(maxGen)!;
      if (!peopleInMaxGen.includes(person1Id)) {
        peopleInMaxGen.push(person1Id);
      }
      if (!peopleInMaxGen.includes(person2Id)) {
        peopleInMaxGen.push(person2Id);
      }
      
      // Atualizar o mapa de gerações
      generations.set(person1Id, maxGen);
      generations.set(person2Id, maxGen);
    }
  });

  // Posicionar nodes - LAYOUT HORIZONTAL (gerações da esquerda para direita)
  const positionedNodes: Node[] = [];

  // Ordenar gerações
  const sortedLevels = Array.from(peopleByGeneration.keys()).sort((a, b) => a - b);

  // Mapear Y do marriage node de cada casal para ajustar posição dos filhos únicos
  const marriageNodeYPositions = new Map<string, number>();

  sortedLevels.forEach(level => {
    const peopleInLevel = peopleByGeneration.get(level) || [];
    const currentX = 100 + (level * horizontalGapBetweenGenerations); // X FIXO por geração
    let currentY = 100; // Y cresce para baixo conforme adicionamos pessoas

    // Identificar casais neste nível
    const processedInLevel = new Set<string>();
    const couplesInLevel: string[][] = [];
    const singlesInLevel: string[] = [];

    marriageMap.forEach((marriageNodeId, marriageKey) => {
      const [parent1Id, parent2Id] = marriageKey.split('::');
      
      if (peopleInLevel.includes(parent1Id) && peopleInLevel.includes(parent2Id)) {
        couplesInLevel.push([parent1Id, parent2Id]);
        processedInLevel.add(parent1Id);
        processedInLevel.add(parent2Id);
      }
    });

    peopleInLevel.forEach(personId => {
      if (!processedInLevel.has(personId)) {
        singlesInLevel.push(personId);
      }
    });

    // Posicionar casais primeiro
    couplesInLevel.forEach(([parent1Id, parent2Id]) => {
      // ORDENAR cônjuges por data de nascimento (mais velho fica EM CIMA)
      const parent1 = pessoas.find(p => p.id === parent1Id);
      const parent2 = pessoas.find(p => p.id === parent2Id);
      
      let olderParentId = parent1Id;
      let youngerParentId = parent2Id;
      
      if (parent1 && parent2) {
        const date1 = parent1.data_nascimento || '';
        const date2 = parent2.data_nascimento || '';
        
        // Se ambos têm data, comparar. Caso contrário, manter ordem alfabética
        if (date1 && date2) {
          if (date1 > date2) {
            // parent2 é mais velho
            olderParentId = parent2Id;
            youngerParentId = parent1Id;
          }
        }
      }
      
      // Posicionar cônjuge mais velho (em cima)
      const olderNode = personNodes.find(n => n.id === olderParentId);
      if (!olderNode) return; // Skip se o node não existe (filtrado)
      
      olderNode.position = { x: currentX, y: currentY };
      positionedNodes.push(olderNode);

      // Posicionar marriage node no meio VERTICAL (entre os dois cônjuges)
      const marriageKey = [parent1Id, parent2Id].sort().join('::');
      const marriageNodeId = marriageMap.get(marriageKey);
      const spouseY = currentY + nodeHeight + verticalGapBetweenSpouses;
      
      if (marriageNodeId) {
        const marriageNode = marriageNodes.find(n => n.id === marriageNodeId);
        if (marriageNode) {
          marriageNode.position = {
            x: currentX + nodeWidth / 2 - marriageNodeWidth / 2,
            y: currentY + nodeHeight + verticalGapBetweenSpouses / 2 - marriageNodeWidth / 2
          };
          positionedNodes.push(marriageNode);
          marriageNodeYPositions.set(marriageNodeId, spouseY);
        }
      }

      // Posicionar cônjuge mais jovem (embaixo, ABAIXO do mais velho)
      const youngerNode = personNodes.find(n => n.id === youngerParentId);
      if (!youngerNode) return; // Skip se o node não existe (filtrado)
      
      youngerNode.position = { x: currentX, y: spouseY };
      positionedNodes.push(youngerNode);

      // Avançar Y para o próximo grupo (casal ou pessoa solteira)
      currentY += (nodeHeight * 2) + verticalGapBetweenSpouses + horizontalGapToChildren;
    });

    // Posicionar solteiros
    singlesInLevel.forEach(personId => {
      const personNode = personNodes.find(n => n.id === personId);
      if (!personNode) return; // Skip se o node não existe (filtrado)
      
      personNode.position = { x: currentX, y: currentY };
      positionedNodes.push(personNode);
      currentY += nodeHeight + horizontalGapToChildren;
    });
  });

  // CRÍTICO: Remover marriage nodes que não foram posicionados
  // para evitar que apareçam na posição (0,0) com linhas saindo deles
  const positionedIds = new Set(positionedNodes.map(n => n.id));
  const validMarriageNodes = marriageNodes.filter(mn => positionedIds.has(mn.id));
  
  // AJUSTAR posição Y de filhos únicos para centralizá-los com o marriage node dos pais
  childrenByMarriage.forEach((childrenIds, marriageNodeId) => {
    if (childrenIds.length === 1) {
      const childId = childrenIds[0];
      const childNode = positionedNodes.find(n => n.id === childId);
      const marriageNode = positionedNodes.find(n => n.id === marriageNodeId);
      
      if (childNode && marriageNode) {
        // Centralizar Y do filho com o Y do marriage node
        childNode.position.y = marriageNode.position.y + marriageNodeWidth / 2 - nodeHeight / 2;
      }
    }
  });
  
  // Remover edges que conectam a nodes não posicionados (pessoas ou marriage nodes)
  const validEdges = edges.filter(edge => {
    // Verificar se source e target existem nos nodes posicionados
    if (!positionedIds.has(edge.source) || !positionedIds.has(edge.target)) {
      return false;
    }
    return true;
  });

  return { nodes: positionedNodes, edges: validEdges };
}

export function FamilyTree({ pessoas, relacionamentos, onPersonClick, selectedPersonId, edgeFilters }: FamilyTreeProps) {
  // Criar um hash estável dos dados de entrada para evitar recalcular desnecessariamente
  const dataHash = useMemo(() => {
    return JSON.stringify({
      pessoasIds: pessoas.map(p => p.id).sort(),
      relacionamentosIds: relacionamentos.map(r => r.id).sort(),
      filters: edgeFilters
    });
  }, [pessoas, relacionamentos, edgeFilters]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const filters = edgeFilters || { conjugal: true, filiacao_sangue: true, filiacao_adotiva: true, irmaos: true };

    // 1. Criar nodes de pessoas
    const personNodes: Node[] = pessoas.map((pessoa) => ({
      id: pessoa.id,
      type: 'personNode',
      data: { 
        pessoa,
        // Não incluir onClick nem isSelected aqui para evitar recriação
      },
      position: { x: 0, y: 0 },
    }));

    // 2. Mapear relacionamentos
    const conjugalRels = relacionamentos.filter(r => r.tipo_relacionamento === 'conjuge');
    const filiacaoRels = relacionamentos.filter(r => r.tipo_relacionamento === 'pai' || r.tipo_relacionamento === 'mae');

    // 3. Agrupar filhos por pais
    const childParentsMap = new Map<string, Set<string>>(); // child_id -> Set(parent_ids)
    
    filiacaoRels.forEach(filiacaoRel => {
      const childId = filiacaoRel.pessoa_origem_id;
      const parentId = filiacaoRel.pessoa_destino_id;
      
      if (!childId || !parentId) return;
      
      if (!childParentsMap.has(childId)) {
        childParentsMap.set(childId, new Set());
      }
      childParentsMap.get(childId)!.add(parentId);
    });

    // 4. Criar marriage nodes para casais com filhos
    const marriageNodes: Node[] = [];
    const marriageMap = new Map<string, string>(); // "parent1::parent2" -> marriage_node_id
    const childrenByMarriage = new Map<string, string[]>(); // marriage_node_id -> [children_ids]

    childParentsMap.forEach((parentIds, childId) => {
      if (parentIds.size === 2) {
        const parentsArray = Array.from(parentIds);
        const [parent1Id, parent2Id] = parentsArray.sort();
        
        const parent1Exists = pessoas.some(p => p.id === parent1Id);
        const parent2Exists = pessoas.some(p => p.id === parent2Id);
        
        if (!parent1Exists || !parent2Exists) return;
        
        // VERIFICAR SE OS PAIS TÊM RELACIONAMENTO CONJUGAL
        const hasConjugalRelationship = conjugalRels.some(rel => 
          (rel.pessoa_origem_id === parent1Id && rel.pessoa_destino_id === parent2Id) ||
          (rel.pessoa_origem_id === parent2Id && rel.pessoa_destino_id === parent1Id)
        );
        
        // Apenas criar marriage node se os pais forem casados/parceiros
        if (!hasConjugalRelationship) return;
        
        const marriageKey = `${parent1Id}::${parent2Id}`;
        
        if (!marriageMap.has(marriageKey)) {
          const marriageNodeId = `marriage-${marriageKey}`;
          marriageMap.set(marriageKey, marriageNodeId);
          
          marriageNodes.push({
            id: marriageNodeId,
            type: 'marriageNode',
            data: { emoji: '💑' },
            position: { x: 0, y: 0 },
          });
          
          childrenByMarriage.set(marriageNodeId, []);
        }
        
        const marriageNodeId = marriageMap.get(marriageKey)!;
        const children = childrenByMarriage.get(marriageNodeId)!;
        if (!children.includes(childId)) {
          children.push(childId);
        }
      }
    });

    // 5. Combinar todos os nodes
    const allNodes = [...personNodes, ...marriageNodes];
    const nodeIdsSet = new Set(allNodes.map(n => n.id));

    // 6. Criar edges
    const edges: Edge[] = [];
    let edgeIdCounter = 0;

    // 6.1. Edges conjugais VERTICAIS para marriage nodes (cônjuges um em cima do outro)
    if (filters.conjugal) {
      marriageMap.forEach((marriageNodeId, marriageKey) => {
        const [parent1Id, parent2Id] = marriageKey.split('::');
        
        if (!nodeIdsSet.has(parent1Id) || !nodeIdsSet.has(parent2Id) || !nodeIdsSet.has(marriageNodeId)) {
          return;
        }

        // Edge VERTICAL de BAIXO do parent1 (em cima) para CIMA do marriage node
        edges.push({
          id: `edge-conjugal-${edgeIdCounter++}`,
          source: parent1Id,
          sourceHandle: 'bottom',
          target: marriageNodeId,
          targetHandle: 'top',
          type: 'straight',
          animated: false,
          style: { 
            stroke: '#10b981',
            strokeWidth: 3,
          },
        });

        // Edge VERTICAL de BAIXO do marriage node para CIMA do parent2 (embaixo)
        edges.push({
          id: `edge-conjugal-${edgeIdCounter++}`,
          source: marriageNodeId,
          sourceHandle: 'bottom',
          target: parent2Id,
          targetHandle: 'top',
          type: 'straight',
          animated: false,
          style: { 
            stroke: '#10b981',
            strokeWidth: 3,
          },
        });
      });
    }

    // 6.2. Edges de filiação HORIZONTAIS dos marriage nodes para os filhos
    childrenByMarriage.forEach((childrenIds, marriageNodeId) => {
      if (!nodeIdsSet.has(marriageNodeId)) return;
      
      // Conectar marriage node aos filhos HORIZONTALMENTE com cantos ortogonais (90°)
      childrenIds.forEach(childId => {
        if (!nodeIdsSet.has(childId)) return;
        
        const filiacaoRel = filiacaoRels.find(r => 
          r.pessoa_origem_id === childId && childrenIds.includes(r.pessoa_origem_id)
        );
        
        const isAdoptive = filiacaoRel?.subtipo_relacionamento === 'adotivo';
        
        if (isAdoptive && !filters.filiacao_adotiva) return;
        if (!isAdoptive && !filters.filiacao_sangue) return;
        
        // Linha ORTOGONAL (com cantos de 90°) do marriage node (right) para o filho (left)
        // A linha sai horizontal do emoji, vai até o corredor, sobe/desce vertical e conecta ao filho
        edges.push({
          id: `edge-filiacao-${edgeIdCounter++}`,
          source: marriageNodeId,
          sourceHandle: 'right',
          target: childId,
          targetHandle: 'left-target',
          type: 'smoothstep', // Mudado de 'straight' para 'smoothstep' para cantos de 90°
          animated: false,
          style: { 
            stroke: isAdoptive ? '#9333ea' : '#10b981',
            strokeWidth: 2,
            strokeDasharray: isAdoptive ? '5,5' : '5,5', // Tracejada
          },
        });
      });
    });

    // 6.3. Edges de irmãos HORIZONTAIS simples (linha tracejada amarela/laranja)
    // Primeiro nascido à esquerda, último à direita, linha pontilhada horizontal entre eles
    if (filters.irmaos) {
      // Agrupar irmãos por pais comuns para evitar duplicação
      const processedSiblingGroups = new Set<string>();
      
      childrenByMarriage.forEach((childrenIds, marriageNodeId) => {
        if (childrenIds.length < 2) return;
        
        // Criar ID único para o grupo de irmãos (ordenado)
        const groupId = [...childrenIds].sort().join('::');
        if (processedSiblingGroups.has(groupId)) return;
        processedSiblingGroups.add(groupId);
        
        // Ordenar irmãos por data de nascimento (mais velho primeiro)
        const siblingsWithDates = childrenIds
          .map(childId => {
            const pessoa = pessoas.find(p => p.id === childId);
            return { id: childId, dataNascimento: pessoa?.data_nascimento || '' };
          })
          .sort((a, b) => {
            // Ordenar por data de nascimento (mais velho primeiro)
            if (!a.dataNascimento) return 1;
            if (!b.dataNascimento) return -1;
            return a.dataNascimento.localeCompare(b.dataNascimento);
          });

        // Conectar irmãos sequencialmente: cada irmão ao próximo
        // Linha HORIZONTAL usando handles laterais (right-source -> left-target)
        for (let i = 0; i < siblingsWithDates.length - 1; i++) {
          const sibling1 = siblingsWithDates[i].id;
          const sibling2 = siblingsWithDates[i + 1].id;
          
          if (!nodeIdsSet.has(sibling1) || !nodeIdsSet.has(sibling2)) continue;
          
          edges.push({
            id: `edge-siblings-${edgeIdCounter++}`,
            source: sibling1,
            sourceHandle: 'right-source', // Handle DIREITO do irmão à esquerda
            target: sibling2,
            targetHandle: 'left-target', // Handle ESQUERDO do irmão à direita
            type: 'straight', // Linha reta horizontal
            animated: false,
            style: { 
              stroke: '#eab308', // Amarelo
              strokeWidth: 2,
              strokeDasharray: '8,4' // Linha pontilhada
            },
          });
        }
      });
    }

    // 6.4. Filhos com apenas 1 pai (edge direta VERTICAL)
    childParentsMap.forEach((parentIds, childId) => {
      if (parentIds.size === 1) {
        const parentId = Array.from(parentIds)[0];
        
        if (!nodeIdsSet.has(childId) || !nodeIdsSet.has(parentId)) return;
        
        const filiacaoRel = filiacaoRels.find(r => 
          r.pessoa_origem_id === childId && r.pessoa_destino_id === parentId
        );
        
        const isAdoptive = filiacaoRel?.subtipo_relacionamento === 'adotivo';
        
        if (isAdoptive && !filters.filiacao_adotiva) return;
        if (!isAdoptive && !filters.filiacao_sangue) return;

        edges.push({
          id: `edge-filiacao-single-${edgeIdCounter++}`,
          source: parentId,
          sourceHandle: 'bottom',
          target: childId,
          targetHandle: 'top',
          type: 'smoothstep',
          animated: false,
          style: { 
            stroke: isAdoptive ? '#f59e0b' : '#6b7280',
            strokeWidth: 2,
            strokeDasharray: isAdoptive ? '5,5' : '0'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isAdoptive ? '#f59e0b' : '#6b7280',
          },
          label: isAdoptive ? 'Adotivo' : '',
          labelStyle: { fill: '#6b7280', fontWeight: 600, fontSize: 12 },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
        });
      } else if (parentIds.size === 2) {
        // Filhos com 2 pais que NÃO são casados (não têm marriage node)
        const parentsArray = Array.from(parentIds);
        const [parent1Id, parent2Id] = parentsArray.sort();
        const marriageKey = `${parent1Id}::${parent2Id}`;
        
        // Se não tem marriage node, criar edges diretas de cada pai para o filho
        if (!marriageMap.has(marriageKey)) {
          parentIds.forEach(parentId => {
            if (!nodeIdsSet.has(childId) || !nodeIdsSet.has(parentId)) return;
            
            const filiacaoRel = filiacaoRels.find(r => 
              r.pessoa_origem_id === childId && r.pessoa_destino_id === parentId
            );
            
            const isAdoptive = filiacaoRel?.subtipo_relacionamento === 'adotivo';
            
            if (isAdoptive && !filters.filiacao_adotiva) return;
            if (!isAdoptive && !filters.filiacao_sangue) return;

            edges.push({
              id: `edge-filiacao-unmarried-${edgeIdCounter++}`,
              source: parentId,
              sourceHandle: 'bottom',
              target: childId,
              targetHandle: 'top',
              type: 'smoothstep',
              animated: false,
              style: { 
                stroke: isAdoptive ? '#f59e0b' : '#6b7280',
                strokeWidth: 2,
                strokeDasharray: isAdoptive ? '5,5' : '0'
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isAdoptive ? '#f59e0b' : '#6b7280',
              },
              label: isAdoptive ? 'Adotivo' : '',
              labelStyle: { fill: '#6b7280', fontWeight: 600, fontSize: 12 },
              labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
            });
          });
        }
      }
    });

    // 6.5. Casais sem filhos também precisam de marriage node e linhas VERTICAIS
    if (filters.conjugal) {
      conjugalRels.forEach(conjugalRel => {
        const person1Id = conjugalRel.pessoa_origem_id;
        const person2Id = conjugalRel.pessoa_destino_id;
        
        if (!person1Id || !person2Id) return;
        
        const [parent1Id, parent2Id] = [person1Id, person2Id].sort();
        const marriageKey = `${parent1Id}::${parent2Id}`;
        
        // Se já tem marriage node (casal com filhos), skip
        if (marriageMap.has(marriageKey)) return;
        
        if (!nodeIdsSet.has(person1Id) || !nodeIdsSet.has(person2Id)) return;
        
        // Criar marriage node para casais sem filhos também
        const marriageNodeId = `marriage-${marriageKey}`;
        marriageMap.set(marriageKey, marriageNodeId);
        
        marriageNodes.push({
          id: marriageNodeId,
          type: 'marriageNode',
          data: { emoji: '💑' },
          position: { x: 0, y: 0 },
        });
        
        // Adicionar ao set de nodes
        nodeIdsSet.add(marriageNodeId);
        
        // Criar edges VERTICAIS entre os cônjuges
        edges.push({
          id: `edge-conjugal-childless-1-${edgeIdCounter++}`,
          source: parent1Id,
          sourceHandle: 'bottom',
          target: marriageNodeId,
          targetHandle: 'top',
          type: 'straight',
          animated: false,
          style: { 
            stroke: '#10b981',
            strokeWidth: 3,
          },
        });
        
        edges.push({
          id: `edge-conjugal-childless-2-${edgeIdCounter++}`,
          source: marriageNodeId,
          sourceHandle: 'bottom',
          target: parent2Id,
          targetHandle: 'top',
          type: 'straight',
          animated: false,
          style: { 
            stroke: '#10b981',
            strokeWidth: 3,
          },
        });
      });
    }

    // Layout manual
    return getManualLayout(personNodes, marriageNodes, edges, marriageMap, childrenByMarriage, pessoas, childParentsMap);
  }, [dataHash, pessoas, relacionamentos, edgeFilters]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Atualizar nodes e edges quando os dados mudarem
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [dataHash]); // Usar dataHash em vez de initialNodes/initialEdges

  // Atualizar data dos nodes quando selectedPersonId ou onPersonClick mudar
  React.useEffect(() => {
    setNodes(prevNodes => 
      prevNodes.map(node => {
        if (node.type === 'personNode' && node.data.pessoa) {
          return {
            ...node,
            data: {
              ...node.data,
              onClick: onPersonClick,
              isSelected: node.data.pessoa.id === selectedPersonId
            }
          };
        }
        return node;
      })
    );
  }, [selectedPersonId, onPersonClick, setNodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (onPersonClick && node.data.pessoa) {
      onPersonClick(node.data.pessoa);
    }
  }, [onPersonClick]);

  return (
    <div className="w-full h-full" style={{ width: '100%', height: '100%', minHeight: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const pessoa = node.data.pessoa;
            if (pessoa?.humano_ou_pet === 'Pet') return '#eab308'; // yellow-500
            if (pessoa?.data_falecimento) return '#a855f7'; // purple-500
            return '#3b82f6'; // blue-500
          }}
          maskColor="rgb(240, 240, 240, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}