import React from 'react';

import type { TreeViewMode } from './treeViewMode';
import {
  TREE_COLOR_PALETTE_CSS_VARIABLES,
  TREE_COLOR_PALETTE_STORAGE_KEY,
  TREE_COLOR_PALETTES,
  isTreeColorPalette,
  type TreeColorPalette,
} from './treeColorPalettes';

interface ViewModeToggleProps {
  value: TreeViewMode;
  onChange: (value: TreeViewMode) => void;
}

const options: Array<{ value: TreeViewMode; label: string }> = [
  { value: 'mapa-familiar', label: 'Mapa Familiar' },
  { value: 'visao-completa', label: 'Visão Completa' },
];

const paletteOptions: TreeColorPalette[] = ['white', 'orange', 'brown', 'visual'];

function getStoredPalette(): TreeColorPalette {
  if (typeof window === 'undefined') return 'white';

  const stored = window.localStorage.getItem(TREE_COLOR_PALETTE_STORAGE_KEY);
  return isTreeColorPalette(stored) ? stored : 'white';
}

function applyTreePalette(value: TreeColorPalette) {
  if (typeof document === 'undefined') return;

  const palette = TREE_COLOR_PALETTES[value];
  const root = document.documentElement;

  root.dataset.treeColorPalette = value;

  TREE_COLOR_PALETTE_CSS_VARIABLES.forEach((variableName) => {
    root.style.setProperty(variableName, palette.cssVariables[variableName]);
  });
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  const [treeColorPalette, setTreeColorPalette] = React.useState<TreeColorPalette>(getStoredPalette);

  React.useEffect(() => {
    applyTreePalette(treeColorPalette);
    window.localStorage.setItem(TREE_COLOR_PALETTE_STORAGE_KEY, treeColorPalette);
  }, [treeColorPalette]);

  return (
    <div className="absolute left-4 top-4 z-20 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur">
      <div className="flex items-center gap-1" role="tablist" aria-label="Visualização da árvore">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={[
                'rounded-md px-3 py-1.5 text-sm font-semibold tracking-normal transition-colors',
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 border-t border-slate-200 px-2 py-1.5">
        <div className="flex items-center gap-2" aria-label="Paleta de cores da árvore">
          {paletteOptions.map((paletteKey) => {
            const palette = TREE_COLOR_PALETTES[paletteKey];
            const isActive = paletteKey === treeColorPalette;

            return (
              <button
                key={paletteKey}
                type="button"
                aria-label={palette.ariaLabel}
                aria-pressed={isActive}
                title={palette.label}
                className={[
                  'h-5 w-5 rounded-full border transition',
                  isActive
                    ? 'scale-110 ring-2 ring-slate-900 ring-offset-2'
                    : 'hover:scale-105 hover:ring-2 hover:ring-slate-300 hover:ring-offset-1',
                ].join(' ')}
                style={{
                  backgroundColor: palette.swatch,
                  borderColor: palette.swatchBorder,
                }}
                onClick={() => setTreeColorPalette(paletteKey)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
