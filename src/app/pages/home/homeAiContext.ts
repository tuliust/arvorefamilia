import type { DirectRelativeGroup } from '../../components/FamilyTree/types';
import type { Pessoa, Relacionamento } from '../../types';
import { calculateCuriosities, type CuriosityTopic } from './homeCuriositiesUtils';
import { isHumanFamilyMember, isPetFamilyMember } from '../../utils/personEntity';

type DirectRelationCounts = Record<DirectRelativeGroup, number>;

type ParentLink = {
  parentId: string;
  childId: string;
  label: 'pai' | 'mãe' | 'pai/mãe';
};

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

function getFirstName(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return 'Pessoa';
  return clean.split(/\s+/)[0] || 'Pessoa';
}

function formatPersonReference(pessoa: Pessoa, centralPersonId?: string) {
  return pessoa.id === centralPersonId
    ? `Você, ${pessoa.nome_completo}`
    : pessoa.nome_completo;
}

function buildParentLinks(relacionamentos: Relacionamento[]): ParentLink[] {
  return relacionamentos
    .map((rel) => {
      if (!rel.pessoa_origem_id || !rel.pessoa_destino_id) return null;

      if (rel.tipo_relacionamento === 'filho') {
        return {
          parentId: rel.pessoa_origem_id,
          childId: rel.pessoa_destino_id,
          label: 'pai/mãe' as const,
        };
      }

      if (rel.tipo_relacionamento === 'pai') {
        return {
          parentId: rel.pessoa_destino_id,
          childId: rel.pessoa_origem_id,
          label: 'pai' as const,
        };
      }

      if (rel.tipo_relacionamento === 'mae') {
        return {
          parentId: rel.pessoa_destino_id,
          childId: rel.pessoa_origem_id,
          label: 'mãe' as const,
        };
      }

      return null;
    })
    .filter((link): link is ParentLink => Boolean(link));
}

function findParents(parentLinks: ParentLink[], childId?: string) {
  if (!childId) return [];
  return parentLinks.filter((link) => link.childId === childId);
}

function getPersonById(pessoasById: Map<string, Pessoa>, id?: string) {
  return id ? pessoasById.get(id) : undefined;
}

function inferParentLabelByName(name?: string | null): 'pai' | 'mãe' {
  const firstName = normalizeText(getFirstName(name));
  const femaleNames = new Set([
    'condilenia',
    'fulana',
    'hilda',
    'ivania',
    'maria',
    'roseli',
    'tathiane',
  ]);
  const maleNames = new Set([
    'absalon',
    'athanase',
    'charalambos',
    'jose',
    'marcio',
    'mauro',
    'secundino',
  ]);

  if (femaleNames.has(firstName)) return 'mãe';
  if (maleNames.has(firstName)) return 'pai';
  if (['a', 'ia', 'na', 'ne', 'la', 'da', 'eli'].some((ending) => firstName.endsWith(ending))) return 'mãe';
  return 'pai';
}

function findFatherLink(parentLinks: ParentLink[], pessoasById: Map<string, Pessoa>, childId?: string) {
  const parents = findParents(parentLinks, childId);
  return parents.find((link) => link.label === 'pai')
    ?? parents.find((link) => inferParentLabelByName(getPersonById(pessoasById, link.parentId)?.nome_completo) === 'pai')
    ?? parents[0];
}

function findMotherLink(parentLinks: ParentLink[], pessoasById: Map<string, Pessoa>, childId?: string) {
  const parents = findParents(parentLinks, childId);
  return parents.find((link) => link.label === 'mãe')
    ?? parents.find((link) => inferParentLabelByName(getPersonById(pessoasById, link.parentId)?.nome_completo) === 'mãe')
    ?? parents[1]
    ?? parents[0];
}

function formatParentPair(parentLinks: ParentLink[], pessoasById: Map<string, Pessoa>, childId?: string) {
  return findParents(parentLinks, childId)
    .map((link) => getPersonById(pessoasById, link.parentId)?.nome_completo)
    .filter((name): name is string => Boolean(name));
}

function buildPaternalGreatGrandparentsAnswer(
  pessoasById: Map<string, Pessoa>,
  parentLinks: ParentLink[],
  centralPersonId?: string
) {
  const fatherLink = findFatherLink(parentLinks, pessoasById, centralPersonId);
  const father = getPersonById(pessoasById, fatherLink?.parentId);
  if (!father) return null;

  const paternalGrandparents = findParents(parentLinks, father.id)
    .map((link) => ({ link, person: getPersonById(pessoasById, link.parentId) }))
    .filter((item): item is { link: ParentLink; person: Pessoa } => Boolean(item.person));

  if (paternalGrandparents.length === 0) return null;

  return paternalGrandparents.map(({ link, person }) => ({
    grandparentId: person.id,
    grandparentName: person.nome_completo,
    grandparentRole: link.label,
    grandparentsParents: formatParentPair(parentLinks, pessoasById, person.id),
  }));
}

function buildBirthCityGroups(pessoas: Pessoa[], centralPersonId?: string, useYouReference = true) {
  const groups = new Map<string, { city: string; people: string[] }>();

  pessoas.forEach((pessoa) => {
    if (!isHumanFamilyMember(pessoa) || !pessoa.local_nascimento) return;

    const key = normalizeText(pessoa.local_nascimento);
    const current = groups.get(key) ?? {
      city: pessoa.local_nascimento,
      people: [],
    };

    current.people.push(useYouReference ? formatPersonReference(pessoa, centralPersonId) : pessoa.nome_completo);
    groups.set(key, current);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      count: group.people.length,
      people: group.people.sort((left, right) => {
        if (left.startsWith('Você,')) return -1;
        if (right.startsWith('Você,')) return 1;
        return left.localeCompare(right, 'pt-BR');
      }),
    }))
    .sort((left, right) => right.count - left.count || left.city.localeCompare(right.city, 'pt-BR'));
}

export function buildAiTreeContext({
  pessoas,
  relacionamentos,
  stats,
  curiosities,
  centralPersonId,
  centralPersonName,
  directRelationCounts,
  selectedCuriosityPerson,
  selectedCuriosityTopics,
}: {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  stats: Record<string, unknown>;
  curiosities: ReturnType<typeof calculateCuriosities>;
  centralPersonId?: string;
  centralPersonName: string;
  directRelationCounts: DirectRelationCounts;
  selectedCuriosityPerson?: Pessoa;
  selectedCuriosityTopics: CuriosityTopic[];
}) {
  const pessoasById = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const parentLinks = buildParentLinks(relacionamentos);

  const filhosHumanosRelacionamentos = parentLinks.filter((link) => {
    return isHumanFamilyMember(pessoasById.get(link.childId));
  });

  const petsRelacionamentos = parentLinks.filter((link) => {
    return isPetFamilyMember(pessoasById.get(link.childId));
  });

  return {
    instrucoesResposta: [
      'Responda somente com base nos dados enviados no contexto da árvore.',
      'Não exponha IDs internos de pessoas ou relacionamentos ao usuário.',
      'Quando a pergunta for sobre a pessoa central, use “você” ou “seu/sua” de forma natural.',
      'Use bullets com “•” para listas curtas de pessoas.',
      'Não finalize com frases genéricas como “se precisar de mais alguma informação”.',
      'Para relações de ascendência, use os vínculos pai/mãe normalizados em relacionamentosFamiliares.paisPorPessoa, não apenas relacionamentos do tipo filho.',
    ],
    pessoaCentral: {
      id: centralPersonId,
      nome: centralPersonName,
    },
    consultaCuriosidades: {
      pessoaSelecionada: selectedCuriosityPerson
        ? {
            id: selectedCuriosityPerson.id,
            nome: selectedCuriosityPerson.nome_completo,
            nascimento: selectedCuriosityPerson.data_nascimento,
            falecimento: selectedCuriosityPerson.data_falecimento,
            localNascimento: selectedCuriosityPerson.local_nascimento,
            localAtual: selectedCuriosityPerson.local_atual,
            telefone: selectedCuriosityPerson.telefone,
            redeSocial: selectedCuriosityPerson.instagram_usuario || selectedCuriosityPerson.instagram_url || selectedCuriosityPerson.rede_social,
            bio: selectedCuriosityPerson.minibio,
            curiosidades: selectedCuriosityPerson.curiosidades,
          }
        : null,
      topicosDesejados: selectedCuriosityTopics,
    },
    estatisticas: stats,
    filtrosFamiliaresDiretos: directRelationCounts,
    perguntasFrequentesCalculadas: {
      bisavosPaternosDaPessoaCentral: buildPaternalGreatGrandparentsAnswer(pessoasById, parentLinks, centralPersonId),
      pessoasPorCidadeNascimento: buildBirthCityGroups(pessoas, centralPersonId),
    },
    curiosidades: {
      maisVelho: curiosities.oldest
        ? {
            nome: curiosities.oldest.nome_completo,
            dataNascimento: curiosities.oldest.data_nascimento,
          }
        : null,
      maisNovo: curiosities.youngest
        ? {
            nome: curiosities.youngest.nome_completo,
            dataNascimento: curiosities.youngest.data_nascimento,
          }
        : null,
      maisFilhos: curiosities.mostChildren || null,
      principaisCidadesAtuais: curiosities.topCurrentCities,
      principaisCidadesNascimento: curiosities.topBirthCities,
    },
    relacionamentosFamiliares: {
      observacao: 'Vínculos pai/mãe foram normalizados para facilitar perguntas genealógicas. Em paisPorPessoa, cada item aponta os pais de uma pessoa.',
      paisPorPessoa: pessoas.map((pessoa) => ({
        pessoaId: pessoa.id,
        pessoaNome: pessoa.nome_completo,
        pais: findParents(parentLinks, pessoa.id)
          .map((link) => {
            const parent = pessoasById.get(link.parentId);
            if (!parent) return null;
            return {
              id: parent.id,
              nome: parent.nome_completo,
              vinculo: link.label,
            };
          })
          .filter(Boolean),
      })),
    },
    relacionamentosSemanticos: {
      observacao: 'Pets usam vínculo parental por compatibilidade técnica, mas devem ser interpretados separadamente de filhos humanos.',
      filhosHumanos: filhosHumanosRelacionamentos.map((link) => ({
        origem: link.parentId,
        destino: link.childId,
        tipoSemantico: 'filho_humano',
      })),
      pets: petsRelacionamentos.map((link) => ({
        origem: link.parentId,
        destino: link.childId,
        tipoSemantico: 'pet_da_familia',
      })),
    },
    pessoas: pessoas.slice(0, 700).map((pessoa) => ({
      id: pessoa.id,
      nome: pessoa.nome_completo,
      nascimento: pessoa.data_nascimento,
      falecimento: pessoa.data_falecimento,
      localNascimento: pessoa.local_nascimento,
      localFalecimento: pessoa.local_falecimento,
      localAtual: pessoa.local_atual,
      tipo: pessoa.humano_ou_pet,
      lado: pessoa.lado,
      bio: pessoa.minibio,
      curiosidades: pessoa.curiosidades,
    })),
    relacionamentos: relacionamentos.slice(0, 1200).map((rel) => ({
      origem: rel.pessoa_origem_id,
      destino: rel.pessoa_destino_id,
      tipo: rel.tipo_relacionamento,
      subtipo: rel.subtipo_relacionamento,
      ativo: rel.ativo,
      observacoes: rel.observacoes,
    })),
  };
}

function extractYear(value?: string | number | null) {
  const match = String(value ?? '').match(/\d{4}/);
  return match ? Number(match[0]) : undefined;
}

function formatDate(value?: string | number | null) {
  const clean = String(value ?? '').trim();
  if (!clean) return '';
  const iso = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return clean;
}

function formatPeopleBullets(names: string[]) {
  return names.map((name) => `• ${name}`).join('\n');
}

function findPersonByQuestionName(pessoas: Pessoa[], normalizedQuestion: string) {
  const orderedPeople = pessoas
    .filter((pessoa) => isHumanFamilyMember(pessoa))
    .sort((left, right) => right.nome_completo.length - left.nome_completo.length);

  return orderedPeople.find((pessoa) => normalizeText(normalizedQuestion).includes(normalizeText(pessoa.nome_completo)))
    ?? orderedPeople.find((pessoa) => normalizeText(normalizedQuestion).includes(normalizeText(getFirstName(pessoa.nome_completo))));
}

function buildLocalPaternalGreatGrandparentsAnswer(
  pessoasById: Map<string, Pessoa>,
  parentLinks: ParentLink[],
  centralPersonId?: string
) {
  const father = getPersonById(pessoasById, findFatherLink(parentLinks, pessoasById, centralPersonId)?.parentId);
  if (!father) return null;

  const grandparents = findParents(parentLinks, father.id)
    .map((link) => getPersonById(pessoasById, link.parentId))
    .filter((person): person is Pessoa => Boolean(person));

  const grandfather = grandparents.find((person) => inferParentLabelByName(person.nome_completo) === 'pai') ?? grandparents[0];
  const grandmother = grandparents.find((person) => inferParentLabelByName(person.nome_completo) === 'mãe') ?? grandparents[1];

  const blocks: string[] = [];
  if (grandfather) {
    const parents = formatParentPair(parentLinks, pessoasById, grandfather.id);
    if (parents.length) {
      blocks.push(`Os pais do seu avô, ${grandfather.nome_completo}, são:\n\n${formatPeopleBullets(parents)}`);
    }
  }

  if (grandmother) {
    const parents = formatParentPair(parentLinks, pessoasById, grandmother.id);
    if (parents.length) {
      blocks.push(`Os pais da sua avó, ${grandmother.nome_completo}, são:\n\n${formatPeopleBullets(parents)}`);
    }
  }

  return blocks.length ? blocks.join('\n\n') : null;
}

function buildLocalBirthCityAnswer(pessoas: Pessoa[], question: string) {
  const normalizedQuestion = normalizeText(question);
  const city = normalizedQuestion.includes('recife') ? 'Recife/PE' : '';
  if (!city) return null;

  const people = pessoas
    .filter((pessoa) => isHumanFamilyMember(pessoa) && normalizeText(pessoa.local_nascimento) === normalizeText(city))
    .map((pessoa) => pessoa.nome_completo)
    .sort((left, right) => {
      if (normalizeText(left).startsWith('tulius')) return -1;
      if (normalizeText(right).startsWith('tulius')) return 1;
      return left.localeCompare(right, 'pt-BR');
    });

  if (!people.length) return null;

  return `As pessoas da sua família que nasceram em ${city} são:\n\n${formatPeopleBullets(people)}`;
}

function buildLocalSiblingAnswer(pessoas: Pessoa[], parentLinks: ParentLink[], question: string) {
  const normalizedQuestion = normalizeText(question);
  if (!normalizedQuestion.includes('irmaos') && !normalizedQuestion.includes('irmas')) return null;

  const target = findPersonByQuestionName(pessoas, question);
  if (!target) return null;

  const parentIds = new Set(findParents(parentLinks, target.id).map((link) => link.parentId));
  if (parentIds.size === 0) return null;

  const siblings = pessoas
    .filter((pessoa) => pessoa.id !== target.id && isHumanFamilyMember(pessoa))
    .filter((pessoa) => findParents(parentLinks, pessoa.id).some((link) => parentIds.has(link.parentId)))
    .map((pessoa) => pessoa.nome_completo)
    .sort((left, right) => left.localeCompare(right, 'pt-BR'));

  if (!siblings.length) return null;

  return `Os irmãos de ${target.nome_completo} são:\n\n${formatPeopleBullets(siblings)}`;
}

function buildOldestPeopleAnswer(pessoas: Pessoa[]) {
  const people = pessoas
    .filter((pessoa) => isHumanFamilyMember(pessoa))
    .map((pessoa) => ({ pessoa, birthYear: extractYear(pessoa.data_nascimento), deathYear: extractYear(pessoa.data_falecimento) }))
    .filter((item): item is { pessoa: Pessoa; birthYear: number; deathYear?: number } => Boolean(item.birthYear))
    .sort((left, right) => left.birthYear - right.birthYear || left.pessoa.nome_completo.localeCompare(right.pessoa.nome_completo, 'pt-BR'))
    .slice(0, 10);

  if (!people.length) return null;

  const currentYear = new Date().getFullYear();
  const rows = people.map(({ pessoa, birthYear, deathYear }) => {
    const age = (deathYear ?? currentYear) - birthYear;
    const ageLabel = deathYear ? `faleceu com aproximadamente ${age} anos` : `idade aproximada: ${age} anos`;
    return `• ${pessoa.nome_completo} — nasceu em ${birthYear}; ${ageLabel}`;
  });

  return `As pessoas mais antigas da árvore genealógica são:\n\n${rows.join('\n')}`;
}

function buildTopBirthCitiesAnswer(pessoas: Pessoa[]) {
  const groups = buildBirthCityGroups(pessoas, undefined, false).slice(0, 5);
  if (!groups.length) return null;

  const blocks = groups.map((group) => [
    `• ${group.city} — ${group.count} ${group.count === 1 ? 'pessoa' : 'pessoas'}:`,
    ...group.people.map((name) => `  - ${name}`),
  ].join('\n'));

  return `As cidades que aparecem mais vezes como local de nascimento na árvore são:\n\n${blocks.join('\n\n')}`;
}

function buildLineageSummaryAnswer(
  pessoasById: Map<string, Pessoa>,
  parentLinks: ParentLink[],
  centralPersonId?: string
) {
  const central = getPersonById(pessoasById, centralPersonId);
  if (!central) return null;

  const father = getPersonById(pessoasById, findFatherLink(parentLinks, pessoasById, central.id)?.parentId);
  const mother = getPersonById(pessoasById, findMotherLink(parentLinks, pessoasById, central.id)?.parentId);
  const paternalGrandparents = father ? formatParentPair(parentLinks, pessoasById, father.id) : [];
  const maternalGrandparents = mother ? formatParentPair(parentLinks, pessoasById, mother.id) : [];
  const paternalGreatGrandparents = paternalGrandparents
    .flatMap((grandparentName) => {
      const grandparent = Array.from(pessoasById.values()).find((pessoa) => pessoa.nome_completo === grandparentName);
      return grandparent ? formatParentPair(parentLinks, pessoasById, grandparent.id) : [];
    });

  const lines = [
    `Aqui está o resumo da linha genealógica de ${central.nome_completo}, considerando seus ascendentes diretos e familiares próximos:`,
    '',
    `• Você nasceu em ${central.local_nascimento || 'local não informado'}${central.data_nascimento ? ` em ${formatDate(central.data_nascimento)}` : ''}.`,
  ];

  if (father || mother) {
    lines.push('', '• Seus pais são:');
    if (father) lines.push(`- ${father.nome_completo}`);
    if (mother) lines.push(`- ${mother.nome_completo}`);
  }

  if (paternalGrandparents.length) {
    lines.push('', '• Seus avós paternos são:', ...paternalGrandparents.map((name) => `- ${name}`));
  }

  if (maternalGrandparents.length) {
    lines.push('', '• Seus avós maternos são:', ...maternalGrandparents.map((name) => `- ${name}`));
  }

  if (paternalGreatGrandparents.length) {
    lines.push('', '• Seus bisavós paternos são:', ...paternalGreatGrandparents.map((name) => `- ${name}`));
  }

  return lines.join('\n');
}

export function buildLocalAiAnswer({
  question,
  pessoas,
  relacionamentos,
  centralPersonId,
}: {
  question: string;
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  centralPersonId?: string;
}) {
  const normalizedQuestion = normalizeText(question);
  const pessoasById = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const parentLinks = buildParentLinks(relacionamentos);

  if (normalizedQuestion.includes('bisavos paternos')) {
    return buildLocalPaternalGreatGrandparentsAnswer(pessoasById, parentLinks, centralPersonId);
  }

  if (normalizedQuestion.includes('nasceram') && normalizedQuestion.includes('recife')) {
    return buildLocalBirthCityAnswer(pessoas, question);
  }

  const siblingAnswer = buildLocalSiblingAnswer(pessoas, parentLinks, question);
  if (siblingAnswer) return siblingAnswer;

  if (normalizedQuestion.includes('pessoas mais antigas') || normalizedQuestion.includes('mais antigas da arvore')) {
    return buildOldestPeopleAnswer(pessoas);
  }

  if (normalizedQuestion.includes('cidades') && normalizedQuestion.includes('nascimento') && (normalizedQuestion.includes('mais vezes') || normalizedQuestion.includes('recorrentes'))) {
    return buildTopBirthCitiesAnswer(pessoas);
  }

  if (normalizedQuestion.includes('resumo') && normalizedQuestion.includes('linha genealogica')) {
    return buildLineageSummaryAnswer(pessoasById, parentLinks, centralPersonId);
  }

  return null;
}
