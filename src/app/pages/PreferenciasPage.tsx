import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  HEADER_ACTION_ICONS,
  MemberPageHeader,
  PAGE_CONTAINER_CLASS,
} from '../components/layout/MemberPageHeader';
import { MemberOnboardingSteps } from '../components/member/MemberOnboardingSteps';
import { NotificationPreferencesPanel } from '../components/notifications/NotificationPreferencesPanel';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../contexts/AuthContext';
import {
  getPrimaryLinkedPersonWithPessoa,
  resolveFirstAccessLinkForUser,
  updateOwnLinkedPerson,
  UserPersonLinkRecord,
} from '../services/memberProfileService';
import { Pessoa } from '../types';

type PrivacyState = {
  permitir_exibir_data_nascimento: boolean;
  permitir_exibir_telefone: boolean;
  permitir_exibir_endereco: boolean;
  permitir_exibir_rede_social: boolean;
  permitir_mensagens_whatsapp: boolean;
};

function PrivacyToggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3">
      <Label className="min-w-0 break-words">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
    </div>
  );
}

export function PreferenciasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [link, setLink] = useState<(UserPersonLinkRecord & { pessoa: Pessoa | null }) | null>(null);
  const [privacy, setPrivacy] = useState<PrivacyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user) return;

      setLoading(true);
      await resolveFirstAccessLinkForUser(user);
      const { data, error } = await getPrimaryLinkedPersonWithPessoa(user.id);

      if (!mounted) return;

      if (error || !data?.pessoa) {
        toast.error(error || 'Não foi possível carregar suas preferências.');
        setLoading(false);
        return;
      }

      const pessoa = data.pessoa;
      setLink(data);
      setPrivacy({
        permitir_exibir_data_nascimento: pessoa.permitir_exibir_data_nascimento !== false,
        permitir_exibir_telefone: pessoa.permitir_exibir_telefone !== false,
        permitir_exibir_endereco: pessoa.permitir_exibir_endereco !== false,
        permitir_exibir_rede_social:
          pessoa.permitir_exibir_rede_social !== false && pessoa.permitir_exibir_instagram !== false,
        permitir_mensagens_whatsapp: pessoa.permitir_mensagens_whatsapp !== false,
      });
      setLoading(false);
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, [user]);

  const pessoa = link?.pessoa;

  const handleSavePrivacy = async () => {
    if (!pessoa?.id || !privacy) return false;

    setSavingPrivacy(true);
    const { error, data } = await updateOwnLinkedPerson(pessoa.id, {
      ...privacy,
      permitir_exibir_instagram: privacy.permitir_exibir_rede_social,
    });
    setSavingPrivacy(false);

    if (error) {
      toast.error(error);
      return false;
    }

    if (data) setLink((current) => (current ? { ...current, pessoa: data } : current));
    toast.success('Permissões de exibição salvas.');
    return true;
  };

  const handleContinue = async () => {
    const saved = await handleSavePrivacy();
    if (saved) navigate('/revisao-dados');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Carregando preferências...</p>
        </div>
      </div>
    );
  }

  if (!user || !pessoa || !privacy) {
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
        title="Preferências"
        subtitle="Etapa 4 de 5: configure notificações e permissões de exibição."
        icon={Settings}
        actions={[
          { label: 'Meus dados', to: '/meus-dados', icon: HEADER_ACTION_ICONS.Settings },
          { label: 'Meus vínculos', to: '/meus-vinculos', icon: HEADER_ACTION_ICONS.Network },
          { label: 'Mapa Familiar', to: '/mapa-familiar', icon: HEADER_ACTION_ICONS.Network },
        ]}
      />

      <MemberOnboardingSteps activeStep={4} />

      <main className={`${PAGE_CONTAINER_CLASS} space-y-6 py-6`}>
        <NotificationPreferencesPanel userId={user.id} />

        <Card>
          <CardHeader><CardTitle>Permissões de exibição</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <PrivacyToggle
                label="Exibir data de nascimento"
                checked={privacy.permitir_exibir_data_nascimento}
                onCheckedChange={(checked) => setPrivacy((current) => current && ({ ...current, permitir_exibir_data_nascimento: checked }))}
              />
              <PrivacyToggle
                label="Exibir telefone/WhatsApp"
                checked={privacy.permitir_exibir_telefone}
                onCheckedChange={(checked) => setPrivacy((current) => current && ({ ...current, permitir_exibir_telefone: checked }))}
              />
              <PrivacyToggle
                label="Exibir endereço"
                checked={privacy.permitir_exibir_endereco}
                onCheckedChange={(checked) => setPrivacy((current) => current && ({ ...current, permitir_exibir_endereco: checked }))}
              />
              <PrivacyToggle
                label="Exibir rede social"
                checked={privacy.permitir_exibir_rede_social}
                onCheckedChange={(checked) => setPrivacy((current) => current && ({ ...current, permitir_exibir_rede_social: checked }))}
              />
              <PrivacyToggle
                label="Permitir mensagens por WhatsApp"
                checked={privacy.permitir_mensagens_whatsapp}
                onCheckedChange={(checked) => setPrivacy((current) => current && ({ ...current, permitir_mensagens_whatsapp: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="button" onClick={handleContinue} disabled={savingPrivacy}>
            {savingPrivacy ? 'Salvando...' : 'Continuar para revisão'}
          </Button>
        </div>
      </main>
    </div>
  );
}
