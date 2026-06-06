import React from 'react';

import type { Pessoa } from '../../types';
import { isHumanFamilyMember } from '../../utils/personEntity';

interface GenealogyMobileStageTabsProps {
  pessoas: Pessoa[];
  visiblePersonIds?: Set<string>;
  activeGeneration?: number | null;
  onGenerationChange?: (generation: number | null) => void;
}

type GenealogyStage = {
  generation: number;
  label: string;
  ariaLabel: string;
  count: number;
};

const GENERATION_LABELS: Record<number, string> = {
  1: 'Tataravós',
  2: 'Bisavós',
  3: 'Avós',
  4: 'Pais',
  5: 'Núcleo',
  6: 'Descendentes',
};

function getGenerationLabel(generation: number) {
  return GENERATION_LABELS[generation] ?? `Geração ${generation}`;
}

function getGenerationKey(pessoa: Pessoa) {
  const generation = pessoa.manual_generation;
  return typeof generation === 'number' && Number.isFinite(generation)
    ? generation
    : null;
}

function buildGenealogyStages(pessoas: Pessoa[], visiblePersonIds?: Set<string>): GenealogyStage[] {
  const countsByGeneration = new Map<number, number>();

  pessoas.forEach((pessoa) => {
    if (!isHumanFamilyMember(pessoa)) return;
    if (visiblePersonIds && !visiblePersonIds.has(pessoa.id)) return;

    const generation = getGenerationKey(pessoa);
    if (generation === null) return;

    countsByGeneration.set(generation, (countsByGeneration.get(generation) ?? 0) + 1);
  });

  return Array.from(countsByGeneration.entries())
    .sort(([generationA], [generationB]) => generationA - generationB)
    .map(([generation, count]) => {
      const label = getGenerationLabel(generation);

      return {
        generation,
        label,
        ariaLabel: `${label}, geração ${generation}`,
        count,
      };
    });
}

export function GenealogyMobileStageTabs({
  pessoas,
  visiblePersonIds,
  activeGeneration,
  onGenerationChange,
}: GenealogyMobileStageTabsProps) {
  const stages = React.useMemo(
    () => buildGenealogyStages(pessoas, visiblePersonIds),
    [pessoas, visiblePersonIds]
  );

  React.useEffect(() => {
    if (!onGenerationChange) return;

    if (stages.length === 0) {
      if (activeGeneration !== null) {
        onGenerationChange(null);
      }
      return;
    }

    const hasActiveGeneration = typeof activeGeneration === 'number'
      && stages.some((stage) => stage.generation === activeGeneration);

    if (!hasActiveGeneration) {
      onGenerationChange(stages[0].generation);
    }
  }, [activeGeneration, onGenerationChange, stages]);

  if (stages.length === 0) return null;

  return (
    <div className="pointer-events-none absolute left-3 right-[6.75rem] top-3 z-30">
      <div className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div
          className="flex snap-x gap-1 overflow-x-auto px-1.5 py-1.5"
          role="tablist"
          aria-label="Navegação por gerações"
        >
          {stages.map((stage) => {
            const isActive = stage.generation === activeGeneration;

            return (
              <button
                key={stage.generation}
                type="button"
                role="tab"
                aria-label={stage.ariaLabel}
                aria-selected={isActive}
                title={`Geração ${stage.generation}: ${stage.label}`}
                className={[
                  'snap-start whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition',
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
                onClick={() => onGenerationChange?.(stage.generation)}
              >
                <span>{stage.label}</span>
                <span className={isActive ? 'ml-1 text-white/75' : 'ml-1 text-slate-400'}>
                  {stage.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
