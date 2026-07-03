import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, Baby, CheckCircle, GitBranch, Heart, Link2, RefreshCw, Settings, UserMinus, Users, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../../services/dataService';
import type { Pessoa, Relacionamento } from '../../types';

type DiagnosticoData = {
  resumo: {
    totalPessoas: number;
    totalRelacionamentos: number;
    pessoasComConjuge: number;
    pessoasComPai: number;
    pessoasComMae: number;
    pessoasComFilhos: number;
    pessoasComIrmaos: number;
    relacionamentosPorTipo: Record<Relacionamento['tipo_relacionamento'], number>;
    pessoasSemRelacionamentos: Array<{ id: string; nome: string }>;
    relacionamentosInvalidos: Array<{
      id: string;
      tipo: string;
      origem: string;
      destino: string;
      origem_existe: boolean;
      destino_existe: boolean;
    }>;
  };
  exemplos: Array<{
    id: string;
    nome: string;
    relacionamentos: Array<{
      tipo: string;
      subtipo: string;
      comQuem: string;
      direcao: 'saida' | 'entrada';
    }>;
  }>;
  avisos: string[];
};

function montarDiagnostico(pessoas: Pessoa[], relacionamentos: Relacionamento[]): DiagnosticoData {
  const pessoasMap = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const relacionamentosPorTipo = { conjuge: 0, pai: 0, mae: 0, filho: 0, irmao: 0 };
  const pessoaIdsComRelacionamento = new Set<string>();
  const pessoasComConjuge = new Set<string>();
  const pessoasComPai = new Set<string>();
  const pessoasComMae = new Set<string>();
  const pessoasComFilhos = new Set<string>();
  const pessoasComIrmaos = new Set<string>();
  const relacionamentosInvalidos: DiagnosticoData['resumo']['relacionamentosInvalidos'] = [];

  relacionamentos.forEach((rel) => {
    relacionamentosPorTipo[rel.tipo_relacionamento] += 1;
    pessoaIdsComRelacionamento.add(rel.pessoa_origem_id);
    pessoaIdsComRelacionamento.add(rel.pessoa_destino_id);

    const origemExiste = pessoasMap.has(rel.pessoa_origem_id);
    const destinoExiste = pessoasMap.has(rel.pessoa_destino_id);

    if (!origemExiste || !destinoExiste) {
      relacionamentosInvalidos.push({
        id: rel.id,
        tipo: rel.tipo_relacionamento,
        origem: rel.pessoa_origem_id,
        destino: rel.pessoa_destino_id,
        origem_existe: origemExiste,
        destino_existe: destinoExiste,
      });
    }

    if (rel.tipo_relacionamento === 'conjuge') {
      pessoasComConjuge.add(rel.pessoa_origem_id);
      pessoasComConjuge.add(rel.pessoa_destino_id);
    }

    if (rel.tipo_relacionamento === 'pai') {
      pessoasComPai.add(rel.pessoa_origem_id);
      pessoasComFilhos.add(rel.pessoa_destino_id);
    }

    if (rel.tipo_relacionamento === 'mae') {
      pessoasComMae.add(rel.pessoa_origem_id);
      pessoasComFilhos.add(rel.pessoa_destino_id);
    }

    if (rel.tipo_relacionamento === 'filho') {
      pessoasComFilhos.add(rel.pessoa_origem_id);
    }

    if (rel.tipo_relacionamento === 'irmao') {
      pessoasComIrmaos.add(rel.pessoa_origem_id);
      pessoasComIrmaos.add(rel.pessoa_destino_id);
    }
  });

  const pessoasSemRelacionamentos = pessoas
    .filter((pessoa) => !pessoaIdsComRelacionamento.has(pessoa.id))
    .map((pessoa) => ({ id: pessoa.id, nome: pessoa.nome_completo }));

  const exemplos = pessoas.slice(0, 8).map((pessoa) => ({
    id: pessoa.id,
    nome: pessoa.nome_completo,
    relacionamentos: relacionamentos
      .filter((rel) => rel.pessoa_origem_id === pessoa.id || rel.pessoa_destino_id === pessoa.id)
      .slice(0, 6)
      .map((rel) => {
          const isOrigem = rel.pessoa_origem_id === pessoa.id;
          const otherId = isOrigem ? rel.pessoa_destino_id : rel.pessoa_origem_id;
          const direcao: 'saida' | 'entrada' = isOrigem ? 'saida' : 'entrada';

          return {
            tipo: rel.tipo_relacionamento,
            subtipo: rel.subtipo_relacionamento ?? '',
            comQuem: pessoasMap.get(otherId)?.nome_completo ?? otherId,
            direcao,
          };
        }),
  }));

  const avisos = [
    relacionamentosInvalidos.length === 0
      ? 'Sem relacionamentos apontando para pessoas inexistentes.'
      : `${relacionamentosInvalidos.length} relacionamento(s) apontam para pessoas inexistentes.`,
    pessoasSemRelacionamentos.length === 0
      ? 'Todas as pessoas possuem ao menos um relacionamento cadastrado.'
      : `${pessoasSemRelacionamentos.length} pessoa(s) estao sem relacionamentos cadastrados.`,
  ];

  return {
    resumo: {
      totalPessoas: pessoas.length,
      totalRelacionamentos: relacionamentos.length,
      pessoasComConjuge: pessoasComConjuge.size,
      pessoasComPai: pessoasComPai.size,
      pessoasComMae: pessoasComMae.size,
      pessoasComFilhos: pessoasComFilhos.size,
      pessoasComIrmaos: pessoasComIrmaos.size,
      relacionamentosPorTipo,
      pessoasSemRelacionamentos,
      relacionamentosInvalidos,
    },
    exemplos,
    avisos,
  };
}

function getAvisoColor(aviso: string) {
  if (aviso.startsWith('Sem ') || aviso.startsWith('Todas ')) {
    return 'bg-green-50 border-green-200 text-green-800';
  }
  return 'bg-amber-50 border-amber-200 text-amber-800';
}

export function AdminDiagnostico() {
  const navigate = useNavigate();
  const [diagnostico, setDiagnostico] = useState<DiagnosticoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarDiagnostico = async () => {
    setLoading(true);
    setError(null);

    try {
      const [pessoas, relacionamentos] = await Promise.all([
        obterTodasPessoas(),
        obterTodosRelacionamentos(),
      ]);
      setDiagnostico(montarDiagnostico(pessoas, relacionamentos));
    } catch (err) {
      console.error('Erro ao carregar diagnostico:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar diagnostico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDiagnostico();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Diagnostico do Banco de Dados"
        subtitle="Analise de integridade e relacionamentos"
        icon={Settings}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
          { label: 'Atualizar', onClick: carregarDiagnostico, icon: RefreshCw, variant: 'primary', disabled: loading },
        ]}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Card className="mb-6 min-w-0 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex min-w-0 items-start gap-3">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
              <div className="min-w-0">
                <p className="font-semibold text-blue-900">Diagnostico atual</p>
                <p className="break-words text-sm text-blue-800">
                  Calculado diretamente a partir das tabelas versionadas <code className="rounded bg-blue-100 px-1">pessoas</code> e <code className="rounded bg-blue-100 px-1">relacionamentos</code>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && !diagnostico && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Carregando diagnostico...</span>
          </div>
        )}

        {error && (
          <Card className="mb-6 min-w-0 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex min-w-0 items-start gap-3">
                <XCircle className="h-6 w-6 shrink-0 text-red-600" />
                <div className="min-w-0">
                  <p className="font-semibold text-red-900">Erro ao carregar diagnostico</p>
                  <p className="break-words text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {diagnostico && (
          <>
            <div className="mb-6 space-y-3">
              {diagnostico.avisos.map((aviso) => (
                <div key={aviso} className={`flex min-w-0 items-start gap-3 rounded-lg border p-4 ${getAvisoColor(aviso)}`}>
                  {aviso.startsWith('Sem ') || aviso.startsWith('Todas ')
                    ? <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                    : <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />}
                  <p className="min-w-0 break-words text-sm font-medium">{aviso}</p>
                </div>
              ))}
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Total de Pessoas" value={diagnostico.resumo.totalPessoas} helper="Cadastradas no banco" icon={<Users className="h-4 w-4 text-gray-400" />} />
              <MetricCard title="Relacionamentos" value={diagnostico.resumo.totalRelacionamentos} helper="Vinculos cadastrados" icon={<Link2 className="h-4 w-4 text-gray-400" />} />
              <MetricCard title="Com Conjuge" value={diagnostico.resumo.pessoasComConjuge} helper={`${diagnostico.resumo.relacionamentosPorTipo.conjuge} conexoes`} icon={<Heart className="h-4 w-4 text-gray-400" />} />
              <MetricCard title="Com Filhos" value={diagnostico.resumo.pessoasComFilhos} helper={`${diagnostico.resumo.relacionamentosPorTipo.filho} conexoes`} icon={<Baby className="h-4 w-4 text-gray-400" />} />
            </div>

            <Card className="mb-6 min-w-0">
              <CardHeader>
                <CardTitle className="break-words">Relacionamentos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
                  <RelationshipCount label="Conjuges" value={diagnostico.resumo.relacionamentosPorTipo.conjuge} icon={<Heart className="mx-auto mb-2 h-6 w-6 text-pink-600" />} className="bg-pink-50" />
                  <RelationshipCount label="Pais" value={diagnostico.resumo.relacionamentosPorTipo.pai} icon={<UserMinus className="mx-auto mb-2 h-6 w-6 text-blue-600" />} className="bg-blue-50" />
                  <RelationshipCount label="Maes" value={diagnostico.resumo.relacionamentosPorTipo.mae} icon={<UserMinus className="mx-auto mb-2 h-6 w-6 text-purple-600" />} className="bg-purple-50" />
                  <RelationshipCount label="Filhos" value={diagnostico.resumo.relacionamentosPorTipo.filho} icon={<Baby className="mx-auto mb-2 h-6 w-6 text-green-600" />} className="bg-green-50" />
                  <RelationshipCount label="Irmaos" value={diagnostico.resumo.relacionamentosPorTipo.irmao} icon={<GitBranch className="mx-auto mb-2 h-6 w-6 text-amber-600" />} className="bg-amber-50" />
                </div>
              </CardContent>
            </Card>

            {diagnostico.resumo.pessoasSemRelacionamentos.length > 0 && (
              <Card className="mb-6 min-w-0 border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex min-w-0 items-start gap-2 break-words text-amber-900">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    Pessoas sem Relacionamentos ({diagnostico.resumo.pessoasSemRelacionamentos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {diagnostico.resumo.pessoasSemRelacionamentos.map((pessoa) => (
                      <div key={pessoa.id} className="flex min-w-0 flex-col gap-3 rounded-lg bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="min-w-0 break-words text-sm font-medium text-gray-900">{pessoa.nome}</p>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/pessoas/${pessoa.id}/editar`)} className="w-full sm:w-auto">
                          Adicionar Relacionamentos
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {diagnostico.resumo.relacionamentosInvalidos.length > 0 && (
              <Card className="mb-6 min-w-0 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex min-w-0 items-start gap-2 break-words text-red-900">
                    <XCircle className="h-5 w-5 shrink-0" />
                    Relacionamentos Invalidos ({diagnostico.resumo.relacionamentosInvalidos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {diagnostico.resumo.relacionamentosInvalidos.map((rel) => (
                      <div key={rel.id} className="min-w-0 rounded-lg bg-white p-3 text-sm">
                        <p className="break-all font-medium text-gray-900">Tipo: {rel.tipo} | ID: {rel.id}</p>
                        <p className="mt-1 break-all text-xs text-gray-600">
                          Origem: {rel.origem} {!rel.origem_existe && <span className="text-red-600">(nao existe)</span>}
                          {' -> '}
                          Destino: {rel.destino} {!rel.destino_existe && <span className="text-red-600">(nao existe)</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="break-words">Exemplos de Pessoas e Relacionamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {diagnostico.exemplos.map((exemplo) => (
                    <div key={exemplo.id} className="min-w-0 border-b border-gray-200 pb-4 last:border-0">
                      <h3 className="mb-3 break-words font-semibold text-gray-900">{exemplo.nome}</h3>
                      {exemplo.relacionamentos.length > 0 ? (
                        <div className="space-y-2">
                          {exemplo.relacionamentos.map((rel, index) => (
                            <div key={`${exemplo.id}-${index}`} className="flex min-w-0 flex-col gap-2 rounded bg-gray-50 p-2 text-sm sm:flex-row sm:items-center sm:gap-3">
                              <span className="w-fit max-w-full rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{rel.tipo}</span>
                              <span className="min-w-0 flex-1 break-words text-gray-700">{rel.comQuem}</span>
                              <span className="text-xs text-gray-500">{rel.direcao === 'saida' ? '->' : '<-'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-500">Sem relacionamentos cadastrados</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function MetricCard(props: { title: string; value: number; helper: string; icon: React.ReactNode }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <CardTitle className="break-words text-sm font-medium text-gray-600">{props.title}</CardTitle>
        {props.icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{props.value}</div>
        <p className="mt-1 text-xs text-gray-500">{props.helper}</p>
      </CardContent>
    </Card>
  );
}

function RelationshipCount(props: { label: string; value: number; icon: React.ReactNode; className: string }) {
  return (
    <div className={`rounded-lg p-4 text-center ${props.className}`}>
      {props.icon}
      <p className="text-2xl font-bold text-gray-900">{props.value}</p>
      <p className="text-xs text-gray-600">{props.label}</p>
    </div>
  );
}
