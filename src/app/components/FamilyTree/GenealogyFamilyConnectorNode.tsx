import React from 'react';
import { NodeProps } from 'reactflow';

import { DIRECT_FAMILY_TOKENS, FAMILY_TREE_COLORS } from './visualTokens';

export interface GenealogyFamilyConnectorNodeData {
  width: number;
  height: number;
  originX: number;
  originY: number;
  busX: number;
  childPoints: Array<{
    id: string;
    x: number;
    y: number;
  }>;
  parentChildHighlight?: boolean;
  siblingHighlight?: boolean;
}

export function GenealogyFamilyConnectorNode({
  data,
}: NodeProps<GenealogyFamilyConnectorNodeData>) {
  const ALIGNED_Y_TOLERANCE = 1;
  const childYs = data.childPoints.map((point) => point.y);
  const minChildY = childYs.length > 0 ? Math.min(...childYs) : data.originY;
  const maxChildY = childYs.length > 0 ? Math.max(...childYs) : data.originY;
  const verticalTopY = Math.min(data.originY, minChildY);
  const verticalBottomY = Math.max(data.originY, maxChildY);
  const singleChildPoint = data.childPoints.length === 1 ? data.childPoints[0] : null;
  const isSingleChildAligned = singleChildPoint
    ? Math.abs(data.originY - singleChildPoint.y) <= ALIGNED_Y_TOLERANCE
    : false;
  const baseStroke = data.parentChildHighlight
    ? FAMILY_TREE_COLORS.EDGE_CHILD
    : DIRECT_FAMILY_TOKENS.EDGE_STROKE;
  const baseStrokeWidth = data.parentChildHighlight
    ? 2.25
    : DIRECT_FAMILY_TOKENS.EDGE_STROKE_WIDTH;
  const siblingStroke = data.siblingHighlight
    ? FAMILY_TREE_COLORS.EDGE_SIBLING
    : baseStroke;
  const siblingStrokeWidth = data.siblingHighlight
    ? 2.25
    : baseStrokeWidth;
  const siblingStrokeDasharray = data.siblingHighlight ? '5,5' : undefined;

  return (
    <svg
      width={data.width}
      height={data.height}
      viewBox={`0 0 ${data.width} ${data.height}`}
      aria-hidden="true"
      className="pointer-events-none overflow-visible"
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <g
        fill="none"
        stroke={baseStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={baseStrokeWidth}
        opacity={DIRECT_FAMILY_TOKENS.EDGE_OPACITY}
      >
        {singleChildPoint && isSingleChildAligned ? (
          <line
            x1={data.originX}
            y1={data.originY}
            x2={singleChildPoint.x}
            y2={singleChildPoint.y}
          />
        ) : (
          <>
            <line x1={data.originX} y1={data.originY} x2={data.busX} y2={data.originY} />
            <line
              x1={data.busX}
              y1={verticalTopY}
              x2={data.busX}
              y2={verticalBottomY}
              stroke={siblingStroke}
              strokeWidth={siblingStrokeWidth}
              strokeDasharray={siblingStrokeDasharray}
            />
            {data.childPoints.map((point) => (
              <line key={point.id} x1={data.busX} y1={point.y} x2={point.x} y2={point.y} />
            ))}
          </>
        )}
      </g>
    </svg>
  );
}
