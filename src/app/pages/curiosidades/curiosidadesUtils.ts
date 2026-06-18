import React from 'react';
import type { Pessoa, Relacionamento } from '../../types';
import { countChildrenByPerson } from '../../utils/familyCuriosities';

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
  'MarÃ§o',
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
          : `Hoje Ã© o dia do nascimento de ${name}.`,
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
          ? `Hoje faz ${years} ${years === 1 ? 'ano' : 'anos'} que preservamos a memÃ³ria de ${name}.`
          : `Hoje marca a memÃ³ria de ${name}.`,
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
        : `Hoje Ã© a data de casamento de ${coupleName}.`,
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
    period: '1946â€“1964',
    startYear: 1946,
    endYear: 1964,
    description: 'GeraÃ§Ã£o associada ao pÃ³s-guerra, Ã  expansÃ£o urbana, Ã  estabilidade institucional e Ã  valorizaÃ§Ã£o de carreira e famÃ­lia.',
  },
  {
    key: 'geracao-x',
    label: 'GeraÃ§Ã£o X',
    period: '1965â€“1980',
    startYear: 1965,
    endYear: 1980,
    description: 'Cresceu entre transformaÃ§Ãµes culturais, televisÃ£o forte, mudanÃ§as no mercado de trabalho e transiÃ§Ã£o para tecnologias digitais.',
  },
  {
    key: 'millennial',
    label: 'Millennial / Y',
    period: '1981â€“1996',
    startYear: 1981,
    endYear: 1996,
    description: 'Acompanhou a passagem do mundo analÃ³gico para o digital, a popularizaÃ§Ã£o da internet e novas formas de estudar, trabalhar e se comunicar.',
  },
  {
    key: 'geracao-z',
    label: 'GeraÃ§Ã£o Z',
    period: '1997â€“2012',
    startYear: 1997,
    endYear: 2012,
    description: 'Nativa digital, cresceu com redes sociais, mobilidade, comunicaÃ§Ã£o instantÃ¢nea e maior exposiÃ§Ã£o a temas globais.',
  },
  {
    key: 'geracao-alpha',
    label: 'GeraÃ§Ã£o Alpha',
    period: '2013â€“2024',
    startYear: 2013,
    endYear: 2024,
    description: 'Primeira geraÃ§Ã£o formada integralmente em ambiente de smartphones, plataformas digitais, IA e aprendizagem altamente mediada por tecnologia.',
    note: 'Algumas classificaÃ§Ãµes de marketing consideram 2010â€“2024.',
  },
  {
    key: 'geracao-beta',
    label: 'GeraÃ§Ã£o Beta',
    period: '2025â€“2039',
    startYear: 2025,
    endYear: 2039,
    description: 'GeraÃ§Ã£o em formaÃ§Ã£o, associada a um cotidiano ainda mais integrado com IA, automaÃ§Ã£o, ambientes conectados e novas formas de educaÃ§Ã£o.',
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
export type CoupleAnniversary = {
  id: string;
  coupleName: string;
  personIds: string[];
  weddingDate: string;
  weddingDateLabel: string;
  years: number;
  milestone: WeddingMilestone | null;
};

export type WeddingMilestone = {
  label: string;
  years: number;
  description: string;
};

export const WEDDING_MILESTONES: WeddingMilestone[] = [
  { label: 'Bodas de JequitibÃ¡', years: 100, description: 'um sÃ©culo de uniÃ£o registrado na histÃ³ria da famÃ­lia' },
  { label: 'Bodas de Platina', years: 65, description: 'uma trajetÃ³ria rara e muito longeva' },
  { label: 'Bodas de Diamante', years: 60, description: 'seis dÃ©cadas de vÃ­nculo familiar' },
  { label: 'Bodas de Ouro', years: 50, description: 'meio sÃ©culo de casamento' },
  { label: 'Bodas de Prata', years: 25, description: 'vinte e cinco anos de uniÃ£o' },
  { label: 'Bodas de Papel', years: 1, description: 'o primeiro ano de casamento' },
];

export function getWeddingMilestone(years: number) {
  return WEDDING_MILESTONES.find((milestone) => years >= milestone.years) ?? null;
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

      const sortedIds = [pessoaA.id, pessoaB.id].sort();
      const key = `${sortedIds.join('-')}-${relacionamento.data_casamento}`;
      if (seen.has(key)) return null;
      seen.add(key);

      const years = calculateFullYearsSince(relacionamento.data_casamento, now);

      return {
        id: key,
        coupleName: `${getPersonDisplayName(pessoaA)} e ${getPersonDisplayName(pessoaB)}`,
        personIds: [pessoaA.id, pessoaB.id],
        weddingDate: relacionamento.data_casamento,
        weddingDateLabel: formatFamilyDate(relacionamento.data_casamento),
        years,
        milestone: getWeddingMilestone(years),
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

function buildQuizOptions(answer: Pessoa, allPeople: Pessoa[]) {
  const options = [answer];

  allPeople
    .filter((pessoa) => pessoa.id !== answer.id)
    .slice(0, 8)
    .forEach((pessoa) => {
      if (options.length < 4) options.push(pessoa);
    });

  return options
    .slice(0, 4)
    .sort((a, b) => getPersonDisplayName(a).localeCompare(getPersonDisplayName(b), 'pt-BR'))
    .map((pessoa) => ({
      id: pessoa.id,
      label: getPersonDisplayName(pessoa),
      imageUrl: pessoa.foto_principal_url,
    }));
}

export { countChildrenByPerson };

export function buildCuriosityQuizQuestions(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[]
): CuriosityQuizQuestion[] {
  const people = pessoas
    .filter((pessoa) => !isPet(pessoa))
    .filter((pessoa) => Boolean(pessoa.id && pessoa.nome_completo));

  if (people.length < 4) return [];

  const byBirthYear = people
    .map((pessoa) => ({ pessoa, year: getBirthYear(pessoa) }))
    .filter((item): item is { pessoa: Pessoa; year: number } => Boolean(item.year))
    .sort((a, b) => a.year - b.year);

  const questions: CuriosityQuizQuestion[] = [];

  const oldest = byBirthYear[0];
  if (oldest) {
    questions.push({
      id: 'oldest-person',
      prompt: 'Quem Ã© a pessoa mais antiga cadastrada na famÃ­lia?',
      answerId: oldest.pessoa.id,
      answerLabel: getPersonDisplayName(oldest.pessoa),
      explanation: `${getPersonDisplayName(oldest.pessoa)} aparece com ano de nascimento em ${oldest.year}.`,
      options: buildQuizOptions(oldest.pessoa, people),
    });
  }

  const youngest = byBirthYear[byBirthYear.length - 1];
  if (youngest && youngest.pessoa.id !== oldest?.pessoa.id) {
    questions.push({
      id: 'youngest-person',
      prompt: 'Quem Ã© a pessoa mais jovem cadastrada na famÃ­lia?',
      answerId: youngest.pessoa.id,
      answerLabel: getPersonDisplayName(youngest.pessoa),
      explanation: `${getPersonDisplayName(youngest.pessoa)} aparece com ano de nascimento em ${youngest.year}.`,
      options: buildQuizOptions(youngest.pessoa, people),
    });
  }

  const topBirthCity = getBirthCityRanking(people, 1)[0];
  if (topBirthCity) {
    const answer = people.find((pessoa) => normalizeCuriosityText(pessoa.local_nascimento) === normalizeCuriosityText(topBirthCity.label));
    if (answer) {
      questions.push({
        id: 'birth-city',
        prompt: `Quem nasceu em ${topBirthCity.label}?`,
        answerId: answer.id,
        answerLabel: getPersonDisplayName(answer),
        explanation: `${topBirthCity.label} aparece como uma das cidades de nascimento mais recorrentes da famÃ­lia.`,
        options: buildQuizOptions(answer, people),
      });
    }
  }

  const topProfession = getProfessionRanking(people, 1)[0];
  if (topProfession) {
    const answer = people.find((pessoa) => normalizeCuriosityText(pessoa.profissao) === normalizeCuriosityText(topProfession.label));
    if (answer) {
      questions.push({
        id: 'profession',
        prompt: `Quem tem a profissÃ£o cadastrada como ${topProfession.label}?`,
        answerId: answer.id,
        answerLabel: getPersonDisplayName(answer),
        explanation: `${topProfession.label} aparece entre as profissÃµes mais repetidas da famÃ­lia.`,
        options: buildQuizOptions(answer, people),
      });
    }
  }

  const topParent = countChildrenByPerson(relacionamentos)[0];
  if (topParent?.count > 0) {
    const answer = people.find((pessoa) => pessoa.id === topParent.personId);
    if (answer) {
      questions.push({
        id: 'more-children',
        prompt: 'Quem aparece com mais filhos cadastrados na Ã¡rvore?',
        answerId: answer.id,
        answerLabel: getPersonDisplayName(answer),
        explanation: `${getPersonDisplayName(answer)} aparece com ${topParent.count} ${topParent.count === 1 ? 'filho cadastrado' : 'filhos cadastrados'}.`,
        options: buildQuizOptions(answer, people),
      });
    }
  }

  return questions.filter((question) => question.options.length >= 2).slice(0, 6);
}

export type FamilyRouteSummary = {
  cities: TopCount[];
  routeLabel: string;
  totalPeopleWithCity: number;
};

export function buildFamilyRouteSummary(pessoas: Pessoa[]): FamilyRouteSummary {
  const cities = getCurrentCityRanking(pessoas, 12);
  const routeLabel = cities.map((city) => city.label).join(' â†’ ');
  const totalPeopleWithCity = cities.reduce((total, city) => total + city.count, 0);

  return {
    cities,
    routeLabel,
    totalPeopleWithCity,
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

export function getPersonInterestProfile(pessoa: Pessoa): PersonInterestProfile {
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

  const interests = possibleFields.flatMap((fieldName) => {
    const value = getFlexiblePersonField(pessoa, [fieldName]);
    return splitFlexibleList(value);
  });

  const profession = String(pessoa.profissao ?? '').trim();
  const currentCity = String(pessoa.local_atual ?? '').trim();
  const birthCity = String(pessoa.local_nascimento ?? '').trim();

  if (profession) interests.push(`ProfissÃ£o: ${profession}`);
  if (currentCity) interests.push(`Mora em: ${currentCity}`);
  if (birthCity) interests.push(`Nasceu em: ${birthCity}`);

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

export function comparePeopleInterests(pessoaA: Pessoa | null, pessoaB: Pessoa | null) {
  if (!pessoaA || !pessoaB) {
    return {
      common: [] as string[],
      onlyA: [] as string[],
      onlyB: [] as string[],
      score: 0,
    };
  }

  const profileA = getPersonInterestProfile(pessoaA);
  const profileB = getPersonInterestProfile(pessoaB);

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
  element: 'Fogo' | 'Terra' | 'Ar' | 'Ãgua';
  start: [number, number];
  end: [number, number];
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: 'Ãries', element: 'Fogo', start: [3, 21], end: [4, 19] },
  { name: 'Touro', element: 'Terra', start: [4, 20], end: [5, 20] },
  { name: 'GÃªmeos', element: 'Ar', start: [5, 21], end: [6, 20] },
  { name: 'CÃ¢ncer', element: 'Ãgua', start: [6, 21], end: [7, 22] },
  { name: 'LeÃ£o', element: 'Fogo', start: [7, 23], end: [8, 22] },
  { name: 'Virgem', element: 'Terra', start: [8, 23], end: [9, 22] },
  { name: 'Libra', element: 'Ar', start: [9, 23], end: [10, 22] },
  { name: 'EscorpiÃ£o', element: 'Ãgua', start: [10, 23], end: [11, 21] },
  { name: 'SagitÃ¡rio', element: 'Fogo', start: [11, 22], end: [12, 21] },
  { name: 'CapricÃ³rnio', element: 'Terra', start: [12, 22], end: [1, 19] },
  { name: 'AquÃ¡rio', element: 'Ar', start: [1, 20], end: [2, 18] },
  { name: 'Peixes', element: 'Ãgua', start: [2, 19], end: [3, 20] },
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
      description: `Ambos sÃ£o de ${signA.name}. A leitura recreativa indica identificaÃ§Ã£o direta de ritmo, linguagem e temperamento.`,
    };
  }

  if (signA.element === signB.element) {
    return {
      score: 82,
      label: 'Afinidade alta',
      description: `Os dois signos pertencem ao elemento ${signA.element}, o que sugere compatibilidade natural na leitura astrolÃ³gica recreativa.`,
    };
  }

  const complementaryPairs = new Set(['Fogo-Ar', 'Ar-Fogo', 'Terra-Ãgua', 'Ãgua-Terra']);
  const pair = `${signA.element}-${signB.element}`;

  if (complementaryPairs.has(pair)) {
    return {
      score: 74,
      label: 'Boa combinaÃ§Ã£o',
      description: `${signA.element} e ${signB.element} costumam ser vistos como elementos complementares em leituras astrolÃ³gicas recreativas.`,
    };
  }

  return {
    score: 58,
    label: 'CombinaÃ§Ã£o de contraste',
    description: `A combinaÃ§Ã£o entre ${signA.element} e ${signB.element} pode indicar diferenÃ§as de ritmo, mas tambÃ©m pontos de aprendizado.`,
  };
}

export function getZodiacRanking(pessoas: Pessoa[]) {
  return getTopCounts(
    pessoas.filter((pessoa) => !isPet(pessoa)),
    (pessoa) => getZodiacSignFromDate(pessoa.data_nascimento)?.name ?? '',
    12
  );
}
