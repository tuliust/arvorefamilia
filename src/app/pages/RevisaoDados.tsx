import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Save } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArquivosHistoricos } from '../components/ArquivosHistoricos';
import {
  HEADER_ACTION_ICONS,
  MemberPageHeader,
  PAGE_CONTAINER_CLASS,
} from '../components/layout/MemberPageHeader';
import { NotificationPreferencesPanel } from '../components/notifications/NotificationPreferencesPanel';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../contexts/AuthContext';
import { obterRelacionamentosDaPessoa } from '../services/dataService';
import {
  listarArquivosHistoricosPorPessoa,
  substituirArquivosHistoricosDaPessoa,
} from '../services/arquivosHistoricosService';
import {
  confirmOwnLinkedPersonData,
  getPrimaryLinkedPersonWithPessoa,
  resolveFirstAccessLinkForUser,
  updateOwnLinkedPerson,
  UserPersonLinkRecord,
} from '../services/memberProfileService';
import { listarPessoaSocialProfiles } from '../services/pessoaSocialProfilesService';
import { ArquivoHistorico, Pessoa, PessoaSocialProfile } from '../types';

type RelationshipGroups = {
  pais: Pessoa[];
  maes: Pessoa[];
  conjuges: Pessoa[];
  filhos: Pessoa[];
  irmaos: Pessoa[];
};

type PrivacyState = {
  permitir_exibir_data_nascimento: boolean;
  permitir_exibir_telefone: boolean;
  permitir_exibir_endereco: boolean;
  permitir_exibir_rede_social: boolean;
  permitir_mensagens_whatsapp: boolean;
};

const EMPTY_RELATIONSHIPS: RelationshipGroups = {
  pais: [],
  maes: [],
  conjuges: [],
  filhos: [],
  irmaos: [],
};

function getMeusVinculosDraftKey(userId: string, pessoaId: string) {
  return `meus-vinculos-draft:${userId}:${pessoaId}`;
}

function readDraftRelationships(userId: string, pessoaId: string): RelationshipGroups | null {
  try {
    const raw = window.sessionStorage.getItem(getMeusVinculosDraftKey(userId, pessoaId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { relationships?: Partial<RelationshipGroups> };
    if (!parsed.relationships) return null;
    return {
      pais: parsed.relationships.pais ?? [],
      maes: parsed.relationships.maes ?? [],
      conjuges: parsed.relationships.conjuges ?? [],
      filhos: parsed.relationships.filhos ?? [],
      irmaos: parsed.relationships.irmaos ?? [],
    };
  } catch {
    return null;
  }
}

function uniquePeople(people: Pessoa[]) {
  return Array.from(new Map(people.map((person) => [person.id, person])).values());
}

function valueOrEmpty(value: unknown) {
  const text = String(value ?? '').trim();
  return text || 'Não informado';
}

function ReviewItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 break-words text-sm text-gray-900">{value}</div>
    </div>
  );
}

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

export function RevisaoDados() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [link, setLink] = useState<(UserPersonLinkRecord & { pessoa: Pessoa | null }) | null>(null);
  const [relationships, setRelationships] = useState<RelationshipGroups>(EMPTY_RELATIONSHIPS);
  const [socialProfiles, setSocialProfiles] = useState<PessoaSocialProfile[]>([]);
  const [archives, setArchives] = useState<ArquivoHistorico[]>([]);
  const [privacy, setPrivacy] = useState<PrivacyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingArchives, setSavingArchives] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user) return;
      setLoading(true);
      await resolveFirstAccessLinkForUser(user);
      const { data, error } = await getPrimaryLinkedPersonWithPessoa(user.id);
      if (!mounted) return;
      if (error || !data?.pessoa) {
        toast.error(error || 'Não foi possível carregar seus dados.');
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

      const [storedRelationships, storedArchives, storedSocialProfiles] = await Promise.all([
        obterRelacionamentosDaPessoa(pessoa.id),
        listarArquivosHistoricosPorPessoa(pessoa.id),
        listarPessoaSocialProfiles(pessoa.id),
      ]);
      if (!mounted) return;
      setRelationships(readDraftRelationships(user.id, pessoa.id) ?? storedRelationships);
      setArchives(storedArchives);
      setSocialProfiles(storedSocialProfiles);
      setLoading(false);
    }

    void loadData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const pessoa = link?.pessoa;
  const relationshipSummary = useMemo(() => {
    const groups = [
      { label: 'Pais', people: uniquePeople([...relationships.pais, ...relationships.maes]) },
      { label: 'Cônjuges', people: uniquePeople(relationships.conjuges) },
      { label: 'Filhos', people: uniquePeople(relationships.filhos) },
      { label: 'Irmãos', people: uniquePeople(relationships.irmaos) },
    ];
    return groups;
  }, [relationships]);

  const handleSaveArchives = async () => {
    if (!pessoa?.id) return;
    setSavingArchives(true);
    try {
      const saved = await substituirArquivosHistoricosDaPessoa(pessoa.id, archives);
      setArchives(saved);
      toast.success('Arquivos históricos salvos.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar os arquivos.');
    } finally {
      setSavingArchives(false);
    }
  };

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

  const handleFinish = async () => {
    if (!link?.id || !pessoa?.id || !user?.id) return;
    setFinishing(true);
    try {
      await substituirArquivosHistoricosDaPessoa(pessoa.id, archives);
      const privacySaved = await handleSavePrivacy();
      if (!privacySaved) return;
      const { error } = await confirmOwnLinkedPersonData(link.id);
      if (error) throw new Error(error);
      window.sessionStorage.removeItem(getMeusVinculosDraftKey(user.id, pessoa.id));
      navigate('/mapa-familiar', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível finalizar a revisão.');
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Carregando revisão...</p>
        </div>
      </div>
    );
  }

  if (!user || !link || !pessoa || !privacy) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Não foi possível localizar o perfil para revisão.</p>
            <Button className="mt-4" onClick={() => navigate('/meus-dados')}>Voltar para meus dados</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Revisão dos dados"
        subtitle="Etapa 3 de 3: confira os dados e conclua seu cadastro."
        icon={ClipboardCheck}
        actions={[
          { label: 'Meus dados', to: '/meus-dados', icon: HEADER_ACTION_ICONS.Settings },
          { label: 'Meus vínculos', to: '/meus-vinculos', icon: HEADER_ACTION_ICONS.Network },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} space-y-6 py-6`}>
        <Card>
          <CardHeader><CardTitle>Revisão dos dados cadastrados</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <ReviewItem label="Nome completo" value={valueOrEmpty(pessoa.nome_completo)} />
              <ReviewItem label="Data de nascimento" value={valueOrEmpty(pessoa.data_nascimento)} />
              <ReviewItem label="Local de nascimento" value={valueOrEmpty(pessoa.local_nascimento)} />
              <ReviewItem label="Cidade de residência" value={valueOrEmpty(pessoa.local_atual)} />
              <ReviewItem label="Profissão" value={valueOrEmpty(pessoa.profissao)} />
              <ReviewItem label="Pessoa falecida" value={pessoa.falecido ? 'Sim' : 'Não'} />
              <ReviewItem label="WhatsApp" value={valueOrEmpty(pessoa.telefone)} />
              <ReviewItem label="Endereço" value={valueOrEmpty(pessoa.endereco)} />
              <ReviewItem label="Complemento" value={valueOrEmpty(pessoa.complemento)} />
              <ReviewItem
                label="Redes sociais"
                value={
                  socialProfiles.length > 0
                    ? socialProfiles.map((profile) => `${profile.rede}: ${profile.perfil || profile.url || ''}`).join(', ')
                    : valueOrEmpty(pessoa.rede_social && pessoa.instagram_usuario
                      ? `${pessoa.rede_social}: ${pessoa.instagram_usuario}`
                      : '')
                }
              />
              <ReviewItem label="Mini Bio" value={valueOrEmpty(pessoa.minibio)} />
              <ReviewItem label="Curiosidades" value={valueOrEmpty(pessoa.curiosidades)} />
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Vínculos cadastrados</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {relationshipSummary.map((group) => (
                  <ReviewItem
                    key={group.label}
                    label={group.label}
                    value={group.people.length > 0
                      ? group.people.map((person) => person.nome_completo).join(', ')
                      : 'Nenhum vínculo informado'}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/meus-dados')}>Editar dados</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/meus-vinculos')}>Editar vínculos</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <ArquivosHistoricos
            arquivos={archives}
            onChange={setArchives}
            pessoaId={pessoa.id}
            variant="interactive"
          />
          <div className="flex justify-end">
            <Button type="button" onClick={handleSaveArchives} disabled={savingArchives}>
              <Save className="h-4 w-4" />
              {savingArchives ? 'Salvando...' : 'Salvar arquivos'}
            </Button>
          </div>
        </div>

        <NotificationPreferencesPanel userId={user.id} />

        <Card>
          <CardHeader><CardTitle>Permissão para exibir dados</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <PrivacyToggle
                label="Exibir data de nascimento"
                checked={privacy.permitir_exibir_data_nascimento}
                onCheckedChange={(checked) => setPrivacy((current) => current && ({ ...current, permitir_exibir_data_nascimento: checked }))}
              />
              <PrivacyToggle
                label="Exibir WhatsApp"
                checked={privacy.permitir_exibir_telefone}
                onCheckedChange={(checked) => setPrivacy((current) => current && ({ ...current, permitir_exibir_telefone: checked }))}
              />
              <PrivacyToggle
                label="Exibir endereço"
                checked={privacy.permitir_exibir_endereco}
                onCheckedChange={(checked) => setPrivacy((current) => current && ({ ...current, permitir_exibir_endereco: checked }))}
              />
              <PrivacyToggle
                label="Exibir redes sociais"
                checked={privacy.permitir_exibir_rede_social}
                onCheckedChange={(checked) => setPrivacy((current) => current && ({ ...current, permitir_exibir_rede_social: checked }))}
              />
              <PrivacyToggle
                label="Permitir mensagens por WhatsApp"
                checked={privacy.permitir_mensagens_whatsapp}
                onCheckedChange={(checked) => setPrivacy((current) => current && ({ ...current, permitir_mensagens_whatsapp: checked }))}
              />
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={() => void handleSavePrivacy()} disabled={savingPrivacy}>
                <Save className="h-4 w-4" />
                {savingPrivacy ? 'Salvando...' : 'Salvar permissões'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" onClick={() => navigate('/meus-vinculos')}>
            Voltar para vínculos
          </Button>
          <Button type="button" onClick={handleFinish} disabled={finishing}>
            <CheckCircle2 className="h-4 w-4" />
            {finishing ? 'Finalizando...' : 'Finalizar e acessar a árvore'}
          </Button>
        </div>
      </main>
    </div>
  );
}
