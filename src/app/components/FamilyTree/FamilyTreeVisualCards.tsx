import React from 'react';
import { Cross, Minus, PawPrint, Plus, Star } from 'lucide-react';

import type { Pessoa } from '../../types';
import { isPetFamilyMember } from '../../utils/personEntity';
import { getInitials } from '../../utils/personFields';

function getYear(value?: string | number) {
  if (value === undefined || value === null || value === '') return undefined;
  const match = String(value).match(/\b(18|19|20|21)\d{2}\b/);
  return match?.[0];
}

function getFirstTwoNames(fullName?: string) {
  return (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
}

function formatVitalLine(place?: string, date?: string | number) {
  const normalizedPlace = place?.trim();
  const year = getYear(date);
  return [normalizedPlace, year].filter(Boolean).join(' ');
}

export function getVisualPersonCardData(person: Pessoa) {
  return {
    pet: isPetFamilyMember(person),
    displayName: getFirstTwoNames(person.nome_completo) || person.nome_completo,
    birthLine: formatVitalLine(person.local_nascimento, person.data_nascimento),
    deathLine: formatVitalLine(person.local_falecimento, person.data_falecimento),
    showDeathLine: Boolean(person.falecido || person.data_falecimento || person.local_falecimento),
  };
}

export function VisualPersonAvatar({
  person,
  pet,
  className,
  iconClassName,
}: {
  person: Pessoa;
  pet: boolean;
  className: string;
  iconClassName: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/80 bg-white/20 shadow-inner ${className}`}
    >
      {person.foto_principal_url ? (
        <img src={person.foto_principal_url} alt="" className="h-full w-full object-cover" />
      ) : pet ? (
        <PawPrint className={iconClassName} aria-hidden="true" />
      ) : (
        <span className="text-lg font-extrabold">{getInitials(person.nome_completo)}</span>
      )}
    </span>
  );
}

export function VisualVitalLines({
  birthLine,
  deathLine,
  showDeathLine,
  align = 'center',
  compact = false,
  prominent = false,
}: {
  birthLine: string;
  deathLine: string;
  showDeathLine: boolean;
  align?: 'center' | 'left';
  compact?: boolean;
  prominent?: boolean;
}) {
  const alignment = align === 'left' ? 'justify-start text-left' : 'justify-center text-center';
  const textSize = prominent ? 'text-[12px]' : compact ? 'text-[9px]' : 'text-[11px]';
  const gap = compact ? 'gap-0.5' : 'gap-1';
  const iconSize = prominent ? 'h-3.5 w-3.5' : compact ? 'h-2.5 w-2.5' : 'h-3 w-3';

  return (
    <>
      <span className={`mt-1 flex w-full min-w-0 items-center ${alignment} ${gap} ${textSize} font-semibold leading-tight text-cyan-50`}>
        <Star className={`${iconSize} shrink-0 fill-current`} aria-hidden="true" />
        <span className="truncate">{birthLine || 'Nascimento não informado'}</span>
      </span>
      {showDeathLine && (
        <span className={`mt-0.5 flex w-full min-w-0 items-center ${alignment} ${gap} ${textSize} font-semibold leading-tight text-cyan-50`}>
          <Cross className={`${iconSize} shrink-0`} aria-hidden="true" />
          <span className="truncate">{deathLine || 'Falecimento não informado'}</span>
        </span>
      )}
    </>
  );
}

export function VisualPersonCard({
  person,
  label,
  central = false,
  compact = false,
  mini = false,
  horizontal = false,
  onClick,
}: {
  person: Pessoa;
  label?: string;
  central?: boolean;
  compact?: boolean;
  mini?: boolean;
  horizontal?: boolean;
  onClick: (person: Pessoa) => void;
}) {
  const { pet, displayName, birthLine, deathLine, showDeathLine } = getVisualPersonCardData(person);

  if (horizontal) {
    return (
      <button
        type="button"
        onClick={() => onClick(person)}
        className="flex h-[74px] w-full min-w-0 items-center gap-2 rounded-[1.1rem] border border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700 px-2.5 py-2 text-left text-white shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)] active:scale-[0.98]"
      >
        <VisualPersonAvatar person={person} pet={pet} className="h-[46px] w-[46px]" iconClassName="h-6 w-6" />
        <span className="min-w-0 flex-1">
          <span className="block truncate whitespace-nowrap text-[11px] font-extrabold uppercase leading-none">
            {displayName}
          </span>
          <VisualVitalLines
            birthLine={birthLine}
            deathLine={deathLine}
            showDeathLine={showDeathLine}
            align="left"
            compact
          />
        </span>
      </button>
    );
  }

  const avatarSize = central ? 'h-[86px] w-[86px]' : mini ? 'h-[42px] w-[42px]' : compact ? 'h-[48px] w-[48px]' : 'h-[64px] w-[64px]';
  const iconSize = central ? 'h-10 w-10' : mini ? 'h-5 w-5' : compact ? 'h-6 w-6' : 'h-7 w-7';
  const height = central ? 'h-[194px]' : mini ? 'h-[112px]' : compact ? 'h-[128px]' : 'h-[164px]';
  const titleSize = central ? 'text-[15px]' : mini ? 'text-[10px]' : compact ? 'text-[11px]' : 'text-[12px]';

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      className={[
        `relative flex ${height} w-full min-w-0 flex-col items-center justify-center rounded-[1.35rem] border px-2.5 pb-2.5 pt-2.5 text-center text-white shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)] active:scale-[0.98]`,
        central
          ? 'border-cyan-300 bg-gradient-to-b from-cyan-500 to-blue-700'
          : pet
            ? 'border-amber-200 bg-gradient-to-b from-amber-500 to-orange-700'
            : 'border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700',
      ].join(' ')}
    >
      {label && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow">
          {label}
        </span>
      )}
      <VisualPersonAvatar person={person} pet={pet} className={avatarSize} iconClassName={iconSize} />
      <span className={`mt-1.5 w-full truncate whitespace-nowrap ${titleSize} font-extrabold uppercase leading-none`}>
        {displayName}
      </span>
      <VisualVitalLines
        birthLine={birthLine}
        deathLine={deathLine}
        showDeathLine={showDeathLine}
        compact={mini || compact}
        prominent={central}
      />
    </button>
  );
}

export function VisualEmptyCard({ label }: { label: string }) {
  return (
    <div className="flex h-[128px] w-full min-w-0 items-center justify-center rounded-[1.35rem] border border-dashed border-slate-300 bg-white px-3 text-center text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400 shadow-sm">
      {label}
    </div>
  );
}

export function VisualGroup({
  title,
  people,
  columns = 'double',
  maxHeightClassName = 'max-h-[19rem]',
  variant = 'mini',
  titleVariant = 'inside',
  expandable = false,
  collapsedLimit,
  defaultExpanded = false,
  disableInternalScroll = false,
  onPersonClick,
}: {
  title: string;
  people: Pessoa[];
  columns?: 'single' | 'double' | 'triple';
  maxHeightClassName?: string;
  variant?: 'mini' | 'compact' | 'horizontal';
  titleVariant?: 'inside' | 'pill';
  expandable?: boolean;
  collapsedLimit?: number;
  defaultExpanded?: boolean;
  disableInternalScroll?: boolean;
  onPersonClick: (person: Pessoa) => void;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const gridColumns = columns === 'triple' ? 'grid-cols-3' : columns === 'double' ? 'grid-cols-2' : 'grid-cols-1';
  const hasCollapsedLimit = typeof collapsedLimit === 'number' && collapsedLimit > 0;
  const canExpand = Boolean(expandable && hasCollapsedLimit && people.length > collapsedLimit);
  const visiblePeople = canExpand && !expanded ? people.slice(0, collapsedLimit) : people;
  const hiddenCount = Math.max(people.length - visiblePeople.length, 0);
  const showPillTitle = titleVariant === 'pill';
  const scrollClassName = disableInternalScroll ? 'overflow-visible' : `overflow-y-auto pr-0.5 ${maxHeightClassName}`;
  const contentPadding = canExpand ? 'pb-7' : '';

  React.useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded, people.length]);

  return (
    <section
      className={[
        'relative z-10 flex min-h-0 flex-col rounded-[1.35rem] border border-cyan-100 bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.08)]',
        showPillTitle ? 'overflow-visible pt-5' : 'overflow-hidden',
      ].join(' ')}
    >
      {showPillTitle ? (
        <span className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow">
          {title}
        </span>
      ) : (
        <h3 className="mb-2 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
          {title}
        </h3>
      )}

      {people.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-xs font-semibold text-slate-400">
          Sem registros
        </p>
      ) : (
        <div className={`grid min-h-0 ${gridColumns} gap-2 ${contentPadding} ${scrollClassName}`}>
          {visiblePeople.map((person) => (
            <VisualPersonCard
              key={person.id}
              person={person}
              onClick={onPersonClick}
              mini={variant === 'mini'}
              compact={variant === 'compact'}
              horizontal={variant === 'horizontal'}
            />
          ))}
        </div>
      )}

      {canExpand && (
        <button
          type="button"
          className="absolute bottom-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-200 bg-white text-cyan-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          aria-label={expanded ? `Recolher ${title}` : `Expandir ${title}`}
          title={expanded ? `Recolher ${title}` : `Mostrar mais ${hiddenCount} em ${title}`}
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
        >
          {expanded ? (
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      )}
    </section>
  );
}
