import React from 'react';

export type CuriosidadesStatus = 'Em breve' | 'Aguardando dados familiares';

export type CuriosidadesPlaceholderCard = {
  title: string;
  description: string;
  status: CuriosidadesStatus;
  icon: React.ComponentType<{ className?: string }>;
};

export const curiositySectionCardClassName = 'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm';

export const curiosityStatusClassName = 'inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700';

