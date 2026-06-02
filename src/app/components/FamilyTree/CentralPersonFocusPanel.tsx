import React from 'react';
import {
  Archive,
  CalendarDays,
  Dog,
  Eye,
  HeartPulse,
  Home,
  Link2,
  MapPin,
  Sparkles,
  User,
} from 'lucide-react';

import type { Pessoa } from '../../types';
import { isPersonDeceased } from '../../utils/personFields';
import { isPetFamilyMember } from '../../utils/personEntity';
import { formatDateBR, normalizeBirthPlace, extractYear } from './utils/personCardText';

interface CentralPersonFocusPanelProps {
  pessoa: Pessoa;
  isMobile?: boolean;
  onView?: (pessoa: Pessoa) => void;
  onAddConnection?: (pessoa: Pessoa) => void;
  onOpenPhoto?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function stopAndRun(
  event: React.MouseEvent<HTMLButtonElement>,
  action?: () => void
) {
  event.preventDefault();
  event.stopPropagation();
  action?.();
}

function parseDateParts(value?: string | number | null) {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  if (!text) return null;

  const brDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brDate) {
    return {
      day: Number(brDate[1]),
      month: Number(brDate[2]),
      year: Number(brDate[3]),
      hasFullDate: true,
    };
  }

  const isoDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoDate) {
    return {
      year: Number(isoDate[1]),
      month: Number(isoDate[2]),
      day: Number(isoDate[3]),
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

function getAgeFromBirthDate(value?: string | number | null) {
  const birthDate = parseDateParts(value);
  if (!birthDate || !Number.isFinite(birthDate.year)) return undefined;

  const today = new Date();
  let age = today.getFullYear() - birthDate.year;

  if (birthDate.hasFullDate && birthDate.month && birthDate.day) {
    const hadBirthday =
      today.getMonth() + 1 > birthDate.month ||
      (today.getMonth() + 1 === birthDate.month && today.getDate() >= birthDate.day);
    if (!hadBirthday) age -= 1;
  }

  if (age < 0 || age > 130) return undefined;
  return birthDate.hasFullDate ? `${age} anos` : `aprox. ${age} anos`;
}

function getLifeSpanLabel(pessoa: Pessoa) {
  const birthYear = extractYear(pessoa.data_nascimento);
  const deathYear = extractYear(pessoa.data_falecimento);

  if (birthYear && deathYear) {
    const years = Number(deathYear) - Number(birthYear);
    if (Number.isFinite(years) && years >= 0) {
      return `${birthYear}-${deathYear} · ${years} anos`;
    }

    return `${birthYear}-${deathYear}`;
  }

  if (deathYear) return `Falecido(a) em ${deathYear}`;
  return undefined;
}

function getPrimaryStatus(pessoa: Pessoa) {
  if (isPetFamilyMember(pessoa)) return 'Pet';
  if (isPersonDeceased(pessoa)) return 'Falecido';
  return 'Vivo';
}

function truncateText(value: string | undefined, maxLength: number) {
  const text = value?.trim().replace(/\s+/g, ' ');
  if (!text) return undefined;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  if (!value) return null;

  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white/88 p-3 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase leading-none text-slate-500">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-2 break-words text-[15px] font-extrabold leading-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function TextBlock({
  title,
  value,
}: {
  title: string;
  value?: string;
}) {
  if (!value) return null;

  return (
    <section className="min-w-0 rounded-md border border-slate-200 bg-white/88 p-3 shadow-sm">
      <h4 className="text-[12px] font-extrabold uppercase leading-none text-slate-500">
        {title}
      </h4>
      <p className="mt-2 line-clamp-3 break-words text-[15px] font-semibold leading-snug text-slate-800">
        {value}
      </p>
    </section>
  );
}

export function CentralPersonFocusPanel({
  pessoa,
  isMobile = false,
  onView,
  onAddConnection,
  onOpenPhoto,
}: CentralPersonFocusPanelProps) {
  const isPet = isPetFamilyMember(pessoa);
  const isDeceased = isPersonDeceased(pessoa);
  const status = getPrimaryStatus(pessoa);
  const canShowBirthDate = pessoa.permitir_exibir_data_nascimento !== false;
  const birthDate = canShowBirthDate ? formatDateBR(pessoa.data_nascimento) : undefined;
  const birthPlace = canShowBirthDate ? normalizeBirthPlace(pessoa.local_nascimento) : undefined;
  const birthSummary = [birthDate, birthPlace].filter(Boolean).join(' · ') || undefined;
  const ageOrLifeSpan = canShowBirthDate
    ? isDeceased
      ? getLifeSpanLabel(pessoa)
      : getAgeFromBirthDate(pessoa.data_nascimento)
    : undefined;
  const historicalFilesCount = pessoa.arquivos_historicos?.length;
  const historicalFilesLabel = historicalFilesCount && historicalFilesCount > 0
    ? `${historicalFilesCount} ${historicalFilesCount === 1 ? 'arquivo' : 'arquivos'}`
    : undefined;
  const minibio = truncateText(pessoa.minibio, isMobile ? 150 : 230);
  const curiosities = truncateText(pessoa.curiosidades, isMobile ? 130 : 210);
  const statusClassName = isPet
    ? 'bg-amber-100 text-amber-900 ring-amber-200'
    : isDeceased
      ? 'bg-slate-200 text-slate-800 ring-slate-300'
      : 'bg-emerald-100 text-emerald-900 ring-emerald-200';

  const avatar = pessoa.foto_principal_url ? (
    <img
      src={pessoa.foto_principal_url}
      alt={pessoa.nome_completo}
      className="h-full w-full rounded-lg object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100 text-slate-600">
      {isPet ? <Dog className="h-20 w-20" /> : <User className="h-20 w-20" />}
    </div>
  );

  if (isMobile) {
    const photo = pessoa.foto_principal_url && onOpenPhoto ? (
      <button
        type="button"
        className="relative h-[205px] min-h-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
        onClick={(event) => stopAndRun(event, () => onOpenPhoto(event))}
        onMouseDown={(event) => event.stopPropagation()}
        aria-label={`Ampliar foto de ${pessoa.nome_completo}`}
      >
        {avatar}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent px-4 pb-4 pt-10">
          <span className="block break-words text-left text-[20px] font-black leading-[1.02] text-white drop-shadow" title={pessoa.nome_completo}>
            {pessoa.nome_completo}
          </span>
        </span>
      </button>
    ) : (
      <div className="relative h-[205px] min-h-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm">
        {avatar}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent px-4 pb-4 pt-10">
          <h3 className="break-words text-[20px] font-black leading-[1.02] text-white drop-shadow" title={pessoa.nome_completo}>
            {pessoa.nome_completo}
          </h3>
        </div>
      </div>
    );

    return (
      <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2 text-left text-slate-900 shadow-xl">
        {photo}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={['inline-flex rounded-full px-3 py-1.5 text-[14px] font-extrabold uppercase leading-none ring-1', statusClassName].join(' ')}>
            {status}
          </span>
          {ageOrLifeSpan && (
            <span className="inline-flex rounded-full bg-white px-3 py-1.5 text-[14px] font-extrabold uppercase leading-none text-slate-700 ring-1 ring-slate-200">
              {ageOrLifeSpan}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {onView && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-[15px] font-extrabold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={(event) => stopAndRun(event, () => onView(pessoa))}
            >
              <Eye className="h-4 w-4" />
              <span>Visualizar perfil completo</span>
            </button>
          )}
          {onAddConnection && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-[15px] font-extrabold text-slate-800 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={(event) => stopAndRun(event, () => onAddConnection(pessoa))}
            >
              <Link2 className="h-4 w-4" />
              <span>Adicionar conexão</span>
            </button>
          )}
        </div>

        <div className="hidden">
          <InfoCard icon={CalendarDays} label="Nascimento" value={birthSummary} />
          {!birthSummary && ageOrLifeSpan && (
            <InfoCard icon={HeartPulse} label="Tempo de vida" value={ageOrLifeSpan} />
          )}
          {birthPlace && !birthDate && (
            <InfoCard icon={MapPin} label="Naturalidade" value={birthPlace} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-slate-900 shadow-xl">
      <div className="grid min-h-0 grid-cols-[220px_minmax(0,1fr)] gap-4">
        {pessoa.foto_principal_url && onOpenPhoto ? (
          <button
            type="button"
            className="aspect-square min-h-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
            onClick={(event) => stopAndRun(event, () => onOpenPhoto(event))}
            onMouseDown={(event) => event.stopPropagation()}
            aria-label={`Ampliar foto de ${pessoa.nome_completo}`}
          >
            {avatar}
          </button>
        ) : (
          <div className="aspect-square min-h-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm">
            {avatar}
          </div>
        )}

        <div className="flex min-w-0 flex-col justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={['inline-flex rounded-full px-3 py-1 text-xs font-extrabold uppercase leading-none ring-1', statusClassName].join(' ')}>
                {status}
              </span>
              {ageOrLifeSpan && (
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase leading-none text-slate-700 ring-1 ring-slate-200">
                  {ageOrLifeSpan}
                </span>
              )}
            </div>
            <h3
              className="mt-3 break-words text-[34px] font-black leading-[1.02] text-slate-950"
              title={pessoa.nome_completo}
            >
              {pessoa.nome_completo}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {onView && (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={(event) => stopAndRun(event, () => onView(pessoa))}
              >
                <Eye className="h-4 w-4" />
                <span>Visualizar perfil completo</span>
              </button>
            )}
            {onAddConnection && (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-extrabold text-slate-800 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={(event) => stopAndRun(event, () => onAddConnection(pessoa))}
              >
                <Link2 className="h-4 w-4" />
                <span>Adicionar conexão</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid min-h-0 grid-cols-2 gap-3">
        <InfoCard icon={CalendarDays} label={isPet ? 'Nascimento' : 'Nascimento'} value={birthSummary} />
        <InfoCard icon={Home} label="Local atual" value={pessoa.local_atual} />
        <InfoCard icon={Sparkles} label="Geração" value={pessoa.geracao_sociologica} />
        <InfoCard icon={Archive} label="Arquivos históricos" value={historicalFilesLabel} />
        {!birthSummary && ageOrLifeSpan && (
          <InfoCard icon={HeartPulse} label="Tempo de vida" value={ageOrLifeSpan} />
        )}
        {birthPlace && !birthDate && (
          <InfoCard icon={MapPin} label="Naturalidade" value={birthPlace} />
        )}
      </div>

      {(minibio || curiosities) && (
        <div className="mt-3 grid min-h-0 grid-cols-2 gap-3">
          <TextBlock title="Sobre" value={minibio} />
          <TextBlock title="Curiosidades" value={curiosities} />
        </div>
      )}
    </div>
  );
}
