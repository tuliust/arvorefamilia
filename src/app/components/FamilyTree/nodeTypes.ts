import { NodeTypes } from 'reactflow';
import { PersonNode } from './PersonNode';
import { MarriageNode } from './MarriageNode';
import { GenerationHeaderNode } from './GenerationHeaderNode';
import { DirectFamilyLabelNode } from './DirectFamilyLabelNode';

export const nodeTypes: NodeTypes = {
  personNode: PersonNode,
  marriageNode: MarriageNode,
  generationHeaderNode: GenerationHeaderNode,
  directFamilyLabelNode: DirectFamilyLabelNode,
};
