import React from 'react';
import type { Pessoa, Relacionamento } from '../../types';
import { countChildrenByPerson } from '../../utils/familyCuriosities';
import {
  buildApproximateFamilyRoute,
  type GeoPoint,
  type GeoRouteSummary,
} from '../../utils/geoDistance';

export type CuriosidadesStatus = 'Em breve' | 'Aguardando dados familiares';

export type CuriosidadesPlaceholderCard = {
  title: string;
  description: string;
  status: CuriosidadesStatus;
  icon: React.ComponentType<{ className?: string }>;
};

export type PersonProfileBadge = {
  id?: string;
  label: string;
  category?: string;
  questionId?: string;
  questionLabel?: string;
  group?: string;
};

export type ProfileBadgesByPersonId = Record<string, PersonProfileBadge[]>;

export type CuriosidadesDataProps = {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  profileBadgesByPersonId?: ProfileBadgesByPersonId;
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

export function countDistinctCurrentCities(pessoas: Pessoa[]) {
  const cities = new Set<string>();

  pessoas.filter(isLivingPerson).forEach((pessoa) => {
    const label = String(pessoa.local_atual ?? '').trim();
    const key = normalizeCuriosityText(label);
    if (key) cities.add(key);
  });

  return cities.size;
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

export function getTopBirthMonths(pessoas: Pessoa[], limit = 5): TopCount[] {
  return [...getBirthMonthCounts(pessoas)]
    .filter((month) => month.count > 0)
    .sort((a, b) => b.count - a.count || a.monthIndex - b.monthIndex)
    .slice(0, limit)
    .map((month) => ({ label: month.label, count: month.count }));
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

export type AgeRangeInfo = {
  key: string;
  label: string;
  period: string;
  minAge: number;
  maxAge: number | null;
  people: Pessoa[];
};

export const AGE_RANGES = [
  { key: 'criancas', label: '0–12 anos', period: '0–12', minAge: 0, maxAge: 12 },
  { key: 'adolescentes', label: '13–17 anos', period: '13–17', minAge: 13, maxAge: 17 },
  { key: 'jovens-adultos', label: '18–29 anos', period: '18–29', minAge: 18, maxAge: 29 },
  { key: 'adultos-30-44', label: '30–44 anos', period: '30–44', minAge: 30, maxAge: 44 },
  { key: 'adultos-45-59', label: '45–59 anos', period: '45–59', minAge: 45, maxAge: 59 },
  { key: 'idosos-60-74', label: '60–74 anos', period: '60–74', minAge: 60, maxAge: 74 },
  { key: 'idosos-75-mais', label: '75+ anos', period: '75+', minAge: 75, maxAge: null },
] as const;

export function getPeopleByAgeRange(pessoas: Pessoa[], now = new Date()): AgeRangeInfo[] {
  return AGE_RANGES.map((range) => {
    const people = pessoas
      .filter(isLivingPerson)
      .filter((pessoa) => {
        const birthDate = parseFamilyDate(pessoa.data_nascimento);
        if (!birthDate) return false;

        const age = calculateFullYearsSince(pessoa.data_nascimento, now);
        return age >= range.minAge && (range.maxAge === null || age <= range.maxAge);
      })
      .sort((a, b) => calculateFullYearsSince(a.data_nascimento, now) - calculateFullYearsSince(b.data_nascimento, now));

    return {
      ...range,
      people,
    };
  });
}
export type CoupleAnniversary = {
  id: string;
  coupleName: string;
  personIds: string[];
  weddingDate: string;
  weddingDateLabel: string;
  years: number;
  milestone: WeddingMilestone | null;
  endedByDeath: boolean;
  endedAtLabel: string | undefined;
  durationLabel: string;
};

export type WeddingMilestone = {
  label: string;
  years: number;
  description: string;
};

export const WEDDING_MILESTONES: WeddingMilestone[] = [
  { label: 'Bodas de Jequitibá', years: 100, description: 'um século de união registrado na história da família' },
  { label: 'Bodas de Platina', years: 65, description: 'uma trajetória rara e muito longeva' },
  { label: 'Bodas de Diamante', years: 60, description: 'seis décadas de vínculo familiar' },
  { label: 'Bodas de Ouro', years: 50, description: 'meio século de casamento' },
  { label: 'Bodas de Prata', years: 25, description: 'vinte e cinco anos de união' },
  { label: 'Bodas de Papel', years: 1, description: 'o primeiro ano de casamento' },
];

export function getWeddingMilestone(years: number) {
  return WEDDING_MILESTONES.find((milestone) => years >= milestone.years) ?? null;
}

function getEarlierDate(dates: Date[]) {
  return dates.sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
}

export function buildCoupleAnniversaries(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[],
  now = new Date()
): CoupleAnniversary[] {
  const pessoasMap = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const seen = new Set<string>();

  return relacionamentos
    .filter((relacionamento) => Boolean(relacionamento.data_casamento))
    .map((relacionamento) => {
      const pessoaA = pessoasMap.get(relacionamento.pessoa_origem_id);
      const pessoaB = pessoasMap.get(relacionamento.pessoa_destino_id);

      if (!pessoaA || !pessoaB || !relacionamento.data_casamento) return null;

      const weddingDate = parseFamilyDate(relacionamento.data_casamento);
      if (!weddingDate) return null;

      const sortedIds = [pessoaA.id, pessoaB.id].sort();
      const key = `${sortedIds.join('-')}-${relacionamento.data_casamento}`;
      if (seen.has(key)) return null;
      seen.add(key);

      const deathDates = [pessoaA.data_falecimento, pessoaB.data_falecimento]
        .map((value) => parseFamilyDate(value))
        .filter((date): date is Date => Boolean(date && date.getTime() >= weddingDate.getTime()));
      const endDate = getEarlierDate(deathDates) ?? now;
      const endedByDeath = deathDates.length > 0;
      const years = calculateFullYearsSince(relacionamento.data_casamento, endDate);
      const weddingDateLabel = formatFamilyDate(relacionamento.data_casamento);
      const endedAtLabel = endedByDeath ? endDate.toLocaleDateString('pt-BR') : undefined;
      const durationLabel = endedByDeath
        ? `${years} ${years === 1 ? 'ano' : 'anos'} de casamento · de ${weddingDateLabel || 'data registrada'} até ${endedAtLabel}`
        : `${years} ${years === 1 ? 'ano' : 'anos'} de casamento${weddingDateLabel ? ` · ${weddingDateLabel}` : ''}`;

      return {
        id: key,
        coupleName: `${getPersonDisplayName(pessoaA)} e ${getPersonDisplayName(pessoaB)}`,
        personIds: [pessoaA.id, pessoaB.id],
        weddingDate: relacionamento.data_casamento,
        weddingDateLabel,
        years,
        milestone: getWeddingMilestone(years),
        endedByDeath,
        endedAtLabel,
        durationLabel,
      };
    })
    .filter((couple): couple is CoupleAnniversary => Boolean(couple))
    .sort((a, b) => b.years - a.years || a.coupleName.localeCompare(b.coupleName, 'pt-BR'));
}

export type CuriosityQuizQuestion = {
  id: string;
  prompt: string;
  answerId: string;
  answerLabel: string;
  explanation: string;
  options: Array<{
    id: string;
    label: string;
    imageUrl?: string;
  }>;
};

function sortPeopleByName(people: Pessoa[]) {
  return [...people].sort((a, b) => getPersonDisplayName(a).localeCompare(getPersonDisplayName(b), 'pt-BR', { sensitivity: 'base' }));
}

function buildQuizOptions(answer: Pessoa, allPeople: Pessoa[], limit = 5) {
  const unique = new Map<string, Pessoa>();
  unique.set(answer.id, answer);

  sortPeopleByName(allPeople)
    .filter((pessoa) => pessoa.id !== answer.id)
    .forEach((pessoa) => {
      if (unique.size < limit) unique.set(pessoa.id, pessoa);
    });

  return sortPeopleByName(Array.from(unique.values()))
    .slice(0, limit)
    .map((pessoa) => ({
      id: pessoa.id,
      label: getPersonDisplayName(pessoa),
      imageUrl: pessoa.foto_principal_url,
    }));
}

function buildControlledQuizOptions(answer: Pessoa, distractors: Pessoa[], limit = 5) {
  return buildQuizOptions(answer, [answer, ...distractors], limit);
}

function isJournalist(pessoa: Pessoa) {
  return normalizeCuriosityText(pessoa.profissao).includes('jornalista');
}

export { countChildrenByPerson };

export function buildCuriosityQuizQuestions(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[]
): CuriosityQuizQuestion[] {
  const people = pessoas
    .filter((pessoa) => !isPet(pessoa))
    .filter((pessoa) => Boolean(pessoa.id && pessoa.nome_completo));

  if (people.length < 5) return [];

  const livingByAge = people
    .filter((pessoa) => !isDeceased(pessoa))
    .map((pessoa) => ({ pessoa, birthDate: parseFamilyDate(pessoa.data_nascimento) }))
    .filter((item): item is { pessoa: Pessoa; birthDate: Date } => Boolean(item.birthDate))
    .sort((a, b) => a.birthDate.getTime() - b.birthDate.getTime());

  const byBirthDate = people
    .map((pessoa) => ({ pessoa, birthDate: parseFamilyDate(pessoa.data_nascimento) }))
    .filter((item): item is { pessoa: Pessoa; birthDate: Date } => Boolean(item.birthDate))
    .sort((a, b) => a.birthDate.getTime() - b.birthDate.getTime());

  const questions: CuriosityQuizQuestion[] = [];

  const fiveOldestLiving = livingByAge.slice(0, 5).map((item) => item.pessoa);
  const oldestLiving = fiveOldestLiving[0];
  if (oldestLiving && fiveOldestLiving.length === 5) {
    questions.push({
      id: 'oldest-living-person',
      prompt: 'Quem é a pessoa viva com mais tempo de vida na árvore?',
      answerId: oldestLiving.id,
      answerLabel: getPersonDisplayName(oldestLiving),
      explanation: `${getPersonDisplayName(oldestLiving)} é a pessoa viva mais velha entre os perfis com data de nascimento cadastrada.`,
      options: buildControlledQuizOptions(oldestLiving, fiveOldestLiving.filter((pessoa) => pessoa.id !== oldestLiving.id), 5),
    });
  }

  const fiveYoungest = [...byBirthDate].reverse().slice(0, 5).map((item) => item.pessoa);
  const youngest = fiveYoungest[0];
  if (youngest && fiveYoungest.length === 5) {
    questions.push({
      id: 'youngest-person',
      prompt: 'Quem é a pessoa mais jovem na família?',
      answerId: youngest.id,
      answerLabel: getPersonDisplayName(youngest),
      explanation: `${getPersonDisplayName(youngest)} tem a data de nascimento mais recente entre as pessoas cadastradas.`,
      options: buildControlledQuizOptions(youngest, fiveYoungest.filter((pessoa) => pessoa.id !== youngest.id), 5),
    });
  }

  const topBirthCity = getBirthCityRanking(people, 1)[0];
  if (topBirthCity) {
    const cityKey = normalizeCuriosityText(topBirthCity.label);
    const cityPeople = sortPeopleByName(people.filter((pessoa) => normalizeCuriosityText(pessoa.local_nascimento) === cityKey));
    const nonCityPeople = sortPeopleByName(people.filter((pessoa) => normalizeCuriosityText(pessoa.local_nascimento) !== cityKey));
    const answer = cityPeople[0];

    if (answer && nonCityPeople.length >= 4) {
      questions.push({
        id: 'birth-city',
        prompt: `Quem nasceu em ${topBirthCity.label}?`,
        answerId: answer.id,
        answerLabel: getPersonDisplayName(answer),
        explanation: `${topBirthCity.label} aparece como uma das cidades de nascimento mais recorrentes da família.`,
        options: buildControlledQuizOptions(answer, nonCityPeople.slice(0, 4), 5),
      });
    }
  }

  const journalists = sortPeopleByName(people.filter(isJournalist));
  const nonJournalists = sortPeopleByName(people.filter((pessoa) => !isJournalist(pessoa)));
  const journalistAnswer = journalists[0];
  if (journalistAnswer && nonJournalists.length >= 4) {
    questions.push({
      id: 'profession-journalist',
      prompt: 'Qual destas pessoas abaixo é jornalista?',
      answerId: journalistAnswer.id,
      answerLabel: getPersonDisplayName(journalistAnswer),
      explanation: `${getPersonDisplayName(journalistAnswer)} tem Jornalista como profissão cadastrada.`,
      options: buildControlledQuizOptions(journalistAnswer, nonJournalists.slice(0, 4), 5),
    });
  }

  const topParent = countChildrenByPerson(relacionamentos)[0];
  if (topParent?.count > 0) {
    const answer = people.find((pessoa) => pessoa.id === topParent.personId);
    if (answer) {
      questions.push({
        id: 'more-children',
        prompt: 'Quem aparece com mais filhos cadastrados na árvore?',
        answerId: answer.id,
        answerLabel: getPersonDisplayName(answer),
        explanation: `${getPersonDisplayName(answer)} aparece com ${topParent.count} ${topParent.count === 1 ? 'filho cadastrado' : 'filhos cadastrados'}.`,
        options: buildQuizOptions(answer, people, 5),
      });
    }
  }

  return questions.filter((question) => question.options.length >= 5).slice(0, 6);
}

export type FamilyRouteSummary = {
  cities: TopCount[];
  routeLabel: string;
  totalPeopleWithCity: number;
  geoRoute: GeoRouteSummary;
  coordinateCities: number;
  missingCoordinateCities: number;
};

function getFlexibleNumberField(record: Record<string, unknown>, fieldNames: string[]) {
  for (const fieldName of fieldNames) {
    const value = record[fieldName];
    if (typeof value === 'number' && Number.isFinite(value)) return value;

    const parsed = Number(String(value ?? '').replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function getCurrentLocationPoint(city: TopCount, pessoas: Pessoa[]): GeoPoint | null {
  const matchingPeople = pessoas.filter((pessoa) =>
    normalizeCuriosityText(pessoa.local_atual) === normalizeCuriosityText(city.label)
  );
  const coordinates = matchingPeople
    .map((pessoa) => {
      const record = pessoa as unknown as Record<string, unknown>;
      const latitude = getFlexibleNumberField(record, [
        'local_atual_latitude',
        'local_atual_lat',
        'current_location_latitude',
        'current_location_lat',
        'latitude',
        'lat',
      ]);
      const longitude = getFlexibleNumberField(record, [
        'local_atual_longitude',
        'local_atual_lng',
        'current_location_longitude',
        'current_location_lng',
        'longitude',
        'lng',
      ]);

      return latitude !== null && longitude !== null ? { latitude, longitude } : null;
    })
    .filter((coordinate): coordinate is { latitude: number; longitude: number } => Boolean(coordinate));

  if (coordinates.length === 0) return null;

  return {
    label: city.label,
    count: city.count,
    latitude: coordinates.reduce((total, coordinate) => total + coordinate.latitude, 0) / coordinates.length,
    longitude: coordinates.reduce((total, coordinate) => total + coordinate.longitude, 0) / coordinates.length,
  };
}

export function buildFamilyRouteSummary(pessoas: Pessoa[]): FamilyRouteSummary {
  const cities = getCurrentCityRanking(pessoas, 12);
  const points = cities
    .map((city) => getCurrentLocationPoint(city, pessoas))
    .filter((point): point is GeoPoint => Boolean(point));
  const geoRoute = buildApproximateFamilyRoute(points);
  const routeLabel = geoRoute.hasEnoughCoordinates
    ? geoRoute.routeLabel
    : cities.map((city) => city.label).join(' → ');
  const totalPeopleWithCity = cities.reduce((total, city) => total + city.count, 0);

  return {
    cities,
    routeLabel,
    totalPeopleWithCity,
    geoRoute,
    coordinateCities: points.length,
    missingCoordinateCities: Math.max(0, cities.length - points.length),
  };
}

export type PersonInterestProfile = {
  pessoa: Pessoa;
  interests: string[];
};

export function getFlexiblePersonField(pessoa: Pessoa, fieldNames: string[]) {
  const record = pessoa as unknown as Record<string, unknown>;

  for (const fieldName of fieldNames) {
    const value = record[fieldName];
    if (value !== undefined && value !== null && String(value).trim()) {
      return value;
    }
  }

  return '';
}

export function splitFlexibleList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value ?? '')
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBadgeLike(raw: unknown): PersonProfileBadge | null {
  if (!raw) return null;

  if (typeof raw === 'string') {
    const label = raw.trim();
    return label ? { label } : null;
  }

  if (typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const label = String(
    record.label ??
    record.nome ??
    record.name ??
    record.value ??
    record.titulo ??
    ''
  ).trim();

  if (!label && Array.isArray(record.selected_badges)) return null;
  if (!label) return null;

  return {
    id: String(record.id ?? record.badge_id ?? record.value ?? '').trim() || undefined,
    label,
    category: String(record.category ?? record.categoria ?? record.step ?? '').trim() || undefined,
    questionId: String(record.question_id ?? record.questionId ?? record.pergunta_id ?? '').trim() || undefined,
    questionLabel: String(record.question_label ?? record.questionLabel ?? record.pergunta ?? '').trim() || undefined,
    group: String(record.group ?? record.grupo ?? record.etapa ?? '').trim() || undefined,
  };
}

function extractBadgesFromUnknown(value: unknown): PersonProfileBadge[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractBadgesFromUnknown(item));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const direct = normalizeBadgeLike(value);
    const nested = [
      record.selected_badges,
      record.selectedBadges,
      record.badges,
      record.profile_badges,
      record.questionnaire_badges,
    ].flatMap((item) => extractBadgesFromUnknown(item));

    return direct ? [direct, ...nested] : nested;
  }

  const direct = normalizeBadgeLike(value);
  return direct ? [direct] : [];
}

export function getPersonProfileBadges(
  pessoa: Pessoa,
  profileBadgesByPersonId: ProfileBadgesByPersonId = {}
): PersonProfileBadge[] {
  const record = pessoa as unknown as Record<string, unknown>;
  const candidates = [
    profileBadgesByPersonId[pessoa.id],
    record.selected_badges,
    record.selectedBadges,
    record.profile_badges,
    record.profileBadges,
    record.questionnaire_badges,
    record.questionnaireBadges,
    record.person_profile_questionnaire_answers,
    record.profile_questionnaire_answers,
    record.questionnaire_answers,
  ];

  const unique = new Map<string, PersonProfileBadge>();

  candidates.flatMap((candidate) => extractBadgesFromUnknown(candidate)).forEach((badge) => {
    const key = normalizeCuriosityText(`${badge.category ?? ''}|${badge.questionId ?? ''}|${badge.questionLabel ?? ''}|${badge.label}`);
    if (key && !unique.has(key)) unique.set(key, badge);
  });

  return Array.from(unique.values());
}

const STYLE_LABELS = new Set([
  'afetivo',
  'simples e direto',
  'divertido',
  'elegante',
  'nostalgico',
  'inspirador',
  'familiar',
  'emocional',
  'leve',
  'formal',
]);

function isStyleBadge(badge: PersonProfileBadge) {
  const metadata = [badge.category, badge.questionId, badge.questionLabel, badge.group, badge.id]
    .map((value) => normalizeCuriosityText(value))
    .join(' ');
  const labelKey = normalizeCuriosityText(badge.label);

  return metadata.includes('estilo') || metadata.includes('style') || STYLE_LABELS.has(labelKey);
}

export function getProfileStyleRanking(
  pessoas: Pessoa[],
  profileBadgesByPersonId: ProfileBadgesByPersonId = {},
  limit = 5
): TopCount[] {
  const counts = new Map<string, TopCount>();

  pessoas.filter((pessoa) => !isPet(pessoa)).forEach((pessoa) => {
    getPersonProfileBadges(pessoa, profileBadgesByPersonId)
      .filter(isStyleBadge)
      .forEach((badge) => {
        const key = normalizeCuriosityText(badge.label);
        const current = counts.get(key);
        if (current) {
          current.count += 1;
        } else if (key) {
          counts.set(key, { label: badge.label, count: 1 });
        }
      });
  });

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'))
    .slice(0, limit);
}

export function getPersonInterestProfile(
  pessoa: Pessoa,
  profileBadgesByPersonId: ProfileBadgesByPersonId = {}
): PersonInterestProfile {
  const badgeInterests = getPersonProfileBadges(pessoa, profileBadgesByPersonId).map((badge) => badge.label);
  const interests = [...badgeInterests];

  if (interests.length === 0) {
    const possibleFields = [
      'interesses',
      'hobbies',
      'preferencias',
      'time',
      'time_coracao',
      'torcida',
      'comida_favorita',
      'musica_favorita',
      'filme_favorito',
    ];

    possibleFields.forEach((fieldName) => {
      const value = getFlexiblePersonField(pessoa, [fieldName]);
      interests.push(...splitFlexibleList(value));
    });

    const profession = String(pessoa.profissao ?? '').trim();
    const currentCity = String(pessoa.local_atual ?? '').trim();
    const birthCity = String(pessoa.local_nascimento ?? '').trim();

    if (profession) interests.push(`Profissão: ${profession}`);
    if (currentCity) interests.push(`Mora em: ${currentCity}`);
    if (birthCity) interests.push(`Nasceu em: ${birthCity}`);
  }

  const unique = new Map<string, string>();

  interests.forEach((interest) => {
    const key = normalizeCuriosityText(interest);
    if (key && !unique.has(key)) {
      unique.set(key, interest);
    }
  });

  return {
    pessoa,
    interests: Array.from(unique.values()),
  };
}

export function comparePeopleInterests(
  pessoaA: Pessoa | null,
  pessoaB: Pessoa | null,
  profileBadgesByPersonId: ProfileBadgesByPersonId = {}
) {
  if (!pessoaA || !pessoaB) {
    return {
      common: [] as string[],
      onlyA: [] as string[],
      onlyB: [] as string[],
      score: 0,
    };
  }

  const profileA = getPersonInterestProfile(pessoaA, profileBadgesByPersonId);
  const profileB = getPersonInterestProfile(pessoaB, profileBadgesByPersonId);

  const normalizedA = new Map(profileA.interests.map((interest) => [normalizeCuriosityText(interest), interest]));
  const normalizedB = new Map(profileB.interests.map((interest) => [normalizeCuriosityText(interest), interest]));

  const common = profileA.interests.filter((interest) => normalizedB.has(normalizeCuriosityText(interest)));
  const onlyA = profileA.interests.filter((interest) => !normalizedB.has(normalizeCuriosityText(interest)));
  const onlyB = profileB.interests.filter((interest) => !normalizedA.has(normalizeCuriosityText(interest)));

  const totalUnique = new Set([...normalizedA.keys(), ...normalizedB.keys()]).size;
  const score = totalUnique > 0 ? Math.round((common.length / totalUnique) * 100) : 0;

  return {
    common,
    onlyA,
    onlyB,
    score,
  };
}

export type ZodiacSign = {
  name: string;
  element: 'Fogo' | 'Terra' | 'Ar' | 'Água';
  start: [number, number];
  end: [number, number];
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: 'Áries', element: 'Fogo', start: [3, 21], end: [4, 19] },
  { name: 'Touro', element: 'Terra', start: [4, 20], end: [5, 20] },
  { name: 'Gêmeos', element: 'Ar', start: [5, 21], end: [6, 20] },
  { name: 'Câncer', element: 'Água', start: [6, 21], end: [7, 22] },
  { name: 'Leão', element: 'Fogo', start: [7, 23], end: [8, 22] },
  { name: 'Virgem', element: 'Terra', start: [8, 23], end: [9, 22] },
  { name: 'Libra', element: 'Ar', start: [9, 23], end: [10, 22] },
  { name: 'Escorpião', element: 'Água', start: [10, 23], end: [11, 21] },
  { name: 'Sagitário', element: 'Fogo', start: [11, 22], end: [12, 21] },
  { name: 'Capricórnio', element: 'Terra', start: [12, 22], end: [1, 19] },
  { name: 'Aquário', element: 'Ar', start: [1, 20], end: [2, 18] },
  { name: 'Peixes', element: 'Água', start: [2, 19], end: [3, 20] },
];

function isDateWithinZodiacRange(month: number, day: number, sign: ZodiacSign) {
  const [startMonth, startDay] = sign.start;
  const [endMonth, endDay] = sign.end;

  if (startMonth <= endMonth) {
    return (
      (month > startMonth || (month === startMonth && day >= startDay)) &&
      (month < endMonth || (month === endMonth && day <= endDay))
    );
  }

  return (
    month > startMonth ||
    (month === startMonth && day >= startDay) ||
    month < endMonth ||
    (month === endMonth && day <= endDay)
  );
}

export function getZodiacSignFromDate(value: unknown) {
  const date = parseFamilyDate(value);
  if (!date) return null;

  const month = date.getMonth() + 1;
  const day = date.getDate();

  return ZODIAC_SIGNS.find((sign) => isDateWithinZodiacRange(month, day, sign)) ?? null;
}

export function getZodiacCompatibility(signA: ZodiacSign | null, signB: ZodiacSign | null) {
  if (!signA || !signB) {
    return {
      score: 0,
      label: 'Dados insuficientes',
      description: 'Cadastre datas de nascimento para calcular os signos.',
    };
  }

  if (signA.name === signB.name) {
    return {
      score: 88,
      label: 'Afinidade alta',
      description: `Ambos são de ${signA.name}. A leitura recreativa indica identificação direta de ritmo, linguagem e temperamento.`,
    };
  }

  if (signA.element === signB.element) {
    return {
      score: 82,
      label: 'Afinidade alta',
      description: `Os dois signos pertencem ao elemento ${signA.element}, o que sugere compatibilidade natural na leitura astrológica recreativa.`,
    };
  }

  const complementaryPairs = new Set(['Fogo-Ar', 'Ar-Fogo', 'Terra-Água', 'Água-Terra']);
  const pair = `${signA.element}-${signB.element}`;

  if (complementaryPairs.has(pair)) {
    return {
      score: 74,
      label: 'Boa combinação',
      description: `${signA.element} e ${signB.element} costumam ser vistos como elementos complementares em leituras astrológicas recreativas.`,
    };
  }

  return {
    score: 58,
    label: 'Combinação de contraste',
    description: `A combinação entre ${signA.element} e ${signB.element} pode indicar diferenças de ritmo, mas também pontos de aprendizado.`,
  };
}

export function getZodiacRanking(pessoas: Pessoa[]) {
  return getTopCounts(
    pessoas.filter((pessoa) => !isPet(pessoa)),
    (pessoa) => getZodiacSignFromDate(pessoa.data_nascimento)?.name ?? '',
    12
  );
}
