import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MarriageNodeData } from './types';
import { FAMILY_TREE_COLORS } from './visualTokens';

export const MarriageNode = React.memo(({ data }: NodeProps<MarriageNodeData>) => {
  const hiddenHandle = {
    width: 1,
    height: 1,
    opacity: 0,
    border: 'none',
    background: 'transparent',
  };

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      if (data.details && data.onClickMarriage) {
        data.onClickMarriage(data.details);
      }
    },
    [data]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      title="Visualizar informações do matrimônio"
      className="nodrag nopan relative z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 bg-white text-xl shadow-sm transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
      style={{ borderColor: FAMILY_TREE_COLORS.EDGE_SPOUSE }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ ...hiddenHandle, top: 0, left: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ ...hiddenHandle, bottom: 0, left: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ ...hiddenHandle, right: 0, top: '50%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ ...hiddenHandle, left: 0, top: '50%' }}
      />
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
      {data.emoji || '💑'}
    </button>
  );
});

MarriageNode.displayName = 'MarriageNode';
