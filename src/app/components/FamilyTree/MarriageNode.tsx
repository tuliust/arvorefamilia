import React from 'react';
import { Handle, Position } from 'reactflow';

interface MarriageNodeProps {
  data: {
    emoji?: string;
  };
}

export const MarriageNode = React.memo(({ data }: MarriageNodeProps) => (
  <div className="flex items-center justify-center w-8 h-8 bg-white border-2 border-emerald-500 rounded-full text-lg relative">
    <Handle type="target" position={Position.Top} id="top" style={{ background: '#10b981', top: 0, left: '50%' }} />
    <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#10b981', bottom: 0, left: '50%' }} />
    <Handle type="source" position={Position.Right} id="right" style={{ background: '#10b981', right: 0, top: '50%' }} />
    <Handle type="target" position={Position.Left} id="left" style={{ background: '#10b981', left: 0, top: '50%' }} />
    {data.emoji || '💑'}
  </div>
));

MarriageNode.displayName = 'MarriageNode';