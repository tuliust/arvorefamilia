import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User, Dog, Eye, Pencil, Link2, Trash2 } from 'lucide-react';
import { PersonNodeData } from './types';
import {
  DIRECT_FAMILY_TOKENS,
  FAMILY_TREE_COLORS,
} from './visualTokens';
import { isPersonDeceased } from '../../utils/personFields';
import {
  DIRECT_FAMILY_CARD_TEXT_COLORS,
  DIRECT_FAMILY_RELATION_COLORS,
  DIRECT_FAMILY_STATUS_BORDER_COLORS,
} from './directFamilyColors';
import {
  extractYear,
  getPersonCardDetailLines,
  getPersonCardSecondaryText,
} from './utils/personCardText';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

const DIRECT_FAMILY_PET_STYLE = {
  background: '#D97706',
  border: '#22C55E',
  color: '#ffffff',
  muted: 'rgba(255,255,255,0.82)',
};

function relationCardStyle(relationKey: keyof typeof DIRECT_FAMILY_RELATION_COLORS) {
  return {
    background: DIRECT_FAMILY_RELATION_COLORS[relationKey].background,
    border: DIRECT_FAMILY_RELATION_COLORS[relationKey].solid,
    color: DIRECT_FAMILY_CARD_TEXT_COLORS.primary,
    muted: DIRECT_FAMILY_CARD_TEXT_COLORS.muted,
  };
}

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
  central: relationCardStyle('central'),
  parent: relationCardStyle('pais'),
  sibling: relationCardStyle('irmaos'),
  child: relationCardStyle('filhos'),
  spouse: relationCardStyle('conjuge'),
  grandparent: relationCardStyle('avos'),
  greatGrandparent: relationCardStyle('bisavos'),
  greatGreatGrandparent: relationCardStyle('tataravos'),
  uncleAunt: relationCardStyle('tios'),
  cousin: relationCardStyle('primos'),
  nephewNiece: relationCardStyle('sobrinhos'),
  grandchild: relationCardStyle('netos'),
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

function getLifeYearsLabel(pessoa: PersonNodeData['pessoa']) {
  const birthYear = extractYear(pessoa.data_nascimento);
  const deathYear = extractYear(pessoa.data_falecimento);

  if (birthYear && deathYear) return `${birthYear}-${deathYear}`;
  if (deathYear) return `†${deathYear}`;
  if (birthYear) return birthYear;
  return undefined;
}

function parseBirthDate(value?: string | number | null) {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  if (!text) return null;

  const brDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brDate) {
    const [, day, month, year] = brDate;
    return {
      day: Number(day),
      month: Number(month),
      year: Number(year),
      hasFullDate: true,
    };
  }

  const isoDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoDate) {
    const [, year, month, day] = isoDate;
    return {
      day: Number(day),
      month: Number(month),
      year: Number(year),
      hasFullDate: true,
    };
  }

  const year = extractYear(text);
  if (!year) return null;

  return {
    year: Number(year),
    hasFullDate: false,
  };
}

function getAgeLabel(value?: string | number | null) {
  const birthDate = parseBirthDate(value);
  if (!birthDate || !Number.isFinite(birthDate.year)) return undefined;

  const today = new Date();
  let age = today.getFullYear() - birthDate.year;

  if (birthDate.hasFullDate && birthDate.month && birthDate.day) {
    const hasHadBirthday =
      today.getMonth() + 1 > birthDate.month ||
      (today.getMonth() + 1 === birthDate.month && today.getDate() >= birthDate.day);
    if (!hasHadBirthday) age -= 1;
  }

  if (age < 0 || age > 130) return undefined;
  return birthDate.hasFullDate ? `${age} anos` : `aprox. ${age} anos`;
}

function PetMarker({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={[
        'absolute rounded-full border-2 border-white bg-amber-400 text-amber-950 shadow-sm',
        compact ? '-bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center' : 'bottom-0 right-0 flex h-6 w-6 items-center justify-center',
      ].join(' ')}
      title="Pet"
      aria-label="Pet"
    >
      <Dog className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
    </span>
  );
}

function PersonDetailLines({
  lines,
  className = '',
  style,
}: {
  lines: string[];
  className?: string;
  style?: React.CSSProperties;
}) {
  if (lines.length === 0) return null;

  return (
    <div className={className} style={style} title={lines.join('\n')}>
      {lines.slice(0, 2).map((line) => (
        <p key={line} className="overflow-hidden text-ellipsis whitespace-nowrap">
          {line}
        </p>
      ))}
    </div>
  );
}

export const PersonNode = React.memo(({ data }: NodeProps<PersonNodeData>) => {
  const {
    pessoa,
    onClick,
    isSelected,
    isCentralPerson,
    onView,
    onEdit,
    onAddConnection,
    onRemove,
    directRelation,
    useDirectRelationStyleForPet,
    useCentralDirectLayout,
    layoutWidth,
    layoutHeight,
    isMobile = false,
  } = data;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const isPet = pessoa.humano_ou_pet === 'Pet';
  const isFalecido = isPersonDeceased(pessoa);

  const handleClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onClick?.(pessoa);
  }, [onClick, pessoa]);

  const handleContextMenu = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(true);
  }, []);

  const handleOpenPhotoDialog = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setPhotoDialogOpen(true);
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

  const secondaryText = getPersonCardSecondaryText(pessoa);
  const detailLines = getPersonCardDetailLines(pessoa);

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
      <div
        data-tree-node-menu="true"
        className="absolute right-2 top-2 z-50 min-w-[170px] rounded-lg border border-gray-200 bg-white p-1 shadow-xl"
      >
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
    const style = isPet && !useDirectRelationStyleForPet ? DIRECT_FAMILY_PET_STYLE : directRelationStyles[directRelation];
    const directBorderColor = isFalecido
      ? DIRECT_FAMILY_STATUS_BORDER_COLORS.deceased
      : DIRECT_FAMILY_STATUS_BORDER_COLORS.alive;
    const isCentralDirectNode = directRelation === 'central' && useCentralDirectLayout !== false;
    const baseCardWidth = isCentralDirectNode ? DIRECT_FAMILY_TOKENS.CENTRAL_WIDTH : DIRECT_FAMILY_TOKENS.CARD_WIDTH;
    const baseCardHeight = isCentralDirectNode ? DIRECT_FAMILY_TOKENS.CENTRAL_HEIGHT : DIRECT_FAMILY_TOKENS.CARD_HEIGHT;
    const cardWidth = layoutWidth ?? baseCardWidth;
    const cardHeight = layoutHeight ?? baseCardHeight;
    const cardScale = Math.min(cardWidth / baseCardWidth, cardHeight / baseCardHeight);
    const mobileAvatarScale = isMobile ? (isCentralDirectNode ? 1.08 : 1.04) : 1;
    const nonCentralAvatarScale = isCentralDirectNode ? 1 : 1.08;
    const avatarSize = (isCentralDirectNode ? DIRECT_FAMILY_TOKENS.CENTRAL_AVATAR_SIZE : DIRECT_FAMILY_TOKENS.AVATAR_SIZE) * cardScale * mobileAvatarScale * nonCentralAvatarScale;
    const directSecondaryText = secondaryText || getLifeYearsLabel(pessoa);
    const directDetailLines = detailLines.length > 0
      ? detailLines
      : directSecondaryText
        ? [directSecondaryText]
        : [];
    const centralDetails = [
      getAgeLabel(pessoa.data_nascimento),
      pessoa.local_nascimento
        ? `Natural de ${pessoa.local_nascimento}${pessoa.data_nascimento ? ` (${pessoa.data_nascimento})` : ''}`
        : pessoa.data_nascimento
          ? String(pessoa.data_nascimento)
          : undefined,
      pessoa.local_atual ? `Mora atualmente em ${pessoa.local_atual}` : undefined,
    ].filter((item): item is string => Boolean(item));

    return (
      <div className="relative" ref={menuRef}>
        <div
          className={[
            'cursor-pointer overflow-hidden rounded-lg border-[4px] shadow-lg transition-all hover:shadow-xl',
            isCentralDirectNode
              ? 'flex flex-col items-center justify-start px-12 py-10 text-center'
              : 'flex items-center gap-3 px-3.5 py-2',
            isSelected ? 'ring-2 ring-blue-300' : '',
          ].join(' ')}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          style={{
            width: cardWidth,
            minHeight: cardHeight,
            height: cardHeight,
            background: style.background,
            borderColor: directBorderColor,
            color: style.color,
          }}
        >
          <PersonHandles />

          {isCentralDirectNode && pessoa.foto_principal_url ? (
            <button
              type="button"
              className="flex shrink-0 items-center justify-center rounded-full bg-gray-100 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
              style={{ width: avatarSize, height: avatarSize }}
              onClick={handleOpenPhotoDialog}
              onMouseDown={(event) => event.stopPropagation()}
              aria-label={`Ampliar foto de ${pessoa.nome_completo}`}
            >
              {avatarContent('h-full w-full', 'h-28 w-28 text-slate-700')}
            </button>
          ) : (
            <div
              className={[
                'relative flex shrink-0 items-center justify-center rounded-full',
                isCentralDirectNode ? 'bg-gray-100' : 'bg-white/90',
              ].join(' ')}
              style={{ width: avatarSize, height: avatarSize }}
            >
              {avatarContent(
                'h-full w-full',
                isCentralDirectNode ? 'h-28 w-28 text-slate-700' : 'h-7 w-7 text-slate-700'
              )}
              {!isCentralDirectNode && isPet && <PetMarker compact />}
            </div>
          )}

          <div className={isCentralDirectNode ? 'mt-9 min-w-0 max-w-full' : 'min-w-0 flex-1'}>
            <h3
              className={[
                'font-bold leading-tight',
                isCentralDirectNode
                  ? `whitespace-normal break-words ${isMobile ? 'text-[46px]' : 'text-[42px]'}`
                  : `overflow-hidden break-words ${isMobile ? 'text-[21px]' : 'text-[19px]'} [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]`,
              ].join(' ')}
              title={pessoa.nome_completo}
            >
              {pessoa.nome_completo}
            </h3>
            {isCentralDirectNode ? (
              centralDetails.length > 0 && (
                <div className={`mt-5 space-y-2 ${isMobile ? 'text-[24px]' : 'text-[22px]'} leading-snug`} style={{ color: style.muted }}>
                  {centralDetails.map((detail) => (
                    <p key={detail} className="whitespace-normal break-words">
                      {detail}
                    </p>
                  ))}
                </div>
              )
            ) : (
              <PersonDetailLines
                lines={directDetailLines}
                className={[
                  'mt-1.5 space-y-0.5 overflow-hidden font-medium leading-tight',
                  isMobile ? 'text-[14px]' : 'text-[12.5px]',
                ].join(' ')}
                style={{ color: style.muted }}
              />
            )}
          </div>
        </div>

        {isCentralDirectNode && pessoa.foto_principal_url && (
          <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
            <DialogContent
              className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden border-slate-800 bg-slate-950 p-4 text-white sm:max-w-[min(92vw,980px)]"
              onClick={(event) => event.stopPropagation()}
              onContextMenu={(event) => event.stopPropagation()}
            >
              <DialogHeader>
                <DialogTitle className="pr-8 text-white">
                  Foto de {pessoa.nome_completo}
                </DialogTitle>
              </DialogHeader>
              <div className="flex max-h-[calc(100dvh-8rem)] items-center justify-center overflow-hidden rounded-md bg-black/30">
                <img
                  src={pessoa.foto_principal_url}
                  alt={`Foto de ${pessoa.nome_completo}`}
                  className="max-h-[calc(100dvh-8rem)] max-w-full object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

        {renderMenu()}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <div
        className={`cursor-pointer overflow-hidden rounded-lg border-[3px] px-3.5 py-3 shadow-md transition-all hover:shadow-lg ${
          isSelected ? 'ring-2 ring-blue-300' : ''
        }`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{
          width: layoutWidth ?? 280,
          minHeight: layoutHeight ?? 120,
          height: layoutHeight ?? 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderColor: getBorderColor(),
        }}
      >
        <PersonHandles />

        <div className={`flex items-center ${isMobile ? 'gap-4' : 'gap-3.5'}`}>
          <div
            className={`relative flex ${isMobile ? 'h-[66px] w-[66px]' : 'h-16 w-16'} flex-shrink-0 items-center justify-center rounded-full ${
              isPet ? 'bg-amber-200' : isFalecido ? 'bg-gray-300' : 'bg-blue-200'
            }`}
          >
            {pessoa.foto_principal_url ? (
              <img
                src={pessoa.foto_principal_url}
                alt={pessoa.nome_completo}
                className={`${isMobile ? 'h-[66px] w-[66px]' : 'h-16 w-16'} rounded-full object-cover`}
              />
            ) : isPet ? (
              <Dog className={`${isMobile ? 'h-9 w-9' : 'h-8 w-8'} text-amber-700`} />
            ) : (
              <User className={`${isMobile ? 'h-9 w-9' : 'h-8 w-8'} text-blue-700`} />
            )}
            {isPet && <PetMarker compact />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <h3
                className={`min-w-0 flex-1 overflow-hidden break-words ${isMobile ? 'text-[18px]' : 'text-[17px]'} font-bold leading-tight text-gray-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]`}
                title={pessoa.nome_completo}
              >
                {pessoa.nome_completo}
              </h3>
              {isCentralPerson && (
                <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-normal text-white">
                  Você
                </span>
              )}
            </div>

            <PersonDetailLines
              lines={detailLines}
              className={`mt-1.5 space-y-0.5 overflow-hidden font-medium leading-tight ${isMobile ? 'text-[14px]' : 'text-[13px]'} text-gray-600`}
            />
          </div>
        </div>
      </div>

      {renderMenu()}
    </div>
  );
});

PersonNode.displayName = 'PersonNode';
