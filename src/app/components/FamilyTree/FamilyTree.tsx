import React, { useMemo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ReactFlow, {
  EdgeTypes,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  Edge,
  Node,
  CoordinateExtent,
  Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Pessoa, Relacionamento } from '../../types';
import { nodeTypes } from './nodeTypes';
import { OrthogonalChildEdge } from './OrthogonalChildEdge';
import { GenealogySpouseEdge } from './GenealogySpouseEdge';
import { buildTreeGraph } from './buildTreeGraph';
import {
  collectDirectFamilyScopePersonIds,
  directFamilyDistributedLayout,
} from './layouts/directFamilyDistributedLayout';
import { filterGraphToPersonalScope } from './layouts/filterPersonalTreeScope';
import { genealogyColumnsLayout } from './layouts/genealogyColumnsLayout';
import type { TreeViewMode } from './ViewModeToggle';
import { TreeAreaSelectionOverlay } from './TreeAreaSelectionOverlay';
import {
  buildTreeExportFilename,
  captureElementToCanvas,
  downloadCanvasAsPng,
  exportCanvasAsPdf,
  openTreePrintWindow,
  printCanvas,
} from './utils/treeExport';
import {
  DEFAULT_EDGE_FILTERS,
  DEFAULT_DIRECT_RELATIVE_FILTERS,
  DEFAULT_GENEALOGY_FILTERS,
  DirectRelativeFilters,
  EdgeFilters,
  GenealogyFilters,
  TreeLayoutBounds,
  TREE_CONSTANTS,
  MarriageNodeDetails,
  TreeLayoutResult,
} from './types';
import { DIRECT_FAMILY_TOKENS } from './visualTokens';

interface FamilyTreeProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  onPersonClick?: (pessoa: Pessoa) => void;
  onPersonView?: (pessoa: Pessoa) => void;
  onPersonEdit?: (pessoa: Pessoa) => void;
  onPersonAddConnection?: (pessoa: Pessoa) => void;
  onPersonRemove?: (pessoa: Pessoa) => void;
  onMarriageClick?: (details: MarriageNodeDetails) => void;
  selectedPersonId?: string;
  edgeFilters?: EdgeFilters;
  directRelativeFilters?: DirectRelativeFilters;
  genealogyFilters?: GenealogyFilters;
  viewMode: TreeViewMode;
  centralPersonId?: string;
  isMobile?: boolean;
  layoutRevision?: number;
  showSidebarToggle?: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export interface FamilyTreeActions {
  zoomIn: () => void;
  zoomOut: () => void;
  print: () => Promise<void>;
  savePdf: () => Promise<void>;
  saveImage: () => Promise<void>;
  startAreaSelection: () => void;
}

const edgeTypes: EdgeTypes = {
  orthogonalChild: OrthogonalChildEdge,
  childEdge: OrthogonalChildEdge,
  siblingEdge: OrthogonalChildEdge,
  spouseEdge: OrthogonalChildEdge,
  genealogySpouseEdge: GenealogySpouseEdge,
};

const MARRIAGE_NODE_SIZE = TREE_CONSTANTS.MARRIAGE_NODE_WIDTH;
const DIRECT_FAMILY_MAX_ZOOM = 2;
const DIRECT_FAMILY_MOBILE_MAX_ZOOM = 1.5;
const DIRECT_FAMILY_FALLBACK_MIN_ZOOM = 0.01;
const DIRECT_FAMILY_MOBILE_FALLBACK_MIN_ZOOM = 0.01;
const DIRECT_FAMILY_VIEWPORT_PADDING = 18;
const DIRECT_FAMILY_MOBILE_VIEWPORT_PADDING = 16;
const DIRECT_FAMILY_TRANSLATE_PADDING = 120;
const DIRECT_FAMILY_MOBILE_TRANSLATE_PADDING = 80;
const GENEALOGY_MAX_ZOOM = 2;
const GENEALOGY_MOBILE_MAX_ZOOM = 1.7;
const GENEALOGY_TRANSLATE_PADDING = 220;
const GENEALOGY_MOBILE_TRANSLATE_PADDING = 140;
const TREE_TITLE_TOP = 12;
const TREE_TITLE_HEIGHT = 48;
const TREE_VIEWPORT_TOP_SAFE_AREA = 78;
const TREE_MOBILE_VIEWPORT_TOP_SAFE_AREA = 104;
const TREE_VIEWPORT_PADDING_X = 24;
const TREE_VIEWPORT_PADDING_Y = 24;
const TREE_MOBILE_VIEWPORT_PADDING_X = 22;
const TREE_MOBILE_VIEWPORT_PADDING_Y = 22;
const TREE_INITIAL_TECHNICAL_MIN_ZOOM = 0.01;
const TREE_PENDING_VIEWPORT_ZOOM = 0.35;
const TREE_DEBUG_BOUNDS_QUERY_PARAM = 'treeDebug';
const TREE_DEBUG_BOUNDS_STORAGE_KEY = 'treeDebugBounds';
const TREE_VIEWPORT_ZOOM_EPSILON = 0.0001;

type FlowBounds = TreeLayoutBounds;
type TreeViewportFitMode = 'contain' | 'width' | 'height';
type TreeViewportHorizontalAlign = 'center' | 'left';
type TreeViewportVerticalAlign = 'center' | 'top';
type LayoutNormalizationMode = 'direct-family' | 'genealogy-columns' | 'complete-genealogy-columns';

function getNodeRenderSize(node: Node, fallbackWidth: number, fallbackHeight: number) {
  const dataWidth = Number(node.data?.width);
  const dataHeight = Number(node.data?.height);

  if (node.type === 'directFamilyLabelNode') {
    return {
      width: Number.isFinite(dataWidth) && dataWidth > 0 ? dataWidth : 180,
      height: node.data?.variant === 'title' ? 64 : 30,
    };
  }

  if (node.type === 'directFamilyGroupBoxNode') {
    return {
      width: Number.isFinite(dataWidth) && dataWidth > 0 ? dataWidth : 0,
      height: Number.isFinite(dataHeight) && dataHeight > 0 ? dataHeight : 0,
    };
  }

  if (node.type === 'directFamilyLegendNode') {
    return {
      width: Number.isFinite(dataWidth) && dataWidth > 0 ? dataWidth : 760,
      height: Number.isFinite(dataHeight) && dataHeight > 0 ? dataHeight : 92,
    };
  }

  if (node.type === 'directFamilyAnchorNode') {
    return { width: 1, height: 1 };
  }

  if (node.type === 'genealogyFamilyConnectorNode') {
    return {
      width: Number.isFinite(dataWidth) && dataWidth > 0 ? dataWidth : 1,
      height: Number.isFinite(dataHeight) && dataHeight > 0 ? dataHeight : 1,
    };
  }

  if (node.type === 'marriageNode') {
    return { width: MARRIAGE_NODE_SIZE, height: MARRIAGE_NODE_SIZE };
  }

  if (node.data?.directRelation === 'central' && node.data?.useCentralDirectLayout !== false) {
    return {
      width: Number.isFinite(dataWidth) && dataWidth > 0 ? dataWidth : DIRECT_FAMILY_TOKENS.CENTRAL_WIDTH,
      height: Number.isFinite(dataHeight) && dataHeight > 0 ? dataHeight : DIRECT_FAMILY_TOKENS.CENTRAL_HEIGHT,
    };
  }

  if (node.data?.directRelation) {
    return {
      width: Number.isFinite(dataWidth) && dataWidth > 0 ? dataWidth : DIRECT_FAMILY_TOKENS.CARD_WIDTH,
      height: Number.isFinite(dataHeight) && dataHeight > 0 ? dataHeight : DIRECT_FAMILY_TOKENS.CARD_HEIGHT,
    };
  }

  if (node.type === 'personNode') {
    return {
      width: Number.isFinite(dataWidth) && dataWidth > 0 ? dataWidth : fallbackWidth,
      height: Number.isFinite(dataHeight) && dataHeight > 0 ? dataHeight : fallbackHeight,
    };
  }

  return { width: fallbackWidth, height: fallbackHeight };
}

function transformScalar(value: unknown, scale: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value * scale : value;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function constrainBoundsToViewport(bounds: FlowBounds, viewportBounds: FlowBounds): FlowBounds {
  const width = Math.min(bounds.width, viewportBounds.width);
  const height = Math.min(bounds.height, viewportBounds.height);

  return {
    x: clampNumber(bounds.x, viewportBounds.x, viewportBounds.x + viewportBounds.width - width),
    y: clampNumber(bounds.y, viewportBounds.y, viewportBounds.y + viewportBounds.height - height),
    width,
    height,
  };
}

function constrainDecorativeNodeToViewport(
  node: Node,
  viewportBounds: FlowBounds,
  fallbackWidth: number,
  fallbackHeight: number
) {
  if (node.type === 'personNode' || node.type === 'marriageNode' || node.type === 'genealogyFamilyConnectorNode') {
    return node;
  }

  const size = getNodeRenderSize(node, fallbackWidth, fallbackHeight);
  const constrainedBounds = constrainBoundsToViewport(
    {
      x: node.position.x,
      y: node.position.y,
      width: size.width,
      height: size.height,
    },
    viewportBounds
  );
  const nextData = { ...node.data };

  if (node.type === 'directFamilyGroupBoxNode' || node.type === 'directFamilyLegendNode') {
    nextData.width = constrainedBounds.width;
    nextData.height = constrainedBounds.height;
  } else if (node.type === 'directFamilyLabelNode') {
    nextData.width = constrainedBounds.width;
  }

  return {
    ...node,
    position: {
      x: constrainedBounds.x,
      y: constrainedBounds.y,
    },
    data: nextData,
  };
}

function constrainEdgeDataToViewport(edge: Edge, viewportBounds: FlowBounds) {
  if (!edge.data) return edge;

  const viewportRight = viewportBounds.x + viewportBounds.width;
  const viewportBottom = viewportBounds.y + viewportBounds.height;

  return {
    ...edge,
    data: {
      ...edge.data,
      elbowX: typeof edge.data.elbowX === 'number'
        ? clampNumber(edge.data.elbowX, viewportBounds.x, viewportRight)
        : edge.data.elbowX,
      elbowY: typeof edge.data.elbowY === 'number'
        ? clampNumber(edge.data.elbowY, viewportBounds.y, viewportBottom)
        : edge.data.elbowY,
    },
  };
}

function normalizeTreeLayoutByPersonBounds(
  layout: TreeLayoutResult,
  mode: LayoutNormalizationMode,
  fallbackWidth: number,
  fallbackHeight: number
): TreeLayoutResult {
  const targetBounds = layout.viewportBounds;
  if (!targetBounds) return layout;

  const personBounds = getViewportContentBounds(layout.nodes, fallbackWidth, fallbackHeight);
  const normalizationBounds = getLayoutNormalizationBounds(
    layout,
    mode,
    personBounds,
    fallbackWidth,
    fallbackHeight
  );

  if (!normalizationBounds) {
    return {
      ...layout,
      translateBounds: layout.translateBounds ?? targetBounds,
    };
  }

  const scaleX = targetBounds.width / Math.max(1, normalizationBounds.width);
  const scaleY = mode === 'direct-family'
    ? targetBounds.height / Math.max(1, normalizationBounds.height)
    : scaleX;
  const translateX = targetBounds.x - normalizationBounds.x * scaleX;
  const translateY = targetBounds.y - normalizationBounds.y * scaleY;
  const transformX = (value: number) => value * scaleX + translateX;
  const transformY = (value: number) => value * scaleY + translateY;

  const scaledNodes = layout.nodes.map((node) => {
    const size = getNodeRenderSize(node, fallbackWidth, fallbackHeight);
    const nextData = { ...node.data };

    if (node.type === 'personNode') {
      nextData.width = size.width * scaleX;
      nextData.height = size.height * scaleY;
      nextData.layoutWidth = size.width * scaleX;
      nextData.layoutHeight = size.height * scaleY;
    } else {
      if (typeof nextData.width === 'number') nextData.width = nextData.width * scaleX;
      if (typeof nextData.height === 'number') nextData.height = nextData.height * scaleY;
    }

    if (node.type === 'genealogyFamilyConnectorNode') {
      nextData.originX = transformScalar(nextData.originX, scaleX);
      nextData.originY = transformScalar(nextData.originY, scaleY);
      nextData.busX = transformScalar(nextData.busX, scaleX);
      if (Array.isArray(nextData.childPoints)) {
        nextData.childPoints = nextData.childPoints.map((point: { id: string; x: number; y: number }) => ({
          ...point,
          x: point.x * scaleX,
          y: point.y * scaleY,
        }));
      }
    }

    return {
      ...node,
      position: {
        x: transformX(node.position.x),
        y: transformY(node.position.y),
      },
      data: nextData,
    };
  });

  const scaledEdges = layout.edges.map((edge) => ({
    ...edge,
    data: edge.data
      ? {
          ...edge.data,
          elbowX: typeof edge.data.elbowX === 'number' ? transformX(edge.data.elbowX) : edge.data.elbowX,
          elbowY: typeof edge.data.elbowY === 'number' ? transformY(edge.data.elbowY) : edge.data.elbowY,
        }
      : edge.data,
  }));

  const normalizedNodes = mode === 'direct-family'
    ? scaledNodes.map((node) => constrainDecorativeNodeToViewport(node, targetBounds, fallbackWidth, fallbackHeight))
    : scaledNodes;
  const normalizedEdges = mode === 'direct-family'
    ? scaledEdges.map((edge) => constrainEdgeDataToViewport(edge, targetBounds))
    : scaledEdges;
  const finalPersonBounds = getViewportContentBounds(normalizedNodes, fallbackWidth, fallbackHeight);
  const finalFlowBounds = getFlowBounds(normalizedNodes, fallbackWidth, fallbackHeight);
  const finalTranslateContentBounds = getTranslateBounds(normalizedNodes, fallbackWidth, fallbackHeight)
    ?? finalFlowBounds
    ?? finalPersonBounds
    ?? targetBounds;
  const minX = Math.min(targetBounds.x, finalTranslateContentBounds.x);
  const minY = Math.min(targetBounds.y, finalTranslateContentBounds.y);
  const maxX = Math.max(targetBounds.x + targetBounds.width, finalTranslateContentBounds.x + finalTranslateContentBounds.width);
  const maxY = Math.max(targetBounds.y + targetBounds.height, finalTranslateContentBounds.y + finalTranslateContentBounds.height);

  return {
    ...layout,
    nodes: normalizedNodes,
    edges: normalizedEdges,
    viewportBounds: targetBounds,
    translateBounds: {
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
    },
  };
}

function getLayoutNormalizationBounds(
  layout: TreeLayoutResult,
  mode: LayoutNormalizationMode,
  personBounds: FlowBounds | null,
  fallbackWidth: number,
  fallbackHeight: number
): FlowBounds | null {
  if (mode === 'genealogy-columns') {
    return layout.viewportBounds ?? personBounds;
  }

  if (!personBounds) return null;

  const directFamilyGroupBounds = getBoundsForNodes(
    layout.nodes.filter((node) => {
      if (node.hidden) return false;
      if (node.type === 'personNode') return true;
      if (node.type === 'directFamilyGroupBoxNode') return true;
      return node.type === 'directFamilyLabelNode' && node.data?.variant !== 'title';
    }),
    fallbackWidth,
    fallbackHeight
  );

  if (!directFamilyGroupBounds) return personBounds;

  const minY = Math.min(personBounds.y, directFamilyGroupBounds.y);
  const maxY = Math.max(
    personBounds.y + personBounds.height,
    directFamilyGroupBounds.y + directFamilyGroupBounds.height
  );

  return {
    x: personBounds.x,
    y: minY,
    width: personBounds.width,
    height: Math.max(1, maxY - minY),
  };
}

function getFlowBounds(nodes: Node[], fallbackWidth: number, fallbackHeight: number): FlowBounds | null {
  return getBoundsForNodes(
    nodes.filter((node) => {
      if (node.hidden) return false;
      if (node.type === 'directFamilyAnchorNode') return false;
      if (node.type === 'directFamilyLabelNode' && node.data?.variant === 'title') return false;
      return true;
    }),
    fallbackWidth,
    fallbackHeight
  );
}

function getBoundsForNodes(nodes: Node[], fallbackWidth: number, fallbackHeight: number): FlowBounds | null {
  const visibleNodes = nodes.filter((node) => !node.hidden);
  if (visibleNodes.length === 0) return null;

  const bounds = visibleNodes.reduce(
    (acc, node) => {
      const { width, height } = getNodeRenderSize(node, fallbackWidth, fallbackHeight);
      const minX = node.position.x;
      const minY = node.position.y;
      const maxX = node.position.x + width;
      const maxY = node.position.y + height;

      return {
        minX: Math.min(acc.minX, minX),
        minY: Math.min(acc.minY, minY),
        maxX: Math.max(acc.maxX, maxX),
        maxY: Math.max(acc.maxY, maxY),
      };
    },
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    }
  );

  if (
    !Number.isFinite(bounds.minX) ||
    !Number.isFinite(bounds.minY) ||
    !Number.isFinite(bounds.maxX) ||
    !Number.isFinite(bounds.maxY)
  ) {
    return null;
  }

  return {
    x: bounds.minX,
    y: bounds.minY,
    width: Math.max(1, bounds.maxX - bounds.minX),
    height: Math.max(1, bounds.maxY - bounds.minY),
  };
}

function getViewportContentBounds(nodes: Node[], fallbackWidth: number, fallbackHeight: number): FlowBounds | null {
  return getBoundsForNodes(
    nodes.filter((node) => {
      if (node.hidden) return false;
      return node.type === 'personNode';
    }),
    fallbackWidth,
    fallbackHeight
  );
}

function getTranslateBounds(nodes: Node[], fallbackWidth: number, fallbackHeight: number): FlowBounds | null {
  return getBoundsForNodes(
    nodes.filter((node) => {
      if (node.hidden) return false;
      if (node.type === 'directFamilyLabelNode' && node.data?.variant === 'title') return false;
      if (node.type === 'directFamilyAnchorNode') return false;
      return true;
    }),
    fallbackWidth,
    fallbackHeight
  );
}

function getNormalizedTreeViewport({
  bounds,
  containerWidth,
  containerHeight,
  paddingX,
  paddingY,
  titleSafeArea,
  maxZoom,
  fitMode,
  horizontalAlign = 'center',
  verticalAlign = 'center',
}: {
  bounds: FlowBounds;
  containerWidth: number;
  containerHeight: number;
  paddingX: number;
  paddingY: number;
  titleSafeArea: number;
  maxZoom: number;
  fitMode: TreeViewportFitMode;
  horizontalAlign?: TreeViewportHorizontalAlign;
  verticalAlign?: TreeViewportVerticalAlign;
}): Viewport {
  const availableWidth = Math.max(1, containerWidth - paddingX * 2);
  const availableHeight = Math.max(1, containerHeight - titleSafeArea - paddingY * 2);
  const zoomX = availableWidth / Math.max(1, bounds.width);
  const zoomY = availableHeight / Math.max(1, bounds.height);
  const fitZoom = fitMode === 'contain'
    ? Math.min(zoomX, zoomY)
    : fitMode === 'height'
      ? zoomY
      : zoomX;
  const zoom = Math.min(1, maxZoom, Math.max(TREE_INITIAL_TECHNICAL_MIN_ZOOM, fitZoom));
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  return {
    x: horizontalAlign === 'left'
      ? paddingX - bounds.x * zoom
      : containerWidth / 2 - centerX * zoom,
    y: verticalAlign === 'top'
      ? titleSafeArea + paddingY - bounds.y * zoom
      : titleSafeArea + paddingY + availableHeight / 2 - centerY * zoom,
    zoom,
  };
}

function getDirectFamilyTranslateExtent(bounds: FlowBounds, padding: number): CoordinateExtent {
  return [
    [bounds.x - padding, bounds.y - padding],
    [bounds.x + bounds.width + padding, bounds.y + bounds.height + padding],
  ];
}

function isTreeDebugBoundsEnabled() {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get(TREE_DEBUG_BOUNDS_QUERY_PARAM);

  if (queryValue === '1' || queryValue === 'true') return true;
  if (queryValue === '0' || queryValue === 'false') return false;

  return window.localStorage.getItem(TREE_DEBUG_BOUNDS_STORAGE_KEY) === '1';
}

function formatDebugNumber(value: number) {
  return Number.isFinite(value) ? Math.round(value) : value;
}

function createDebugBoundsNode({
  id,
  label,
  bounds,
  borderColor,
  backgroundColor,
  textColor,
  labelOffset,
}: {
  id: string;
  label: string;
  bounds: FlowBounds;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  labelOffset: number;
}): Node {
  return {
    id: `tree-debug-${id}`,
    type: 'default',
    position: {
      x: bounds.x,
      y: bounds.y,
    },
    data: {
      label: `${label} | x:${formatDebugNumber(bounds.x)} y:${formatDebugNumber(bounds.y)} w:${formatDebugNumber(bounds.width)} h:${formatDebugNumber(bounds.height)}`,
    },
    draggable: false,
    selectable: false,
    connectable: false,
    focusable: false,
    style: {
      width: bounds.width,
      height: bounds.height,
      border: `4px dashed ${borderColor}`,
      background: backgroundColor,
      color: textColor,
      fontSize: 18,
      fontWeight: 800,
      lineHeight: 1.15,
      opacity: 0.95,
      pointerEvents: 'none',
      padding: 8,
      borderRadius: 0,
      transform: `translateY(${labelOffset}px)`,
      zIndex: 1,
    },
  };
}

function getExportableFlowElement(container: HTMLDivElement | null) {
  return container?.querySelector('.react-flow') as HTMLElement | null;
}

async function captureVisibleTree(container: HTMLDivElement | null) {
  const element = getExportableFlowElement(container);
  if (!element) {
    throw new Error('Área da árvore não encontrada para exportação.');
  }

  return captureElementToCanvas(element);
}

async function printVisibleTree(container: HTMLDivElement | null) {
  const printWindow = openTreePrintWindow();

  try {
    const canvas = await captureVisibleTree(container);
    printCanvas(canvas, 'Imprimir árvore', printWindow);
  } catch (error) {
    if (!printWindow.closed) {
      printWindow.close();
    }

    throw error;
  }
}

async function saveVisibleTreePdf(container: HTMLDivElement | null) {
  const canvas = await captureVisibleTree(container);
  await exportCanvasAsPdf(
    canvas,
    buildTreeExportFilename('minha-arvore', 'pdf'),
    'Árvore genealógica'
  );
}

async function saveVisibleTreeImage(container: HTMLDivElement | null, viewMode: TreeViewMode) {
  const canvas = await captureVisibleTree(container);
  downloadCanvasAsPng(
    canvas,
    buildTreeExportFilename(
      viewMode === 'minha-arvore' ? 'minha-arvore' : 'arvore-genealogica',
      'png'
    )
  );
}

function usesGenealogyLayout(viewMode: TreeViewMode) {
  return viewMode === 'genealogia' || viewMode === 'visao-completa';
}

function getTreeTitleFirstName(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return 'Família';
  return clean.split(/\s+/)[0] || clean;
}

function FamilyTreeComponent({
  pessoas,
  relacionamentos,
  onPersonClick,
  onPersonView,
  onPersonEdit,
  onPersonAddConnection,
  onPersonRemove,
  onMarriageClick,
  selectedPersonId,
  edgeFilters = DEFAULT_EDGE_FILTERS,
  directRelativeFilters = DEFAULT_DIRECT_RELATIVE_FILTERS,
  genealogyFilters = DEFAULT_GENEALOGY_FILTERS,
  viewMode,
  centralPersonId,
  isMobile = false,
  layoutRevision = 0,
  showSidebarToggle = false,
  sidebarOpen = false,
  onToggleSidebar,
}: FamilyTreeProps, ref: React.ForwardedRef<FamilyTreeActions>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const [reactFlowReady, setReactFlowReady] = useState(false);
  const [hasAppliedInitialViewport, setHasAppliedInitialViewport] = useState(false);
  const [directFamilyCurrentZoom, setDirectFamilyCurrentZoom] = useState<number | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isAreaSelectionOpen, setIsAreaSelectionOpen] = useState(false);
  const { NODE_WIDTH, NODE_HEIGHT } = TREE_CONSTANTS;
  const directFamilyFallbackMinZoom = isMobile ? DIRECT_FAMILY_MOBILE_FALLBACK_MIN_ZOOM : DIRECT_FAMILY_FALLBACK_MIN_ZOOM;
  const directFamilyMaxZoom = isMobile ? DIRECT_FAMILY_MOBILE_MAX_ZOOM : DIRECT_FAMILY_MAX_ZOOM;
  const isGenealogyLayout = usesGenealogyLayout(viewMode);
  const activeMaxZoom = isGenealogyLayout
    ? (isMobile ? GENEALOGY_MOBILE_MAX_ZOOM : GENEALOGY_MAX_ZOOM)
    : directFamilyMaxZoom;
  const activeCanPan = true;
  const effectiveCentralPersonId = centralPersonId || selectedPersonId || pessoas[0]?.id;
  const treeTitleFirstName = useMemo(() => {
    const centralPerson = pessoas.find((pessoa) => pessoa.id === effectiveCentralPersonId);
    return getTreeTitleFirstName(centralPerson?.nome_completo);
  }, [effectiveCentralPersonId, pessoas]);
  const treeTitle = useMemo(() => {
    if (viewMode === 'minha-arvore') {
      return `A árvore de ${treeTitleFirstName}`;
    }

    if (viewMode === 'genealogia') {
      return `Família de ${treeTitleFirstName}`;
    }

    return `Linha Genealógica de ${treeTitleFirstName}`;
  }, [treeTitleFirstName, viewMode]);

  const dataHash = useMemo(() => {
    return JSON.stringify({
      pessoasIds: pessoas.map((p) => p.id).sort(),
      relacionamentosIds: relacionamentos.map((r) => r.id).sort(),
      selectedPersonId,
      edgeFilters,
      directRelativeFilters,
      genealogyFilters,
      centralPersonId: effectiveCentralPersonId,
      isMobile,
      viewMode,
    });
  }, [pessoas, relacionamentos, selectedPersonId, edgeFilters, directRelativeFilters, genealogyFilters, effectiveCentralPersonId, isMobile, viewMode]);

  const rawLayoutResult = useMemo(() => {
    const graph = buildTreeGraph({
      pessoas,
      relacionamentos,
      onPersonClick,
      onMarriageClick,
      onView: onPersonView,
      onEdit: onPersonEdit,
      onAddConnection: onPersonAddConnection,
      onRemove: onPersonRemove,
      selectedPersonId,
      edgeFilters,
    });

    const personalScopeGraph = viewMode === 'visao-completa'
      ? graph
      : filterGraphToPersonalScope(
          graph,
          collectDirectFamilyScopePersonIds(graph, {
            centralPersonId: effectiveCentralPersonId,
          })
        );
    const layoutGraph = viewMode === 'visao-completa' ? graph : personalScopeGraph;

    if (isGenealogyLayout) {
      return genealogyColumnsLayout(layoutGraph, {
        filters: genealogyFilters,
        onMarriageClick,
        hideUngenerated: viewMode === 'visao-completa',
      });
    }

    return directFamilyDistributedLayout(layoutGraph, {
      centralPersonId: effectiveCentralPersonId,
      filters: directRelativeFilters,
      isMobile,
    });
  }, [
    dataHash,
    pessoas,
    relacionamentos,
    onPersonClick,
    onMarriageClick,
    onPersonView,
    onPersonEdit,
    onPersonAddConnection,
    onPersonRemove,
    selectedPersonId,
    edgeFilters,
    directRelativeFilters,
    genealogyFilters,
    effectiveCentralPersonId,
    isGenealogyLayout,
    viewMode,
  ]);

  const layoutResult = useMemo(() => {
    return normalizeTreeLayoutByPersonBounds(
      rawLayoutResult,
      viewMode === 'genealogia'
        ? 'genealogy-columns'
        : viewMode === 'visao-completa'
          ? 'complete-genealogy-columns'
          : 'direct-family',
      NODE_WIDTH,
      NODE_HEIGHT
    );
  }, [rawLayoutResult, viewMode, NODE_WIDTH, NODE_HEIGHT]);

  const debugBoundsEnabled = useMemo(() => isTreeDebugBoundsEnabled(), []);

  const debugBoundsNodes = useMemo<Node[]>(() => {
    if (!debugBoundsEnabled) return [];

    const cardsBounds = getViewportContentBounds(layoutResult.nodes, NODE_WIDTH, NODE_HEIGHT);
    const renderedContentBounds = getFlowBounds(layoutResult.nodes, NODE_WIDTH, NODE_HEIGHT);
    const logicalViewportBounds = layoutResult.viewportBounds ?? cardsBounds ?? renderedContentBounds;

    const debugNodes: Node[] = [];

    if (logicalViewportBounds) {
      debugNodes.push(createDebugBoundsNode({
        id: `${viewMode}-logical-viewport`,
        label: 'GRADE LÓGICA / VIEWPORT BOUNDS',
        bounds: logicalViewportBounds,
        borderColor: 'rgba(245, 158, 11, 0.95)',
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        textColor: '#92400e',
        labelOffset: 0,
      }));
    }

    if (renderedContentBounds) {
      debugNodes.push(createDebugBoundsNode({
        id: `${viewMode}-rendered-content`,
        label: 'CONTEÚDO RENDERIZADO / FLOW BOUNDS',
        bounds: renderedContentBounds,
        borderColor: 'rgba(59, 130, 246, 0.95)',
        backgroundColor: 'rgba(59, 130, 246, 0.06)',
        textColor: '#1d4ed8',
        labelOffset: 34,
      }));
    }

    if (cardsBounds) {
      debugNodes.push(createDebugBoundsNode({
        id: `${viewMode}-cards`,
        label: 'CARDS / PERSON NODES',
        bounds: cardsBounds,
        borderColor: 'rgba(236, 72, 153, 0.95)',
        backgroundColor: 'rgba(236, 72, 153, 0.06)',
        textColor: '#be185d',
        labelOffset: 68,
      }));
    }

    return debugNodes;
  }, [
    debugBoundsEnabled,
    layoutResult.nodes,
    layoutResult.viewportBounds,
    NODE_WIDTH,
    NODE_HEIGHT,
    viewMode,
  ]);

  const initialNodes = debugBoundsEnabled
    ? [...layoutResult.nodes, ...debugBoundsNodes]
    : layoutResult.nodes;
  const initialEdges = layoutResult.edges;
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateContainerSize = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize((currentSize) => {
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);

        if (currentSize.width === width && currentSize.height === height) {
          return currentSize;
        }

        return { width, height };
      });
    };

    updateContainerSize();

    const resizeObserver = new ResizeObserver(updateContainerSize);
    resizeObserver.observe(container);

    window.addEventListener('resize', updateContainerSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateContainerSize);
    };
  }, []);

  const viewportContentBounds = useMemo(() => {
    return layoutResult.viewportBounds
      ?? getViewportContentBounds(nodes, NODE_WIDTH, NODE_HEIGHT)
      ?? getFlowBounds(nodes, NODE_WIDTH, NODE_HEIGHT);
  }, [layoutResult.viewportBounds, nodes, NODE_WIDTH, NODE_HEIGHT]);

  const translateBounds = useMemo(() => {
    return layoutResult.translateBounds
      ?? getTranslateBounds(nodes, NODE_WIDTH, NODE_HEIGHT)
      ?? viewportContentBounds;
  }, [layoutResult.translateBounds, nodes, NODE_WIDTH, NODE_HEIGHT, viewportContentBounds]);

  const directFamilyViewport = useMemo(() => {
    if (
      !viewportContentBounds ||
      containerSize.width <= 0 ||
      containerSize.height <= 0
    ) {
      return null;
    }

    return getNormalizedTreeViewport({
      bounds: viewportContentBounds,
      containerWidth: containerSize.width,
      containerHeight: containerSize.height,
      paddingX: isMobile ? TREE_MOBILE_VIEWPORT_PADDING_X : TREE_VIEWPORT_PADDING_X,
      paddingY: isMobile ? TREE_MOBILE_VIEWPORT_PADDING_Y : TREE_VIEWPORT_PADDING_Y,
      titleSafeArea: isMobile ? TREE_MOBILE_VIEWPORT_TOP_SAFE_AREA : TREE_VIEWPORT_TOP_SAFE_AREA,
      maxZoom: isMobile
        ? (isGenealogyLayout ? GENEALOGY_MOBILE_MAX_ZOOM : DIRECT_FAMILY_MOBILE_MAX_ZOOM)
        : (isGenealogyLayout ? GENEALOGY_MAX_ZOOM : DIRECT_FAMILY_MAX_ZOOM),
      fitMode: isGenealogyLayout
        ? (isMobile ? 'height' : 'width')
        : 'contain',
      horizontalAlign: isMobile && isGenealogyLayout ? 'left' : 'center',
      verticalAlign: !isMobile && isGenealogyLayout ? 'top' : 'center',
    });
  }, [viewportContentBounds, containerSize, isGenealogyLayout, isMobile]);

  const directFamilyTranslateExtent = useMemo<CoordinateExtent | undefined>(() => {
    if (!translateBounds) return undefined;

    return getDirectFamilyTranslateExtent(
      translateBounds,
      isGenealogyLayout
        ? (isMobile ? GENEALOGY_MOBILE_TRANSLATE_PADDING : GENEALOGY_TRANSLATE_PADDING)
        : (isMobile ? DIRECT_FAMILY_MOBILE_TRANSLATE_PADDING : DIRECT_FAMILY_TRANSLATE_PADDING)
    );
  }, [translateBounds, isGenealogyLayout, isMobile]);
  const activeMinZoom = directFamilyViewport?.zoom ?? directFamilyFallbackMinZoom;

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.type === 'personNode' && node.data?.pessoa) {
          return {
            ...node,
            data: {
              ...node.data,
              onClick: onPersonClick,
              onView: onPersonView,
              onEdit: onPersonEdit,
              onAddConnection: onPersonAddConnection,
              onRemove: onPersonRemove,
              isSelected: viewMode === 'minha-arvore' && node.data.pessoa.id === selectedPersonId,
              isCentralPerson: viewMode === 'minha-arvore' && node.data.pessoa.id === effectiveCentralPersonId,
            },
          };
        }

        if (node.type === 'marriageNode') {
          return {
            ...node,
            data: {
              ...node.data,
              onClickMarriage: onMarriageClick,
            },
          };
        }

        return node;
      })
    );
  }, [
    selectedPersonId,
    onPersonClick,
    onPersonView,
    onPersonEdit,
    onPersonAddConnection,
    onPersonRemove,
    onMarriageClick,
    effectiveCentralPersonId,
    viewMode,
    setNodes,
  ]);

  useEffect(() => {
    if (!reactFlowReady || !reactFlowRef.current || containerSize.width <= 0 || containerSize.height <= 0) return;
    if (!directFamilyViewport) return;

    setDirectFamilyCurrentZoom(directFamilyViewport.zoom);
    reactFlowRef.current.setViewport(directFamilyViewport, {
      duration: hasAppliedInitialViewport ? 180 : 0,
    });
    setHasAppliedInitialViewport(true);
  }, [
    reactFlowReady,
    hasAppliedInitialViewport,
    layoutRevision,
    containerSize.width,
    containerSize.height,
    directFamilyViewport,
    viewMode,
  ]);

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlowRef.current = instance;
      setReactFlowReady(true);
    },
    []
  );

  const handleMove = useCallback(
    (_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
      setDirectFamilyCurrentZoom(viewport.zoom);
    },
    []
  );

  const handleMoveEnd = useCallback(
    (_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
      setDirectFamilyCurrentZoom(viewport.zoom);
    },
    []
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.type !== 'personNode' || !node.data?.pessoa) return;
      onPersonClick?.(node.data.pessoa);
    },
    [onPersonClick]
  );

  const isAtMinZoom = directFamilyCurrentZoom !== null
    ? directFamilyCurrentZoom <= activeMinZoom + TREE_VIEWPORT_ZOOM_EPSILON
    : false;

  const handleZoomIn = useCallback(() => {
    reactFlowRef.current?.zoomIn({ duration: 160 });
  }, []);

  const handleZoomOut = useCallback(() => {
    const instance = reactFlowRef.current;
    if (!instance) return;

    const viewport = instance.getViewport();
    if (viewport.zoom <= activeMinZoom + TREE_VIEWPORT_ZOOM_EPSILON) return;

    instance.zoomOut({ duration: 160 });
  }, [activeMinZoom]);

  const handlePrint = useCallback(async () => {
    try {
      await printVisibleTree(containerRef.current);
    } catch (error) {
      console.error('Erro ao imprimir árvore:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível imprimir a árvore.');
    }
  }, []);

  const handleSavePdf = useCallback(async () => {
    try {
      await saveVisibleTreePdf(containerRef.current);
    } catch (error) {
      console.error('Erro ao exportar árvore:', error);
      toast.error('Não foi possível gerar o PDF. As cores da árvore foram ajustadas para exportação; tente novamente.');
    }
  }, []);

  const handleSaveImage = useCallback(async () => {
    try {
      await saveVisibleTreeImage(containerRef.current, viewMode);
    } catch (error) {
      console.error('Erro ao exportar imagem da árvore:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar a imagem da árvore.');
    }
  }, [viewMode]);

  const handleStartAreaSelection = useCallback(() => {
    if (!getExportableFlowElement(containerRef.current)) {
      toast.error('Área da árvore não encontrada para seleção.');
      return;
    }

    setIsAreaSelectionOpen(true);
  }, []);

  const handleCloseAreaSelection = useCallback(() => {
    setIsAreaSelectionOpen(false);
  }, []);

  useImperativeHandle(ref, () => ({
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    print: handlePrint,
    savePdf: handleSavePdf,
    saveImage: handleSaveImage,
    startAreaSelection: handleStartAreaSelection,
  }), [handleZoomIn, handleZoomOut, handlePrint, handleSavePdf, handleSaveImage, handleStartAreaSelection]);

  return (
    <div
      ref={containerRef}
      data-export-root="family-tree"
      data-export-view={viewMode}
      className={[
        'family-tree-export-root',
        'relative h-full w-full overflow-hidden',
        'bg-slate-50',
      ].join(' ')}
      style={{ width: '100%', height: '100%', minHeight: '500px' }}
    >
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        {showSidebarToggle && onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            title={sidebarOpen ? 'Recolher painel' : 'Expandir painel'}
            aria-label={sidebarOpen ? 'Recolher painel' : 'Expandir painel'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}

        <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-9 w-9 items-center justify-center border-r border-gray-200 text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            title="Aumentar zoom"
            aria-label="Aumentar zoom"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={isAtMinZoom}
            className={[
              'flex h-9 w-9 items-center justify-center text-gray-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              isAtMinZoom ? 'cursor-not-allowed opacity-45' : 'hover:bg-gray-50',
            ].join(' ')}
            title={isAtMinZoom ? 'Zoom mínimo' : 'Diminuir zoom'}
            aria-label="Diminuir zoom"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>


      <div
        className="pointer-events-none absolute inset-x-0 z-10 text-center"
        style={{ top: TREE_TITLE_TOP, height: TREE_TITLE_HEIGHT }}
      >
        <h2 className="text-lg font-extrabold leading-tight text-slate-900 sm:text-xl">
          {treeTitle}
        </h2>
        <p className="mt-1 text-xs font-semibold leading-tight text-slate-600 sm:text-sm">
          Use zoom, arraste a árvore e clique nas pessoas para abrir detalhes.
        </p>
      </div>


      {debugBoundsEnabled && (
        <div className="pointer-events-none absolute inset-0 z-30 border-4 border-dashed border-red-500/80 bg-red-500/[0.02]">
          <div className="absolute right-4 top-4 max-w-[360px] rounded-lg border border-red-300 bg-white/95 px-3 py-2 text-left text-xs font-semibold text-red-700 shadow-lg">
            <div>DEBUG TREE BOUNDS</div>
            <div>Vermelho: área total visível do componente</div>
            <div>Amarelo: grade lógica / viewportBounds</div>
            <div>Azul: conteúdo renderizado / flowBounds</div>
            <div>Rosa: área preenchida por cards / personNodes</div>
            <div>View atual: {viewMode}</div>
            <div>Container: {containerSize.width}px × {containerSize.height}px</div>
            <div>Zoom inicial: {directFamilyViewport?.zoom.toFixed(6) ?? 'pendente'}</div>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onInit={handleInit}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={activeMinZoom}
        maxZoom={activeMaxZoom}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={!isAreaSelectionOpen && activeCanPan}
        panOnScroll={!isAreaSelectionOpen && activeCanPan}
        zoomOnScroll={!isAreaSelectionOpen}
        zoomOnPinch={!isAreaSelectionOpen}
        translateExtent={directFamilyTranslateExtent}
        preventScrolling
        defaultViewport={{
          x: directFamilyViewport?.x ?? 0,
          y: directFamilyViewport?.y ?? 0,
          zoom: directFamilyViewport?.zoom ?? TREE_PENDING_VIEWPORT_ZOOM,
        }}
        style={{ visibility: hasAppliedInitialViewport ? 'visible' : 'hidden' }}
        proOptions={{ hideAttribution: true }}
      />
      {isAreaSelectionOpen && (
        <TreeAreaSelectionOverlay
          getTargetElement={() => getExportableFlowElement(containerRef.current)}
          filenameLabel={
            viewMode === 'minha-arvore'
              ? 'minha-arvore'
              : viewMode === 'genealogia'
                ? 'genealogia'
                : 'visao-completa'
          }
          title="Área selecionada da árvore"
          onClose={handleCloseAreaSelection}
        />
      )}
    </div>
  );
}

export const FamilyTree = React.forwardRef<FamilyTreeActions, FamilyTreeProps>(FamilyTreeComponent);
