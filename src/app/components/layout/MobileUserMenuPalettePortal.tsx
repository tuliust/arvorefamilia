import React, { useEffect, useState } from 'react';
import {
  TREE_COLOR_PALETTE_CSS_VARIABLES,
  TREE_COLOR_PALETTE_STORAGE_KEY,
  TREE_COLOR_PALETTES,
  isTreeColorPalette,
  type TreeColorPalette,
} from '../FamilyTree/treeColorPalettes';

const paletteOptions: TreeColorPalette[] = ['white', 'orange', 'brown'];

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

function hasMobileUserMenuOpen() {
  if (typeof document === 'undefined') return false;
  if (!window.matchMedia('(max-width: 767px)').matches) return false;

  return Boolean(document.querySelector('button[aria-label="Fechar menu"]'));
}

export function MobileUserMenuPalettePortal() {
  const [isVisible, setIsVisible] = useState(false);
  const [treeColorPalette, setTreeColorPalette] = useState<TreeColorPalette>(getStoredPalette);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(hasMobileUserMenuOpen());
    updateVisibility();

    const interval = window.setInterval(updateVisibility, 180);
    window.addEventListener('resize', updateVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', updateVisibility);
    };
  }, []);

  useEffect(() => {
    applyTreePalette(treeColorPalette);
    window.localStorage.setItem(TREE_COLOR_PALETTE_STORAGE_KEY, treeColorPalette);
  }, [treeColorPalette]);

  if (!isVisible) return null;

  return (
    <div className="mobile-user-menu-palette-portal md:hidden" aria-label="Paleta de cores da árvore">
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
            className={isActive ? 'is-active' : undefined}
            style={{
              backgroundColor: palette.swatch,
              borderColor: palette.swatchBorder,
            }}
            onClick={() => setTreeColorPalette(paletteKey)}
          />
        );
      })}
    </div>
  );
}
