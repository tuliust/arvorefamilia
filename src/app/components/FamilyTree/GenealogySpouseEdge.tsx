import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps } from 'reactflow';
import { Blend } from 'lucide-react';
import type { GenealogyMarriageStatus } from './layouts/genealogyColumnsLayout';
import type { MarriageNodeDetails } from './types';

interface GenealogySpouseEdgeData {
  marriageStatus?: GenealogyMarriageStatus;
  marriageDetails?: MarriageNodeDetails;
  onMarriageClick?: (details: MarriageNodeDetails) => void;
}

const marriageStatusStyles: Record<GenealogyMarriageStatus, { background: string; border: string; color: string }> = {
  active: {
    background: '#ffffff',
    border: '#D1D5DB',
    color: '#EA580C',
  },
  divorced: {
    background: '#FEF3C7',
    border: '#F59E0B',
    color: '#B45309',
  },
  widowed: {
    background: '#E5E7EB',
    border: '#9CA3AF',
    color: '#4B5563',
  },
  unknown: {
    background: '#ffffff',
    border: '#D1D5DB',
    color: '#EA580C',
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
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <button
          type="button"
          className="nodrag nopan pointer-events-auto absolute z-50 flex h-[60px] w-[60px] cursor-pointer items-center justify-center rounded-full border bg-white text-sm leading-none shadow-sm transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
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
          <Blend className="h-7 w-7 stroke-[2.4]" aria-hidden="true" />
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
