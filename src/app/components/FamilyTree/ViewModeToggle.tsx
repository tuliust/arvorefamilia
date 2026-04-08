import React from 'react';
import { Columns3, Users } from 'lucide-react';
import { TipoVisualizacaoArvore } from '../../types';

interface ViewModeToggleProps {
  value: TipoVisualizacaoArvore;
  onChange: (value: TipoVisualizacaoArvore) => void;
  className?: string;
}

const OPTIONS: Array<{
  value: TipoVisualizacaoArvore;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'lados',
    label: 'Por lados',
    Icon: Users,
  },
  {
    value: 'geracoes',
    label: 'Por gerações',
    Icon: Columns3,
  },
];

export function ViewModeToggle({ value, onChange, className = '' }: ViewModeToggleProps) {
  return (
    <div
      className={`inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm ${className}`.trim()}
      role="tablist"
      aria-label="Selecionar visualização da árvore"
    >
      {OPTIONS.map(({ value: optionValue, label, Icon }) => {
        const isActive = value === optionValue;

        return (
          <button
            key={optionValue}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(optionValue)}
            className={[
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            ].join(' ')}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}