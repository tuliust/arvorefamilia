import React from 'react';
import { Handle, NodeProps, NodeTypes, Position } from 'reactflow';
import { PersonNode } from './PersonNode';
import { MarriageNode } from './MarriageNode';
import { DirectFamilyLabelNode } from './DirectFamilyLabelNode';
import { GenealogyFamilyConnectorNode } from './GenealogyFamilyConnectorNode';
import { FAMILY_TREE_COLORS } from './visualTokens';
import { PersonNodeData } from './types';
import {
  DIRECT_FAMILY_GROUP_CONTAINER_BORDER,
  DIRECT_FAMILY_STATUS_BORDER_COLORS,
} from './directFamilyColors';

interface DirectFamilyGroupBoxNodeData {
  width?: number;
  height?: number;
}

interface DirectFamilyLegendNodeData {
  width?: number;
  height?: number;
}

const CENTRAL_AREA_CARD_EXTRA_WIDTH = 80;
const CENTRAL_AREA_CENTER_OFFSET = CENTRAL_AREA_CARD_EXTRA_WIDTH / 2;
const DIRECT_FAMILY_LOGICAL_CENTER_X = 1610;
const CENTRAL_AREA_CARD_RELATIONS = new Set([
  'parent',
  'sibling',
  'nephewNiece',
  'spouse',
  'child',
  'grandchild',
  'pet',
]);
const CENTRAL_AREA_GROUPS = new Set([
  'pai',
  'mae',
  'irmaos',
  'sobrinhos',
  'conjuge',
  'filhos',
  'netos',
  'pets',
]);
const CENTRAL_AREA_RIGHT_GROUPS = new Set([
  'mae',
  'conjuge',
  'filhos',
  'netos',
  'pets',
]);

type GroupAnchorSide = 'top' | 'bottom' | 'left' | 'right' | 'center';

function getDirectFamilyGroupKey(id?: string) {
  return id?.replace(/^direct-group-box-/, '');
}

function getDirectFamilyLabelGroupKey(id?: string) {
  return id?.replace(/^direct-label-/, '');
}

function getDirectFamilyAnchorInfo(id?: string): { groupKey: string; anchorSide: GroupAnchorSide } | null {
  const match = id?.match(/^direct-group-(.+)-(top|bottom|left|right|center)-anchor$/);
  if (!match) return null;

  return {
    groupKey: match[1],
    anchorSide: match[2] as GroupAnchorSide,
  };
}

function isRightCentralGroup(groupKey?: string) {
  return Boolean(groupKey && CENTRAL_AREA_RIGHT_GROUPS.has(groupKey));
}

function isStretchedCentralGroup(groupKey?: string) {
  return Boolean(groupKey && CENTRAL_AREA_GROUPS.has(groupKey));
}

function getCentralGroupVisualShift(groupKey?: string) {
  if (!isStretchedCentralGroup(groupKey)) return 0;
  return isRightCentralGroup(groupKey) ? -CENTRAL_AREA_CARD_EXTRA_WIDTH : 0;
}

function getCentralGroupCenterShift(groupKey?: string) {
  if (!isStretchedCentralGroup(groupKey)) return 0;
  return isRightCentralGroup(groupKey) ? -CENTRAL_AREA_CENTER_OFFSET : CENTRAL_AREA_CENTER_OFFSET;
}

function getCentralGroupAnchorShift(groupKey: string, anchorSide: GroupAnchorSide) {
  if (!isStretchedCentralGroup(groupKey)) return 0;

  if (anchorSide === 'top' || anchorSide === 'bottom' || anchorSide === 'center') {
    return getCentralGroupCenterShift(groupKey);
  }

  if (isRightCentralGroup(groupKey)) {
    return anchorSide === 'left' ? -CENTRAL_AREA_CARD_EXTRA_WIDTH : 0;
  }

  return anchorSide === 'right' ? CENTRAL_AREA_CARD_EXTRA_WIDTH : 0;
}

function DirectFamilyAnchorNode(props: NodeProps) {
  const anchorInfo = getDirectFamilyAnchorInfo(props.id);
  const anchorShiftX = anchorInfo
    ? getCentralGroupAnchorShift(anchorInfo.groupKey, anchorInfo.anchorSide)
    : 0;
  const hiddenHandle = { background: 'transparent', border: 'none', width: 1, height: 1 };

  return React.createElement(
    'div',
    {
      'aria-hidden': true,
      className: 'pointer-events-none h-px w-px opacity-0',
      style: {
        transform: anchorShiftX ? `translateX(${anchorShiftX}px)` : undefined,
      },
    },
    React.createElement(Handle, { type: 'target', position: Position.Top, id: 'top', style: { top: 0, left: 0, ...hiddenHandle } }),
    React.createElement(Handle, { type: 'source', position: Position.Bottom, id: 'bottom', style: { bottom: 0, left: 0, ...hiddenHandle } }),
    React.createElement(Handle, { type: 'source', position: Position.Right, id: 'right', style: { right: 0, top: 0, ...hiddenHandle } }),
    React.createElement(Handle, { type: 'target', position: Position.Right, id: 'right', style: { right: 0, top: 0, ...hiddenHandle } }),
    React.createElement(Handle, { type: 'source', position: Position.Left, id: 'left', style: { left: 0, top: 0, ...hiddenHandle } }),
    React.createElement(Handle, { type: 'target', position: Position.Left, id: 'left', style: { left: 0, top: 0, ...hiddenHandle } })
  );
}

function CentralAreaPersonNode(props: NodeProps<PersonNodeData>) {
  const relation = props.data?.directRelation;
  const shouldStretchCard = Boolean(
    relation &&
    !props.data?.isCentralPerson &&
    CENTRAL_AREA_CARD_RELATIONS.has(relation)
  );

  if (!shouldStretchCard) {
    return React.createElement(PersonNode, props);
  }

  const currentWidth = Number(props.data?.layoutWidth || props.data?.width);
  const nextWidth = Number.isFinite(currentWidth) && currentWidth > 0
    ? currentWidth + CENTRAL_AREA_CARD_EXTRA_WIDTH
    : currentWidth;
  const shouldStretchLeft = typeof props.xPos === 'number' && props.xPos > DIRECT_FAMILY_LOGICAL_CENTER_X;
  const nextProps = {
    ...props,
    data: {
      ...props.data,
      width: nextWidth,
      layoutWidth: nextWidth,
    },
  };

  return React.createElement(
    'div',
    {
      style: {
        transform: shouldStretchLeft ? `translateX(-${CENTRAL_AREA_CARD_EXTRA_WIDTH}px)` : undefined,
      },
    },
    React.createElement(PersonNode, nextProps)
  );
}

function DirectFamilyCenteredLabelNode(props: NodeProps) {
  const groupKey = getDirectFamilyLabelGroupKey(props.id);
  const shiftX = getCentralGroupCenterShift(groupKey);

  return React.createElement(
    'div',
    {
      style: {
        transform: shiftX ? `translateX(${shiftX}px)` : undefined,
      },
    },
    React.createElement(DirectFamilyLabelNode, props)
  );
}

function DirectFamilyGroupBoxNode({ data, id }: NodeProps<DirectFamilyGroupBoxNodeData>) {
  const groupKey = getDirectFamilyGroupKey(id);
  const shouldStretchGroup = isStretchedCentralGroup(groupKey);
  const currentWidth = data.width ?? 0;
  const width = shouldStretchGroup ? currentWidth + CENTRAL_AREA_CARD_EXTRA_WIDTH : currentWidth;
  const shiftX = getCentralGroupVisualShift(groupKey);

  return React.createElement('div', {
    'aria-hidden': true,
    className: `pointer-events-none rounded-xl direct-family-group-box ${id}`,
    style: {
      width,
      height: data.height ?? 0,
      transform: shiftX ? `translateX(${shiftX}px)` : undefined,
      background: DIRECT_FAMILY_GROUP_CONTAINER_BORDER.background,
      borderColor: DIRECT_FAMILY_GROUP_CONTAINER_BORDER.color,
      borderWidth: DIRECT_FAMILY_GROUP_CONTAINER_BORDER.width,
      borderStyle: 'solid',
    },
  });
}

function LegendSample({ type }: { type: 'alive' | 'deceased' | 'spouse' | 'child' | 'sibling' }) {
  if (type === 'alive' || type === 'deceased') {
    return React.createElement('span', {
      className: 'h-4 w-7 rounded bg-white',
      style: {
        borderColor: type === 'alive'
          ? DIRECT_FAMILY_STATUS_BORDER_COLORS.alive
          : DIRECT_FAMILY_STATUS_BORDER_COLORS.deceased,
        borderWidth: 3,
        borderStyle: 'solid',
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
      className: 'pointer-events-none rounded-md border border-gray-200 px-4 py-2.5 shadow-sm',
      style: {
        width: data.width ?? 760,
        height: data.height ?? 92,
        background: 'var(--tree-palette-legend-bg, rgba(255, 255, 255, 0.9))',
      },
    },
    React.createElement(
      'div',
      {
        className: 'grid h-full content-center gap-x-4 gap-y-1',
        style: { gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' },
      },
      items.map(([type, label]) =>
        React.createElement(
          'div',
          { key: type, className: 'flex min-w-0 items-center justify-center gap-2 text-xs text-gray-600' },
          React.createElement('span', { className: 'flex w-8 shrink-0 items-center justify-center' }, React.createElement(LegendSample, { type })),
          React.createElement('span', { className: 'truncate' }, label)
        )
      )
    )
  );
}

export const nodeTypes: NodeTypes = {
  personNode: CentralAreaPersonNode,
  marriageNode: MarriageNode,
  directFamilyLabelNode: DirectFamilyCenteredLabelNode,
  directFamilyAnchorNode: DirectFamilyAnchorNode,
  directFamilyGroupBoxNode: DirectFamilyGroupBoxNode,
  directFamilyLegendNode: DirectFamilyLegendNode,
  genealogyFamilyConnectorNode: GenealogyFamilyConnectorNode,
};