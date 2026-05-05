import React from 'react';
import { NodeProps } from 'reactflow';

interface DirectFamilyLabelNodeData {
  label: string;
  width?: number;
  variant?: 'group' | 'title';
}

export const DirectFamilyLabelNode = React.memo(({ data }: NodeProps<DirectFamilyLabelNodeData>) => {
  if (data.variant === 'title') {
    return (
      <div
        className="pointer-events-none select-none text-center text-4xl font-bold tracking-wide text-slate-900"
        aria-label={data.label}
        style={{ width: data.width ?? 760 }}
      >
        {data.label}
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none flex min-h-[30px] select-none items-center justify-center rounded-md border border-slate-500/40 bg-white px-4 py-1 text-center text-[12px] font-bold uppercase tracking-normal text-slate-800"
      aria-label={data.label}
      style={{ width: data.width ?? 180 }}
    >
      {data.label}
    </div>
  );
});

DirectFamilyLabelNode.displayName = 'DirectFamilyLabelNode';
