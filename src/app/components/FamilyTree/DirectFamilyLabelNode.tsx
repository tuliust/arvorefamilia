import React from 'react';
import { NodeProps } from 'reactflow';

interface DirectFamilyLabelNodeData {
  label: string;
  width?: number;
}

export const DirectFamilyLabelNode = React.memo(({ data }: NodeProps<DirectFamilyLabelNodeData>) => {
  return (
    <div
      className="pointer-events-none select-none rounded-md border border-slate-300/20 bg-white/0 px-2 py-1 text-center text-[11px] font-bold uppercase tracking-normal text-slate-800"
      aria-label={data.label}
      style={{ width: data.width ?? 180 }}
    >
      {data.label}
    </div>
  );
});

DirectFamilyLabelNode.displayName = 'DirectFamilyLabelNode';
