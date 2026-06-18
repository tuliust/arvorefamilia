import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Users, 
  Link2, 
  Settings,
  RefreshCw,
  Heart,
  Baby,
  UserMinus,
  GitBranch
} from 'lucide-react';

interface DiagnosticoData {
  resumo: {
    totalPessoas: number;
    totalRelacionamentos: number;
    pessoasComConjuge: number;
    pessoasComPai: number;
    pessoasComMae: number;
    pessoasComFilhos: number;
    pessoasComIrmaos: number;
    relacionamentosPorTipo: {
      conjuge: number;
      pai: number;
      mae: number;
      filho: number;
      irmao: number;
    };
    pessoasSemRelacionamentos: Array<{ id: string; nome: string }>;
    relacionamentosInvalidos: Array<any>;
  };
  exemplos: Array<{
    id: string;
    nome: string;
    relacionamentos: Array<{
      tipo: string;
      subtipo: string;
      comQuem: string;
      direcao: string;
    }>;
  }>;
  avisos: string[];
}

export function AdminDiagnostico() {
  const navigate = useNavigate();
  const [diagnostico, setDiagnostico] = useState<DiagnosticoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const diagnosticoEndpoint = `https://${projectId}.supabase.co/functions/v1/make-server-055bf375/diagnostico`;

  const getDiagnosticoErrorMessage = async (response: Response) => {
    if (response.status === 401 || response.status === 403) {
      return 'Acesso negado pelo endpoint legado de diagnóstico. Verifique autenticação, anon key e permissões da Edge Function.';
    }

    if (response.status === 404) {
      return 'Endpoint legado de diagnóstico não encontrado. A função make-server-055bf375 pode não estar implantada.';
    }

    const text = await response.text().catch(() => '');
    return `Endpoint legado indisponível (${response.status}). ${text || response.statusText}`;
  };

  const carregarDiagnostico = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        diagnosticoEndpoint,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(await getDiagnosticoErrorMessage(response));
      }

      const result = await response.json().catch(() => {
        throw new Error('Resposta inesperada do endpoint legado: o conteúdo não é JSON válido.');
      });
      
      if (result.success) {
        setDiagnostico(result.diagnostico);
      } else {
        setError(result.error || 'Endpoint legado retornou erro sem mensagem detalhada.');
      }
    } catch (err) {
      console.error('Erro ao carregar diagnóstico:', err);
      const message = err instanceof Error ? err.message : 'Erro ao conectar com o servidor';
      setError(
        message.includes('Failed to fetch') || message.includes('NetworkError')
          ? 'Não foi possível conectar ao endpoint legado. Possíveis causas: função indisponível, CORS, rede ou URL inválida.'
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDiagnostico();
  }, []);

  const getAvisoIcon = (aviso: string) => {
    if (aviso.includes('✅')) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (aviso.includes('⚠️')) return <AlertCircle className="w-5 h-5 text-amber-600" />;
    if (aviso.includes('❌')) return <XCircle className="w-5 h-5 text-red-600" />;
    return <AlertCircle className="w-5 h-5 text-gray-600" />;
  };

  const getAvisoColor = (aviso: string) => {
    if (aviso.includes('✅')) return 'bg-green-50 border-green-200 text-green-800';
    if (aviso.includes('⚠️')) return 'bg-amber-50 border-amber-200 text-amber-800';
    if (aviso.includes('❌')) return 'bg-red-50 border-red-200 text-red-800';
    return 'bg-gray-50 border-gray-200 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Diagnóstico do Banco de Dados"
        subtitle="Análise de integridade e relacionamentos"
        icon={Settings}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
          { label: 'Atualizar', onClick: carregarDiagnostico, icon: RefreshCw, variant: 'primary', disabled: loading },
        ]}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <Card className="mb-6 min-w-0 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex min-w-0 items-start gap-3">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
              <div className="min-w-0">
                <p className="font-semibold text-amber-900">Diagnóstico legado</p>
                <p className="break-words text-sm text-amber-800">
                  Esta tela consulta a Edge Function antiga <code className="rounded bg-amber-100 px-1 break-all">make-server-055bf375</code>.
                  O resultado pode não refletir o schema atual versionado em migrations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && !diagnostico && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Carregando diagnóstico...</span>
          </div>
        )}

        {error && (
          <Card className="mb-6 min-w-0 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex min-w-0 items-start gap-3">
                <XCircle className="h-6 w-6 shrink-0 text-red-600" />
                <div className="min-w-0">
                  <p className="font-semibold text-red-900">Erro ao carregar diagnóstico</p>
                  <p className="break-words text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {diagnostico && (
          <>
            {/* Avisos */}
            <div className="mb-6 space-y-3">
              {diagnostico.avisos.map((aviso, index) => (
                <div
                  key={index}
                  className={`flex min-w-0 items-start gap-3 rounded-lg border p-4 ${getAvisoColor(aviso)}`}
                >
                  <span className="shrink-0">{getAvisoIcon(aviso)}</span>
                  <p className="min-w-0 break-words text-sm font-medium">{aviso}</p>
                </div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="min-w-0">
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                  <CardTitle className="break-words text-sm font-medium text-gray-600">
                    Total de Pessoas
                  </CardTitle>
                  <Users className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {diagnostico.resumo.totalPessoas}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cadastradas no banco</p>
                </CardContent>
              </Card>

              <Card className="min-w-0">
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                  <CardTitle className="break-words text-sm font-medium text-gray-600">
                    Relacionamentos
                  </CardTitle>
                  <Link2 className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {diagnostico.resumo.totalRelacionamentos}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Vínculos cadastrados</p>
                </CardContent>
              </Card>

              <Card className="min-w-0">
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                  <CardTitle className="break-words text-sm font-medium text-gray-600">
                    Com Cônjuge
                  </CardTitle>
                  <Heart className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {diagnostico.resumo.pessoasComConjuge}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {diagnostico.resumo.relacionamentosPorTipo.conjuge} conexões
                  </p>
                </CardContent>
              </Card>

              <Card className="min-w-0">
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                  <CardTitle className="break-words text-sm font-medium text-gray-600">
                    Com Filhos
                  </CardTitle>
                  <Baby className="w-4 h-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {diagnostico.resumo.pessoasComFilhos}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {diagnostico.resumo.relacionamentosPorTipo.filho} conexões
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Relacionamentos por Tipo */}
            <Card className="mb-6 min-w-0">
              <CardHeader>
                <CardTitle className="break-words">Relacionamentos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <Heart className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {diagnostico.resumo.relacionamentosPorTipo.conjuge}
                    </p>
                    <p className="text-xs text-gray-600">Cônjuges</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <UserMinus className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {diagnostico.resumo.relacionamentosPorTipo.pai}
                    </p>
                    <p className="text-xs text-gray-600">Pais</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <UserMinus className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {diagnostico.resumo.relacionamentosPorTipo.mae}
                    </p>
                    <p className="text-xs text-gray-600">Mães</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Baby className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {diagnostico.resumo.relacionamentosPorTipo.filho}
                    </p>
                    <p className="text-xs text-gray-600">Filhos</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <GitBranch className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {diagnostico.resumo.relacionamentosPorTipo.irmao}
                    </p>
                    <p className="text-xs text-gray-600">Irmãos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pessoas sem Relacionamentos */}
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
                      <div
                        key={pessoa.id}
                        className="flex min-w-0 flex-col gap-3 rounded-lg bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <p className="min-w-0 break-words text-sm font-medium text-gray-900">{pessoa.nome}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/pessoas/${pessoa.id}/editar`)}
                          className="w-full sm:w-auto"
                        >
                          Adicionar Relacionamentos
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Relacionamentos Inválidos */}
            {diagnostico.resumo.relacionamentosInvalidos.length > 0 && (
              <Card className="mb-6 min-w-0 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex min-w-0 items-start gap-2 break-words text-red-900">
                    <XCircle className="h-5 w-5 shrink-0" />
                    Relacionamentos Inválidos ({diagnostico.resumo.relacionamentosInvalidos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 break-words text-sm text-red-700">
                    Estes relacionamentos apontam para IDs de pessoas que não existem no banco de dados.
                  </p>
                  <div className="space-y-2">
                    {diagnostico.resumo.relacionamentosInvalidos.map((rel, idx) => (
                      <div
                        key={idx}
                        className="min-w-0 rounded-lg bg-white p-3 text-sm"
                      >
                        <p className="break-all font-medium text-gray-900">
                          Tipo: {rel.tipo} | ID: {rel.id}
                        </p>
                        <p className="mt-1 break-all text-xs text-gray-600">
                          Origem: {rel.origem} {!rel.origem_existe && <span className="text-red-600">(não existe)</span>}
                          {' → '}
                          Destino: {rel.destino} {!rel.destino_existe && <span className="text-red-600">(não existe)</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exemplos de Pessoas */}
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="break-words">Exemplos de Pessoas e seus Relacionamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {diagnostico.exemplos.map((exemplo) => (
                    <div key={exemplo.id} className="min-w-0 border-b border-gray-200 pb-4 last:border-0">
                      <h3 className="mb-3 break-words font-semibold text-gray-900">{exemplo.nome}</h3>
                      {exemplo.relacionamentos.length > 0 ? (
                        <div className="space-y-2">
                          {exemplo.relacionamentos.map((rel, idx) => (
                            <div
                              key={idx}
                              className="flex min-w-0 flex-col gap-2 rounded bg-gray-50 p-2 text-sm sm:flex-row sm:items-center sm:gap-3"
                            >
                              <span className="w-fit max-w-full rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                {rel.tipo}
                              </span>
                              <span className="min-w-0 flex-1 break-words text-gray-700">
                                {rel.comQuem || 'Pessoa desconhecida'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {rel.direcao === 'saída' ? '→' : '←'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Sem relacionamentos cadastrados</p>
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
