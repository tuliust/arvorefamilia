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
  'direct-central-to-siblings-group',
  'direct-central-to-spouse-group',
  'direct-central-to-children-group',
  'direct-central-to-pets-group',
  'direct-group-filhos-to-netos',
  'direct-group-irmaos-to-sobrinhos',
  'direct-spouse-to-children-pets-split',
  'direct-children-pets-split-to-children',
  'direct-children-pets-split-to-pets',
  'direct-spouse-to-pets-group',
]);

function isMobileDirectFamilyTreeView() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  return (
    window.matchMedia('(max-width: 767px)').matches &&
    document.querySelector('[data-export-root="family-tree"][data-export-view="minha-arvore"]') !== null
  );
}

function shouldSuppressMobileLowerEdge(id: string) {
  if (!isMobileDirectFamilyTreeView()) return false;
  if (MOBILE_DIRECT_LOWER_EDGE_IDS.has(id)) return true;

  return (
    (id.startsWith('direct-central-to-') && id.endsWith('-group')) ||
    id === 'direct-group-filhos-to-netos' ||
    id === 'direct-group-irmaos-to-sobrinhos' ||
    id.startsWith('direct-spouse-to-') ||
    id.startsWith('direct-children-pets-split')
  );
}

function directBezierPath(sourceX: number, sourceY: number, targetX: number, targetY: number) {
  const midX = sourceX + (targetX - sourceX) / 2;

  if (Math.abs(sourceY - targetY) <= 4) {
    const y = (sourceY + targetY) / 2;
    return `M ${sourceX} ${y} L ${targetX} ${y}`;
  }

  return `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;
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
    const path = data.forceHorizontal && Math.abs(sourceY - targetY) <= horizontalTolerance
      ? `M ${sourceX} ${(sourceY + targetY) / 2} L ${targetX} ${(sourceY + targetY) / 2}`
      : `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

    return (
      <BaseEdge
        id={id}
        path={path}
        style={style}
        markerEnd={markerEnd}
      />
    );
  }

  if (data?.kind === 'directElbowFromCenter') {
    const elbowY = data.elbowY ?? sourceY + 42;
    const path = [
      `M ${sourceX} ${sourceY}`,
      `L ${sourceX} ${elbowY}`,
      `L ${targetX} ${elbowY}`,
      `L ${targetX} ${targetY}`,
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'directSideElbow') {
    const elbowX = data.elbowX ?? sourceX + (targetX - sourceX) / 2;
    const path = [
      `M ${sourceX} ${sourceY}`,
      `L ${elbowX} ${sourceY}`,
      `L ${elbowX} ${targetY}`,
      `L ${targetX} ${targetY}`,
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'directSmooth') {
    return (
      <BaseEdge
        id={id}
        path={directBezierPath(sourceX, sourceY, targetX, targetY)}
        style={style}
        markerEnd={markerEnd}
      />
    );
  }

  if (data?.kind === 'familyChild') {
    const startX = data.startX ?? sourceX;
    const startY = data.startY ?? sourceY;
    const trunkX = data.trunkX ?? sourceX + (targetX - sourceX) / 2;
    const trunkMinY = data.trunkMinY ?? Math.min(startY, targetY);
    const trunkMaxY = data.trunkMaxY ?? Math.max(startY, targetY);

    const path = [
      `M ${startX} ${startY}`,
      `L ${trunkX} ${startY}`,
      `M ${trunkX} ${trunkMinY}`,
      `L ${trunkX} ${trunkMaxY}`,
      `M ${trunkX} ${targetY}`,
      `L ${targetX} ${targetY}`,
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'siblings') {
    const attachGap = data.attachGap ?? 16;
    const sourceSideX = sourceX;
    const targetSideX = targetX;
    const sourceSideY = sourceY;
    const targetSideY = targetY;
    const corridorX = data.corridorX ?? Math.min(sourceSideX, targetSideX) - attachGap;

    const path = [
      `M ${sourceSideX} ${sourceSideY}`,
      `L ${corridorX} ${sourceSideY}`,
      `L ${corridorX} ${targetSideY}`,
      `L ${targetSideX} ${targetSideY}`,
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'singleParentChild') {
    const corridorY = data.corridorY ?? sourceY + (data.offset ?? 28);
    const corridorX = typeof data.corridorX === 'number'
      ? data.corridorX
      : sourceX + (targetX - sourceX) / 2;

    const path = [
      `M ${sourceX} ${sourceY}`,
      `L ${sourceX} ${corridorY}`,
      `L ${corridorX} ${corridorY}`,
      `L ${corridorX} ${targetY}`,
      `L ${targetX} ${targetY}`,
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  if (data?.kind === 'generationChild') {
    const corridorX = typeof data.corridorX === 'number'
      ? data.corridorX
      : sourceX + (targetX - sourceX) / 2;
    const corridorY = typeof data.corridorY === 'number'
      ? data.corridorY
      : sourceY;

    const path = [
      `M ${sourceX} ${sourceY}`,
      `L ${corridorX} ${sourceY}`,
      `L ${corridorX} ${corridorY}`,
      `L ${corridorX} ${targetY}`,
      `L ${targetX} ${targetY}`,
    ].join(' ');

    return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
  }

  let midX: number;

  if (typeof data?.corridorX === 'number') {
    midX = data.corridorX;
  } else if (data?.side === 'left') {
    midX = Math.min(sourceX, targetX) - (data.offset ?? 48);
  } else if (data?.side === 'right') {
    midX = Math.max(sourceX, targetX) + (data.offset ?? 48);
  } else {
    midX = sourceX + (targetX - sourceX) / 2;
  }

  const path = [
    `M ${sourceX} ${sourceY}`,
    `L ${midX} ${sourceY}`,
    `L ${midX} ${targetY}`,
    `L ${targetX} ${targetY}`,
  ].join(' ');

  return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
}
