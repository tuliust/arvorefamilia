import { Pessoa } from '../types';
import { isPersonDeceased } from './personFields';

export type ManageableProfileReason = 'deceased' | 'child';

export type ManageableProfileEligibility = {
  eligible: boolean;
  reason: ManageableProfileReason | null;
  label: string;
  detail: string;
  age?: number | null;
  approximateAge?: boolean;
};

const DEFAULT_CHILD_MAX_AGE = 10;

function isPetPerson(person?: Pessoa | null) {
  const entityType = String(person?.humano_ou_pet ?? '').trim().toLowerCase();
  const gender = String(person?.genero ?? '').trim().toLowerCase();

  return entityType === 'pet' || gender === 'pet' || gender === 'animal' || gender === 'mascote';
}

function parseBirthDate(value?: string | number | null): { date?: Date; year?: number; approximate: boolean } | null {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  if (!text) return null;

  const yearOnly = text.match(/^(17|18|19|20)\d{2}$/);
  if (yearOnly) {
    return {
      year: Number(text),
      approximate: true,
    };
  }

  const brDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const isoDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const day = brDate ? Number(brDate[1]) : isoDate ? Number(isoDate[3]) : undefined;
  const month = brDate ? Number(brDate[2]) : isoDate ? Number(isoDate[2]) : undefined;
  const year = brDate ? Number(brDate[3]) : isoDate ? Number(isoDate[1]) : undefined;

  if (!day || !month || !year) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    date,
    year,
    approximate: false,
  };
}

export function getPersonAge(person: Pessoa, referenceDate = new Date()) {
  const parsed = parseBirthDate(person.data_nascimento);
  if (!parsed) return { age: null as number | null, approximateAge: false };

  if (parsed.date) {
    let age = referenceDate.getUTCFullYear() - parsed.date.getUTCFullYear();
    const referenceMonth = referenceDate.getUTCMonth();
    const birthMonth = parsed.date.getUTCMonth();
    const hasHadBirthdayThisYear =
      referenceMonth > birthMonth ||
      (referenceMonth === birthMonth && referenceDate.getUTCDate() >= parsed.date.getUTCDate());

    if (!hasHadBirthdayThisYear) age -= 1;
    return { age, approximateAge: false };
  }

  if (parsed.year) {
    return {
      age: referenceDate.getUTCFullYear() - parsed.year,
      approximateAge: parsed.approximate,
    };
  }

  return { age: null as number | null, approximateAge: false };
}

export function isChildUnderAge(person: Pessoa, maxAge = DEFAULT_CHILD_MAX_AGE, referenceDate = new Date()) {
  if (isPetPerson(person) || isPersonDeceased(person)) return false;

  const { age } = getPersonAge(person, referenceDate);
  return age !== null && age >= 0 && age <= maxAge;
}

export function getManageableProfileEligibility(
  person?: Pessoa | null,
  options: { childMaxAge?: number; referenceDate?: Date } = {}
): ManageableProfileEligibility {
  if (!person) {
    return {
      eligible: false,
      reason: null,
      label: 'Perfil comum',
      detail: 'Pessoa não encontrada.',
      age: null,
      approximateAge: false,
    };
  }

  if (isPersonDeceased(person)) {
    return {
      eligible: true,
      reason: 'deceased',
      label: 'Perfil legado',
      detail: 'Pessoa falecida. Pode ser administrada por familiares responsáveis.',
      age: null,
      approximateAge: false,
    };
  }

  const { childMaxAge = DEFAULT_CHILD_MAX_AGE, referenceDate = new Date() } = options;
  const { age, approximateAge } = getPersonAge(person, referenceDate);

  if (isChildUnderAge(person, childMaxAge, referenceDate)) {
    return {
      eligible: true,
      reason: 'child',
      label: 'Perfil de criança',
      detail: approximateAge
        ? `Pessoa com idade aproximada de ${age} anos. Pode ser administrada por responsáveis.`
        : `Pessoa com ${age} anos. Pode ser administrada por responsáveis.`,
      age,
      approximateAge,
    };
  }

  return {
    eligible: false,
    reason: null,
    label: 'Perfil comum',
    detail: age === null
      ? 'Sem regra de administração especial identificada.'
      : `Pessoa com ${age} anos.`,
    age,
    approximateAge,
  };
}

export function getProfileEligibilityReasonLabel(reason?: ManageableProfileReason | null) {
  if (reason === 'deceased') return 'Falecido';
  if (reason === 'child') return 'Criança até 10 anos';
  return 'Perfil comum';
}
