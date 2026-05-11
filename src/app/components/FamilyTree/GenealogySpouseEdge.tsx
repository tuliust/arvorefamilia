import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps } from 'reactflow';

export function GenealogySpouseEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}: EdgeProps) {
  const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  const markerX = sourceX + (targetX - sourceX) / 2;
  const markerY = sourceY + (targetY - sourceY) / 2;

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-none absolute flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-base shadow-sm"
          style={{
            transform: `translate(-50%, -50%) translate(${markerX}px, ${markerY}px)`,
          }}
          aria-hidden="true"
        >
          💍
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
