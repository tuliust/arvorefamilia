import React from 'react';
import { Cross, Minus, PawPrint, Plus, Star, User } from 'lucide-react';

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
  const primaryGender = person.genero?.trim().toLowerCase();
  const legacyPerson = person as Pessoa & {
    sexo?: string;
    gender?: string;
    sexo_biologico?: string;
    genero_identidade?: string;
    gender_identity?: string;
  };
  const legacyGender = String(
    legacyPerson.sexo
      ?? legacyPerson.gender
      ?? legacyPerson.sexo_biologico
      ?? legacyPerson.genero_identidade
      ?? legacyPerson.gender_identity
      ?? '',
  ).trim().toLowerCase();
  const rawGender = primaryGender || legacyGender;

  if (/^(pet|animal|mascote)$/.test(rawGender)) return 'pet';
  if (/^(mulher|f|fem|feminino|female)$/.test(rawGender)) return 'female';
  if (/^(homem|m|masc|masculino|male)$/.test(rawGender)) return 'male';
  if (primaryGender) return 'neutral';

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

type FamilyMapColorKey =
  | 'tataravos'
  | 'bisavos'
  | 'avos'
  | 'tios'
  | 'primos'
  | 'pais'
  | 'central'
  | 'irmaos'
  | 'sobrinhos'
  | 'conjuge'
  | 'filhos'
  | 'netos'
  | 'pets';

export const FAMILY_MAP_AVATAR_SIZES = {
  horizontal: {
    avatar: 'h-[46px] w-[46px]',
    icon: 'h-6 w-6',
  },
  mobileDefault: {
    avatar: 'h-[64px] w-[64px]',
    icon: 'h-7 w-7',
  },
  mobileCentralCompact: {
    avatar: 'h-[66px] w-[66px]',
    icon: 'h-8 w-8',
  },
  mobileCentral: {
    avatar: 'h-[86px] w-[86px]',
    icon: 'h-10 w-10',
  },
  mobileSibling: {
    avatar: 'h-[50px] w-[50px]',
    icon: 'h-6 w-6',
  },
  mobileAncestor: {
    avatar: 'h-[34px] w-[34px] border-2',
    icon: 'h-4 w-4',
  },
  mobileMini: {
    avatar: 'h-[36px] w-[36px] border-2',
    icon: 'h-5 w-5',
  },
  mobilePet: {
    avatar: 'h-[38px] w-[38px] border-2',
    icon: 'h-5 w-5',
  },
} as const;


function normalizeColorKeyText(value?: string) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getFamilyMapColorKeyFromText(
  value?: string,
  options: { central?: boolean; spouse?: boolean } = {},
): FamilyMapColorKey | undefined {
  if (options.central) return 'central';
  if (options.spouse) return 'conjuge';

  const normalized = normalizeColorKeyText(value);

  if (normalized.includes('tataravos')) return 'tataravos';
  if (normalized.includes('bisavos')) return 'bisavos';
  if (normalized.includes('avos')) return 'avos';
  if (normalized.includes('tios')) return 'tios';
  if (normalized.includes('primos')) return 'primos';
  if (normalized.includes('pai') || normalized.includes('mae')) return 'pais';
  if (normalized.includes('irmaos')) return 'irmaos';
  if (normalized.includes('sobrinhos')) return 'sobrinhos';
  if (normalized.includes('conjuge')) return 'conjuge';
  if (normalized.includes('filhos')) return 'filhos';
  if (normalized.includes('netos')) return 'netos';
  if (normalized.includes('pets')) return 'pets';

  return undefined;
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
      data-family-map-avatar="true"
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/80 bg-white/20 shadow-inner ${className}`}
    >
      {person.foto_principal_url ? (
        <img src={person.foto_principal_url} alt="" data-family-map-photo-avatar="true" className="h-full w-full object-cover" />
      ) : pet ? (
        <PawPrint className={`family-map-avatar-icon family-map-pet-icon ${iconClassName}`} aria-hidden="true" />
      ) : (
        <User className={`family-map-avatar-icon family-map-user-icon ${iconClassName}`} aria-hidden="true" />
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
        <Star
          className={`family-map-status-icon family-map-birth-icon ${iconSize} shrink-0 fill-current`}
          fill="currentColor"
          stroke="currentColor"
          aria-hidden="true"
        />
        {birthLine && <span className="truncate">{birthLine}</span>}
      </span>
      {showDeathLine && (
        <span className={`mt-0.5 flex w-full min-w-0 items-center ${alignment} ${gap} ${textSize} font-semibold leading-tight text-cyan-50`}>
          <Cross
            className={`family-map-status-icon family-map-deceased-icon ${iconSize} shrink-0`}
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          />
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
  roomy = false,
  familyMapColorKeyOverride,
}: {
  person: Pessoa;
  label?: string;
  central?: boolean;
  compact?: boolean;
  mini?: boolean;
  horizontal?: boolean;
  tone?: 'default' | 'spouse' | 'ancestorSpouse';
  vitalMode?: 'year' | 'full';
  roomy?: boolean;
  familyMapColorKeyOverride?: FamilyMapColorKey;
  onClick: (person: Pessoa) => void;
}) {
  const { pet, displayName, birthLine, deathLine, birthYearLine, deathYearLine, showDeathLine } = getVisualPersonCardData(person);
  const effectiveBirthLine = vitalMode === 'full' ? birthLine : birthYearLine;
  const effectiveDeathLine = vitalMode === 'full' ? deathLine : deathYearLine;
  const isSpouseTone = tone === 'spouse';
  const isAncestorSpouseTone = tone === 'ancestorSpouse';
  const familyMapColorKey = familyMapColorKeyOverride ?? getFamilyMapColorKeyFromText(label, {
    central,
    spouse: isSpouseTone || isAncestorSpouseTone,
  });

  if (horizontal) {
    return (
      <button
        type="button"
        data-family-map-color-key={familyMapColorKey}
        data-family-map-spouse-tone={isSpouseTone || isAncestorSpouseTone ? 'true' : undefined}
        onClick={() => onClick(person)}
        className={[
          `flex ${roomy ? 'h-[82px]' : 'h-[74px]'} w-full min-w-0 items-center gap-2 rounded-[1.1rem] border px-2.5 py-2 text-left text-white shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)] active:scale-[0.98]`,
          isSpouseTone || isAncestorSpouseTone
            ? 'border-emerald-200 bg-gradient-to-b from-emerald-300 via-teal-500 to-emerald-700'
            : 'border-cyan-200 bg-gradient-to-b from-teal-500 to-cyan-700',
        ].join(' ')}
      >
        <VisualPersonAvatar person={person} pet={pet} className={FAMILY_MAP_AVATAR_SIZES.horizontal.avatar} iconClassName={FAMILY_MAP_AVATAR_SIZES.horizontal.icon} />
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
  const height = central
    ? 'h-[194px]'
    : mini
      ? roomy ? 'h-[124px]' : 'h-[112px]'
      : compact ? 'h-[128px]' : 'h-[164px]';
  const titleSize = central ? 'text-[15px]' : mini ? 'text-[10px]' : compact ? 'text-[11px]' : 'text-[12px]';

  return (
    <button
      type="button"
      data-family-map-color-key={familyMapColorKey}
      data-family-map-spouse-tone={isSpouseTone || isAncestorSpouseTone ? 'true' : undefined}
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
  vitalMode = 'year',
  roomy = false,
  hideChrome = false,
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
  vitalMode?: 'year' | 'full';
  roomy?: boolean;
  hideChrome?: boolean;
}) {
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  const isExpanded = expanded ?? internalExpanded;
  const limit = collapsedLimit ?? people.length;
  const canExpand = expandable && people.length > limit;
  const groupColorKey = getFamilyMapColorKeyFromText(title);
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
  const groupChromeClassName = hideChrome
    ? 'relative z-10 flex min-h-0 flex-col overflow-visible rounded-none border border-transparent bg-transparent p-0 shadow-none'
    : 'relative z-10 flex min-h-0 flex-col rounded-[1.35rem] border border-cyan-100 bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.08)]';

  return (
    <section
      data-family-map-group="true"
      data-family-map-chrome-hidden={hideChrome ? 'true' : undefined}
      data-family-map-color-key={groupColorKey}
      className={[
        groupChromeClassName,
        !hideChrome && (pillTitle ? 'pt-5' : 'overflow-hidden'),
        className,
      ].filter(Boolean).join(' ')}
    >
      {!hideChrome && (pillTitle ? (
        <span
          data-family-map-group-title="true"
          className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow"
        >
          {title}
        </span>
      ) : (
        <h3
          data-family-map-group-title="true"
          className="mb-2 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700"
        >
          {title}
        </h3>
      ))}
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

            const centerSingleCardInLastRow = columnCount === 2
              && renderedItems.length % 2 === 1
              && index === renderedItems.length - 1;
            const personWrapperClassName = [
              'relative min-w-0',
              centerSingleCardInLastRow ? 'col-span-2 mx-auto' : '',
            ].filter(Boolean).join(' ');
            const personWrapperStyle = centerSingleCardInLastRow
              ? { width: 'calc((100% - 0.5rem) / 2)' }
              : undefined;

            return (
              <div key={person.id} className={personWrapperClassName} style={personWrapperStyle}>
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
                  vitalMode={vitalMode}
                  roomy={roomy}
                />
              </div>
            );
          })}
        </div>
      )}
      {canExpand && (
        <button
          type="button"
          data-tree-export-ignore="true"
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
