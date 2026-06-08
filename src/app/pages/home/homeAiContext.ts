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

function findFatherLink(parentLinks: ParentLink[], pessoasById: Map<string, Pessoa>, childId?: string) {
  const parents = findParents(parentLinks, childId);
  return parents.find((link) => link.label === 'pai')
    ?? parents.find((link) => {
      const name = normalizeText(getPersonById(pessoasById, link.parentId)?.nome_completo);
      return name.includes('marcio') || name.includes('márcio') || name.includes('ailton');
    })
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

function buildBirthCityGroups(pessoas: Pessoa[], centralPersonId?: string) {
  const groups = new Map<string, { city: string; people: string[] }>();

  pessoas.forEach((pessoa) => {
    if (!isHumanFamilyMember(pessoa) || !pessoa.local_nascimento) return;

    const key = normalizeText(pessoa.local_nascimento);
    const current = groups.get(key) ?? {
      city: pessoa.local_nascimento,
      people: [],
    };

    current.people.push(formatPersonReference(pessoa, centralPersonId));
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