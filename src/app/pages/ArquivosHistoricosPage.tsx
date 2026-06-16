import React, { useEffect, useState } from 'react';
import { Archive } from 'lucide-react';
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

function getArquivosHistoricosDraftKey(userId: string, pessoaId: string) {
  return `arquivos-historicos-draft:${userId}:${pessoaId}`;
}

function readArquivosHistoricosDraft(key: string): ArquivoHistorico[] | null {
  try {
    const rawDraft = window.localStorage.getItem(key);
    if (!rawDraft) return null;
    const draft = JSON.parse(rawDraft);
    return Array.isArray(draft) ? draft as ArquivoHistorico[] : null;
  } catch {
    return null;
  }
}

function writeArquivosHistoricosDraft(key: string, archives: ArquivoHistorico[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(archives));
  } catch {
    // Rascunho local é auxiliar; falha de storage não deve bloquear a navegação.
  }
}

function clearArquivosHistoricosDraft(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // noop
  }
}

export function ArquivosHistoricosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [link, setLink] = useState<(UserPersonLinkRecord & { pessoa: Pessoa | null }) | null>(null);
  const [archives, setArchives] = useState<ArquivoHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user) return;

      setLoading(true);
      setDraftHydrated(false);
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
        const draftKey = getArquivosHistoricosDraftKey(user.id, data.pessoa.id);
        const draftArchives = readArquivosHistoricosDraft(draftKey);
        if (mounted) setArchives(draftArchives ?? storedArchives);
      } catch (loadError) {
        if (mounted) {
          toast.error(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os arquivos históricos.');
        }
      } finally {
        if (mounted) {
          setDraftHydrated(true);
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, [user]);

  const pessoa = link?.pessoa;

  useEffect(() => {
    if (!user || !pessoa?.id || !draftHydrated) return;
    const draftKey = getArquivosHistoricosDraftKey(user.id, pessoa.id);
    writeArquivosHistoricosDraft(draftKey, archives);
  }, [archives, draftHydrated, pessoa?.id, user]);

  const saveArchives = async () => {
    if (!pessoa?.id) return false;

    setSaving(true);
    try {
      const saved = await substituirArquivosHistoricosDaPessoa(pessoa.id, archives);
      clearArquivosHistoricosDraft(getArquivosHistoricosDraftKey(user!.id, pessoa.id));
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

        <div className="flex justify-end">
          <Button type="button" onClick={handleContinue} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar e Continuar'}
          </Button>
        </div>
      </main>
    </div>
  );
}
