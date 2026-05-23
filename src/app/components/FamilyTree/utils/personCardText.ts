import { Pessoa } from '../../../types';
import { isPersonDeceased } from '../../../utils/personFields';

export function extractYear(value?: string | number | null) {
  if (value === null || value === undefined) return undefined;

  const text = String(value).trim();
  if (!text) return undefined;

  return text.match(/(?:^|[^\d])(\d{4})(?:[^\d]|$)/)?.[1];
}

export function formatDateBR(value?: string | number | null) {
  if (value === null || value === undefined) return undefined;

  const text = String(value).trim();
  if (!text) return undefined;

  const brDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brDate) {
    const [, day, month, year] = brDate;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  const isoDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoDate) {
    const [, year, month, day] = isoDate;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  return text;
}

export function normalizeBirthPlace(value?: string | null) {
  if (!value) return undefined;

  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

function joinDateAndPlace(date?: string, place?: string) {
  if (date && place) return `${date} - ${place}`;
  return date || place;
}

export function getPersonCardDetailLines(
  pessoa: Pick<Pessoa, 'falecido' | 'data_nascimento' | 'data_falecimento' | 'local_falecimento' | 'local_nascimento'>
) {
  const birthText = joinDateAndPlace(
    formatDateBR(pessoa.data_nascimento),
    normalizeBirthPlace(pessoa.local_nascimento)
  );
  const deathText = joinDateAndPlace(
    formatDateBR(pessoa.data_falecimento),
    normalizeBirthPlace(pessoa.local_falecimento)
  );
  const lines: string[] = [];

  if (birthText) {
    lines.push(`⭐ ${birthText}`);
  }

  if (deathText) {
    lines.push(`✝ ${deathText}`);
  } else if (isPersonDeceased(pessoa)) {
    lines.push('✝ Falecido(a)');
  }

  return lines;
}

export function getPersonCardSecondaryText(pessoa: Pick<Pessoa, 'falecido' | 'data_nascimento' | 'data_falecimento' | 'local_falecimento' | 'local_nascimento'>) {
  return getPersonCardDetailLines(pessoa).join(' · ') || undefined;
}
