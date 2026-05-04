import React from 'react';
import { NodeProps } from 'reactflow';

interface DirectFamilyLabelNodeData {
  label: string;
}

export const DirectFamilyLabelNode = React.memo(({ data }: NodeProps<DirectFamilyLabelNodeData>) => {
  return (
    <div
      className="pointer-events-none select-none text-center text-sm font-bold uppercase tracking-normal text-slate-800"
      aria-label={data.label}
    >
      {data.label}
    </div>
  );
});

DirectFamilyLabelNode.displayName = 'DirectFamilyLabelNode';
