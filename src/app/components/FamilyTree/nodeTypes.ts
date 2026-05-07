import React from 'react';
import { Handle, NodeProps, NodeTypes, Position } from 'reactflow';
import { PersonNode } from './PersonNode';
import { MarriageNode } from './MarriageNode';
import { GenerationHeaderNode } from './GenerationHeaderNode';
import { DirectFamilyLabelNode } from './DirectFamilyLabelNode';
import { FAMILY_TREE_COLORS } from './visualTokens';

interface DirectFamilyGroupBoxNodeData {
  width?: number;
  height?: number;
}

interface DirectFamilyLegendNodeData {
  width?: number;
  height?: number;
}

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

function DirectFamilyGroupBoxNode({ data }: NodeProps<DirectFamilyGroupBoxNodeData>) {
  return React.createElement('div', {
    'aria-hidden': true,
    className: 'pointer-events-none rounded-xl border border-slate-600/60 bg-white/[0.04]',
    style: {
      width: data.width ?? 0,
      height: data.height ?? 0,
    },
  });
}

function LegendSample({ type }: { type: 'alive' | 'deceased' | 'spouse' | 'child' | 'sibling' }) {
  if (type === 'alive' || type === 'deceased') {
    return React.createElement('span', {
      className: 'h-4 w-7 rounded border-2 bg-white',
      style: {
        borderColor: type === 'alive'
          ? FAMILY_TREE_COLORS.CARD_BORDER_ALIVE
          : FAMILY_TREE_COLORS.CARD_BORDER_DECEASED,
      },
    });
  }

  return React.createElement('span', {
    className: 'block h-0 w-8 border-t-2',
    style: {
      borderColor: type === 'spouse'
        ? FAMILY_TREE_COLORS.EDGE_SPOUSE
        : type === 'child'
          ? FAMILY_TREE_COLORS.EDGE_CHILD
          : FAMILY_TREE_COLORS.EDGE_SIBLING,
      borderStyle: type === 'sibling' ? 'dashed' : 'solid',
    },
  });
}

function DirectFamilyLegendNode({ data }: NodeProps<DirectFamilyLegendNodeData>) {
  const items = [
    ['alive', 'Vivas'],
    ['deceased', 'Falecidas'],
    ['spouse', 'Cônjuges'],
    ['child', 'Filhos'],
    ['sibling', 'Irmãos'],
  ] as const;

  return React.createElement(
    'div',
    {
      className: 'pointer-events-none rounded-md border border-gray-200 bg-white/90 px-3 py-2 shadow-sm',
      style: {
        width: data.width ?? 570,
        height: data.height ?? 74,
      },
    },
    React.createElement(
      'div',
      { className: 'grid h-full grid-cols-2 content-center gap-x-3 gap-y-1' },
      items.map(([type, label]) =>
        React.createElement(
          'div',
          { key: type, className: 'flex min-w-0 items-center gap-2 text-[11px] text-gray-600' },
          React.createElement('span', { className: 'flex w-8 shrink-0 items-center justify-center' }, React.createElement(LegendSample, { type })),
          React.createElement('span', { className: 'truncate' }, label)
        )
      )
    )
  );
}

export const nodeTypes: NodeTypes = {
  personNode: PersonNode,
  marriageNode: MarriageNode,
  generationHeaderNode: GenerationHeaderNode,
  directFamilyLabelNode: DirectFamilyLabelNode,
  directFamilyAnchorNode: DirectFamilyAnchorNode,
  directFamilyGroupBoxNode: DirectFamilyGroupBoxNode,
  directFamilyLegendNode: DirectFamilyLegendNode,
};
