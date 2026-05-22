import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  adicionarPessoa,
  atualizarPessoa,
  obterPessoaPorId,
  adicionarRelacionamentoComInverso,
  obterTodasPessoas,
} from '../../services/dataService';
import { createActivityLog } from '../../services/activityLogService';
import {
  listarArquivosHistoricosPorPessoa,
  substituirArquivosHistoricosDaPessoa,
} from '../../services/arquivosHistoricosService';
import {
  listarEventosDaPessoa,
  salvarEventosDaPessoa,
} from '../../services/personEventsService';
import {
  buildSocialProfilesFromRows,
  listarPessoaSocialProfiles,
  substituirPessoaSocialProfiles,
} from '../../services/pessoaSocialProfilesService';
import {
  gerarInsightsPessoa,
  getInsightByType,
  obterInsightsGeradosPessoa,
  PersonGeneratedInsight,
} from '../../services/personInsightsService';
import {
  AdminLinkableProfile,
  adminCreateUserPersonLink,
  adminDeleteUserPersonLink,
  adminListLinksForPerson,
  adminListProfilesForLinking,
  UserPersonLinkRecord,
} from '../../services/memberProfileService';
import {
  TipoEntidade,
  ArquivoHistorico,
  Pessoa,
  PersonEvent,
  TipoRelacionamento,
  SubtipoRelacionamento,
  LadoPessoa,
} from '../../types';
import { Save, Plus, X, User, Search, Link2, Settings, Trash2 } from 'lucide-react';
import { FotoUpload } from '../../components/FotoUpload';
import { ArquivosHistoricos } from '../../components/ArquivosHistoricos';
import {
  SocialProfileForm,
} from '../../components/person/SocialProfilesEditor';
import { PersonBasicInfoFields } from '../../components/person/PersonBasicInfoFields';
import { PersonBioFields } from '../../components/person/PersonBioFields';
import { PersonContactFields } from '../../components/person/PersonContactFields';
import { PersonDatesLocationsFields } from '../../components/person/PersonDatesLocationsFields';
import { PersonEventsEditor } from '../../components/person/PersonEventsEditor';
import { PersonPrivacyFields } from '../../components/person/PersonPrivacyFields';
import {
  createEmptyMarriageDetails,
  MarriageDetailsEditor,
  MarriageDetailsForm,
  normalizeMarriageDetails,
} from '../../components/relationships/MarriageDetailsEditor';
import { RelacionamentoManagerWrapper } from '../../components/RelacionamentoManagerWrapper';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import {
  buildSocialProfilesFromPerson,
  cleanPersonPayload,
  formatPhone,
  isPersonDeceased,
  normalizeBirthDate,
  normalizeLocation,
  normalizeLocationByMode,
  syncFirstSocialProfileToPersonFields,
  validateEditablePersonForm,
  validateLocationByMode,
} from '../../utils/personFields';
import { includesNormalizedText } from '../../utils/searchText';
import { toast } from 'sonner';

interface RelacionamentoPendente {
  pessoa: Pessoa;
  tipo: TipoRelacionamento;
  subtipo: SubtipoRelacionamento;
  marriageDetails?: MarriageDetailsForm;
}

function getGeneratedInsightStatusLabel(insight?: PersonGeneratedInsight) {
  if (!insight) return 'Ausente';

  if (insight.status === 'completed') return 'Gerado';
  if (insight.status === 'pending') return 'Pendente';
  if (insight.status === 'error') return 'Erro';

  return insight.status;
}

function createEmptyAdminPessoaFormData() {
  return {
    nome_completo: '',
    data_nascimento: '',
    local_nascimento: '',
    local_nascimento_exterior: false,
    data_falecimento: '',
    local_falecimento: '',
    local_falecimento_exterior: false,
    falecido: false,
    local_atual: '',
    foto_principal_url: '',
    humano_ou_pet: 'Humano' as TipoEntidade,
    lado: 'esquerda' as LadoPessoa,
    manual_generation: '',
    minibio: '',
    curiosidades: '',
    telefone: '',
    endereco: '',
    rede_social: '',
    instagram_usuario: '',
    instagram_url: '',
    permitir_exibir_data_nascimento: true,
    permitir_exibir_endereco: true,
    permitir_exibir_rede_social: true,
    permitir_exibir_telefone: true,
    permitir_exibir_instagram: true,
    permitir_mensagens_whatsapp: true,
    arquivos_historicos: [] as ArquivoHistorico[],
  };
}

type AdminPessoaFormData = ReturnType<typeof createEmptyAdminPessoaFormData>;

type AdminPessoaDraft = {
  formData: AdminPessoaFormData;
  relacionamentosPendentes: RelacionamentoPendente[];
  socialProfiles: SocialProfileForm[];
  personEvents: PersonEvent[];
  pendingMarriageDetails: MarriageDetailsForm;
  searchTerm: string;
  tipoRelSelecionado: TipoRelacionamento;
  subtipoRelSelecionado: SubtipoRelacionamento;
};

const ADMIN_LINK_RELATION_OPTIONS = [
  'Responsável legal',
  'Guardião de memória',
  'Familiar responsável',
  'Outro',
] as const;

function getAdminPessoaDraftKey(isEdit: boolean, id?: string) {
  return isEdit && id ? `admin-pessoa-form-draft:edit:${id}` : 'admin-pessoa-form-draft:new';
}

function readAdminPessoaDraft(key: string): AdminPessoaDraft | null {
  try {
    const rawDraft = window.sessionStorage.getItem(key);
    if (!rawDraft) return null;

    const draft = JSON.parse(rawDraft) as Partial<AdminPessoaDraft>;
    if (!draft.formData) return null;

    return {
      formData: {
        ...createEmptyAdminPessoaFormData(),
        ...draft.formData,
        arquivos_historicos: Array.isArray(draft.formData.arquivos_historicos)
          ? draft.formData.arquivos_historicos
          : [],
      },
      relacionamentosPendentes: Array.isArray(draft.relacionamentosPendentes)
        ? draft.relacionamentosPendentes
        : [],
      socialProfiles: Array.isArray(draft.socialProfiles) && draft.socialProfiles.length > 0
        ? draft.socialProfiles
        : buildSocialProfilesFromPerson(draft.formData),
      personEvents: Array.isArray(draft.personEvents) ? draft.personEvents : [],
      pendingMarriageDetails: normalizeMarriageDetails(draft.pendingMarriageDetails),
      searchTerm: draft.searchTerm ?? '',
      tipoRelSelecionado: draft.tipoRelSelecionado ?? 'pai',
      subtipoRelSelecionado: draft.subtipoRelSelecionado ?? 'sangue',
    };
  } catch {
    return null;
  }
}

function writeAdminPessoaDraft(key: string, draft: AdminPessoaDraft) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Rascunho é auxiliar; falha de storage não deve bloquear edição.
  }
}

function removeAdminPessoaDraft(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // noop
  }
}

export function AdminPessoaForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState<AdminPessoaFormData>(() => createEmptyAdminPessoaFormData());

  const [initialData, setInitialData] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [relacionamentosPendentes, setRelacionamentosPendentes] = useState<RelacionamentoPendente[]>([]);
  const [showAddRelDialog, setShowAddRelDialog] = useState(false);
  const [todasPessoas, setTodasPessoas] = useState<Pessoa[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<SocialProfileForm[]>(() => buildSocialProfilesFromPerson());
  const [personEvents, setPersonEvents] = useState<PersonEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoRelSelecionado, setTipoRelSelecionado] = useState<TipoRelacionamento>('pai');
  const [subtipoRelSelecionado, setSubtipoRelSelecionado] = useState<SubtipoRelacionamento>('sangue');
  const [pendingMarriageDetails, setPendingMarriageDetails] = useState<MarriageDetailsForm>(() => createEmptyMarriageDetails());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedInsights, setGeneratedInsights] = useState<PersonGeneratedInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsActionLoading, setInsightsActionLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [linkableProfiles, setLinkableProfiles] = useState<AdminLinkableProfile[]>([]);
  const [personUserLinks, setPersonUserLinks] = useState<UserPersonLinkRecord[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linkActionLoading, setLinkActionLoading] = useState(false);
  const [newLinkUserId, setNewLinkUserId] = useState('');
  const [newLinkRelation, setNewLinkRelation] = useState<(typeof ADMIN_LINK_RELATION_OPTIONS)[number]>('Familiar responsável');
  const [newLinkCanEdit, setNewLinkCanEdit] = useState(true);
  const [newLinkPrincipal, setNewLinkPrincipal] = useState(false);
  const draftKey = useMemo(() => getAdminPessoaDraftKey(isEdit, id), [id, isEdit]);
  const hasInitializedDraftRef = useRef(false);
  const hasUserEditedRef = useRef(false);

  const isFalecido = isPersonDeceased(formData);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      hasInitializedDraftRef.current = false;
      hasUserEditedRef.current = false;
      const draft = readAdminPessoaDraft(draftKey);

      if (isEdit && id) {
        try {
          const pessoa = await obterPessoaPorId(id);

          if (pessoa && mounted) {
            const arquivosHistoricos = await listarArquivosHistoricosPorPessoa(id);
            const eventosDaPessoa = await listarEventosDaPessoa(id);
            let loadedSocialProfiles = buildSocialProfilesFromPerson(pessoa);
            try {
              const socialProfileRows = await listarPessoaSocialProfiles(id);
              loadedSocialProfiles = buildSocialProfilesFromRows(socialProfileRows, pessoa);
            } catch (socialProfilesError) {
              toast.warning(
                socialProfilesError instanceof Error
                  ? `Não foi possível carregar redes sociais versionadas: ${socialProfilesError.message}`
                  : 'Não foi possível carregar redes sociais versionadas.',
              );
            }
            const data = {
              nome_completo: pessoa.nome_completo || '',
              data_nascimento: pessoa.data_nascimento?.toString() || '',
              local_nascimento: pessoa.local_nascimento || '',
              local_nascimento_exterior: pessoa.local_nascimento_exterior ?? false,
              data_falecimento: pessoa.data_falecimento?.toString() || '',
              local_falecimento: pessoa.local_falecimento || '',
              local_falecimento_exterior: pessoa.local_falecimento_exterior ?? false,
              falecido: pessoa.falecido ?? Boolean(pessoa.data_falecimento || pessoa.local_falecimento),
              local_atual: pessoa.local_atual || '',
              foto_principal_url: pessoa.foto_principal_url || '',
              humano_ou_pet: pessoa.humano_ou_pet || ('Humano' as TipoEntidade),
              lado: (pessoa.lado as LadoPessoa) || 'esquerda',
              manual_generation: pessoa.manual_generation?.toString() || '',
              minibio: pessoa.minibio || '',
              curiosidades: pessoa.curiosidades || '',
              telefone: pessoa.telefone || '',
              endereco: pessoa.endereco || '',
              rede_social: pessoa.rede_social || '',
              instagram_usuario: pessoa.instagram_usuario || '',
              instagram_url: pessoa.instagram_url || '',
              permitir_exibir_data_nascimento: pessoa.permitir_exibir_data_nascimento ?? true,
              permitir_exibir_endereco: pessoa.permitir_exibir_endereco ?? true,
              permitir_exibir_rede_social: pessoa.permitir_exibir_rede_social ?? pessoa.permitir_exibir_instagram ?? true,
              permitir_exibir_telefone: pessoa.permitir_exibir_telefone ?? true,
              permitir_exibir_instagram: pessoa.permitir_exibir_instagram ?? pessoa.permitir_exibir_rede_social ?? true,
              permitir_mensagens_whatsapp: pessoa.permitir_mensagens_whatsapp ?? true,
              arquivos_historicos: arquivosHistoricos,
            };

            const nextFormData = draft?.formData ?? data;
            if (draft || !hasUserEditedRef.current) {
              setFormData(nextFormData);
              setRelacionamentosPendentes(draft?.relacionamentosPendentes ?? []);
              setSocialProfiles(draft?.socialProfiles ?? loadedSocialProfiles);
              setPersonEvents(draft?.personEvents ?? eventosDaPessoa);
              setPendingMarriageDetails(draft?.pendingMarriageDetails ?? createEmptyMarriageDetails());
              setSearchTerm(draft?.searchTerm ?? '');
              setTipoRelSelecionado(draft?.tipoRelSelecionado ?? 'pai');
              setSubtipoRelSelecionado(draft?.subtipoRelSelecionado ?? 'sangue');
            }
            setInitialData(JSON.stringify({
              formData: data,
              personEvents: eventosDaPessoa,
              pendingMarriageDetails: createEmptyMarriageDetails(),
            }));
            if (draft) hasUserEditedRef.current = true;
          }
        } catch (error) {
          console.error('Erro ao carregar pessoa:', error);
          toast.error('Erro ao carregar dados da pessoa');
        }
      } else {
        const emptyData = createEmptyAdminPessoaFormData();
        setFormData(draft?.formData ?? emptyData);
        setRelacionamentosPendentes(draft?.relacionamentosPendentes ?? []);
        setSocialProfiles(draft?.socialProfiles ?? buildSocialProfilesFromPerson());
        setPersonEvents(draft?.personEvents ?? []);
        setPendingMarriageDetails(draft?.pendingMarriageDetails ?? createEmptyMarriageDetails());
        setSearchTerm(draft?.searchTerm ?? '');
        setTipoRelSelecionado(draft?.tipoRelSelecionado ?? 'pai');
        setSubtipoRelSelecionado(draft?.subtipoRelSelecionado ?? 'sangue');
        setInitialData(JSON.stringify({
          formData: emptyData,
          personEvents: [],
          pendingMarriageDetails: createEmptyMarriageDetails(),
        }));
        hasUserEditedRef.current = Boolean(draft);
        await loadTodasPessoas();
      }

      if (mounted) {
        hasInitializedDraftRef.current = true;
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [draftKey, isEdit, id]);

  useEffect(() => {
    let mounted = true;

    async function loadInsightsForCurrentPerson() {
      if (!isEdit || !id) {
        setGeneratedInsights([]);
        setInsightsError(null);
        setInsightsLoading(false);
        return;
      }

      try {
        setInsightsLoading(true);
        setInsightsError(null);

        const insights = await obterInsightsGeradosPessoa(id);

        if (mounted) {
          setGeneratedInsights(insights);
        }
      } catch (error) {
        if (mounted) {
          const message = error instanceof Error ? error.message : 'Erro ao carregar insights gerados.';
          setInsightsError(message);
        }
      } finally {
        if (mounted) {
          setInsightsLoading(false);
        }
      }
    }

    loadInsightsForCurrentPerson();

    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const loadPersonUserLinks = async () => {
    if (!isEdit || !id) return;

    try {
      setLinksLoading(true);
      const [profilesResult, linksResult] = await Promise.all([
        adminListProfilesForLinking(),
        adminListLinksForPerson(id),
      ]);

      if (profilesResult.error) {
        toast.error(profilesResult.error);
      } else {
        setLinkableProfiles(profilesResult.data);
      }

      if (linksResult.error) {
        toast.error(linksResult.error);
      } else {
        setPersonUserLinks(linksResult.data);
      }
    } finally {
      setLinksLoading(false);
    }
  };

  useEffect(() => {
    loadPersonUserLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const loadTodasPessoas = async () => {
    try {
      const pessoas = await obterTodasPessoas();
      setTodasPessoas(Array.isArray(pessoas) ? pessoas : []);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
      setTodasPessoas([]);
    }
  };

  useEffect(() => {
    const currentData = JSON.stringify({ formData, personEvents, pendingMarriageDetails });
    setHasChanges(currentData !== initialData || relacionamentosPendentes.length > 0);
  }, [formData, initialData, pendingMarriageDetails, personEvents, relacionamentosPendentes]);

  useEffect(() => {
    if (!hasInitializedDraftRef.current || !hasUserEditedRef.current) return;

    writeAdminPessoaDraft(draftKey, {
      formData,
      relacionamentosPendentes,
      socialProfiles,
      personEvents,
      pendingMarriageDetails,
      searchTerm,
      tipoRelSelecionado,
      subtipoRelSelecionado,
    });
  }, [
    draftKey,
    formData,
    relacionamentosPendentes,
    socialProfiles,
    personEvents,
    pendingMarriageDetails,
    searchTerm,
    tipoRelSelecionado,
    subtipoRelSelecionado,
  ]);

  const shouldBlockNavigation = hasChanges && !isSubmitting;
  const { showPrompt, confirmNavigation, cancelNavigation } = useUnsavedChanges(shouldBlockNavigation);

  const markDraftDirty = () => {
    hasUserEditedRef.current = true;
  };

  const handleConfirmDiscardChanges = () => {
    removeAdminPessoaDraft(draftKey);
    confirmNavigation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formDataWithSocialProfile = syncFirstSocialProfileToPersonFields(formData, socialProfiles);
      const pessoaData = {
        ...formDataWithSocialProfile,
        ...cleanPersonPayload(formDataWithSocialProfile),
        data_nascimento: normalizeBirthDate(formData.data_nascimento) || undefined,
        data_falecimento: normalizeBirthDate(formData.data_falecimento) || undefined,
        falecido: isFalecido,
        local_nascimento: normalizeLocationByMode(formData.local_nascimento, {
          international: formData.local_nascimento_exterior,
        }),
        local_atual: normalizeLocation(formData.local_atual),
        local_falecimento: normalizeLocationByMode(formData.local_falecimento, {
          international: formData.local_falecimento_exterior,
        }),
        local_nascimento_exterior: formData.local_nascimento_exterior === true,
        local_falecimento_exterior: formData.local_falecimento_exterior === true,
        lado: formData.lado || 'esquerda',
        manual_generation: formData.manual_generation ? Number(formData.manual_generation) : null,
      };

      const validationErrors = validateEditablePersonForm(pessoaData);
      const deathLocationError = validateLocationByMode(String(pessoaData.local_falecimento ?? ''), {
        international: pessoaData.local_falecimento_exterior === true,
      });
      if (deathLocationError) {
        (validationErrors as Record<string, string>).local_falecimento = deathLocationError;
      }
      if (Object.keys(validationErrors).length > 0) {
        toast.error(Object.values(validationErrors)[0] ?? 'Revise os campos antes de salvar.');
        return;
      }
      const invalidEvent = personEvents.find((event) => !event.titulo.trim());
      if (invalidEvent) {
        toast.error('Informe o título de todos os eventos da vida ou remova os eventos vazios.');
        return;
      }

      let pessoaCriada: Pessoa | undefined;

      if (isEdit && id) {
        pessoaCriada = await atualizarPessoa(id, pessoaData);

        if (!pessoaCriada) {
          toast.error('Erro ao atualizar pessoa');
          return;
        }

        toast.success('Pessoa atualizada com sucesso!');
      } else {
        pessoaCriada = await adicionarPessoa(pessoaData);

        if (!pessoaCriada) {
          toast.error('Erro ao criar pessoa. Verifique os dados e tente novamente.');
          return;
        }

        toast.success('Pessoa criada com sucesso!');

        if (relacionamentosPendentes.length > 0) {
          toast.info('Criando relacionamentos...');
          let relsCriados = 0;

          for (const relPendente of relacionamentosPendentes) {
            try {
              await adicionarRelacionamentoComInverso({
                pessoa_origem_id: pessoaCriada.id,
                pessoa_destino_id: relPendente.pessoa.id,
                tipo_relacionamento: relPendente.tipo,
                subtipo_relacionamento: relPendente.subtipo,
                ...(relPendente.tipo === 'conjuge'
                  ? {
                      data_casamento: relPendente.marriageDetails?.data_casamento.trim() || undefined,
                      local_casamento: relPendente.marriageDetails?.local_casamento.trim() || undefined,
                      ativo: relPendente.marriageDetails?.ativo ?? true,
                      data_separacao: relPendente.marriageDetails?.data_separacao.trim() || undefined,
                      local_separacao: relPendente.marriageDetails?.local_separacao.trim() || undefined,
                      observacoes: relPendente.marriageDetails?.observacoes.trim() || undefined,
                    }
                  : {}),
              }, { inverseTipoForFilho: 'pai' });

              relsCriados++;
            } catch (error) {
              console.error('Erro ao criar relacionamento:', error);
            }
          }

          toast.success(`${relsCriados} relacionamento(s) criado(s)!`);
        }
      }

      await substituirArquivosHistoricosDaPessoa(pessoaCriada.id, formData.arquivos_historicos || []);
      try {
        await substituirPessoaSocialProfiles(pessoaCriada.id, socialProfiles, {
          exibirNoPerfil: pessoaData.permitir_exibir_rede_social !== false,
        });
      } catch (socialProfilesError) {
        toast.warning(
          socialProfilesError instanceof Error
            ? `Pessoa salva, mas não foi possível salvar redes sociais versionadas: ${socialProfilesError.message}`
            : 'Pessoa salva, mas não foi possível salvar redes sociais versionadas.',
        );
      }
      await salvarEventosDaPessoa(pessoaCriada.id, personEvents);

      const snapshotAtual = JSON.stringify({
        formData: {
          ...formData,
          lado: formData.lado || 'esquerda',
          arquivos_historicos: formData.arquivos_historicos || [],
        },
        personEvents,
        pendingMarriageDetails: createEmptyMarriageDetails(),
      });

      setInitialData(snapshotAtual);
      setRelacionamentosPendentes([]);
      removeAdminPessoaDraft(draftKey);
      hasUserEditedRef.current = false;
      setHasChanges(false);
      navigate('/admin/pessoas');
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error);
      toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePersonEventsChange = (eventos: PersonEvent[]) => {
    markDraftDirty();
    setPersonEvents(eventos);
  };

  const handleChange = (field: string, value: string | boolean | ArquivoHistorico[]) => {
    markDraftDirty();
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...((field === 'data_falecimento' || field === 'local_falecimento') && String(value).trim()
        ? { falecido: true }
        : {}),
    }));
  };

  const handleRedeSocialPrivacyChange = (checked: boolean) => {
    markDraftDirty();
    setFormData((prev) => ({
      ...prev,
      permitir_exibir_rede_social: checked,
      permitir_exibir_instagram: checked,
    }));
  };

  const handleSocialProfilesChange = (nextProfiles: SocialProfileForm[]) => {
    markDraftDirty();
    setSocialProfiles(nextProfiles);
    setFormData((prev) => syncFirstSocialProfileToPersonFields(prev, nextProfiles));
  };

  const handleTelefoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleChange('telefone', formatted);
  };

  const handleGenerateInsights = async (force = false) => {
    if (!id) return;

    try {
      setInsightsActionLoading(true);
      setInsightsError(null);


      await gerarInsightsPessoa(id, force);
      const refreshedInsights = await obterInsightsGeradosPessoa(id);
      setGeneratedInsights(refreshedInsights);

      await createActivityLog({
        action: force ? 'person_insights.regenerated' : 'person_insights.generated',
        entity_type: 'person',
        entity_id: id,
        entity_label: formData.nome_completo,
        metadata: {
          tipos: ['astrology', 'historical_events'],
          force,
          source: 'admin_person_form',
        },
      });

      toast.success(force ? 'Conteúdos regenerados com sucesso.' : 'Conteúdos gerados com sucesso.');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao gerar insights.';
      setInsightsError(message);
      toast.error(message);
    } finally {
      setInsightsActionLoading(false);
    }
  };

  const handleCloseRelacionamentoDialog = () => {
    setShowAddRelDialog(false);
    setSearchTerm('');
    setPendingMarriageDetails(createEmptyMarriageDetails());
  };

  const handleAdicionarRelacionamentoPendente = (pessoa: Pessoa) => {
    markDraftDirty();
    const jaExiste = relacionamentosPendentes.some(
      (r) => r.pessoa.id === pessoa.id && r.tipo === tipoRelSelecionado
    );

    if (jaExiste) {
      toast.warning('Esta pessoa já está na lista de relacionamentos');
      return;
    }

    if (
      (tipoRelSelecionado === 'pai' || tipoRelSelecionado === 'mae') &&
      relacionamentosPendentes.some((r) => r.tipo === tipoRelSelecionado)
    ) {
      toast.warning(`Já existe ${tipoRelSelecionado === 'pai' ? 'um pai' : 'uma mãe'} selecionado(a)`);
      return;
    }

    setRelacionamentosPendentes((prev) => [
      ...prev,
      {
        pessoa,
        tipo: tipoRelSelecionado,
        subtipo: subtipoRelSelecionado,
        marriageDetails: tipoRelSelecionado === 'conjuge'
          ? normalizeMarriageDetails(pendingMarriageDetails)
          : undefined,
      },
    ]);

    setPendingMarriageDetails(createEmptyMarriageDetails());
    handleCloseRelacionamentoDialog();
    toast.success(`${pessoa.nome_completo} adicionado(a) à lista`);
  };

  const handleRemoverRelacionamentoPendente = (pessoaId: string, tipo?: TipoRelacionamento) => {
    markDraftDirty();
    setRelacionamentosPendentes((prev) =>
      prev.filter((r) => !(r.pessoa.id === pessoaId && (!tipo || r.tipo === tipo)))
    );
  };

  const handlePendingMarriageDetailsChange = (
    pessoaId: string,
    tipo: TipoRelacionamento,
    details: MarriageDetailsForm
  ) => {
    markDraftDirty();
    setRelacionamentosPendentes((prev) => prev.map((rel) => (
      rel.pessoa.id === pessoaId && rel.tipo === tipo
        ? { ...rel, marriageDetails: normalizeMarriageDetails(details) }
        : rel
    )));
  };

  const getTipoLabel = (tipo: TipoRelacionamento) => {
    const labels: Record<TipoRelacionamento, string> = {
      pai: 'Pai',
      mae: 'Mãe',
      conjuge: 'Cônjuge',
      filho: 'Filho(a)',
      irmao: 'Irmão(ã)',
    };
    return labels[tipo] || tipo;
  };

  const pessoasFiltradas = todasPessoas.filter((p) => {
    const jaNaLista = relacionamentosPendentes.some(
      (r) => r.pessoa.id === p.id && r.tipo === tipoRelSelecionado
    );
    if (jaNaLista) return false;

    return includesNormalizedText(p.nome_completo, searchTerm);
  });

  const paiSelecionado = relacionamentosPendentes.find((r) => r.tipo === 'pai');
  const maeSelecionada = relacionamentosPendentes.find((r) => r.tipo === 'mae');
  const outrosRelacionamentos = relacionamentosPendentes.filter(
    (r) => r.tipo !== 'pai' && r.tipo !== 'mae'
  );

  const astrologyInsight = getInsightByType(generatedInsights, 'astrology');
  const historicalEventsInsight = getInsightByType(generatedInsights, 'historical_events');
  const hasAstrologyInsight = Boolean(astrologyInsight);
  const hasHistoricalEventsInsight = Boolean(historicalEventsInsight);
  const hasAllGeneratedInsights = hasAstrologyInsight && hasHistoricalEventsInsight;
  const canManageGeneratedInsights = Boolean(
    isEdit &&
    id &&
    formData.data_nascimento.trim() &&
    formData.humano_ou_pet !== 'Pet' &&
    formData.permitir_exibir_data_nascimento !== false
  );
  const shouldShowGeneratedInsightsCard = Boolean(
    canManageGeneratedInsights ||
    hasAstrologyInsight ||
    hasHistoricalEventsInsight ||
    insightsLoading ||
    insightsError
  );

  const linkedUserIds = new Set(personUserLinks.map((link) => link.user_id));
  const availableProfilesForLinking = linkableProfiles.filter((profile) => !linkedUserIds.has(profile.id));
  const profilesById = new Map(linkableProfiles.map((profile) => [profile.id, profile]));

  const handleCreateUserPersonLink = async () => {
    if (!id || !newLinkUserId) {
      toast.error('Selecione um usuário para vincular.');
      return;
    }

    try {
      setLinkActionLoading(true);
      const result = await adminCreateUserPersonLink({
        userId: newLinkUserId,
        pessoaId: id,
        relacaoComPerfil: newLinkRelation,
        principal: newLinkPrincipal,
        canEdit: newLinkCanEdit,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Usuário vinculado à pessoa.');
      setNewLinkUserId('');
      setNewLinkRelation('Familiar responsável');
      setNewLinkCanEdit(true);
      setNewLinkPrincipal(false);
      await loadPersonUserLinks();
    } finally {
      setLinkActionLoading(false);
    }
  };

  const handleDeleteUserPersonLink = async (link: UserPersonLinkRecord) => {
    const isSelfLink = link.relacao_com_perfil === 'Sou esta pessoa';
    const selfLinks = personUserLinks.filter((item) => item.relacao_com_perfil === 'Sou esta pessoa');

    if (isSelfLink && selfLinks.length <= 1) {
      const firstConfirmation = window.confirm(
        'Este é o último vínculo "Sou esta pessoa" desta pessoa. Remover esse vínculo pode impedir o acesso direto ao próprio perfil. Deseja continuar?'
      );
      if (!firstConfirmation) return;

      const secondConfirmation = window.confirm('Confirme novamente para remover o último vínculo principal de identidade desta pessoa.');
      if (!secondConfirmation) return;
    } else if (!window.confirm('Remover este vínculo de usuário com a pessoa?')) {
      return;
    }

    try {
      setLinkActionLoading(true);
      const result = await adminDeleteUserPersonLink(link.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Vínculo removido.');
      await loadPersonUserLinks();
    } finally {
      setLinkActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title={isEdit ? 'Editar Pessoa' : 'Nova Pessoa'}
        subtitle={isEdit ? 'Atualize os dados desta pessoa da árvore' : 'Cadastre uma nova pessoa na árvore familiar'}
        icon={User}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
          { label: 'Pessoas', to: '/admin/pessoas', icon: User },
        ]}
        customActions={(
          <Button form="pessoa-form" type="submit" disabled={isSubmitting} className="w-full rounded-xl shadow-sm sm:w-auto">
            <Save className="mr-2 h-4 w-4 shrink-0" />
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        )}
      />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <form id="pessoa-form" onSubmit={handleSubmit} className="min-w-0 space-y-6">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="break-words">Foto Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <FotoUpload
                value={formData.foto_principal_url}
                onChange={(url) => handleChange('foto_principal_url', url)}
                pessoaId={id}
              />
            </CardContent>
          </Card>

          <PersonBasicInfoFields
            value={formData}
            onChange={(field, value) => handleChange(field, value)}
          />

          <PersonDatesLocationsFields
            value={formData}
            isFalecido={isFalecido}
            onChange={(field, value) => handleChange(field, value)}
          />

          {shouldShowGeneratedInsightsCard && (
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="break-words">Astrologia e acontecimentos do nascimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="break-words text-sm text-gray-600">
                  Gere ou regenere conteúdos persistidos para exibição no perfil. Esta ação usa a Edge Function
                  `generate-person-insights` e deve ser executada apenas quando necessário.
                </p>

                {insightsLoading && (
                  <p className="break-words text-sm text-gray-500">Carregando insights gerados...</p>
                )}

                {insightsError && (
                  <p className="break-words rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {insightsError}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Astrologia</p>
                    <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                      {getGeneratedInsightStatusLabel(astrologyInsight)}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <p className="break-words text-xs font-medium uppercase tracking-wide text-gray-500">
                      Acontecimentos históricos
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                      {getGeneratedInsightStatusLabel(historicalEventsInsight)}
                    </p>
                  </div>
                </div>

                {!canManageGeneratedInsights && (
                  <p className="break-words text-sm text-gray-500">
                    Disponível apenas para pessoas humanas com data de nascimento exibível.
                  </p>
                )}

                {canManageGeneratedInsights && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleGenerateInsights(false)}
                      disabled={insightsActionLoading || hasAllGeneratedInsights}
                      className="w-full sm:w-auto"
                    >
                      {insightsActionLoading ? 'Processando...' : 'Gerar conteúdos ausentes'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleGenerateInsights(true)}
                      disabled={insightsActionLoading}
                      className="w-full sm:w-auto"
                    >
                      {insightsActionLoading ? 'Processando...' : 'Regenerar conteúdos'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <PersonBioFields
            value={formData}
            onChange={(field, value) => handleChange(field, value)}
          />

          {!isFalecido && (
            <PersonContactFields
              value={formData}
              socialProfiles={socialProfiles}
              onChange={(field, value) => handleChange(field, value)}
              onPhoneChange={handleTelefoneChange}
              onSocialProfilesChange={handleSocialProfilesChange}
            />
          )}

          <PersonPrivacyFields
            value={formData}
            onChange={(field, value) => handleChange(field, value)}
            onSocialPrivacyChange={handleRedeSocialPrivacyChange}
          />

          <ArquivosHistoricos
            arquivos={formData.arquivos_historicos}
            onChange={(arquivos) => handleChange('arquivos_historicos', arquivos)}
            pessoaId={id}
          />

            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="break-words">Eventos da vida</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonEventsEditor
                eventos={personEvents}
                onChange={handlePersonEventsChange}
              />
            </CardContent>
          </Card>

          {!isEdit && (
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="break-words">Relacionamentos Familiares (opcional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="break-words text-sm text-gray-600">
                  Defina os relacionamentos que serão criados automaticamente após salvar a pessoa.
                </p>

                <div className="border-t pt-4">
                  <h3 className="mb-4 break-words font-semibold text-gray-900">Filiação (Pais)</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pai</label>
                      <div className="space-y-2">
                        {paiSelecionado ? (
	                          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2">
                            {paiSelecionado.pessoa.foto_principal_url ? (
                              <img
                                src={paiSelecionado.pessoa.foto_principal_url}
                                alt=""
	                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                              />
                            ) : (
	                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
	                                <User className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
	                            <span className="min-w-0 flex-1 break-words text-sm font-medium">
                              {paiSelecionado.pessoa.nome_completo}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoverRelacionamentoPendente(paiSelecionado.pessoa.id, 'pai')}
	                              className="shrink-0 text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              markDraftDirty();
                              setTipoRelSelecionado('pai');
                              setSubtipoRelSelecionado('sangue');
                              setShowAddRelDialog(true);
                            }}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4 shrink-0" />
                            Selecionar Pai
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mãe</label>
                      <div className="space-y-2">
                        {maeSelecionada ? (
	                          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-pink-200 bg-pink-50 p-2">
                            {maeSelecionada.pessoa.foto_principal_url ? (
                              <img
                                src={maeSelecionada.pessoa.foto_principal_url}
                                alt=""
	                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                              />
                            ) : (
	                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
	                                <User className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
	                            <span className="min-w-0 flex-1 break-words text-sm font-medium">
                              {maeSelecionada.pessoa.nome_completo}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoverRelacionamentoPendente(maeSelecionada.pessoa.id, 'mae')}
	                              className="shrink-0 text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              markDraftDirty();
                              setTipoRelSelecionado('mae');
                              setSubtipoRelSelecionado('sangue');
                              setShowAddRelDialog(true);
                            }}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4 shrink-0" />
                            Selecionar Mãe
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="break-words font-semibold text-gray-900">Outros Relacionamentos</h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        markDraftDirty();
                        setTipoRelSelecionado('conjuge');
                        setSubtipoRelSelecionado('casamento');
                        setShowAddRelDialog(true);
                      }}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4 shrink-0" />
                      Adicionar
                    </Button>
                  </div>

                  {outrosRelacionamentos.length > 0 && (
                    <div className="space-y-2">
                      {outrosRelacionamentos.map((rel) => (
	                        <div key={`${rel.pessoa.id}-${rel.tipo}`} className="min-w-0 rounded-lg border bg-gray-50 p-3">
	                          <div className="flex min-w-0 items-center gap-3">
                            {rel.pessoa.foto_principal_url ? (
                              <img
                                src={rel.pessoa.foto_principal_url}
                                alt=""
	                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                              />
                            ) : (
	                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
	                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
	                              <p className="truncate text-sm font-medium text-gray-900">
                                {rel.pessoa.nome_completo}
                              </p>
	                              <p className="break-words text-xs text-gray-500">
                                {getTipoLabel(rel.tipo)} · {rel.subtipo === 'adotivo' ? 'Adotivo' : 'Sangue/Casamento'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoverRelacionamentoPendente(rel.pessoa.id, rel.tipo)}
	                              className="shrink-0 text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {rel.tipo === 'conjuge' && (
                            <div className="mt-3">
                              <MarriageDetailsEditor
                                value={rel.marriageDetails ?? createEmptyMarriageDetails()}
                                onChange={(details) => handlePendingMarriageDetailsChange(rel.pessoa.id, rel.tipo, details)}
                                isAdmin
                                allowHistoricalFiles
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isEdit && id && (
            <RelacionamentoManagerWrapper
              pessoaId={id}
              pessoaNome={formData.nome_completo || 'Pessoa'}
            />
          )}

          {isEdit && id && (
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 break-words">
                  <Link2 className="h-5 w-5 text-blue-700" />
                  Usuários vinculados a esta pessoa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {linksLoading ? (
                  <p className="text-sm text-gray-500">Carregando vínculos...</p>
                ) : personUserLinks.length === 0 ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Nenhum usuário está vinculado a esta pessoa.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {personUserLinks.map((link) => {
                      const profile = profilesById.get(link.user_id);
                      const displayName = profile?.nome_exibicao || profile?.email || link.user_id;

                      return (
                        <div key={link.id} className="rounded-lg border border-gray-200 bg-white p-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold text-gray-900">{displayName}</p>
                              <p className="break-all text-xs text-gray-500">{profile?.email || link.user_id}</p>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                                  {link.relacao_com_perfil || 'Relação não informada'}
                                </span>
                                {link.principal ? (
                                  <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">Principal</span>
                                ) : null}
                                <span className={`rounded-full px-2 py-1 ${link.can_edit === false ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                  {link.can_edit === false ? 'Somente leitura' : 'Pode editar'}
                                </span>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUserPersonLink(link)}
                              disabled={linkActionLoading}
                              className="w-full text-red-700 hover:text-red-800 sm:w-auto"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="break-words text-sm font-semibold text-gray-900">Adicionar vínculo manual</h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Usuário</label>
                      <select
                        value={newLinkUserId}
                        onChange={(event) => setNewLinkUserId(event.target.value)}
                        className="flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Selecione um usuário</option>
                        {availableProfilesForLinking.map((profile) => (
                          <option key={profile.id} value={profile.id}>
                            {profile.nome_exibicao || profile.email || profile.id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Relação com o perfil</label>
                      <select
                        value={newLinkRelation}
                        onChange={(event) => setNewLinkRelation(event.target.value as typeof newLinkRelation)}
                        className="flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      >
                        {ADMIN_LINK_RELATION_OPTIONS.map((relation) => (
                          <option key={relation} value={relation}>{relation}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={newLinkCanEdit}
                        onChange={(event) => setNewLinkCanEdit(event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      Pode editar
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={newLinkPrincipal}
                        onChange={(event) => setNewLinkPrincipal(event.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      Tornar principal
                    </label>
                  </div>

                  <Button
                    type="button"
                    className="mt-4 w-full sm:w-auto"
                    onClick={handleCreateUserPersonLink}
                    disabled={linkActionLoading || !newLinkUserId}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {linkActionLoading ? 'Vinculando...' : 'Adicionar vínculo'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </main>

      <ConfirmDialog
        open={showPrompt}
        onOpenChange={(open) => {
          if (!open) cancelNavigation();
        }}
        onConfirm={handleConfirmDiscardChanges}
        title="Descartar alterações?"
        description="Você tem alterações não salvas. Se sair agora, elas serão perdidas."
      />

      <Dialog
        open={showAddRelDialog}
        onOpenChange={(open) => {
          if (open) {
            setShowAddRelDialog(true);
            return;
          }

          handleCloseRelacionamentoDialog();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="break-words">Adicionar relacionamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={tipoRelSelecionado}
                  onChange={(e) => {
                    markDraftDirty();
                    const nextTipo = e.target.value as TipoRelacionamento;
                    setTipoRelSelecionado(nextTipo);
                    setSubtipoRelSelecionado(nextTipo === 'conjuge' ? 'casamento' : 'sangue');
                    if (nextTipo !== 'conjuge') {
                      setPendingMarriageDetails(createEmptyMarriageDetails());
                    }
                  }}
                  className="flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="conjuge">Cônjuge</option>
                  <option value="filho">Filho(a)</option>
                  <option value="irmao">Irmão(ã)</option>
                  <option value="pai">Pai</option>
                  <option value="mae">Mãe</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtipo</label>
                <select
                  value={subtipoRelSelecionado}
                  onChange={(e) => {
                    markDraftDirty();
                    setSubtipoRelSelecionado(e.target.value as SubtipoRelacionamento);
                  }}
                  className="flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {tipoRelSelecionado === 'conjuge' ? (
                    <>
                      <option value="casamento">Casamento</option>
                      <option value="uniao">União</option>
                      <option value="separado">Separado</option>
                    </>
                  ) : (
                    <>
                      <option value="sangue">Sangue</option>
                      <option value="adotivo">Adotivo</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar pessoa</label>
              <div className="relative min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    markDraftDirty();
                    setSearchTerm(e.target.value);
                  }}
                  placeholder="Digite o nome da pessoa..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto rounded-lg border">
              {pessoasFiltradas.length > 0 ? (
                pessoasFiltradas.map((pessoa) => (
                  <button
                    key={pessoa.id}
                    type="button"
                    onClick={() => handleAdicionarRelacionamentoPendente(pessoa)}
                    className="flex w-full min-w-0 items-center gap-3 border-b p-3 text-left hover:bg-gray-50 last:border-b-0"
                  >
                    {pessoa.foto_principal_url ? (
                      <img
                        src={pessoa.foto_principal_url}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{pessoa.nome_completo}</p>
                      {pessoa.local_nascimento && (
                        <p className="truncate text-xs text-gray-500">{pessoa.local_nascimento}</p>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  Nenhuma pessoa encontrada.
                </div>
              )}
            </div>

            {tipoRelSelecionado === 'conjuge' && (
              <MarriageDetailsEditor
                value={pendingMarriageDetails}
                onChange={(details) => {
                  markDraftDirty();
                  setPendingMarriageDetails(details);
                }}
                isAdmin
                allowHistoricalFiles
              />
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleCloseRelacionamentoDialog}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
