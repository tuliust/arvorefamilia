import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User, Dog } from 'lucide-react';
import { Pessoa } from '../../types';

interface PersonNodeData {
  pessoa: Pessoa;
  onClick?: (pessoa: Pessoa) => void;
  isSelected?: boolean;
}

export const PersonNode = React.memo(({ data }: NodeProps<PersonNodeData>) => {
  const { pessoa, onClick, isSelected } = data;
  const isPet = pessoa.humano_ou_pet === 'Pet';
  const isFalecido = !!pessoa.data_falecimento;

  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick(pessoa);
    }
  }, [onClick, pessoa]);

  const getBorderColor = () => {
    if (isSelected) return 'border-blue-600';
    if (isPet) return 'border-yellow-500';
    if (isFalecido) return 'border-purple-500';
    return 'border-blue-500';
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 transition-all cursor-pointer shadow-md hover:shadow-lg ${getBorderColor()} ${
        isSelected ? 'ring-2 ring-blue-300' : ''
      }`}
      onClick={handleClick}
      style={{
        width: 280,
        minHeight: 120,
        height: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: pessoa.cor_bg_card || '#ffffff',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ top: -1, left: '50%', background: 'transparent', border: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{ top: -1, left: '50%', background: 'transparent', border: 'none' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-source"
        style={{ top: -1, left: '60%', background: 'transparent', border: 'none' }}
      />

      <Handle type="source" position={Position.Right} id="right-source" style={{ right: 0, top: '50%' }} />
      <Handle type="target" position={Position.Right} id="right-target" style={{ right: 0, top: '50%' }} />

      <Handle type="source" position={Position.Left} id="left-source" style={{ left: 0, top: '50%' }} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ left: 0, top: '50%' }} />

      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            isPet ? 'bg-amber-200' : isFalecido ? 'bg-gray-300' : 'bg-blue-200'
          }`}
        >
          {pessoa.foto_principal_url ? (
            <img
              src={pessoa.foto_principal_url}
              alt={pessoa.nome_completo}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : isPet ? (
            <Dog className="w-6 h-6 text-amber-700" />
          ) : (
            <User className="w-6 h-6 text-blue-700" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight truncate" title={pessoa.nome_completo}>
            {pessoa.nome_completo}
          </h3>

          {pessoa.data_nascimento && (
            <p className="text-xs text-gray-600 mt-1">
              ✦ {pessoa.data_nascimento}
              {pessoa.data_falecimento && ` - † ${pessoa.data_falecimento}`}
            </p>
          )}

          {pessoa.local_nascimento && (
            <p className="text-xs text-gray-500 mt-0.5 truncate" title={pessoa.local_nascimento}>
              📍 {pessoa.local_nascimento}
            </p>
          )}

          {isPet && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-200 text-amber-800 text-xs rounded-full">
              🐾 Pet
            </span>
          )}

          {isFalecido && !isPet && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
              🕊️ In Memoriam
            </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: 0, left: '50%' }} />
    </div>
  );
});

PersonNode.displayName = 'PersonNode';