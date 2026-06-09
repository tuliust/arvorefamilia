import React from 'react';
import { BaseEdge, EdgeProps } from 'reactflow';

interface OrthogonalEdgeData {
  corridorX?: number;
  corridorY?: number;
  side?: 'left' | 'right';
  offset?: number;
  kind?:
    | 'child'
    | 'familyChild'
    | 'siblings'
    | 'singleParentChild'
    | 'generationChild'
    | 'directSmooth'
    | 'directHorizontal'
    | 'directElbowFromCenter'
    | 'directSideElbow';
  nodeWidth?: number;
  nodeHeight?: number;
  attachGap?: number;
  attachYOffset?: number;
  startX?: number;
  startY?: number;
  trunkX?: number;
  trunkMinY?: number;
  trunkMaxY?: number;
  elbowY?: number;
  elbowX?: number;
  forceHorizontal?: boolean;
  horizontalTolerance?: number;
}

const MOBILE_DIRECT_LOWER_EDGE_IDS = new Set([
  'direct-central-to-children-group',
  'direct-central-to-pets-group',
  'direct-group-filhos-to-netos',
  'direct-group-irmaos-to-sobrinhos',
  'direct-spouse-to-children-pets-split',
  'direct-children-pets-split-to-children',
  'direct-children-pets-split-to-pets',
  'direct-spouse-to-pets-group',
]);

function segment(command: string, x: number, y: number) {
  return [command, x, y].join(' ');
}

function isMobileDirectFamilyTreeView() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  return window.matchMedia('(max-width: 767px)').matches &&
    document.querySelector('[data-export-root="family-tree"][data-export-view="minha-arvore"]') !== null;
}

function shouldSuppressMobileLowerEdge(id: string) {
  if (!isMobileDirectFamilyTreeView()) return false;
  if (MOBILE_DIRECT_LOWER_EDGE_IDS.has(id)) return true;

  return id === 'direct-central-to-children-group' ||
    id === 'direct-central-to-pets-group' ||
    id === 'direct-group-filhos-to-netos' ||
    id === 'direct-group-irmaos-to-sobrinhos' ||
    id.startsWith('direct-spouse-to-') ||
    id.startsWith('direct-children-pets-split');
}

function shouldUseCompactMobileSplit(id: string) {
  return isMobileDirectFamilyTreeView() &&
    (id === 'direct-central-to-siblings-group' || id === 'direct-central-to-spouse-group');
}

function directBezierPath(sourceX: number, sourceY: number, targetX: number, targetY: number) {
  const midX = sourceX + (targetX - sourceX) / 2;

  if (Math.abs(sourceY - targetY) <= 4) {
    const y = (sourceY + targetY) / 2;
    return [segment('M', sourceX, y), segment('L', targetX, y)].join(' ');
  }

  return [
    segment('M', sourceX, sourceY),
    'C',
    midX,
    sourceY,
    midX,
    targetY,
    targetX,
    targetY,
  ].join(' ');
}

export function OrthogonalChildEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  data,
}: EdgeProps<OrthogonalEdgeData>) {
  if (shouldSuppressMobileLowerEdge(id)) {
    return null;
  }

  if (data?.kind === 'directHorizontal') {
    const horizontalTolerance = data.horizontalTolerance ?? 4;
    const y = (sourceY + targetY) / 2;
    const path = data.forceHorizontal && Math.abs(sourceY - targetY) <= horizontalTolerance
      ? [segment('M', sourceX, y), segment('L', targetX, y)].join(' ')
      : [segment('M', sourceX, sourceY), segment('L', targetX, targetY)].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'directElbowFromCenter') {
    const elbowY = shouldUseCompactMobileSplit(id) ? sourceY + 34 : data.elbowY ?? sourceY + 42;
    const path = [
      segment('M', sourceX, sourceY),
      segment('L', sourceX, elbowY),
      segment('L', targetX, elbowY),
      segment('L', targetX, targetY),
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'directSideElbow') {
    const elbowX = data.elbowX ?? sourceX + (targetX - sourceX) / 2;
    const path = [
      segment('M', sourceX, sourceY),
      segment('L', elbowX, sourceY),
      segment('L', elbowX, targetY),
      segment('L', targetX, targetY),
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'directSmooth') {
    return <BaseEdge id={id} path={directBezierPath(sourceX, sourceY, targetX, targetY)} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'familyChild') {
    const startX = data.startX ?? sourceX;
    const startY = data.startY ?? sourceY;
    const trunkX = data.trunkX ?? sourceX + (targetX - sourceX) / 2;
    const trunkMinY = data.trunkMinY ?? Math.min(startY, targetY);
    const trunkMaxY = data.trunkMaxY ?? Math.max(startY, targetY);
    const path = [
      segment('M', startX, startY),
      segment('L', trunkX, startY),
      segment('M', trunkX, trunkMinY),
      segment('L', trunkX, trunkMaxY),
      segment('M', trunkX, targetY),
      segment('L', targetX, targetY),
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'siblings') {
    const attachGap = data.attachGap ?? 16;
    const corridorX = data.corridorX ?? Math.min(sourceX, targetX) - attachGap;
    const path = [
      segment('M', sourceX, sourceY),
      segment('L', corridorX, sourceY),
      segment('L', corridorX, targetY),
      segment('L', targetX, targetY),
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'singleParentChild') {
    const corridorY = data.corridorY ?? sourceY + (data.offset ?? 28);
    const corridorX = typeof data.corridorX === 'number' ? data.corridorX : sourceX + (targetX - sourceX) / 2;
    const path = [
      segment('M', sourceX, sourceY),
      segment('L', sourceX, corridorY),
      segment('L', corridorX, corridorY),
      segment('L', corridorX, targetY),
      segment('L', targetX, targetY),
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'generationChild') {
    const corridorX = typeof data.corridorX === 'number' ? data.corridorX : sourceX + (targetX - sourceX) / 2;
    const corridorY = typeof data.corridorY === 'number' ? data.corridorY : sourceY;
    const path = [
      segment('M', sourceX, sourceY),
      segment('L', corridorX, sourceY),
      segment('L', corridorX, corridorY),
      segment('L', corridorX, targetY),
      segment('L', targetX, targetY),
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  const midX = typeof data?.corridorX === 'number'
    ? data.corridorX
    : data?.side === 'left'
      ? Math.min(sourceX, targetX) - (data.offset ?? 48)
      : data?.side === 'right'
        ? Math.max(sourceX, targetX) + (data.offset ?? 48)
        : sourceX + (targetX - sourceX) / 2;
  const path = [
    segment('M', sourceX, sourceY),
    segment('L', midX, sourceY),
    segment('L', midX, targetY),
    segment('L', targetX, targetY),
  ].join(' ');

  return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
}
