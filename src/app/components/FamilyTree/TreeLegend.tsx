import React from 'react';

import type { TreeViewMode } from './treeViewMode';
import type {
  DirectRelativeFilters,
  DirectRelativeGroup,
  EdgeFilters,
  VisualLineFilterKey,
  VisualLineFilters,
} from './types';
import { FAMILY_TREE_COLORS } from './visualTokens';
import {
  DIRECT_FAMILY_LEGEND_BACKGROUNDS,
  DIRECT_FAMILY_STATUS_BORDER_COLORS,
} from './directFamilyColors';

type PersonLegendFilterKey = 'vivos' | 'falecidos' | 'pets';
const NEUTRAL_LINE_SAMPLE_COLOR = '#94A3B8';

interface TreeLegendProps {
  viewMode?: TreeViewMode;
  compact?: boolean;
  className?: string;
  showTitle?: boolean;
  personFilters?: Record<PersonLegendFilterKey, boolean>;
  edgeFilters?: EdgeFilters;
  directRelativeFilters?: DirectRelativeFilters;
  visualLineFilters?: VisualLineFilters;
  onTogglePersonFilter?: (key: PersonLegendFilterKey) => void;
  onToggleEdgeFilter?: (key: keyof EdgeFilters) => void;
  onToggleAllEdgeFilters?: () => void;
  onToggleParentChildFilter?: () => void;
  onToggleDirectRelativeFilter?: (key: DirectRelativeGroup) => void;
  onToggleVisualLineFilter?: (key: VisualLineFilterKey) => void;
  onToggleAllVisualLineFilters?: () => void;
}

const lineItems = [
  {
    label: 'Conjugal',
    fullLabel: 'Linha conjugal',
    sample: <LegendLine color={NEUTRAL_LINE_SAMPLE_COLOR} />,
  },
  {
    label: 'Pais/filhos',
    fullLabel: 'Pais e filhos',
    sample: <LegendLine color={NEUTRAL_LINE_SAMPLE_COLOR} />,
  },
  {
    label: 'Irmãos',
    fullLabel: 'Irmãos',
    sample: <LegendLine color={NEUTRAL_LINE_SAMPLE_COLOR} dashed />,
  },
  {
    label: 'Todas',
    fullLabel: 'Todas',
    sample: <LegendBus />,
  },
];

const visualLineItems: Array<{
  key: VisualLineFilterKey;
  label: string;
  fullLabel: string;
  sample: React.ReactNode;
}> = [
  {
    key: 'spouseHighlight',
    label: 'Cônjuges',
    fullLabel: 'Cônjuges',
    sample: <LegendLine color={FAMILY_TREE_COLORS.EDGE_SPOUSE} />,
  },
  {
    key: 'parentChildHighlight',
    label: 'Pais/Filhos',
    fullLabel: 'Pais/Filhos',
    sample: <LegendLine color={FAMILY_TREE_COLORS.EDGE_CHILD} />,
  },
  {
    key: 'siblingHighlight',
    label: 'Irmãos',
    fullLabel: 'Irmãos',
    sample: <LegendLine color={FAMILY_TREE_COLORS.EDGE_SIBLING} dashed />,
  },
];

const directRelativeKeyByLegendLabel: Partial<Record<string, DirectRelativeGroup | 'central'>> = {
  Tataravós: 'tataravos',
  Bisavós: 'bisavos',
  Avós: 'avos',
  Tios: 'tios',
  Primos: 'primos',
  'Pai e Mãe': 'pais',
  'Pessoa Principal': 'central',
  Irmãos: 'irmaos',
  Sobrinhos: 'sobrinhos',
  Netos: 'netos',
  Cônjuge: 'conjuge',
  Filhos: 'filhos',
};

export function TreeLegend({
  viewMode,
  compact = false,
  className = '',
  showTitle = true,
  personFilters,
  edgeFilters,
  directRelativeFilters,
  visualLineFilters,
  onTogglePersonFilter,
  onToggleEdgeFilter,
  onToggleAllEdgeFilters,
  onToggleParentChildFilter,
  onToggleDirectRelativeFilter,
  onToggleVisualLineFilter,
  onToggleAllVisualLineFilters,
}: TreeLegendProps) {
  const backgroundItems = DIRECT_FAMILY_LEGEND_BACKGROUNDS;
  const parentChildActive = edgeFilters ? edgeFilters.filiacao_sangue || edgeFilters.filiacao_adotiva : undefined;
  const allEdgeFiltersActive = edgeFilters
    ? edgeFilters.conjugal && edgeFilters.filiacao_sangue && edgeFilters.filiacao_adotiva && edgeFilters.irmaos
    : undefined;
  const allVisualLineFiltersActive = visualLineFilters
    ? visualLineFilters.spouseHighlight && visualLineFilters.parentChildHighlight && visualLineFilters.siblingHighlight
    : undefined;

  const getLineAction = (label: string) => {
    if (!edgeFilters) return {};

    if (label === 'Todas' && onToggleAllEdgeFilters) {
      return {
        active: allEdgeFiltersActive,
        onClick: onToggleAllEdgeFilters,
        title: allEdgeFiltersActive ? 'Ocultar todas as linhas' : 'Mostrar todas as linhas',
      };
    }

    if (label === 'Conjugal' && onToggleEdgeFilter) {
      return {
        active: edgeFilters.conjugal,
        onClick: () => onToggleEdgeFilter('conjugal'),
        title: edgeFilters.conjugal ? 'Ocultar linhas conjugais' : 'Mostrar linhas conjugais',
      };
    }

    if (label === 'Pais/filhos' && onToggleParentChildFilter) {
      return {
        active: parentChildActive,
        onClick: onToggleParentChildFilter,
        title: parentChildActive ? 'Ocultar linhas de pais e filhos' : 'Mostrar linhas de pais e filhos',
      };
    }

    if (label === 'Irmãos' && onToggleEdgeFilter) {
      return {
        active: edgeFilters.irmaos,
        onClick: () => onToggleEdgeFilter('irmaos'),
        title: edgeFilters.irmaos ? 'Ocultar linhas de irmãos' : 'Mostrar linhas de irmãos',
      };
    }

    return {};
  };

  const getVisualLineAction = (key: VisualLineFilterKey, label: string) => {
    if (!visualLineFilters || !onToggleVisualLineFilter) return {};

    const active = visualLineFilters[key];

    return {
      active,
      onClick: () => onToggleVisualLineFilter(key),
      title: active ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`,
    };
  };

  const getAllVisualLineAction = () => {
    if (!visualLineFilters || !onToggleAllVisualLineFilters) return {};

    return {
      active: allVisualLineFiltersActive,
      onClick: onToggleAllVisualLineFilters,
      title: allVisualLineFiltersActive ? 'Ocultar todos os destaques' : 'Mostrar todos os destaques',
    };
  };

  const getDirectRelativeAction = (label: string) => {
    const key = directRelativeKeyByLegendLabel[label];

    if (!key || key === 'central') return {};
    if (viewMode !== 'minha-arvore' && viewMode !== 'mapa-familiar') return {};
    if (!directRelativeFilters || !onToggleDirectRelativeFilter) return {};

    const active = directRelativeFilters[key];

    return {
      active,
      onClick: () => onToggleDirectRelativeFilter(key),
      title: active ? `Ocultar ${label}` : `Mostrar ${label}`,
    };
  };

  if (compact) {
    return (
      <section
        className={['flex min-h-full flex-col gap-[clamp(0.55rem,1.35vh,0.95rem)] text-[11px]', className].filter(Boolean).join(' ')}
        aria-label="Legenda visual da árvore"
      >
        {showTitle && (
          <div className="space-y-[clamp(0.25rem,0.75vh,0.45rem)]">
            <h2 className="text-[clamp(14px,2.1vh,16px)] font-semibold leading-tight text-gray-900">Legendas visuais</h2>
            <p className="text-[clamp(11px,1.6vh,13px)] leading-snug text-gray-500">
              Clique nos botões para ativar ou desativar linhas e destaques da árvore.
            </p>
          </div>
        )}

        <LegendGroup title="Cards" compact>
          <div className="grid grid-cols-2 gap-[clamp(0.45rem,1.1vh,0.7rem)]">
            <LegendItem
              compact
              sample={(
                <span
                  className="h-4 w-8 rounded bg-white"
                  style={{ border: `2px solid ${DIRECT_FAMILY_STATUS_BORDER_COLORS.alive}` }}
                />
              )}
              label="Pessoa viva"
              active={personFilters?.vivos}
              onClick={onTogglePersonFilter ? () => onTogglePersonFilter('vivos') : undefined}
              title={personFilters?.vivos ? 'Ocultar pessoas vivas' : 'Mostrar pessoas vivas'}
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
              active={personFilters?.falecidos}
              onClick={onTogglePersonFilter ? () => onTogglePersonFilter('falecidos') : undefined}
              title={personFilters?.falecidos ? 'Ocultar pessoas falecidas' : 'Mostrar pessoas falecidas'}
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
              active={personFilters?.pets}
              onClick={onTogglePersonFilter ? () => onTogglePersonFilter('pets') : undefined}
              title={personFilters?.pets ? 'Ocultar pets' : 'Mostrar pets'}
            />
            <LegendItem
              compact
              sample={<span className="h-4 w-8 rounded bg-white shadow-inner ring-2 ring-slate-800" />}
              label="Central"
              title="A pessoa central permanece sempre visível"
            />
          </div>
        </LegendGroup>

        <LegendGroup title="Linhas" compact>
          <div className="grid grid-cols-2 gap-[clamp(0.45rem,1.1vh,0.7rem)]">
            {lineItems.map((item) => (
              <LegendItem
                key={item.fullLabel}
                compact
                sample={item.sample}
                label={item.label}
                {...getLineAction(item.label)}
              />
            ))}
          </div>
        </LegendGroup>

        <LegendGroup title="Destacar" compact>
          <div className="grid grid-cols-2 gap-[clamp(0.45rem,1.1vh,0.7rem)]">
            <LegendItem
              compact
              sample={<LegendBus />}
              label="Todas"
              {...getAllVisualLineAction()}
            />
            {visualLineItems.map((item) => (
              <LegendItem
                key={item.key}
                compact
                sample={item.sample}
                label={item.label}
                {...getVisualLineAction(item.key, item.fullLabel)}
              />
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
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-gray-900">Legendas visuais</h2>
          <p className="text-xs leading-snug text-gray-500">
            Clique nos botões para ativar ou desativar linhas e destaques da árvore.
          </p>
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
            active={personFilters?.vivos}
            onClick={onTogglePersonFilter ? () => onTogglePersonFilter('vivos') : undefined}
            title={personFilters?.vivos ? 'Ocultar pessoas vivas' : 'Mostrar pessoas vivas'}
          />
          <LegendItem
            sample={(
              <span
                className="h-6 w-12 rounded-md bg-white"
                style={{ border: `3px solid ${DIRECT_FAMILY_STATUS_BORDER_COLORS.deceased}` }}
              />
            )}
            label="Falecida"
            active={personFilters?.falecidos}
            onClick={onTogglePersonFilter ? () => onTogglePersonFilter('falecidos') : undefined}
            title={personFilters?.falecidos ? 'Ocultar pessoas falecidas' : 'Mostrar pessoas falecidas'}
          />
          <LegendItem
            sample={(
              <span
                className="h-6 w-12 rounded-md bg-white"
                style={{ border: `3px solid ${FAMILY_TREE_COLORS.CARD_BORDER_PET}` }}
              />
            )}
            label="Pet"
            active={personFilters?.pets}
            onClick={onTogglePersonFilter ? () => onTogglePersonFilter('pets') : undefined}
            title={personFilters?.pets ? 'Ocultar pets' : 'Mostrar pets'}
          />
          <LegendItem
            sample={<span className="h-6 w-12 rounded-md bg-white shadow-inner ring-2 ring-slate-800" />}
            label="Central"
            title="A pessoa central permanece sempre visível"
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
              {...getLineAction(item.label)}
            />
          ))}
        </div>
      </LegendGroup>

      <LegendGroup title="Destacar">
        <div className="space-y-2">
          <LegendItem
            sample={<LegendBus />}
            label="Todas"
            {...getAllVisualLineAction()}
          />
          {visualLineItems.map((item) => (
            <LegendItem
              key={item.key}
              sample={item.sample}
              label={item.fullLabel}
              {...getVisualLineAction(item.key, item.fullLabel)}
            />
          ))}
        </div>
      </LegendGroup>

      <LegendGroup title="Cores dos grupos">
        <div className="grid grid-cols-2 gap-2">
          {backgroundItems.map((item) => (
            <LegendColorItem
              key={item.label}
              label={item.label}
              background={item.background}
              border={item.solid}
              {...getDirectRelativeAction(item.label)}
            />
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
    <div className={compact ? 'space-y-[clamp(0.35rem,0.95vh,0.65rem)]' : 'space-y-2'}>
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
  active,
  onClick,
  title,
}: {
  sample: React.ReactNode;
  label: string;
  compact?: boolean;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  const isInteractive = typeof onClick === 'function';
  const inactive = isInteractive && active === false;
  const className = [
    'flex min-w-0 items-center rounded-xl border border-gray-200 bg-white shadow-sm transition',
    compact ? 'min-h-[clamp(38px,5.6vh,48px)] gap-2 px-2.5 py-[clamp(0.35rem,0.9vh,0.55rem)]' : 'gap-3 p-2',
    isInteractive ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : '',
    inactive ? 'grayscale opacity-45' : '',
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <span className={compact
        ? 'flex h-[clamp(18px,3vh,22px)] w-9 shrink-0 items-center justify-center'
        : 'flex h-8 w-12 shrink-0 items-center justify-center'}
      >
        {sample}
      </span>
      <span className={compact ? 'min-w-0 text-[clamp(10px,1.5vh,11px)] leading-tight' : 'min-w-0 text-xs leading-relaxed'}>
        <span className="block font-semibold text-gray-900">{label}</span>
      </span>
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={className}
        title={title}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} title={title}>
      {content}
    </div>
  );
}

function LegendColorItem({
  label,
  background,
  border,
  compact = false,
  active,
  onClick,
  title,
}: {
  label: string;
  background: string;
  border: string;
  compact?: boolean;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  const isInteractive = typeof onClick === 'function';
  const inactive = isInteractive && active === false;
  const className = [
    'flex min-w-0 items-center gap-1.5 leading-tight text-gray-600 transition',
    isInteractive ? 'cursor-pointer rounded-md hover:bg-white/70' : '',
    inactive ? 'grayscale opacity-45' : '',
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <span
        className={compact ? 'h-3.5 w-6 shrink-0 rounded border' : 'h-5 w-9 shrink-0 rounded border'}
        style={{
          background,
          borderColor: border,
        }}
      />
      <span className={compact ? 'truncate' : 'leading-snug'}>{label}</span>
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={className}
        title={title}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} title={title}>
      {content}
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
    <span className="relative block h-7 w-8">
      <span className="absolute left-1/2 top-0 h-full border-l-2 border-slate-400" />
      <span className="absolute left-0 right-0 top-1/2 border-t-2 border-slate-400" />
    </span>
  );
}
