import { Pessoa, Relacionamento } from '../types';

export type ConjugalRelationshipStatus =
  | 'active'
  | 'widowed'
  | 'separated'
  | 'divorced'
  | 'inactive'
  | 'historical';

export type ParsedConjugalDate = {
  date: Date;
  formatted: string;
};

type RelationshipRecord = Partial<Relacionamento> & Record<string, unknown>;

const SUBTYPE_LABELS: Record<string, string> = {
  casamento: 'casamento',
  uniao: 'união',
  uniao_estavel: 'união estável',
  separado: 'vínculo conjugal anterior',
  divorciado: 'vínculo conjugal anterior',
  divorcio: 'vínculo conjugal anterior',
};

function normalizeText(value: unknown) {
  const text = String(value ?? '').trim();
  const normalized = text.toLowerCase();

  if (!text || normalized === 'null' || normalized === 'undefined') return '';
  return text;
}

function normalizeSubtype(value: unknown) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function getRelationshipStringField(
  relationship: RelationshipRecord | undefined,
  keys: string[]
) {
  if (!relationship) return '';

  for (const key of keys) {
    const value = relationship[key];

    if (typeof value === 'string' || typeof value === 'number') {
      const normalized = normalizeText(value);
      if (normalized) return normalized;
    }
  }

  return '';
}

function getFirstName(value?: string) {
  return normalizeText(value).split(/\s+/).filter(Boolean)[0];
}

function getHeadlineVerb(status: ConjugalRelationshipStatus, hasTwoPeople: boolean) {
  if (status === 'active') return hasTwoPeople ? 'mantêm' : 'mantém';
  return hasTwoPeople ? 'tiveram' : 'teve';
}

export function parseConjugalDateValue(value?: string | number | null): ParsedConjugalDate | undefined {
  if (value === null || value === undefined) return undefined;

  const text = String(value).trim();
  if (!text) return undefined;

  const brDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const isoDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const day = brDate ? Number(brDate[1]) : isoDate ? Number(isoDate[3]) : undefined;
  const month = brDate ? Number(brDate[2]) : isoDate ? Number(isoDate[2]) : undefined;
  const year = brDate ? Number(brDate[3]) : isoDate ? Number(isoDate[1]) : undefined;

  if (!day || !month || !year) return undefined;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return {
    date,
    formatted: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
  };
}

export function isPersonDeceasedForConjugalStatus(person?: Pessoa) {
  return Boolean(person?.falecido || person?.data_falecimento || person?.local_falecimento);
}

export function getConjugalRelationshipStatus(
  relationship?: Relacionamento,
  person1?: Pessoa,
  person2?: Pessoa
): ConjugalRelationshipStatus {
  const relationshipRecord = (relationship || {}) as RelationshipRecord;
  const subtype = normalizeSubtype(relationshipRecord.subtipo_relacionamento);
  const separationDate = getRelationshipStringField(relationshipRecord, [
    'data_separacao',
    'data_fim',
  ]);
  const activeValue = relationshipRecord.ativo;
  const person1Deceased = isPersonDeceasedForConjugalStatus(person1);
  const person2Deceased = isPersonDeceasedForConjugalStatus(person2);

  if (subtype === 'divorciado' || subtype === 'divorcio') return 'divorced';
  if (separationDate || subtype === 'separado') return 'separated';
  if (person1Deceased && person2Deceased) return 'historical';
  if (person1Deceased || person2Deceased) return 'widowed';
  if (activeValue === false) return 'inactive';

  return 'active';
}

export function isConjugalRelationshipEnded(status: ConjugalRelationshipStatus) {
  return status !== 'active';
}

export function getConjugalRelationshipStatusLabel(status: ConjugalRelationshipStatus) {
  const labels: Record<ConjugalRelationshipStatus, string> = {
    active: 'União ativa',
    widowed: 'Viuvez',
    separated: 'Separação registrada',
    divorced: 'Divórcio registrado',
    inactive: 'União inativa',
    historical: 'União histórica',
  };

  return labels[status];
}

export function getConjugalRelationshipStatusDescription(status: ConjugalRelationshipStatus) {
  const descriptions: Record<ConjugalRelationshipStatus, string> = {
    active: 'Vínculo conjugal vigente na árvore familiar.',
    widowed: 'Vínculo encerrado por falecimento de um dos cônjuges.',
    separated: 'Vínculo conjugal anterior com separação registrada.',
    divorced: 'Vínculo conjugal anterior com divórcio registrado.',
    inactive: 'Vínculo conjugal marcado como inativo sem motivo específico.',
    historical: 'Vínculo histórico preservado na árvore familiar.',
  };

  return descriptions[status];
}

export function getConjugalRelationshipSubtypeLabel(relationship?: Relacionamento) {
  const subtype = normalizeSubtype(relationship?.subtipo_relacionamento);
  return SUBTYPE_LABELS[subtype] || 'casamento';
}

export function buildConjugalRelationshipHeadline({
  person1Name,
  person2Name,
  relationship,
  person1,
  person2,
}: {
  person1Name?: string;
  person2Name?: string;
  relationship?: Relacionamento;
  person1?: Pessoa;
  person2?: Pessoa;
}) {
  const name1 = getFirstName(person1Name);
  const name2 = getFirstName(person2Name);
  const subtypeLabel = getConjugalRelationshipSubtypeLabel(relationship);
  const status = getConjugalRelationshipStatus(relationship, person1, person2);
  const hasTwoPeople = Boolean(name1 && name2);
  const verb = getHeadlineVerb(status, hasTwoPeople);

  if (name1 && name2) {
    return `${name1} e ${name2} ${verb} ${subtypeLabel} registrado na árvore familiar.`;
  }

  if (name1) return `${name1} ${verb} ${subtypeLabel} registrado na árvore familiar.`;
  if (name2) return `${name2} ${verb} ${subtypeLabel} registrado na árvore familiar.`;

  return 'Vínculo conjugal registrado na árvore familiar.';
}

export function buildConjugalRelationshipNarrative(relationship?: Relacionamento) {
  const relationshipRecord = (relationship || {}) as RelationshipRecord;
  const subtype = normalizeSubtype(relationshipRecord.subtipo_relacionamento);
  const marriageDate = parseConjugalDateValue(getRelationshipStringField(relationshipRecord, [
    'data_casamento',
    'data_relacionamento',
    'data_inicio',
  ]));
  const separationDate = parseConjugalDateValue(getRelationshipStringField(relationshipRecord, [
    'data_separacao',
    'data_fim',
  ]));
  const marriagePlace = formatConjugalRelationshipPlace(getRelationshipStringField(relationshipRecord, [
    'local_casamento',
    'local_relacionamento',
    'local_inicio',
  ]));
  const separationPlace = formatConjugalRelationshipPlace(getRelationshipStringField(relationshipRecord, [
    'local_separacao',
    'local_fim',
  ]));
  const lines: string[] = [];

  if (marriageDate && separationDate) {
    lines.push(`O vínculo foi registrado de ${marriageDate.formatted} até ${separationDate.formatted}.`);
  } else if (marriageDate) {
    lines.push(`O vínculo foi registrado em ${marriageDate.formatted}.`);
  } else if (separationDate) {
    lines.push(`O vínculo terminou em ${separationDate.formatted}.`);
  } else if (subtype === 'separado') {
    lines.push('Há separação registrada para este vínculo, ainda sem data informada.');
  } else if (subtype === 'divorciado' || subtype === 'divorcio') {
    lines.push('Há divórcio registrado para este vínculo, ainda sem data informada.');
  } else if (relationshipRecord.ativo === false) {
    lines.push('Este vínculo está marcado como inativo, ainda sem motivo detalhado.');
  }

  if (marriagePlace) {
    lines.push(`A cerimônia ou registro aconteceu em ${marriagePlace}.`);
  }

  if (separationPlace) {
    lines.push(`A separação foi registrada em ${separationPlace}.`);
  }

  return lines;
}

export function buildConjugalRelationshipTooltip(
  relationship?: Relacionamento,
  person1?: Pessoa,
  person2?: Pessoa
) {
  const status = getConjugalRelationshipStatus(relationship, person1, person2);
  const subtypeLabel = getConjugalRelationshipSubtypeLabel(relationship);
  return `${getConjugalRelationshipStatusLabel(status)} — ${getConjugalRelationshipStatusDescription(status)} Tipo: ${subtypeLabel}.`;
}

export function formatConjugalRelationshipPlace(place?: string) {
  const text = normalizeText(place);
  if (!text) return undefined;

  if (!text.includes('/')) return text;

  const [city, uf] = text.split('/').map(normalizeText);
  if (city && uf) return `${city}/${uf}`;

  return city || uf;
}
