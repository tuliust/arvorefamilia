import React from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, NodeProps, useReactFlow, Node } from 'reactflow';
import { Blend } from 'lucide-react';
import { MarriageNodeData, MarriageNodeDetails } from './types';
import { FAMILY_TREE_COLORS } from './visualTokens';
import { ViewMarriageModal } from './modals/ViewMarriageModal';

const FALLBACK_MARRIAGE_NODE_SIZE = 60;
const FALLBACK_PERSON_NODE_WIDTH = 400;
const FALLBACK_PERSON_NODE_HEIGHT = 160;

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
  const [localMarriageDetails, setLocalMarriageDetails] = React.useState<MarriageNodeDetails | null>(null);
  const isDirectFamilyVariant = data.visualVariant === 'direct-family';
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
        title="Ver vínculo do casal"
        aria-label="Ver vínculo do casal"
        className={[
          'nodrag nopan relative z-40 flex h-[60px] w-[60px] cursor-pointer items-center justify-center overflow-visible rounded-full text-sm leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2',
          isDirectFamilyVariant
            ? 'border-[3px] bg-white text-orange-700 shadow-[0_0_0_4px_rgba(255,237,213,0.9),0_5px_14px_rgba(194,65,12,0.34)] hover:bg-orange-50 hover:text-orange-800 hover:shadow-[0_0_0_5px_rgba(255,237,213,0.95),0_6px_16px_rgba(194,65,12,0.42)]'
            : 'border-2 bg-orange-50 text-orange-700 shadow-[0_3px_10px_rgba(234,88,12,0.22)] hover:bg-orange-100 hover:text-orange-800 hover:shadow-[0_4px_12px_rgba(234,88,12,0.3)]',
        ].join(' ')}
        style={{ borderColor: FAMILY_TREE_COLORS.EDGE_SPOUSE }}
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
        <Blend
          className={isDirectFamilyVariant ? 'h-9 w-9 stroke-[3]' : 'h-8 w-8 stroke-[2.8]'}
          aria-hidden="true"
        />
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
