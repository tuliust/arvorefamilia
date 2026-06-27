import React from 'react';

import { FAMILY_TREE_COLORS } from './visualTokens';

type ConjugalStatusLegendItem = {
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  line: 'solid' | 'dashed' | 'dotted';
  symbol: string;
  opacity?: number;
};

const CONJUGAL_STATUS_LEGEND_ITEMS: ConjugalStatusLegendItem[] = [
  {
    label: 'União ativa',
    shortLabel: 'Ativa',
    description: 'Vínculo conjugal vigente.',
    color: FAMILY_TREE_COLORS.EDGE_SPOUSE,
    line: 'solid',
    symbol: '♥',
  },
  {
    label: 'Viuvez',
    shortLabel: 'Viuvez',
    description: 'Vínculo encerrado por falecimento.',
    color: '#64748B',
    line: 'solid',
    symbol: '◌',
    opacity: 0.65,
  },
  {
    label: 'Separação',
    shortLabel: 'Separação',
    description: 'Separação registrada no vínculo.',
    color: '#B45309',
    line: 'dashed',
    symbol: '∕',
  },
  {
    label: 'Divórcio',
    shortLabel: 'Divórcio',
    description: 'Divórcio registrado no vínculo.',
    color: '#C2410C',
    line: 'dashed',
    symbol: '×',
  },
  {
    label: 'Inativa',
    shortLabel: 'Inativa',
    description: 'Vínculo marcado como inativo.',
    color: '#64748B',
    line: 'dotted',
    symbol: '…',
  },
  {
    label: 'Histórica',
    shortLabel: 'Histórica',
    description: 'União histórica preservada.',
    color: '#78716C',
    line: 'solid',
    symbol: '◇',
    opacity: 0.7,
  },
];

export function TreeConjugalStatusLegend({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'grid grid-cols-2 gap-[clamp(0.45rem,1.1vh,0.7rem)]' : 'space-y-2'}>
      {CONJUGAL_STATUS_LEGEND_ITEMS.map((item) => (
        <div
          key={item.label}
          className={[
            'flex min-w-0 items-center rounded-xl border border-gray-200 bg-white shadow-sm',
            compact ? 'min-h-[clamp(38px,5.6vh,48px)] gap-2 px-2.5 py-[clamp(0.35rem,0.9vh,0.55rem)]' : 'gap-3 p-2',
          ].join(' ')}
          title={`${item.label}: ${item.description}`}
        >
          <StatusLineSample item={item} compact={compact} />
          <span className={compact ? 'min-w-0 text-[clamp(10px,1.5vh,11px)] leading-tight' : 'min-w-0 text-xs leading-relaxed'}>
            <span className="block font-semibold text-gray-900">{compact ? item.shortLabel : item.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function StatusLineSample({ item, compact }: { item: ConjugalStatusLegendItem; compact: boolean }) {
  return (
    <span
      className={compact ? 'flex h-[clamp(18px,3vh,22px)] w-9 shrink-0 items-center justify-center gap-1' : 'flex h-8 w-12 shrink-0 items-center justify-center gap-1'}
      style={{ color: item.color, opacity: item.opacity ?? 1 }}
    >
      <span
        className={compact ? 'block h-0 w-5 border-t-2' : 'block h-0 w-7 border-t-2'}
        style={{
          borderColor: item.color,
          borderStyle: item.line === 'dotted' ? 'dotted' : item.line === 'dashed' ? 'dashed' : 'solid',
        }}
      />
      <span className={compact ? 'text-[12px] font-bold leading-none' : 'text-[14px] font-bold leading-none'} aria-hidden="true">
        {item.symbol}
      </span>
    </span>
  );
}
