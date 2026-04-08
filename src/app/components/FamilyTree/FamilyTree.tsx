import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  EdgeTypes,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Pessoa, Relacionamento, TipoVisualizacaoArvore } from '../../types';
import { nodeTypes } from './nodeTypes';
import { OrthogonalChildEdge } from './OrthogonalChildEdge';
import { buildTreeGraph } from './buildTreeGraph';
import { legacySideLayout } from './layouts/legacySideLayout';
import { generationColumnsLayout } from './layouts/generationColumnsLayout';
import {
  DEFAULT_EDGE_FILTERS,
  EdgeFilters,
  TREE_CONSTANTS,
  getDefaultViewMode,
} from './types';

interface FamilyTreeProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  onPersonClick?: (pessoa: Pessoa) => void;
  selectedPersonId?: string;
  edgeFilters?: EdgeFilters;
  viewMode?: TipoVisualizacaoArvore;
}

const edgeTypes: EdgeTypes = {
  orthogonalChild: OrthogonalChildEdge,
};

function getLayoutByViewMode(
  viewMode: TipoVisualizacaoArvore,
  graph: ReturnType<typeof buildTreeGraph>
) {
  if (viewMode === 'geracoes') {
    return generationColumnsLayout(graph);
  }

  return legacySideLayout(graph);
}

export function FamilyTree({
  pessoas,
  relacionamentos,
  onPersonClick,
  selectedPersonId,
  edgeFilters = DEFAULT_EDGE_FILTERS,
  viewMode = getDefaultViewMode(),
}: FamilyTreeProps) {
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const { NODE_WIDTH, NODE_HEIGHT } = TREE_CONSTANTS;

  const dataHash = useMemo(() => {
    return JSON.stringify({
      pessoasIds: pessoas.map((p) => p.id).sort(),
      relacionamentosIds: relacionamentos.map((r) => r.id).sort(),
      selectedPersonId,
      edgeFilters,
      viewMode,
    });
  }, [pessoas, relacionamentos, selectedPersonId, edgeFilters, viewMode]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const graph = buildTreeGraph({
      pessoas,
      relacionamentos,
      onPersonClick,
      selectedPersonId,
      edgeFilters,
    });

    return getLayoutByViewMode(viewMode, graph);
  }, [
    dataHash,
    pessoas,
    relacionamentos,
    onPersonClick,
    selectedPersonId,
    edgeFilters,
    viewMode,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.type === 'personNode' && node.data?.pessoa) {
          return {
            ...node,
            data: {
              ...node.data,
              onClick: onPersonClick,
              isSelected: node.data.pessoa.id === selectedPersonId,
            },
          };
        }
        return node;
      })
    );
  }, [selectedPersonId, onPersonClick, setNodes]);

  useEffect(() => {
    if (!selectedPersonId || !reactFlowRef.current || nodes.length === 0) return;

    const selectedNode = nodes.find((node) => node.id === selectedPersonId);
    if (!selectedNode) return;

    const width = selectedNode.type === 'marriageNode' ? 32 : NODE_WIDTH;
    const height = selectedNode.type === 'marriageNode' ? 32 : NODE_HEIGHT;

    const centerX = selectedNode.position.x + width / 2;
    const centerY = selectedNode.position.y + height / 2;

    const timer = window.setTimeout(() => {
      reactFlowRef.current?.setCenter(centerX, centerY, {
        zoom: 1.05,
        duration: 800,
      });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [selectedPersonId, nodes, NODE_WIDTH, NODE_HEIGHT]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.type === 'personNode' && onPersonClick && node.data?.pessoa) {
        onPersonClick(node.data.pessoa);
      }
    },
    [onPersonClick]
  );

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlowRef.current = instance;

      if (!selectedPersonId) {
        instance.fitView({
          padding: 0.2,
          includeHiddenNodes: false,
        });
      }
    },
    [selectedPersonId]
  );

  return (
    <div className="w-full h-full" style={{ width: '100%', height: '100%', minHeight: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onInit={handleInit}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const pessoa = node.data?.pessoa;
            if (pessoa?.id && pessoa.id === selectedPersonId) return '#1d4ed8';
            if (pessoa?.humano_ou_pet === 'Pet') return '#eab308';
            if (pessoa?.data_falecimento) return '#a855f7';
            if (node.type === 'marriageNode') return '#10b981';
            return '#3b82f6';
          }}
          maskColor="rgb(240, 240, 240, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}
