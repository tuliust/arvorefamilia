import React from 'react';
import { Handle, NodeTypes, Position } from 'reactflow';
import { PersonNode } from './PersonNode';
import { MarriageNode } from './MarriageNode';
import { GenerationHeaderNode } from './GenerationHeaderNode';
import { DirectFamilyLabelNode } from './DirectFamilyLabelNode';

function DirectFamilyAnchorNode() {
  const hiddenHandle = { background: 'transparent', border: 'none', width: 1, height: 1 };

  return React.createElement(
    'div',
    { 'aria-hidden': true, className: 'pointer-events-none h-px w-px opacity-0' },
    React.createElement(Handle, { type: 'target', position: Position.Top, id: 'top', style: { top: 0, left: 0, ...hiddenHandle } }),
    React.createElement(Handle, { type: 'source', position: Position.Bottom, id: 'bottom', style: { bottom: 0, left: 0, ...hiddenHandle } }),
    React.createElement(Handle, { type: 'source', position: Position.Right, id: 'right', style: { right: 0, top: 0, ...hiddenHandle } }),
    React.createElement(Handle, { type: 'target', position: Position.Left, id: 'left', style: { left: 0, top: 0, ...hiddenHandle } })
  );
}

export const nodeTypes: NodeTypes = {
  personNode: PersonNode,
  marriageNode: MarriageNode,
  generationHeaderNode: GenerationHeaderNode,
  directFamilyLabelNode: DirectFamilyLabelNode,
  directFamilyAnchorNode: DirectFamilyAnchorNode,
};
