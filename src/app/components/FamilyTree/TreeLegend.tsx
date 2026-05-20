import React from 'react';

import type { TreeViewMode } from './ViewModeToggle';
import { FAMILY_TREE_COLORS } from './visualTokens';
import {
  DIRECT_FAMILY_LEGEND_BACKGROUNDS,
  DIRECT_FAMILY_STATUS_BORDER_COLORS,
} from './directFamilyColors';

interface TreeLegendProps {
  viewMode?: TreeViewMode;
  compact?: boolean;
  className?: string;
  showTitle?: boolean;
}

const marriageStatusItems = [
  {
    label: 'União ativa',
    shortLabel: 'Em relacionamento',
    background: '#FFFFFF',
    border: '#D1D5DB',
  },
  {
    label: 'Separado/divorciado',
    shortLabel: 'Separado',
    background: '#FEF3C7',
    border: '#F59E0B',
  },
  {
    label: 'Viuvez',
    shortLabel: 'Viuvez',
    background: '#E5E7EB',
    border: '#9CA3AF',
  },
  {
    label: 'Status desconhecido',
    shortLabel: 'Desconhecido',
    background: '#FFFFFF',
    border: '#D1D5DB',
  },
];

const lineItems = [
  {
    label: 'Conjugal',
    fullLabel: 'Linha conjugal',
    sample: <LegendLine color={FAMILY_TREE_COLORS.EDGE_SPOUSE} />,
  },
  {
    label: 'Pais/filhos',
    fullLabel: 'Pais e filhos',
    sample: <LegendLine color={FAMILY_TREE_COLORS.EDGE_CHILD} />,
  },
  {
    label: 'Irmãos',
    fullLabel: 'Irmãos',
    sample: <LegendLine color={FAMILY_TREE_COLORS.EDGE_SIBLING} dashed />,
  },
  {
    label: 'Barramento',
    fullLabel: 'Barramento vertical',
    sample: <LegendBus />,
  },
];

export function TreeLegend({
  compact = false,
  className = '',
  showTitle = true,
}: TreeLegendProps) {
  const backgroundItems = DIRECT_FAMILY_LEGEND_BACKGROUNDS;

  if (compact) {
    return (
      <section
        className={['space-y-2 text-[11px]', className].filter(Boolean).join(' ')}
        aria-label="Legenda visual da árvore"
      >
        {showTitle && (
          <div>
            <h2 className="text-sm font-semibold leading-tight text-gray-900">Legendas visuais</h2>
          </div>
        )}

        <LegendGroup title="Cards" compact>
          <div className="grid grid-cols-2 gap-1.5">
            <LegendItem
              compact
              sample={(
                <span
                  className="h-4 w-8 rounded bg-white"
                  style={{ border: `2px solid ${DIRECT_FAMILY_STATUS_BORDER_COLORS.alive}` }}
                />
              )}
              label="Pessoa viva"
            />
            <LegendItem
              compact
              sample={(
                <span
                  className="h-4 w-8 rounded bg-white"
                  style={{ border: `2px solid ${DIRECT_FAMILY_STATUS_BORDER_COLORS.deceased}` }}
                />
              )}
              label="Falecida"
            />
            <LegendItem
              compact
              sample={(
                <span
                  className="h-4 w-8 rounded bg-white"
                  style={{ border: `2px solid ${FAMILY_TREE_COLORS.CARD_BORDER_PET}` }}
                />
              )}
              label="Pet"
            />
            <LegendItem
              compact
              sample={<span className="h-4 w-8 rounded bg-white shadow-inner ring-2 ring-slate-800" />}
              label="Central"
            />
          </div>
        </LegendGroup>

        <LegendGroup title="Linhas" compact>
          <div className="grid grid-cols-2 gap-1.5">
            {lineItems.map((item) => (
              <LegendItem
                key={item.fullLabel}
                compact
                sample={item.sample}
                label={item.label}
              />
            ))}
          </div>
        </LegendGroup>

        <LegendGroup title="Anel de casamento" compact>
          <div className="grid grid-cols-2 gap-1.5">
            {marriageStatusItems.map((item) => (
              <LegendItem
                key={item.label}
                compact
                sample={<MarriageRingSample background={item.background} border={item.border} />}
                label={item.shortLabel}
              />
            ))}
          </div>
        </LegendGroup>

        <LegendGroup title="Cores dos grupos" compact>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {backgroundItems.map((item) => (
              <div key={item.label} className="flex min-w-0 items-center gap-1.5 leading-tight text-gray-600">
                <span
                  className="h-3.5 w-6 shrink-0 rounded border"
                  style={{
                    background: item.background,
                    borderColor: item.solid,
                  }}
                />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </LegendGroup>
      </section>
    );
  }

  return (
    <section
      className={[
        'space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-3',
        className,
      ].filter(Boolean).join(' ')}
      aria-label="Legenda visual da árvore"
    >
      {showTitle && (
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Legendas visuais</h2>
        </div>
      )}

      <LegendGroup title="Cards de pessoas">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <LegendItem
            sample={(
              <span
                className="h-6 w-12 rounded-md bg-white"
                style={{ border: `3px solid ${DIRECT_FAMILY_STATUS_BORDER_COLORS.alive}` }}
              />
            )}
            label="Pessoa viva"
          />
          <LegendItem
            sample={(
              <span
                className="h-6 w-12 rounded-md bg-white"
                style={{ border: `3px solid ${DIRECT_FAMILY_STATUS_BORDER_COLORS.deceased}` }}
              />
            )}
            label="Falecida"
          />
          <LegendItem
            sample={(
              <span
                className="h-6 w-12 rounded-md bg-white"
                style={{ border: `3px solid ${FAMILY_TREE_COLORS.CARD_BORDER_PET}` }}
              />
            )}
            label="Pet"
          />
          <LegendItem
            sample={<span className="h-6 w-12 rounded-md bg-white shadow-inner ring-2 ring-slate-800" />}
            label="Central"
          />
        </div>
      </LegendGroup>

      <LegendGroup title="Linhas e conectores">
        <div className="space-y-2">
          {lineItems.map((item) => (
            <LegendItem
              key={item.fullLabel}
              sample={item.sample}
              label={item.fullLabel}
            />
          ))}
        </div>
      </LegendGroup>

      <LegendGroup title="Anel de casamento">
        <div className="space-y-2">
          <div className="space-y-2">
            {marriageStatusItems.map((item) => (
              <LegendItem
                key={item.label}
                sample={<MarriageRingSample background={item.background} border={item.border} />}
                label={item.shortLabel}
              />
            ))}
          </div>
        </div>
      </LegendGroup>

      <LegendGroup title="Cores dos grupos">
        <div className="grid grid-cols-2 gap-2">
          {backgroundItems.map((item) => (
            <div key={item.label} className="flex min-w-0 items-center gap-2 text-xs text-gray-600">
              <span
                className="h-5 w-9 shrink-0 rounded border"
                style={{
                  background: item.background,
                  borderColor: item.solid,
                }}
              />
              <span className="leading-snug">{item.label}</span>
            </div>
          ))}
        </div>
      </LegendGroup>
    </section>
  );
}

function LegendGroup({
  title,
  children,
  compact = false,
}: {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      <p className={compact
        ? 'text-[10px] font-semibold uppercase leading-tight tracking-normal text-gray-500'
        : 'text-[11px] font-semibold uppercase tracking-normal text-gray-500'}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function LegendItem({
  sample,
  label,
  compact = false,
}: {
  sample: React.ReactNode;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className={[
      'flex min-w-0 items-center rounded-lg border border-gray-200 bg-white shadow-sm',
      compact ? 'gap-1.5 p-1.5' : 'gap-3 p-2',
    ].join(' ')}
    >
      <span className={compact
        ? 'flex h-5 w-8 shrink-0 items-center justify-center'
        : 'flex h-8 w-12 shrink-0 items-center justify-center'}
      >
        {sample}
      </span>
      <span className={compact ? 'min-w-0 text-[10px] leading-snug' : 'min-w-0 text-xs leading-relaxed'}>
        <span className="block font-semibold text-gray-900">{label}</span>
      </span>
    </div>
  );
}

function LegendLine({ color, dashed = false }: { color: string; dashed?: boolean }) {
  return (
    <span
      className="block h-0 w-8 border-t-2"
      style={{
        borderColor: color,
        borderStyle: dashed ? 'dashed' : 'solid',
      }}
    />
  );
}

function LegendBus() {
  return (
    <span className="relative block h-6 w-8">
      <span className="absolute left-1/2 top-0 h-full border-l-2 border-gray-400" />
      <span className="absolute left-1 top-1/2 w-6 border-t-2 border-gray-400" />
    </span>
  );
}

function MarriageRingSample({ background, border }: { background: string; border: string }) {
  return (
    <span
      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] shadow-sm"
      style={{ background, border: `1px solid ${border}` }}
    >
      💍
    </span>
  );
}
