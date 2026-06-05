import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps } from 'reactflow';
import type { GenealogyMarriageStatus } from './layouts/genealogyColumnsLayout';
import type { MarriageNodeDetails } from './types';

interface GenealogySpouseEdgeData {
  marriageStatus?: GenealogyMarriageStatus;
  marriageDetails?: MarriageNodeDetails;
  onMarriageClick?: (details: MarriageNodeDetails) => void;
}

const marriageStatusStyles: Record<GenealogyMarriageStatus, { background: string; border: string; color: string }> = {
  active: {
    background: '#FBF8F1',
    border: '#A85F45',
    color: '#A85F45',
  },
  divorced: {
    background: '#F4EFE6',
    border: '#A9825A',
    color: '#5B4636',
  },
  widowed: {
    background: '#E7D8BF',
    border: '#A9825A',
    color: '#5B4636',
  },
  unknown: {
    background: '#FBF8F1',
    border: '#CBBDA6',
    color: '#5B4636',
  },
};

export function GenealogySpouseEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  data,
}: EdgeProps<GenealogySpouseEdgeData>) {
  const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  const markerX = sourceX + (targetX - sourceX) / 2;
  const markerY = sourceY + (targetY - sourceY) / 2;
  const marriageStatus = data?.marriageStatus ?? 'unknown';
  const markerStyle = marriageStatusStyles[marriageStatus];
  const handleRingClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (data?.marriageDetails) {
      data.onMarriageClick?.(data.marriageDetails);
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: '#A85F45',
          strokeWidth: 1.5,
          opacity: 0.72,
          strokeLinecap: 'round',
          ...style,
        }}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <button
          type="button"
          className="nodrag nopan pointer-events-auto absolute z-50 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border text-[13px] leading-none shadow-sm shadow-[#2F2A25]/10 transition-colors hover:bg-[#F4EFE6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A85F45]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4EFE6]"
          style={{
            transform: `translate(-50%, -50%) translate(${markerX}px, ${markerY}px)`,
            backgroundColor: markerStyle.background,
            borderColor: markerStyle.border,
            color: markerStyle.color,
          }}
          onClick={handleRingClick}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          title="Ver vínculo do casal"
          aria-label="Ver vínculo do casal"
        >
          ♥
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
