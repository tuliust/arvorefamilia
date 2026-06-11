import React from 'react';
import { NodeProps } from 'reactflow';

interface DirectFamilyLabelNodeData {
  label: string;
  subtitle?: string;
  width?: number;
  variant?: 'group' | 'title';
}

export const DirectFamilyLabelNode = React.memo(({ data }: NodeProps<DirectFamilyLabelNodeData>) => {
  if (data.variant === 'title') {
    return (
      <div
        className="pointer-events-none select-none text-center tracking-normal translate-y-4"
        aria-label={data.label}
        style={{ width: data.width ?? 1280 }}
      >
        <div className="whitespace-nowrap text-6xl font-extrabold leading-[4.25rem] text-slate-900">
          {data.label}
        </div>
        {data.subtitle && (
          <div className="mt-2 whitespace-nowrap text-4xl font-semibold leading-10 text-slate-600">
            {data.subtitle}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none relative flex min-h-[32px] w-full select-none items-start justify-center overflow-visible whitespace-nowrap bg-transparent p-0 text-center"
      aria-label={data.label}
      style={{ width: data.width ?? 180 }}
    >
      <span className="inline-flex min-h-[26px] items-center justify-center rounded-full bg-slate-600 px-3.5 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.08em] text-white shadow-md">
        {data.label}
      </span>
    </div>
  );
});

DirectFamilyLabelNode.displayName = 'DirectFamilyLabelNode';
