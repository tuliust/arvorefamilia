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

const marriageStatusStyles: Record<GenealogyMarriageStatus, { background: string; border: string; color: string; shadow: string }> = {
  active: {
    background: '#ffffff',
    border: '#EA580C',
    color: '#C2410C',
    shadow: '0 0 0 4px rgba(255,237,213,0.9), 0 5px 14px rgba(194,65,12,0.34)',
  },
  divorced: {
    background: '#FFF7ED',
    border: '#F59E0B',
    color: '#B45309',
    shadow: '0 0 0 4px rgba(254,243,199,0.9), 0 5px 14px rgba(180,83,9,0.28)',
  },
  widowed: {
    background: '#ffffff',
    border: '#EA580C',
    color: '#C2410C',
    shadow: '0 0 0 4px rgba(255,237,213,0.9), 0 5px 14px rgba(194,65,12,0.28)',
  },
  unknown: {
    background: '#ffffff',
    border: '#EA580C',
    color: '#C2410C',
    shadow: '0 0 0 4px rgba(255,237,213,0.9), 0 5px 14px rgba(194,65,12,0.34)',
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
          className="nodrag nopan pointer-events-auto absolute z-50 flex h-[60px] w-[60px] cursor-pointer items-center justify-center overflow-visible rounded-full border-[3px] bg-white text-sm leading-none transition-colors hover:bg-orange-50 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
          style={{
            transform: `translate(-50%, -50%) translate(${markerX}px, ${markerY}px)`,
            backgroundColor: markerStyle.background,
            borderColor: markerStyle.border,
            color: markerStyle.color,
            boxShadow: markerStyle.shadow,
          }}
          onClick={handleRingClick}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          title="Ver vínculo do casal"
          aria-label="Ver vínculo do casal"
        >
          <Blend className="h-8 w-8 stroke-[2.8]" aria-hidden="true" />
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
