import React from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, NodeProps, useReactFlow, Node } from 'reactflow';
import { MarriageNodeData, MarriageNodeDetails } from './types';
import { ViewMarriageModal } from './modals/ViewMarriageModal';
import type { ConjugalRelationshipStatus } from '../../utils/conjugalRelationshipStatus';

const FALLBACK_MARRIAGE_NODE_SIZE = 60;
const FALLBACK_PERSON_NODE_WIDTH = 400;
const FALLBACK_PERSON_NODE_HEIGHT = 160;
const CONNECTOR_COLOR = 'var(--tree-palette-group-border, #CBD5E1)';

type MarriageNodeStatusData = MarriageNodeData & {
  status?: ConjugalRelationshipStatus;
  statusLabel?: string;
  statusDescription?: string;
};

const STATUS_NODE_META: Record<ConjugalRelationshipStatus, {
  symbol: string;
  borderColor: string;
  color: string;
  backgroundClass: string;
  ringClass: string;
}> = {
  active: {
    symbol: '♥',
    borderColor: 'var(--tree-palette-spouse, #A85F45)',
    color: '#A85F45',
    backgroundClass: 'bg-[#FBF8F1] hover:bg-[#F4EFE6]',
    ringClass: 'focus-visible:ring-[#A85F45]/40',
  },
  widowed: {
    symbol: '◌',
    borderColor: '#94A3B8',
    color: '#64748B',
    backgroundClass: 'bg-slate-50 hover:bg-slate-100',
    ringClass: 'focus-visible:ring-slate-400',
  },
  separated: {
    symbol: '∕',
    borderColor: '#D97706',
    color: '#B45309',
    backgroundClass: 'bg-amber-50 hover:bg-amber-100',
    ringClass: 'focus-visible:ring-amber-400',
  },
  divorced: {
    symbol: '×',
    borderColor: '#C2410C',
    color: '#9A3412',
    backgroundClass: 'bg-orange-50 hover:bg-orange-100',
    ringClass: 'focus-visible:ring-orange-400',
  },
  inactive: {
    symbol: '…',
    borderColor: '#94A3B8',
    color: '#64748B',
    backgroundClass: 'bg-gray-50 hover:bg-gray-100',
    ringClass: 'focus-visible:ring-gray-400',
  },
  historical: {
    symbol: '◇',
    borderColor: '#A8A29E',
    color: '#57534E',
    backgroundClass: 'bg-stone-50 hover:bg-stone-100',
    ringClass: 'focus-visible:ring-stone-400',
  },
};

function getNodeSize(node: Node) {
  const width = Number(node.data?.layoutWidth ?? node.data?.width);
  const height = Number(node.data?.layoutHeight ?? node.data?.height);

  if (node.type === 'marriageNode') {
    return {
      width: Number.isFinite(width) && width > 0 ? width : FALLBACK_MARRIAGE_NODE_SIZE,
      height: Number.isFinite(height) && height > 0 ? height : FALLBACK_MARRIAGE_NODE_SIZE,
    };
  }

  return {
    width: Number.isFinite(width) && width > 0 ? width : FALLBACK_PERSON_NODE_WIDTH,
    height: Number.isFinite(height) && height > 0 ? height : FALLBACK_PERSON_NODE_HEIGHT,
  };
}

function getNodeCenter(node: Node) {
  const size = getNodeSize(node);

  return {
    x: node.position.x + size.width / 2,
    y: node.position.y + size.height / 2,
  };
}

function inferMarriageDetailsFromNearestPeople(marriageNodeId: string, nodes: Node[]): MarriageNodeDetails | undefined {
  const marriageNode = nodes.find((node) => node.id === marriageNodeId);
  if (!marriageNode) return undefined;

  const marriageCenter = getNodeCenter(marriageNode);
  const nearestPeople = nodes
    .filter((node) => node.type === 'personNode' && node.data?.pessoa)
    .map((node) => {
      const center = getNodeCenter(node);
      const distance = Math.hypot(center.x - marriageCenter.x, center.y - marriageCenter.y);

      return { node, center, distance };
    })
    .sort((left, right) => left.distance - right.distance)
    .slice(0, 2)
    .sort((left, right) => left.center.x - right.center.x || left.center.y - right.center.y);

  if (nearestPeople.length < 2) return undefined;

  const [first, second] = nearestPeople;
  const firstPerson = first.node.data.pessoa;
  const secondPerson = second.node.data.pessoa;

  return {
    marriageKey: `${first.node.id}::${second.node.id}`,
    person1Id: firstPerson.id,
    person2Id: secondPerson.id,
    person1: firstPerson,
    person2: secondPerson,
  };
}

export const MarriageNode = React.memo(({ id, data }: NodeProps<MarriageNodeData>) => {
  const { getNodes } = useReactFlow();
  const statusData = data as MarriageNodeStatusData;
  const [localMarriageDetails, setLocalMarriageDetails] = React.useState<MarriageNodeDetails | null>(null);
  const isDirectFamilyVariant = data.visualVariant === 'direct-family';
  const isCompactParentMarriage =
    id === 'direct-parent-marriage-node' &&
    'layoutWidth' in data &&
    data.layoutWidth === 36;
  const status = statusData.status ?? 'active';
  const statusMeta = STATUS_NODE_META[status] ?? STATUS_NODE_META.active;
  const title = statusData.statusLabel
    ? `${statusData.statusLabel}. ${statusData.statusDescription ?? 'Ver vínculo do casal'}`
    : 'Ver vínculo do casal';
  const hiddenHandle = {
    width: 1,
    height: 1,
    opacity: 0,
    border: 'none',
    background: 'transparent',
  };

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const details = data.details ?? inferMarriageDetailsFromNearestPeople(id, getNodes());
      if (!details) return;

      if (data.onClickMarriage) {
        data.onClickMarriage(details);
        return;
      }

      setLocalMarriageDetails(details);
    },
    [data, getNodes, id]
  );

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        title={title}
        aria-label={title}
        className={[
          'nodrag nopan relative z-40 flex cursor-pointer items-center justify-center overflow-visible rounded-full text-sm font-bold leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          statusMeta.backgroundClass,
          statusMeta.ringClass,
          isCompactParentMarriage
            ? 'h-9 w-9 border-2 shadow-[0_0_0_3px_rgba(241,245,249,0.95),0_4px_10px_rgba(71,85,105,0.18)]'
            : isDirectFamilyVariant
            ? 'h-11 w-11 border-[3px] shadow-[0_0_0_3px_rgba(241,245,249,0.95),0_4px_10px_rgba(71,85,105,0.18)] hover:shadow-[0_0_0_4px_rgba(241,245,249,1),0_5px_12px_rgba(71,85,105,0.24)] md:h-[60px] md:w-[60px] md:shadow-[0_0_0_4px_rgba(241,245,249,0.95),0_5px_14px_rgba(71,85,105,0.22)]'
            : 'h-[60px] w-[60px] border-2 shadow-[0_3px_10px_rgba(71,85,105,0.18)] hover:shadow-[0_4px_12px_rgba(71,85,105,0.24)]',
        ].join(' ')}
        style={{
          borderColor: statusMeta.borderColor || CONNECTOR_COLOR,
          color: statusMeta.color || CONNECTOR_COLOR,
        }}
      >
        <Handle type="target" position={Position.Top} id="top" style={{ ...hiddenHandle, top: 0, left: '50%' }} />
        <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...hiddenHandle, bottom: 0, left: '50%' }} />
        <Handle type="source" position={Position.Right} id="right" style={{ ...hiddenHandle, right: 0, top: '50%' }} />
        <Handle type="target" position={Position.Left} id="left" style={{ ...hiddenHandle, left: 0, top: '50%' }} />
        <Handle
          type="source"
          position={Position.Right}
          id="family-center"
          style={{
            ...hiddenHandle,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <span aria-hidden="true" className={isCompactParentMarriage ? 'text-lg' : isDirectFamilyVariant ? 'text-xl md:text-3xl' : 'text-3xl'}>
          {data.emoji || statusMeta.symbol}
        </span>
      </button>

      {localMarriageDetails && typeof document !== 'undefined'
        ? createPortal(
            <ViewMarriageModal
              open
              marriage={localMarriageDetails}
              onClose={() => setLocalMarriageDetails(null)}
            />,
            document.body
          )
        : null}
    </>
  );
});

MarriageNode.displayName = 'MarriageNode';
