import { NodeTypes } from 'reactflow';
import { PersonNode } from './PersonNode';
import { MarriageNode } from './MarriageNode';

export const nodeTypes: NodeTypes = {
  personNode: PersonNode,
  marriageNode: MarriageNode,
};