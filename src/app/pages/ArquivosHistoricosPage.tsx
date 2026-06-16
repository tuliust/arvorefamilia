import React, { useEffect, useState } from 'react';
import { Archive, Save } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArquivosHistoricos } from '../components/ArquivosHistoricos';
import {
  HEADER_ACTION_ICONS,
  MemberPageHeader,
  PAGE_CONTAINER_CLASS,
} from '../components/layout/MemberPageHeader';
import { MemberOnboardingSteps } from '../components/member/MemberOnboardingSteps';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import {
  listarArquivosHistoricosPorPessoa,
  substituirArquivosHistoricosDaPessoa,
} from '../services/arquivosHistoricosService';
import {
  getPrimaryLinkedPersonWithPessoa,
  resolveFirstAccessLinkForUser,
  UserPersonLinkRecord,
} from '../services/memberProfileService';
import { ArquivoHistorico, Pessoa } from '../types';

export function ArquivosHistoricosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [link, setLink] = useState<(UserPersonLinkRecord & { pessoa: Pessoa | null }) | null>(null);
  const [archives, setArchives] = useState<ArquivoHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user) return;

      setLoading(true);
      await resolveFirstAccessLinkForUser(user);
      const { data, error } = await getPrimaryLinkedPersonWithPessoa(user.id);

      if (!mounted) return;

      if (error || !data?.pessoa) {
        toast.error(error || 'Não foi possível carregar sua pessoa vinculada.');
        setLoading(false);
        return;
      }

      setLink(data);

      try {
        const storedArchives = await listarArquivosHistoricosPorPessoa(data.pessoa.id);
        if (mounted) setArchives(storedArchives);
      } catch (loadError) {
        if (mounted) {
          toast.error(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os arquivos históricos.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, [user]);

  const pessoa = link?.pessoa;

  const saveArchives = async () => {
    if (!pessoa?.id) return false;

    setSaving(true);
    try {
      const saved = await substituirArquivosHistoricosDaPessoa(pessoa.id, archives);
      setArchives(saved);
      toast.success('Arquivos históricos salvos.');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar os arquivos históricos.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    const saved = await saveArchives();
    if (saved) navigate('/preferencias');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Carregando arquivos históricos...</p>
        </div>
      </div>
    );
  }

  if (!user || !pessoa) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Sua conta ainda não está vinculada a uma pessoa da árvore.</p>
            <Button className="mt-4 w-full sm:w-auto" onClick={() => navigate('/meus-dados')}>
              Voltar para meus dados
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Arquivos históricos"
        subtitle="Etapa 3 de 5: adicione fotos, documentos e registros importantes."
        icon={Archive}
        actions={[
          { label: 'Meus dados', to: '/meus-dados', icon: HEADER_ACTION_ICONS.Settings },
          { label: 'Meus vínculos', to: '/meus-vinculos', icon: HEADER_ACTION_ICONS.Network },
          { label: 'Mapa Familiar', to: '/mapa-familiar', icon: HEADER_ACTION_ICONS.Network },
        ]}
      />

      <MemberOnboardingSteps activeStep={3} />

      <main className={`${PAGE_CONTAINER_CLASS} space-y-6 py-6`}>
        <ArquivosHistoricos
          arquivos={archives}
          onChange={setArchives}
          pessoaId={pessoa.id}
          variant="interactive"
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" onClick={() => navigate('/meus-vinculos')}>
            Voltar para vínculos
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" onClick={() => void saveArchives()} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar arquivos'}
            </Button>
            <Button type="button" onClick={handleContinue} disabled={saving}>
              Continuar para preferências
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
