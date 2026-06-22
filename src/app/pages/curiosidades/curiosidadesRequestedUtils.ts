import type { Pessoa, Relacionamento } from '../../types';
import type { ProfileQuestionnaireSelectableOption, ProfileQuestionnaireTone } from '../../types/profileQuestionnaire';
import { AI_TONES } from '../../constants/profileQuestionnaireConfig';
import {
  calculateFullYearsSince,
  formatFamilyDate,
  getBirthCityRanking,
  getBirthYear,
  getPersonDisplayName,
  getProfessionRanking,
  getTopCounts,
  isDeceased,
  isLivingPerson,
  isPet,
  monthLabels,
  normalizeCuriosityText,
  parseFamilyDate,
  type CuriosityQuizQuestion,
  type TopCount,
} from './curiosidadesUtils';

export type CuriosidadesProfileSummary = {
  tone: ProfileQuestionnaireTone | null;
  selectedBadges: ProfileQuestionnaireSelectableOption[];
};

export type CuriosidadesProfileSummaryByPersonId = Record<string, CuriosidadesProfileSummary>;

export type ChartDatum = {
  label: string;
  value: number;
  note?: string;
};

export type AdjustedCoupleAnniversary = {
  id: string;
  coupleName: string;
  personIds: string[];
  weddingDate: string;
  weddingDateLabel: string;
  years: number;
  milestone: {
    label: string;
    years: number;
    description: string;
  } | null;
  endedByDeath: boolean;
  endDateLabel?: string;
};

const WEDDING_MILESTONES = [
  { label: 'Bodas de Jequitibá', years: 100, description: 'um século de união registrado na história da família' },
  { label: 'Bodas de Platina', years: 65, description: 'uma trajetória rara e muito longeva' },
  { label: 'Bodas de Diamante', years: 60, description: 'seis décadas de vínculo familiar' },
  { label: 'Bodas de Ouro', years: 50, description: 'meio século de casamento' },
  { label: 'Bodas de Prata', years: 25, description: 'vinte e cinco anos de união' },
  { label: 'Bodas de Papel', years: 1, description: 'o primeiro ano de casamento' },
];

function getWeddingMilestone(years: number) {
  return WEDDING_MILESTONES.find((milestone) => years >= milestone.years) ?? null;
}

export function getTopBirthMonths(pessoas: Pessoa[], limit = 5): TopCount[] {
  const counts = monthLabels.map((label, monthIndex) => ({ label, monthIndex, count: 0 }));

  pessoas.forEach((pessoa) => {
    if (isPet(pessoa)) return;
    const birthDate = parseFamilyDate(pessoa.data_nascimento);
    if (!birthDate) return;
    counts[birthDate.getMonth()].count += 1;
  });

  return counts
    .filter((month) => month.count > 0)
    .sort((a, b) => b.count - a.count || a.monthIndex - b.monthIndex)
    .slice(0, limit)
    .map(({ label, count }) => ({ label, count }));
}

export function getProfileStyleRanking(
  profileSummariesByPersonId: CuriosidadesProfileSummaryByPersonId | undefined,
  limit = 5,
): TopCount[] {
  const toneLabelById = new Map(AI_TONES.map((tone) => [tone.id, tone.label]));
  const summaries = Object.values(profileSummariesByPersonId ?? {});

  return getTopCounts(
    summaries.filter((summary) => Boolean(summary.tone)),
    (summary) => toneLabelById.get(summary.tone as ProfileQuestionnaireTone) ?? summary.tone ?? '',
    limit,
  );
}

export function buildAgeRangeChartData(pessoas: Pessoa[], now = new Date()): ChartDatum[] {
  const ranges = [
    { label: '0–12', min: 0, max: 12 },
    { label: '13–17', min: 13, max: 17 },
    { label: '18–29', min: 18, max: 29 },
    { label: '30–44', min: 30, max: 44 },
    { label: '45–59', min: 45, max: 59 },
    { label: '60–74', min: 60, max: 74 },
    { label: '75+', min: 75, max: Number.POSITIVE_INFINITY },
  ].map((range) => ({ ...range, value: 0 }));

  pessoas.forEach((pessoa) => {
    if (!isLivingPerson(pessoa)) return;
    const birthDate = parseFamilyDate(pessoa.data_nascimento);
    if (!birthDate) return;

    const age = calculateFullYearsSince(pessoa.data_nascimento, now);
    const range = ranges.find((item) => age >= item.min && age <= item.max);
    if (range) range.value += 1;
  });

  return ranges
    .filter((range) => range.value > 0)
    .map((range) => ({ label: range.label, value: range.value }));
}

function pickEarliestDeathDate(pessoaA: Pessoa, pessoaB: Pessoa, weddingDate: Date, now: Date) {
  const deaths = [pessoaA, pessoaB]
    .map((pessoa) => parseFamilyDate(pessoa.data_falecimento))
    .filter((date): date is Date => Boolean(date && date >= weddingDate && date <= now))
    .sort((a, b) => a.getTime() - b.getTime());

  return deaths[0] ?? null;
}

export function buildAdjustedCoupleAnniversaries(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[],
  now = new Date(),
): AdjustedCoupleAnniversary[] {
  const pessoasMap = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const seen = new Set<string>();

  return relacionamentos
    .filter((relacionamento) => Boolean(relacionamento.data_casamento))
    .map((relacionamento) => {
      const pessoaA = pessoasMap.get(relacionamento.pessoa_origem_id);
      const pessoaB = pessoasMap.get(relacionamento.pessoa_destino_id);
      const weddingDate = parseFamilyDate(relacionamento.data_casamento);

      if (!pessoaA || !pessoaB || !relacionamento.data_casamento || !weddingDate) return null;

      const sortedIds = [pessoaA.id, pessoaB.id].sort();
      const key = `${sortedIds.join('-')}-${relacionamento.data_casamento}`;
      if (seen.has(key)) return null;
      seen.add(key);

      const deathDate = pickEarliestDeathDate(pessoaA, pessoaB, weddingDate, now);
      const periodEndDate = deathDate ?? now;
      const years = calculateFullYearsSince(relacionamento.data_casamento, periodEndDate);

      return {
        id: key,
        coupleName: `${getPersonDisplayName(pessoaA)} e ${getPersonDisplayName(pessoaB)}`,
        personIds: [pessoaA.id, pessoaB.id],
        weddingDate: relacionamento.data_casamento,
        weddingDateLabel: formatFamilyDate(relacionamento.data_casamento),
        years,
        milestone: getWeddingMilestone(years),
        endedByDeath: Boolean(deathDate),
        endDateLabel: deathDate ? formatFamilyDate(deathDate) : undefined,
      };
    })
    .filter((couple): couple is AdjustedCoupleAnniversary => Boolean(couple))
    .sort((a, b) => b.years - a.years || a.coupleName.localeCompare(b.coupleName, 'pt-BR'));
}

function getQuestionnaireInterestLabels(
  pessoa: Pessoa,
  profileSummariesByPersonId?: CuriosidadesProfileSummaryByPersonId,
) {
  const summary = profileSummariesByPersonId?.[pessoa.id];
  return summary?.selectedBadges.map((badge) => badge.label).filter(Boolean) ?? [];
}

function getFallbackInterestLabels(pessoa: Pessoa) {
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

  const record = pessoa as unknown as Record<string, unknown>;
  const interests = possibleFields.flatMap((fieldName) => {
    const value = record[fieldName];
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    return String(value ?? '')
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  });

  const profession = String(pessoa.profissao ?? '').trim();
  const currentCity = String(pessoa.local_atual ?? '').trim();
  const birthCity = String(pessoa.local_nascimento ?? '').trim();

  if (profession) interests.push(`Profissão: ${profession}`);
  if (currentCity) interests.push(`Mora em: ${currentCity}`);
  if (birthCity) interests.push(`Nasceu em: ${birthCity}`);

  return interests;
}

export function getPersonInterestProfileFromQuestionnaire(
  pessoa: Pessoa,
  profileSummariesByPersonId?: CuriosidadesProfileSummaryByPersonId,
) {
  const questionnaireInterests = getQuestionnaireInterestLabels(pessoa, profileSummariesByPersonId);
  const interests = questionnaireInterests.length > 0 ? questionnaireInterests : getFallbackInterestLabels(pessoa);
  const unique = new Map<string, string>();

  interests.forEach((interest) => {
    const key = normalizeCuriosityText(interest);
    if (key && !unique.has(key)) unique.set(key, interest);
  });

  return {
    pessoa,
    interests: Array.from(unique.values()),
  };
}

export function comparePeopleInterestsFromQuestionnaire(
  pessoaA: Pessoa | null,
  pessoaB: Pessoa | null,
  profileSummariesByPersonId?: CuriosidadesProfileSummaryByPersonId,
) {
  if (!pessoaA || !pessoaB) {
    return {
      common: [] as string[],
      onlyA: [] as string[],
      onlyB: [] as string[],
      score: 0,
    };
  }

  const profileA = getPersonInterestProfileFromQuestionnaire(pessoaA, profileSummariesByPersonId);
  const profileB = getPersonInterestProfileFromQuestionnaire(pessoaB, profileSummariesByPersonId);

  const normalizedA = new Map(profileA.interests.map((interest) => [normalizeCuriosityText(interest), interest]));
  const normalizedB = new Map(profileB.interests.map((interest) => [normalizeCuriosityText(interest), interest]));

  const common = profileA.interests.filter((interest) => normalizedB.has(normalizeCuriosityText(interest)));
  const onlyA = profileA.interests.filter((interest) => !normalizedB.has(normalizeCuriosityText(interest)));
  const onlyB = profileB.interests.filter((interest) => !normalizedA.has(normalizeCuriosityText(interest)));
  const totalUnique = new Set([...normalizedA.keys(), ...normalizedB.keys()]).size;

  return {
    common,
    onlyA,
    onlyB,
    score: totalUnique > 0 ? Math.round((common.length / totalUnique) * 100) : 0,
  };
}

function deterministicShuffle<T>(items: T[], seed: string) {
  return [...items]
    .map((item, index) => {
      const source = `${seed}-${index}-${JSON.stringify(item)}`;
      let hash = 0;
      for (let charIndex = 0; charIndex < source.length; charIndex += 1) {
        hash = Math.imul(31, hash) + source.charCodeAt(charIndex) | 0;
      }
      return { item, hash };
    })
    .sort((a, b) => a.hash - b.hash)
    .map(({ item }) => item);
}

function buildOptionsFromPeople(people: Pessoa[], seed: string) {
  return deterministicShuffle(people, seed).map((pessoa) => ({
    id: pessoa.id,
    label: getPersonDisplayName(pessoa),
    imageUrl: pessoa.foto_principal_url,
  }));
}

function buildQuestion(
  payload: Omit<CuriosityQuizQuestion, 'options'> & { optionsPeople: Pessoa[]; seed: string },
): CuriosityQuizQuestion | null {
  const uniquePeople = Array.from(new Map(payload.optionsPeople.map((pessoa) => [pessoa.id, pessoa])).values());
  if (uniquePeople.length < 5) return null;

  return {
    id: payload.id,
    prompt: payload.prompt,
    answerId: payload.answerId,
    answerLabel: payload.answerLabel,
    explanation: payload.explanation,
    options: buildOptionsFromPeople(uniquePeople.slice(0, 5), payload.seed),
  };
}

function isJournalistProfession(pessoa: Pessoa) {
  const profession = normalizeCuriosityText(pessoa.profissao);
  return /(^|\b)jornalista(\b|$)/.test(profession);
}

export function buildRequestedCuriosityQuizQuestions(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[],
): CuriosityQuizQuestion[] {
  const people = pessoas
    .filter((pessoa) => !isPet(pessoa))
    .filter((pessoa) => Boolean(pessoa.id && pessoa.nome_completo));

  if (people.length < 5) return [];

  const byBirthDate = people
    .map((pessoa) => ({ pessoa, date: parseFamilyDate(pessoa.data_nascimento), year: getBirthYear(pessoa) }))
    .filter((item): item is { pessoa: Pessoa; date: Date; year: number } => Boolean(item.date && item.year));

  const questions: Array<CuriosityQuizQuestion | null> = [];

  const oldestLiving = byBirthDate
    .filter(({ pessoa }) => !isDeceased(pessoa))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  if (oldestLiving.length >= 5) {
    const answer = oldestLiving[0];
    questions.push(buildQuestion({
      id: 'oldest-living-person',
      prompt: 'Quem é a pessoa viva com mais tempo de vida na árvore?',
      answerId: answer.pessoa.id,
      answerLabel: getPersonDisplayName(answer.pessoa),
      explanation: `${getPersonDisplayName(answer.pessoa)} aparece como a pessoa viva mais velha entre as datas de nascimento cadastradas.`,
      optionsPeople: oldestLiving.map((item) => item.pessoa),
      seed: 'oldest-living-person',
    }));
  }

  const youngestPeople = byBirthDate
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  if (youngestPeople.length >= 5) {
    const answer = youngestPeople[0];
    questions.push(buildQuestion({
      id: 'youngest-person',
      prompt: 'Quem é a pessoa mais jovem na família?',
      answerId: answer.pessoa.id,
      answerLabel: getPersonDisplayName(answer.pessoa),
      explanation: `${getPersonDisplayName(answer.pessoa)} aparece como a pessoa mais jovem entre as datas de nascimento cadastradas.`,
      optionsPeople: youngestPeople.map((item) => item.pessoa),
      seed: 'youngest-person',
    }));
  }

  const topBirthCity = getBirthCityRanking(people, 1)[0];
  if (topBirthCity) {
    const normalizedCity = normalizeCuriosityText(topBirthCity.label);
    const cityPeople = people
      .filter((pessoa) => normalizeCuriosityText(pessoa.local_nascimento) === normalizedCity)
      .sort((a, b) => getPersonDisplayName(a).localeCompare(getPersonDisplayName(b), 'pt-BR'));
    const distractors = people
      .filter((pessoa) => normalizeCuriosityText(pessoa.local_nascimento) !== normalizedCity)
      .sort((a, b) => getPersonDisplayName(a).localeCompare(getPersonDisplayName(b), 'pt-BR'));

    if (cityPeople[0] && distractors.length >= 4) {
      const answer = cityPeople[0];
      questions.push(buildQuestion({
        id: 'birth-city',
        prompt: `Quem nasceu em ${topBirthCity.label}?`,
        answerId: answer.id,
        answerLabel: getPersonDisplayName(answer),
        explanation: `${getPersonDisplayName(answer)} tem ${topBirthCity.label} como local de nascimento cadastrado.`,
        optionsPeople: [answer, ...deterministicShuffle(distractors, `birth-city-${topBirthCity.label}`).slice(0, 4)],
        seed: `birth-city-${topBirthCity.label}`,
      }));
    }
  }

  const journalists = people
    .filter(isJournalistProfession)
    .sort((a, b) => getPersonDisplayName(a).localeCompare(getPersonDisplayName(b), 'pt-BR'));
  const nonJournalists = people
    .filter((pessoa) => !isJournalistProfession(pessoa))
    .sort((a, b) => getPersonDisplayName(a).localeCompare(getPersonDisplayName(b), 'pt-BR'));

  if (journalists[0] && nonJournalists.length >= 4) {
    const answer = journalists[0];
    questions.push(buildQuestion({
      id: 'journalist-profession',
      prompt: 'Qual destas pessoas abaixo é jornalista?',
      answerId: answer.id,
      answerLabel: getPersonDisplayName(answer),
      explanation: `${getPersonDisplayName(answer)} tem a profissão cadastrada como jornalista.`,
      optionsPeople: [answer, ...deterministicShuffle(nonJournalists, 'journalist-profession').slice(0, 4)],
      seed: 'journalist-profession',
    }));
  }

  const topProfession = getProfessionRanking(people, 1)[0];
  if (topProfession && normalizeCuriosityText(topProfession.label) !== 'jornalista') {
    const answer = people.find((pessoa) => normalizeCuriosityText(pessoa.profissao) === normalizeCuriosityText(topProfession.label));
    const distractors = people.filter((pessoa) => pessoa.id !== answer?.id);
    if (answer && distractors.length >= 4) {
      questions.push(buildQuestion({
        id: 'profession',
        prompt: `Quem tem a profissão cadastrada como ${topProfession.label}?`,
        answerId: answer.id,
        answerLabel: getPersonDisplayName(answer),
        explanation: `${topProfession.label} aparece entre as profissões mais repetidas da família.`,
        optionsPeople: [answer, ...deterministicShuffle(distractors, `profession-${topProfession.label}`).slice(0, 4)],
        seed: `profession-${topProfession.label}`,
      }));
    }
  }

  return questions.filter((question): question is CuriosityQuizQuestion => Boolean(question)).slice(0, 6);
}
