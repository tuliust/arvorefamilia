import React from 'react';

export type SidebarPanel = 'filters' | 'legend' | 'info';

const SIDEBAR_PANEL_OPTIONS: Array<{ key: SidebarPanel; label: string }> = [
  { key: 'filters', label: 'Filtros' },
  { key: 'legend', label: 'Legendas' },
];

interface SidebarPanelTabsProps {
  activePanel: SidebarPanel;
  onChange: (panel: SidebarPanel) => void;
}

export function SidebarPanelTabs({
  activePanel,
  onChange,
}: SidebarPanelTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-[clamp(0.2rem,0.55vh,0.25rem)] rounded-lg border border-gray-200 bg-gray-50 p-[clamp(0.2rem,0.55vh,0.25rem)]">
      {SIDEBAR_PANEL_OPTIONS.map((option) => {
        const active = activePanel === option.key;

        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.key)}
            className={[
              'flex min-h-[clamp(30px,4.2vh,34px)] items-center justify-center rounded-md px-[clamp(0.4rem,0.9vh,0.5rem)] text-[clamp(11px,1.45vh,12px)] font-semibold leading-tight transition-colors',
              active
                ? 'bg-white text-gray-950 shadow-sm'
                : 'text-gray-500 hover:bg-white/70 hover:text-gray-800',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
