import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User, Dog, Eye, Pencil, Link2, Trash2 } from 'lucide-react';
import { PersonNodeData } from './types';
import { FAMILY_TREE_COLORS, hasDeathDate } from './visualTokens';

function PersonHandles() {
  const hiddenHandle = { background: 'transparent', border: 'none' };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ top: -1, left: '50%', ...hiddenHandle }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{ top: -1, left: '50%', ...hiddenHandle }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-source-secondary"
        style={{ top: -1, left: '60%', ...hiddenHandle }}
      />

      <Handle type="source" position={Position.Right} id="right-source" style={{ right: 0, top: '50%', ...hiddenHandle }} />
      <Handle type="target" position={Position.Right} id="right-target" style={{ right: 0, top: '50%', ...hiddenHandle }} />
      <Handle type="source" position={Position.Right} id="spouse-right" style={{ right: 0, top: '50%', ...hiddenHandle }} />
      <Handle type="target" position={Position.Right} id="spouse-right-target" style={{ right: 0, top: '50%', ...hiddenHandle }} />
      <Handle type="source" position={Position.Right} id="child-right" style={{ right: 0, top: '50%', ...hiddenHandle }} />
      <Handle type="target" position={Position.Right} id="sibling-right" style={{ right: 0, top: '50%', ...hiddenHandle }} />

      <Handle type="source" position={Position.Left} id="left-source" style={{ left: 0, top: '50%', ...hiddenHandle }} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ left: 0, top: '50%', ...hiddenHandle }} />
      <Handle type="target" position={Position.Left} id="spouse-left" style={{ left: 0, top: '50%', ...hiddenHandle }} />
      <Handle type="source" position={Position.Left} id="spouse-left-source" style={{ left: 0, top: '50%', ...hiddenHandle }} />
      <Handle type="target" position={Position.Left} id="child-left" style={{ left: 0, top: '50%', ...hiddenHandle }} />
      <Handle type="source" position={Position.Left} id="sibling-left" style={{ left: 0, top: '50%', ...hiddenHandle }} />

      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: 0, left: '50%', ...hiddenHandle }} />
    </>
  );
}

const directRelationStyles: Record<NonNullable<PersonNodeData['directRelation']>, {
  background: string;
  border: string;
  color: string;
  muted: string;
}> = {
  central: {
    background: '#ffffff',
    border: '#0284c7',
    color: '#111827',
    muted: '#4b5563',
  },
  parent: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    border: '#38bdf8',
    color: '#ffffff',
    muted: 'rgba(255,255,255,0.82)',
  },
  sibling: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    border: '#38bdf8',
    color: '#ffffff',
    muted: 'rgba(255,255,255,0.82)',
  },
  child: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    border: '#38bdf8',
    color: '#ffffff',
    muted: 'rgba(255,255,255,0.82)',
  },
  spouse: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    border: '#38bdf8',
    color: '#ffffff',
    muted: 'rgba(255,255,255,0.82)',
  },
  grandparent: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    border: '#a78bfa',
    color: '#ffffff',
    muted: 'rgba(255,255,255,0.82)',
  },
  greatGrandparent: {
    background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
    border: '#fdba74',
    color: '#ffffff',
    muted: 'rgba(255,255,255,0.82)',
  },
  greatGreatGrandparent: {
    background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
    border: '#fca5a5',
    color: '#ffffff',
    muted: 'rgba(255,255,255,0.82)',
  },
  uncleAunt: {
    background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
    border: '#fca5a5',
    color: '#ffffff',
    muted: 'rgba(255,255,255,0.82)',
  },
  cousin: {
    background: 'linear-gradient(135deg, #fde047 0%, #facc15 100%)',
    border: '#fef08a',
    color: '#1f2937',
    muted: '#374151',
  },
  nephewNiece: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    border: '#86efac',
    color: '#ffffff',
    muted: 'rgba(255,255,255,0.82)',
  },
  grandchild: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    border: '#86efac',
    color: '#ffffff',
    muted: 'rgba(255,255,255,0.82)',
  },
};

function ActionButton({
  label,
  onClick,
  Icon,
  danger = false,
}: {
  label: string;
  onClick?: () => void;
  Icon: React.ComponentType<{ className?: string }>;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={[
        'flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors',
        danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100',
      ].join(' ')}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}

export const PersonNode = React.memo(({ data }: NodeProps<PersonNodeData>) => {
  const { pessoa, onClick, isSelected, isCentralPerson, onView, onEdit, onAddConnection, onRemove, directRelation } = data;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const isPet = pessoa.humano_ou_pet === 'Pet';
  const isFalecido = hasDeathDate(pessoa.data_falecimento);

  const handleClick = React.useCallback(() => {
    onClick?.(pessoa);
  }, [onClick, pessoa]);

  const handleContextMenu = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(true);
  }, []);

  React.useEffect(() => {
    if (!menuOpen) return;

    const handleOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as globalThis.Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const getBorderColor = () => {
    if (isPet) return FAMILY_TREE_COLORS.CARD_BORDER_PET;
    if (isFalecido) return FAMILY_TREE_COLORS.CARD_BORDER_DECEASED;
    return FAMILY_TREE_COLORS.CARD_BORDER_ALIVE;
  };

  const secondaryText =
    pessoa.local_atual ||
    pessoa.local_nascimento ||
    (pessoa.data_nascimento ? String(pessoa.data_nascimento) : undefined);

  const avatarContent = (avatarClassName: string, iconClassName: string) => {
    if (pessoa.foto_principal_url) {
      return (
        <img
          src={pessoa.foto_principal_url}
          alt={pessoa.nome_completo}
          className={`${avatarClassName} rounded-full object-cover`}
        />
      );
    }

    return isPet ? (
      <Dog className={iconClassName} />
    ) : (
      <User className={iconClassName} />
    );
  };

  const renderMenu = () => (
    menuOpen && (
      <div className="absolute right-2 top-2 z-50 min-w-[170px] rounded-lg border border-gray-200 bg-white p-1 shadow-xl">
        <ActionButton
          label="Visualizar"
          Icon={Eye}
          onClick={() => {
            setMenuOpen(false);
            onView?.(pessoa);
          }}
        />
        <ActionButton
          label="Editar"
          Icon={Pencil}
          onClick={() => {
            setMenuOpen(false);
            onEdit?.(pessoa);
          }}
        />
        <ActionButton
          label="Adicionar conexão"
          Icon={Link2}
          onClick={() => {
            setMenuOpen(false);
            onAddConnection?.(pessoa);
          }}
        />
        <ActionButton
          label="Remover"
          Icon={Trash2}
          danger
          onClick={() => {
            setMenuOpen(false);
            onRemove?.(pessoa);
          }}
        />
      </div>
    )
  );

  if (directRelation) {
    const style = isPet
      ? {
          background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
          border: '#fde68a',
          color: '#ffffff',
          muted: 'rgba(255,255,255,0.82)',
        }
      : directRelationStyles[directRelation];
    const isCentralDirectNode = directRelation === 'central';

    return (
      <div className="relative" ref={menuRef}>
        <div
          className={[
            'cursor-pointer rounded-lg border-2 shadow-lg transition-all hover:shadow-xl',
            isCentralDirectNode
              ? 'flex flex-col items-center justify-center px-4 py-5 text-center'
              : 'flex items-center gap-3 px-3 py-2.5',
            isSelected ? 'ring-2 ring-blue-300' : '',
          ].join(' ')}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          style={{
            width: isCentralDirectNode ? 190 : 220,
            minHeight: isCentralDirectNode ? 220 : 78,
            height: isCentralDirectNode ? 220 : 78,
            background: style.background,
            borderColor: style.border,
            color: style.color,
          }}
        >
          <PersonHandles />

          <div
            className={[
              'flex shrink-0 items-center justify-center rounded-full',
              isCentralDirectNode ? 'h-24 w-24 bg-gray-100' : 'h-11 w-11 bg-white/90',
            ].join(' ')}
          >
            {avatarContent(
              isCentralDirectNode ? 'h-24 w-24' : 'h-11 w-11',
              isCentralDirectNode ? 'h-12 w-12 text-slate-700' : 'h-6 w-6 text-slate-700'
            )}
          </div>

          <div className={isCentralDirectNode ? 'mt-4 min-w-0' : 'min-w-0 flex-1'}>
            <h3
              className={[
                'truncate font-bold leading-tight',
                isCentralDirectNode ? 'max-w-[150px] text-base' : 'text-sm',
              ].join(' ')}
              title={pessoa.nome_completo}
            >
              {pessoa.nome_completo}
            </h3>
            {secondaryText && (
              <p
                className={[
                  'truncate leading-tight',
                  isCentralDirectNode ? 'mt-1 max-w-[150px] text-sm' : 'mt-0.5 text-xs',
                ].join(' ')}
                style={{ color: style.muted }}
                title={secondaryText}
              >
                {secondaryText}
              </p>
            )}
          </div>
        </div>

        {renderMenu()}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <div
        className={`cursor-pointer rounded-lg border-2 px-4 py-3 shadow-md transition-all hover:shadow-lg ${
          isSelected ? 'ring-2 ring-blue-300' : ''
        }`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{
          width: 280,
          minHeight: 120,
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: pessoa.cor_bg_card || '#ffffff',
          borderColor: getBorderColor(),
        }}
      >
        <PersonHandles />

        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
              isPet ? 'bg-amber-200' : isFalecido ? 'bg-gray-300' : 'bg-blue-200'
            }`}
          >
            {pessoa.foto_principal_url ? (
              <img
                src={pessoa.foto_principal_url}
                alt={pessoa.nome_completo}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : isPet ? (
              <Dog className="h-6 w-6 text-amber-700" />
            ) : (
              <User className="h-6 w-6 text-blue-700" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <h3 className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight" title={pessoa.nome_completo}>
                {pessoa.nome_completo}
              </h3>
              {isCentralPerson && (
                <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-normal text-white">
                  Você
                </span>
              )}
            </div>

            {pessoa.data_nascimento && (
              <p className="mt-1 text-xs text-gray-600">
                ✦ {pessoa.data_nascimento}
                {pessoa.data_falecimento && ` - † ${pessoa.data_falecimento}`}
              </p>
            )}

            {pessoa.local_nascimento && (
              <p className="mt-0.5 truncate text-xs text-gray-500" title={pessoa.local_nascimento}>
                📍 {pessoa.local_nascimento}
              </p>
            )}

            {isPet && (
              <span className="mt-1 inline-block rounded-full bg-amber-200 px-2 py-0.5 text-xs text-amber-800">
                🐾 Pet
              </span>
            )}

            {isFalecido && !isPet && (
              <span className="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                🕊️ In Memoriam
              </span>
            )}
          </div>
        </div>
      </div>

      {renderMenu()}
    </div>
  );
});

PersonNode.displayName = 'PersonNode';
