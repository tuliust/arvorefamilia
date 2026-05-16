import { Pessoa, RegraParentesco, Relacionamento, ResultadoParentesco } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  obterTodasPessoas,
  obterTodosRelacionamentos,
} from './dataService';

/**
 * Implementacao legada/parcial mantida por compatibilidade.
 * O fluxo visual principal da etapa 7.5D usa relationshipDegree.ts com dados ja
 * escopados pela tela chamadora, sem depender de regras_parentesco ou cache
 * persistido em parentescos_calculados.
 */

type GraphEdge = {
  from: string;
  to: string;
  relation: string;
};

type QueueItem = {
  personId: string;
  pathIds: string[];
  pathRelations: string[];
};

function normalizeRelation(relation: string) {
  return String(relation || '').trim().toLowerCase();
}

function addEdge(edges: GraphEdge[], from?: string, to?: string, relation?: string) {
  if (!from || !to || !relation || from === to) return;

  edges.push({
    from,
    to,
    relation: normalizeRelation(relation),
  });
}

function buildRelationshipGraph(relacionamentos: Relacionamento[]) {
  const edges: GraphEdge[] = [];

  relacionamentos.forEach((rel) => {
    const tipo = normalizeRelation(rel.tipo_relacionamento);

    if (tipo === 'pai') {
      addEdge(edges, rel.pessoa_origem_id, rel.pessoa_destino_id, 'pai');
      addEdge(edges, rel.pessoa_destino_id, rel.pessoa_origem_id, 'filho');
      return;
    }

    if (tipo === 'mae') {
      addEdge(edges, rel.pessoa_origem_id, rel.pessoa_destino_id, 'mae');
      addEdge(edges, rel.pessoa_destino_id, rel.pessoa_origem_id, 'filho');
      return;
    }

    if (tipo === 'filho') {
      addEdge(edges, rel.pessoa_origem_id, rel.pessoa_destino_id, 'filho');
      addEdge(edges, rel.pessoa_destino_id, rel.pessoa_origem_id, 'parent');
      return;
    }

    if (tipo === 'irmao') {
      addEdge(edges, rel.pessoa_origem_id, rel.pessoa_destino_id, 'irmao');
      addEdge(edges, rel.pessoa_destino_id, rel.pessoa_origem_id, 'irmao');
      return;
    }

    if (tipo === 'conjuge') {
      addEdge(edges, rel.pessoa_origem_id, rel.pessoa_destino_id, 'conjuge');
      addEdge(edges, rel.pessoa_destino_id, rel.pessoa_origem_id, 'conjuge');
    }
  });

  return edges;
}

function findShortestPath(
  origemId: string,
  destinoId: string,
  edges: GraphEdge[],
  maxDepth = 8
) {
  if (origemId === destinoId) {
    return {
      pathIds: [origemId],
      pathRelations: [] as string[],
    };
  }

  const adjacency = new Map<string, GraphEdge[]>();

  edges.forEach((edge) => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from)!.push(edge);
  });

  const visited = new Set<string>();
  const queue: QueueItem[] = [
    {
      personId: origemId,
      pathIds: [origemId],
      pathRelations: [],
    },
  ];

  visited.add(origemId);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.pathRelations.length >= maxDepth) {
      continue;
    }

    const nextEdges = adjacency.get(current.personId) || [];

    for (const edge of nextEdges) {
      if (visited.has(edge.to)) continue;

      const nextPathIds = [...current.pathIds, edge.to];
      const nextPathRelations = [...current.pathRelations, edge.relation];

      if (edge.to === destinoId) {
        return {
          pathIds: nextPathIds,
          pathRelations: nextPathRelations,
        };
      }

      visited.add(edge.to);

      queue.push({
        personId: edge.to,
        pathIds: nextPathIds,
        pathRelations: nextPathRelations,
      });
    }
  }

  return null;
}

function replaceTemplate(
  template: string,
  origem?: Pessoa,
  destino?: Pessoa
) {
  return template
    .replaceAll('{{A}}', origem?.nome_completo || 'A primeira pessoa')
    .replaceAll('{{B}}', destino?.nome_completo || 'A segunda pessoa');
}

function normalizePathForRules(pathRelations: string[]) {
  return pathRelations.map((item) => {
    if (item === 'parent') return 'pai';
    return item;
  });
}

function matchRule(pathRelations: string[], regras: RegraParentesco[]) {
  const normalizedPath = normalizePathForRules(pathRelations);
  const joined = normalizedPath.join('|');

  return regras.find((regra) => regra.caminho.join('|') === joined);
}

async function obterRegrasParentesco() {
  const { data, error } = await supabase
    .from('regras_parentesco')
    .select('*')
    .eq('ativo', true);

  if (error) {
    console.error('[Supabase] Erro ao obter regras de parentesco:', error);
    return [];
  }

  return (data || []) as RegraParentesco[];
}

async function obterParentescoCache(origemId: string, destinoId: string) {
  const { data, error } = await supabase
    .from('parentescos_calculados')
    .select('*')
    .eq('pessoa_origem_id', origemId)
    .eq('pessoa_destino_id', destinoId)
    .maybeSingle();

  if (error) {
    console.warn('[Supabase] Erro ao obter cache de parentesco:', error);
    return null;
  }

  return data;
}

async function salvarParentescoCache(resultado: ResultadoParentesco) {
  const { error } = await supabase
    .from('parentescos_calculados')
    .upsert(
      {
        pessoa_origem_id: resultado.pessoaOrigemId,
        pessoa_destino_id: resultado.pessoaDestinoId,
        codigo_parentesco: resultado.codigo || null,
        nome_parentesco: resultado.nome || null,
        descricao: resultado.descricao || null,
        caminho_ids: resultado.caminhoPessoas.map((pessoa) => pessoa.id),
        caminho_relacoes: resultado.caminhoRelacoes,
        distancia: resultado.distancia,
        encontrado: resultado.encontrado,
        calculado_em: new Date().toISOString(),
      },
      {
        onConflict: 'pessoa_origem_id,pessoa_destino_id',
      }
    );

  if (error) {
    console.warn('[Supabase] Erro ao salvar cache de parentesco:', error);
  }
}

function buildSimplePathText(caminhoPessoas: Array<{ id: string; nome: string }>) {
  return caminhoPessoas.map((pessoa) => pessoa.nome).join(' → ');
}

function buildContextualRelationshipText(params: {
  origem: Pessoa;
  destino: Pessoa;
  regra?: RegraParentesco;
  caminhoPessoas: Array<{ id: string; nome: string }>;
  caminhoRelacoes: string[];
}) {
  const { origem, destino, regra, caminhoPessoas, caminhoRelacoes } = params;

  if (!regra) return undefined;
  if (caminhoRelacoes.length <= 3) return undefined;

  const caminho = buildSimplePathText(caminhoPessoas);

  return `${destino.nome_completo} tem parentesco com ${origem.nome_completo} pela linha ${regra.lado || 'familiar'}, em uma relação identificada como ${regra.nome}. Caminho encontrado: ${caminho}.`;
}

export async function descobrirParentesco(
  pessoaOrigemId: string,
  pessoaDestinoId: string,
  options: {
    usarCache?: boolean;
    maxDepth?: number;
  } = {}
): Promise<ResultadoParentesco> {
  const usarCache = options.usarCache ?? true;
  const maxDepth = options.maxDepth ?? 8;

  if (!pessoaOrigemId || !pessoaDestinoId) {
    return {
      pessoaOrigemId,
      pessoaDestinoId,
      encontrado: false,
      caminhoPessoas: [],
      caminhoRelacoes: [],
      distancia: 0,
      descricao: 'Selecione duas pessoas para descobrir o parentesco.',
    };
  }

  if (usarCache) {
    const cached = await obterParentescoCache(pessoaOrigemId, pessoaDestinoId);

    if (cached) {
      const cachedPathIds = Array.isArray(cached.caminho_ids) ? cached.caminho_ids : [];
      let caminhoPessoas: ResultadoParentesco['caminhoPessoas'] = [];

      if (cachedPathIds.length > 0) {
        const pessoas = await obterTodasPessoas();
        const pessoasById = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
        caminhoPessoas = cachedPathIds.map((id: string) => ({
          id,
          nome: pessoasById.get(id)?.nome_completo || 'Pessoa não encontrada',
        }));
      }

      return {
        pessoaOrigemId,
        pessoaDestinoId,
        encontrado: Boolean(cached.encontrado),
        codigo: cached.codigo_parentesco || undefined,
        nome: cached.nome_parentesco || undefined,
        descricao: cached.descricao || undefined,
        caminhoPessoas,
        caminhoRelacoes: cached.caminho_relacoes || [],
        distancia: cached.distancia || 0,
      };
    }
  }

  const [pessoas, relacionamentos, regras] = await Promise.all([
    obterTodasPessoas(),
    obterTodosRelacionamentos(),
    obterRegrasParentesco(),
  ]);

  const pessoasById = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const origem = pessoasById.get(pessoaOrigemId);
  const destino = pessoasById.get(pessoaDestinoId);

  if (!origem || !destino) {
    return {
      pessoaOrigemId,
      pessoaDestinoId,
      encontrado: false,
      caminhoPessoas: [],
      caminhoRelacoes: [],
      distancia: 0,
      descricao: 'Não foi possível encontrar uma das pessoas selecionadas.',
    };
  }

  const graph = buildRelationshipGraph(relacionamentos);
  const shortestPath = findShortestPath(pessoaOrigemId, pessoaDestinoId, graph, maxDepth);

  if (!shortestPath) {
    const resultado: ResultadoParentesco = {
      pessoaOrigemId,
      pessoaDestinoId,
      encontrado: false,
      caminhoPessoas: [
        { id: origem.id, nome: origem.nome_completo },
        { id: destino.id, nome: destino.nome_completo },
      ],
      caminhoRelacoes: [],
      distancia: 0,
      descricao: `Não encontramos um caminho de parentesco direto entre ${origem.nome_completo} e ${destino.nome_completo}.`,
    };

    await salvarParentescoCache(resultado);
    return resultado;
  }

  const regra = matchRule(shortestPath.pathRelations, regras);

  const caminhoPessoas = shortestPath.pathIds.map((id) => {
    const pessoa = pessoasById.get(id);

    return {
      id,
      nome: pessoa?.nome_completo || 'Pessoa não encontrada',
    };
  });

  const descricao = regra
    ? replaceTemplate(regra.descricao_template, origem, destino)
    : `${destino.nome_completo} tem relação familiar com ${origem.nome_completo}, mas ainda não há uma regra textual cadastrada para este caminho.`;

  const descricaoContextual = buildContextualRelationshipText({
    origem,
    destino,
    regra,
    caminhoPessoas,
    caminhoRelacoes: shortestPath.pathRelations,
  });

  const resultado: ResultadoParentesco = {
    pessoaOrigemId,
    pessoaDestinoId,
    encontrado: true,
    codigo: regra?.codigo,
    nome: regra?.nome || 'Parentesco encontrado',
    descricao,
    descricaoCurta: regra?.descricao_curta_template
      ? replaceTemplate(regra.descricao_curta_template, origem, destino)
      : undefined,
    descricaoContextual,
    caminhoPessoas,
    caminhoRelacoes: shortestPath.pathRelations,
    distancia: shortestPath.pathRelations.length,
  };

  await salvarParentescoCache(resultado);

  return resultado;
}
