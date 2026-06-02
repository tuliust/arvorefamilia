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
import { CentralPersonFocusPanel } from './CentralPersonFocusPanel';
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
        compact ? '-bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center' : 'bottom-0 right-0 flex h-7 w-7 items-center justify-center',
      ].join(' ')}
      title="Pet"
      aria-label="Pet"
    >
      <Dog className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
    </span>
  );
}

function PersonDetailLines({
  lines,
  className = '',
  style,
  lineClassName = 'whitespace-normal break-words',
  lineStyle,
}: {
  lines: string[];
  className?: string;
  style?: React.CSSProperties;
  lineClassName?: string;
  lineStyle?: React.CSSProperties;
}) {
  if (lines.length === 0) return null;

  return (
    <div className={className} style={style} title={lines.join('\n')}>
      {lines.map((line) => (
        <p key={line} className={lineClassName} style={lineStyle}>
          {line}
        </p>
      ))}
    </div>
  );
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
    useCentralFocusPanel,
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
    const cappedCardScale = Math.min(1, cardScale);
    const isCompactDirectCard = !isCentralDirectNode && cardHeight <= 160;
    const isSmallDirectCard = !isCentralDirectNode && cardHeight <= 175;
    const nonCentralPaddingY = isCompactDirectCard
      ? clampNumber(Math.round(cardHeight * 0.055), 8, 12)
      : clampNumber(Math.round(cardHeight * 0.065), 10, 18);
    const nonCentralPaddingX = isCompactDirectCard
      ? clampNumber(Math.round(cardWidth * 0.03), 10, 14)
      : clampNumber(Math.round(cardWidth * 0.035), 12, 20);
    const nonCentralGap = isCompactDirectCard
      ? clampNumber(Math.round(cardWidth * 0.025), 8, 12)
      : clampNumber(Math.round(cardWidth * 0.035), 12, 18);
    const nonCentralImageSize = isCompactDirectCard
      ? clampNumber(Math.round(cardHeight * 0.58), 72, 88)
      : isSmallDirectCard
        ? clampNumber(Math.round(cardHeight * 0.62), 82, 100)
        : clampNumber(Math.round(cardHeight * 0.64), 96, 124);
    const nonCentralTextWidth = Math.max(138, cardWidth - nonCentralPaddingX * 2 - nonCentralGap - nonCentralImageSize);
    const estimatedNameFontForTwoLines = Math.floor(
      (nonCentralTextWidth * 2) / Math.max(10, pessoa.nome_completo.length * 0.46)
    );
    const centralPaddingY = Math.max(18, Math.round(30 * cappedCardScale));
    const centralPaddingX = Math.max(30, Math.round(42 * cappedCardScale));
    const centralNameFontSize = isMobile ? 20 : Math.max(36, Math.round(50 * cappedCardScale * 1.08));
    const centralDetailFontSize = clampNumber(
      Math.round((isMobile ? 38 : 34) * cappedCardScale),
      24,
      isMobile ? 36 : 32
    );
    const directNameFontSize = isCentralDirectNode
      ? centralNameFontSize
      : clampNumber(
        estimatedNameFontForTwoLines,
        isMobile ? 18 : isCompactDirectCard ? 17 : 19,
        isMobile ? 30 : isCompactDirectCard ? 26 : isSmallDirectCard ? 29 : 30
      );
    const directDetailSizingLines = detailLines.length > 0
      ? detailLines
      : secondaryText || getLifeYearsLabel(pessoa)
        ? [secondaryText || getLifeYearsLabel(pessoa) || '']
        : [];
    const longestDirectDetailLine = directDetailSizingLines.reduce(
      (longest, line) => line.length > longest.length ? line : longest,
      ''
    );
    const estimatedDetailFontForOneLine = longestDirectDetailLine
      ? Math.floor(nonCentralTextWidth / Math.max(8, longestDirectDetailLine.length * 0.40))
      : 14;
    const directDetailFontSize = isCentralDirectNode
      ? centralDetailFontSize
      : clampNumber(
        estimatedDetailFontForOneLine,
        isMobile ? 13 : isCompactDirectCard ? 13 : 14,
        isMobile ? 22 : isCompactDirectCard ? 18 : isSmallDirectCard ? 20 : 21
      );
    const mobileAvatarScale = isMobile ? (isCentralDirectNode ? 0.78 : 1.1) : 1;
    const avatarSize = isCentralDirectNode
      ? DIRECT_FAMILY_TOKENS.CENTRAL_AVATAR_SIZE * cardScale * mobileAvatarScale * 1.04
      : nonCentralImageSize;
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

    if (isCentralDirectNode && useCentralFocusPanel) {
      return (
        <div className="relative" ref={menuRef}>
          <div
            className={[
              'cursor-pointer rounded-lg border-[4px] shadow-lg transition-all hover:shadow-xl',
              isSelected ? 'ring-2 ring-blue-300' : '',
            ].join(' ')}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            style={{
              width: cardWidth,
              minHeight: cardHeight,
              height: cardHeight,
              overflow: 'hidden',
              background: style.background,
              borderColor: directBorderColor,
              color: style.color,
            }}
          >
            <PersonHandles />
            <CentralPersonFocusPanel
              pessoa={pessoa}
              isMobile={isMobile}
              onView={onView}
              onAddConnection={onAddConnection}
              onOpenPhoto={pessoa.foto_principal_url ? handleOpenPhotoDialog : undefined}
            />
          </div>

          {pessoa.foto_principal_url && (
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
          className={[
            'cursor-pointer rounded-lg border-[4px] shadow-lg transition-all hover:shadow-xl',
            isCentralDirectNode
              ? 'flex flex-col items-center justify-start px-12 py-10 text-center'
              : 'flex items-center gap-4 px-3 py-2.5',
            isSelected ? 'ring-2 ring-blue-300' : '',
          ].join(' ')}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          style={{
            width: cardWidth,
            minHeight: cardHeight,
            height: cardHeight,
            ...(isCentralDirectNode
              ? { padding: `${centralPaddingY}px ${centralPaddingX}px` }
              : { gap: nonCentralGap, padding: `${nonCentralPaddingY}px ${nonCentralPaddingX}px` }),
            overflow: 'hidden',
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
                isCentralDirectNode
                  ? 'h-28 w-28 text-slate-700'
                  : isCompactDirectCard
                    ? 'h-5 w-5 text-slate-700'
                    : 'h-7 w-7 text-slate-700'
              )}
              {!isCentralDirectNode && isPet && <PetMarker compact />}
            </div>
          )}

          <div
            className={isCentralDirectNode ? 'min-w-0 max-w-full' : 'flex min-w-0 flex-1 flex-col justify-center'}
            style={isCentralDirectNode
              ? { marginTop: isMobile ? 10 : Math.max(20, Math.round(36 * cappedCardScale)) }
              : {
                maxWidth: nonCentralTextWidth,
                minHeight: nonCentralImageSize,
              }
            }
          >
            <h3
              className={[
                'font-bold leading-tight',
                isCentralDirectNode
                  ? 'whitespace-normal break-words'
                  : 'whitespace-normal break-words',
              ].join(' ')}
              style={{
                fontSize: directNameFontSize,
                lineHeight: isCentralDirectNode ? undefined : isCompactDirectCard ? 1.08 : 1.1,
                ...(!isCentralDirectNode
                  ? {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }
                  : {}),
              }}
              title={pessoa.nome_completo}
            >
              {pessoa.nome_completo}
            </h3>
            {isCentralDirectNode ? (
              centralDetails.length > 0 && (
                <div
                  className={isMobile ? "mt-1 space-y-0.5 leading-[1.08]" : "mt-4 space-y-1.5 leading-[1.18]"}
                  style={{ color: style.muted, fontSize: directDetailFontSize }}
                >
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
                  isCompactDirectCard
                    ? 'mt-[8px] space-y-[6px] font-semibold leading-[1.22]'
                    : 'mt-[10px] space-y-[7px] font-semibold leading-[1.26]',
                ].join(' ')}
                style={{ color: style.muted, fontSize: directDetailFontSize }}
                lineClassName="overflow-hidden text-ellipsis whitespace-nowrap"
                lineStyle={{ maxWidth: '100%' }}
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
        className={`cursor-pointer rounded-lg border-[4px] px-3 py-2.5 shadow-md transition-all hover:shadow-lg ${
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

        <div className={`flex items-center ${isMobile ? 'gap-5' : 'gap-4'}`}>
          <div
            className={`relative flex ${isMobile ? 'h-[104px] w-[104px]' : 'h-[98px] w-[98px]'} flex-shrink-0 items-center justify-center rounded-full ${
              isPet ? 'bg-amber-200' : isFalecido ? 'bg-gray-300' : 'bg-blue-200'
            }`}
          >
            {pessoa.foto_principal_url ? (
              <img
                src={pessoa.foto_principal_url}
                alt={pessoa.nome_completo}
                className={`${isMobile ? 'h-[104px] w-[104px]' : 'h-[98px] w-[98px]'} rounded-full object-cover`}
              />
            ) : isPet ? (
              <Dog className={`${isMobile ? 'h-14 w-14' : 'h-12 w-12'} text-amber-700`} />
            ) : (
              <User className={`${isMobile ? 'h-14 w-14' : 'h-12 w-12'} text-blue-700`} />
            )}
            {isPet && <PetMarker compact />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <h3
                className={`min-w-0 flex-1 whitespace-normal break-words ${isMobile ? 'text-[20px]' : 'text-[18px]'} font-extrabold leading-tight text-gray-900`}
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
              className={`mt-1 space-y-0.5 font-bold leading-tight ${isMobile ? 'text-[14px]' : 'text-[13px]'} text-gray-800`}
            />
          </div>
        </div>
      </div>

      {renderMenu()}
    </div>
  );
});

PersonNode.displayName = 'PersonNode';
