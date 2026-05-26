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
    <div className="grid grid-cols-2 gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
      {SIDEBAR_PANEL_OPTIONS.map((option) => {
        const active = activePanel === option.key;

        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.key)}
            className={[
              'flex min-h-8 items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors',
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
