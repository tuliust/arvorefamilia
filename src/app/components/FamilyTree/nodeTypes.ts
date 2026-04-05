import { NodeTypes } from 'reactflow';
import { PersonNode } from './PersonNode';
import { MarriageNode } from './MarriageNode';

// Definir nodeTypes como uma constante estável fora do componente
// para evitar recriação a cada render e o aviso do React Flow
export const nodeTypes: NodeTypes = {
  personNode: PersonNode,
  marriageNode: MarriageNode,
};
