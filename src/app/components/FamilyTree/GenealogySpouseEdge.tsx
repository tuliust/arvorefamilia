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

const CONNECTOR_COLOR = 'var(--tree-palette-group-border, #CBD5E1)';

const marriageStatusStyles: Record<GenealogyMarriageStatus, { background: string; shadow: string }> = {
  active: {
    background: '#ffffff',
    shadow: '0 0 0 4px rgba(241,245,249,0.95), 0 5px 14px rgba(71,85,105,0.22)',
  },
  divorced: {
    background: '#F8FAFC',
    shadow: '0 0 0 4px rgba(241,245,249,0.95), 0 5px 14px rgba(71,85,105,0.22)',
  },
  widowed: {
    background: '#F8FAFC',
    shadow: '0 0 0 4px rgba(241,245,249,0.95), 0 5px 14px rgba(71,85,105,0.22)',
  },
  unknown: {
    background: '#ffffff',
    shadow: '0 0 0 4px rgba(241,245,249,0.95), 0 5px 14px rgba(71,85,105,0.22)',
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
  const canOpenMarriageDetails = Boolean(data?.marriageDetails && data?.onMarriageClick);
  const handleRingClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!data?.marriageDetails || !data.onMarriageClick) return;
    data.onMarriageClick(data.marriageDetails);
  };

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <button
          type="button"
          className={[
            'nodrag nopan pointer-events-auto absolute z-50 flex h-[60px] w-[60px] items-center justify-center overflow-visible rounded-full border-[3px] bg-white text-sm leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
            canOpenMarriageDetails
              ? 'cursor-pointer hover:bg-slate-50 hover:text-slate-700'
              : 'cursor-default opacity-80',
          ].join(' ')}
          style={{
            transform: `translate(-50%, -50%) translate(${markerX}px, ${markerY}px)`,
            backgroundColor: markerStyle.background,
            borderColor: CONNECTOR_COLOR,
            color: CONNECTOR_COLOR,
            boxShadow: markerStyle.shadow,
          }}
          onClick={handleRingClick}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          title={canOpenMarriageDetails ? 'Ver vínculo do casal' : 'Vínculo do casal sem detalhes disponíveis'}
          aria-label={canOpenMarriageDetails ? 'Ver vínculo do casal' : 'Vínculo do casal sem detalhes disponíveis'}
          aria-disabled={!canOpenMarriageDetails}
        >
          <Blend className="h-8 w-8 stroke-[2.8]" aria-hidden="true" />
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
