import React from 'react';
import type { Pessoa, Relacionamento } from '../../types';

export type CuriosidadesStatus = 'Em breve' | 'Aguardando dados familiares';

export type CuriosidadesPlaceholderCard = {
  title: string;
  description: string;
  status: CuriosidadesStatus;
  icon: React.ComponentType<{ className?: string }>;
};

export type CuriosidadesDataProps = {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  loading?: boolean;
  error?: string | null;
};

export type TopCount = {
  label: string;
  count: number;
};

export type TodayFamilyEvent = {
  id: string;
  type: 'birthday' | 'death' | 'wedding';
  title: string;
  subtitle: string;
  years: number;
  personIds: string[];
};

export const curiositySectionCardClassName = 'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm';

export const curiosityStatusClassName = 'inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700';

export const monthLabels = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function normalizeCuriosityText(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function parseFamilyDate(value: unknown): Date | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value >= 1000 && value <= 9999) {
      return new Date(value, 0, 1, 12, 0, 0, 0);
    }
  }

  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]), 12, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const date = new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]), 12, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const looseDate = new Date(raw);
  return Number.isNaN(looseDate.getTime()) ? null : looseDate;
}

export function getBirthYear(pessoa: Pessoa) {
  const raw = pessoa.data_nascimento;

  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 1000 && raw <= 9999) {
    return raw;
  }

  const date = parseFamilyDate(raw);
  if (!date) return null;

  const year = date.getFullYear();
  return year >= 1800 && year <= 2100 ? year : null;
}

export function formatFamilyDate(value: unknown) {
  const date = parseFamilyDate(value);
  if (!date) return '';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function calculateFullYearsSince(value: unknown, now = new Date()) {
  const date = parseFamilyDate(value);
  if (!date) return 0;

  let years = now.getFullYear() - date.getFullYear();
  const monthDelta = now.getMonth() - date.getMonth();
  const dayDelta = now.getDate() - date.getDate();

  if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) {
    years -= 1;
  }

  return Math.max(0, years);
}

export function hasSameMonthAndDay(value: unknown, now = new Date()) {
  const date = parseFamilyDate(value);
  if (!date) return false;

  return date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export function isPet(pessoa: Pessoa) {
  return normalizeCuriosityText(pessoa.humano_ou_pet) === 'pet';
}

export function isDeceased(pessoa: Pessoa) {
  return Boolean(pessoa.falecido || pessoa.data_falecimento);
}

export function isLivingPerson(pessoa: Pessoa) {
  return !isPet(pessoa) && !isDeceased(pessoa);
}

export function getPersonDisplayName(pessoa?: Pessoa | null) {
  return String(pessoa?.nome_completo || 'Pessoa sem nome').trim();
}

export function getFirstName(value: unknown) {
  const clean = String(value ?? '').trim();
  if (!clean) return '';

  return clean.split(/\s+/)[0] || '';
}

export function getInitials(value: unknown) {
  const parts = String(value ?? '').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toLocaleUpperCase('pt-BR')).join('') || '?';
}

export function getTopCounts<T>(
  items: T[],
  getValue: (item: T) => unknown,
  limit = 5
): TopCount[] {
  const counts = new Map<string, TopCount>();

  items.forEach((item) => {
    const label = String(getValue(item) ?? '').trim();
    if (!label) return;

    const key = normalizeCuriosityText(label);
    if (!key) return;

    const current = counts.get(key);
    if (current) {
      current.count += 1;
    } else {
      counts.set(key, { label, count: 1 });
    }
  });

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'))
    .slice(0, limit);
}

export function getMostRepeatedFirstNames(pessoas: Pessoa[], limit = 5) {
  return getTopCounts(
    pessoas.filter((pessoa) => !isPet(pessoa)),
    (pessoa) => getFirstName(pessoa.nome_completo),
    limit
  );
}

export function getProfessionRanking(pessoas: Pessoa[], limit = 5) {
  return getTopCounts(
    pessoas.filter((pessoa) => !isPet(pessoa)),
    (pessoa) => pessoa.profissao,
    limit
  );
}

export function getBirthCityRanking(pessoas: Pessoa[], limit = 5) {
  return getTopCounts(
    pessoas.filter((pessoa) => !isPet(pessoa)),
    (pessoa) => pessoa.local_nascimento,
    limit
  );
}

export function getCurrentCityRanking(pessoas: Pessoa[], limit = 5) {
  return getTopCounts(
    pessoas.filter((pessoa) => !isPet(pessoa)),
    (pessoa) => pessoa.local_atual,
    limit
  );
}

export function getBirthMonthCounts(pessoas: Pessoa[]) {
  const counts = monthLabels.map((label, index) => ({
    label,
    monthIndex: index,
    count: 0,
  }));

  pessoas.forEach((pessoa) => {
    if (isPet(pessoa)) return;

    const date = parseFamilyDate(pessoa.data_nascimento);
    if (!date) return;

    counts[date.getMonth()].count += 1;
  });

  return counts;
}

export function getTopBirthMonth(pessoas: Pessoa[]) {
  return [...getBirthMonthCounts(pessoas)]
    .filter((month) => month.count > 0)
    .sort((a, b) => b.count - a.count || a.monthIndex - b.monthIndex)[0] ?? null;
}

export function buildTodayFamilyEvents(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[],
  now = new Date()
): TodayFamilyEvent[] {
  const events: TodayFamilyEvent[] = [];
  const pessoasMap = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const weddingKeys = new Set<string>();

  pessoas.forEach((pessoa) => {
    const name = getPersonDisplayName(pessoa);

    if (hasSameMonthAndDay(pessoa.data_nascimento, now)) {
      const years = calculateFullYearsSince(pessoa.data_nascimento, now);
      events.push({
        id: `birth-${pessoa.id}`,
        type: 'birthday',
        title: years > 0
          ? `Hoje faz ${years} ${years === 1 ? 'ano' : 'anos'} que ${name} nasceu.`
          : `Hoje é o dia do nascimento de ${name}.`,
        subtitle: formatFamilyDate(pessoa.data_nascimento),
        years,
        personIds: [pessoa.id],
      });
    }

    if (hasSameMonthAndDay(pessoa.data_falecimento, now)) {
      const years = calculateFullYearsSince(pessoa.data_falecimento, now);
      events.push({
        id: `death-${pessoa.id}`,
        type: 'death',
        title: years > 0
          ? `Hoje faz ${years} ${years === 1 ? 'ano' : 'anos'} que preservamos a memória de ${name}.`
          : `Hoje marca a memória de ${name}.`,
        subtitle: formatFamilyDate(pessoa.data_falecimento),
        years,
        personIds: [pessoa.id],
      });
    }
  });

  relacionamentos.forEach((relacionamento) => {
    if (!relacionamento.data_casamento || !hasSameMonthAndDay(relacionamento.data_casamento, now)) return;

    const ids = [relacionamento.pessoa_origem_id, relacionamento.pessoa_destino_id].filter(Boolean).sort();
    const key = `${ids.join('-')}-${relacionamento.data_casamento}`;
    if (weddingKeys.has(key)) return;
    weddingKeys.add(key);

    const pessoaA = pessoasMap.get(relacionamento.pessoa_origem_id);
    const pessoaB = pessoasMap.get(relacionamento.pessoa_destino_id);
    if (!pessoaA || !pessoaB) return;

    const years = calculateFullYearsSince(relacionamento.data_casamento, now);
    const coupleName = `${getPersonDisplayName(pessoaA)} e ${getPersonDisplayName(pessoaB)}`;

    events.push({
      id: `wedding-${key}`,
      type: 'wedding',
      title: years > 0
        ? `Hoje faz ${years} ${years === 1 ? 'ano' : 'anos'} que ${coupleName} se casaram.`
        : `Hoje é a data de casamento de ${coupleName}.`,
      subtitle: formatFamilyDate(relacionamento.data_casamento),
      years,
      personIds: [pessoaA.id, pessoaB.id],
    });
  });

  return events.sort((a, b) => b.years - a.years || a.title.localeCompare(b.title, 'pt-BR'));
}

export type SocialGenerationInfo = {
  key: string;
  label: string;
  period: string;
  startYear: number;
  endYear: number;
  description: string;
  note?: string;
};

export const SOCIAL_GENERATIONS: SocialGenerationInfo[] = [
  {
    key: 'baby-boomer',
    label: 'Baby Boomer',
    period: '1946–1964',
    startYear: 1946,
    endYear: 1964,
    description: 'Geração associada ao pós-guerra, à expansão urbana, à estabilidade institucional e à valorização de carreira e família.',
  },
  {
    key: 'geracao-x',
    label: 'Geração X',
    period: '1965–1980',
    startYear: 1965,
    endYear: 1980,
    description: 'Cresceu entre transformações culturais, televisão forte, mudanças no mercado de trabalho e transição para tecnologias digitais.',
  },
  {
    key: 'millennial',
    label: 'Millennial / Y',
    period: '1981–1996',
    startYear: 1981,
    endYear: 1996,
    description: 'Acompanhou a passagem do mundo analógico para o digital, a popularização da internet e novas formas de estudar, trabalhar e se comunicar.',
  },
  {
    key: 'geracao-z',
    label: 'Geração Z',
    period: '1997–2012',
    startYear: 1997,
    endYear: 2012,
    description: 'Nativa digital, cresceu com redes sociais, mobilidade, comunicação instantânea e maior exposição a temas globais.',
  },
  {
    key: 'geracao-alpha',
    label: 'Geração Alpha',
    period: '2013–2024',
    startYear: 2013,
    endYear: 2024,
    description: 'Primeira geração formada integralmente em ambiente de smartphones, plataformas digitais, IA e aprendizagem altamente mediada por tecnologia.',
    note: 'Algumas classificações de marketing consideram 2010–2024.',
  },
  {
    key: 'geracao-beta',
    label: 'Geração Beta',
    period: '2025–2039',
    startYear: 2025,
    endYear: 2039,
    description: 'Geração em formação, associada a um cotidiano ainda mais integrado com IA, automação, ambientes conectados e novas formas de educação.',
  },
];

export function classifySocialGeneration(year: number | null) {
  if (!year) return null;

  return SOCIAL_GENERATIONS.find((generation) => (
    year >= generation.startYear && year <= generation.endYear
  )) ?? null;
}

export function getPeopleBySocialGeneration(pessoas: Pessoa[]) {
  return SOCIAL_GENERATIONS.map((generation) => {
    const people = pessoas
      .filter((pessoa) => !isPet(pessoa))
      .filter((pessoa) => {
        const year = getBirthYear(pessoa);
        return Boolean(year && year >= generation.startYear && year <= generation.endYear);
      })
      .sort((a, b) => (getBirthYear(a) ?? 9999) - (getBirthYear(b) ?? 9999));

    return {
      ...generation,
      people,
    };
  });
}
