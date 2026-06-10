import React from 'react';
import { Cross, Minus, PawPrint, Plus, Star } from 'lucide-react';

import type { Pessoa } from '../../types';
import { isPetFamilyMember } from '../../utils/personEntity';

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

function formatVitalYear(date?: string | number) {
  return getYear(date) ?? '';
}

function getPersonGender(person: Pessoa) {
  const rawGender = String(
    (person as {
      genero?: string;
      sexo?: string;
      gender?: string;
      sexo_biologico?: string;
      genero_identidade?: string;
      gender_identity?: string;
    }).genero
      ?? (person as { sexo?: string }).sexo
      ?? (person as { gender?: string }).gender
      ?? (person as { sexo_biologico?: string }).sexo_biologico
      ?? (person as { genero_identidade?: string }).genero_identidade
      ?? (person as { gender_identity?: string }).gender_identity
      ?? '',
  ).trim().toLowerCase();

  if (/^(pet|animal|mascote)$/.test(rawGender)) return 'pet';
  if (/^(mulher|f|fem|feminino|female)$/.test(rawGender)) return 'female';
  if (/^(homem|m|masc|masculino|male)$/.test(rawGender)) return 'male';

  const firstName = (person.nome_completo ?? '').trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  const maleNames = new Set([
    'absalon', 'adalberto', 'athanase', 'caio', 'charalambos', 'constantino', 'fabio', 'fábio',
    'heitor', 'ildo', 'jose', 'josé', 'leonardo', 'marcio', 'márcio', 'marcos', 'mario', 'mário',
    'mauro', 'rodrigo', 'rosel', 'secundino', 'tassiu', 'tássiu', 'titus', 'tulius', 'yuri',
  ]);
  const femaleNames = new Set([
    'alexia', 'fulana', 'glauce', 'hilda', 'ivanira', 'maria', 'monika', 'rafaela', 'teresá',
    'teresa', 'tathiane', 'vanira',
  ]);
  if (maleNames.has(firstName)) return 'male';
  if (femaleNames.has(firstName)) return 'female';

  return 'neutral';
}

function PersonSilhouette({ gender, className }: { gender: 'female' | 'male' | 'neutral'; className: string }) {
  if (gender === 'female') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M14 19c0-8 4-14 10-14s10 6 10 14v6c0 4 2 7 5 10-3 4-8 7-15 7S12 39 9 35c3-3 5-6 5-10v-6Z" />
        <circle cx="24" cy="20" r="7" fill="currentColor" />
        <path fill="currentColor" d="M8 44c2.4-8.8 8.5-14 16-14s13.6 5.2 16 14H8Z" />
      </svg>
    );
  }

  if (gender === 'male') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M12 18c0-7.5 5-13 12-13s12 5.5 12 13c0 1.4-.2 2.8-.6 4-2.8-2-6.6-3.1-11.4-3.1S15.4 20 12.6 22c-.4-1.2-.6-2.6-.6-4Z" />
        <circle cx="24" cy="21" r="7.5" fill="currentColor" />
        <path fill="currentColor" d="M7 44c2.7-8.5 9-13.2 17-13.2S38.3 35.5 41 44H7Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <circle cx="24" cy="19" r="9" fill="currentColor" />
      <path fill="currentColor" d="M7 44c2.7-9 9-14 17-14s14.3 5 17 14H7Z" />
    </svg>
  );
}

export function getVisualPersonCardData(person: Pessoa) {
  return {
    pet: isPetFamilyMember(person) || getPersonGender(person) === 'pet',
    displayName: getFirstTwoNames(person.nome_completo) || person.nome_completo,
    birthLine: formatVitalLine(person.local_nascimento, person.data_nascimento),
    deathLine: formatVitalLine(person.local_falecimento, person.data_falecimento),
    birthYearLine: formatVitalYear(person.data_nascimento),
    deathYearLine: formatVitalYear(person.data_falecimento),
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
  const gender = getPersonGender(person);
  const silhouetteGender = gender === 'pet' ? 'neutral' : gender;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/80 bg-white/20 shadow-inner ${className}`}
    >
      {person.foto_principal_url ? (
        <img src={person.foto_principal_url} alt="" className="h-full w-full object-cover" />
      ) : pet ? (
        <PawPrint className={iconClassName} aria-hidden="true" />
      ) : (
        <PersonSilhouette gender={silhouetteGender} className={iconClassName} />
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
        {birthLine && <span className="truncate">{birthLine}</span>}
      </span>
      {showDeathLine && (
        <span className={`mt-0.5 flex w-full min-w-0 items-center ${alignment} ${gap} ${textSize} font-semibold leading-tight text-cyan-50`}>
          <Cross className={`${iconSize} shrink-0`} aria-hidden="true" />
          {deathLine && <span className="truncate">{deathLine}</span>}
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
  tone = 'default',
  vitalMode = 'year',
}: {
  person: Pessoa;
  label?: string;
  central?: boolean;
  compact?: boolean;
  mini?: boolean;
  horizontal?: boolean;
  tone?: 'default' | 'spouse' | 'ancestorSpouse';
  vitalMode?: 'year' | 'full';
  onClick: (person: Pessoa) => void;
}) {
  const { pet, displayName, birthLine, deathLine, birthYearLine, deathYearLine, showDeathLine } = getVisualPersonCardData(person);
  const effectiveBirthLine = vitalMode === 'full' ? birthLine : birthYearLine;
  const effectiveDeathLine = vitalMode === 'full' ? deathLine : deathYearLine;
  const isSpouseTone = tone === 'spouse';
  const isAncestorSpouseTone = tone === 'ancestorSpouse';

  if (horizontal) {
    return (
      <button
        type="button"
        onClick={() => onClick(person)}
        className={[
          'flex h-[74px] w-full min-w-0 items-center gap-2 rounded-[1.1rem] border px-2.5 py-2 text-left text-white shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)] active:scale-[0.98]',
          isSpouseTone || isAncestorSpouseTone
            ? 'border-emerald-200 bg-gradient-to-b from-emerald-300 via-teal-500 to-emerald-700'
            : 'border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700',
        ].join(' ')}
      >
        <VisualPersonAvatar person={person} pet={pet} className="h-[46px] w-[46px]" iconClassName="h-6 w-6" />
        <span className="min-w-0 flex-1">
          <span className="block truncate whitespace-nowrap text-[11px] font-extrabold uppercase leading-[1.18]">
            {displayName}
          </span>
          <VisualVitalLines
            birthLine={effectiveBirthLine}
            deathLine={effectiveDeathLine}
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
          : isSpouseTone || isAncestorSpouseTone
            ? 'border-emerald-200 bg-gradient-to-b from-emerald-300 via-teal-500 to-emerald-700'
            : 'border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700',
      ].join(' ')}
    >
      {label && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow">
          {label}
        </span>
      )}
      <VisualPersonAvatar person={person} pet={pet} className={avatarSize} iconClassName={iconSize} />
      <span className={`mt-1.5 w-full truncate whitespace-nowrap ${titleSize} font-extrabold uppercase leading-[1.18]`}>
        {displayName}
      </span>
      <VisualVitalLines
        birthLine={effectiveBirthLine}
        deathLine={effectiveDeathLine}
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
  onPersonClick,
  titleVariant = 'inline',
  expandable = false,
  collapsedLimit,
  defaultExpanded = false,
  expanded,
  onExpandedChange,
  disableInternalScroll = false,
  className = '',
  spousePersonIds,
  spousePartnerByPersonId,
  spouseTone = 'spouse',
}: {
  title: string;
  people: Pessoa[];
  columns?: 'single' | 'double' | 'triple' | 'quad';
  maxHeightClassName?: string;
  variant?: 'mini' | 'compact' | 'horizontal';
  onPersonClick: (person: Pessoa) => void;
  titleVariant?: 'inline' | 'pill';
  expandable?: boolean;
  collapsedLimit?: number;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  disableInternalScroll?: boolean;
  className?: string;
  spousePersonIds?: Set<string>;
  spousePartnerByPersonId?: Map<string, string>;
  spouseTone?: 'spouse' | 'ancestorSpouse';
}) {
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  const isExpanded = expanded ?? internalExpanded;
  const limit = collapsedLimit ?? people.length;
  const canExpand = expandable && people.length > limit;
  const visiblePeople = React.useMemo(() => {
    if (!canExpand || isExpanded) return people;

    const limitedPeople = people.slice(0, limit);
    const lastPerson = limitedPeople[limitedPeople.length - 1];
    const nextPerson = people[limitedPeople.length];
    const nextPartnerId = nextPerson ? spousePartnerByPersonId?.get(nextPerson.id) : undefined;

    return lastPerson && nextPerson && nextPartnerId === lastPerson.id
      ? [...limitedPeople, nextPerson]
      : limitedPeople;
  }, [canExpand, isExpanded, limit, people, spousePartnerByPersonId]);
  const effectiveColumns = visiblePeople.length === 1 ? 'single' : columns;
  const gridColumns = effectiveColumns === 'quad' ? 'grid-cols-4' : effectiveColumns === 'triple' ? 'grid-cols-3' : effectiveColumns === 'double' ? 'grid-cols-2' : 'grid-cols-1';
  const columnCount = effectiveColumns === 'quad' ? 4 : effectiveColumns === 'triple' ? 3 : effectiveColumns === 'double' ? 2 : 1;
  const renderedItems = React.useMemo(() => {
    const items: Array<{ type: 'person'; person: Pessoa } | { type: 'spacer'; key: string }> = [];

    visiblePeople.forEach((person) => {
      const partnerId = spousePartnerByPersonId?.get(person.id);
      const previousItem = items[items.length - 1];
      const followsPartner = Boolean(
        partnerId
        && previousItem?.type === 'person'
        && previousItem.person.id === partnerId,
      );

      if (followsPartner && columnCount > 1 && items.length % columnCount === 0) {
        const partnerItem = items.pop();
        if (partnerItem?.type === 'person') {
          items.push({ type: 'spacer', key: `spacer-${partnerItem.person.id}` });
          items.push(partnerItem);
        }
      }

      items.push({ type: 'person', person });
    });

    return items;
  }, [columnCount, spousePartnerByPersonId, visiblePeople]);

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const nextExpanded = !isExpanded;
    if (expanded === undefined) setInternalExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  const scrollClasses = disableInternalScroll
    ? ''
    : `overflow-y-auto pr-0.5 ${maxHeightClassName}`;
  const pillTitle = titleVariant === 'pill';

  return (
    <section
      className={[
        'relative z-10 flex min-h-0 flex-col rounded-[1.35rem] border border-cyan-100 bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.08)]',
        pillTitle ? 'pt-5' : 'overflow-hidden',
        className,
      ].join(' ')}
    >
      {pillTitle ? (
        <span className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow">
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
        <div className={`grid min-h-0 ${gridColumns} gap-2 ${scrollClasses}`}>
          {renderedItems.map((item, index) => {
            if (item.type === 'spacer') {
              return <div key={item.key} className="min-w-0" aria-hidden="true" />;
            }

            const { person } = item;
            const partnerId = spousePartnerByPersonId?.get(person.id);
            const isSpouseCard = Boolean(spousePersonIds?.has(person.id) || partnerId);
            const previousItem = renderedItems[index - 1];
            const lateralConnector = Boolean(
              partnerId
              && previousItem?.type === 'person'
              && previousItem.person.id === partnerId,
            );

            return (
              <div key={person.id} className="relative min-w-0">
                {lateralConnector && (
                  <span className="pointer-events-none absolute -left-2 top-1/2 z-0 h-0 w-2 -translate-y-1/2 border-t-2 border-cyan-500" aria-hidden="true" />
                )}
                <VisualPersonCard
                  person={person}
                  onClick={onPersonClick}
                  mini={variant === 'mini'}
                  compact={variant === 'compact'}
                  horizontal={variant === 'horizontal'}
                  tone={isSpouseCard ? spouseTone : 'default'}
                />
              </div>
            );
          })}
        </div>
      )}
      {canExpand && (
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isExpanded ? `Recolher ${title}` : `Expandir ${title}`}
          title={isExpanded ? `Recolher ${title}` : `Expandir ${title}`}
          className="absolute bottom-1.5 right-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-200 bg-white text-cyan-600 shadow-sm transition hover:bg-cyan-50 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          {isExpanded ? <Minus className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
      )}
    </section>
  );
}
