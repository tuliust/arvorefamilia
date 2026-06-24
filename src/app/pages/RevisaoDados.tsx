import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Heart,
  MapPin,
  Pencil,
  Phone,
  Save,
  ScrollText,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  MemberPageHeader,
  PAGE_CONTAINER_CLASS,
} from '../components/layout/MemberPageHeader';
import { MemberOnboardingSteps } from '../components/member/MemberOnboardingSteps';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { obterRelacionamentosDaPessoa } from '../services/dataService';
import { listarArquivosHistoricosPorPessoa } from '../services/arquivosHistoricosService';
import {
  confirmOwnLinkedPersonData,
  EditableOwnPersonPayload,
  getPrimaryLinkedPersonWithPessoa,
  resolveFirstAccessLinkForUser,
  updateOwnLinkedPerson,
  UserPersonLinkRecord,
} from '../services/memberProfileService';
import {
  buildSocialProfilesFromRows,
  listarPessoaSocialProfiles,
  substituirPessoaSocialProfiles,
} from '../services/pessoaSocialProfilesService';
import { ArquivoHistorico, Pessoa, PessoaSocialProfile } from '../types';
import {
  buildEditablePersonFormState,
  cleanPersonPayload,
  createSocialProfile,
  formatPhone,
  getInitials,
  maskBirthDate,
  SocialProfileForm,
  validateEditablePersonForm,
} from '../utils/personFields';

type RelationshipGroups = {
  pais: Pessoa[];
  maes: Pessoa[];
  conjuges: Pessoa[];
  filhos: Pessoa[];
  pets: Pessoa[];
  irmaos: Pessoa[];
};

type ReviewSectionId = 'personal' | 'story' | 'contact' | 'privacy';

const EMPTY_RELATIONSHIPS: RelationshipGroups = {
  pais: [],
  maes: [],
  conjuges: [],
  filhos: [],
  pets: [],
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
    return normalizeRelationshipGroups({
      pais: parsed.relationships.pais ?? [],
      maes: parsed.relationships.maes ?? [],
      conjuges: parsed.relationships.conjuges ?? [],
      filhos: parsed.relationships.filhos ?? [],
      pets: (parsed.relationships as Partial<RelationshipGroups>).pets ?? [],
      irmaos: parsed.relationships.irmaos ?? [],
    });
  } catch {
    return null;
  }
}

function uniquePeople(people: Pessoa[]) {
  return Array.from(new Map(people.map((person) => [person.id, person])).values());
}

function isPetPerson(person: Pessoa) {
  return person.humano_ou_pet === 'Pet';
}

function normalizeRelationshipGroups(groups: Partial<RelationshipGroups>): RelationshipGroups {
  const filhos = uniquePeople(groups.filhos ?? []);
  const pets = uniquePeople([...(groups.pets ?? []), ...filhos.filter(isPetPerson)]);

  return {
    pais: uniquePeople(groups.pais ?? []),
    maes: uniquePeople(groups.maes ?? []),
    conjuges: uniquePeople(groups.conjuges ?? []),
    filhos: filhos.filter((person) => !isPetPerson(person)),
    pets,
    irmaos: uniquePeople(groups.irmaos ?? []),
  };
}

function valueOrEmpty(value: unknown) {
  const text = String(value ?? '').trim();
  return text || 'Não informado';
}

function yesNo(value: boolean) {
  return value ? 'Sim' : 'Não';
}

function archiveHasFile(archive: ArquivoHistorico) {
  return Boolean(String(archive.url ?? '').trim());
}

function isImageArchive(archive: ArquivoHistorico) {
  return archiveHasFile(archive) && (archive.tipo === 'imagem' || archive.mime_type?.startsWith('image/'));
}
function getArchiveRecordLabel(archive: ArquivoHistorico) {
  if (!archiveHasFile(archive)) return 'Fato sem arquivo';
  if (archive.tipo === 'pdf' || archive.mime_type === 'application/pdf') return 'PDF';
  return 'Imagem';
}


type GenderHint = 'homem' | 'mulher' | null | undefined;

function normalizeGender(gender?: unknown, fallback?: GenderHint) {
  const normalized = String(gender ?? fallback ?? '').trim().toLowerCase();

  if (['mulher', 'feminino', 'female', 'feminina', 'woman'].includes(normalized)) return 'mulher';
  if (['homem', 'masculino', 'male', 'masculina', 'man'].includes(normalized)) return 'homem';
  return fallback ?? 'homem';
}

function getPersonStatusLabel(pessoa: Pessoa, genderHint?: GenderHint) {
  const gender = normalizeGender(pessoa.genero, genderHint);

  if (pessoa.falecido) return gender === 'mulher' ? 'Falecida' : 'Falecido';
  return gender === 'mulher' ? 'Viva' : 'Vivo';
}

function ReviewValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 break-words text-sm text-gray-900">{value}</div>
    </div>
  );
}

function InlineField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</Label>
      {children}
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  editing?: boolean;
  saving?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
}) {
  return (
    <Card className="overflow-hidden border-gray-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </CardTitle>

        {editing ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={onCancel} disabled={saving}>
              <X className="h-4 w-4" />
              <span className="sr-only">Cancelar</span>
            </Button>
            <Button type="button" size="sm" className="h-8 px-2" onClick={onSave} disabled={saving}>
              <Save className="h-4 w-4" />
              <span className="sr-only">Salvar</span>
            </Button>
          </div>
        ) : onEdit ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 w-8 shrink-0 p-0"
            onClick={onEdit}
            aria-label={`Editar ${title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function PeopleList({ people, genderHints = {} }: { people: Pessoa[]; genderHints?: Record<string, GenderHint> }) {
  if (people.length === 0) {
    return <p className="text-sm text-gray-500">Nenhum vínculo informado.</p>;
  }

  return (
    <div className="space-y-2">
      {people.map((person) => (
        <div key={person.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
            {getInitials(person.nome_completo)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{person.nome_completo}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">{getPersonStatusLabel(person, genderHints[person.id])}</span>
              {String(person.id).startsWith('local-') && (
                <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                  Em análise
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RevisaoDados() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [link, setLink] = useState<(UserPersonLinkRecord & { pessoa: Pessoa | null }) | null>(null);
  const [relationships, setRelationships] = useState<RelationshipGroups>(EMPTY_RELATIONSHIPS);
  const [socialProfiles, setSocialProfiles] = useState<PessoaSocialProfile[]>([]);
  const [socialProfileForms, setSocialProfileForms] = useState<SocialProfileForm[]>([createSocialProfile()]);
  const [archives, setArchives] = useState<ArquivoHistorico[]>([]);
  const [form, setForm] = useState<EditableOwnPersonPayload>(() => buildEditablePersonFormState(null));
  const [editingSection, setEditingSection] = useState<ReviewSectionId | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<ReviewSectionId | null>(null);
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

      if (data.dados_confirmados !== false) {
        navigate('/meus-dados', { replace: true });
        return;
      }

      const pessoa = data.pessoa;
      setLink(data);
      setForm(buildEditablePersonFormState(pessoa));

      const [storedRelationships, storedArchives, storedSocialProfiles] = await Promise.all([
        obterRelacionamentosDaPessoa(pessoa.id),
        listarArquivosHistoricosPorPessoa(pessoa.id),
        listarPessoaSocialProfiles(pessoa.id),
      ]);
      if (!mounted) return;
      setRelationships(normalizeRelationshipGroups(readDraftRelationships(user.id, pessoa.id) ?? storedRelationships));
      setArchives(storedArchives);
      setSocialProfiles(storedSocialProfiles);
      setSocialProfileForms(buildSocialProfilesFromRows(storedSocialProfiles, pessoa));
      setLoading(false);
    }

    void loadData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const pessoa = link?.pessoa;

  const relationshipSummary = useMemo(() => [
    {
      label: 'Pais',
      people: uniquePeople([...relationships.pais, ...relationships.maes]),
      genderHints: Object.fromEntries([
        ...relationships.pais.map((person) => [person.id, 'homem'] as const),
        ...relationships.maes.map((person) => [person.id, 'mulher'] as const),
      ]) as Record<string, GenderHint>,
    },
    { label: 'Cônjuges', people: uniquePeople(relationships.conjuges), genderHints: {} as Record<string, GenderHint> },
    { label: 'Filhos', people: uniquePeople(relationships.filhos), genderHints: {} as Record<string, GenderHint> },
    { label: 'Pets', people: uniquePeople(relationships.pets), genderHints: {} as Record<string, GenderHint> },
    { label: 'Irmãos', people: uniquePeople(relationships.irmaos), genderHints: {} as Record<string, GenderHint> },
  ], [relationships]);

  const socialProfilesSummary = useMemo(() => {
    if (socialProfiles.length > 0) {
      return socialProfiles
        .filter((profile) => profile.exibir_no_perfil !== false)
        .map((profile) => `${profile.rede}: ${profile.perfil || profile.url || ''}`)
        .filter((profile) => profile.trim())
        .join(', ');
    }

    return valueOrEmpty(pessoa?.rede_social && pessoa?.instagram_usuario
      ? `${pessoa.rede_social}: ${pessoa.instagram_usuario}`
      : '');
  }, [pessoa?.instagram_usuario, pessoa?.rede_social, socialProfiles]);

  function updateFormField<K extends keyof EditableOwnPersonPayload>(field: K, value: EditableOwnPersonPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function cancelEditing() {
    if (pessoa) {
      setForm(buildEditablePersonFormState(pessoa));
      setSocialProfileForms(buildSocialProfilesFromRows(socialProfiles, pessoa));
    }
    setEditingSection(null);
  }

  async function handleSaveSection(section: ReviewSectionId) {
    if (!pessoa) return;
    setSavingSection(section);

    try {
      const payload = cleanPersonPayload({
        ...form,
        local_atual: form.falecido === true ? '' : form.local_atual,
        local_atual_exterior: form.falecido === true ? false : form.local_atual_exterior,
      });
      const errors = validateEditablePersonForm(payload);

      if (Object.keys(errors).length > 0) {
        toast.error(Object.values(errors)[0] || 'Revise os campos destacados.');
        return;
      }

      const { data, error } = await updateOwnLinkedPerson(pessoa.id, payload);
      if (error || !data) {
        throw new Error(error || 'Não foi possível salvar os dados.');
      }

      if (section === 'contact') {
        const updatedProfiles = await substituirPessoaSocialProfiles(pessoa.id, socialProfileForms, {
          exibirNoPerfil: payload.permitir_exibir_rede_social !== false,
        });
        setSocialProfiles(updatedProfiles);
        setSocialProfileForms(buildSocialProfilesFromRows(updatedProfiles, data));
      }

      setLink((current) => (current ? { ...current, pessoa: data } : current));
      setForm(buildEditablePersonFormState(data));
      setEditingSection(null);
      toast.success('Dados atualizados.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar os dados.');
    } finally {
      setSavingSection(null);
    }
  }

  const handleFinish = async () => {
    if (!link?.id || !pessoa?.id || !user?.id) return;
    setFinishing(true);
    try {
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

  if (!user || !link || !pessoa) {
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

  const isDeceased = pessoa.falecido === true;
  const visibleSocialForms = socialProfileForms.length > 0 ? socialProfileForms : [createSocialProfile()];

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Revisão final"
        subtitle="Etapa 5 de 5: confira e ajuste seus dados antes de acessar a árvore."
        icon={ClipboardCheck}
        hideHeaderActions
        hideMobileHeaderActions
        hideMobileBottomNav
      />

      <MemberOnboardingSteps activeStep={5} hidePreferences={pessoa.falecido === true} />

      <main className={`${PAGE_CONTAINER_CLASS} space-y-6 py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-6`}>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-lg font-semibold text-blue-700 ring-1 ring-blue-100">
                {pessoa.foto_principal_url ? (
                  <img src={pessoa.foto_principal_url} alt={pessoa.nome_completo} className="h-full w-full object-cover" />
                ) : (
                  getInitials(pessoa.nome_completo)
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-semibold text-gray-950">{pessoa.nome_completo}</h1>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {getPersonStatusLabel(pessoa)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                  {pessoa.profissao && <span>{pessoa.profissao}</span>}
                  {pessoa.local_atual && !pessoa.falecido && (
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{pessoa.local_atual}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingSection('personal')}>
                <Pencil className="h-4 w-4" />
                Editar perfil
              </Button>
              <Button type="button" size="sm" onClick={handleFinish} disabled={finishing || savingSection !== null}>
                <CheckCircle2 className="h-4 w-4" />
                {finishing ? 'Finalizando...' : 'Finalizar e acessar árvore'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className={[
          'grid grid-cols-1 gap-6',
          pessoa.falecido !== true ? 'xl:grid-cols-[minmax(0,1fr)_320px]' : '',
        ].filter(Boolean).join(' ')}>
          <div className="space-y-6">
            <SectionCard
              title="Informações pessoais"
              icon={UserCircle2}
              editing={editingSection === 'personal'}
              saving={savingSection === 'personal'}
              onEdit={() => setEditingSection('personal')}
              onCancel={cancelEditing}
              onSave={() => void handleSaveSection('personal')}
            >
              {editingSection === 'personal' ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InlineField label="Nome completo">
                    <Input value={String(form.nome_completo ?? '')} onChange={(event) => updateFormField('nome_completo', event.target.value)} />
                  </InlineField>
                  <InlineField label="Profissão">
                    <Input value={String(form.profissao ?? '')} onChange={(event) => updateFormField('profissao', event.target.value)} />
                  </InlineField>
                  <InlineField label="Dia ou Ano de Nascimento">
                    <Input value={String(form.data_nascimento ?? '')} onChange={(event) => updateFormField('data_nascimento', maskBirthDate(event.target.value))} />
                  </InlineField>
                  <InlineField label="Local de nascimento">
                    <Input value={String(form.local_nascimento ?? '')} onChange={(event) => updateFormField('local_nascimento', event.target.value)} />
                  </InlineField>
                  {isDeceased ? (
                    <>
                      <InlineField label="Dia ou Ano de Falecimento">
                        <Input value={String(form.data_falecimento ?? '')} onChange={(event) => updateFormField('data_falecimento', maskBirthDate(event.target.value))} />
                      </InlineField>
                      <InlineField label="Local de falecimento">
                        <Input value={String(form.local_falecimento ?? '')} onChange={(event) => updateFormField('local_falecimento', event.target.value)} />
                      </InlineField>
                    </>
                  ) : (
                    <>
                      <InlineField label="Cidade de residência">
                        <Input value={String(form.local_atual ?? '')} onChange={(event) => updateFormField('local_atual', event.target.value)} />
                      </InlineField>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ReviewValue label="Nome completo" value={valueOrEmpty(pessoa.nome_completo)} />
                  <ReviewValue label="Profissão" value={valueOrEmpty(pessoa.profissao)} />
                  <ReviewValue label="Data de nascimento" value={valueOrEmpty(pessoa.data_nascimento)} />
                  <ReviewValue label="Local de nascimento" value={valueOrEmpty(pessoa.local_nascimento)} />
                  {pessoa.falecido ? (
                    <>
                      <ReviewValue label="Data de falecimento" value={valueOrEmpty(pessoa.data_falecimento)} />
                      <ReviewValue label="Local de falecimento" value={valueOrEmpty(pessoa.local_falecimento)} />
                    </>
                  ) : (
                    <>
                      <ReviewValue label="Cidade de residência" value={valueOrEmpty(pessoa.local_atual)} />
                    </>
                  )}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Mini bio e curiosidades"
              icon={Heart}
              editing={editingSection === 'story'}
              saving={savingSection === 'story'}
              onEdit={() => setEditingSection('story')}
              onCancel={cancelEditing}
              onSave={() => void handleSaveSection('story')}
            >
              {editingSection === 'story' ? (
                <div className="space-y-4">
                  <InlineField label="Mini bio">
                    <Textarea rows={4} value={String(form.minibio ?? '')} onChange={(event) => updateFormField('minibio', event.target.value)} />
                  </InlineField>
                  <InlineField label="Curiosidades">
                    <Textarea rows={5} value={String(form.curiosidades ?? '')} onChange={(event) => updateFormField('curiosidades', event.target.value)} />
                  </InlineField>
                </div>
              ) : (
                <div className="space-y-4">
                  <ReviewValue label="Mini bio" value={valueOrEmpty(pessoa.minibio)} />
                  <ReviewValue label="Curiosidades" value={valueOrEmpty(pessoa.curiosidades)} />
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Familiares"
              icon={Users}
              onEdit={() => navigate('/meus-vinculos')}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {relationshipSummary.map((group) => (
                  <div key={group.label} className="rounded-xl border border-gray-100 p-3">
                    <p className="mb-2 text-sm font-semibold text-gray-900">{group.label}</p>
                    <PeopleList people={group.people} genderHints={group.genderHints} />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Fatos e arquivos históricos"
              icon={FileText}
              onEdit={() => navigate('/arquivos-historicos')}
            >
              {archives.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {archives.map((archive) => (
                    <div key={archive.id} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-gray-500 ring-1 ring-gray-200">
                        {isImageArchive(archive) ? (
                          <img src={archive.url} alt={archive.titulo} className="h-full w-full object-cover" />
                        ) : archiveHasFile(archive) ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <ScrollText className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="min-w-0 truncate text-sm font-semibold text-gray-900">{archive.titulo}</p>
                          <span className="shrink-0 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                            {getArchiveRecordLabel(archive)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600">{archive.descricao || 'Sem descrição.'}</p>
                        {archive.ano && <p className="mt-1 text-xs text-gray-500">Ano: {archive.ano}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum fato ou arquivo histórico informado.</p>
              )}
            </SectionCard>
          </div>

          {pessoa.falecido !== true && (
          <aside className="space-y-6">
            <SectionCard
              title="Contatos"
              icon={Phone}
              editing={editingSection === 'contact'}
              saving={savingSection === 'contact'}
              onEdit={() => setEditingSection('contact')}
              onCancel={cancelEditing}
              onSave={() => void handleSaveSection('contact')}
            >
              {editingSection === 'contact' ? (
                <div className="space-y-4">
                  <InlineField label="WhatsApp">
                    <Input value={String(form.telefone ?? '')} onChange={(event) => updateFormField('telefone', formatPhone(event.target.value))} />
                  </InlineField>
                  <InlineField label="Endereço">
                    <Input value={String(form.endereco ?? '')} onChange={(event) => updateFormField('endereco', event.target.value)} />
                  </InlineField>
                  <InlineField label="Complemento">
                    <Input value={String(form.complemento ?? '')} onChange={(event) => updateFormField('complemento', event.target.value)} />
                  </InlineField>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Redes sociais</Label>
                      <Button type="button" size="sm" variant="outline" onClick={() => setSocialProfileForms((current) => [...current, createSocialProfile()])}>
                        Adicionar
                      </Button>
                    </div>
                    {visibleSocialForms.map((profile, index) => (
                      <div key={profile.id} className="space-y-2 rounded-xl border border-gray-200 p-3">
                        <Input
                          placeholder="Rede. Ex: Instagram"
                          value={profile.rede}
                          onChange={(event) => setSocialProfileForms((current) => current.map((item) => item.id === profile.id ? { ...item, rede: event.target.value } : item))}
                        />
                        <Input
                          placeholder="Perfil ou URL"
                          value={profile.perfil}
                          onChange={(event) => setSocialProfileForms((current) => current.map((item) => item.id === profile.id ? { ...item, perfil: event.target.value } : item))}
                        />
                        {visibleSocialForms.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setSocialProfileForms((current) => current.filter((item) => item.id !== profile.id))}
                          >
                            Remover rede {index + 1}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ReviewValue label="WhatsApp" value={valueOrEmpty(pessoa.telefone)} />
                  <ReviewValue label="Endereço" value={valueOrEmpty(pessoa.endereco)} />
                  <ReviewValue label="Complemento" value={valueOrEmpty(pessoa.complemento)} />
                  <ReviewValue label="Redes sociais" value={socialProfilesSummary} />
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Notificações e permissões"
              icon={Bell}
              editing={editingSection === 'privacy'}
              saving={savingSection === 'privacy'}
              onEdit={() => setEditingSection('privacy')}
              onCancel={cancelEditing}
              onSave={() => void handleSaveSection('privacy')}
            >
              {editingSection === 'privacy' ? (
                <div className="space-y-3">
                  {[
                    ['permitir_exibir_data_nascimento', 'Exibir data de nascimento'],
                    ['permitir_exibir_telefone', 'Exibir telefone/WhatsApp'],
                    ['permitir_exibir_endereco', 'Exibir endereço'],
                    ['permitir_exibir_rede_social', 'Exibir redes sociais'],
                    ['permitir_mensagens_whatsapp', 'Permitir mensagens por WhatsApp'],
                  ].map(([field, label]) => (
                    <div key={field} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3 py-2">
                      <Label>{label}</Label>
                      <Switch
                        checked={form[field as keyof EditableOwnPersonPayload] !== false}
                        onCheckedChange={(checked) => updateFormField(field as keyof EditableOwnPersonPayload, checked as never)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <ReviewValue label="Exibir data de nascimento" value={yesNo(pessoa.permitir_exibir_data_nascimento !== false)} />
                  <ReviewValue label="Exibir telefone/WhatsApp" value={yesNo(pessoa.permitir_exibir_telefone !== false)} />
                  <ReviewValue label="Exibir endereço" value={yesNo(pessoa.permitir_exibir_endereco !== false)} />
                  <ReviewValue label="Exibir redes sociais" value={yesNo(pessoa.permitir_exibir_rede_social !== false && pessoa.permitir_exibir_instagram !== false)} />
                  <ReviewValue label="Permitir mensagens por WhatsApp" value={yesNo(pessoa.permitir_mensagens_whatsapp !== false)} />
                </div>
              )}
            </SectionCard>
          </aside>
          )}
        </div>


      </main>
    </div>
  );
}
