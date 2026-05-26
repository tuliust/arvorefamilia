import type { DirectRelativeGroup } from '../../components/FamilyTree/types';
import type { Pessoa, Relacionamento } from '../../types';
import { calculateCuriosities, type CuriosityTopic } from './homeCuriositiesUtils';

type DirectRelationCounts = Record<DirectRelativeGroup, number>;

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
  return {
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
