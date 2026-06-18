import React from 'react';

export function DiscoverResultCard({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h4 className="min-w-0 text-base font-bold text-slate-900">{title}</h4>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </article>
  );
}
