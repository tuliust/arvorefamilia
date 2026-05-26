import React from 'react';

export function DiscoverResultCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 shadow-sm">
      <h4 className="mb-3 text-base font-bold text-slate-900">{title}</h4>
      {children}
    </article>
  );
}
