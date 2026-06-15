import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, FileText, Mail, ShieldCheck, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { MemberPageHeader } from '../components/layout/MemberPageHeader';
import { ArquivosHistoricos } from '../components/ArquivosHistoricos';
import { NotificationPreferencesPanel } from '../components/notifications/NotificationPreferencesPanel';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import {
  getCurrentUserLinkedPeople,
  updateOwnLinkedPerson,
  UserPersonLinkRecord,
} from '../services/memberProfileService';
import { listarArquivosHistoricosPorPessoa, substituirArquivosHistoricosDaPessoa } from '../services/arquivosHistoricosService';
import { ArquivoHistorico, Pessoa } from '../types';
import { buildEditablePersonFormState, getInitials } from '../utils/personFields';

export function RevisaoDados() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState<(UserPersonLinkRecord & { pessoa: Pessoa | null }) | null>(null);
  const [archives, setArchives] = useState<ArquivoHistorico[]>([]);
  const [form, setForm] = useState(buildEditablePersonFormState());

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      const { data: linksData, error } = await getCurrentUserLinkedPeople();
      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      const selectedLink = linksData.find((item) => item.principal) || linksData[0] || null;
      setLink(selectedLink);

      if (selectedLink?.pessoa_id) {
        const personArchives = await listarArquivosHistoricosPorPessoa(selectedLink.pessoa_id);
        setArchives(personArchives);
        setForm(buildEditablePersonFormState(selectedLink.pessoa));
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const handleUpdatePrivacy = async (field: string, value: boolean) => {
    if (!link?.pessoa_id) return;
    setForm(prev => ({ ...prev, [field]: value }));
    try {
      await updateOwnLinkedPerson(link.pessoa_id, { [field]: value });
      toast.success('Privacidade atualizada.');
    } catch (err) {
      toast.error('Erro ao atualizar privacidade.');
    }
  };

  const handleFinish = () => {
    toast.success('Cadastro finalizado com sucesso!');
    navigate('/minha-arvore/editar', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Etapa 3: Finalizando...</p>
        </div>
      </div>
    );
  }

  const pessoa = link?.pessoa;
  if (!pessoa) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <MemberPageHeader
        title="Revisão final"
        subtitle="Etapa 3: Revise seus dados e finalize o cadastro."
        icon={ShieldCheck}
      />

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {/* Box 1: Revisão de dados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-blue-600" />
              Resumo dos dados
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 font-medium">Nome completo</p>
                <p className="text-gray-900">{pessoa.nome_completo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 font-medium">Nascimento</p>
                  <p className="text-gray-900">{pessoa.data_nascimento || 'Não informado'} {pessoa.local_nascimento ? `em ${pessoa.local_nascimento}` : ''}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Residência</p>
                  <p className="text-gray-900">{pessoa.local_atual || 'Não informado'}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-500 font-medium">WhatsApp</p>
                <p className="text-gray-900">{pessoa.telefone || 'Não informado'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 font-medium">Endereço</p>
                <p className="text-gray-900">{pessoa.endereco || 'Não informado'}</p>
                {pessoa.complemento && <p className="text-gray-500 text-xs">{pessoa.complemento}</p>}
              </div>
              <div>
                <p className="text-gray-500 font-medium">Redes sociais</p>
                <p className="text-gray-900">{pessoa.rede_social ? `${pessoa.rede_social}: ${pessoa.instagram_usuario}` : 'Não informado'}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Status</p>
                <p className="text-gray-900">{pessoa.falecido ? 'Pessoa falecida' : 'Pessoa viva'}</p>
              </div>
            </div>
            {pessoa.minibio && (
              <div className="md:col-span-2">
                <p className="text-gray-500 font-medium">Mini bio</p>
                <p className="text-gray-900 mt-1 line-clamp-3 italic">"{pessoa.minibio}"</p>
              </div>
            )}
          </CardContent>
          <div className="px-6 pb-6 flex justify-end">
             <Button variant="ghost" size="sm" onClick={() => navigate('/meus-dados')} className="text-blue-600">
               Editar dados pessoais
             </Button>
          </div>
        </Card>

        {/* Box 2: Arquivos Históricos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Arquivos Históricos</h2>
          </div>
          <ArquivosHistoricos
            arquivos={archives}
            onChange={async (next) => {
              setArchives(next);
              if (link?.pessoa_id) {
                await substituirArquivosHistoricosDaPessoa(link.pessoa_id, next);
                toast.success('Arquivos atualizados.');
              }
            }}
            pessoaId={link?.pessoa_id}
            variant="interactive"
            showTitle={false}
          />
        </div>

        {/* Box 3: Preferências de notificação */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Mail className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Preferências de notificação</h2>
          </div>
          {user && <NotificationPreferencesPanel userId={user.id} />}
        </div>

        {/* Box 4: Permissão para exibir dados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Privacidade e visibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleItem
              label="Data de nascimento"
              checked={form.permitir_exibir_data_nascimento !== false}
              onCheckedChange={(val) => handleUpdatePrivacy('permitir_exibir_data_nascimento', val)}
            />
            <ToggleItem
              label="Telefone"
              checked={form.permitir_exibir_telefone !== false}
              onCheckedChange={(val) => handleUpdatePrivacy('permitir_exibir_telefone', val)}
            />
            <ToggleItem
              label="Endereço"
              checked={form.permitir_exibir_endereco !== false}
              onCheckedChange={(val) => handleUpdatePrivacy('permitir_exibir_endereco', val)}
            />
            <ToggleItem
              label="Redes sociais"
              checked={form.permitir_exibir_rede_social !== false}
              onCheckedChange={(val) => handleUpdatePrivacy('permitir_exibir_rede_social', val)}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
           <Button variant="outline" onClick={() => navigate('/meus-vinculos')} className="w-full sm:w-auto">
             Voltar para Vínculos
           </Button>
           <Button onClick={handleFinish} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
             Finalizar Cadastro
             <CheckCircle2 className="ml-2 h-4 w-4" />
           </Button>
        </div>
      </main>
    </div>
  );
}

function ToggleItem({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white">
      <Label className="text-sm text-gray-700">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}