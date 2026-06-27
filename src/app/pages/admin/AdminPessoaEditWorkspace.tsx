import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Archive, Link2, PencilLine, User } from 'lucide-react';
import { MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { obterPessoaPorId } from '../../services/dataService';
import { Pessoa } from '../../types';
import { AdminPessoaForm } from './AdminPessoaForm';
import { AdminPessoaHistoricalFilesTab } from './AdminPessoaHistoricalFilesTab';
import { RelacionamentoManagerWrapper } from '../../components/RelacionamentoManagerWrapper';

export function AdminPessoaEditWorkspace() {
  const { id } = useParams<{ id: string }>();
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadPessoa() {
      if (!id) return;

      try {
        setLoading(true);
        const loadedPessoa = await obterPessoaPorId(id);
        if (mounted) setPessoa(loadedPessoa ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadPessoa();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="mx-auto max-w-3xl">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Pessoa não informada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Editar Pessoa"
        subtitle={pessoa?.nome_completo ? `Workspace administrativo de ${pessoa.nome_completo}` : 'Workspace administrativo com reaproveitamento dos fluxos de cadastro'}
        icon={PencilLine}
        actions={[
          { label: 'Admin', to: '/admin', icon: User },
          { label: 'Pessoas', to: '/admin/pessoas', icon: User },
          { label: 'Mapa Familiar', to: '/mapa-familiar', icon: Link2 },
        ]}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <p className="text-sm text-gray-500">Carregando pessoa...</p>
        ) : (
          <Tabs defaultValue="dados" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 gap-2 bg-transparent p-0 md:grid-cols-3">
              <TabsTrigger value="dados" className="rounded-lg border border-gray-200 bg-white data-[state=active]:border-blue-200 data-[state=active]:bg-blue-50">
                <PencilLine className="mr-2 h-4 w-4" />
                Dados
              </TabsTrigger>
              <TabsTrigger value="vinculos" className="rounded-lg border border-gray-200 bg-white data-[state=active]:border-blue-200 data-[state=active]:bg-blue-50">
                <Link2 className="mr-2 h-4 w-4" />
                Vínculos
              </TabsTrigger>
              <TabsTrigger value="arquivos" className="rounded-lg border border-gray-200 bg-white data-[state=active]:border-blue-200 data-[state=active]:bg-blue-50">
                <Archive className="mr-2 h-4 w-4" />
                Arquivos históricos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">
                    Esta aba reutiliza os mesmos campos compartilhados de dados pessoais, biografia, contatos,
                    redes e privacidade usados pelos fluxos de membros.
                  </p>
                </CardContent>
              </Card>
              <AdminPessoaForm variant="details-tab" />
            </TabsContent>

            <TabsContent value="vinculos" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">
                    Aqui o admin gerencia diretamente os relacionamentos da pessoa selecionada sem alterar o fluxo de solicitação usado pelos membros.
                  </p>
                </CardContent>
              </Card>
              <RelacionamentoManagerWrapper pessoaId={id} pessoaNome={pessoa?.nome_completo || 'Pessoa'} />
            </TabsContent>

            <TabsContent value="arquivos" className="space-y-4">
              <AdminPessoaHistoricalFilesTab pessoaId={id} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
