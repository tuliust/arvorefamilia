import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCount } from './meusVinculosUtils';

type RelationshipGroupPanelProps = {
  id?: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  count: number;
  pendingCount?: number;
  emptyTitle: string;
  emptyDescription: string;
  addButtonLabel: string;
  onAdd: () => void;
  showEmptyAddButton?: boolean;
  children: React.ReactNode;
};

export function RelationshipGroupPanel({
  id,
  title,
  description,
  icon: Icon,
  count,
  pendingCount = 0,
  emptyTitle,
  emptyDescription,
  addButtonLabel,
  onAdd,
  showEmptyAddButton = true,
  children,
}: RelationshipGroupPanelProps) {
  return (
    <section id={id} className="scroll-mt-24 min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            {Icon && <Icon className="h-5 w-5 shrink-0 text-blue-700" />}
            <h3 className="min-w-0 break-words text-lg font-semibold text-gray-950">{title}</h3>
            {pendingCount > 0 && (
              <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Em análise
              </span>
            )}
          </div>
          <p className="mt-1 break-words text-sm text-gray-600">{description}</p>
          <p className="mt-2 text-xs font-medium text-gray-500">{formatCount(count, 'vínculo', 'vínculos')}</p>
        </div>
        <Button type="button" variant="outline" className="w-full shrink-0 sm:w-auto" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          {addButtonLabel}
        </Button>
      </div>

      {count === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
          <p className="font-semibold text-gray-900">{emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-xl break-words text-sm text-gray-600">{emptyDescription}</p>
          {showEmptyAddButton && (
            <Button type="button" variant="outline" className="mt-4 w-full sm:w-auto" onClick={onAdd}>
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">{children}</div>
      )}
    </section>
  );
}
